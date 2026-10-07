/* Admin → Administrative Areas : fix a spelling, hide an area, or add a missing one. */
import { useMemo, useState } from 'react'
import { Pencil, Plus, Eye, EyeOff } from 'lucide-react'
import { AdminHeader } from '../../../components/admin/kit'
import { Modal, PageLoader } from '../../../components/ui'
import { useToast } from '../../../context/ToastContext'
import { useNetwork } from '../lib/hooks'
import { norm, slugify } from '../lib/logic'
import { saveArea } from '../lib/service'

const KINDS = [['divisions', 'Divisions'], ['districts', 'Districts'], ['upazilas', 'Upazilas']]

export default function AreasAdmin() {
  const toast = useToast()
  const { loading, raw, reload } = useNetwork()
  const [kind, setKind] = useState('divisions')
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState(null)
  const [limit, setLimit] = useState(80)

  const list = useMemo(() => {
    if (!raw) return []
    const t = norm(q)
    return raw[kind].filter((a) => !t || norm(`${a.name_bn} ${a.name_en}`).includes(t)).sort((a, b) => (a.name_en || '').localeCompare(b.name_en || ''))
  }, [raw, kind, q])
  if (loading) return <PageLoader />
  if (!raw) return <p className="py-10 text-center text-ink/50">Could not load the areas. Check your connection and refresh.</p>

  const nameOf = (list2, id) => raw[list2].find((x) => x.id === id)?.name_en || ''
  const blank = { id: '', name_bn: '', name_en: '', status: 'active', division_id: '', district_id: '', isNew: true }

  async function save() {
    try {
      const e = edit
      const rec = { ...e }
      delete rec.isNew
      if (e.isNew) {
        if (kind !== 'divisions' && !e.division_id) throw new Error('Choose a division.')
        if (kind === 'upazilas' && !e.district_id) throw new Error('Choose a district.')
        const pre = { divisions: 'div', districts: 'dis', upazilas: 'upa' }[kind]
        rec.id = `${pre}_x${Date.now().toString(36)}`
        rec.slug = slugify(e.name_en)
        if (kind === 'divisions') { delete rec.division_id; delete rec.district_id }
        if (kind === 'districts') delete rec.district_id
      }
      await saveArea(kind, rec)
      toast.success('Saved.'); setEdit(null); await reload()
    } catch (err) { toast.error(err.message) }
  }

  const diss = raw.districts.filter((d) => d.division_id === edit?.division_id)

  return (
    <div>
      <AdminHeader title="Administrative Areas" subtitle="Hidden areas disappear from the public website. Names can be corrected here." action={<button onClick={() => setEdit({ ...blank })} className="btn-volt"><Plus size={16} /> Add {kind.slice(0, -1)}</button>} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {KINDS.map(([k, label]) => <button key={k} onClick={() => { setKind(k); setLimit(80) }} className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase ${kind === k ? 'bg-ink text-paper' : 'bg-white text-ink/60'}`}>{label} ({raw[k].length})</button>)}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="field ml-auto !w-full !py-2.5 sm:!w-64" />
      </div>
      <div className="space-y-1.5">
        {list.slice(0, limit).map((a) => (
          <div key={a.id} className={`card flex items-center gap-3 px-4 py-2.5 ${a.status === 'inactive' ? 'opacity-50' : ''}`}>
            <p className="min-w-0 flex-1 truncate text-sm"><b>{a.name_bn}</b> <span className="text-ink/50">· {a.name_en}</span>
              {a.district_id && <span className="text-ink/30"> — {nameOf('districts', a.district_id)}</span>}
              {!a.district_id && a.division_id && <span className="text-ink/30"> — {nameOf('divisions', a.division_id)}</span>}</p>
            <button onClick={() => saveArea(kind, { ...a, status: a.status === 'inactive' ? 'active' : 'inactive' }).then(reload)} className="rounded-lg p-2 hover:bg-chalk" title={a.status === 'inactive' ? 'Show on website' : 'Hide from website'}>{a.status === 'inactive' ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            <button onClick={() => setEdit({ ...a })} className="rounded-lg p-2 hover:bg-chalk" title="Edit names"><Pencil size={16} /></button>
          </div>
        ))}
        {list.length > limit && <div className="pt-2 text-center"><button onClick={() => setLimit(limit + 80)} className="btn-ghost">Show more</button></div>}
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.isNew ? `Add ${kind.slice(0, -1)}` : 'Edit names'}>
        {edit && (
          <div className="space-y-3">
            {edit.isNew && kind !== 'divisions' && (
              <div><label className="label">Division</label>
                <select className="field" value={edit.division_id} onChange={(e) => setEdit({ ...edit, division_id: e.target.value, district_id: '' })}><option value="">Select</option>{raw.divisions.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}</select></div>
            )}
            {edit.isNew && kind === 'upazilas' && (
              <div><label className="label">District</label>
                <select className="field" value={edit.district_id} onChange={(e) => setEdit({ ...edit, district_id: e.target.value })}><option value="">Select</option>{diss.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}</select></div>
            )}
            <div><label className="label">Name (বাংলা)</label><input className="field" value={edit.name_bn} onChange={(e) => setEdit({ ...edit, name_bn: e.target.value })} /></div>
            <div><label className="label">Name (English)</label><input className="field" value={edit.name_en} onChange={(e) => setEdit({ ...edit, name_en: e.target.value })} /></div>
            <p className="text-xs text-ink/40">The web address (slug) stays the same when you rename, so links keep working.</p>
            <div className="flex justify-end gap-2 pt-2"><button onClick={() => setEdit(null)} className="btn-ghost text-xs">Cancel</button><button onClick={save} className="btn-ink text-xs">Save</button></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
