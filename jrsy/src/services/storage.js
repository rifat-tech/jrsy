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
