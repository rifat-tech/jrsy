import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { api } from '../../../services/db'
import { money, dateFmt } from '../../../utils/format'
import { statusTone, ORDER_STATUSES } from './statusTone'
import { Badge, PageLoader, EmptyState } from '../../../components/ui'

export default function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(undefined)
  useEffect(() => { api.listOrders().then((all) => setOrder(all.find((o) => o.id === id) || null)) }, [id])

  if (order === undefined) return <PageLoader />
  if (!order) return <EmptyState title="Order not found" action={<Link to="/account/orders" className="btn-ink mt-2 text-xs">Back to orders</Link>} />

  const flow = ORDER_STATUSES.filter((s) => s !== 'Cancelled')
  const currentIdx = flow.indexOf(order.orderStatus)
  const cancelled = order.orderStatus === 'Cancelled'

  return (
    <div>
      <Link to="/account/orders" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-ink/60 hover:text-ink"><ArrowLeft size={16} /> Back to orders</Link>
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="font-display text-2xl font-black">{order.orderNumber}</h1><p className="text-xs text-ink/50">Placed {dateFmt(order.createdAt)}</p></div>
          <Badge tone={statusTone(order.orderStatus)}>{order.orderStatus}</Badge>
        </div>

        {/* timeline */}
        {!cancelled ? (
          <div className="mt-8 flex items-center">
            {flow.map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${i <= currentIdx ? 'bg-ink text-paper' : 'bg-ink/10 text-ink/40'}`}>
                    {i <= currentIdx ? <Check size={15} /> : i + 1}
                  </div>
                  <span className="mt-1.5 hidden text-[10px] font-bold uppercase tracking-wide text-ink/50 sm:block">{s}</span>
                </div>
                {i < flow.length - 1 && <div className={`h-0.5 flex-1 ${i < currentIdx ? 'bg-ink' : 'bg-ink/10'}`} />}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl bg-flare/10 p-3 text-sm font-bold text-flare">This order was cancelled.</p>
        )}

        {/* items */}
        <div className="mt-8 divide-y divide-ink/5">
          {order.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <img src={it.image} alt="" className="h-16 w-14 rounded-lg bg-chalk object-cover" />
              <div className="flex-1"><p className="font-bold">{it.productName}</p><p className="text-xs text-ink/50">Size {it.size} · Qty {it.quantity}</p></div>
              <span className="font-bold">{money(it.price * it.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-6 border-t border-ink/10 pt-5 sm:grid-cols-2">
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/50">Delivery address</h4>
            <p className="text-sm text-ink/70">{order.shippingAddress.fullName}<br />{order.shippingAddress.address}, {order.shippingAddress.area}<br />{order.shippingAddress.city}<br />{order.phone}</p>
          </div>
          <div className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={money(order.subtotal)} />
            {order.discount > 0 && <Row label="Discount" value={`− ${money(order.discount)}`} />}
            <Row label="Delivery" value={order.deliveryCharge === 0 ? 'Free' : money(order.deliveryCharge)} />
            <div className="flex items-center justify-between border-t border-ink/10 pt-2 text-base"><span className="font-bold">Total</span><span className="font-display text-xl font-black">{money(order.total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
function Row({ label, value }) {
  return <div className="flex items-center justify-between"><span className="text-ink/60">{label}</span><span className="font-bold">{value}</span></div>
}
