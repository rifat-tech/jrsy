import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Logo, Spinner } from '../../components/ui'

export default function Register() {
  const nav = useNavigate()
  const toast = useToast()
  const { register, loginWithGoogle, demo } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    if (!form.name || !form.email) return toast.error('Name and email are required.')
    if (!demo && form.password.length < 6) return toast.error('Password must be at least 6 characters.')
    setBusy(true)
    try { await register(form); toast.success('Account created. Welcome to JRSY!'); nav('/account') }
    catch (err) { toast.error(err?.code === 'auth/email-already-in-use' ? 'That email is already registered.' : 'Registration failed. Try again.') }
    finally { setBusy(false) }
  }

  return (
    <div className="container-jrsy flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center"><Logo className="justify-center" /><h1 className="mt-4 text-3xl font-black">Create your account</h1><p className="text-ink/50">Join JRSY. Play. Wear. Repeat.</p></div>
        <form onSubmit={submit} className="card space-y-4 p-6">
          <div><label className="label">Full name</label><input value={form.name} onChange={set('name')} className="field" placeholder="Your name" /></div>
          <div><label className="label">Email</label><input type="email" value={form.email} onChange={set('email')} className="field" placeholder="you@email.com" /></div>
          <div><label className="label">Phone</label><input value={form.phone} onChange={set('phone')} className="field" placeholder="+880…" /></div>
          <div><label className="label">Password</label><input type="password" value={form.password} onChange={set('password')} className="field" placeholder={demo ? 'optional in demo' : 'At least 6 characters'} /></div>
          <button disabled={busy} className="btn-volt w-full">{busy ? <Spinner size={16} /> : 'Create account'}</button>
          <button type="button" onClick={() => loginWithGoogle().then(() => nav('/account'))} disabled={busy} className="btn-ghost w-full">Continue with Google</button>
        </form>
        <p className="mt-5 text-center text-sm text-ink/60">Already have an account? <Link to="/login" className="font-bold underline">Log in</Link></p>
      </div>
    </div>
  )
}
