/* Admin → Representatives : the tab bar shared by all representative admin pages. */
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, UserPlus, MapPinOff, Map } from 'lucide-react'

const TABS = [
  { to: '/admin/representatives', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/representatives/list', label: 'All Representatives', icon: Users },
  { to: '/admin/representatives/new', label: 'Add Representative', icon: UserPlus },
  { to: '/admin/representatives/vacant', label: 'Vacant Areas', icon: MapPinOff },
  { to: '/admin/representatives/areas', label: 'Administrative Areas', icon: Map },
]

export default function RepShell() {
  return (
    <div>
      <div className="no-scrollbar -mx-1 mb-6 flex gap-1 overflow-x-auto px-1">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end}
            className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${isActive ? 'bg-ink text-paper' : 'bg-white text-ink/60 hover:text-ink'}`}>
            <t.icon size={15} /> {t.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
