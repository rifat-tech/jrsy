import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, Tag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useStore } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import { api } from '../../services/db'
import { money } from '../../utils/format'
import { EmptyState } from '../../components/ui'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export default function Cart() {
  const nav = useNavigate()
  const toast = useToast()
  const { items, subtotal, updateQty, changeSize, remove, coupon, setCoupon, discount } = useCart()
  const { settings } = useStore()
  const [code, setCode] = useState('')
  const [checking, setChecking] = useState(false)

  const delivery = subtotal >= settings.freeDeliveryThreshold ? 0 : items.length ? settings.deliveryCharge : 0
  const total = Math.max(0, subtotal - discount) + delivery

  async function applyCoupon() {
    if (!code.trim()) return
    setChecking(true)
    const res = await api.validateCoupon(code, subtotal)
    setChecking(false)
    if (res.ok) { setCoupon({ code: code.toUpperCase(), discount: res.discount }); toast.success(res.message) }
    else { setCoupon(null); toast.error(res.message) }
  }

  if (items.length === 0)
    return (
      <div className="container-jrsy py-24">
        <EmptyState icon={ShoppingBag} title="Your cart is empty" hint="Find your next kit in the store." action={<Link to="/shop" className="btn-volt mt-2">Shop jerseys</Link>} />
      </div>
    )

  return (
    <div className="container-jrsy py-8 sm:py-12">
      <h1 className="mb-8 text-4xl font-black">Your cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((it) => (
            <div key={`${it.productId}-${it.size}`} className="card flex gap-4 p-4">
              <Link to={`/product/${it.slug}`} className="shrink-0">
                <img src={it.image} alt="" className="h-28 w-24 rounded-lg bg-chalk object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/product/${it.slug}`} className="font-bold leading-tight hover:underline">{it.productName}</Link>
                    <div className="mt-1 flex items-center gap-2 text-xs text-ink/50">
                      <span>Size</span>
                      <select value={it.size} onChange={(e) => changeSize(it.productId, it.size, e.target.value)} className="rounded border border-ink/15 bg-white px-1.5 py-0.5 font-bold text-ink">
                        {SIZES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={() => remove(it.productId, it.size)} className="rounded-full p-1.5 text-ink/40 hover:bg-flare/10 hover:text-flare" aria-label="Remove"><Trash2 size={16} /></button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-ink/15">
                    <button onClick={() => updateQty(it.productId, it.size, it.quantity - 1)} className="p-2" aria-label="Decrease"><Minus size={14} /></button>
                    <span className="w-7 text-center text-sm font-bold">{it.quantity}</span>
                    <button onClick={() => updateQty(it.productId, it.size, it.quantity + 1)} className="p-2" aria-label="Increase"><Plus size={14} /></button>
                  </div>
                  <span className="font-display text-lg font-black">{money(it.price * it.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* summary */}
        <aside className="h-fit card p-5 lg:sticky lg:top-24">
          <h3 className="text-lg font-black">Order summary</h3>

          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Tag size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="field pl-9 uppercase" />
            </div>
            <button onClick={applyCoupon} disabled={checking} className="btn-ink px-4 text-xs">{checking ? '…' : 'Apply'}</button>
          </div>
          {coupon && <p className="mt-2 text-xs font-bold text-emerald-600">Coupon {coupon.code} applied.</p>}

          <div className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-sm">
            <Row label="Subtotal" value={money(subtotal)} />
            {discount > 0 && <Row label="Discount" value={`− ${money(discount)}`} accent />}
            <Row label="Delivery" value={delivery === 0 ? 'Free' : money(delivery)} />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4">
            <span className="font-bold">Total</span>
            <span className="font-display text-2xl font-black">{money(total)}</span>
          </div>
          {subtotal < settings.freeDeliveryThreshold && (
            <p className="mt-2 text-xs text-ink/50">Add {money(settings.freeDeliveryThreshold - subtotal)} more for free delivery.</p>
          )}
          <button onClick={() => nav('/checkout')} className="btn-volt mt-5 w-full">Checkout</button>
          <Link to="/shop" className="mt-2 block text-center text-xs font-bold uppercase tracking-wide text-ink/50 hover:text-ink">Continue shopping</Link>
        </aside>
      </div>
    </div>
  )
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink/60">{label}</span>
      <span className={`font-bold ${accent ? 'text-emerald-600' : ''}`}>{value}</span>
    </div>
  )
}
