import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Eye, Plus } from 'lucide-react'
import { Badge, Stars } from '../ui'
import { money, discountPct } from '../../utils/format'
import { useStore } from '../../context/StoreContext'
import QuickView from './QuickView'

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist } = useStore()
  const [quick, setQuick] = useState(false)
  const [hover, setHover] = useState(false)
  const pct = discountPct(product.price, product.salePrice)
  const wished = wishlist.includes(product.id)
  const soldOut = product.totalStock <= 0

  return (
    <>
      <div
        className="group relative flex flex-col"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-chalk">
          <Link to={`/product/${product.slug}`} aria-label={product.name}>
            <img
              src={product.images?.[hover && product.images[1] ? 1 : 0]}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </Link>

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.newArrival && <Badge tone="volt">New</Badge>}
            {pct > 0 && <Badge tone="flare">-{pct}%</Badge>}
            {soldOut && <Badge tone="ink">Sold Out</Badge>}
          </div>

          <button
            onClick={() => toggleWishlist(product.id)}
            className={`absolute right-3 top-3 rounded-full p-2 backdrop-blur transition ${wished ? 'bg-flare text-white' : 'bg-white/85 text-ink hover:bg-white'}`}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} className={wished ? 'fill-current' : ''} />
          </button>

          <button
            onClick={() => setQuick(true)}
            className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 rounded-full bg-ink py-2.5 text-xs font-bold uppercase tracking-wide text-paper opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Eye size={15} /> Quick view
          </button>
        </div>

        <div className="mt-3 flex flex-1 flex-col">
          <p className="text-[11px] font-bold uppercase tracking-widest text-ink/45">{product.team}</p>
          <Link to={`/product/${product.slug}`} className="mt-0.5 line-clamp-1 font-bold leading-tight hover:underline">
            {product.name}
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <Stars value={product.rating} size={12} />
            <span className="text-xs text-ink/40">({product.reviewCount})</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-display text-lg font-black">{money(product.salePrice || product.price)}</span>
            {pct > 0 && <span className="text-sm text-ink/40 line-through">{money(product.price)}</span>}
          </div>
        </div>
      </div>

      <QuickView open={quick} onClose={() => setQuick(false)} product={product} />
    </>
  )
}
