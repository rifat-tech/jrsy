import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Star, X, Loader2, PackageX } from 'lucide-react'

export function Logo({ className = '', to = '/', dark = false }) {
  return (
    <Link to={to} className={`group inline-flex items-baseline gap-1 ${className}`} aria-label="JRSY home">
      <span className={`font-display text-2xl font-black italic tracking-tightest ${dark ? 'text-paper' : 'text-ink'}`}>
        JRSY
      </span>
      <span className="h-2 w-2 rounded-full bg-volt transition group-hover:scale-125" />
    </Link>
  )
}

export function Spinner({ size = 22, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-ink/40 ${className}`} />
}

export function PageLoader({ label = 'Loading' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink/40">
      <Spinner size={28} />
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </div>
  )
}

export function Stars({ value = 0, size = 14, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? 'fill-volt-dim text-volt-dim' : 'text-ink/20'}
        />
      ))}
    </span>
  )
}

export function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4" onClick={onClose}>
      <div
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-paper p-5 shadow-pop animate-scale-in sm:rounded-2xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-black">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-ink/50 hover:bg-ink/5 hover:text-ink" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}

export function EmptyState({ icon: Icon = PackageX, title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink/15 py-16 text-center">
      <Icon size={40} className="text-ink/25" />
      <p className="font-bold">{title}</p>
      {hint && <p className="max-w-xs text-sm text-ink/50">{hint}</p>}
      {action}
    </div>
  )
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <button className="btn-ghost px-3 py-2 text-xs" disabled={page === 1} onClick={() => onChange(page - 1)}>Prev</button>
      {Array.from({ length: pages }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`h-9 w-9 rounded-full text-sm font-bold ${page === i + 1 ? 'bg-ink text-paper' : 'text-ink/60 hover:bg-ink/5'}`}
        >
          {i + 1}
        </button>
      ))}
      <button className="btn-ghost px-3 py-2 text-xs" disabled={page === pages} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  )
}

export function Badge({ children, tone = 'ink' }) {
  const tones = {
    ink: 'bg-ink text-paper',
    volt: 'bg-volt text-ink',
    flare: 'bg-flare text-white',
    muted: 'bg-ink/8 text-ink/70',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${tones[tone] || tones.ink}`}>
      {children}
    </span>
  )
}
