/* Small building blocks: stats strip, coverage bars, filters. */
import { Search } from 'lucide-react'
import { districtsOfDivision, upazilasOfDistrict } from '../lib/logic'

export function StatsStrip({ stats }) {
  const items = [
    [stats.divisions, 'Divisions', 'বিভাগ'],
    [stats.districts, 'Districts', 'জেলা'],
    [stats.upazilas, 'Upazilas', 'উপজেলা'],
    [stats.activeReps, 'Active Representatives', 'সক্রিয় প্রতিনিধি'],
  ]
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(([n, en, bn]) => (
        <div key={en} className="rounded-2xl bg-ink p-5 text-paper">
          <p className="font-display text-4xl font-black text-volt">{n}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide">{en}</p>
          <p className="text-xs text-paper/50">{bn}</p>
        </div>
      ))}
    </div>
  )
}

export function CoverageBars({ rows, onPick }) {
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <button key={r.division.id} onClick={() => onPick?.(r.division)} className="block w-full text-left">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-bold">{r.division.name_en} <span className="font-normal text-ink/40">{r.division.name_bn}</span></span>
            <span className="font-bold">{r.pct}% <span className="font-normal text-ink/40">({r.covered}/{r.total})</span></span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-volt-dim transition-all duration-700" style={{ width: `${r.pct}%` }} /></div>
        </button>
      ))}
    </div>
  )
}

const Sel = ({ label, value, onChange, children, disabled }) => (
  <label className="block">
    <span className="label">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="field disabled:opacity-50">{children}</select>
  </label>
)

// Division → District → Upazila → Status (each list depends on the one before)
export function AreaFilters({ idx, f, setF, onSearch }) {
  const diss = f.divisionId ? districtsOfDivision(idx, f.divisionId) : []
  const upas = f.districtId ? upazilasOfDistrict(idx, f.districtId) : []
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Sel label="Division" value={f.divisionId} onChange={(v) => setF({ ...f, divisionId: v, districtId: '', upazilaId: '' })}>
        <option value="">All divisions</option>
        {idx.divs.map((d) => <option key={d.id} value={d.id}>{d.name_bn} · {d.name_en}</option>)}
      </Sel>
      <Sel label="District" value={f.districtId} disabled={!f.divisionId} onChange={(v) => setF({ ...f, districtId: v, upazilaId: '' })}>
        <option value="">All districts</option>
        {diss.map((d) => <option key={d.id} value={d.id}>{d.name_bn} · {d.name_en}</option>)}
      </Sel>
      <Sel label="Upazila" value={f.upazilaId} disabled={!f.districtId} onChange={(v) => setF({ ...f, upazilaId: v })}>
        <option value="">All upazilas</option>
        {upas.map((u) => <option key={u.id} value={u.id}>{u.name_bn} · {u.name_en}</option>)}
      </Sel>
      <Sel label="Status" value={f.status} onChange={(v) => setF({ ...f, status: v })}>
        <option value="all">All</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="vacant">Vacant</option>
      </Sel>
      <div className="flex items-end"><button onClick={onSearch} className="btn-ink w-full"><Search size={16} /> Search</button></div>
    </div>
  )
}
