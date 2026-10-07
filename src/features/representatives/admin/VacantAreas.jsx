/* Admin → Vacant Areas : every upazila with no active representative (recruitment list). */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminHeader } from '../../../components/admin/kit'
import { PageLoader, EmptyState } from '../../../components/ui'
import { useNetwork } from '../lib/hooks'
import { searchAreas } from '../lib/logic'
import { AreaFilters } from '../components/Bits'

export default function VacantAreas() {
  const { loading, idx } = useNetwork()
  const [f, setF] = useState({ divisionId: '', districtId: '', upazilaId: '', status: 'vacant' })
  const [limit, setLimit] = useState(60)
  const rows = useMemo(() => (idx ? searchAreas(idx, '', { ...f, status: 'vacant' }) : []), [idx, f])
  if (loading) return <PageLoader />
  return (
    <div>
      <AdminHeader title="Vacant Representative Areas" subtitle={`${rows.length} upazilas need a representative`} />
      <div className="card mb-4 p-4"><AreaFilters idx={idx} f={f} setF={(v) => { setF(v); setLimit(60) }} onSearch={() => {}} /></div>
      {rows.length === 0 ? <EmptyState title="No vacant areas 🎉" hint="Every upazila here has an active representative." /> : (
        <div className="space-y-2">
          {rows.slice(0, limit).map((r, i) => (
            <div key={r.upazila.id} className="card flex items-center justify-between gap-3 p-3 sm:px-5">
              <p className="min-w-0 truncate text-sm"><span className="mr-2 text-ink/30">{i + 1}.</span><b>{r.upazila.name_bn}</b>, {r.district.name_bn} <span className="text-ink/40">· {r.upazila.name_en}, {r.district.name_en}</span></p>
              <Link to={`/admin/representatives/new?upazila=${r.upazila.id}`} className="btn-volt shrink-0 px-4 py-2 text-xs">Assign</Link>
            </div>
          ))}
          {rows.length > limit && <div className="pt-2 text-center"><button onClick={() => setLimit(limit + 60)} className="btn-ghost">Show more</button></div>}
        </div>
      )}
    </div>
  )
}
