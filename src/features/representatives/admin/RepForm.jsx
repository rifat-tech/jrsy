/* =====================================================================
 *  Admin → Add / Edit Representative
 *  Division → District → Upazila are dependent dropdowns.
 *  Moving someone to another upazila asks for confirmation first.
 *  Want a new field? Add it here + in lib/validate.js (+ firestore.rules).
 * ===================================================================== */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { Camera, Trash2, ArrowRight } from 'lucide-react'
import { AdminHeader, Confirm } from '../../../components/admin/kit'
import { Modal, PageLoader, Spinner } from '../../../components/ui'
import { useToast } from '../../../context/ToastContext'
import { NETWORK } from '../../../config/site'
import { useNetwork } from '../lib/hooks'
import { districtsOfDivision, upazilasOfDistrict, rowFor } from '../lib/logic'
import { validateRep, validateImageFile } from '../lib/validate'
import { saveRepresentative, deleteRepresentative, setRepStatus, getPhoto } from '../lib/service'
import { Avatar } from '../components/RepCard'

const BLANK = {
  name: '', designation: NETWORK.defaultDesignation, representative_type: NETWORK.defaultType, mobile: '', whatsapp: '', email: '',
  facebook_url: '', address: '', bio: '', division_id: '', district_id: '', upazila_id: '', status: 'active', joining_date: '',
}

const place = (r) => (r?.district && r?.division ? `${r.upazila.name_en}, ${r.district.name_en} (${r.division.name_en})` : 'unknown area')

export default function RepForm() {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const toast = useToast()
  const { loading, idx } = useNetwork()
  const fileRef = useRef(null)

  const [form, setForm] = useState(BLANK)
  const [orig, setOrig] = useState(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [removePhoto, setRemovePhoto] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState(null) // { moved, others }
  const [askDelete, setAskDelete] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  /* fill the form: editing → the saved person · ?upazila=ID (from Vacant Areas) → that place */
  useEffect(() => {
    if (!idx) return
    if (id) {
      const r = idx.reps.find((x) => x.id === id)
      if (r) { setOrig(r); setForm({ ...BLANK, ...r }); getPhoto(id).then((p) => p && setPreview(p)).catch(() => {}) }
    } else if (sp.get('upazila')) {
      const u = idx.upaById.get(sp.get('upazila'))
      const d = u && idx.disById.get(u.district_id)
      if (u && d) setForm((f) => ({ ...f, upazila_id: u.id, district_id: d.id, division_id: d.division_id }))
    }
  }, [idx, id, sp])

  const diss = useMemo(() => (idx && form.division_id ? districtsOfDivision(idx, form.division_id) : []), [idx, form.division_id])
  const upas = useMemo(() => (idx && form.district_id ? upazilasOfDistrict(idx, form.district_id) : []), [idx, form.district_id])
  if (loading || !idx) return <PageLoader />
  if (id && !orig) return <p className="py-10 text-center text-ink/50">Representative not found. <Link className="underline" to="/admin/representatives/list">Back to list</Link></p>

  function pickFile(e) {
    const f = e.target.files?.[0]; if (!f) return
    const err = validateImageFile(f)
    if (err) { toast.error(err); e.target.value = ''; return }
    setFile(f); setRemovePhoto(false); setPreview(URL.createObjectURL(f))
  }

  /* step 1: check the form, then see if we need to ask before saving */
  function submit(e) {
    e.preventDefault()
    const c = validateRep(form)
    setErrors(c.errors)
    if (!c.ok) return toast.error(Object.values(c.errors)[0])
    const moved = orig && orig.upazila_id !== c.value.upazila_id
    const others = c.value.status === 'active' ? idx.activeOf(c.value.upazila_id).filter((r) => r.id !== id) : []
    const full = others.length >= NETWORK.maxActivePerUpazila
    if (moved || full) return setConfirm({ moved, others: full ? others : [] })
    doSave([])
  }

  /* step 2: save (and deactivate the person being replaced, if any) */
  async function doSave(replace) {
    setConfirm(null); setSaving(true)
    try {
      for (const o of replace) await setRepStatus(o.id, 'inactive')
      await saveRepresentative({ ...(orig || {}), ...form, id: orig?.id }, { photoFile: file, removePhoto })
      toast.success(orig ? 'Representative updated.' : 'Representative added.')
      nav('/admin/representatives/list')
    } catch (err) { toast.error(err.message || 'Could not save.') } finally { setSaving(false) }
  }

  const Err = ({ k }) => (errors[k] ? <p className="mt-1 text-xs text-flare">{errors[k]}</p> : null)
  const fromRow = orig ? rowFor(idx, idx.upaById.get(orig.upazila_id) || { id: '', district_id: '' }) : null
  const toRow = form.upazila_id && idx.upaById.get(form.upazila_id) ? rowFor(idx, idx.upaById.get(form.upazila_id)) : null

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl">
      <AdminHeader title={orig ? 'Edit Representative' : 'Add Representative'} subtitle="Division → District → Upazila" />
      <div className="card space-y-5 p-5 sm:p-7">
        {/* photo */}
        <div className="flex items-center gap-4">
          <Avatar rep={{ name: form.name, thumb: removePhoto ? '' : preview || form.thumb }} size={88} />
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost px-4 py-2 text-xs"><Camera size={15} /> Upload Photo</button>
            {(preview || form.thumb) && !removePhoto && <button type="button" onClick={() => { setRemovePhoto(true); setFile(null); setPreview('') }} className="ml-2 text-xs font-bold text-flare">Remove</button>}
            <p className="text-xs text-ink/40">JPG, PNG or WebP. Automatically resized and compressed.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label">Name *</label><input className="field" value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={80} /><Err k="name" /></div>
          <div><label className="label">Designation</label><input className="field" value={form.designation} onChange={(e) => set('designation', e.target.value)} maxLength={60} /></div>
          <div><label className="label">Type</label>
            <select className="field" value={form.representative_type} onChange={(e) => set('representative_type', e.target.value)}>{NETWORK.types.map((t) => <option key={t}>{t}</option>)}</select></div>
          <div><label className="label">Mobile *</label><input className="field" inputMode="tel" placeholder="01XXXXXXXXX" value={form.mobile} onChange={(e) => set('mobile', e.target.value)} /><Err k="mobile" /></div>
          <div><label className="label">WhatsApp</label><input className="field" inputMode="tel" placeholder="same as mobile if empty" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} /><Err k="whatsapp" /></div>
          <div><label className="label">Email</label><input className="field" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /><Err k="email" /></div>
          <div><label className="label">Facebook</label><input className="field" placeholder="https://facebook.com/…" value={form.facebook_url} onChange={(e) => set('facebook_url', e.target.value)} /><Err k="facebook_url" /></div>

          <div><label className="label">Division *</label>
            <select className="field" value={form.division_id} onChange={(e) => setForm({ ...form, division_id: e.target.value, district_id: '', upazila_id: '' })}>
              <option value="">Select Division</option>{idx.divs.map((d) => <option key={d.id} value={d.id}>{d.name_bn} · {d.name_en}</option>)}</select><Err k="division_id" /></div>
          <div><label className="label">District *</label>
            <select className="field" value={form.district_id} disabled={!form.division_id} onChange={(e) => setForm({ ...form, district_id: e.target.value, upazila_id: '' })}>
              <option value="">Select District</option>{diss.map((d) => <option key={d.id} value={d.id}>{d.name_bn} · {d.name_en}</option>)}</select><Err k="district_id" /></div>
          <div><label className="label">Upazila *</label>
            <select className="field" value={form.upazila_id} disabled={!form.district_id} onChange={(e) => set('upazila_id', e.target.value)}>
              <option value="">Select Upazila</option>{upas.map((u) => <option key={u.id} value={u.id}>{u.name_bn} · {u.name_en}{idx.activeOf(u.id).length ? ' ●' : ''}</option>)}</select><Err k="upazila_id" />
            <p className="mt-1 text-xs text-ink/40">● = already has an active representative</p></div>
          <div><label className="label">Status</label>
            <select className="field" value={form.status} onChange={(e) => set('status', e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>

          <div><label className="label">Joining date</label><input type="date" className="field" value={form.joining_date} onChange={(e) => set('joining_date', e.target.value)} /></div>
          <div><label className="label">Address</label><input className="field" value={form.address} onChange={(e) => set('address', e.target.value)} maxLength={200} /></div>
          <div className="sm:col-span-2"><label className="label">Short bio</label><textarea rows={3} className="field" value={form.bio} onChange={(e) => set('bio', e.target.value)} maxLength={500} /></div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-5">
          {orig ? <button type="button" onClick={() => setAskDelete(true)} className="flex items-center gap-1 text-sm font-bold text-flare"><Trash2 size={16} /> Delete</button> : <span />}
          <div className="flex gap-2">
            <Link to="/admin/representatives/list" className="btn-ghost">Cancel</Link>
            <button disabled={saving} className="btn-volt">{saving ? <Spinner size={16} /> : 'Save Representative'}</button>
          </div>
        </div>
      </div>

      {/* reassign / conflict confirmation */}
      <Modal open={!!confirm} onClose={() => setConfirm(null)} title={confirm?.others?.length ? 'Area already covered' : 'Move representative?'}>
        {confirm?.moved && (
          <p className="flex flex-wrap items-center gap-2 text-sm"><b>{place(fromRow)}</b> <ArrowRight size={15} /> <b>{place(toRow)}</b></p>
        )}
        {confirm?.others?.length > 0 && (
          <p className="mt-3 rounded-xl bg-volt/30 p-3 text-sm">
            <b>{confirm.others.map((o) => o.name).join(', ')}</b> is already the active representative for {place(toRow)}. Only {NETWORK.maxActivePerUpazila} active representative{NETWORK.maxActivePerUpazila > 1 ? 's are' : ' is'} allowed per upazila.
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button onClick={() => setConfirm(null)} className="btn-ghost text-xs">Cancel</button>
          {confirm?.others?.length > 0 && <button onClick={() => { set('status', 'inactive'); setConfirm(null) }} className="btn-ghost text-xs">Save as Inactive instead</button>}
          <button onClick={() => doSave(confirm?.others || [])} className="btn-ink text-xs">{confirm?.others?.length ? 'Replace & save' : 'Confirm & save'}</button>
        </div>
      </Modal>

      <Confirm open={askDelete} onClose={() => setAskDelete(false)} title="Delete representative?" message="This removes them from the website. You can set them to Inactive instead."
        onConfirm={async () => { try { await deleteRepresentative(orig.id); toast.success('Deleted.'); nav('/admin/representatives/list') } catch (e) { toast.error(e.message) } }} />
    </form>
  )
}
