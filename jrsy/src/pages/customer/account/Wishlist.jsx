import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useStore } from '../../../context/StoreContext'
import { api } from '../../../services/db'
import ProductCard from '../../../components/customer/ProductCard'
import { EmptyState, PageLoader } from '../../../components/ui'

export default function Wishlist() {
  const { wishlist } = useStore()
  const [products, setProducts] = useState(null)
  useEffect(() => { api.listProducts().then(setProducts) }, [])
  if (!products) return <PageLoader />

  const items = products.filter((p) => wishlist.includes(p.id))
  if (items.length === 0)
    return <EmptyState icon={Heart} title="Your wishlist is empty" hint="Tap the heart on any jersey to save it here." action={<Link to="/shop" className="btn-ink mt-2 text-xs">Browse jerseys</Link>} />

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
      {items.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
