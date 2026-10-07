import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Heart, Minus, Plus, Truck, RefreshCw, ShieldCheck, Ruler, Star } from 'lucide-react'
import { api } from '../../services/db'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import { money, discountPct, dateFmt } from '../../utils/format'
import { PageLoader, Badge, Stars, Modal, EmptyState } from '../../components/ui'
import ProductCard from '../../components/customer/ProductCard'

const TABS = ['Details', 'Reviews', 'Shipping']

export default function ProductDetails() {
  const { slug } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const { add } = useCart()
  const { user } = useAuth()
  const { wishlist, toggleWishlist } = useStore()

  const [product, setProduct] = useState(undefined)
  const [all, setAll] = useState([])
  const [reviews, setReviews] = useState([])
  const [orders, setOrders] = useState([])
  const [activeImg, setActiveImg] = useState(0)
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('Details')
  const [guideOpen, setGuideOpen] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    setActiveImg(0); setSize(''); setQty(1); setTab('Details')
    api.listProducts().then((list) => {
      setAll(list)
      setProduct(list.find((p) => p.slug === slug) || null)
    })
  }, [slug])

  useEffect(() => {
    if (product) api.listReviews(product.id).then((r) => setReviews(r.filter((x) => x.approved)))
  }, [product?.id])

  useEffect(() => {
    if (user?.uid) api.listOrdersByCustomer(user.uid).then(setOrders)
  }, [user?.uid])

  const related = useMemo(
    () => (product ? all.filter((p) => p.category === product.category && p.id !== product.id && p.status === 'active').slice(0, 4) : []),
    [product, all]
  )

  const hasPurchased = useMemo(
    () => (product && orders.some((o) => o.items?.some((i) => i.productId === product.id))),
    [orders, product]
  )

  if (product === undefined) return <PageLoader label="Loading jersey" />
  if (product === null)
    return <div className="container-jrsy py-24"><EmptyState title="Jersey not found" hint="This product may have been removed." action={<Link to="/shop" className="btn-ink mt-2 text-xs">Back to shop</Link>} /></div>

  const pct = discountPct(product.price, product.salePrice)
  const wished = wishlist.includes(product.id)
  const sizeStockLeft = size ? product.sizeStock?.[size] ?? 0 : null

  function addToCart(buyNow = false) {
    if (!size) return toast.error('Please select a size.')
    if ((product.sizeStock?.[size] ?? 0) < qty) return toast.error('Not enough stock for that size.')
    add(product, size, qty)
    if (buyNow) return nav('/cart')
    toast.success(`${product.name} (${size}) × ${qty} added to cart.`)
  }

  async function submitReview() {
    if (!reviewForm.comment.trim()) return toast.error('Write a short comment.')
    await api.saveReview({
      productId: product.id, customerName: user?.name || 'Customer',
      rating: reviewForm.rating, comment: reviewForm.comment, approved: !api.demo ? false : true, createdAt: Date.now(),
    })
    setReviewForm({ rating: 5, comment: '' })
    toast.success(api.demo ? 'Review posted.' : 'Review submitted for approval.')
    api.listReviews(product.id).then((r) => setReviews(r.filter((x) => x.approved)))
  }

  return (
    <div className="container-jrsy py-8 sm:py-12">
      <nav className="mb-6 text-xs font-medium text-ink/40">
        <Link to="/" className="hover:text-ink">Home</Link> / <Link to="/shop" className="hover:text-ink">Shop</Link> / <span className="text-ink/70 capitalize">{product.category.replace(/-/g, ' ')}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* gallery */}
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-chalk">
            <img src={product.images?.[activeImg]} alt={product.name} className="aspect-[4/5] w-full object-cover" />
            {pct > 0 && <div className="absolute left-4 top-4"><Badge tone="flare">-{pct}%</Badge></div>}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`h-20 w-16 overflow-hidden rounded-lg border-2 ${activeImg === i ? 'border-ink' : 'border-transparent'}`}>
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* info */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-ink/45">{product.team} · {product.season}</p>
          <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Stars value={product.rating} /> <span className="text-sm text-ink/50">{product.rating} ({reviews.length} reviews)</span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="font-display text-3xl font-black">{money(product.salePrice || product.price)}</span>
            {pct > 0 && <span className="text-lg text-ink/40 line-through">{money(product.price)}</span>}
          </div>

          <p className="mt-4 leading-relaxed text-ink/60">{product.shortDescription}</p>

          {/* size */}
          <div className="mt-6 flex items-center justify-between">
            <p className="label mb-0">Size</p>
            <button onClick={() => setGuideOpen(true)} className="inline-flex items-center gap-1 text-xs font-bold text-ink/60 hover:text-ink"><Ruler size={14} /> Size guide</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const out = (product.sizeStock?.[s] ?? 0) <= 0
              return (
                <button key={s} disabled={out} onClick={() => setSize(s)} className={`h-11 min-w-[3.25rem] rounded-lg border px-3 font-bold transition ${size === s ? 'border-ink bg-ink text-paper' : out ? 'cursor-not-allowed border-ink/10 text-ink/25 line-through' : 'border-ink/20 hover:border-ink'}`}>{s}</button>
              )
            })}
          </div>
          {size && (
            <p className={`mt-2 text-xs font-bold ${sizeStockLeft > 5 ? 'text-emerald-600' : sizeStockLeft > 0 ? 'text-amber-600' : 'text-flare'}`}>
              {sizeStockLeft > 0 ? `${sizeStockLeft} left in ${size}` : 'Out of stock'}
            </p>
          )}

          {/* qty + actions */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-ink/15">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3" aria-label="Decrease"><Minus size={16} /></button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3" aria-label="Increase"><Plus size={16} /></button>
            </div>
            <button onClick={() => toggleWishlist(product.id)} className={`rounded-full border p-3 ${wished ? 'border-flare bg-flare text-white' : 'border-ink/15 hover:border-ink'}`} aria-label="Wishlist">
              <Heart size={18} className={wished ? 'fill-current' : ''} />
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button onClick={() => addToCart(false)} disabled={product.totalStock <= 0} className="btn-ink flex-1">Add to cart</button>
            <button onClick={() => addToCart(true)} disabled={product.totalStock <= 0} className="btn-volt flex-1">Buy now</button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-ink/10 pt-6 text-center">
            {[[Truck, 'Fast delivery'], [ShieldCheck, 'Authentic'], [RefreshCw, 'Easy exchange']].map(([Icon, t]) => (
              <div key={t} className="flex flex-col items-center gap-1 text-xs font-bold text-ink/60"><Icon size={18} /> {t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-14">
        <div className="flex gap-6 border-b border-ink/10">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 pb-3 text-sm font-bold uppercase tracking-wide ${tab === t ? 'border-ink text-ink' : 'border-transparent text-ink/45 hover:text-ink'}`}>
              {t}{t === 'Reviews' ? ` (${reviews.length})` : ''}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === 'Details' && (
            <div className="max-w-2xl space-y-4 text-ink/70">
              <p className="leading-relaxed">{product.description}</p>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                <li><span className="text-ink/40">SKU:</span> {product.sku}</li>
                <li><span className="text-ink/40">Type:</span> {product.jerseyType}</li>
                <li><span className="text-ink/40">Team:</span> {product.team}</li>
                <li><span className="text-ink/40">Season:</span> {product.season}</li>
              </ul>
            </div>
          )}

          {tab === 'Reviews' && (
            <div className="max-w-2xl">
              {reviews.length === 0 ? (
                <p className="text-ink/50">No reviews yet. Be the first to review this jersey.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="card p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-bold">{r.customerName}</p>
                        <span className="text-xs text-ink/40">{dateFmt(r.createdAt)}</span>
                      </div>
                      <Stars value={r.rating} className="mt-1" />
                      <p className="mt-2 text-sm text-ink/70">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* write review */}
              <div className="mt-8 card p-5">
                <h4 className="text-lg font-black">Write a review</h4>
                {!user ? (
                  <p className="mt-2 text-sm text-ink/50">Please <Link to="/login" className="font-bold underline">log in</Link> to leave a review.</p>
                ) : !hasPurchased && !api.demo ? (
                  <p className="mt-2 text-sm text-ink/50">Only customers who purchased this jersey can review it.</p>
                ) : (
                  <div className="mt-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button key={i} onClick={() => setReviewForm((f) => ({ ...f, rating: i }))} aria-label={`${i} star`}>
                          <Star size={22} className={i <= reviewForm.rating ? 'fill-volt-dim text-volt-dim' : 'text-ink/20'} />
                        </button>
                      ))}
                    </div>
                    <textarea value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))} rows={3} placeholder="How was the fit and quality?" className="field mt-3" />
                    <button onClick={submitReview} className="btn-ink mt-3 text-xs">Post review</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'Shipping' && (
            <div className="max-w-2xl space-y-3 text-ink/70">
              <p>Orders are dispatched within 24–48 hours. Inside Dhaka delivery takes 1–2 days; outside Dhaka 3–5 days.</p>
              <p>Free delivery on orders over ৳3000. Cash on Delivery available nationwide.</p>
              <p>Easy size exchange within 7 days if the jersey is unworn with tags attached.</p>
            </div>
          )}
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 text-2xl font-black">You might also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* size guide */}
      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="Size guide">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-ink/50">
              <th className="py-2">Size</th><th>Chest (in)</th><th>Length (in)</th></tr>
          </thead>
          <tbody>
            {[['S', '36–38', '27'], ['M', '38–40', '28'], ['L', '40–42', '29'], ['XL', '42–44', '30'], ['XXL', '44–46', '31']].map((r) => (
              <tr key={r[0]} className="border-b border-ink/5"><td className="py-2 font-bold">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-ink/50">Measurements are approximate. For a relaxed fit, size up.</p>
      </Modal>
    </div>
  )
}
