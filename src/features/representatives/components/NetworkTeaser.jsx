/* Homepage block (no database call, so the homepage stays fast). Edit the wording in src/config/site.js */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPinned } from 'lucide-react'
import { NETWORK } from '../../../config/site'

export default function NetworkTeaser() {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  return (
    <section className="container-jrsy py-10 sm:py-14">
      <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-paper sm:p-10">
        <MapPinned className="absolute -right-6 -top-6 h-48 w-48 text-paper/5" />
        <span className="kicker !text-volt">🇧🇩 {NETWORK.titleBn}</span>
        <h2 className="mt-2 font-display text-3xl font-black italic tracking-tightest sm:text-5xl">{NETWORK.titleEn}</h2>
        <p className="mt-2 text-paper/80">{NETWORK.subtitleEn}</p>
        <p className="text-sm text-volt">{NETWORK.subtitleBn}</p>
        <form onSubmit={(e) => { e.preventDefault(); nav(`${NETWORK.basePath}${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`) }} className="mt-6 flex max-w-xl flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Division, District, Upazila or Representative" aria-label="Search your area" className="field !rounded-full !py-3.5 !pl-11 text-ink" />
          </div>
          <button className="btn-volt whitespace-nowrap">Find Representative</button>
        </form>
      </div>
    </section>
  )
}
