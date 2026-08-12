import { isFirebaseReady, storage } from '../firebase/config'

// Uploads a File to Firebase Storage and returns a download URL.
// In demo mode, returns a base64 data-URI so image previews still work end-to-end.
export async function uploadImage(file, folder = 'products') {
  if (!file) return ''
  if (!isFirebaseReady) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
  const path = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
  const r = ref(storage, path)
  await uploadBytes(r, file)
  return await getDownloadURL(r)
}
