/* Admin → Representatives → All / Active / Inactive. Edit, deactivate, delete. */
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Pencil, Trash2, Power, Search } from 'lucide-react'
import { AdminHeader, Confirm } from '../../../components/admin/kit'
import { PageLoader, EmptyState } from '../../../components/ui'
import { useToast } from '../../../context/ToastContext'
import { NETWORK } from '../../../config/site'
import { useNetwork } from '../lib/hooks'
import { rowFor, norm, digitsOnly } from '../lib/logic'
import { deleteRepresentative, setRepStatus } from '../lib/service'
import { Avatar } from '../components/RepCard'

export default function RepList() {
  const toast = useToast()
  const { loading, idx, reload } = useNetwork()
  const [sp, setSp] = useSearchParams()
  const status = sp.get('status') || 'all'
  const [q, setQ] = useState('')
  const [del, setDel] = useState(null)
  const [toggle, setToggle] = useState(null)

  const rows = useMemo(() => {
    if (!idx) return []
    const t = norm(q)
    return idx.reps
      .filter((r) => status === 'all' || r.status === status)
      .map((r) => ({ rep: r, area: idx.upaById.get(r.upazila_id) ? rowFor(idx, idx.upaById.get(r.upazila_id)) : null }))
      .filter(({ rep, area }) => !t || norm(`${rep.name} ${rep.mobile} ${digitsOnly(rep.mobile)} ${area?.upazila.name_en || ''} ${area?.upazila.name_bn || ''} ${area?.district?.name_en || ''}`).includes(t))
      .sort((a, b) => (b.rep.updatedAt || 0) - (a.rep.updatedAt || 0))
  }, [idx, status, q])

  if (loading) return <PageLoader />

  async function flip(rep) {
    const next = rep.status === 'active' ? 'inactive' : 'active'
    try { await setRepStatus(rep.id, next); toast.success(next === 'active' ? 'Representative activated.' : 'Representative deactivated.'); await reload() }
    catch (e) { toast.error(e.message) }
  }
  // activating a 2nd person in a full upazila → warn first
  function askFlip(rep) {
    if (rep.status === 'inactive') {
      const others = idx.activeOf(rep.upazila_id).filter((r) => r.id !== rep.id)
      if (others.length >= NETWORK.maxActivePerUpazila) return setToggle({ rep, others })
    }
    flip(rep)
  }

  return (
    <div>
      <AdminHeader title="Representatives" subtitle={`${rows.length} shown`} action={<Link to="/admin/representatives/new" className="btn-volt">Add Representative</Link>} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {['all', 'active', 'inactive'].map((s) => (
          <button key={s} onClick={() => setSp(s === 'all' ? {} : { status: s })} className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase ${status === s ? 'bg-ink text-paper' : 'bg-white text-ink/60'}`}>{s}</button>
        ))}
        <div className="relative ml-auto w-full sm:w-72"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, mobile, area" className="field !py-2.5 !pl-9" /></div>
      </div>

      {rows.length === 0 ? <EmptyState title="No representatives yet" hint="Add the first one, or open Vacant Areas to pick a place." /> : (
        <div className="space-y-2">
          {rows.map(({ rep, area }) => (
            <div key={rep.id} className="card flex flex-wrap items-center gap-3 p-3 sm:p-4">
              <Avatar rep={rep} size={52} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{rep.name} <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${rep.status === 'active' ? 'bg-volt text-ink' : 'bg-ink/10 text-ink/50'}`}>{rep.status}</span></p>
                <p className="truncate text-sm text-ink/60">{area ? `${area.upazila.name_en}, ${area.district.name_en}, ${area.division.name_en}` : 'Area missing or hidden'} · {rep.mobile}</p>
              </div>
              <div className="flex gap-1">
                <Link to={`/admin/representatives/${rep.id}/edit`} className="rounded-lg p-2 hover:bg-chalk" title="Edit"><Pencil size={17} /></Link>
                <button onClick={() => askFlip(rep)} className="rounded-lg p-2 hover:bg-chalk" title={rep.status === 'active' ? 'Deactivate' : 'Activate'}><Power size={17} /></button>
                <button onClick={() => setDel(rep)} className="rounded-lg p-2 text-flare hover:bg-flare/10" title="Delete"><Trash2 size={17} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Confirm open={!!del} onClose={() => setDel(null)} title="Delete representative?" message={`${del?.name} will be removed from the website. This cannot be undone. (You can deactivate instead.)`}
        onConfirm={async () => { try { await deleteRepresentative(del.id); toast.success('Deleted.'); setDel(null); await reload() } catch (e) { toast.error(e.message) } }} />
      <Confirm open={!!toggle} onClose={() => setToggle(null)} confirmLabel="Replace" title="This area already has an active representative"
        message={toggle ? `${toggle.others.map((o) => o.name).join(', ')} is already the active representative here (limit: ${NETWORK.maxActivePerUpazila}). Activating ${toggle.rep.name} will deactivate them.` : ''}
        onConfirm={async () => { const { rep, others } = toggle; setToggle(null); try { for (const o of others) await setRepStatus(o.id, 'inactive') } catch (e) { return toast.error(e.message) } await flip(rep) }} />
    </div>
  )
}
