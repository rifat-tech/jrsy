import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Copy, Eye, EyeOff, Package } from 'lucide-react'
import { api } from '../../services/db'
import { useToast } from '../../context/ToastContext'
import { money } from '../../utils/format'
import { AdminHeader, Confirm } from '../../components/admin/kit'
import { Badge, EmptyState, PageLoader, Pagination } from '../../components/ui'
import ProductForm from './ProductForm'

const PER = 10

export default function Products() {
  const toast = useToast()
  const [products, setProducts] = useState(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const load = () => api.listProducts().then((p) => setProducts(p.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))))
  useEffect(() => { load() }, [])
  useEffect(() => { setPage(1) }, [q, status])

  const filtered = useMemo(() => {
    if (!products) return []
    return products.filter((p) => {
      if (status === 'active' && p.status !== 'active') return false
      if (status === 'disabled' && p.status === 'active') return false
      if (status === 'out' && p.totalStock > 0) return false
      if (q) { const t = q.toLowerCase(); return [p.name, p.sku, p.team].some((f) => f?.toLowerCase().includes(t)) }
      return true
    })
  }, [products, q, status])

  const pages = Math.ceil(filtered.length / PER)
  const pageItems = filtered.slice((page - 1) * PER, page * PER)

  async function handleSave(payload) { await api.saveProduct(payload); await load() }

  async function duplicate(p) {
    const { id, ...rest } = p
    await api.saveProduct({ ...rest, name: `${p.name} (copy)`, slug: `${p.slug}-copy-${Date.now().toString().slice(-4)}`, sku: `${p.sku}-C` })
    toast.success('Product duplicated.'); load()
  }
  async function toggleStatus(p) {
    await api.saveProduct({ ...p, status: p.status === 'active' ? 'disabled' : 'active' })
    toast.success(p.status === 'active' ? 'Product disabled.' : 'Product enabled.'); load()
  }
  async function confirmDelete() {
    await api.deleteProduct(toDelete.id); setToDelete(null)
    toast.success('Product deleted.'); load()
  }

  if (!products) return <PageLoader />

  return (
    <div>
      <AdminHeader
        title="Products" subtitle={`${products.length} products in catalogue`}
        action={<button onClick={() => { setEditing(null); setFormOpen(true) }} className="btn-ink text-xs"><Plus size={16} /> Add product</button>}
      />

      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, SKU, team…" className="field py-2 pl-9" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm font-medium">
          <option value="all">All status</option><option value="active">Active</option><option value="disabled">Disabled</option><option value="out">Out of stock</option>
        </select>
      </div>

      {pageItems.length === 0 ? (
        <EmptyState icon={Package} title="No products found" hint="Add your first jersey or adjust the search." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-ink/10 bg-ink/[0.02] text-left text-xs uppercase tracking-wide text-ink/50">
                <tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {pageItems.map((p) => (
                  <tr key={p.id} className="hover:bg-ink/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]} alt="" className="h-12 w-10 rounded bg-chalk object-cover" />
                        <div>
                          <p className="font-bold leading-tight">{p.name}</p>
                          <div className="mt-0.5 flex gap-1">
                            {p.featured && <Badge tone="volt">Feat</Badge>}
                            {p.newArrival && <Badge tone="muted">New</Badge>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink/60">{p.sku}</td>
                    <td className="px-4 py-3 font-bold">{money(p.salePrice || p.price)}{p.salePrice > 0 && <span className="ml-1 text-xs text-ink/40 line-through">{money(p.price)}</span>}</td>
                    <td className="px-4 py-3">
                      {p.totalStock <= 0 ? <Badge tone="flare">Out</Badge> : p.totalStock <= 15 ? <Badge tone="amber">{p.totalStock}</Badge> : <span className="font-bold">{p.totalStock}</span>}
                    </td>
                    <td className="px-4 py-3">{p.status === 'active' ? <Badge tone="green">Active</Badge> : <Badge tone="muted">Off</Badge>}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn title="Edit" onClick={() => { setEditing(p); setFormOpen(true) }}><Pencil size={15} /></IconBtn>
                        <IconBtn title="Duplicate" onClick={() => duplicate(p)}><Copy size={15} /></IconBtn>
                        <IconBtn title={p.status === 'active' ? 'Disable' : 'Enable'} onClick={() => toggleStatus(p)}>{p.status === 'active' ? <EyeOff size={15} /> : <Eye size={15} />}</IconBtn>
                        <IconBtn title="Delete" danger onClick={() => setToDelete(p)}><Trash2 size={15} /></IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={page} pages={pages} onChange={setPage} />

      <ProductForm open={formOpen} onClose={() => setFormOpen(false)} product={editing} onSaved={handleSave} />
      <Confirm open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={confirmDelete} title="Delete product" message={`Delete “${toDelete?.name}”? This can’t be undone.`} />
    </div>
  )
}

function IconBtn({ children, onClick, title, danger }) {
  return (
    <button onClick={onClick} title={title} className={`rounded-lg p-2 transition ${danger ? 'text-ink/50 hover:bg-flare/10 hover:text-flare' : 'text-ink/50 hover:bg-ink/5 hover:text-ink'}`}>
      {children}
    </button>
  )
}
