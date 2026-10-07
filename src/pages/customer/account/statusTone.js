export function statusTone(status) {
  switch (status) {
    case 'Delivered': return 'green'
    case 'Shipped': return 'blue'
    case 'Processing':
    case 'Confirmed': return 'amber'
    case 'Cancelled': return 'flare'
    default: return 'muted'
  }
}
export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
