import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, CheckCircle2, XCircle, ShoppingCart, Clock, Users, Wallet, TrendingUp } from 'lucide-react'
import { api } from '../../services/db'
import { money, timeAgo } from '../../utils/format'
import { statusTone } from '../customer/account/statusTone'
import { AdminHeader, StatCard, Panel, BarChart } from '../../components/admin/kit'
import { Badge, PageLoader } from '../../components/ui'

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    Promise.all([api.listProducts(), api.listOrders(), api.listCustomers()]).then(([products, orders, customers]) => {
      setData({ products, orders, customers })
    })
  }, [])

  if (!data) return <PageLoader label="Loading dashboard" />
  const { products, orders, customers } = data

  const activeProducts = products.filter((p) => p.status === 'active').length
  const outOfStock = products.filter((p) => p.totalStock <= 0).length
  const pending = orders.filter((o) => o.orderStatus === 'Pending').length
  const completed = orders.filter((o) => o.orderStatus === 'Delivered').length
  const sales = orders.filter((o) => o.orderStatus !== 'Cancelled').reduce((a, o) => a + o.total, 0)

  // last 6 "months" of sales from orders (demo-friendly grouping by index)
  const salesChart = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((label, i) => ({
    label,
    value: Math.round(sales / 6) + (i % 3) * 400 + i * 120,
  }))

  const bestSelling = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5)
  const lowStock = products.filter((p) => p.totalStock > 0 && p.totalStock <= 15).slice(0, 5)
  const recentOrders = orders.slice(0, 5)
  const recentCustomers = [...customers].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5)

  return (
    <div>
      <AdminHeader title="Dashboard" subtitle="Store performance at a glance" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total sales" value={money(sales)} icon={Wallet} tone="volt" hint={`${orders.length} orders`} />
        <StatCard label="Total orders" value={orders.length} icon={ShoppingCart} tone="ink" hint={`${pending} pending · ${completed} completed`} />
        <StatCard label="Products" value={products.length} icon={Package} tone="ink" hint={`${activeProducts} active · ${outOfStock} out of stock`} />
        <StatCard label="Customers" value={customers.length} icon={Users} tone="ink" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Sales trend" className="lg:col-span-2">
          <BarChart data={salesChart} />
        </Panel>
        <Panel title="Order status">
          <div className="space-y-3">
            {[
              ['Pending', pending, Clock],
              ['Completed', completed, CheckCircle2],
              ['Cancelled', orders.filter((o) => o.orderStatus === 'Cancelled').length, XCircle],
            ].map(([label, val, Icon]) => (
              <div key={label} className="flex items-center gap-3">
                <Icon size={18} className="text-ink/40" />
                <span className="flex-1 text-sm">{label}</span>
                <span className="font-display text-lg font-black">{val}</span>
              </div>
            ))}
            <Link to="/admin/orders" className="btn-ink mt-2 w-full text-xs">Manage orders</Link>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Recent orders" action={<Link to="/admin/orders" className="text-xs font-bold uppercase text-ink/50 hover:text-ink">All</Link>}>
          <div className="divide-y divide-ink/5">
            {recentOrders.map((o) => (
              <Link key={o.id} to="/admin/orders" className="flex items-center justify-between py-2.5 hover:bg-ink/[0.02]">
                <div><p className="text-sm font-bold">{o.orderNumber}</p><p className="text-xs text-ink/50">{o.customerName} · {timeAgo(o.createdAt)}</p></div>
                <div className="flex items-center gap-2"><Badge tone={statusTone(o.orderStatus)}>{o.orderStatus}</Badge><span className="text-sm font-bold">{money(o.total)}</span></div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Best selling" action={<TrendingUp size={16} className="text-ink/40" />}>
          <div className="divide-y divide-ink/5">
            {bestSelling.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2.5">
                <img src={p.images?.[0]} alt="" className="h-11 w-9 rounded bg-chalk object-cover" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{p.name}</p><p className="text-xs text-ink/50">{p.sold || 0} sold</p></div>
                <span className="text-sm font-bold">{money(p.salePrice || p.price)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Low stock alert">
          {lowStock.length === 0 ? <p className="py-4 text-center text-sm text-ink/40">All products well stocked.</p> : (
            <div className="divide-y divide-ink/5">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3"><img src={p.images?.[0]} alt="" className="h-10 w-8 rounded bg-chalk object-cover" /><p className="text-sm font-bold">{p.name}</p></div>
                  <Badge tone="amber">{p.totalStock} left</Badge>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="New customers">
          <div className="divide-y divide-ink/5">
            {recentCustomers.map((c) => (
              <div key={c.uid} className="flex items-center gap-3 py-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-black text-paper">{(c.name || 'C')[0].toUpperCase()}</div>
                <div className="flex-1"><p className="text-sm font-bold">{c.name}</p><p className="text-xs text-ink/50">{c.email}</p></div>
                <span className="text-xs text-ink/50">{c.orderCount} order(s)</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
