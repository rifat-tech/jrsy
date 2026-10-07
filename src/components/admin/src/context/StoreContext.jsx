import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../services/db'
import { useAuth } from './AuthContext'
import { seedSettings } from '../data/mockData'

const StoreContext = createContext(null)
export const useStore = () => useContext(StoreContext)

export function StoreProvider({ children }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState(seedSettings)
  const [categories, setCategories] = useState([])
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {})
    api.listCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (user?.uid) api.getWishlist(user.uid).then(setWishlist).catch(() => setWishlist([]))
    else {
      try { setWishlist(JSON.parse(localStorage.getItem('jrsy_guest_wish') || '[]')) } catch { setWishlist([]) }
    }
  }, [user?.uid])

  const persistWish = useCallback((items) => {
    setWishlist(items)
    if (user?.uid) api.setWishlist(user.uid, items)
    else localStorage.setItem('jrsy_guest_wish', JSON.stringify(items))
  }, [user?.uid])

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
      if (user?.uid) api.setWishlist(user.uid, next)
      else localStorage.setItem('jrsy_guest_wish', JSON.stringify(next))
      return next
    })
  }, [user?.uid])

  const refreshSettings = useCallback(() => api.getSettings().then(setSettings), [])
  const refreshCategories = useCallback(() => api.listCategories().then(setCategories), [])

  const value = { settings, categories, wishlist, toggleWishlist, persistWish, refreshSettings, refreshCategories }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
