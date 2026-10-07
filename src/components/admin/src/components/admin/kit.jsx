import { Modal } from '../ui'

export function AdminHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink/50">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, tone = 'ink', hint }) {
  const tones = { ink: 'bg-ink text-paper', volt: 'bg-volt text-ink', flare: 'bg-flare text-white', white: 'bg-white text-ink' }
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink/50">{label}</p>
          <p className="mt-2 font-display text-3xl font-black">{value}</p>
          {hint && <p className="mt-1 text-xs text-ink/40">{hint}</p>}
        </div>
        {Icon && <div className={`rounded-xl p-2.5 ${tones[tone]}`}><Icon size={18} /></div>}
      </div>
    </div>
  )
}

export function Panel({ title, action, children, className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="font-black">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export function Confirm({ open, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Delete' }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-ink/60">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost text-xs">Cancel</button>
        <button onClick={onConfirm} className="btn text-xs bg-flare text-white hover:bg-flare/90">{confirmLabel}</button>
      </div>
    </Modal>
  )
}

// Tiny dependency-free bar chart
export function BarChart({ data, height = 160 }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div className="w-full rounded-t-md bg-ink transition-all hover:bg-volt-dim" style={{ height: `${(d.value / max) * 100}%`, minHeight: 4 }} title={`${d.value}`} />
          </div>
          <span className="text-[10px] font-bold uppercase text-ink/40">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
