import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal, Badge, Stars } from '../ui'
import { money, discountPct } from '../../utils/format'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'

export default function QuickView({ open, onClose, product }) {
  const { add } = useCart()
  const toast = useToast()
  const [size, setSize] = useState('')
  const pct = discountPct(product.price, product.salePrice)

  function addToCart() {
    if (!size) return toast.error('Please pick a size first.')
    add(product, size, 1)
    toast.success(`${product.name} (${size}) added to cart.`)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Quick view" wide>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-chalk">
          <img src={product.images?.[0]} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-ink/45">{product.team}</p>
          <h3 className="mt-1 text-2xl font-black leading-tight">{product.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <Stars value={product.rating} /> <span className="text-xs text-ink/50">({product.reviewCount} reviews)</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="font-display text-2xl font-black">{money(product.salePrice || product.price)}</span>
            {pct > 0 && <span className="text-ink/40 line-through">{money(product.price)}</span>}
            {pct > 0 && <Badge tone="flare">-{pct}%</Badge>}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">{product.shortDescription}</p>

          <p className="label mt-5">Select size</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const out = (product.sizeStock?.[s] ?? 0) <= 0
              return (
                <button
                  key={s}
                  disabled={out}
                  onClick={() => setSize(s)}
                  className={`h-10 min-w-[3rem] rounded-lg border px-3 text-sm font-bold transition ${
                    size === s ? 'border-ink bg-ink text-paper' : out ? 'cursor-not-allowed border-ink/10 text-ink/25 line-through' : 'border-ink/20 hover:border-ink'
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button onClick={addToCart} className="btn-volt flex-1">Add to cart</button>
            <Link to={`/product/${product.slug}`} onClick={onClose} className="btn-ghost flex-1">View details</Link>
          </div>
        </div>
      </div>
    </Modal>
  )
}
