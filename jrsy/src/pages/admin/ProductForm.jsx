import { useEffect, useRef, useState } from 'react'
import { Upload, X, Star, GripVertical } from 'lucide-react'
import { Modal, Spinner } from '../../components/ui'
import { uploadImage } from '../../services/storage'
import { useStore } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import { slugify } from '../../utils/format'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const empty = {
  name: '', slug: '', sku: '', category: '', subcategory: '', description: '', shortDescription: '',
  price: '', salePrice: '', brand: 'JRSY', team: '', season: '2025/26', jerseyType: 'Home',
  sizes: ['S', 'M', 'L', 'XL'], sizeStock: { S: 10, M: 20, L: 20, XL: 10 }, images: [],
  status: 'active', featured: false, newArrival: false, bestSeller: false,
}

export default function ProductForm({ open, onClose, product, onSaved }) {
  const { categories } = useStore()
  const toast = useToast()
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const dragIdx = useRef(null)

  useEffect(() => {
    if (product) setForm({ ...empty, ...product, price: product.price || '', salePrice: product.salePrice || '' })
    else setForm(empty)
  }, [product, open])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  function toggleSize(s) {
    setForm((f) => {
      const has = f.sizes.includes(s)
      const sizes = has ? f.sizes.filter((x) => x !== s) : [...f.sizes, s].sort((a, b) => SIZES.indexOf(a) - SIZES.indexOf(b))
      const sizeStock = { ...f.sizeStock }
      if (has) delete sizeStock[s]
      else sizeStock[s] = 0
      return { ...f, sizes, sizeStock }
    })
  }

  async function onFiles(files) {
    setUploading(true)
    try {
      const urls = []
      for (const file of Array.from(files)) urls.push(await uploadImage(file, 'products'))
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }))
    } finally { setUploading(false) }
  }

  function removeImage(i) { setForm((f) => ({ ...f, images: f.images.filter((_, x) => x !== i) })) }
  function makePrimary(i) {
    setForm((f) => { const imgs = [...f.images]; const [x] = imgs.splice(i, 1); imgs.unshift(x); return { ...f, images: imgs } })
  }
  function onDrop(i) {
    setForm((f) => {
      const imgs = [...f.images]; const [moved] = imgs.splice(dragIdx.current, 1); imgs.splice(i, 0, moved)
      return { ...f, images: imgs }
    })
  }

  async function save() {
    if (!form.name || !form.price || !form.category) return toast.error('Name, price and category are required.')
    setSaving(true)
    try {
      const totalStock = Object.values(form.sizeStock).reduce((a, b) => a + Number(b || 0), 0)
      const payload = {
        ...form,
        slug: form.slug || slugify(form.name),
        sku: form.sku || `JRSY-${Date.now().toString().slice(-6)}`,
        price: Number(form.price), salePrice: Number(form.salePrice) || 0,
        totalStock,
        images: form.images.length ? form.images : [],
        rating: form.rating || 4.7, reviewCount: form.reviewCount || 0, sold: form.sold || 0,
      }
      await onSaved(payload)
      toast.success(product ? 'Product updated successfully.' : 'Product added successfully.')
      onClose()
    } catch (e) {
      toast.error('Could not save product.')
    } finally { setSaving(false) }
  }

  const cats = categories.filter((c) => c.active)

  return (
    <Modal open={open} onClose={onClose} title={product ? 'Edit product' : 'Add product'} wide>
      <div className="space-y-5">
        {/* images */}
        <div>
          <p className="label">Product images</p>
          <div className="flex flex-wrap gap-3">
            {form.images.map((img, i) => (
              <div
                key={i} draggable onDragStart={() => (dragIdx.current = i)} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(i)}
                className="group relative h-24 w-20 overflow-hidden rounded-lg border border-ink/10 bg-chalk"
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-volt px-1 text-[9px] font-black uppercase">Main</span>}
                <div className="absolute inset-0 hidden items-center justify-center gap-1 bg-ink/50 group-hover:flex">
                  {i !== 0 && <button onClick={() => makePrimary(i)} className="rounded bg-white/90 p-1" title="Set primary"><Star size={13} /></button>}
                  <button onClick={() => removeImage(i)} className="rounded bg-white/90 p-1 text-flare" title="Remove"><X size={13} /></button>
                  <GripVertical size={13} className="text-white/70" />
                </div>
              </div>
            ))}
            <label className="flex h-24 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ink/25 text-[10px] font-bold text-ink/50 hover:border-ink">
              {uploading ? <Spinner size={16} /> : <Upload size={16} />}
              {uploading ? 'Uploading' : 'Upload'}
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => onFiles(e.target.files)} />
            </label>
          </div>
          <p className="mt-1 text-[11px] text-ink/40">Drag to reorder · first image is the primary. Uploads go to Firebase Storage (base64 preview in demo).</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Product name" value={form.name} onChange={(v) => set('name', v)} placeholder="e.g. Home Jersey 2025/26" required />
          <Input label="Slug" value={form.slug} onChange={(v) => set('slug', v)} placeholder="auto from name" />
          <Input label="SKU" value={form.sku} onChange={(v) => set('sku', v)} placeholder="auto-generated" />
          <Select label="Category" value={form.category} onChange={(v) => set('category', v)} options={cats.map((c) => [c.slug, c.name])} required />
          <Input label="Team" value={form.team} onChange={(v) => set('team', v)} />
          <Input label="Season" value={form.season} onChange={(v) => set('season', v)} />
          <Select label="Jersey type" value={form.jerseyType} onChange={(v) => set('jerseyType', v)} options={[['Home', 'Home'], ['Away', 'Away'], ['Third', 'Third'], ['GK', 'Goalkeeper'], ['Retro', 'Retro'], ['ODI', 'ODI'], ['T20', 'T20'], ['Franchise', 'Franchise']]} />
          <Input label="Price (৳)" type="number" value={form.price} onChange={(v) => set('price', v)} required />
          <Input label="Sale price (৳)" type="number" value={form.salePrice} onChange={(v) => set('salePrice', v)} placeholder="0 = no sale" />
        </div>

        <Input label="Short description" value={form.shortDescription} onChange={(v) => set('shortDescription', v)} />
        <div>
          <label className="label">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className="field" />
        </div>

        {/* sizes + stock */}
        <div>
          <p className="label">Available sizes & stock</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button key={s} type="button" onClick={() => toggleSize(s)} className={`h-9 min-w-[3rem] rounded-lg border px-2 text-sm font-bold ${form.sizes.includes(s) ? 'border-ink bg-ink text-paper' : 'border-ink/20 text-ink/50'}`}>{s}</button>
            ))}
          </div>
          {form.sizes.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {form.sizes.map((s) => (
                <div key={s} className="flex items-center gap-2 rounded-lg border border-ink/10 px-2 py-1.5">
                  <span className="text-xs font-black">{s}</span>
                  <input type="number" min={0} value={form.sizeStock[s] ?? 0} onChange={(e) => set('sizeStock', { ...form.sizeStock, [s]: Number(e.target.value) })} className="w-full rounded border-0 bg-transparent text-sm focus:outline-none" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* flags */}
        <div className="flex flex-wrap gap-4">
          {[['featured', 'Featured'], ['newArrival', 'New arrival'], ['bestSeller', 'Best seller']].map(([k, l]) => (
            <label key={k} className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form[k]} onChange={(e) => set(k, e.target.checked)} className="h-4 w-4 accent-ink" /> {l}</label>
          ))}
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.status === 'active'} onChange={(e) => set('status', e.target.checked ? 'active' : 'disabled')} className="h-4 w-4 accent-ink" /> Active</label>
        </div>

        <div className="flex justify-end gap-2 border-t border-ink/10 pt-4">
          <button onClick={onClose} className="btn-ghost text-xs">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-ink text-xs">{saving ? <Spinner size={14} /> : product ? 'Save changes' : 'Add product'}</button>
        </div>
      </div>
    </Modal>
  )
}

function Input({ label, value, onChange, type = 'text', required, placeholder }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-flare"> *</span>}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="field" />
    </div>
  )
}
function Select({ label, value, onChange, options, required }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-flare"> *</span>}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field">
        <option value="">Select…</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}
