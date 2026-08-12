import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { CheckCircle2, Package } from 'lucide-react'
import { api } from '../../services/db'
import { money, dateFmt } from '../../utils/format'
import { PageLoader } from '../../components/ui'

export default function OrderConfirmation() {
  const { id } = useParams()
  const { state } = useLocation()
  const [order, setOrder] = useState(state?.order || null)

  useEffect(() => {
    if (!order) api.listOrders().then((all) => setOrder(all.find((o) => o.id === id) || null))
  }, [id])

  if (!order) return <PageLoader label="Loading order" />

  return (
    <div className="container-jrsy max-w-2xl py-16">
      <div className="card overflow-hidden text-center">
        <div className="bg-ink py-10 text-paper">
          <CheckCircle2 size={56} className="mx-auto text-volt" />
          <h1 className="mt-4 text-3xl font-black">Order confirmed</h1>
          <p className="mt-1 text-paper/60">Thanks {order.customerName.split(' ')[0]} — your kit is on the way.</p>
          <p className="mt-4 inline-block rounded-full bg-volt px-4 py-1.5 font-display font-black tracking-wide text-ink">{order.orderNumber}</p>
        </div>

        <div className="p-6 text-left">
          <div className="space-y-3">
            {order.items.map((it, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={it.image} alt="" className="h-16 w-14 rounded-lg bg-chalk object-cover" />
                <div className="flex-1"><p className="text-sm font-bold">{it.productName}</p><p className="text-xs text-ink/50">{it.size} × {it.quantity}</p></div>
                <span className="font-bold">{money(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-sm">
            <Row label="Subtotal" value={money(order.subtotal)} />
            {order.discount > 0 && <Row label="Discount" value={`− ${money(order.discount)}`} />}
            <Row label="Delivery" value={order.deliveryCharge === 0 ? 'Free' : money(order.deliveryCharge)} />
            <div className="flex items-center justify-between border-t border-ink/10 pt-2 text-base"><span className="font-bold">Total</span><span className="font-display text-xl font-black">{money(order.total)}</span></div>
          </div>

          <div className="mt-5 rounded-xl bg-chalk p-4 text-sm">
            <p className="font-bold">Delivery to</p>
            <p className="text-ink/60">{order.shippingAddress.address}, {order.shippingAddress.area}, {order.shippingAddress.city}</p>
            <p className="mt-2 text-ink/60">Payment: {order.paymentMethod} · Placed {dateFmt(order.createdAt)}</p>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link to="/account/orders" className="btn-ink flex-1"><Package size={16} /> Track order</Link>
            <Link to="/shop" className="btn-ghost flex-1">Keep shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
function Row({ label, value }) {
  return <div className="flex items-center justify-between"><span className="text-ink/60">{label}</span><span className="font-bold">{value}</span></div>
}
