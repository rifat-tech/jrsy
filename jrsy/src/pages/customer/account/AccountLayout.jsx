import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutGrid, Package, Heart, MapPin, User, LogOut } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'

const LINKS = [
  { to: '/account', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/account/orders', label: 'My Orders', icon: Package },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/profile', label: 'Profile', icon: User },
]

export default function AccountLayout() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const toast = useToast()

  async function doLogout() { await logout(); toast.success('Logged out.'); nav('/') }

  return (
    <div className="container-jrsy py-8 sm:py-12">
      <div className="mb-8">
        <span className="kicker">My account</span>
        <h1 className="mt-1 text-3xl font-black">Hi, {user?.name?.split(' ')[0] || 'there'}</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit">
          <nav className="flex gap-1 overflow-x-auto no-scrollbar lg:flex-col">
            {LINKS.map((l) => (
              <NavLink
                key={l.to} to={l.to} end={l.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${isActive ? 'bg-ink text-paper' : 'text-ink/60 hover:bg-ink/5'}`
                }
              >
                <l.icon size={17} /> {l.label}
              </NavLink>
            ))}
            <button onClick={doLogout} className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-flare hover:bg-flare/10">
              <LogOut size={17} /> Logout
            </button>
          </nav>
        </aside>
        <div><Outlet /></div>
      </div>
    </div>
  )
}
