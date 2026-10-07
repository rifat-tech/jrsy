import { isFirebaseReady, db } from '../firebase/config'
import {
  seedProducts, seedCategories, seedBanners, seedCoupons,
  seedReviews, seedSettings, seedUsers, seedOrders, seedCustomConfig,
} from '../data/mockData'

/* ------------------------------------------------------------------ *
 * DEMO STORE (localStorage) — used when Firebase env vars are absent. *
 * Every method below is async so pages work the same either way.      *
 * ------------------------------------------------------------------ */

const LS_KEY = 'jrsy_store_v1'

function loadStore() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  const initial = {
    products: seedProducts,
    categories: seedCategories,
    banners: seedBanners,
    coupons: seedCoupons,
    reviews: seedReviews,
    orders: seedOrders,
    users: seedUsers,
    settings: seedSettings,
    orderSeq: seedOrders.length,
  }
  localStorage.setItem(LS_KEY, JSON.stringify(initial))
  return initial
}
function saveStore(s) { localStorage.setItem(LS_KEY, JSON.stringify(s)) }
const uid = () => Math.random().toString(36).slice(2, 10)
const sleep = (ms = 120) => new Promise((r) => setTimeout(r, ms))


/* ---- small helpers ---- */
const STOCK_STATUSES = ['Confirmed', 'Processing', 'Shipped', 'Delivered']
const tsNum = (t) => (t?.toMillis ? t.toMillis() : Number(t) || 0)

// e.g. JRSY-260921-4821  (date + 4 random digits; readable and effectively unique for a small shop)
function makeOrderNumber() {
  const d = new Date()
  const two = (n) => String(n).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `JRSY-${String(d.getFullYear()).slice(2)}${two(d.getMonth() + 1)}${two(d.getDate())}-${rand}`
}

// demo-mode stock helper: sign -1 = take stock out, +1 = put it back
function adjustStock(store, items = [], sign) {
  items.forEach((it) => {
    const p = store.products.find((x) => x.id === it.productId)
    if (p && p.sizeStock && p.sizeStock[it.size] != null) {
      p.sizeStock[it.size] = Math.max(0, p.sizeStock[it.size] + sign * it.quantity)
      p.totalStock = Object.values(p.sizeStock).reduce((a, b) => a + b, 0)
      p.sold = Math.max(0, (p.sold || 0) - sign * it.quantity)
    }
  })
}

/* ---- Firestore imports are loaded lazily only when configured ---- */
let fs = null
async function firestore() {
  if (!fs) {
    fs = await import('firebase/firestore')
  }
  return fs
}

/* ================================================================== *
 *                         PUBLIC API                                  *
 * ================================================================== */

export const api = {
  demo: !isFirebaseReady,

  /* ------------------------------ PRODUCTS ------------------------------ */
  async listProducts() {
    if (!isFirebaseReady) { await sleep(); return loadStore().products }
    const { collection, getDocs } = await firestore()
    const snap = await getDocs(collection(db, 'products'))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  },

  async getProduct(idOrSlug) {
    const all = await this.listProducts()
    return all.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null
  },

  async saveProduct(product) {
    if (!isFirebaseReady) {
      const s = loadStore()
      if (product.id) {
        s.products = s.products.map((p) => (p.id === product.id ? { ...p, ...product, updatedAt: Date.now() } : p))
      } else {
        product.id = uid()
        product.createdAt = Date.now()
        product.updatedAt = Date.now()
        s.products.unshift(product)
      }
      saveStore(s)
      return product
    }
    const { doc, setDoc, addDoc, collection, serverTimestamp } = await firestore()
    if (product.id) {
      await setDoc(doc(db, 'products', product.id), { ...product, updatedAt: serverTimestamp() }, { merge: true })
      return product
    }
    const ref = await addDoc(collection(db, 'products'), { ...product, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    return { ...product, id: ref.id }
  },

  async deleteProduct(id) {
    if (!isFirebaseReady) {
      const s = loadStore(); s.products = s.products.filter((p) => p.id !== id); saveStore(s); return
    }
    const { doc, deleteDoc } = await firestore()
    await deleteDoc(doc(db, 'products', id))
  },

  /* ------------------------------ CATEGORIES ------------------------------ */
  async listCategories() {
    if (!isFirebaseReady) { await sleep(); return loadStore().categories.sort((a, b) => a.order - b.order) }
    const { collection, getDocs } = await firestore()
    const snap = await getDocs(collection(db, 'categories'))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.order - b.order)
  },
  async saveCategory(cat) {
    if (!isFirebaseReady) {
      const s = loadStore()
      if (cat.id && s.categories.some((c) => c.id === cat.id)) {
        s.categories = s.categories.map((c) => (c.id === cat.id ? { ...c, ...cat } : c))
      } else {
        cat.id = cat.id || uid(); s.categories.push(cat)
      }
      saveStore(s); return cat
    }
    const { doc, setDoc } = await firestore()
    cat.id = cat.id || uid()
    await setDoc(doc(db, 'categories', cat.id), cat, { merge: true })
    return cat
  },
  async deleteCategory(id) {
    if (!isFirebaseReady) { const s = loadStore(); s.categories = s.categories.filter((c) => c.id !== id); saveStore(s); return }
    const { doc, deleteDoc } = await firestore()
    await deleteDoc(doc(db, 'categories', id))
  },

  /* ------------------------------ ORDERS ------------------------------ */
  async listOrders() {
    if (!isFirebaseReady) { await sleep(); return [...loadStore().orders].sort((a, b) => b.createdAt - a.createdAt) }
    const { collection, getDocs, query, orderBy } = await firestore()
    const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  },
  async listOrdersByCustomer(customerId) {
    if (!isFirebaseReady) {
      const all = await this.listOrders()
      return all.filter((o) => o.customerId === customerId)
    }
    // Firestore rules only let a customer read THEIR orders, so the query itself
    // must be limited to their id (a rule is a gate, not a filter).
    const { collection, getDocs, query, where } = await firestore()
    const snap = await getDocs(query(collection(db, 'orders'), where('customerId', '==', customerId)))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => tsNum(b.createdAt) - tsNum(a.createdAt))
  },
  async getOrder(id) {
    if (!isFirebaseReady) return loadStore().orders.find((o) => o.id === id) || null
    try {
      const { doc, getDoc } = await firestore()
      const snap = await getDoc(doc(db, 'orders', id))
      return snap.exists() ? { id: snap.id, ...snap.data() } : null
    } catch { return null }
  },
  async createOrder(order) {
    // Firestore rejects `undefined`, so strip it (JSON round-trip) before saving.
    const clean = JSON.parse(JSON.stringify(order))
    if (!isFirebaseReady) {
      const s = loadStore()
      s.orderSeq = (s.orderSeq || 0) + 1
      clean.id = uid()
      clean.orderNumber = `JRSY-2026-${String(s.orderSeq).padStart(5, '0')}`
      clean.createdAt = Date.now(); clean.updatedAt = Date.now()
      clean.stockDeducted = true
      s.orders.unshift(clean)
      adjustStock(s, clean.items, -1)
      saveStore(s)
      return clean
    }
    // NOTE: stock is NOT changed here. Customers are not allowed to edit products
    // (that would let anyone tamper with your stock). Stock is deducted by the admin
    // when an order moves out of "Pending" — see updateOrderStatus().
    const { collection, addDoc, serverTimestamp } = await firestore()
    const orderNumber = makeOrderNumber()
    const ref = await addDoc(collection(db, 'orders'), {
      ...clean, orderNumber, stockDeducted: false,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    })
    return { ...clean, id: ref.id, orderNumber, createdAt: Date.now() }
  },
  async updateOrderStatus(id, orderStatus) {
    if (!isFirebaseReady) {
      const s = loadStore()
      s.orders = s.orders.map((o) => {
        if (o.id !== id) return o
        const next = { ...o, orderStatus, updatedAt: Date.now() }
        if (o.stockDeducted && orderStatus === 'Cancelled') { adjustStock(s, o.items, +1); next.stockDeducted = false }
        else if (!o.stockDeducted && orderStatus !== 'Cancelled' && orderStatus !== 'Pending') { adjustStock(s, o.items, -1); next.stockDeducted = true }
        return next
      })
      saveStore(s); return
    }
    const { doc, getDoc, updateDoc, runTransaction, serverTimestamp } = await firestore()
    const oref = doc(db, 'orders', id)
    const snap = await getDoc(oref)
    if (!snap.exists()) throw new Error('Order not found.')
    const o = snap.data()
    const deduct = !o.stockDeducted && STOCK_STATUSES.includes(orderStatus)
    const restore = !!o.stockDeducted && orderStatus === 'Cancelled'
    if (deduct || restore) {
      const sign = deduct ? -1 : +1
      for (const it of o.items || []) {
        if (!it.productId || String(it.productId).startsWith('custom-')) continue // custom jerseys have no stock
        const pref = doc(db, 'products', it.productId)
        await runTransaction(db, async (tx) => {
          const ps = await tx.get(pref)
          if (!ps.exists()) return
          const p = ps.data()
          const ss = { ...(p.sizeStock || {}) }
          if (ss[it.size] == null) return
          ss[it.size] = Math.max(0, ss[it.size] + sign * it.quantity)
          const totalStock = Object.values(ss).reduce((a, b) => a + b, 0)
          tx.update(pref, { sizeStock: ss, totalStock, sold: Math.max(0, (p.sold || 0) - sign * it.quantity) })
        })
      }
    }
    await updateDoc(oref, {
      orderStatus, updatedAt: serverTimestamp(),
      ...(deduct ? { stockDeducted: true } : {}),
      ...(restore ? { stockDeducted: false } : {}),
    })
  },

  /* ------------------------------ CUSTOMER FILES (logos / artwork) ------------------------------ */
  // One document per file, kept OUT of the order itself so an order can never
  // exceed Firestore's 1 MB limit. The order only stores the file's id.
  async saveCustomFile({ dataUrl, name, type, size, ownerId }) {
    if (!isFirebaseReady) {
      const s = loadStore()
      s.customFiles = s.customFiles || {}
      const id = uid() + uid()
      s.customFiles[id] = { id, dataUrl, name, type, size, ownerId: ownerId || 'guest', createdAt: Date.now() }
      try { saveStore(s) } catch { throw new Error('Browser storage is full (demo mode).') }
      return id
    }
    const { collection, addDoc, serverTimestamp } = await firestore()
    const ref = await addDoc(collection(db, 'customFiles'), {
      dataUrl, name: String(name || 'artwork').slice(0, 160), type: type || 'image/png',
      size: Number(size) || 0, ownerId: ownerId || 'guest', createdAt: serverTimestamp(),
    })
    return ref.id
  },
  async getCustomFile(id) {
    if (!id) return null
    if (!isFirebaseReady) return (loadStore().customFiles || {})[id] || null
    try {
      const { doc, getDoc } = await firestore()
      const snap = await getDoc(doc(db, 'customFiles', id))
      return snap.exists() ? { id: snap.id, ...snap.data() } : null
    } catch { return null }
  },

  /* ------------------------------ CUSTOMERS ------------------------------ */
  async listCustomers() {
    let users, orders
    if (!isFirebaseReady) {
      const s = loadStore(); users = s.users; orders = s.orders
    } else {
      const { collection, getDocs } = await firestore()
      const [u, o] = await Promise.all([getDocs(collection(db, 'users')), getDocs(collection(db, 'orders'))])
      users = u.docs.map((d) => ({ uid: d.id, ...d.data() }))
      orders = o.docs.map((d) => d.data())
    }
    return users
      .filter((u) => u.role !== 'admin')
      .map((u) => {
        const mine = orders.filter((o) => o.customerId === u.uid)
        return { ...u, orderCount: mine.length, totalSpend: mine.reduce((a, o) => a + (o.total || 0), 0) }
      })
  },
  async upsertUser(user) {
    if (!isFirebaseReady) {
      const s = loadStore()
      const i = s.users.findIndex((u) => u.uid === user.uid)
      if (i >= 0) s.users[i] = { ...s.users[i], ...user }
      else s.users.push(user)
      saveStore(s); return
    }
    const { doc, setDoc } = await firestore()
    await setDoc(doc(db, 'users', user.uid), user, { merge: true })
  },
  async getUser(uidStr) {
    if (!isFirebaseReady) return loadStore().users.find((u) => u.uid === uidStr) || null
    const { doc, getDoc } = await firestore()
    const snap = await getDoc(doc(db, 'users', uidStr))
    return snap.exists() ? { uid: snap.id, ...snap.data() } : null
  },

  /* ------------------------------ REVIEWS ------------------------------ */
  async listReviews(productId) {
    let all
    if (!isFirebaseReady) all = loadStore().reviews
    else {
      const { collection, getDocs } = await firestore()
      const snap = await getDocs(collection(db, 'reviews'))
      all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    }
    return productId ? all.filter((r) => r.productId === productId) : all
  },
  async saveReview(review) {
    if (!isFirebaseReady) {
      const s = loadStore()
      if (review.id) s.reviews = s.reviews.map((r) => (r.id === review.id ? { ...r, ...review } : r))
      else { review.id = uid(); review.createdAt = Date.now(); s.reviews.unshift(review) }
      saveStore(s); return review
    }
    const { collection, addDoc, doc, setDoc } = await firestore()
    if (review.id) { await setDoc(doc(db, 'reviews', review.id), review, { merge: true }); return review }
    const ref = await addDoc(collection(db, 'reviews'), review)
    return { ...review, id: ref.id }
  },
  async deleteReview(id) {
    if (!isFirebaseReady) { const s = loadStore(); s.reviews = s.reviews.filter((r) => r.id !== id); saveStore(s); return }
    const { doc, deleteDoc } = await firestore(); await deleteDoc(doc(db, 'reviews', id))
  },

  /* ------------------------------ COUPONS ------------------------------ */
  async listCoupons() {
    if (!isFirebaseReady) return loadStore().coupons
    const { collection, getDocs } = await firestore()
    const snap = await getDocs(collection(db, 'coupons'))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  },
  async saveCoupon(c) {
    if (!isFirebaseReady) {
      const s = loadStore()
      if (c.id && s.coupons.some((x) => x.id === c.id)) s.coupons = s.coupons.map((x) => (x.id === c.id ? { ...x, ...c } : x))
      else { c.id = c.id || uid(); s.coupons.push(c) }
      saveStore(s); return c
    }
    const { doc, setDoc } = await firestore(); c.id = c.id || uid()
    await setDoc(doc(db, 'coupons', c.id), c, { merge: true }); return c
  },
  async deleteCoupon(id) {
    if (!isFirebaseReady) { const s = loadStore(); s.coupons = s.coupons.filter((c) => c.id !== id); saveStore(s); return }
    const { doc, deleteDoc } = await firestore(); await deleteDoc(doc(db, 'coupons', id))
  },
  async validateCoupon(code, subtotal) {
    const list = await this.listCoupons()
    const c = list.find((x) => x.code.toUpperCase() === String(code).toUpperCase() && x.active)
    if (!c) return { ok: false, message: 'Coupon not found or inactive.' }
    if (c.expiry && c.expiry < Date.now()) return { ok: false, message: 'This coupon has expired.' }
    if (subtotal < c.minOrder) return { ok: false, message: `Minimum order ৳${c.minOrder} required.` }
    let discount = c.type === 'percent' ? Math.round((subtotal * c.amount) / 100) : c.amount
    if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount)
    return { ok: true, discount, coupon: c, message: `Coupon applied — you saved ৳${discount}.` }
  },

  /* ------------------------------ BANNERS ------------------------------ */
  async listBanners() {
    if (!isFirebaseReady) return loadStore().banners.sort((a, b) => a.order - b.order)
    const { collection, getDocs } = await firestore()
    const snap = await getDocs(collection(db, 'banners'))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.order - b.order)
  },
  async saveBanner(b) {
    if (!isFirebaseReady) {
      const s = loadStore()
      if (b.id && s.banners.some((x) => x.id === b.id)) s.banners = s.banners.map((x) => (x.id === b.id ? { ...x, ...b } : x))
      else { b.id = b.id || uid(); s.banners.push(b) }
      saveStore(s); return b
    }
    const { doc, setDoc } = await firestore(); b.id = b.id || uid()
    await setDoc(doc(db, 'banners', b.id), b, { merge: true }); return b
  },
  async deleteBanner(id) {
    if (!isFirebaseReady) { const s = loadStore(); s.banners = s.banners.filter((b) => b.id !== id); saveStore(s); return }
    const { doc, deleteDoc } = await firestore(); await deleteDoc(doc(db, 'banners', id))
  },

  /* ------------------------------ SETTINGS ------------------------------ */
  async getSettings() {
    if (!isFirebaseReady) return loadStore().settings
    const { doc, getDoc } = await firestore()
    const snap = await getDoc(doc(db, 'settings', 'store'))
    return snap.exists() ? snap.data() : seedSettings
  },
  async saveSettings(settings) {
    if (!isFirebaseReady) { const s = loadStore(); s.settings = { ...s.settings, ...settings }; saveStore(s); return s.settings }
    const { doc, setDoc } = await firestore()
    await setDoc(doc(db, 'settings', 'store'), settings, { merge: true }); return settings
  },

  /* ------------------------------ CUSTOM JERSEY CONFIG ------------------------------ */
  // The config can hold many images (fabric photos, gallery), which easily exceeds
  // Firestore's 1MB-per-document limit. So we JSON-encode it and split across
  // several docs in the `settings` collection (settings/custom = metadata,
  // settings/custom_0, custom_1, … = data chunks). Existing rules for
  // `settings/{id}` already cover these, so no rules change is needed.
  async getCustomConfig() {
    if (!isFirebaseReady) {
      const s = loadStore()
      return s.customConfig || seedCustomConfig
    }
    const { doc, getDoc } = await firestore()
    const meta = await getDoc(doc(db, 'settings', 'custom'))
    if (!meta.exists()) return seedCustomConfig
    const d = meta.data()
    if (d.chunks == null) return d // legacy single-doc config (backward compatible)
    let json = ''
    for (let i = 0; i < d.chunks; i++) {
      const c = await getDoc(doc(db, 'settings', `custom_${i}`))
      if (c.exists()) json += c.data().data || ''
    }
    try { return JSON.parse(json) } catch { return seedCustomConfig }
  },
  async saveCustomConfig(config) {
    if (!isFirebaseReady) { const s = loadStore(); s.customConfig = config; saveStore(s); return config }
    const { doc, setDoc, getDoc, writeBatch, deleteDoc } = await firestore()

    // Guard: any single image data-URI must fit inside one Firestore doc (<1MB).
    // Legacy images uploaded before compression can be huge — shrink them here.
    const shrink = (dataUrl) => new Promise((res) => {
      if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image') || dataUrl.length < 700000) return res(dataUrl)
      try {
        const img = new Image()
        img.onload = () => {
          const max = 500; let { width, height } = img
          if (width > height && width > max) { height = Math.round(height * max / width); width = max }
          else if (height > max) { width = Math.round(width * max / height); height = max }
          const c = document.createElement('canvas'); c.width = width; c.height = height
          const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height); ctx.drawImage(img, 0, 0, width, height)
          res(c.toDataURL('image/jpeg', 0.55))
        }
        img.onerror = () => res('')
        img.src = dataUrl
      } catch { res(dataUrl) }
    })

    const clean = { ...config }
    if (Array.isArray(clean.fabrics)) clean.fabrics = await Promise.all(clean.fabrics.map(async (f) => ({ ...f, image: await shrink(f.image) })))
    if (Array.isArray(clean.gallery)) clean.gallery = await Promise.all(clean.gallery.map((g) => shrink(g)))

    let prevChunks = 0
    try { const m = await getDoc(doc(db, 'settings', 'custom')); if (m.exists()) prevChunks = m.data().chunks || 0 } catch {}

    const json = JSON.stringify(clean)
    const SIZE = 700000 // safe margin under the 1MB per-doc limit
    const chunks = []
    for (let i = 0; i < json.length; i += SIZE) chunks.push(json.slice(i, i + SIZE))
    if (chunks.length === 0) chunks.push('{}')

    try {
      const batch = writeBatch(db)
      batch.set(doc(db, 'settings', 'custom'), { chunks: chunks.length, updatedAt: Date.now() })
      chunks.forEach((c, i) => batch.set(doc(db, 'settings', `custom_${i}`), { data: c }))
      await batch.commit()
    } catch (e) {
      // surface the real reason instead of a generic failure
      throw new Error(e?.message || 'Firestore write failed')
    }

    for (let i = chunks.length; i < prevChunks; i++) {
      try { await deleteDoc(doc(db, 'settings', `custom_${i}`)) } catch {}
    }
    return clean
  },

  /* ------------------------------ WISHLIST (per user) ------------------------------ */
  async getWishlist(userId) {
    if (!userId) return []
    if (!isFirebaseReady) {
      try { return JSON.parse(localStorage.getItem('jrsy_wish_' + userId) || '[]') } catch { return [] }
    }
    const { doc, getDoc } = await firestore()
    const snap = await getDoc(doc(db, 'wishlists', userId))
    return snap.exists() ? snap.data().items || [] : []
  },
  async setWishlist(userId, items) {
    if (!userId) return
    if (!isFirebaseReady) { localStorage.setItem('jrsy_wish_' + userId, JSON.stringify(items)); return }
    const { doc, setDoc } = await firestore()
    await setDoc(doc(db, 'wishlists', userId), { items }, { merge: true })
  },

  /* Reset demo data (handy button in admin) */
  resetDemo() { if (!isFirebaseReady) localStorage.removeItem(LS_KEY) },

  /* ---- One-click seed of the starter catalogue into live Firestore ---- */
  async importStarterCatalogue() {
    if (!isFirebaseReady) return { ok: false, message: 'Connect Firebase first.' }
    const { collection, getDocs, doc, writeBatch } = await firestore()
    // guard: don't double-seed
    const existing = await getDocs(collection(db, 'products'))
    if (!existing.empty) return { ok: false, message: `Firestore already has ${existing.size} products. Import skipped.` }

    const batch = writeBatch(db)
    seedProducts.forEach((p) => batch.set(doc(db, 'products', p.id), p))
    seedCategories.forEach((c) => batch.set(doc(db, 'categories', c.id), c))
    seedBanners.forEach((b) => batch.set(doc(db, 'banners', b.id), b))
    seedCoupons.forEach((c) => batch.set(doc(db, 'coupons', c.id), c))
    seedReviews.forEach((r) => batch.set(doc(db, 'reviews', r.id), r))
    batch.set(doc(db, 'settings', 'store'), seedSettings)
    batch.set(doc(db, 'settings', 'custom'), seedCustomConfig)
    await batch.commit()
    return { ok: true, message: `Imported ${seedProducts.length} products, ${seedCategories.length} categories, ${seedBanners.length} banners.` }
  },
}
