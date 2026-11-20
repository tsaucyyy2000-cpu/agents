# ro.co marketing clone (local demo)

A Vite + React recreation of the **ro.co** top-of-funnel marketing experience, plus a local **admin dashboard** that can update site content, products, media, and visit leads.

Not affiliated with Ro. Uses original/placeholder copy and original generated photoreal media (no scraped Ro CDN assets).

## Run

```sh
cd community_contributions/ro-co-clone
npm install
npm run dev
```

Open the printed local URL (default `http://127.0.0.1:5173`).

## Public pages

- `/` home marketing composition
- `/weight-loss` category + projection widget
- `/sexual-health`, `/hair`, `/skin` category landings
- `/how-it-works`, `/insurance-check`, `/checkout`, `/guides`
- `/products/:id`, `/visit`
- Info stubs: `/about`, `/help`, `/safety`, `/privacy`, `/terms`

Customer-facing chrome does **not** link to admin. Open `/admin` by direct URL only.

## Admin (direct URL)

- `/admin` overview
- `/admin/content` home + category + testimonials
- `/admin/products` product catalog CRUD (includes placeholder price labels)
- `/admin/media` media library (paths/URLs)
- `/admin/leads` visit lead inbox
- `/admin/settings` brand knobs + JSON import/export + reset

Content persists in `localStorage` key `ro-clone-site-content-v2`.

## Media

Original generated photoreal JPEGs (plus SVG placeholders for expert/admin tiles) live in `public/media/`. Register paths in Admin → Media. Do not copy Ro-hosted brand photography or live product pricing.
