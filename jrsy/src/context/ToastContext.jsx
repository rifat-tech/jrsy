import { createContext, useContext, useCallback, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

const icons = { success: CheckCircle2, error: AlertTriangle, info: Info }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const Icon = icons[t.type] || Info
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-ink/10 bg-ink px-4 py-3 text-sm text-paper shadow-pop animate-fade-up"
            >
              <Icon size={18} className={t.type === 'error' ? 'text-flare' : 'text-volt'} />
              <span className="flex-1 leading-snug">{t.message}</span>
              <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} className="text-paper/50 hover:text-paper">
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
