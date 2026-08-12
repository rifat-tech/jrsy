import { jerseySvg } from '../utils/jersey'

const now = Date.now()
const ago = (d) => now - d * 86400000
const P = (name) => `/products/${name}.jpg` // real product photos in /public/products

export const seedCategories = [
  { id: 'football', name: 'Football', slug: 'football', group: 'Football', order: 1, active: true, image: '' },
  { id: 'club-jerseys', name: 'Club Jerseys', slug: 'club-jerseys', group: 'Football', order: 2, active: true, image: '' },
  { id: 'national-teams', name: 'National Teams', slug: 'national-teams', group: 'Football', order: 3, active: true, image: '' },
  { id: 'retro', name: 'Retro Jerseys', slug: 'retro', group: 'Football', order: 4, active: true, image: '' },
  { id: 'cricket', name: 'Cricket', slug: 'cricket', group: 'Cricket', order: 5, active: true, image: '' },
  { id: 'franchise', name: 'Franchise Jerseys', slug: 'franchise', group: 'Cricket', order: 6, active: true, image: '' },
  { id: 'accessories', name: 'Accessories', slug: 'accessories', group: 'Custom', order: 7, active: true, image: '/products/cap-black.jpg' },
  { id: 'custom', name: 'Custom Jersey', slug: 'custom', group: 'Custom', order: 8, active: true, image: '' },
]

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']
const stock = (arr) => SIZES.reduce((o, s, i) => ((o[s] = arr[i] ?? 0), o), {})

function make(p) {
  const images = p.images || [
    jerseySvg({ primary: p.c1, secondary: p.c2, number: p.number, name: p.short, pattern: p.pattern }),
    jerseySvg({ primary: p.c2, secondary: p.c1, number: p.number, name: p.short, pattern: 'plain' }),
  ]
  const sizeStock = p.sizeStock || stock(p.stock || [8, 20, 30, 18, 6])
  const total = Object.values(sizeStock).reduce((a, b) => a + b, 0)
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category: p.category,
    subcategory: p.subcategory || '',
    team: p.team,
    season: p.season || '2025/26',
    jerseyType: p.jerseyType || 'Home',
    brand: 'JRSY',
    description:
      p.description ||
      `Match-grade ${p.team} ${p.jerseyType || 'Home'} jersey. Breathable moisture-wicking knit, tailored athletic fit, and heat-pressed detailing built to last from the pitch to the streets.`,
    shortDescription: p.shortDescription || `${p.team} ${p.season || ''} ${p.jerseyType || 'Home'} kit`,
    price: p.price,
    salePrice: p.salePrice || 0,
    sizes: SIZES,
    sizeStock,
    totalStock: total,
    images,
    status: 'active',
    featured: !!p.featured,
    newArrival: !!p.newArrival,
    bestSeller: !!p.bestSeller,
    rating: p.rating || 4.6,
    reviewCount: p.reviewCount || 12,
    sold: p.sold || 40,
    createdAt: p.createdAt || ago(20),
    updatedAt: now,
  }
}

export const seedProducts = [
  make({ id: 'p1', name: 'Good Vibes Home Kit', slug: 'good-vibes-home-kit', sku: 'JRSY-FB-001', category: 'club-jerseys', team: 'Crimson FC', jerseyType: 'Home', images: [P('kit-goodvibes'), P('kit-crimson-navy')], description: 'Sublimated Crimson FC home kit with all-over dye print, ventilated athletic fit and a smooth number-plate back. Customisable with your name, number, sponsor and team logo.', shortDescription: 'Crimson FC 2025/26 sublimated home kit', price: 2490, salePrice: 1990, featured: true, bestSeller: true, sold: 180, rating: 4.8, reviewCount: 42, createdAt: ago(30) }),
  make({ id: 'p2', name: 'Blue Fade Away Jersey', slug: 'blue-fade-away-jersey', sku: 'JRSY-FB-002', category: 'club-jerseys', team: 'Sky Blues', jerseyType: 'Away', images: [P('jersey-blue-fade'), P('jersey-navy-sponsor')], description: 'Sky Blues away jersey with a crisp blue-to-white fade, moisture-wicking knit and heat-pressed detailing. Front and back name-set ready.', shortDescription: 'Sky Blues away fade jersey', price: 2390, featured: true, newArrival: true, sold: 96, createdAt: ago(5) }),
  make({ id: 'p3', name: 'Ipsum Gradient Jersey', slug: 'ipsum-gradient-jersey', sku: 'JRSY-NT-003', category: 'national-teams', team: 'Ipsum FC', jerseyType: 'Home', images: [P('jersey-ipsum-red')], description: 'Bold red-to-indigo gradient national jersey with a modern collar and pro-cut sleeves. Breathable and built for match day.', shortDescription: 'Ipsum FC gradient home jersey', price: 2690, salePrice: 2290, bestSeller: true, sold: 220, rating: 4.9, reviewCount: 63, createdAt: ago(40) }),
  make({ id: 'p4', name: 'Red Nation Full Kit', slug: 'red-nation-full-kit', sku: 'JRSY-NT-004', category: 'national-teams', team: 'Los Rojos', jerseyType: 'Home', images: [P('kit-red-full')], description: 'Complete match kit — jersey, shorts and socks — in a clean red-and-navy scheme. Everything you need to kit out the whole squad.', shortDescription: 'Jersey + shorts + socks full kit', price: 3290, featured: true, newArrival: true, sold: 140, createdAt: ago(3) }),
  make({ id: 'p5', name: 'Deploy Heritage Jersey', slug: 'deploy-heritage-jersey', sku: 'JRSY-RT-005', category: 'retro', team: 'Heritage XI', jerseyType: 'Retro', images: [P('kit-crimson-duo'), P('kit-crimson-navy')], description: 'Retro-inspired Deploy kit in dual navy and crimson colourways with a soundwave graphic down the centre. Placeholder-ready for your crest and sponsor.', shortDescription: 'Heritage XI retro dual kit', price: 2990, salePrice: 2490, bestSeller: true, sold: 74, createdAt: ago(60) }),
  make({ id: 'p6', name: 'Night Kit Goalkeeper Jersey', slug: 'night-kit-goalkeeper-jersey', sku: 'JRSY-FB-006', category: 'club-jerseys', team: 'Crimson FC', jerseyType: 'GK', images: [P('jersey-navy-sponsor'), P('kit-crimson-duo')], description: 'Long-wearing goalkeeper jersey in deep navy with a subtle print and sponsor block. Padded-friendly athletic cut.', shortDescription: 'Crimson FC goalkeeper night kit', price: 2590, newArrival: true, sold: 33, stock: [4, 10, 12, 6, 2], createdAt: ago(2) }),
  make({ id: 'p7', name: 'Tigers Pro Cricket Jersey', slug: 'tigers-pro-cricket-jersey', sku: 'JRSY-CR-007', category: 'cricket', team: 'Tigers', season: '2026', jerseyType: 'ODI', images: [P('kit-crimson-navy')], description: 'Tigers ODI cricket jersey in red and navy with lightweight breathable mesh panels. Sublimation-ready for team names and sponsors.', shortDescription: 'Tigers 2026 ODI cricket jersey', price: 2290, salePrice: 1890, featured: true, bestSeller: true, sold: 260, rating: 4.9, reviewCount: 88, createdAt: ago(25) }),
  make({ id: 'p8', name: 'Blue Storm T20 Jersey', slug: 'blue-storm-t20-jersey', sku: 'JRSY-CR-008', category: 'cricket', team: 'Men in Blue', season: '2026', jerseyType: 'T20', images: [P('jersey-blue-fade')], description: 'T20 cricket jersey with an electric blue fade and quick-dry knit. Made for fast-format match days.', shortDescription: 'Men in Blue 2026 T20 jersey', price: 2390, featured: true, sold: 190, createdAt: ago(12) }),
  make({ id: 'p9', name: 'Pro Cricket Trousers', slug: 'pro-cricket-trousers', sku: 'JRSY-CR-009', category: 'cricket', team: 'JRSY Pro', season: '2026', jerseyType: 'Bottoms', images: [P('trousers-cricket'), P('trousers-red')], description: 'Sublimated cricket trousers in red and black with an elastic drawcord waist and tapered athletic leg. Pairs with any JRSY cricket top.', shortDescription: 'Sublimated pro cricket trousers', price: 1690, newArrival: true, sold: 58, createdAt: ago(4) }),
  make({ id: 'p10', name: 'Match Trousers — Red', slug: 'match-trousers-red', sku: 'JRSY-CR-010', category: 'cricket', team: 'JRSY Pro', season: '2026', jerseyType: 'Bottoms', images: [P('trousers-red')], description: 'Lightweight red match trousers with a comfortable stretch waistband. Team-ready and easy to customise.', shortDescription: 'Red match trousers', price: 1590, salePrice: 1290, sold: 71, createdAt: ago(9) }),
  make({ id: 'p11', name: 'Street Third Kit Jersey', slug: 'street-third-kit-jersey', sku: 'JRSY-FB-011', category: 'club-jerseys', team: 'Sky Blues', jerseyType: 'Third', images: [P('kit-crimson-navy'), P('jersey-ipsum-red')], description: 'Street-ready third kit with a bold graphic print — as good off the pitch as on it. Name-set ready.', shortDescription: 'Sky Blues street third kit', price: 2490, newArrival: true, sold: 44, createdAt: ago(1) }),
  make({ id: 'p12', name: 'Ipsum Nacional Jersey', slug: 'ipsum-nacional-jersey', sku: 'JRSY-NT-012', category: 'national-teams', team: 'Ipsum National', jerseyType: 'Home', images: [P('jersey-ipsum-red')], description: 'National-team gradient jersey with a premium collar and pro fit. A clean, modern look for supporters and squads alike.', shortDescription: 'Ipsum National gradient jersey', price: 2690, bestSeller: true, sold: 132, createdAt: ago(35) }),
  make({ id: 'p13', name: 'Sideline Cap', slug: 'sideline-cap', sku: 'JRSY-AC-013', category: 'accessories', team: 'JRSY', jerseyType: 'Cap', images: [P('cap-black')], sizeStock: { S: 0, M: 40, L: 40, XL: 0, XXL: 0 }, description: 'Structured black six-panel cap with an embroidered monogram and an adjustable strap back. Finish your matchday look.', shortDescription: 'Embroidered adjustable cap', price: 890, newArrival: true, sold: 61, createdAt: ago(6) }),
]

export const seedBanners = [
  { id: 'b1', title: 'NEW SEASON KITS', subtitle: 'Play. Wear. Repeat.', cta: 'Shop Collection', url: '/shop?filter=new', image: '/products/kit-goodvibes.jpg', active: true, order: 1 },
  { id: 'b2', title: 'CUSTOM JERSEYS', subtitle: 'Your name, number, sponsor & logo.', cta: 'Build Yours', url: '/custom', image: '/products/jersey-ipsum-red.jpg', active: true, order: 2 },
  { id: 'b3', title: 'CRICKET 2026', subtitle: 'Match-day kits & trousers.', cta: 'Shop Cricket', url: '/cricket', image: '/products/trousers-cricket.jpg', active: true, order: 3 },
]

export const seedCoupons = [
  { id: 'c1', code: 'JRSY10', type: 'percent', amount: 10, minOrder: 2000, maxDiscount: 500, expiry: ago(-60), usageLimit: 500, used: 24, active: true },
  { id: 'c2', code: 'FLAT200', type: 'fixed', amount: 200, minOrder: 2500, maxDiscount: 200, expiry: ago(-30), usageLimit: 200, used: 11, active: true },
]

export const seedReviews = [
  { id: 'r1', productId: 'p1', customerName: 'Tanvir H.', rating: 5, comment: 'Fabric quality is unreal for the price. Fits true to size.', approved: true, createdAt: ago(8) },
  { id: 'r2', productId: 'p7', customerName: 'Sadia R.', rating: 5, comment: 'Wore it to the match — got so many compliments!', approved: true, createdAt: ago(4) },
  { id: 'r3', productId: 'p3', customerName: 'Imran K.', rating: 4, comment: 'Great kit, delivery was quick. Would buy again.', approved: true, createdAt: ago(15) },
]

export const seedSettings = {
  storeName: 'JRSY',
  tagline: 'Play. Wear. Repeat.',
  logo: '',
  phone: '+880 1700-000000',
  email: 'hello@jrsy.com',
  address: 'Aftab Nagar, Dhaka, Bangladesh',
  deliveryCharge: 80,
  freeDeliveryThreshold: 3000,
  currency: '৳',
  social: { facebook: '#', instagram: '#', youtube: '#' },
  footer: 'JRSY is a modern jersey label for football and cricket fans. Built for the pitch, styled for the street.',
  storeOpen: true,
}

// A demo admin + a couple of orders/customers so the dashboard isn't empty.
export const seedUsers = [
  { uid: 'admin-demo', name: 'Store Admin', email: 'admin@jrsy.com', phone: '+880 1700-000000', role: 'admin', createdAt: ago(120) },
  { uid: 'cust-1', name: 'Tanvir Hasan', email: 'tanvir@example.com', phone: '+880 1811-111111', role: 'customer', createdAt: ago(30) },
  { uid: 'cust-2', name: 'Sadia Rahman', email: 'sadia@example.com', phone: '+880 1922-222222', role: 'customer', createdAt: ago(12) },
]

export const seedOrders = [
  {
    id: 'o1', orderNumber: 'JRSY-2026-00001', customerId: 'cust-1', customerName: 'Tanvir Hasan',
    phone: '+880 1811-111111', email: 'tanvir@example.com',
    items: [{ productId: 'p1', productName: 'Good Vibes Home Kit', image: seedProducts[0].images[0], size: 'L', quantity: 1, price: 1990 }],
    subtotal: 1990, discount: 0, deliveryCharge: 80, total: 2070,
    paymentMethod: 'Cash on Delivery', paymentStatus: 'unpaid', orderStatus: 'Delivered',
    shippingAddress: { fullName: 'Tanvir Hasan', address: 'House 12, Road 4', city: 'Dhaka', area: 'Banani' },
    createdAt: ago(10), updatedAt: ago(7),
  },
  {
    id: 'o2', orderNumber: 'JRSY-2026-00002', customerId: 'cust-2', customerName: 'Sadia Rahman',
    phone: '+880 1922-222222', email: 'sadia@example.com',
    items: [
      { productId: 'p7', productName: 'Tigers Pro Cricket Jersey', image: seedProducts[6].images[0], size: 'M', quantity: 2, price: 1890 },
    ],
    subtotal: 3780, discount: 378, deliveryCharge: 0, total: 3402,
    paymentMethod: 'Cash on Delivery', paymentStatus: 'unpaid', orderStatus: 'Processing',
    shippingAddress: { fullName: 'Sadia Rahman', address: 'Flat 3B, Green Road', city: 'Dhaka', area: 'Dhanmondi' },
    createdAt: ago(2), updatedAt: ago(1),
  },
]
