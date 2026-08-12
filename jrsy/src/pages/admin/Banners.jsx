import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Upload } from 'lucide-react'
import { api } from '../../services/db'
import { useToast } from '../../context/ToastContext'
import { uploadImage } from '../../services/storage'
import { AdminHeader, Confirm } from '../../components/admin/kit'
import { Modal, Badge, EmptyState, PageLoader } from '../../components/ui'

const empty = { title: '', subtitle: '', cta: '', url: '/shop', image: '', active: true, order: 1 }

export default function Banners() {
  const toast = useToast()
  const [banners, setBanners] = useState(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [toDelete, setToDelete] = useState(null)
  const [uploading, setUploading] = useState(false)

  const load = () => api.listBanners().then(setBanners)
  useEffect(() => { load() }, [])
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function onImg(e) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true); try { set('image', await uploadImage(file, 'banners')) } finally { setUploading(false) }
  }
  async function save() {
    if (!form.title) return toast.error('Banner title is required.')
    await api.saveBanner({ ...form, order: Number(form.order) }); setOpen(false); toast.success('Banner saved.'); load()
  }
  async function toggle(b) { await api.saveBanner({ ...b, active: !b.active }); load() }
  async function confirmDelete() { await api.deleteBanner(toDelete.id); setToDelete(null); toast.success('Banner deleted.'); load() }

  if (!banners) return <PageLoader />

  return (
    <div>
      <AdminHeader title="Banners" subtitle="Homepage promotional banners"
        action={<button onClick={() => { setForm(empty); setOpen(true) }} className="btn-ink text-xs"><Plus size={16} /> Add banner</button>} />

      {banners.length === 0 ? <EmptyState title="No banners" hint="Add a homepage banner." /> : (
        <div className="space-y-4">
          {banners.map((b) => (
            <div key={b.id} className="card flex flex-col gap-4 overflow-hidden p-4 sm:flex-row sm:items-center">
              <div className="flex h-24 w-full items-center justify-center rounded-xl bg-ink p-4 text-paper sm:w-64">
                {b.image ? <img src={b.image} alt="" className="h-full w-full rounded-lg object-cover" /> : (
                  <div className="text-center"><p className="font-black">{b.title}</p><p className="text-xs text-volt">{b.subtitle}</p></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2"><p className="font-black">{b.title}</p><Badge tone="muted">#{b.order}</Badge></div>
                <p className="text-sm text-ink/60">{b.subtitle}</p>
                <p className="mt-1 text-xs text-ink/40">CTA: {b.cta || '—'} → {b.url}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggle(b)}>{b.active ? <Badge tone="green">Active</Badge> : <Badge tone="muted">Off</Badge>}</button>
                <button onClick={() => { setForm(b); setOpen(true) }} className="rounded-lg p-2 text-ink/50 hover:bg-ink/5 hover:text-ink"><Pencil size={15} /></button>
                <button onClick={() => setToDelete(b)} className="rounded-lg p-2 text-ink/50 hover:bg-flare/10 hover:text-flare"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={form.id ? 'Edit banner' : 'Add banner'}>
        <div className="space-y-4">
          <div><label className="label">Title</label><input value={form.title} onChange={(e) => set('title', e.target.value)} className="field" placeholder="NEW SEASON" /></div>
          <div><label className="label">Subtitle</label><input value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} className="field" placeholder="Play. Wear. Repeat." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Button text</label><input value={form.cta} onChange={(e) => set('cta', e.target.value)} className="field" placeholder="Shop Collection" /></div>
            <div><label className="label">Button URL</label><input value={form.url} onChange={(e) => set('url', e.target.value)} className="field" placeholder="/shop" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Order</label><input type="number" value={form.order} onChange={(e) => set('order', e.target.value)} className="field" /></div>
            <div>
              <label className="label">Image</label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink/25 py-2.5 text-xs font-bold text-ink/50 hover:border-ink">
                <Upload size={14} /> {uploading ? 'Uploading…' : form.image ? 'Replace' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={onImg} />
              </label>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="h-4 w-4 accent-ink" /> Active</label>
          <div className="flex justify-end gap-2"><button onClick={() => setOpen(false)} className="btn-ghost text-xs">Cancel</button><button onClick={save} className="btn-ink text-xs">Save</button></div>
        </div>
      </Modal>
      <Confirm open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={confirmDelete} title="Delete banner" message="This banner will be removed from the homepage." />
    </div>
  )
}
