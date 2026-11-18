# ro.co marketing clone (local demo)

A Vite + React recreation of the **ro.co** top-of-funnel marketing experience, plus a local **admin dashboard** that can update site content, products, media, and visit leads.

Not affiliated with Ro. Uses original/placeholder copy and original SVG media (no scraped Ro CDN assets).

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
- `/visit` multi-step online-visit prototype (writes leads)

## Admin

- `/admin` overview
- `/admin/content` home + category + testimonials
- `/admin/products` product catalog CRUD
- `/admin/media` media library (paths/URLs)
- `/admin/leads` visit lead inbox
- `/admin/settings` brand knobs + JSON import/export + reset

Content persists in `localStorage` key `ro-clone-site-content-v1`.

## Media

Original SVG placeholders live in `public/media/`. Add your own files there or register remote URLs in Admin → Media. Do not copy Ro-hosted brand photography.
