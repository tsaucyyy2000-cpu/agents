# Health marketing SPA (host-ready)

A Vite + React telehealth **marketing** SPA with care-area landings, quizzes, a shared visit funnel, and a local **admin dashboard** for content, products, media, and visit leads.

Not affiliated with Ro. Uses original placeholder copy and locally hosted photoreal media (including approved local copies of lifestyle assets). Verified prices and clinician bios stay gated until supplied.

**Not deployed yet** — confirm host + secrets before publishing.

## Run

```sh
cd community_contributions/ro-co-clone
npm install
npm run dev
```

Open the printed local URL (default `http://127.0.0.1:5173`).

## Go-live checklist (host)

Do these on the host / in build env before any public publish. This repo does **not** invent prices or counsel legal text.

| Step | Status / owner |
| --- | --- |
| Pick host + custom domain; set `VITE_SITE_ORIGIN=https://your.domain` at **build** time | **Blocked** — Trey host/domain |
| SPA fallback: `vercel.json` (Vercel) or `public/_redirects` (Netlify) ships in-repo | Ready in repo |
| Clerk: `VITE_CLERK_PUBLISHABLE_KEY` + `VITE_ADMIN_EMAILS` in host build env; invite-only sign-up | **Blocked** — Trey Clerk keys |
| Rebuild after env change so Vite inlines keys/origin | Required |
| Verified `$` price schedule → wire into `PriceTag` / `PENDING_PRICE` | **Blocked** — prices stay `amount: null` (—) until supplied |
| Counsel-reviewed legal + ISI (replace stubs) | **Blocked** — keep stubs; do not fabricate |
| Approved bios / testimonials / vanity stats → stage in admin, then flip orphan publish flags | Gated empty until approved assets |
| Backend for CMS/leads/PHI (replace `localStorage`) | Still missing — admin gate is UI-only |
| Deploy only after host + Clerk confirmed | Do not auto-deploy from this PR |

### Host env example (never commit)

```sh
# .env.production / host dashboard — build-time
VITE_SITE_ORIGIN=https://your.domain
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_ADMIN_EMAILS=you@example.com
```

With a public `VITE_SITE_ORIGIN`, the Vite build rewrites `dist/robots.txt` + `dist/sitemap.xml` to that origin and customer pages flip to `index,follow` via `defaultRobots()`. Local / unset origin stays `noindex`.

## SEO / indexing

```sh
npx playwright install chromium
npm run seo:audit:built
```

Crawls `public/sitemap.xml` against `vite preview` with Playwright (client-rendered titles, canonicals, JSON-LD).

**Robots behavior:** pages stay `noindex,nofollow` unless `VITE_SITE_ORIGIN` is set to a real public origin (not `localhost` / `127.0.0.1`). Local previews remain noindexed. Flags unverified `$` and soft medical-claim patterns as `CLAIM` lines.

```sh
# .env.local (gitignored) — example for a real host
VITE_SITE_ORIGIN=https://example.com
```

## Public pages

- `/` home marketing composition
- `/weight-loss` category landing (no outcome projection)
- `/sexual-health`, `/hair`, `/skin` category landings
- `/quiz/:slug` versioned-consent quiz → shared `/visit` funnel
- `/how-it-works`, `/insurance-check`, `/checkout`, `/guides`
- `/products/:id` detail with sticky subnav + PriceTag (`amount: null` → —)
- `/visit` multi-step intake
- Safety hub `/safety` + ISI stubs `/isi/glp1`, `/isi/minoxidil` (illustrative only)
- Info: `/about`, `/help`, `/how-it-works`, `/privacy`, `/terms`
- Legal/consent stubs: `/cookie-policy`, `/privacy-choices`, `/consumer-health-privacy`, `/disclosure`
- Soft 404 for unknown customer paths (home + care-area links)

Customer-facing chrome does **not** link to admin. Open `/admin` by direct URL only.

## Admin (direct URL · Clerk + email allowlist)

`/admin/*` requires **Clerk sign-in** plus an email on `VITE_ADMIN_EMAILS`. There is **no** `demo-admin` / `VITE_ADMIN_GATE` passphrase. Missing keys or an empty allowlist keep admin locked. `public/robots.txt` still `Disallow`s `/admin` (crawl hint only).

```sh
# .env.local (gitignored) — required for admin
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_ADMIN_EMAILS=you@example.com,other@example.com
```

Signed-in users whose email is not allowlisted see **Access denied**. Use **Sign out** in the sidebar to clear the Clerk session.

This gates the admin UI only. CMS content and visit leads still persist in browser `localStorage` (`ro-clone-site-content-v2`) — shared hosting of that data still needs a backend.

- `/admin` overview
- `/admin/content` home + category + gated orphan staging (testimonials / experts / moreCare)
- `/admin/products` product catalog CRUD (includes placeholder price labels)
- `/admin/media` media library (paths/URLs)
- `/admin/leads` visit lead inbox
- `/admin/settings` brand knobs + vanity stats (gated) + JSON import/export + reset

### Orphan content gate (P1-03)

`testimonials`, `experts`, `moreCare`, and vanity stats (`memberCountLabel` / `satisfactionLabel`) ship **empty** and **unpublished**. Admin can stage drafts, but customer pages only render them when the matching `orphanPublish` flag is explicitly enabled. Do not invent bios, testimonials, or stats.

## Media

Photoreal JPEGs live in `public/media/` (heroes, categories, products, guides, plus lifestyle placeholders for experts / member stories / more-care / FAQ). Register paths in Admin → Media. Prefer local copies under `public/media/`; do not dump verbatim Ro legal/marketing copy.

Unknown customer URLs render a soft 404 (home + care-area links) instead of silently redirecting to `/`.

## Host SPA fallback

| Host | Config in repo |
| --- | --- |
| Vercel | `vercel.json` → rewrite all routes to `/index.html` (static files still win) |
| Netlify / similar | `public/_redirects` → `/* /index.html 200` |

Deep links like `/weight-loss` and `/products/weekly-glp1` must return the SPA shell on refresh.

## Verify before PR / ship

```sh
npm run build
npm run funnel:smoke
npm run seo:audit
```
