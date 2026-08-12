import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { api } from '../../services/db'
import { useStore } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import { slugify } from '../../utils/format'
import { AdminHeader, Confirm } from '../../components/admin/kit'
import { Modal, Badge, PageLoader } from '../../components/ui'

const empty = { name: '', slug: '', group: 'Football', order: 10, active: true, image: '' }

export default function Categories() {
  const { refreshCategories } = useStore()
  const toast = useToast()
  const [cats, setCats] = useState(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [toDelete, setToDelete] = useState(null)

  const load = () => api.listCategories().then(setCats)
  useEffect(() => { load() }, [])
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function save() {
    if (!form.name) return toast.error('Category name is required.')
    await api.saveCategory({ ...form, slug: form.slug || slugify(form.name), order: Number(form.order) })
    setOpen(false); toast.success('Category saved.'); load(); refreshCategories()
  }
  async function toggle(c) { await api.saveCategory({ ...c, active: !c.active }); load(); refreshCategories() }
  async function confirmDelete() { await api.deleteCategory(toDelete.id); setToDelete(null); toast.success('Category deleted.'); load(); refreshCategories() }

  if (!cats) return <PageLoader />
  const groups = [...new Set(cats.map((c) => c.group))]

  return (
    <div>
      <AdminHeader title="Categories" subtitle="Organise your store — changes appear on the storefront instantly"
        action={<button onClick={() => { setForm(empty); setOpen(true) }} className="btn-ink text-xs"><Plus size={16} /> Add category</button>} />

      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g}>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink/50">{g}</h3>
            <div className="card divide-y divide-ink/5">
              {cats.filter((c) => c.group === g).map((c) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink/5 text-xs font-black">{c.order}</span>
                    <div><p className="font-bold">{c.name}</p><p className="text-xs text-ink/40">/{c.slug}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggle(c)}>{c.active ? <Badge tone="green">Active</Badge> : <Badge tone="muted">Hidden</Badge>}</button>
                    <button onClick={() => { setForm(c); setOpen(true) }} className="rounded-lg p-2 text-ink/50 hover:bg-ink/5 hover:text-ink"><Pencil size={15} /></button>
                    <button onClick={() => setToDelete(c)} className="rounded-lg p-2 text-ink/50 hover:bg-flare/10 hover:text-flare"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={form.id ? 'Edit category' : 'Add category'}>
        <div className="space-y-4">
          <div><label className="label">Name</label><input value={form.name} onChange={(e) => set('name', e.target.value)} className="field" /></div>
          <div><label className="label">Slug</label><input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto from name" className="field" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Group</label>
              <select value={form.group} onChange={(e) => set('group', e.target.value)} className="field">
                {['Football', 'Cricket', 'Custom'].map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div><label className="label">Order</label><input type="number" value={form.order} onChange={(e) => set('order', e.target.value)} className="field" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="h-4 w-4 accent-ink" /> Active</label>
          <div className="flex justify-end gap-2"><button onClick={() => setOpen(false)} className="btn-ghost text-xs">Cancel</button><button onClick={save} className="btn-ink text-xs">Save</button></div>
        </div>
      </Modal>
      <Confirm open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={confirmDelete} title="Delete category" message={`Delete “${toDelete?.name}”?`} />
    </div>
  )
}
