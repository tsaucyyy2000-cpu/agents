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

## SEO audit (local)

```sh
npx playwright install chromium
npm run seo:audit:built
```

Crawls `public/sitemap.xml` against `vite preview` with Playwright (client-rendered titles, canonicals, JSON-LD). Demo pages stay `noindex` until launch approval. Flags unverified `$` and soft medical-claim patterns as `CLAIM` lines.

## Public pages

- `/` home marketing composition
- `/weight-loss` category + demo slider (no outcome projection)
- `/sexual-health`, `/hair`, `/skin` category landings
- `/quiz/:slug` versioned-consent quiz → shared `/visit` funnel
- `/how-it-works`, `/insurance-check`, `/checkout`, `/guides`
- `/products/:id` detail with sticky subnav + PriceTag (`amount: null` → —)
- `/visit` multi-step intake
- Safety hub `/safety` + ISI stubs `/isi/glp1`, `/isi/minoxidil` (illustrative only)
- Info stubs: `/about`, `/help`, `/privacy`, `/terms`
- Legal/consent stubs: `/cookie-policy`, `/privacy-choices`, `/consumer-health-privacy`, `/disclosure`

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
