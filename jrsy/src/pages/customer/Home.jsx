import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react'
import { api } from '../../services/db'
import ProductCard from '../../components/customer/ProductCard'
import { Stars, PageLoader } from '../../components/ui'

function Row({ eyebrow, title, to, children }) {
  return (
    <section className="container-jrsy py-12 sm:py-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          {eyebrow && <span className="kicker">{eyebrow}</span>}
          <h2 className="mt-1 text-3xl font-black sm:text-4xl">{title}</h2>
        </div>
        {to && (
          <Link to={to} className="group hidden shrink-0 items-center gap-1 text-sm font-bold uppercase tracking-wide text-ink/60 hover:text-ink sm:inline-flex">
            View all <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

function Grid({ products }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}

export default function Home() {
  const [products, setProducts] = useState(null)
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    api.listProducts().then((p) => setProducts(p.filter((x) => x.status === 'active')))
    api.listReviews().then((r) => setReviews(r.filter((x) => x.approved).slice(0, 3)))
  }, [])

  if (!products) return <PageLoader label="Loading store" />

  const featured = products.filter((p) => p.featured).slice(0, 4)
  const news = products.filter((p) => p.newArrival).slice(0, 4)
  const football = products.filter((p) => ['club-jerseys', 'national-teams', 'retro'].includes(p.category)).slice(0, 4)
  const cricket = products.filter((p) => ['cricket', 'franchise'].includes(p.category)).slice(0, 4)
  const best = products.filter((p) => p.bestSeller).slice(0, 4)

  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="pointer-events-none absolute -right-24 top-1/2 hidden -translate-y-1/2 select-none text-[42vw] font-black italic leading-none text-white/[0.04] lg:block">
          10
        </div>
        <div className="container-jrsy grid items-center gap-8 py-14 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="kicker text-volt">
              <Sparkles size={14} /> New Season 2025/26
            </span>
            <h1 className="mt-4 text-6xl font-black leading-[0.85] sm:text-7xl lg:text-8xl">
              PLAY.
              <br />
              WEAR.
              <br />
              <span className="text-volt">REPEAT.</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-paper/60">
              Match-grade football & cricket jerseys, custom kits with your name and number, and fan gear built for the terraces and the streets.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-volt">Shop now <ArrowRight size={16} /></Link>
              <Link to="/custom" className="btn-ghost border-paper/25 text-paper hover:border-paper">Build a custom kit</Link>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute inset-0 m-auto h-64 w-64 rounded-full bg-volt/20 blur-3xl" />
            <img src="/products/kit-goodvibes.jpg" alt="JRSY custom football kit" className="relative w-[20rem] rounded-3xl object-cover shadow-2xl ring-1 ring-white/10 sm:w-[24rem] animate-float" />
            <span className="absolute -left-2 bottom-4 rounded-full bg-volt px-3 py-1.5 text-xs font-black uppercase tracking-wide text-ink shadow-lg sm:left-2">Fully customisable</span>
          </div>
        </div>

        {/* trust bar */}
        <div className="border-t border-paper/10">
          <div className="container-jrsy grid grid-cols-2 gap-4 py-5 text-xs font-bold uppercase tracking-wide text-paper/70 sm:grid-cols-4">
            {[[Truck, 'Fast delivery'], [ShieldCheck, 'Authentic quality'], [RefreshCw, 'Easy exchange'], [Sparkles, 'Custom kits']].map(([Icon, t]) => (
              <div key={t} className="flex items-center gap-2"><Icon size={16} className="text-volt" /> {t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FEATURED ---------- */}
      <Row eyebrow="Handpicked" title="Featured Jerseys" to="/shop"><Grid products={featured} /></Row>

      {/* ---------- COLLECTION SPLIT ---------- */}
      <section className="container-jrsy grid gap-4 py-6 sm:gap-6 md:grid-cols-2">
        {[
          { to: '/football', label: 'Football', copy: 'Club, national & retro kits', img: '/products/jersey-blue-fade.jpg' },
          { to: '/cricket', label: 'Cricket', copy: 'ODI, T20 & franchise jerseys', img: '/products/trousers-cricket.jpg' },
        ].map((c) => (
          <Link key={c.to} to={c.to} className="group relative flex items-end overflow-hidden rounded-3xl bg-ink p-8 text-paper min-h-[240px]">
            <img src={c.img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 transition duration-500 group-hover:scale-105 group-hover:opacity-50" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
            <div className="relative">
              <h3 className="text-4xl font-black">{c.label}</h3>
              <p className="mt-1 text-paper/60">{c.copy}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold uppercase text-volt">Shop {c.label} <ArrowRight size={15} /></span>
            </div>
          </Link>
        ))}
      </section>

      {/* ---------- NEW ARRIVALS ---------- */}
      <Row eyebrow="Fresh drops" title="New Arrivals" to="/shop?filter=new"><Grid products={news} /></Row>

      {/* ---------- CUSTOM PROMO ---------- */}
      <section className="container-jrsy py-8">
        <div className="relative overflow-hidden rounded-3xl bg-volt px-8 py-12 text-ink sm:px-12">
          <div className="relative max-w-lg">
            <span className="kicker">Your name. Your number.</span>
            <h2 className="mt-2 text-4xl font-black sm:text-5xl">Build your custom kit</h2>
            <p className="mt-3 text-ink/70">Pick a base jersey, add printing, upload your team crest and order in minutes.</p>
            <Link to="/custom" className="btn-ink mt-6">Start designing <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ---------- FOOTBALL ---------- */}
      <Row eyebrow="On the pitch" title="Football Collection" to="/football"><Grid products={football} /></Row>

      {/* ---------- CRICKET ---------- */}
      <Row eyebrow="Match day" title="Cricket Collection" to="/cricket"><Grid products={cricket} /></Row>

      {/* ---------- BEST SELLERS ---------- */}
      <Row eyebrow="Fan favourites" title="Best Sellers" to="/shop?filter=best"><Grid products={best} /></Row>

      {/* ---------- REVIEWS ---------- */}
      {reviews.length > 0 && (
        <section className="bg-chalk py-16">
          <div className="container-jrsy">
            <span className="kicker">Word on the terraces</span>
            <h2 className="mt-1 text-3xl font-black sm:text-4xl">What fans are saying</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {reviews.map((r) => (
                <div key={r.id} className="card p-6">
                  <Stars value={r.rating} />
                  <p className="mt-3 leading-relaxed text-ink/80">“{r.comment}”</p>
                  <p className="mt-4 text-sm font-bold">{r.customerName}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- BRAND STORY ---------- */}
      <section className="container-jrsy grid items-center gap-10 py-16 md:grid-cols-2">
        <div>
          <span className="kicker">The JRSY story</span>
          <h2 className="mt-1 text-4xl font-black">Made for fans, worn everywhere.</h2>
          <p className="mt-4 leading-relaxed text-ink/60">
            JRSY started with one idea — that a jersey should feel as good in the stands as it does on the pitch. Every kit is built from breathable performance knit, tailored for an athletic fit, and finished with detailing that lasts season after season.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[['12k+', 'Kits shipped'], ['4.8', 'Avg rating'], ['48h', 'Custom turnaround']].map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-3xl font-black">{n}</p>
                <p className="text-xs uppercase tracking-wide text-ink/50">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <img src="/products/kit-crimson-navy.jpg" alt="JRSY kit" className="rounded-2xl bg-chalk object-cover" />
          <img src="/products/jersey-ipsum-red.jpg" alt="JRSY kit" className="mt-8 rounded-2xl bg-chalk object-cover" />
        </div>
      </section>
    </div>
  )
}
