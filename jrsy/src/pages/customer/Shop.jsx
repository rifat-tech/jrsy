import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, Search } from 'lucide-react'
import { api } from '../../services/db'
import { useStore } from '../../context/StoreContext'
import ProductCard from '../../components/customer/ProductCard'
import { PageLoader, EmptyState, Pagination } from '../../components/ui'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']
const SORTS = [
  ['newest', 'Newest'],
  ['best', 'Best selling'],
  ['low', 'Price: Low → High'],
  ['high', 'Price: High → Low'],
]
const PER_PAGE = 8

export default function Shop({ group }) {
  const [params, setParams] = useSearchParams()
  const { categories } = useStore()
  const [products, setProducts] = useState(null)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const q = params.get('q') || ''
  const filter = params.get('filter') || ''
  const category = params.get('category') || ''
  const [size, setSize] = useState('')
  const [team, setTeam] = useState('')
  const [maxPrice, setMaxPrice] = useState(0)
  const [sort, setSort] = useState('newest')

  useEffect(() => { api.listProducts().then((p) => setProducts(p.filter((x) => x.status === 'active'))) }, [])
  useEffect(() => { setPage(1) }, [q, filter, category, size, team, maxPrice, sort, group])

  const teams = useMemo(() => (products ? [...new Set(products.map((p) => p.team))].sort() : []), [products])
  const priceCeiling = useMemo(() => (products ? Math.max(...products.map((p) => p.price), 3000) : 3000), [products])

  const groupCats = useMemo(() => {
    if (!group) return null
    return categories.filter((c) => c.group === group).map((c) => c.slug)
  }, [group, categories])

  const filtered = useMemo(() => {
    if (!products) return []
    let list = [...products]
    if (group === 'Football') list = list.filter((p) => ['club-jerseys', 'national-teams', 'retro'].includes(p.category) || groupCats?.includes(p.category))
    if (group === 'Cricket') list = list.filter((p) => ['cricket', 'franchise'].includes(p.category) || groupCats?.includes(p.category))
    if (category) list = list.filter((p) => p.category === category)
    if (filter === 'new') list = list.filter((p) => p.newArrival)
    if (filter === 'best') list = list.filter((p) => p.bestSeller)
    if (filter === 'sale') list = list.filter((p) => p.salePrice > 0)
    if (q) {
      const t = q.toLowerCase()
      list = list.filter((p) => [p.name, p.team, p.category, p.sku].some((f) => f?.toLowerCase().includes(t)))
    }
    if (size) list = list.filter((p) => (p.sizeStock?.[size] ?? 0) > 0)
    if (team) list = list.filter((p) => p.team === team)
    if (maxPrice) list = list.filter((p) => (p.salePrice || p.price) <= maxPrice)

    if (sort === 'low') list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price))
    else if (sort === 'high') list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price))
    else if (sort === 'best') list.sort((a, b) => (b.sold || 0) - (a.sold || 0))
    else list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    return list
  }, [products, group, groupCats, category, filter, q, size, team, maxPrice, sort])

  const pages = Math.ceil(filtered.length / PER_PAGE)
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const title = group || (filter === 'new' ? 'New Arrivals' : filter === 'best' ? 'Best Sellers' : filter === 'sale' ? 'Sale' : q ? `Search: “${q}”` : 'All Jerseys')

  function clearAll() {
    setSize(''); setTeam(''); setMaxPrice(0); setSort('newest')
    setParams({})
  }

  if (!products) return <PageLoader label="Loading jerseys" />

  const Filters = (
    <div className="space-y-6">
      <FilterBlock title="Category">
        <div className="space-y-1.5">
          {['', ...new Set(products.map((p) => p.category))].map((c) => (
            <button
              key={c || 'all'}
              onClick={() => { const n = new URLSearchParams(params); c ? n.set('category', c) : n.delete('category'); setParams(n) }}
              className={`block text-sm capitalize ${category === c ? 'font-bold text-ink' : 'text-ink/55 hover:text-ink'}`}
            >
              {c ? c.replace(/-/g, ' ') : 'All categories'}
            </button>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button key={s} onClick={() => setSize(size === s ? '' : s)} className={`h-9 min-w-[2.5rem] rounded-lg border px-2 text-sm font-bold ${size === s ? 'border-ink bg-ink text-paper' : 'border-ink/20 hover:border-ink'}`}>{s}</button>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Team">
        <select value={team} onChange={(e) => setTeam(e.target.value)} className="field">
          <option value="">All teams</option>
          {teams.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </FilterBlock>

      <FilterBlock title={`Max price: ৳${maxPrice || priceCeiling}`}>
        <input type="range" min={1000} max={priceCeiling} step={100} value={maxPrice || priceCeiling} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-ink" />
      </FilterBlock>

      <button onClick={clearAll} className="btn-ghost w-full text-xs">Clear filters</button>
    </div>
  )

  return (
    <div className="container-jrsy py-8 sm:py-12">
      <div className="mb-6">
        <span className="kicker">JRSY store</span>
        <h1 className="mt-1 text-4xl font-black">{title}</h1>
        <p className="mt-1 text-sm text-ink/50">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <button onClick={() => setShowFilters(true)} className="btn-ghost px-4 py-2 text-xs lg:hidden">
          <SlidersHorizontal size={15} /> Filters
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-xs font-bold uppercase tracking-wide text-ink/50 sm:inline">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm font-medium">
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">{Filters}</aside>

        <div>
          {pageItems.length === 0 ? (
            <EmptyState icon={Search} title="No jerseys found" hint="Try adjusting your filters or searching a different team." action={<button onClick={clearAll} className="btn-ink mt-2 text-xs">Reset filters</button>} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {pageItems.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination page={page} pages={pages} onChange={setPage} />
            </>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-paper p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X /></button>
            </div>
            {Filters}
            <button onClick={() => setShowFilters(false)} className="btn-volt mt-5 w-full">Show {filtered.length} results</button>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterBlock({ title, children }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/50">{title}</h4>
      {children}
    </div>
  )
}
