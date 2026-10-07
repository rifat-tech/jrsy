import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Heart, Wallet } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useStore } from '../../../context/StoreContext'
import { api } from '../../../services/db'
import { money, dateFmt } from '../../../utils/format'
import { statusTone } from './statusTone'
import { Badge } from '../../../components/ui'

export default function Overview() {
  const { user } = useAuth()
  const { wishlist } = useStore()
  const [orders, setOrders] = useState([])

  useEffect(() => { if (user?.uid) api.listOrdersByCustomer(user.uid).then(setOrders) }, [user?.uid])
  const spend = orders.reduce((a, o) => a + (o.total || 0), 0)

  const stats = [
    { label: 'Orders', value: orders.length, icon: Package },
    { label: 'Wishlist', value: wishlist.length, icon: Heart },
    { label: 'Total spent', value: money(spend), icon: Wallet },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-4 p-5">
            <div className="rounded-xl bg-ink/5 p-3"><s.icon size={20} /></div>
            <div><p className="font-display text-2xl font-black">{s.value}</p><p className="text-xs uppercase tracking-wide text-ink/50">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-black">Recent orders</h3><Link to="/account/orders" className="text-xs font-bold uppercase text-ink/50 hover:text-ink">View all</Link></div>
        {orders.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink/50">No orders yet. <Link to="/shop" className="font-bold underline">Start shopping</Link>.</p>
        ) : (
          <div className="divide-y divide-ink/5">
            {orders.slice(0, 4).map((o) => (
              <Link key={o.id} to={`/account/orders/${o.id}`} className="flex items-center justify-between py-3 hover:bg-ink/[0.02]">
                <div><p className="font-bold">{o.orderNumber}</p><p className="text-xs text-ink/50">{dateFmt(o.createdAt)} · {o.items.length} item(s)</p></div>
                <div className="flex items-center gap-3"><Badge tone={statusTone(o.orderStatus)}>{o.orderStatus}</Badge><span className="font-bold">{money(o.total)}</span></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
