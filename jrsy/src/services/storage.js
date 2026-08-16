// Image handling WITHOUT Firebase Storage.
//
// We compress/resize the picked image in the browser and return a data-URI
// string, which is then saved directly in Firestore alongside the product.
// This means:
//   • no Firebase Storage setup or Blaze (paid) plan needed
//   • uploaded images always display, on the free Spark plan
//   • images are kept small so Firestore's 1MB/doc limit is respected
//
// Tune MAX_DIM / QUALITY if you want sharper (bigger) or lighter (smaller) images.
const MAX_DIM = 900        // longest edge in px
const QUALITY = 0.72       // JPEG quality (0–1)
const HARD_LIMIT = 900000  // ~0.9MB safety cap per image (Firestore doc is 1MB)

export async function uploadImage(file /*, folder */) {
  if (!file) return ''
  const dataUrl = await readAsDataURL(file)
  try {
    const compressed = await compress(dataUrl)
    if (compressed.length > HARD_LIMIT) return await compress(dataUrl, 700, 0.6)
    return compressed
  } catch {
    return dataUrl.length < HARD_LIMIT ? dataUrl : ''
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

function compress(dataUrl, maxDim = MAX_DIM, quality = QUALITY) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > height && width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim }
      else if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = dataUrl
  })
}
