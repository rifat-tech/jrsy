import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link, ScrollRestoration } from 'react-router-dom'
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Star,
  Ticket, Image, Boxes, Settings, LogOut, Menu, X, ExternalLink,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { api } from '../../services/db'
import { Logo } from '../../components/ui'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/banners', label: 'Banners', icon: Image },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)

  async function doLogout() { await logout(); nav('/') }

  const Side = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Logo dark />
        <button className="lg:hidden text-paper/60" onClick={() => setOpen(false)}><X /></button>
      </div>
      <span className="px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/40">Store admin</span>
      <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-3">
        {NAV.map((n) => (
          <NavLink
            key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-volt text-ink' : 'text-paper/70 hover:bg-paper/10 hover:text-paper'}`
            }
          >
            <n.icon size={18} /> {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-paper/10 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-paper/70 hover:bg-paper/10"><ExternalLink size={18} /> View store</Link>
        <button onClick={doLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-paper/70 hover:bg-flare/20 hover:text-flare"><LogOut size={18} /> Logout</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-chalk">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-ink lg:block">{Side}</aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-ink">{Side}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-ink/10 bg-paper/90 px-4 backdrop-blur sm:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu /></button>
          <span className="text-sm font-bold text-ink/50">{api.demo ? 'Demo data' : 'Live · Firebase'}</span>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-bold leading-none">{user?.name}</p><p className="text-xs text-ink/50">Administrator</p></div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-black text-paper">{(user?.name || 'A')[0].toUpperCase()}</div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
      <ScrollRestoration />
    </div>
  )
}
