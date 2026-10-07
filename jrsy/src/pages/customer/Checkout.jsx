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
  const [form, setForm] = useState({
    fullName: user?.name || '', phone: user?.phone || '', email: user?.email || '',
    address: '', city: 'Dhaka', area: '', notes: '',
  })

  if (items.length === 0) return <Navigate to="/cart" replace />

  const delivery = subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryCharge
  const total = Math.max(0, subtotal - discount) + delivery
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function placeOrder() {
    if (!form.fullName || !form.phone || !form.address || !form.area) {
      return toast.error('Please fill in name, phone, address and area.')
    }
    setPlacing(true)
    try {
      const order = await api.createOrder({
        customerId: user?.uid || 'guest',
        customerName: form.fullName,
        phone: form.phone, email: form.email,
        items: items.map((i) => ({ productId: i.productId, productName: i.productName, image: i.image, size: i.size, quantity: i.quantity, price: i.price })),
        subtotal, discount, deliveryCharge: delivery, total,
        couponCode: coupon?.code || '',
        paymentMethod: 'Cash on Delivery', paymentStatus: 'unpaid', orderStatus: 'Pending',
        shippingAddress: { fullName: form.fullName, address: form.address, city: form.city, area: form.area, notes: form.notes },
      })
      clear()
      toast.success('Order placed successfully!')
      nav(`/order/${order.id}`, { state: { order } })
    } catch (e) {
      toast.error('Something went wrong. Please try again.')
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

          <div className="card p-5">
            <h3 className="mb-4 text-lg font-black">Payment</h3>
            <label className="flex items-center gap-3 rounded-xl border-2 border-ink bg-ink/5 p-4">
              <input type="radio" checked readOnly className="accent-ink" />
              <div>
                <p className="font-bold">Cash on Delivery</p>
                <p className="text-xs text-ink/50">Pay when your jersey arrives.</p>
              </div>
            </label>
            <div className="mt-3 grid grid-cols-3 gap-2 opacity-50">
              {['bKash', 'Nagad', 'Card'].map((m) => (
                <div key={m} className="rounded-xl border border-dashed border-ink/20 py-3 text-center text-xs font-bold">{m}<br /><span className="text-[10px] font-normal">Coming soon</span></div>
              ))}
            </div>
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
