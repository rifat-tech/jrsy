import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
export const useCart = () => useContext(CartContext)

const CART_KEY = 'jrsy_cart_v1'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') } catch { return [] }
  })
  const [coupon, setCoupon] = useState(null)

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(items)) }, [items])

  const key = (id, size) => `${id}__${size}`

  function add(product, size, quantity = 1) {
    setItems((prev) => {
      const k = key(product.id, size)
      const found = prev.find((i) => key(i.productId, i.size) === k)
      const price = product.salePrice || product.price
      if (found) {
        return prev.map((i) => (key(i.productId, i.size) === k ? { ...i, quantity: i.quantity + quantity } : i))
      }
      return [
        ...prev,
        { productId: product.id, productName: product.name, image: product.images?.[0], size, quantity, price, slug: product.slug },
      ]
    })
  }

  function updateQty(productId, size, quantity) {
    setItems((prev) =>
      prev
        .map((i) => (i.productId === productId && i.size === size ? { ...i, quantity: Math.max(1, quantity) } : i))
        .filter((i) => i.quantity > 0)
    )
  }
  function changeSize(productId, oldSize, newSize) {
    setItems((prev) => prev.map((i) => (i.productId === productId && i.size === oldSize ? { ...i, size: newSize } : i)))
  }
  function remove(productId, size) {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)))
  }
  function clear() { setItems([]); setCoupon(null) }

  const subtotal = useMemo(() => items.reduce((a, i) => a + i.price * i.quantity, 0), [items])
  const count = useMemo(() => items.reduce((a, i) => a + i.quantity, 0), [items])
  const discount = coupon?.discount || 0

  const value = { items, count, subtotal, discount, coupon, setCoupon, add, updateQty, changeSize, remove, clear }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
