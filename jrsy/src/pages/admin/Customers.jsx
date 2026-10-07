import { useEffect, useMemo, useState } from 'react'
import { Search, Eye } from 'lucide-react'
import { api } from '../../services/db'
import { money, dateFmt } from '../../utils/format'
import { statusTone } from '../customer/account/statusTone'
import { AdminHeader } from '../../components/admin/kit'
import { Modal, Badge, EmptyState, PageLoader } from '../../components/ui'

export default function Customers() {
  const [customers, setCustomers] = useState(null)
  const [orders, setOrders] = useState([])
  const [q, setQ] = useState('')
  const [view, setView] = useState(null)

  useEffect(() => {
    api.listCustomers().then(setCustomers)
    api.listOrders().then(setOrders)
  }, [])

  const filtered = useMemo(() => {
    if (!customers) return []
    if (!q) return customers
    const t = q.toLowerCase()
    return customers.filter((c) => [c.name, c.email, c.phone].some((f) => f?.toLowerCase().includes(t)))
  }, [customers, q])

  if (!customers) return <PageLoader />
  const viewOrders = view ? orders.filter((o) => o.customerId === view.uid) : []

  return (
    <div>
      <AdminHeader title="Customers" subtitle={`${customers.length} registered customers`} />

      <div className="card mb-4 p-3">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone…" className="field py-2 pl-9" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No customers found" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-ink/10 bg-ink/[0.02] text-left text-xs uppercase tracking-wide text-ink/50">
                <tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Spent</th><th className="px-4 py-3 text-right">View</th></tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {filtered.map((c) => (
                  <tr key={c.uid} className="hover:bg-ink/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-black text-paper">{(c.name || 'C')[0].toUpperCase()}</div>
                        <div><p className="font-bold">{c.name}</p><p className="text-xs text-ink/50">{c.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink/60">{dateFmt(c.createdAt)}</td>
                    <td className="px-4 py-3 font-bold">{c.orderCount}</td>
                    <td className="px-4 py-3 font-bold">{money(c.totalSpend)}</td>
                    <td className="px-4 py-3 text-right"><button onClick={() => setView(c)} className="rounded-lg p-2 text-ink/50 hover:bg-ink/5 hover:text-ink"><Eye size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!view} onClose={() => setView(null)} title="Customer profile" wide>
        {view && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-2xl font-black text-paper">{(view.name || 'C')[0].toUpperCase()}</div>
              <div>
                <p className="text-xl font-black">{view.name}</p>
                <p className="text-sm text-ink/50">{view.email} · {view.phone || 'no phone'}</p>
                <p className="text-xs text-ink/40">Joined {dateFmt(view.createdAt)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-4"><p className="text-xs uppercase text-ink/50">Total orders</p><p className="font-display text-2xl font-black">{view.orderCount}</p></div>
              <div className="card p-4"><p className="text-xs uppercase text-ink/50">Total spent</p><p className="font-display text-2xl font-black">{money(view.totalSpend)}</p></div>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase text-ink/50">Order history</h4>
              {viewOrders.length === 0 ? <p className="text-sm text-ink/40">No orders yet.</p> : (
                <div className="divide-y divide-ink/5">
                  {viewOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between py-2.5">
                      <div><p className="text-sm font-bold">{o.orderNumber}</p><p className="text-xs text-ink/50">{dateFmt(o.createdAt)}</p></div>
                      <div className="flex items-center gap-2"><Badge tone={statusTone(o.orderStatus)}>{o.orderStatus}</Badge><span className="font-bold">{money(o.total)}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
