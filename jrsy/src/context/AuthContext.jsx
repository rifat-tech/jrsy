import { createContext, useContext, useEffect, useState } from 'react'
import { isFirebaseReady, auth, ADMIN_EMAIL } from '../firebase/config'
import { api } from '../services/db'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const DEMO_KEY = 'jrsy_demo_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseReady) {
      try {
        const raw = localStorage.getItem(DEMO_KEY)
        if (raw) setUser(JSON.parse(raw))
      } catch (_) {}
      setLoading(false)
      return
    }
    let unsub
    ;(async () => {
      const { onAuthStateChanged } = await import('firebase/auth')
      unsub = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          let profile = await api.getUser(fbUser.uid)
          if (!profile) {
            profile = {
              uid: fbUser.uid, name: fbUser.displayName || 'Customer', email: fbUser.email,
              phone: '', role: fbUser.email === ADMIN_EMAIL ? 'admin' : 'customer',
              profileImage: fbUser.photoURL || '', address: {}, createdAt: Date.now(), updatedAt: Date.now(),
            }
            await api.upsertUser(profile)
          }
          setUser(profile)
        } else setUser(null)
        setLoading(false)
      })
    })()
    return () => unsub && unsub()
  }, [])

  /* ---------------- Demo auth (no Firebase) ---------------- */
  async function demoAuth({ name, email, phone, role }) {
    const u = {
      uid: 'demo-' + btoa(email).slice(0, 12), name: name || email.split('@')[0],
      email, phone: phone || '', role: role || (email === ADMIN_EMAIL ? 'admin' : 'customer'),
      profileImage: '', address: {}, createdAt: Date.now(), updatedAt: Date.now(),
    }
    await api.upsertUser(u)
    localStorage.setItem(DEMO_KEY, JSON.stringify(u))
    setUser(u)
    return u
  }

  const value = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    demo: !isFirebaseReady,

    async register({ name, email, phone, password }) {
      if (!isFirebaseReady) return demoAuth({ name, email, phone })
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      const profile = {
        uid: cred.user.uid, name, email, phone,
        role: email === ADMIN_EMAIL ? 'admin' : 'customer',
        profileImage: '', address: {}, createdAt: Date.now(), updatedAt: Date.now(),
      }
      await api.upsertUser(profile)
      setUser(profile)
      return profile
    },

    async login({ email, password }) {
      if (!isFirebaseReady) {
        const existing = await api.getUser('demo-' + btoa(email).slice(0, 12))
        return demoAuth(existing || { email })
      }
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      await signInWithEmailAndPassword(auth, email, password)
    },

    async loginWithGoogle() {
      if (!isFirebaseReady) return demoAuth({ name: 'Google User', email: 'google.user@jrsy.com' })
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
      await signInWithPopup(auth, new GoogleAuthProvider())
    },

    async logout() {
      if (!isFirebaseReady) { localStorage.removeItem(DEMO_KEY); setUser(null); return }
      const { signOut } = await import('firebase/auth')
      await signOut(auth)
    },

    async updateProfileData(patch) {
      const updated = { ...user, ...patch, updatedAt: Date.now() }
      await api.upsertUser(updated)
      setUser(updated)
      if (!isFirebaseReady) localStorage.setItem(DEMO_KEY, JSON.stringify(updated))
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
