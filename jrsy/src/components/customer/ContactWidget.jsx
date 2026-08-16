import { useState } from 'react'
import { MessageCircle, Phone, Mail, X } from 'lucide-react'
import { useStore } from '../../context/StoreContext'

// Your contact details. WhatsApp needs the international format with no + or 0:
// 01515282978  ->  8801515282978  (880 = Bangladesh)
const WHATSAPP = '8801515282978'
const PHONE_DISPLAY = '01515282978'
const PHONE_DIAL = '+8801515282978'

export default function ContactWidget() {
  const [open, setOpen] = useState(false)
  const { settings } = useStore()
  const email = settings?.email || 'hello@jrsy.com'
  const waText = encodeURIComponent("Hi JRSY! I'd like to ask about a jersey.")

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-3">
      {open && (
        <div className="w-60 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-pop animate-scale-in">
          <div className="bg-ink px-4 py-3 text-paper">
            <p className="font-black">Chat with us</p>
            <p className="text-xs text-paper/60">We usually reply within minutes.</p>
          </div>
          <div className="p-2">
            <a href={`https://wa.me/${WHATSAPP}?text=${waText}`} target="_blank" rel="noreferrer"
               className="flex items-center gap-3 rounded-xl p-3 hover:bg-chalk">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white"><MessageCircle size={18} /></span>
              <span><span className="block text-sm font-bold">WhatsApp</span><span className="block text-xs text-ink/50">{PHONE_DISPLAY}</span></span>
            </a>
            <a href={`tel:${PHONE_DIAL}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-chalk">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-paper"><Phone size={17} /></span>
              <span><span className="block text-sm font-bold">Call us</span><span className="block text-xs text-ink/50">{PHONE_DISPLAY}</span></span>
            </a>
            <a href={`mailto:${email}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-chalk">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/10 text-ink"><Mail size={17} /></span>
              <span><span className="block text-sm font-bold">Email</span><span className="block truncate text-xs text-ink/50">{email}</span></span>
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-pop transition hover:scale-105 active:scale-95"
        aria-label={open ? 'Close contact menu' : 'Open contact menu'}
      >
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </button>
    </div>
  )
}
