import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react'
import { Logo } from '../ui'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../context/StoreContext'
import { api } from '../../services/db'
import { money, discountPct } from '../../utils/format'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/football', label: 'Football' },
  { to: '/cricket', label: 'Cricket' },
  { to: '/shop?category=accessories', label: 'Caps' },
  { to: '/custom', label: 'Custom Jersey' },
  { to: '/shop?filter=new', label: 'New Arrivals' },
  { to: '/shop?filter=best', label: 'Best Sellers' },
  { to: '/shop?filter=sale', label: 'Sale', accent: true },
]

export default function Header() {
  const nav = useNavigate()
  const { count } = useCart()
  const { user, isAdmin } = useAuth()
  const { wishlist } = useStore()
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!q.trim()) return setResults([])
    let live = true
    api.listProducts().then((all) => {
      if (!live) return
      const term = q.toLowerCase()
      setResults(
        all
          .filter(
            (p) =>
              p.status === 'active' &&
              (p.name.toLowerCase().includes(term) ||
                p.team?.toLowerCase().includes(term) ||
                p.sku?.toLowerCase().includes(term) ||
                p.category?.toLowerCase().includes(term))
          )
          .slice(0, 6)
      )
    })
    return () => (live = false)
  }, [q])

  function submitSearch(e) {
    e.preventDefault()
    if (!q.trim()) return
    setSearchOpen(false); setOpen(false)
    nav(`/shop?q=${encodeURIComponent(q.trim())}`)
    setQ('')
  }

  return (
    <header className={`sticky top-0 z-50 border-b transition ${scrolled ? 'border-ink/10 bg-paper/90 backdrop-blur' : 'border-transparent bg-paper'}`}>
      {/* announcement marquee */}
      <div className="overflow-hidden bg-ink py-1.5 text-paper">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex items-center text-[11px] font-bold uppercase tracking-[0.2em]">
              {['Free delivery over ৳3000', 'New season kits live', 'Custom jerseys — name & number', 'Play. Wear. Repeat.'].map((t) => (
                <span key={t} className="mx-6 inline-flex items-center gap-6">{t}<span className="text-volt">✦</span></span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="container-jrsy flex h-16 items-center gap-4">
        <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></button>
        <Logo />

        <nav className="ml-4 hidden items-center gap-6 lg:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.label}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `text-sm font-bold uppercase tracking-wide transition ${
                  n.accent ? 'text-flare hover:text-flare/80' : isActive ? 'text-ink' : 'text-ink/55 hover:text-ink'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          <button onClick={() => setSearchOpen((s) => !s)} className="rounded-full p-2 hover:bg-ink/5" aria-label="Search"><Search size={20} /></button>
          <Link to={user ? '/account' : '/login'} className="rounded-full p-2 hover:bg-ink/5" aria-label="Account"><User size={20} /></Link>
          <Link to="/account/wishlist" className="relative rounded-full p-2 hover:bg-ink/5" aria-label="Wishlist">
            <Heart size={20} />
            {wishlist.length > 0 && <Dot n={wishlist.length} />}
          </Link>
          <Link to="/cart" className="relative rounded-full p-2 hover:bg-ink/5" aria-label="Cart">
            <ShoppingBag size={20} />
            {count > 0 && <Dot n={count} accent />}
          </Link>
          {isAdmin && (
            <Link to="/admin" className="btn-ink hidden px-4 py-2 text-xs sm:inline-flex">Admin</Link>
          )}
        </div>
      </div>

      {/* search panel */}
      {searchOpen && (
        <div className="border-t border-ink/10 bg-paper">
          <div className="container-jrsy py-4">
            <form onSubmit={submitSearch} className="relative">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                autoFocus value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search jerseys, teams, SKU…"
                className="field pl-11 pr-10"
              />
              {q && (
                <button type="button" onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"><X size={18} /></button>
              )}
            </form>
            {q && (
              <div className="mt-3">
                {results.length === 0 ? (
                  <p className="py-4 text-center text-sm text-ink/50">No jerseys match “{q}”. Try a team or category.</p>
                ) : (
                  <ul className="divide-y divide-ink/5">
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link
                          to={`/product/${p.slug}`}
                          onClick={() => { setSearchOpen(false); setQ('') }}
                          className="flex items-center gap-3 py-2.5 hover:bg-ink/[0.03]"
                        >
                          <img src={p.images?.[0]} alt="" className="h-12 w-10 rounded-md object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{p.name}</p>
                            <p className="text-xs text-ink/50">{p.team} · {p.sku}</p>
                          </div>
                          <span className="text-sm font-bold">{money(p.salePrice || p.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-xs bg-paper p-5 shadow-pop animate-fade-up">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button onClick={() => setOpen(false)} aria-label="Close menu"><X /></button>
            </div>
            <nav className="flex flex-col">
              {NAV.map((n) => (
                <NavLink
                  key={n.label} to={n.to} end={n.end} onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `border-b border-ink/5 py-3 text-lg font-black tracking-tight ${n.accent ? 'text-flare' : isActive ? 'text-ink' : 'text-ink/70'}`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-2">
              <Link to={user ? '/account' : '/login'} onClick={() => setOpen(false)} className="btn-ghost">{user ? 'My Account' : 'Login / Register'}</Link>
              {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="btn-ink">Admin Dashboard</Link>}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function Dot({ n, accent }) {
  return (
    <span className={`absolute -right-0 -top-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-black ${accent ? 'bg-volt text-ink' : 'bg-ink text-paper'}`}>
      {n}
    </span>
  )
}
