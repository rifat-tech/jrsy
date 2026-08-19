import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Ruler, Info } from 'lucide-react'
import { jerseySvg } from '../../utils/jersey'
import { uploadImage } from '../../services/storage'
import { api } from '../../services/db'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { money } from '../../utils/format'
import { PageLoader } from '../../components/ui'

const FRONT_NUMBER_FEE_FALLBACK = 15
const WHATSAPP = '8801515282978' // 01515282978 international

const MENS = [['XS',34,25],['S',36,26],['M',38,27],['L',40,28],['XL',42,29],['2XL',44,30],['3XL',46,31],['4XL',48,32],['5XL',50,33]]
const KIDS = [['2Y',24,17],['4Y',26,18],['6Y',28,19],['8Y',30,20],['10Y',32,22],['12Y',34,24]]
const SIZE_OPTIONS = ['XS','S','M','L','XL','2XL','3XL','4XL','5XL']

export default function CustomJersey() {
  const nav = useNavigate()
  const toast = useToast()
  const { add } = useCart()

  const [cfg, setCfg] = useState(null)
  const [fabricId, setFabricId] = useState('')
  const [color, setColor] = useState('#B4122A')
  const [sleeve, setSleeve] = useState('')
  const [neck, setNeck] = useState('')
  const [size, setSize] = useState('M')
  const [qty, setQty] = useState(1)
  const [name, setName] = useState('')
  const [number, setNumber] = useState('10')
  const [frontNumber, setFrontNumber] = useState(false)
  const [fontId, setFontId] = useState('')
  const [logo, setLogo] = useState('')
  const [uploading, setUploading] = useState(false)

  // load admin-managed config
  useEffect(() => {
    api.getCustomConfig().then((c) => {
      setCfg(c)
      setFabricId(c.fabrics[0]?.id || '')
      setSleeve(c.sleeves.find((s) => s.fee === 0)?.id || c.sleeves[0]?.id || '')
      setNeck(c.necks.find((n) => n.fee === 0)?.id || c.necks[0]?.id || '')
      setFontId(c.fonts[1]?.id || c.fonts[0]?.id || '')
      setColor(c.colors[0] || '#B4122A')
      setQty(c.fabrics[0]?.moq || 1)
    })
  }, [])

  if (!cfg) return <PageLoader label="Loading builder" />

  const fabric = cfg.fabrics.find((f) => f.id === fabricId) || cfg.fabrics[0]
  const font = cfg.fonts.find((f) => f.id === fontId) || cfg.fonts[0]
  const sleeveObj = cfg.sleeves.find((s) => s.id === sleeve) || cfg.sleeves[0]
  const neckObj = cfg.necks.find((n) => n.id === neck) || cfg.necks[0]
  const frontFee = frontNumber ? (Number(cfg.frontNumberFee) || FRONT_NUMBER_FEE_FALLBACK) : 0

  const unit = (fabric?.price || 0) + (sleeveObj?.fee || 0) + (neckObj?.fee || 0) + frontFee
  const belowMoq = qty < (fabric?.moq || 1)
  const total = unit * qty

  function pickFabric(f) { setFabricId(f.id); if (qty < f.moq) setQty(f.moq) }

  async function onLogo(e) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try { setLogo(await uploadImage(file, 'custom-jerseys')) } finally { setUploading(false) }
  }

  function addToCart() {
    if (belowMoq) return toast.error(`Minimum order for ${fabric.name} is ${fabric.moq} pcs.`)
    const custom = {
      id: 'custom-' + Date.now(),
      name: `Custom Jersey — ${fabric.name}`,
      slug: 'custom',
      images: [jerseySvg({ primary: color, secondary: '#FFFFFF', number: number || '00', name: name || 'CUSTOM' })],
      price: unit, salePrice: 0,
      customization: { fabric: fabric.name, color, sleeve: sleeveObj?.name, neck: neckObj?.name, font: font?.label, name, number, frontNumber, logo },
    }
    add(custom, size, qty)
    toast.success('Custom jersey added to cart.')
    nav('/cart')
  }

  function requestQuote() {
    const msg =
      `Hi JRSY! I'd like a quote for custom jerseys:\n` +
      `• Fabric: ${fabric?.name}\n` +
      `• Quantity: ${qty} pcs\n` +
      `• Sleeve: ${sleeveObj?.name}\n` +
      `• Neck: ${neckObj?.name}\n` +
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
        <a href="#sizechart" className="btn-ghost text-xs"><Ruler size={15} /> Size chart</a>
      </div>

      {/* Design gallery hero (Tribe-style) */}
      {(cfg.gallery || []).length > 0 && (
        <section className="mb-14">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {cfg.gallery.slice(0, 12).map((src, i) => (
              <div key={i} className="group aspect-square overflow-hidden rounded-2xl border border-ink/10 bg-chalk">
                <img src={src} alt={`Design ${i + 1}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-sm text-ink/50">Over {cfg.gallery.length} designs to personalise — or build your own below.</p>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_440px]">
        {/* live preview (sticky) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative mx-auto flex max-w-[460px] items-center justify-center rounded-3xl bg-chalk p-6">
            <div className="relative w-full max-w-[400px]" style={{ aspectRatio: '600 / 700' }}>
              <img src={baseJersey} alt="Custom jersey preview" className="absolute inset-0 h-full w-full object-contain" />
              {logo && <img src={logo} alt="crest" className="absolute left-1/2 top-[30%] h-12 w-12 -translate-x-1/2 rounded object-contain" />}
              {name && (
                <div className="absolute left-1/2 top-[33%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-black uppercase tracking-widest text-white"
                     style={{ fontFamily: font?.family, fontSize: 'clamp(12px, 3.4vw, 22px)', WebkitTextStroke: '1px #0B0B0F' }}>
                  {name.slice(0, 12)}
                </div>
              )}
              <div className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 font-black text-white"
                   style={{ fontFamily: font?.family, fontSize: 'clamp(64px, 22vw, 150px)', lineHeight: 1, WebkitTextStroke: '2px #0B0B0F' }}>
                {number || '0'}
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-ink/40">Live preview · colours, name, number & font update as you build.</p>
        </div>

        {/* controls */}
        <div className="space-y-6">
          {/* fabric with images */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="label mb-0">Fabric</p><span className="text-xs text-ink/40">MOQ = minimum order</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {cfg.fabrics.map((f) => (
                <button key={f.id} onClick={() => pickFabric(f)}
                        className={`flex items-center gap-2 rounded-xl border p-2 text-left transition ${fabricId === f.id ? 'border-ink ring-2 ring-ink' : 'border-ink/15 hover:border-ink'}`}>
                  <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-ink/10" style={{ background: f.color }}>
                    {f.image && <img src={f.image} alt="" className="h-full w-full object-cover" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{f.name}</span>
                    <span className="block text-[11px] text-ink/50">{money(f.price)} · MOQ {f.moq}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* colour */}
          <div>
            <p className="label">Base colour</p>
            <div className="flex flex-wrap gap-2">
              {cfg.colors.map((c) => (
                <button key={c} onClick={() => setColor(c)} style={{ background: c }} className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ${color === c ? 'ring-ink' : 'ring-transparent'}`} aria-label={`colour ${c}`} />
              ))}
            </div>
          </div>

          {/* sleeve + neck */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="label">Sleeve</p>
              <div className="space-y-1">
                {cfg.sleeves.map((s) => (
                  <button key={s.id} onClick={() => setSleeve(s.id)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-bold transition ${sleeve === s.id ? 'border-ink bg-ink text-paper' : 'border-ink/15'}`}>
                    <span>{s.name}</span><span className="opacity-70">{s.fee ? `+${money(s.fee)}` : 'Free'}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="label">Neck</p>
              <div className="space-y-1">
                {cfg.necks.map((n) => (
                  <button key={n.id} onClick={() => setNeck(n.id)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-bold transition ${neck === n.id ? 'border-ink bg-ink text-paper' : 'border-ink/15'}`}>
                    <span>{n.name}</span><span className="opacity-70">{n.fee ? `+${money(n.fee)}` : 'Free'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* name + number */}
          <div className="grid grid-cols-2 gap-3">
            <div><p className="label">Back name <span className="font-normal text-ink/40">(free)</span></p>
              <input value={name} onChange={(e) => setName(e.target.value.slice(0, 12))} placeholder="RAHMAN" className="field uppercase" /></div>
            <div><p className="label">Number <span className="font-normal text-ink/40">(free)</span></p>
              <input value={number} onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 2))} placeholder="10" className="field" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={frontNumber} onChange={(e) => setFrontNumber(e.target.checked)} className="h-4 w-4 accent-ink" />
            Add front number <span className="font-normal text-ink/50">(+{money(Number(cfg.frontNumberFee) || FRONT_NUMBER_FEE_FALLBACK)})</span>
          </label>

          {/* font */}
          <div>
            <p className="label">Name & number font</p>
            <div className="grid grid-cols-3 gap-2">
              {cfg.fonts.map((f) => (
                <button key={f.id || f.label} onClick={() => setFontId(f.id)}
                        className={`rounded-xl border py-2 transition ${fontId === f.id ? 'border-ink bg-ink text-paper' : 'border-ink/15 hover:border-ink'}`}>
                  <span className="block text-xl font-black leading-none" style={{ fontFamily: f.family }}>10</span>
                  <span className="block text-[10px] opacity-70">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* size + qty */}
          <div className="grid grid-cols-2 gap-3">
            <div><p className="label">Size</p>
              <select value={size} onChange={(e) => setSize(e.target.value)} className="field">{SIZE_OPTIONS.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div><p className="label">Quantity</p>
              <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className="field" /></div>
          </div>
          {belowMoq && (
            <p className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-700">
              <Info size={15} /> {fabric?.name} needs at least {fabric?.moq} pcs. Set {fabric?.moq}+ or request a quote below.
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

          {/* price */}
          <div className="card p-4">
            <div className="space-y-1 text-sm">
              <Row label={`${fabric?.name} (base)`} value={money(fabric?.price || 0)} />
              {sleeveObj?.fee > 0 && <Row label={sleeveObj.name} value={`+${money(sleeveObj.fee)}`} />}
              {neckObj?.fee > 0 && <Row label={neckObj.name} value={`+${money(neckObj.fee)}`} />}
              {frontFee > 0 && <Row label="Front number" value={`+${money(frontFee)}`} />}
              <div className="flex items-center justify-between border-t border-ink/10 pt-1.5"><span className="text-ink/60">Per piece</span><span className="font-bold">{money(unit)}</span></div>
            </div>
            <div className="mt-2 flex items-center justify-between text-lg font-black"><span>Total ({qty} pcs)</span><span>{money(total)}</span></div>
            <button onClick={addToCart} disabled={belowMoq} className={`mt-4 w-full ${belowMoq ? 'btn bg-ink/20 text-ink/50' : 'btn-volt'}`}>Add to cart</button>
            <button onClick={requestQuote} className="btn-ink mt-2 w-full">Request a quote on WhatsApp</button>
            {cfg.note && <p className="mt-2 text-center text-[11px] text-ink/40">{cfg.note}</p>}
          </div>
        </div>
      </div>

      {/* ============ SHOWCASE SECTIONS (Tribe-style) ============ */}

      {/* Price table */}
      <section className="mt-20">
        <div className="mb-6 text-center">
          <span className="kicker">Price table</span>
          <h2 className="mt-1 text-3xl font-black sm:text-4xl">Affordable, yet premium</h2>
          <p className="mx-auto mt-2 max-w-2xl text-ink/50">Base prices are for round-neck half-sleeve jerseys by fabric quality. Extra options are in the add-ons chart.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink text-left text-xs uppercase tracking-wide text-paper">
                  <tr><th className="px-4 py-3">Fabric</th><th className="px-4 py-3">MOQ</th><th className="px-4 py-3 text-right">Price / pc</th></tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {cfg.fabrics.map((f) => (
                    <tr key={f.id} className="hover:bg-ink/[0.02]">
                      <td className="px-4 py-3 font-bold">
                        <span className="flex items-center gap-2">
                          <span className="h-6 w-6 overflow-hidden rounded border border-ink/10" style={{ background: f.color }}>{f.image && <img src={f.image} alt="" className="h-full w-full object-cover" />}</span>
                          {f.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/60">{f.moq} pcs</td>
                      <td className="px-4 py-3 text-right font-black">{money(f.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-ink/60">Add-ons</h3>
            <AddonRow title="Sleeve" items={cfg.sleeves} />
            <AddonRow title="Neck" items={cfg.necks} />
            <div className="mt-3 border-t border-ink/10 pt-3">
              <div className="flex items-center justify-between text-sm"><span className="text-ink/60">Back name</span><span className="font-bold">Free</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-ink/60">Back number</span><span className="font-bold">Free</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-ink/60">Front number</span><span className="font-bold">+{money(Number(cfg.frontNumberFee) || 15)}</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Fabric */}
      <section className="mt-20 rounded-3xl bg-ink px-6 py-12 text-paper">
        <div className="mb-8 text-center">
          <span className="kicker text-volt">Fabric</span>
          <h2 className="mt-1 text-3xl font-black sm:text-4xl">Soft, comfortable, premium feel</h2>
          <p className="mx-auto mt-2 max-w-xl text-paper/60">Our fabrics are carefully selected and rigorously tested for comfort, durability and style — a soft, breathable feel every time you wear it.</p>
        </div>
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {cfg.fabrics.map((f) => (
            <div key={f.id} className="text-center">
              <div className="mx-auto aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-white/10" style={{ background: f.color }}>
                {f.image && <img src={f.image} alt={f.name} className="h-full w-full object-cover" />}
              </div>
              <p className="mt-2 text-xs font-bold">{f.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Size chart */}
      <section id="sizechart" className="mt-20 scroll-mt-24">
        <div className="mb-6 text-center">
          <span className="kicker">Size chart</span>
          <h2 className="mt-1 text-3xl font-black sm:text-4xl">Your perfect fit, guaranteed</h2>
          <p className="mx-auto mt-2 max-w-xl text-ink/50">Measurements in inches. Pick the size closest to your chest measurement.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="card p-5"><SizeTable title="Men's" rows={MENS} /></div>
          <div className="card p-5"><SizeTable title="Kids" rows={KIDS} /></div>
        </div>
        <p className="mx-auto mt-4 max-w-2xl rounded-xl bg-chalk p-3 text-center text-xs text-ink/60">Kids sizes: body growth varies and the neck opening may not fit — please choose carefully.</p>
      </section>

      {/* Font collection */}
      <section className="mt-20">
        <div className="mb-6 text-center">
          <span className="kicker">Font collection</span>
          <h2 className="mt-1 text-3xl font-black sm:text-4xl">Make your name stand out</h2>
          <p className="mx-auto mt-2 max-w-xl text-ink/50">A selection of premium jersey fonts. Choose your favourite for your name and number.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {cfg.fonts.map((f) => (
            <div key={f.id || f.label} className="card flex flex-col items-center justify-center gap-1 p-5">
              <span className="text-3xl font-black leading-none" style={{ fontFamily: f.family }}>17</span>
              <span className="text-sm font-bold" style={{ fontFamily: f.family }}>JRSY</span>
              <span className="mt-1 text-[10px] uppercase tracking-wide text-ink/40">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Shipping partners + charges */}
      <ShippingSection couriers={cfg.shipping || []} />
    </div>
  )
}

function Row({ label, value }) {
  return <div className="flex items-center justify-between"><span className="text-ink/60">{label}</span><span className="font-bold">{value}</span></div>
}
function AddonRow({ title, items }) {
  return (
    <div className="mb-3">
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/40">{title}</p>
      {items.map((it) => (
        <div key={it.id} className="flex items-center justify-between text-sm">
          <span className="text-ink/60">{it.name}</span>
          <span className="font-bold">{it.fee ? `+${money(it.fee)}` : 'Free'}</span>
        </div>
      ))}
    </div>
  )
}

function ShippingSection({ couriers }) {
  const [tab, setTab] = useState(couriers[0]?.id || '')
  if (!couriers.length) return null
  const active = couriers.find((c) => c.id === tab) || couriers[0]
  return (
    <section className="mb-4 mt-20">
      <div className="mb-6 text-center">
        <span className="kicker">Delivery</span>
        <h2 className="mt-1 text-3xl font-black sm:text-4xl">Shipping charge</h2>
        <p className="mx-auto mt-2 max-w-2xl text-ink/50">We work with trusted courier partners across Bangladesh. Charges depend on the number of pieces and the destination.</p>
      </div>

      {/* courier tabs */}
      <div className="mb-5 flex flex-wrap justify-center gap-2">
        {couriers.map((c) => (
          <button key={c.id} onClick={() => setTab(c.id)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${active.id === c.id ? 'bg-ink text-paper' : 'bg-white text-ink/60 hover:bg-ink/5'}`}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-2xl">
        <p className="mb-3 text-center text-sm text-ink/60"><span className="font-bold">{active.name}</span> — {active.kind} · {active.info}</p>
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink/[0.04] text-left text-xs uppercase tracking-wide text-ink/50">
                <tr><th className="px-4 py-3">Pieces</th><th className="px-4 py-3">Inside Dhaka</th><th className="px-4 py-3">Outside Dhaka</th></tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {active.rates.map((r, i) => (
                  <tr key={i} className="hover:bg-ink/[0.02]">
                    <td className="px-4 py-2.5 font-bold">{r[0]}</td>
                    <td className="px-4 py-2.5">{money(r[1])}</td>
                    <td className="px-4 py-2.5">{r[2] ? money(r[2]) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
function SizeTable({ title, rows }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-black">{title}</h4>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-ink/50"><tr><th className="py-1">Size</th><th className="py-1">Chest</th><th className="py-1">Length</th></tr></thead>
        <tbody className="divide-y divide-ink/5">{rows.map(([s, c, l]) => <tr key={s}><td className="py-1.5 font-bold">{s}</td><td className="py-1.5">{c}"</td><td className="py-1.5">{l}"</td></tr>)}</tbody>
      </table>
    </div>
  )
}
