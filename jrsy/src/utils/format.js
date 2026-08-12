export const money = (n, currency = '৳') => `${currency}${Number(n || 0).toLocaleString('en-BD')}`

export const discountPct = (price, sale) =>
  sale && sale < price ? Math.round(((price - sale) / price) * 100) : 0

export const dateFmt = (ts) => {
  if (!ts) return '—'
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const timeAgo = (ts) => {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export const slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
