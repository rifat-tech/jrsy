# JRSY — Play. Wear. Repeat.

A complete, production-ready jersey e-commerce store built with **React + Vite + Tailwind + Firebase**.
Football & cricket jerseys, custom kits, a full customer storefront, and a complete admin dashboard.

## ✨ Runs immediately (demo mode)

The app works out of the box **without any Firebase setup**. If no Firebase keys are present it runs
in **demo mode** — seeded products/orders/customers live in your browser (localStorage), so every
feature is fully clickable. The moment you add Firebase keys, it switches to the live backend.

```bash
npm install
npm run dev
```

Open http://localhost:5173

**Demo logins** (any password works in demo mode):
- Customer: any email, e.g. `you@email.com`
- Admin: **`admin@jrsy.com`** → then open **`/admin`**

## 🔌 Connect Firebase (go live)

1. Create a project at https://console.firebase.google.com
2. Add a **Web app**, copy the config values.
3. Copy `.env.example` → `.env` and fill in:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_EMAIL=admin@jrsy.com
```

4. In the Firebase console enable:
   - **Authentication** → Email/Password **and** Google.
   - **Cloud Firestore** → create database.
   - **Storage** → enable.
5. Publish the security rules:
   - Firestore rules → paste `firestore.rules`
   - Storage rules → paste `storage.rules`
6. Make yourself admin: create/edit your user doc in `users/{yourUid}` and set `role: "admin"`
   (or set a custom claim `admin: true` and switch `isAdmin()` in the rules to use the claim).

Restart `npm run dev` — you're now on live Firebase.

## 🚀 Deploy to Vercel

- Push to GitHub, import into Vercel.
- Add the `VITE_FIREBASE_*` env vars in Vercel project settings.
- `vercel.json` already handles SPA routing. Build command `npm run build`, output `dist`.

## 🗂 Structure

```
src/
  components/   ui atoms, customer chrome (header/footer/cards), admin kit
  context/      Auth, Cart, Store (settings/categories/wishlist), Toast
  services/     db.js (Firestore ⇄ demo), storage.js (uploads)
  pages/
    customer/   home, shop, product, custom, cart, checkout, account/*
    admin/      dashboard, products, categories, orders, customers,
                reviews, coupons, banners, inventory, settings
  firebase/     config.js (auto demo/live detection)
  data/         mockData.js (seed catalogue)
  utils/        format, jersey (SVG kit generator)
firestore.rules · storage.rules · vercel.json
```

## 🖼 Product images

Real jersey photos live in **`public/products/`** and are wired into the starter catalogue
(`src/data/mockData.js`). Swap any of them by dropping a new file in that folder and pointing the
product's `images: [...]` at `/products/your-file.jpg`, or just upload images from the admin
**Products** screen (they go to Firebase Storage once connected).

## ✅ End-to-end tests (Playwright)

Automated browser tests drive the real UI — storefront (browse → cart → checkout) and the full
admin lifecycle (login → add → edit → delete a product, change a banner, update an order).

```bash
npx playwright install   # one-time: download browsers
npm run test:e2e         # run headless
npm run test:e2e:ui      # watch mode
```

Tests run against demo mode, so no Firebase needed to test.

## 🌱 Going live with Firebase (first run)

A fresh Firestore is empty. After you connect Firebase and make yourself admin, open
**Admin → Settings → Import starter catalogue** to seed the products/categories/banners/coupons
above into Firestore in one click. Then edit/add/delete freely — it's your live data.

## Features
Storefront (home, collections, search, filters, product details, reviews, wishlist,
custom jersey builder, cart, coupons, COD checkout, order tracking) · Auth (email + Google) ·
Customer account · Full admin (product CRUD + image upload + size stock, categories, orders +
status flow, customers, review moderation, coupons, banners, inventory, settings) ·
Firestore security rules · fully responsive.
