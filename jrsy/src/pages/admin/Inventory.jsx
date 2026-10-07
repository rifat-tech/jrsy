import { useEffect, useState } from 'react'
import { Save, Search } from 'lucide-react'
import { api } from '../../services/db'
import { useToast } from '../../context/ToastContext'
import { AdminHeader } from '../../components/admin/kit'
import { Badge, PageLoader } from '../../components/ui'

export default function Inventory() {
  const toast = useToast()
  const [products, setProducts] = useState(null)
  const [edits, setEdits] = useState({})
  const [q, setQ] = useState('')

  const load = () => api.listProducts().then((p) => setProducts(p))
  useEffect(() => { load() }, [])

  function change(pid, size, val) {
    setEdits((e) => ({ ...e, [pid]: { ...(e[pid] || {}), [size]: Math.max(0, Number(val)) } }))
  }

  async function saveRow(p) {
    const sizeStock = { ...p.sizeStock, ...(edits[p.id] || {}) }
    const totalStock = Object.values(sizeStock).reduce((a, b) => a + Number(b || 0), 0)
    await api.saveProduct({ ...p, sizeStock, totalStock })
    setEdits((e) => { const n = { ...e }; delete n[p.id]; return n })
    toast.success(`${p.name} stock updated.`); load()
  }

  if (!products) return <PageLoader />
  const list = products.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()))
  const allSizes = ['S', 'M', 'L', 'XL', 'XXL']

  return (
    <div>
      <AdminHeader title="Inventory" subtitle="Update size-wise stock levels" />

      <div className="card mb-4 p-3">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="field py-2 pl-9" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.02] text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3">Product</th>
                {allSizes.map((s) => <th key={s} className="px-2 py-3 text-center">{s}</th>)}
                <th className="px-4 py-3 text-center">Total</th><th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {list.map((p) => {
                const merged = { ...p.sizeStock, ...(edits[p.id] || {}) }
                const total = Object.values(merged).reduce((a, b) => a + Number(b || 0), 0)
                const dirty = !!edits[p.id]
                return (
                  <tr key={p.id} className="hover:bg-ink/[0.02]">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2"><img src={p.images?.[0]} alt="" className="h-9 w-8 rounded bg-chalk object-cover" /><span className="font-bold">{p.name}</span></div>
                    </td>
                    {allSizes.map((s) => (
                      <td key={s} className="px-2 py-2 text-center">
                        {p.sizeStock?.[s] != null ? (
                          <input type="number" min={0} value={merged[s] ?? 0} onChange={(e) => change(p.id, s, e.target.value)} className="w-14 rounded border border-ink/15 px-2 py-1 text-center text-sm" />
                        ) : <span className="text-ink/20">–</span>}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-center">{total <= 0 ? <Badge tone="flare">Out</Badge> : total <= 15 ? <Badge tone="amber">{total}</Badge> : <span className="font-bold">{total}</span>}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => saveRow(p)} disabled={!dirty} className={`btn text-xs px-3 py-1.5 ${dirty ? 'bg-ink text-paper' : 'bg-ink/5 text-ink/30'}`}><Save size={13} /> Save</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
