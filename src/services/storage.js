// Image handling WITHOUT Firebase Storage.
// Compresses/resizes the picked image in the browser and returns a data-URI
// string, saved directly in Firestore. No Storage / Blaze plan needed.
//
// Fabric swatches & gallery tiles display small, so we compress them harder to
// keep the custom-jersey config well under Firestore's size limits.
const PRESETS = {
  default:  { maxDim: 900, quality: 0.72, hard: 900000 },
  fabrics:  { maxDim: 800, quality: 0.75, hard: 260000 },
  gallery:  { maxDim: 800, quality: 0.72, hard: 260000 },
  banners:  { maxDim: 1200, quality: 0.72, hard: 300000 },
  necks:    { maxDim: 600,  quality: 0.85, hard: 150000 },
}

export async function uploadImage(file, folder = 'default') {
  if (!file) return ''
  const p = PRESETS[folder] || PRESETS.default
  const dataUrl = await readAsDataURL(file)
  try {
    let out = await compress(dataUrl, p.maxDim, p.quality)
    // if still too big, try progressively smaller
    if (out.length > p.hard) out = await compress(dataUrl, Math.round(p.maxDim * 0.75), 0.55)
    if (out.length > p.hard) out = await compress(dataUrl, Math.round(p.maxDim * 0.6), 0.5)
    return out
  } catch {
    return dataUrl.length < p.hard ? dataUrl : ''
  }
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

function compress(dataUrl, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > height && width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim }
      else if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

/* ------------------------------------------------------------------ *
 * CUSTOMER ARTWORK (logos / crests / design references)               *
 * Keeps transparency (PNG) where possible, and keeps the picture as   *
 * sharp as the Firestore per-document limit (1 MB) allows.            *
 * Returns the full image plus a tiny thumbnail for the cart.          *
 * ------------------------------------------------------------------ */
const CUSTOMER_MAX_CHARS = 880000 // safely under Firestore's 1 MB doc limit
const CUSTOMER_MAX_SOURCE = 15 * 1024 * 1024 // refuse anything above 15 MB
const userError = (msg) => Object.assign(new Error(msg), { userFacing: true }) // safe to show to the customer

export async function prepareCustomerFile(file) {
  if (!file) throw userError('No file selected.')
  if (!file.type || !file.type.startsWith('image/')) {
    throw userError('Please upload an image file (PNG, JPG or WebP).')
  }
  if (file.size > CUSTOMER_MAX_SOURCE) {
    throw userError('This image is larger than 15 MB. Please send a smaller copy, or share it with us on WhatsApp.')
  }
  const src = await readAsDataURL(file)
  const img = await loadImage(src)
  const keepAlpha = /png|webp|gif|svg/i.test(file.type)

  let dataUrl = ''
  for (const maxDim of [1600, 1200, 900, 700, 500]) {
    dataUrl = renderImage(img, maxDim, keepAlpha ? 'png' : 'jpeg', 0.86)
    if (dataUrl.length <= CUSTOMER_MAX_CHARS) break
  }
  // PNG still too big (photo-like artwork)? flatten to JPEG on white.
  if (dataUrl.length > CUSTOMER_MAX_CHARS) {
    for (const maxDim of [1400, 1000, 800, 600]) {
      dataUrl = renderImage(img, maxDim, 'jpeg', 0.8)
      if (dataUrl.length <= CUSTOMER_MAX_CHARS) break
    }
  }
  if (dataUrl.length > CUSTOMER_MAX_CHARS) throw userError('Could not shrink this image enough. Please try a smaller file.')

  const thumb = renderImage(img, 160, keepAlpha ? 'png' : 'jpeg', 0.7)
  return { dataUrl, thumb, name: file.name || 'artwork', type: file.type, size: file.size }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(userError('This image could not be read. Try a PNG or JPG.'))
    img.src = src
  })
}

function renderImage(img, maxDim, format, quality) {
  let width = img.naturalWidth || img.width || 512
  let height = img.naturalHeight || img.height || 512
  const scale = Math.min(1, maxDim / Math.max(width, height))
  width = Math.max(1, Math.round(width * scale)); height = Math.max(1, Math.round(height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  const ctx = canvas.getContext('2d')
  if (format === 'jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height) }
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL(`image/${format}`, quality)
}
