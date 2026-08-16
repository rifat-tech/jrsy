import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X } from 'lucide-react'
import { jerseySvg } from '../../utils/jersey'
import { uploadImage } from '../../services/storage'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { money } from '../../utils/format'

const TYPES = [['football', 'Football', 2200], ['cricket', 'Cricket', 2000], ['team', 'Team Kit', 1900]]
const COLORS = ['#B4122A', '#1E7FD6', '#0E7A3B', '#0B0B0F', '#F5B000', '#E0398A']
const SIZES = ['S', 'M', 'L', 'XL', 'XXL']
const PRINT_FEE = 250

// Bulk tiers — cheaper per piece as quantity grows.
const TIERS = [
  { min: 1, off: 0, label: '1–9 pcs', note: 'Standard' },
  { min: 10, off: 0.10, label: '10–24 pcs', note: 'Save 10%' },
  { min: 25, off: 0.15, label: '25–49 pcs', note: 'Save 15%' },
  { min: 50, off: 0.20, label: '50–99 pcs', note: 'Save 20%' },
  { min: 100, off: 0.25, label: '100+ pcs', note: 'Save 25%' },
]
const QUOTE_FROM = 50            // show "request a bulk quote" from this qty
const WHATSAPP = '8801515282978' // 01515282978 in international format

const tierFor = (qty) => TIERS.reduce((acc, t) => (qty >= t.min ? t : acc), TIERS[0])

export default function CustomJersey() {
  const nav = useNavigate()
  const toast = useToast()
  const { add } = useCart()

  const [type, setType] = useState('football')
  const [color, setColor] = useState('#B4122A')
  const [size, setSize] = useState('M')
  const [qty, setQty] = useState(1)
  const [name, setName] = useState('')
  const [number, setNumber] = useState('10')
  const [logo, setLogo] = useState('')
  const [uploading, setUploading] = useState(false)

  const base = TYPES.find((t) => t[0] === type)[2]
  const listUnit = base + (name || number ? PRINT_FEE : 0)
  const tier = tierFor(qty)
  const unit = Math.round(listUnit * (1 - tier.off))
  const saved = (listUnit - unit) * qty

  async function onLogo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try { setLogo(await uploadImage(file, 'custom-jerseys')) }
    finally { setUploading(false) }
  }

  function addToCart() {
    const custom = {
      id: 'custom-' + Date.now(),
      name: `Custom ${TYPES.find((t) => t[0] === type)[1]} Jersey`,
      slug: 'custom',
      images: [jerseySvg({ primary: color, secondary: '#FFFFFF', number: number || '00', name: name || 'CUSTOM' })],
      price: unit, salePrice: 0,
      customization: { type, color, name, number, logo },
    }
    add(custom, size, qty)
    toast.success('Custom jersey added to cart.')
    nav('/cart')
  }

  function requestQuote() {
    const label = TYPES.find((t) => t[0] === type)[1]
    const msg =
      `Hi JRSY! I'd like a bulk quote for custom jerseys:\n` +
      `• Type: ${label}\n` +
      `• Quantity: ${qty} pcs\n` +
      `• Size: ${size}\n` +
      (name ? `• Name: ${name}\n` : '') +
      (number ? `• Number: ${number}\n` : '') +
      `Could you share your best price and timeline?`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="container-jrsy py-8 sm:py-12">
      <div className="mb-8">
        <span className="kicker">Custom builder</span>
        <h1 className="mt-1 text-4xl font-black">Design your jersey</h1>
        <p className="mt-1 text-ink/50">Pick a base, add your name and number, upload your crest.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        {/* preview */}
        <div className="relative flex items-center justify-center rounded-3xl bg-chalk p-6">
          <img src={jerseySvg({ primary: color, secondary: '#FFFFFF', number: number || '00', name: name || 'CUSTOM' })} alt="Custom jersey preview" className="max-h-[520px] w-auto" />
          {logo && <img src={logo} alt="crest" className="absolute left-1/2 top-[28%] h-14 w-14 -translate-x-1/2 rounded object-contain" />}
        </div>

        {/* controls */}
        <div className="space-y-6">
          <div>
            <p className="label">Jersey type</p>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map(([v, l, p]) => (
                <button key={v} onClick={() => setType(v)} className={`rounded-xl border p-3 text-center transition ${type === v ? 'border-ink bg-ink text-paper' : 'border-ink/15 hover:border-ink'}`}>
                  <span className="block text-sm font-bold">{l}</span>
                  <span className="block text-xs opacity-70">{money(p)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label">Base colour</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} style={{ background: c }} className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ${color === c ? 'ring-ink' : 'ring-transparent'}`} aria-label={`colour ${c}`} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="label">Player name</p>
              <input value={name} onChange={(e) => setName(e.target.value.slice(0, 12))} placeholder="RAHMAN" className="field uppercase" />
            </div>
            <div>
              <p className="label">Number</p>
              <input value={number} onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 2))} placeholder="10" className="field" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="label">Size</p>
              <select value={size} onChange={(e) => setSize(e.target.value)} className="field">
                {SIZES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <p className="label">Quantity</p>
              <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className="field" />
            </div>
          </div>

          {/* quick quantity presets */}
          <div className="flex flex-wrap gap-2">
            {[1, 11, 15, 25, 50, 100].map((n) => (
              <button key={n} onClick={() => setQty(n)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${qty === n ? 'border-ink bg-ink text-paper' : 'border-ink/15 text-ink/60 hover:border-ink'}`}>
                {n === 11 ? '11 (team)' : `${n} pcs`}
              </button>
            ))}
          </div>

          {/* bulk tier table */}
          <div>
            <p className="label">Bulk pricing — more pieces, lower price</p>
            <div className="grid grid-cols-5 overflow-hidden rounded-xl border border-ink/10 text-center">
              {TIERS.map((t) => {
                const activeTier = t.min === tier.min
                return (
                  <div key={t.min} className={`px-1 py-2 ${activeTier ? 'bg-volt text-ink' : 'bg-white'}`}>
                    <p className="text-[10px] font-black leading-tight">{t.label.replace(' pcs', '')}</p>
                    <p className="text-[10px] leading-tight opacity-70">{t.note}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <p className="label">Team crest (optional)</p>
            {logo ? (
              <div className="flex items-center gap-3">
                <img src={logo} alt="" className="h-14 w-14 rounded object-contain ring-1 ring-ink/10" />
                <button onClick={() => setLogo('')} className="btn-ghost px-3 py-2 text-xs"><X size={14} /> Remove</button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink/25 py-6 text-sm text-ink/50 hover:border-ink">
                <Upload size={16} /> {uploading ? 'Uploading…' : 'Upload logo'}
                <input type="file" accept="image/*" onChange={onLogo} className="hidden" />
              </label>
            )}
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink/60">Unit price {tier.off > 0 && <span className="ml-1 rounded bg-volt/30 px-1.5 py-0.5 text-[11px] font-bold text-ink">−{Math.round(tier.off * 100)}%</span>}</span>
              <span className="font-bold">
                {tier.off > 0 && <span className="mr-1 text-xs text-ink/40 line-through">{money(listUnit)}</span>}
                {money(unit)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-lg font-black">
              <span>Total ({qty} pcs)</span><span>{money(unit * qty)}</span>
            </div>
            {saved > 0 && <p className="mt-1 text-xs font-bold text-emerald-600">You save {money(saved)} on this order.</p>}

            <button onClick={addToCart} className="btn-volt mt-4 w-full">Add to cart</button>

            {qty >= QUOTE_FROM ? (
              <button onClick={requestQuote} className="btn-ink mt-2 w-full">Get a bulk quote on WhatsApp</button>
            ) : (
              <button onClick={requestQuote} className="mt-2 w-full text-center text-xs font-bold uppercase tracking-wide text-ink/50 hover:text-ink">
                Ordering a big batch? Request a custom quote →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
