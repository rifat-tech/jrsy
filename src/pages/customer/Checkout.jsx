import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import { api } from '../../services/db'
import { money } from '../../utils/format'
import { Spinner } from '../../components/ui'

export default function Checkout() {
  const nav = useNavigate()
  const toast = useToast()
  const { items, subtotal, discount, coupon, clear } = useCart()
  const { user } = useAuth()
  const { settings } = useStore()
  const [placing, setPlacing] = useState(false)
  const [method, setMethod] = useState('Cash on Delivery') // 'Cash on Delivery' | 'bKash' | 'Nagad'
  const [pay, setPay] = useState({ sender: '', trx: '' })
  const [form, setForm] = useState({
    fullName: user?.name || '', phone: user?.phone || '', email: user?.email || '',
    address: '', city: 'Dhaka', area: '', notes: '',
  })

  if (items.length === 0) return <Navigate to="/cart" replace />

  const hasCustom = items.some((i) => i.customization)
  const delivery = subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryCharge
  const total = Math.max(0, subtotal - discount) + delivery
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const mobile = method !== 'Cash on Delivery'
  const walletNumber = method === 'bKash' ? settings.bkashNumber : method === 'Nagad' ? settings.nagadNumber : ''

  async function placeOrder() {
    if (placing) return
    if (settings.storeOpen === false) {
      return toast.error('We are not taking orders right now. Please check back soon.')
    }
    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim() || !form.area.trim()) {
      return toast.error('Please fill in name, phone, address and area.')
    }
    const phone = form.phone.replace(/[\s-]/g, '')
    if (phone.replace(/\D/g, '').length < 8) {
      return toast.error('Please enter a valid phone number.')
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      return toast.error('That email address looks incorrect.')
    }
    if (mobile) {
      if (!walletNumber) return toast.error(`${method} is not available right now. Please choose another payment method.`)
      if (pay.sender.replace(/\D/g, '').length < 8) return toast.error(`Please enter the ${method} number you paid from.`)
      if (pay.trx.trim().length < 6) return toast.error(`Please enter your ${method} Transaction ID (TrxID).`)
    }
    setPlacing(true)
    try {
      const order = await api.createOrder({
        customerId: user?.uid || 'guest',
        customerName: form.fullName.trim(),
        phone, email: form.email.trim(),
        hasCustomItems: hasCustom,
        items: items.map((i) => ({
          productId: i.productId, productName: i.productName, image: i.image, size: i.size, quantity: i.quantity, price: i.price,
          // the full custom-jersey design (fabric, colour, name, number, font, uploaded-file id…) travels with the order
          // (the small preview picture stays in the cart; the order keeps only the file id so big team orders stay small)
          ...(i.customization ? { customization: { ...i.customization, logoThumb: undefined } } : {}),
        })),
        subtotal, discount, deliveryCharge: delivery, total,
        couponCode: coupon?.code || '',
        paymentMethod: method, paymentStatus: 'unpaid', orderStatus: 'Pending',
        // bKash / Nagad: what the customer told us, so you can match it in your app. You mark the order "paid" after checking.
        ...(mobile ? { paymentInfo: { senderNumber: pay.sender.replace(/[\s-]/g, ''), trxId: pay.trx.trim().toUpperCase(), amountDue: total } } : {}),
        shippingAddress: { fullName: form.fullName.trim(), address: form.address.trim(), city: form.city.trim(), area: form.area.trim(), notes: form.notes.trim() },
      })
      clear()
      toast.success('Order placed successfully!')
      nav(`/order/${order.id}`, { state: { order } })
    } catch (e) {
      console.error('Order failed:', e)
      toast.error('We could not place your order. Please try again, or order on WhatsApp so we can take it manually.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="container-jrsy py-8 sm:py-12">
      <h1 className="mb-8 text-4xl font-black">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {!user && (
            <div className="card flex items-center justify-between p-4 text-sm">
              <span className="text-ink/60">Have an account?</span>
              <Link to="/login" state={{ from: '/checkout' }} className="font-bold underline">Log in for faster checkout</Link>
            </div>
          )}

          <div className="card p-5">
            <h3 className="mb-4 text-lg font-black">Shipping details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.fullName} onChange={set('fullName')} required />
              <Field label="Phone" value={form.phone} onChange={set('phone')} required />
              <Field label="Email" value={form.email} onChange={set('email')} type="email" />
              <Field label="City" value={form.city} onChange={set('city')} />
              <div className="sm:col-span-2"><Field label="Address" value={form.address} onChange={set('address')} required /></div>
              <Field label="Area" value={form.area} onChange={set('area')} required />
              <Field label="Delivery instructions" value={form.notes} onChange={set('notes')} />
            </div>
          </div>

          {hasCustom && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-bold">Your cart has a custom jersey.</p>
              <p className="mt-0.5">Custom orders need an advance payment. After you place the order our team will contact you on <b>{form.phone || 'your phone number'}</b> to confirm the design and payment.</p>
            </div>
          )}

          <div className="card p-5">
            <h3 className="mb-4 text-lg font-black">Payment</h3>
            <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 ${!mobile ? 'border-ink bg-ink/5' : 'border-ink/15'}`}>
              <input type="radio" checked={!mobile} onChange={() => setMethod('Cash on Delivery')} className="accent-ink" />
              <div>
                <p className="font-bold">Cash on Delivery</p>
                <p className="text-xs text-ink/50">Pay when your jersey arrives.</p>
              </div>
            </label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {['bKash', 'Nagad', 'Card'].map((m) => {
                const number = m === 'bKash' ? settings.bkashNumber : m === 'Nagad' ? settings.nagadNumber : ''
                if (!number) {
                  return <div key={m} className="rounded-xl border border-dashed border-ink/20 py-3 text-center text-xs font-bold opacity-50">{m}<br /><span className="text-[10px] font-normal">Coming soon</span></div>
                }
                return (
                  <button key={m} type="button" onClick={() => setMethod(m)}
                    className={`rounded-xl border-2 py-3 text-center text-xs font-bold ${method === m ? 'border-ink bg-ink/5' : 'border-ink/15 hover:border-ink'}`}>
                    {m}<br /><span className="text-[10px] font-normal text-ink/50">Send money</span>
                  </button>
                )
              })}
            </div>

            {mobile && (
              <div className="mt-4 rounded-xl bg-chalk p-4 text-sm">
                <p className="font-bold">How to pay with {method}</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink/70">
                  <li>Open your {method} app and choose <b>Send Money</b>.</li>
                  <li>Send <b>{money(total)}</b> to <b className="select-all">{walletNumber}</b>.{hasCustom && ' For a custom jersey you can send just the advance amount — we will confirm it when we call you.'}</li>
                  <li>Type the number you paid from and the Transaction ID (TrxID) below, then place your order.</li>
                </ol>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label={`Your ${method} number`} required inputMode="tel" placeholder="01XXXXXXXXX" value={pay.sender} onChange={(e) => setPay((p) => ({ ...p, sender: e.target.value }))} />
                  <Field label="Transaction ID (TrxID)" required placeholder="e.g. 8N7A6D5EE3" value={pay.trx} onChange={(e) => setPay((p) => ({ ...p, trx: e.target.value }))} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* summary */}
        <aside className="h-fit card p-5 lg:sticky lg:top-24">
          <h3 className="text-lg font-black">Your order</h3>
          <div className="mt-4 max-h-56 space-y-3 overflow-y-auto">
            {items.map((it) => (
              <div key={`${it.productId}-${it.size}`} className="flex items-center gap-3">
                <img src={it.image} alt="" className="h-14 w-12 rounded bg-chalk object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{it.productName}</p>
                  <p className="text-xs text-ink/50">{it.size} × {it.quantity}</p>
                </div>
                <span className="text-sm font-bold">{money(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm">
            <Row label="Subtotal" value={money(subtotal)} />
            {discount > 0 && <Row label="Discount" value={`− ${money(discount)}`} />}
            <Row label="Delivery" value={delivery === 0 ? 'Free' : money(delivery)} />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4">
            <span className="font-bold">Total</span><span className="font-display text-2xl font-black">{money(total)}</span>
          </div>
          <button onClick={placeOrder} disabled={placing} className="btn-volt mt-5 w-full">
            {placing ? <Spinner size={16} /> : <><Lock size={15} /> Place order</>}
          </button>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, required, type = 'text', ...rest }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-flare"> *</span>}</label>
      <input type={type} className="field" {...rest} />
    </div>
  )
}
function Row({ label, value }) {
  return <div className="flex items-center justify-between"><span className="text-ink/60">{label}</span><span className="font-bold">{value}</span></div>
}
