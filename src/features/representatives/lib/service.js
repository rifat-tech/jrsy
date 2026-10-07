/* =====================================================================
 *  DATABASE ACCESS for the representative network
 *  Works with Firebase (live) or localStorage (demo mode, no keys needed).
 *
 *  Collections:  divisions · districts · upazilas · representatives · representativePhotos
 *  Locations live separately from representatives, linked only by IDs.
 * ===================================================================== */
import { isFirebaseReady, db } from '../../../firebase/config'
import { buildLocationDocs } from './logic'
import { validateRep } from './validate'
import { uploadImage } from '../../../services/storage'

const LS_KEY = 'sporty_network_v1'
const COL = { divisions: 'divisions', districts: 'districts', upazilas: 'upazilas', reps: 'representatives', photos: 'representativePhotos' }
// Size we expect from the open dataset (shown in the admin as a sanity check)
export const EXPECTED = { divisions: 8, districts: 64, upazilas: 494 }

let fs
const firestore = async () => (fs ||= await import('firebase/firestore'))
const newId = () => 'r_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

/* ---------- demo-mode store ---------- */
const emptyDemo = () => ({ divisions: [], districts: [], upazilas: [], reps: [], photos: {} })
function readDemo() { try { return JSON.parse(localStorage.getItem(LS_KEY)) || emptyDemo() } catch { return emptyDemo() } }
function writeDemo(s) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)) } catch { throw new Error('Browser storage is full (demo mode).') }
}

/* ---------- tiny cache so pages open instantly on the next visit ---------- */
let cache = null
let cacheAt = 0
export const invalidate = () => { cache = null }

/* ---------- READ ---------- */
export async function loadNetwork({ force = false } = {}) {
  if (!force && cache && Date.now() - cacheAt < 60_000) return cache
  let data
  if (!isFirebaseReady) {
    let s = readDemo()
    if (!s.upazilas.length) { try { await seedLocations(); s = readDemo() } catch { /* files not added yet */ } } // demo: auto-fill
    data = { divisions: s.divisions, districts: s.districts, upazilas: s.upazilas, reps: s.reps }
  } else {
    const { collection, getDocs } = await firestore()
    const read = async (name) => (await getDocs(collection(db, name))).docs.map((d) => ({ id: d.id, ...d.data() }))
    let [divisions, districts, upazilas, reps] = await Promise.all([COL.divisions, COL.districts, COL.upazilas, COL.reps].map(read))
    if (!upazilas.length) {
      // Locations not stored yet. Admin: store them automatically (no button needed).
      if (window.location.pathname.startsWith('/admin')) {
        try { await seedLocations(); [divisions, districts, upazilas] = await Promise.all([COL.divisions, COL.districts, COL.upazilas].map(read)) } catch { /* fall back below */ }
      }
      // Visitors (or if saving failed): use the built-in list from memory. Same ids, so nothing breaks later.
      if (!upazilas.length) ({ divisions, districts, upazilas } = await readDataset())
    }
    data = { divisions, districts, upazilas, reps }
  }
  cache = data; cacheAt = Date.now()
  return data
}

export async function getPhoto(repId) {
  if (!isFirebaseReady) return readDemo().photos[repId] || ''
  const { doc, getDoc } = await firestore()
  const snap = await getDoc(doc(db, COL.photos, repId))
  return snap.exists() ? snap.data().image || '' : ''
}

/* ---------- SEED the Bangladesh hierarchy (admin button / demo auto) ---------- */
async function readDataset() {
  // 1) files you placed in src/features/representatives/data/ (optional, only if filled)
  try {
    const [a, b, c] = await Promise.all([
      import('../data/bd-divisions.json'),
      import('../data/bd-districts.json'),
      import('../data/bd-upazilas.json'),
    ])
    const docs = buildLocationDocs(a.default, b.default, c.default)
    if (docs.upazilas.length) return docs
  } catch { /* use the built-in list */ }
  // 2) the built-in list (src/features/representatives/data/builtin.js) - default, works offline
  const { builtinDataset } = await import('../data/builtin')
  const d = builtinDataset()
  return buildLocationDocs(d.divisions, d.districts, d.upazilas)
}

// Adds ONLY the places that are missing. Never overwrites names you edited.
export async function seedLocations() {
  const docs = await readDataset()
  if (!isFirebaseReady) {
    const s = readDemo(); let added = 0
    for (const k of ['divisions', 'districts', 'upazilas']) {
      const have = new Set(s[k].map((x) => x.id))
      if (k === 'upazilas' && have.size && !docs[k].some((x) => have.has(x.id))) throw new Error('A different Bangladesh location list is already imported. To avoid duplicates nothing was added.')
      docs[k].forEach((x) => { if (!have.has(x.id)) { s[k].push(x); added++ } })
    }
    writeDemo(s); invalidate()
    return { added, total: docs.divisions.length + docs.districts.length + docs.upazilas.length }
  }
  const { collection, getDocs, doc, writeBatch } = await firestore()
  const todo = []
  for (const k of ['divisions', 'districts', 'upazilas']) {
    const have = new Set((await getDocs(collection(db, COL[k]))).docs.map((d) => d.id))
    if (k === 'upazilas' && have.size && !docs[k].some((x) => have.has(x.id))) throw new Error('A different Bangladesh location list is already imported. To avoid duplicates nothing was added.')
    docs[k].forEach((x) => { if (!have.has(x.id)) todo.push([COL[k], x]) })
  }
  for (let i = 0; i < todo.length; i += 400) {
    const batch = writeBatch(db)
    todo.slice(i, i + 400).forEach(([col, x]) => batch.set(doc(db, col, x.id), x))
    await batch.commit()
  }
  invalidate()
  return { added: todo.length, total: docs.divisions.length + docs.districts.length + docs.upazilas.length }
}

/* ---------- AREAS (admin can rename / hide / add) ---------- */
export async function saveArea(kind, area) {
  const col = COL[kind]
  const rec = { ...area, status: area.status === 'inactive' ? 'inactive' : 'active' }
  if (!rec.name_en?.trim() || !rec.name_bn?.trim()) throw new Error('Both Bangla and English names are required.')
  if (!isFirebaseReady) {
    const s = readDemo(); const i = s[kind].findIndex((x) => x.id === rec.id)
    if (i >= 0) s[kind][i] = rec; else s[kind].push(rec)
    writeDemo(s); invalidate(); return rec
  }
  const { doc, setDoc } = await firestore()
  await setDoc(doc(db, col, rec.id), rec)
  invalidate(); return rec
}

/* ---------- REPRESENTATIVES ---------- */
// photoFile: a File (new photo) · removePhoto: true to delete the photo
export async function saveRepresentative(input, { photoFile = null, removePhoto = false } = {}) {
  const check = validateRep(input)
  if (!check.ok) throw new Error(Object.values(check.errors)[0])
  const now = Date.now()
  const id = input.id || newId()
  let thumb = input.thumb || ''
  let full = null
  if (photoFile) {
    // full-size (~480px) is stored apart, so lists only download small thumbnails
    full = await uploadImage(photoFile, 'default')
    thumb = await makeThumb(full)
  }
  if (removePhoto) { thumb = ''; full = '' }
  const rec = { ...check.value, id, thumb, createdAt: input.createdAt || now, updatedAt: now }

  if (!isFirebaseReady) {
    const s = readDemo(); const i = s.reps.findIndex((r) => r.id === id)
    if (i >= 0) s.reps[i] = rec; else s.reps.push(rec)
    if (full !== null) { if (full) s.photos[id] = full; else delete s.photos[id] }
    writeDemo(s); invalidate(); return rec
  }
  const { doc, setDoc, deleteDoc } = await firestore()
  await setDoc(doc(db, COL.reps, id), rec)
  if (full) await setDoc(doc(db, COL.photos, id), { image: full })
  else if (full === '') await deleteDoc(doc(db, COL.photos, id))
  invalidate(); return rec
}

export async function setRepStatus(id, status) {
  const rec = (await loadNetwork({ force: true })).reps.find((r) => r.id === id)
  if (!rec) throw new Error('Representative not found.')
  return saveRepresentative({ ...rec, status })
}

export async function deleteRepresentative(id) {
  if (!isFirebaseReady) {
    const s = readDemo(); s.reps = s.reps.filter((r) => r.id !== id); delete s.photos[id]
    writeDemo(s); invalidate(); return
  }
  const { doc, deleteDoc } = await firestore()
  await deleteDoc(doc(db, COL.reps, id))
  try { await deleteDoc(doc(db, COL.photos, id)) } catch { /* no photo */ }
  invalidate()
}

/* small square thumbnail (160px) for cards and lists */
function makeThumb(dataUrl, size = 160) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.width, img.height)
      const c = document.createElement('canvas'); c.width = c.height = size
      const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
      resolve(c.toDataURL('image/jpeg', 0.72))
    }
    img.onerror = () => resolve('')
    img.src = dataUrl
  })
}
