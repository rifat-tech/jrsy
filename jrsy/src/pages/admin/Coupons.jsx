import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { api } from '../../services/db'
import { useToast } from '../../context/ToastContext'
import { money, dateFmt } from '../../utils/format'
import { AdminHeader, Confirm } from '../../components/admin/kit'
import { Modal, Badge, EmptyState, PageLoader } from '../../components/ui'

const empty = { code: '', type: 'percent', amount: 10, minOrder: 0, maxDiscount: 0, expiry: Date.now() + 30 * 86400000, usageLimit: 100, used: 0, active: true }

export default function Coupons() {
  const toast = useToast()
  const [coupons, setCoupons] = useState(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [toDelete, setToDelete] = useState(null)

  const load = () => api.listCoupons().then(setCoupons)
  useEffect(() => { load() }, [])
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  function edit(c) { setForm({ ...c, expiryDate: new Date(c.expiry).toISOString().slice(0, 10) }); setOpen(true) }
  function add() { setForm({ ...empty, expiryDate: new Date(empty.expiry).toISOString().slice(0, 10) }); setOpen(true) }

  async function save() {
    if (!form.code) return toast.error('Coupon code is required.')
    const payload = { ...form, code: form.code.toUpperCase(), amount: Number(form.amount), minOrder: Number(form.minOrder), maxDiscount: Number(form.maxDiscount), usageLimit: Number(form.usageLimit), expiry: form.expiryDate ? new Date(form.expiryDate).getTime() : form.expiry }
    delete payload.expiryDate
    await api.saveCoupon(payload); setOpen(false); toast.success('Coupon saved.'); load()
  }
  async function toggle(c) { await api.saveCoupon({ ...c, active: !c.active }); load() }
  async function confirmDelete() { await api.deleteCoupon(toDelete.id); setToDelete(null); toast.success('Coupon deleted.'); load() }

  if (!coupons) return <PageLoader />

  return (
    <div>
      <AdminHeader title="Coupons" subtitle="Create discount codes for your store"
        action={<button onClick={add} className="btn-ink text-xs"><Plus size={16} /> Add coupon</button>} />

      {coupons.length === 0 ? <EmptyState title="No coupons yet" hint="Create your first discount code." /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-2xl font-black tracking-tight">{c.code}</p>
                  <p className="text-sm text-ink/60">{c.type === 'percent' ? `${c.amount}% off` : `${money(c.amount)} off`}</p>
                </div>
                <button onClick={() => toggle(c)}>{c.active ? <Badge tone="green">Active</Badge> : <Badge tone="muted">Off</Badge>}</button>
              </div>
              <div className="mt-3 space-y-1 text-xs text-ink/50">
                <p>Min order: {money(c.minOrder)}</p>
                {c.maxDiscount > 0 && <p>Max discount: {money(c.maxDiscount)}</p>}
                <p>Expires: {dateFmt(c.expiry)}</p>
                <p>Used: {c.used}/{c.usageLimit}</p>
              </div>
              <div className="mt-4 flex gap-1 border-t border-ink/5 pt-3">
                <button onClick={() => edit(c)} className="btn-ghost flex-1 py-2 text-xs"><Pencil size={14} /> Edit</button>
                <button onClick={() => setToDelete(c)} className="rounded-full border border-ink/15 p-2 text-ink/50 hover:border-flare hover:text-flare"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={form.id ? 'Edit coupon' : 'Add coupon'}>
        <div className="space-y-4">
          <div><label className="label">Code</label><input value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} className="field uppercase" placeholder="JRSY10" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Type</label><select value={form.type} onChange={(e) => set('type', e.target.value)} className="field"><option value="percent">Percent %</option><option value="fixed">Fixed ৳</option></select></div>
            <div><label className="label">Amount</label><input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} className="field" /></div>
            <div><label className="label">Min order (৳)</label><input type="number" value={form.minOrder} onChange={(e) => set('minOrder', e.target.value)} className="field" /></div>
            <div><label className="label">Max discount (৳)</label><input type="number" value={form.maxDiscount} onChange={(e) => set('maxDiscount', e.target.value)} className="field" /></div>
            <div><label className="label">Expiry</label><input type="date" value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} className="field" /></div>
            <div><label className="label">Usage limit</label><input type="number" value={form.usageLimit} onChange={(e) => set('usageLimit', e.target.value)} className="field" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="h-4 w-4 accent-ink" /> Active</label>
          <div className="flex justify-end gap-2"><button onClick={() => setOpen(false)} className="btn-ghost text-xs">Cancel</button><button onClick={save} className="btn-ink text-xs">Save</button></div>
        </div>
      </Modal>
      <Confirm open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={confirmDelete} title="Delete coupon" message={`Delete coupon “${toDelete?.code}”?`} />
    </div>
  )
}
