// Firebase initialization.
// If the VITE_FIREBASE_* env vars are present, the app talks to real Firebase.
// If they are missing, `isFirebaseReady` is false and the app runs in DEMO MODE
// (seeded data + localStorage) so the whole site is clickable without a backend.

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@jrsy.com'

export const isFirebaseReady = Boolean(cfg.apiKey && cfg.projectId && cfg.appId)

let app = null
let auth = null
let db = null
let storage = null

if (isFirebaseReady) {
  app = initializeApp(cfg)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
} else if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(
    '%cJRSY is running in DEMO MODE.',
    'color:#0B0B0F;background:#C8FF3C;padding:2px 8px;border-radius:6px;font-weight:700',
    'Add your Firebase keys to .env to switch to the live backend.'
  )
}

export { app, auth, db, storage }
