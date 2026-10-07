/* Admin → Representatives → Dashboard. All numbers are calculated live from the database. */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Map, MapPinned, Building2, UserCheck, MapPinOff, UserX, DatabaseZap } from 'lucide-react'
import { AdminHeader, StatCard, Panel } from '../../../components/admin/kit'
import { PageLoader } from '../../../components/ui'
import { useToast } from '../../../context/ToastContext'
import { useNetwork } from '../lib/hooks'
import { computeStats, coverageByDivision } from '../lib/logic'
import { seedLocations, EXPECTED } from '../lib/service'
import { CoverageBars } from '../components/Bits'

export default function RepDashboard() {
  const toast = useToast()
  const { loading, error, idx, reload } = useNetwork()
  const [busy, setBusy] = useState(false)
  if (loading) return <PageLoader />

  async function importNow() {
    setBusy(true)
    try {
      const r = await seedLocations()
      toast.success(r.added ? `Imported ${r.added} locations.` : 'Everything was already imported.')
      await reload()
    } catch (e) { toast.error(e.message) } finally { setBusy(false) }
  }

  const s = idx ? computeStats(idx) : null
  const missing = !s || s.divisions < EXPECTED.divisions || s.districts < EXPECTED.districts || s.upazilas < EXPECTED.upazilas - 20
  return (
    <div>
      <AdminHeader title="Representative Network" subtitle="Live numbers from your database" />
      {error && <p className="mb-4 rounded-xl bg-flare/10 p-3 text-sm text-flare">{error}</p>}

      {missing && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-volt/30 p-4">
          <div className="text-sm">
            <b>{s && s.upazilas ? 'Some Bangladesh locations are missing.' : 'Bangladesh locations are not imported yet.'}</b>
            <br />Now: {s?.divisions || 0} divisions · {s?.districts || 0} districts · {s?.upazilas || 0} upazilas (expected about {EXPECTED.divisions} / {EXPECTED.districts} / {EXPECTED.upazilas}).
          </div>
          <button onClick={importNow} disabled={busy} className="btn-ink"><DatabaseZap size={16} /> {busy ? 'Importing…' : 'Import Bangladesh locations'}</button>
        </div>
      )}

      {s && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="Total Divisions" value={s.divisions} icon={Map} />
            <StatCard label="Total Districts" value={s.districts} icon={Building2} />
            <StatCard label="Total Upazilas" value={s.upazilas} icon={MapPinned} />
            <StatCard label="Active Representatives" value={s.activeReps} icon={UserCheck} tone="volt" />
            <StatCard label="Vacant Areas" value={s.vacant} icon={MapPinOff} tone="flare" />
            <StatCard label="Inactive Representatives" value={s.inactiveReps} icon={UserX} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Panel title="Representative Coverage">
              <p className="text-sm text-ink/60">Covered upazilas: <b>{s.covered}</b> · Total upazilas: <b>{s.upazilas}</b></p>
              <div className="mt-3 h-4 overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-volt-dim transition-all" style={{ width: `${s.coveragePct}%` }} /></div>
              <p className="mt-2 font-display text-3xl font-black">{s.coveragePct}%</p>
              <Link to="/admin/representatives/vacant" className="mt-2 inline-block text-xs font-bold uppercase tracking-wide underline">See vacant areas</Link>
            </Panel>
            <Panel title="Coverage by Division"><CoverageBars rows={coverageByDivision(idx)} /></Panel>
          </div>
        </>
      )}
    </div>
  )
}
