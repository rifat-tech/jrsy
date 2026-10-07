import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Facebook, Youtube, ArrowRight } from 'lucide-react'
import { Logo } from '../ui'
import { useStore } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'

export default function Footer() {
  const { settings } = useStore()
  const toast = useToast()
  const [email, setEmail] = useState('')

  const cols = [
    { title: 'Shop', links: [['Football', '/football'], ['Cricket', '/cricket'], ['Custom Jersey', '/custom'], ['New Arrivals', '/shop?filter=new'], ['Sale', '/shop?filter=sale']] },
    { title: 'Account', links: [['My Orders', '/account/orders'], ['Wishlist', '/account/wishlist'], ['Login', '/login'], ['Register', '/register']] },
    { title: 'Help', links: [['Size Guide', '/shop'], ['Shipping', '/shop'], ['Contact', '#'], ['Track Order', '/account/orders']] },
  ]

  function subscribe(e) {
    e.preventDefault()
    if (!email.includes('@')) return toast.error('Enter a valid email address.')
    setEmail(''); toast.success('You’re on the list. Welcome to JRSY.')
  }

  return (
    <footer className="mt-20 bg-ink text-paper">
      <div className="container-jrsy grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo dark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/60">{settings.footer}</p>
          <form onSubmit={subscribe} className="mt-6 flex max-w-sm overflow-hidden rounded-full border border-paper/20">
            <input
              value={email} onChange={(e) => setEmail(e.target.value)} type="email"
              placeholder="Email for kit drops"
              className="flex-1 bg-transparent px-4 py-3 text-sm text-paper placeholder-paper/40 focus:outline-none"
            />
            <button className="flex items-center gap-1 bg-volt px-5 text-sm font-bold uppercase text-ink" aria-label="Subscribe">
              Join <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-volt">{c.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-paper/60 transition hover:text-paper">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-paper/10">
        <div className="container-jrsy flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-paper/50">© {new Date().getFullYear()} {settings.storeName}. {settings.tagline}</p>
          <div className="flex items-center gap-3">
            {[[Facebook, settings.social?.facebook], [Instagram, settings.social?.instagram], [Youtube, settings.social?.youtube]].map(
              ([Icon, href], i) => (
                <a key={i} href={href || '#'} className="rounded-full border border-paper/20 p-2 text-paper/70 transition hover:border-volt hover:text-volt" aria-label="social link">
                  <Icon size={16} />
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
