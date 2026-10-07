# WHERE TO EDIT — quick map (SPORTY store)

Open the project folder in VS Code and use **Ctrl+P** (search a file by name).
Almost everything you will want to change is in the files below.

## 1. Brand, logo, phone, WhatsApp
| I want to change…                     | Edit this file              |
|---------------------------------------|-----------------------------|
| Store name / slogan                   | `src/config/site.js`        |
| **Logo picture**                      | replace `public/logo.png` (same name) |
| Logo size (header, footer, login…)    | `src/config/site.js` → `logo.height` |
| Phone / WhatsApp number               | `src/config/site.js` → `contact` |
| Browser tab title + Google description| `index.html`                |
| Browser tab icon                      | `public/favicon.svg`        |
| Colors (volt green, black…)           | `tailwind.config.js` → `colors` |

## 2. Representative Network (Division → District → Upazila → Representative)
Everything is inside **`src/features/representatives/`**

| I want to change…                          | Edit this file |
|--------------------------------------------|----------------|
| Headlines, Bangla/English texts, “Representative Needed” | `src/config/site.js` → `NETWORK` |
| How many active reps per upazila (default 1) | `src/config/site.js` → `NETWORK.maxActivePerUpazila` |
| Public page layout (hero, search, tree order) | `pages/NetworkPage.jsx` |
| Representative card design / buttons        | `components/RepCard.jsx` |
| The tree (division → district → upazila)    | `components/Tree.jsx` |
| Stats boxes, coverage bars, filters         | `components/Bits.jsx` |
| Search + coverage calculations              | `lib/logic.js` |
| Form rules (phone, email, Facebook link…)   | `lib/validate.js` |
| Saving / loading from the database          | `lib/service.js` |
| Admin screens                               | `admin/RepDashboard.jsx`, `RepList.jsx`, `RepForm.jsx`, `VacantAreas.jsx`, `AreasAdmin.jsx` |
| Block shown on the HOME page                | `components/NetworkTeaser.jsx` |
| Web addresses (/sporty-representatives/…)   | `src/App.jsx` (search “sporty-representatives”) |

## 3. Main store pages
| Page                  | File |
|-----------------------|------|
| Home page             | `src/pages/customer/Home.jsx` |
| Top menu              | `src/components/customer/Header.jsx` (list called `NAV`) |
| Footer + footer links | `src/components/customer/Footer.jsx` |
| Shop / product pages  | `src/pages/customer/Shop.jsx`, `ProductDetails.jsx` |
| Checkout              | `src/pages/customer/Checkout.jsx` |
| Admin sidebar menu    | `src/pages/admin/AdminLayout.jsx` (list called `NAV`) |

## 4. Database + security
| What                       | File |
|----------------------------|------|
| Who may read / write data  | `firestore.rules` (publish in Firebase console → Firestore → Rules) |
| Firebase keys              | `.env` (copy from `.env.example`) |

## First-time setup of the Representative Network
1. `npm install` (the Bangladesh locations are built in — `src/features/representatives/data/builtin.js`)
2. Publish the new `firestore.rules` in the Firebase console.
3. Log in as admin and open **Admin → Representatives** — the 8 / 64 / 492 locations are stored automatically the first time.
4. Add representatives (Admin → Representatives → Add) or pick a place from **Vacant Areas**.
