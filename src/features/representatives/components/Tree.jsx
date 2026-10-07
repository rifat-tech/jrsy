/* =====================================================================
 *  THE TREE:  SPORTY → Division → District → Upazila → Representative
 *  Only divisions show at first. Click to open the next level.
 *  Works as stacked cards on phones (no sideways scrolling).
 * ===================================================================== */
import { ChevronDown, MapPin } from 'lucide-react'
import { NETWORK } from '../../../config/site'
import { districtsOfDivision, upazilasOfDistrict, upazilasOfDivision } from '../lib/logic'
import { RepCardWide, VacantCard } from './RepCard'

// smooth open / close (no extra library)
export function Collapse({ open, children }) {
  return (
    <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
      <div className="overflow-hidden">{open ? children : null}</div>
    </div>
  )
}

function Pct({ pct }) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-volt-dim" style={{ width: `${pct}%` }} /></div>
      <span className="w-9 text-right text-[11px] font-bold text-ink/50">{pct}%</span>
    </div>
  )
}

export default function NetworkTree({ idx, open, setOpen, onProfile }) {
  // open = { division, district, upazila } (ids or '')
  const toggle = (level, id) => {
    const next = { ...open }
    if (level === 'division') { next.division = open.division === id ? '' : id; next.district = ''; next.upazila = '' }
    if (level === 'district') { next.district = open.district === id ? '' : id; next.upazila = '' }
    if (level === 'upazila') next.upazila = open.upazila === id ? '' : id
    setOpen(next)
  }

  return (
    <div className="space-y-3">
      {idx.divs.map((div) => {
        const isDiv = open.division === div.id
        const dcov = idx.coverage(upazilasOfDivision(idx, div.id))
        return (
          <div key={div.id} className={`card overflow-hidden transition ${isDiv ? 'ring-2 ring-ink' : ''}`}>
            <button onClick={() => toggle('division', div.id)} className="w-full p-4 text-left sm:p-5" aria-expanded={isDiv}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-lg font-black sm:text-xl">{div.name_bn} <span className="text-ink/30">·</span> <span className="text-base font-bold text-ink/60">{div.name_en}</span></p>
                  <p className="text-xs text-ink/50">{districtsOfDivision(idx, div.id).length} districts · {dcov.total} upazilas · {dcov.covered} covered</p>
                </div>
                <ChevronDown className={`shrink-0 transition ${isDiv ? 'rotate-180' : ''}`} />
              </div>
              <Pct pct={dcov.pct} />
            </button>

            <Collapse open={isDiv}>
              <div className="space-y-2 border-t border-ink/10 bg-chalk/50 p-3 sm:p-4">
                {districtsOfDivision(idx, div.id).map((dis) => {
                  const isDis = open.district === dis.id
                  const upas = upazilasOfDistrict(idx, dis.id)
                  const cov = idx.coverage(upas)
                  return (
                    <div key={dis.id} className="overflow-hidden rounded-xl border border-ink/10 bg-white">
                      <button onClick={() => toggle('district', dis.id)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" aria-expanded={isDis}>
                        <div className="min-w-0">
                          <p className="truncate font-bold">{dis.name_bn} জেলা <span className="font-medium text-ink/50">· {dis.name_en}</span></p>
                          <p className="text-xs text-ink/50">{cov.covered}/{cov.total} upazilas covered</p>
                        </div>
                        <ChevronDown size={18} className={`shrink-0 transition ${isDis ? 'rotate-180' : ''}`} />
                      </button>

                      <Collapse open={isDis}>
                        <ul className="space-y-1 border-t border-ink/10 p-2">
                          {upas.map((u) => {
                            const isUpa = open.upazila === u.id
                            const active = idx.activeOf(u.id)
                            const place = `${u.name_en}, ${dis.name_en}`
                            return (
                              <li key={u.id} id={`upa-${u.id}`}>
                                <button onClick={() => toggle('upazila', u.id)} className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${isUpa ? 'bg-ink text-paper' : 'hover:bg-chalk'}`} aria-expanded={isUpa}>
                                  <span className="flex min-w-0 items-center gap-2"><MapPin size={14} className="shrink-0 opacity-50" /><span className="truncate font-semibold">{u.name_bn} <span className="font-normal opacity-60">· {u.name_en}</span></span></span>
                                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${active.length ? 'bg-volt text-ink' : isUpa ? 'bg-paper/15 text-paper' : 'bg-ink/10 text-ink/50'}`}>{active.length ? 'Available' : 'Vacant'}</span>
                                </button>
                                <Collapse open={isUpa}>
                                  <div className="space-y-3 p-2 pt-3">
                                    {active.length
                                      ? active.map((r) => <RepCardWide key={r.id} rep={r} place={place} onOpen={() => onProfile(r, place)} />)
                                      : <VacantCard place={place} />}
                                  </div>
                                </Collapse>
                              </li>
                            )
                          })}
                        </ul>
                      </Collapse>
                    </div>
                  )
                })}
              </div>
            </Collapse>
          </div>
        )
      })}
      <p className="pt-1 text-center text-xs text-ink/40">{NETWORK.publicLabel}s are shown for every upazila. Tap to open each level.</p>
    </div>
  )
}
