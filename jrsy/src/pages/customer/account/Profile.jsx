import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'

export default function Profile() {
  const { user, updateProfileData } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function save() {
    if (!form.name) return toast.error('Name cannot be empty.')
    await updateProfileData(form)
    toast.success('Profile updated.')
  }

  return (
    <div className="card max-w-lg p-6">
      <h3 className="mb-4 text-lg font-black">Profile</h3>
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-2xl font-black text-paper">{(user?.name || 'J')[0].toUpperCase()}</div>
        <div><p className="font-bold">{user?.name}</p><p className="text-sm text-ink/50">{user?.email}</p></div>
      </div>
      <div className="space-y-4">
        <div><label className="label">Full name</label><input value={form.name} onChange={set('name')} className="field" /></div>
        <div><label className="label">Email</label><input value={user?.email} disabled className="field opacity-60" /></div>
        <div><label className="label">Phone</label><input value={form.phone} onChange={set('phone')} className="field" /></div>
        <button onClick={save} className="btn-ink">Save changes</button>
      </div>
    </div>
  )
}
