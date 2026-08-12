import { useEffect, useState } from 'react'
import { Check, EyeOff, Trash2 } from 'lucide-react'
import { api } from '../../services/db'
import { useToast } from '../../context/ToastContext'
import { dateFmt } from '../../utils/format'
import { statusTone } from '../customer/account/statusTone'
import { AdminHeader, Confirm } from '../../components/admin/kit'
import { Stars, Badge, EmptyState, PageLoader } from '../../components/ui'

export default function Reviews() {
  const toast = useToast()
  const [reviews, setReviews] = useState(null)
  const [products, setProducts] = useState([])
  const [filter, setFilter] = useState('all')
  const [toDelete, setToDelete] = useState(null)

  const load = () => api.listReviews().then((r) => setReviews(r.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))))
  useEffect(() => { load(); api.listProducts().then(setProducts) }, [])

  const name = (id) => products.find((p) => p.id === id)?.name || 'Product'

  async function setApproved(r, approved) { await api.saveReview({ ...r, approved }); toast.success(approved ? 'Review approved.' : 'Review hidden.'); load() }
  async function confirmDelete() { await api.deleteReview(toDelete.id); setToDelete(null); toast.success('Review deleted.'); load() }

  if (!reviews) return <PageLoader />
  const list = reviews.filter((r) => filter === 'all' ? true : filter === 'approved' ? r.approved : !r.approved)

  return (
    <div>
      <AdminHeader title="Reviews" subtitle={`${reviews.length} reviews · ${reviews.filter((r) => !r.approved).length} pending`} />
      <div className="mb-4 flex gap-2">
        {['all', 'pending', 'approved'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 text-xs font-bold uppercase capitalize ${filter === f ? 'bg-ink text-paper' : 'bg-white text-ink/60 hover:bg-ink/5'}`}>{f}</button>
        ))}
      </div>

      {list.length === 0 ? <EmptyState title="No reviews" hint="Customer reviews will show up here for moderation." /> : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold">{r.customerName}</p>
                  {r.approved ? <Badge tone="green">Approved</Badge> : <Badge tone="amber">Pending</Badge>}
                </div>
                <div className="mt-1 flex items-center gap-2"><Stars value={r.rating} size={13} /><span className="text-xs text-ink/40">on {name(r.productId)} · {dateFmt(r.createdAt)}</span></div>
                <p className="mt-1.5 text-sm text-ink/70">{r.comment}</p>
              </div>
              <div className="flex gap-1">
                {!r.approved
                  ? <button onClick={() => setApproved(r, true)} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50" title="Approve"><Check size={16} /></button>
                  : <button onClick={() => setApproved(r, false)} className="rounded-lg p-2 text-ink/50 hover:bg-ink/5" title="Hide"><EyeOff size={16} /></button>}
                <button onClick={() => setToDelete(r)} className="rounded-lg p-2 text-ink/50 hover:bg-flare/10 hover:text-flare" title="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Confirm open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={confirmDelete} title="Delete review" message="This review will be permanently removed." />
    </div>
  )
}
