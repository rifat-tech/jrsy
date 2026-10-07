/* =====================================================================
 *  PUBLIC PAGE  →  /sporty-representatives   (+ /division/district/upazila)
 *  Layout order: hero+search → numbers → filters → results OR tree → coverage.
 *  All wording comes from  src/config/site.js  (NETWORK section).
 * ===================================================================== */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Search, SearchX } from 'lucide-react'
import { NETWORK } from '../../../config/site'
import { Spinner, EmptyState } from '../../../components/ui'
import { useNetwork, useDocumentMeta } from '../lib/hooks'
import { areaUrl, computeStats, coverageByDivision, searchAreas } from '../lib/logic'
import { StatsStrip, CoverageBars, AreaFilters } from '../components/Bits'
import NetworkTree from '../components/Tree'
import { RepCard, VacantCard, RepProfileModal } from '../components/RepCard'

const NO_FILTERS = { divisionId: '', districtId: '', upazilaId: '', status: 'all' }
const PAGE = 24

export default function NetworkPage() {
  const params = useParams()
  const [sp] = useSearchParams()
  const { loading, error, idx } = useNetwork()
  const [q, setQ] = useState(sp.get('q') || '')
  const [f, setF] = useState(NO_FILTERS)
  const [open, setOpen] = useState({ division: '', district: '', upazila: '' })
  const [profile, setProfile] = useState(null)
  const [limit, setLimit] = useState(PAGE)
  const resultsRef = useRef(null)
  const booted = useRef(false)

  /* open the tree from the address, e.g. /sporty-representatives/dhaka/dhaka/savar */
  useEffect(() => {
    if (!idx || booted.current) return
    booted.current = true
    const [ds, dis, us] = (params['*'] || '').split('/').filter(Boolean)
    const div = idx.divs.find((d) => d.slug === ds)
    const district = div && idx.diss.find((d) => d.division_id === div.id && d.slug === dis)
    const upa = district && idx.upas.find((u) => u.district_id === district.id && u.slug === us)
    if (div) {
      setOpen({ division: div.id, district: district?.id || '', upazila: upa?.id || '' })
      if (upa) setTimeout(() => document.getElementById(`upa-${upa.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 450)
    }
  }, [idx, params])

  /* keep the address bar in step with the tree (nice for sharing, no page reload) */
  const here = useMemo(() => {
    if (!idx) return null
    const div = idx.divById.get(open.division), dis = idx.disById.get(open.district), upa = idx.upaById.get(open.upazila)
    return { div, dis, upa }
  }, [idx, open])
  useEffect(() => {
    if (!here || !booted.current) return
    const url = areaUrl(here.div, here.dis, here.upa)
    if (window.location.pathname !== url) window.history.replaceState(null, '', url)
  }, [here])

  /* SEO title + description */
  const place = here?.upa ? `${here.upa.name_en}, ${here.dis.name_en}` : here?.dis ? `${here.dis.name_en}, ${here.div.name_en}` : here?.div ? here.div.name_en : ''
  useDocumentMeta(
    place ? `Sporty Representative in ${place}` : `${NETWORK.titleEn} | Find your local Sporty representative`,
    place
      ? `Find the official Sporty representative for ${place}. Contact your local Sporty representative for sports jerseys, T-shirts, polo shirts and custom sportswear.`
      : 'Find the official Sporty representative in your Division, District or Upazila anywhere in Bangladesh. Sports jerseys, T-shirts, polo shirts and custom sportswear.'
  )

  const stats = useMemo(() => (idx ? computeStats(idx) : null), [idx])
  const coverage = useMemo(() => (idx ? coverageByDivision(idx) : []), [idx])
  const filtering = q.trim() !== '' || f.divisionId || f.status !== 'all'
  const results = useMemo(() => (idx && filtering ? searchAreas(idx, q, f) : []), [idx, q, f, filtering])
  useEffect(() => setLimit(PAGE), [q, f])

  const goResults = () => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div>
      {/* ---------- HERO (shows instantly, does not wait for the database) ---------- */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="container-jrsy py-12 sm:py-16">
          <span className="kicker !text-volt">🇧🇩 {NETWORK.titleEn}</span>
          <h1 className="mt-3 font-display text-5xl font-black italic tracking-tightest sm:text-7xl">SPORTY</h1>
          <h2 className="mt-1 text-xl font-bold sm:text-3xl">Bangladesh Representative Network</h2>
          <p className="mt-3 max-w-2xl text-lg text-paper/80">{NETWORK.heroLineEn}</p>
          <p className="max-w-2xl text-paper/60">{NETWORK.heroLineBn}</p>
          <p className="mt-1 text-sm text-volt">{NETWORK.subtitleBn}</p>
          <form onSubmit={(e) => { e.preventDefault(); goResults() }} className="mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Division, District, Upazila or Representative" aria-label="Search your area or representative" className="field !rounded-full !py-3.5 !pl-11 text-ink" />
            </div>
            <button className="btn-volt whitespace-nowrap">Find Representative</button>
          </form>
        </div>
      </section>

      <div className="container-jrsy space-y-10 py-10">
        {loading && <div className="flex items-center justify-center gap-3 py-16 text-ink/50"><Spinner /> Loading the network…</div>}
        {error && <EmptyState icon={SearchX} title="Could not load the network" hint={error} />}
        {idx && idx.upas.length === 0 && (
          <EmptyState icon={SearchX} title="The representative network is being set up" hint="Please check back soon." />
        )}

        {idx && idx.upas.length > 0 && (
          <>
            <StatsStrip stats={stats} />

            <section ref={resultsRef} className="scroll-mt-24 space-y-5">
              <div>
                <h3 className="text-2xl font-black">Search your area or representative</h3>
                <p className="text-sm text-ink/50">You can type in বাংলা or English, or use the lists below.</p>
              </div>
              <AreaFilters idx={idx} f={f} setF={setF} onSearch={goResults} />
              {filtering && (
                <button onClick={() => { setQ(''); setF(NO_FILTERS) }} className="text-xs font-bold uppercase tracking-wide text-ink/50 underline">Clear search</button>
              )}

              {filtering ? (
                results.length === 0 ? (
                  <EmptyState icon={SearchX} title="No matching area found" hint="Try another spelling, a district name or a mobile number." />
                ) : (
                  <>
                    <p className="text-sm text-ink/50">{results.length} area{results.length > 1 ? 's' : ''} found</p>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {results.slice(0, limit).map((r) => {
                        const pl = `${r.upazila.name_en}, ${r.district.name_en}`
                        return (
                          <div key={r.upazila.id} className="flex flex-col gap-2">
                            <p className="text-xs text-ink/50">{r.division.name_bn} → {r.district.name_bn} জেলা → <b className="text-ink">{r.upazila.name_bn} উপজেলা</b></p>
                            <div className="flex-1 [&>*]:h-full">
                              {r.active.length
                                ? r.active.map((rep) => <RepCard key={rep.id} rep={rep} place={pl} onOpen={() => setProfile({ rep, place: pl })} />)
                                : <VacantCard place={pl} compact />}
                            </div>
                            <Link to={areaUrl(r.division, r.district, r.upazila)} className="text-center text-xs font-bold uppercase tracking-wide text-ink/50 hover:text-ink">Open page for {r.upazila.name_en}</Link>
                          </div>
                        )
                      })}
                    </div>
                    {results.length > limit && <div className="text-center"><button onClick={() => setLimit(limit + PAGE)} className="btn-ghost">Show more</button></div>}
                  </>
                )
              ) : (
                <>
                  <div className="pt-2"><h3 className="text-2xl font-black">Browse by area</h3><p className="text-sm text-ink/50">বিভাগ → জেলা → উপজেলা → প্রতিনিধি</p></div>
                  <NetworkTree idx={idx} open={open} setOpen={setOpen} onProfile={(rep, pl) => setProfile({ rep, place: pl })} />
                </>
              )}
            </section>

            <section className="card p-5 sm:p-7">
              <h3 className="text-2xl font-black">Sporty’s Nationwide Coverage</h3>
              <p className="mb-5 text-sm text-ink/50">{stats.covered} of {stats.upazilas} upazilas covered · {stats.coveragePct}%</p>
              <CoverageBars rows={coverage} onPick={(d) => { setQ(''); setF(NO_FILTERS); setOpen({ division: d.id, district: '', upazila: '' }); window.scrollTo({ top: resultsRef.current?.offsetTop || 0, behavior: 'smooth' }) }} />
            </section>
          </>
        )}
      </div>

      <RepProfileModal rep={profile?.rep} place={profile?.place} onClose={() => setProfile(null)} />
    </div>
  )
}
