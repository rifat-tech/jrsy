import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { api } from '../../../services/db'
import { money, dateFmt } from '../../../utils/format'
import { statusTone } from './statusTone'
import { Badge, EmptyState, PageLoader } from '../../../components/ui'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState(null)

  useEffect(() => { if (user?.uid) api.listOrdersByCustomer(user.uid).then(setOrders) }, [user?.uid])
  if (!orders) return <PageLoader />

  if (orders.length === 0)
    return <EmptyState icon={Package} title="No orders yet" hint="When you place an order it will show up here." action={<Link to="/shop" className="btn-ink mt-2 text-xs">Shop jerseys</Link>} />

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <Link key={o.id} to={`/account/orders/${o.id}`} className="card block p-4 transition hover:shadow-pop">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg font-black">{o.orderNumber}</p>
              <p className="text-xs text-ink/50">{dateFmt(o.createdAt)} · {o.items.length} item(s) · {o.paymentMethod}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={statusTone(o.orderStatus)}>{o.orderStatus}</Badge>
              <span className="font-bold">{money(o.total)}</span>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {o.items.slice(0, 4).map((it, i) => <img key={i} src={it.image} alt="" className="h-14 w-12 rounded bg-chalk object-cover" />)}
          </div>
        </Link>
      ))}
    </div>
  )
}
