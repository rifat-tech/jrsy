import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Ruler, Info } from 'lucide-react'
import { jerseySvg } from '../../utils/jersey'
import { uploadImage } from '../../services/storage'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { money } from '../../utils/format'
import { Modal } from '../../components/ui'

// ---- Pricing data (edit these to match your real costs) ----
// Fabric base price is per piece; MOQ = minimum order quantity for that fabric.
const FABRICS = [
  { id: 'pp',      name: 'PP',                  price: 250, moq: 20 },
  { id: 'mesh',    name: 'Mesh',                price: 250, moq: 15 },
  { id: 'birdseye',name: 'Birdseye',            price: 350, moq: 10 },
  { id: 'honey',   name: 'Honeycomb',           price: 330, moq: 10 },
  { id: 'leaf',    name: 'Leaf Jacquard',       price: 350, moq: 10 },
  { id: 'china',   name: 'China Spandex',       price: 330, moq: 10 },
  { id: 'hcjac',   name: 'Honeycomb Jacquard',  price: 580, moq: 10 },
  { id: 'brush',   name: 'Brush Jacquard',      price: 550, moq: 10 },
  { id: 'nike',    name: 'Nike Jacquard',       price: 600, moq: 5  },
]
const SLEEVES = [['sleeveless', 'Sleeveless', 0], ['half', 'Half Sleeve', 0], ['full', 'Full Sleeve', 30]]
const NECKS   = [['round', 'Round Neck', 0], ['v', 'V Neck', 10], ['polo', 'Polo Neck', 30]]
const FRONT_NUMBER_FEE = 15  // back name & back number are free; front number +15

const COLORS = ['#B4122A', '#1E7FD6', '#0E7A3B', '#0B0B0F', '#F5B000', '#E0398A']

const FONTS = [
  { id: 'archivo',  label: 'Classic',   family: "'Archivo', sans-serif" },
  { id: 'anton',    label: 'Bold',      family: "'Anton', sans-serif" },
  { id: 'teko',     label: 'Tall',      family: "'Teko', sans-serif" },
  { id: 'oswald',   label: 'Condensed', family: "'Oswald', sans-serif" },
  { id: 'rajdhani', label: 'Tech',      family: "'Rajdhani', sans-serif" },
  { id: 'saira',    label: 'Sport',     family: "'Saira Condensed', sans-serif" },
]

const MENS = [['XS',34,25],['S',36,26],['M',38,27],['L',40,28],['XL',42,29],['2XL',44,30],['3XL',46,31],['4XL',48,32],['5XL',50,33]]
const KIDS = [['2Y',24,17],['4Y',26,18],['6Y',28,19],['8Y',30,20],['10Y',32,22],['12Y',34,24]]
const SIZE_OPTIONS = ['XS','S','M','L','XL','2XL','3XL','4XL','5XL']

const WHATSAPP = '8801515282978' // 01515282978 in international format

export default function CustomJersey() {
  const nav = useNavigate()
  const toast = useToast()
  const { add } = useCart()

  const [fabricId, setFabricId] = useState('mesh')
  const [color, setColor] = useState('#B4122A')
  const [sleeve, setSleeve] = useState('half')
  const [neck, setNeck] = useState('round')
  const [size, setSize] = useState('M')
  const [qty, setQty] = useState(15)
  const [name, setName] = useState('')
  const [number, setNumber] = useState('10')
  const [frontNumber, setFrontNumber] = useState(false)
  const [fontId, setFontId] = useState('anton')
  const [logo, setLogo] = useState('')
  const [uploading, setUploading] = useState(false)
  const [sizeOpen, setSizeOpen] = useState(false)

  const fabric = FABRICS.find((f) => f.id === fabricId)
  const font = FONTS.find((f) => f.id === fontId)
  const sleeveFee = SLEEVES.find((s) => s[0] === sleeve)[2]
  const neckFee = NECKS.find((n) => n[0] === neck)[2]
  const frontFee = frontNumber ? FRONT_NUMBER_FEE : 0

  const unit = fabric.price + sleeveFee + neckFee + frontFee
  const belowMoq = qty < fabric.moq
  const total = unit * qty

  // keep quantity at or above the fabric's MOQ when you switch fabric
  useEffect(() => { setQty((q) => (q < fabric.moq ? fabric.moq : q)) }, [fabricId]) // eslint-disable-line

  async function onLogo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try { setLogo(await uploadImage(file, 'custom-jerseys')) }
    finally { setUploading(false) }
  }

  function addToCart() {
    if (belowMoq) return toast.error(`Minimum order for ${fabric.name} is ${fabric.moq} pcs.`)
    const custom = {
      id: 'custom-' + Date.now(),
      name: `Custom Jersey — ${fabric.name}`,
      slug: 'custom',
      images: [jerseySvg({ primary: color, secondary: '#FFFFFF', number: number || '00', name: name || 'CUSTOM' })],
      price: unit, salePrice: 0,
      customization: { fabric: fabric.name, color, sleeve, neck, font: font.label, name, number, frontNumber, logo },
    }
    add(custom, size, qty)
    toast.success('Custom jersey added to cart.')
    nav('/cart')
  }

  function requestQuote() {
    const msg =
      `Hi JRSY! I'd like a quote for custom jerseys:\n` +
      `• Fabric: ${fabric.name}\n` +
      `• Quantity: ${qty} pcs\n` +
      `• Sleeve: ${SLEEVES.find((s) => s[0] === sleeve)[1]}\n` +
      `• Neck: ${NECKS.find((n) => n[0] === neck)[1]}\n` +
      `• Size: ${size}\n` +
      (name ? `• Name: ${name}\n` : '') +
      (number ? `• Number: ${number}\n` : '') +
      `Please share your best price and timeline.`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const baseJersey = jerseySvg({ primary: color, secondary: '#FFFFFF', number: '', name: '' })

  return (
    <div className="container-jrsy py-8 sm:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="kicker">Custom builder</span>
          <h1 className="mt-1 text-4xl font-black">Design your jersey</h1>
          <p className="mt-1 text-ink/50">Pick a fabric, colour, name & number, font and crest. Premium quality, team pricing.</p>
        </div>
        <button onClick={() => setSizeOpen(true)} className="btn-ghost text-xs"><Ruler size={15} /> Size chart</button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_460px]">
        {/* ---- live preview ---- */}
        <div className="relative flex items-center justify-center rounded-3xl bg-chalk p-6">
          <div className="relative w-full max-w-[420px]" style={{ aspectRatio: '600 / 700' }}>
            <img src={baseJersey} alt="Custom jersey preview" className="absolute inset-0 h-full w-full object-contain" />
            {logo && <img src={logo} alt="crest" className="absolute left-1/2 top-[30%] h-12 w-12 -translate-x-1/2 rounded object-contain" />}
            {/* name */}
            {name && (
              <div className="absolute left-1/2 top-[33%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-black uppercase tracking-widest text-white"
                   style={{ fontFamily: font.family, fontSize: 'clamp(12px, 3.4vw, 22px)', WebkitTextStroke: '1px #0B0B0F' }}>
                {name.slice(0, 12)}
              </div>
            )}
            {/* number */}
            <div className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 font-black text-white"
                 style={{ fontFamily: font.family, fontSize: 'clamp(64px, 22vw, 150px)', lineHeight: 1, WebkitTextStroke: '2px #0B0B0F' }}>
              {number || '0'}
            </div>
          </div>
        </div>

        {/* ---- controls ---- */}
        <div className="space-y-6">
          {/* fabric */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="label mb-0">Fabric</p>
              <span className="text-xs text-ink/40">MOQ = minimum order</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {FABRICS.map((f) => (
                <button key={f.id} onClick={() => setFabricId(f.id)}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${fabricId === f.id ? 'border-ink bg-ink text-paper' : 'border-ink/15 hover:border-ink'}`}>
                  <span className="text-sm font-bold">{f.name}</span>
                  <span className="text-right text-xs opacity-80">{money(f.price)}<br /><span className="opacity-60">MOQ {f.moq}</span></span>
                </button>
              ))}
            </div>
          </div>

          {/* colour */}
          <div>
            <p className="label">Base colour</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} style={{ background: c }} className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ${color === c ? 'ring-ink' : 'ring-transparent'}`} aria-label={`colour ${c}`} />
              ))}
            </div>
          </div>

          {/* sleeve + neck */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="label">Sleeve</p>
              <div className="space-y-1">
                {SLEEVES.map(([v, l, fee]) => (
                  <button key={v} onClick={() => setSleeve(v)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-bold transition ${sleeve === v ? 'border-ink bg-ink text-paper' : 'border-ink/15'}`}>
                    <span>{l}</span><span className="opacity-70">{fee ? `+${money(fee)}` : 'Free'}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="label">Neck</p>
              <div className="space-y-1">
                {NECKS.map(([v, l, fee]) => (
                  <button key={v} onClick={() => setNeck(v)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-bold transition ${neck === v ? 'border-ink bg-ink text-paper' : 'border-ink/15'}`}>
                    <span>{l}</span><span className="opacity-70">{fee ? `+${money(fee)}` : 'Free'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* name + number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="label">Back name <span className="font-normal text-ink/40">(free)</span></p>
              <input value={name} onChange={(e) => setName(e.target.value.slice(0, 12))} placeholder="RAHMAN" className="field uppercase" />
            </div>
            <div>
              <p className="label">Number <span className="font-normal text-ink/40">(free)</span></p>
              <input value={number} onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 2))} placeholder="10" className="field" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={frontNumber} onChange={(e) => setFrontNumber(e.target.checked)} className="h-4 w-4 accent-ink" />
            Add front number <span className="font-normal text-ink/50">(+{money(FRONT_NUMBER_FEE)})</span>
          </label>

          {/* font picker */}
          <div>
            <p className="label">Name & number font</p>
            <div className="grid grid-cols-3 gap-2">
              {FONTS.map((f) => (
                <button key={f.id} onClick={() => setFontId(f.id)}
                        className={`rounded-xl border py-2 transition ${fontId === f.id ? 'border-ink bg-ink text-paper' : 'border-ink/15 hover:border-ink'}`}>
                  <span className="block text-xl font-black leading-none" style={{ fontFamily: f.family }}>10</span>
                  <span className="block text-[10px] opacity-70">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* size + qty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="label">Size</p>
              <select value={size} onChange={(e) => setSize(e.target.value)} className="field">
                {SIZE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <p className="label">Quantity</p>
              <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className="field" />
            </div>
          </div>
          {belowMoq && (
            <p className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-700">
              <Info size={15} /> {fabric.name} needs at least {fabric.moq} pcs. Set {fabric.moq}+ or request a quote below.
            </p>
          )}

          {/* crest */}
          <div>
            <p className="label">Team crest / sponsor logo (optional)</p>
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

          {/* price breakdown */}
          <div className="card p-4">
            <div className="space-y-1 text-sm">
              <Row label={`${fabric.name} (base)`} value={money(fabric.price)} />
              {sleeveFee > 0 && <Row label={SLEEVES.find((s) => s[0] === sleeve)[1]} value={`+${money(sleeveFee)}`} />}
              {neckFee > 0 && <Row label={NECKS.find((n) => n[0] === neck)[1]} value={`+${money(neckFee)}`} />}
              {frontFee > 0 && <Row label="Front number" value={`+${money(frontFee)}`} />}
              <div className="flex items-center justify-between border-t border-ink/10 pt-1.5"><span className="text-ink/60">Per piece</span><span className="font-bold">{money(unit)}</span></div>
            </div>
            <div className="mt-2 flex items-center justify-between text-lg font-black">
              <span>Total ({qty} pcs)</span><span>{money(total)}</span>
            </div>
            <button onClick={addToCart} disabled={belowMoq} className={`mt-4 w-full ${belowMoq ? 'btn bg-ink/20 text-ink/50' : 'btn-volt'}`}>Add to cart</button>
            <button onClick={requestQuote} className="btn-ink mt-2 w-full">Request a quote on WhatsApp</button>
            <p className="mt-2 text-center text-[11px] text-ink/40">Customized products require advance payment.</p>
          </div>
        </div>
      </div>

      {/* ---- size chart modal ---- */}
      <Modal open={sizeOpen} onClose={() => setSizeOpen(false)} title="Size chart" wide>
        <p className="mb-3 text-xs text-ink/50">Measurements in inches. Pick the size closest to your chest measurement.</p>
        <div className="grid gap-6 sm:grid-cols-2">
          <SizeTable title="Men's" rows={MENS} />
          <SizeTable title="Kids" rows={KIDS} />
        </div>
        <p className="mt-4 rounded-xl bg-chalk p-3 text-xs text-ink/60">Kids sizes: body growth varies and the neck opening may not fit — please choose carefully.</p>
      </Modal>
    </div>
  )
}

function Row({ label, value }) {
  return <div className="flex items-center justify-between"><span className="text-ink/60">{label}</span><span className="font-bold">{value}</span></div>
}

function SizeTable({ title, rows }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-black">{title}</h4>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-ink/50"><tr><th className="py-1">Size</th><th className="py-1">Chest</th><th className="py-1">Length</th></tr></thead>
        <tbody className="divide-y divide-ink/5">
          {rows.map(([s, c, l]) => <tr key={s}><td className="py-1.5 font-bold">{s}</td><td className="py-1.5">{c}"</td><td className="py-1.5">{l}"</td></tr>)}
        </tbody>
      </table>
    </div>
  )
}
