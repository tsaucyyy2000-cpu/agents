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
- Info: `/about`, `/help` (category help hub), `/how-it-works`, `/privacy`, `/terms`
- Legal/consent stubs: `/cookie-policy`, `/privacy-choices`, `/consumer-health-privacy`, `/disclosure`

Customer-facing chrome does **not** link to admin. Open `/admin` by direct URL only.

## Admin (direct URL · demo gate)

`/admin/*` is behind a **local / demo passphrase gate** — not production auth, not HIPAA, not OAuth. The passphrase is read from `VITE_ADMIN_GATE` at build time and ships in the client bundle; anyone who can inspect the build can recover it. `public/robots.txt` still `Disallow`s `/admin` (crawl hint only).

For local demos when the env var is unset, the fallback passphrase is **`demo-admin`**. Override for your machine:

```sh
# .env.local (gitignored) — optional
VITE_ADMIN_GATE=your-local-passphrase
```

Unlock persists in `sessionStorage` for the current tab. Use **Lock admin** in the sidebar to clear it.

- `/admin` overview
- `/admin/content` home + category + testimonials
- `/admin/products` product catalog CRUD (includes placeholder price labels)
- `/admin/media` media library (paths/URLs)
- `/admin/leads` visit lead inbox
- `/admin/settings` brand knobs + JSON import/export + reset

Content persists in `localStorage` key `ro-clone-site-content-v2`.

## Media

Original generated photoreal JPEGs (plus SVG placeholders for expert/admin/more-care tiles) live in `public/media/`. Unused JPG/SVG twins were removed—customer surfaces use the registered JPEG (or sole SVG) paths. Register paths in Admin → Media. Do not copy Ro-hosted brand photography or live product pricing.

Unknown customer URLs render a soft 404 (home + care-area links) instead of silently redirecting to `/`.
