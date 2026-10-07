import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'

export default function Addresses() {
  const { user, updateProfileData } = useAuth()
  const toast = useToast()
  const a = user?.address || {}
  const [form, setForm] = useState({ address: a.address || '', city: a.city || 'Dhaka', area: a.area || '', phone: user?.phone || '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function save() {
    await updateProfileData({ address: { address: form.address, city: form.city, area: form.area }, phone: form.phone })
    toast.success('Address saved.')
  }

  return (
    <div className="card max-w-lg p-6">
      <div className="mb-4 flex items-center gap-2"><MapPin size={18} /><h3 className="text-lg font-black">Default address</h3></div>
      <div className="space-y-4">
        <div><label className="label">Street address</label><input value={form.address} onChange={set('address')} className="field" placeholder="House, road" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">City</label><input value={form.city} onChange={set('city')} className="field" /></div>
          <div><label className="label">Area</label><input value={form.area} onChange={set('area')} className="field" /></div>
        </div>
        <div><label className="label">Phone</label><input value={form.phone} onChange={set('phone')} className="field" /></div>
        <button onClick={save} className="btn-ink">Save address</button>
      </div>
    </div>
  )
}
