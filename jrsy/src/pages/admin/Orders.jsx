import { useEffect, useMemo, useState } from 'react'
import { Search, Eye } from 'lucide-react'
import { api } from '../../services/db'
import { useToast } from '../../context/ToastContext'
import { money, dateFmt } from '../../utils/format'
import { statusTone, ORDER_STATUSES } from '../customer/account/statusTone'
import { AdminHeader } from '../../components/admin/kit'
import { Modal, Badge, EmptyState, PageLoader, Pagination } from '../../components/ui'

const TABS = ['All', ...ORDER_STATUSES]
const PER = 10

export default function Orders() {
  const toast = useToast()
  const [orders, setOrders] = useState(null)
  const [tab, setTab] = useState('All')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [view, setView] = useState(null)

  const load = () => api.listOrders().then(setOrders)
  useEffect(() => { load() }, [])
  useEffect(() => { setPage(1) }, [tab, q])

  const filtered = useMemo(() => {
    if (!orders) return []
    return orders.filter((o) => {
      if (tab !== 'All' && o.orderStatus !== tab) return false
      if (q) { const t = q.toLowerCase(); return [o.orderNumber, o.customerName, o.phone].some((f) => f?.toLowerCase().includes(t)) }
      return true
    })
  }, [orders, tab, q])

  const pages = Math.ceil(filtered.length / PER)
  const pageItems = filtered.slice((page - 1) * PER, page * PER)

  async function updateStatus(id, status) {
    await api.updateOrderStatus(id, status)
    toast.success('Order updated successfully.')
    setView((v) => (v ? { ...v, orderStatus: status } : v))
    load()
  }

  if (!orders) return <PageLoader />

  return (
    <div>
      <AdminHeader title="Orders" subtitle={`${orders.length} orders total`} />

      <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((t) => {
          const n = t === 'All' ? orders.length : orders.filter((o) => o.orderStatus === t).length
          return (
            <button key={t} onClick={() => setTab(t)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${tab === t ? 'bg-ink text-paper' : 'bg-white text-ink/60 hover:bg-ink/5'}`}>
              {t} <span className="opacity-60">{n}</span>
            </button>
          )
        })}
      </div>

      <div className="card mb-4 p-3">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order #, customer, phone…" className="field py-2 pl-9" />
        </div>
      </div>

      {pageItems.length === 0 ? (
        <EmptyState title="No orders here" hint="Orders will appear as customers check out." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-ink/10 bg-ink/[0.02] text-left text-xs uppercase tracking-wide text-ink/50">
                <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">View</th></tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {pageItems.map((o) => (
                  <tr key={o.id} className="hover:bg-ink/[0.02]">
                    <td className="px-4 py-3 font-bold">{o.orderNumber}</td>
                    <td className="px-4 py-3"><p className="font-medium">{o.customerName}</p><p className="text-xs text-ink/50">{o.phone}</p></td>
                    <td className="px-4 py-3 text-ink/60">{dateFmt(o.createdAt)}</td>
                    <td className="px-4 py-3 font-bold">{money(o.total)}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone(o.orderStatus)}>{o.orderStatus}</Badge></td>
                    <td className="px-4 py-3 text-right"><button onClick={() => setView(o)} className="rounded-lg p-2 text-ink/50 hover:bg-ink/5 hover:text-ink"><Eye size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={page} pages={pages} onChange={setPage} />

      {/* order detail modal */}
      <Modal open={!!view} onClose={() => setView(null)} title={view?.orderNumber} wide>
        {view && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase text-ink/50">Update status:</span>
              {ORDER_STATUSES.map((s) => (
                <button key={s} onClick={() => updateStatus(view.id, s)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${view.orderStatus === s ? 'bg-ink text-paper' : 'bg-ink/5 text-ink/60 hover:bg-ink/10'}`}>{s}</button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-chalk p-4 text-sm">
                <h4 className="mb-1 text-xs font-bold uppercase text-ink/50">Customer</h4>
                <p className="font-bold">{view.customerName}</p>
                <p className="text-ink/60">{view.phone}</p><p className="text-ink/60">{view.email}</p>
              </div>
              <div className="rounded-xl bg-chalk p-4 text-sm">
                <h4 className="mb-1 text-xs font-bold uppercase text-ink/50">Shipping</h4>
                <p className="text-ink/70">{view.shippingAddress.address}, {view.shippingAddress.area}, {view.shippingAddress.city}</p>
                <p className="mt-1 text-ink/60">{view.paymentMethod}</p>
              </div>
            </div>

            <div className="divide-y divide-ink/5">
              {view.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5">
                  <img src={it.image} alt="" className="h-14 w-12 rounded bg-chalk object-cover" />
                  <div className="flex-1"><p className="text-sm font-bold">{it.productName}</p><p className="text-xs text-ink/50">Size {it.size} · Qty {it.quantity}</p></div>
                  <span className="font-bold">{money(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <div className="w-56 space-y-1.5 text-sm">
                <Row label="Subtotal" value={money(view.subtotal)} />
                {view.discount > 0 && <Row label="Discount" value={`− ${money(view.discount)}`} />}
                <Row label="Delivery" value={view.deliveryCharge === 0 ? 'Free' : money(view.deliveryCharge)} />
                <div className="flex items-center justify-between border-t border-ink/10 pt-1.5 text-base"><span className="font-bold">Total</span><span className="font-display text-lg font-black">{money(view.total)}</span></div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
function Row({ label, value }) {
  return <div className="flex items-center justify-between"><span className="text-ink/60">{label}</span><span className="font-bold">{value}</span></div>
}
