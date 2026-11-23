#!/usr/bin/env node
/**
 * SEO health check for the ro-co-clone Vite SPA (local preview).
 *
 * Rewritten for this repo — not a copy of TreatmentsHub / top-weight-loss host logic.
 * Ideas adapted: sitemap crawl, unique titles, single h1, canonical match, JSON-LD parse,
 * undefined/NaN leaks, internal link reachability, title/description length warns.
 *
 *   npm run build && npm run seo:audit
 *   AUDIT_BASE=http://127.0.0.1:5173 npm run seo:audit   # reuse a running preview
 *
 * Uses Playwright so client-rendered titles / DocumentMeta / JSON-LD are visible.
 * Without VITE_SITE_ORIGIN as a public host, pages stay noindex (WARN, not FAIL).
 * Also flags unverified `$` prices and soft medical-claim patterns in visible text.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.AUDIT_PORT || 4173);
const BASE = (process.env.AUDIT_BASE || `http://127.0.0.1:${PORT}`).replace(/\/$/, "");
const ORIGIN = new URL(BASE).origin;
const OUT = process.env.AUDIT_OUT || path.join(ROOT, "seo-audit-report.json");
const DEMO_NOINDEX_OK = process.env.DEMO_NOINDEX_OK !== "0";

const fails = [];
const warns = [];
const claims = [];
const fail = (m) => fails.push(m);
const warn = (m) => warns.push(m);
const claim = (m) => claims.push(m);

const LINK_ALLOW = [
  /^\/admin/,
  /\.(webp|png|jpg|jpeg|svg|pdf|ico)$/i,
  /^\/#/,
  /^mailto:/,
  /^tel:/,
];

/** Soft medical / outcome language that needs an approved source before launch. */
const MEDICAL_CLAIM_RE =
  /\b(lose\s+\d+|%\s*body\s*weight|clinically\s+proven|fda[- ]approved|guaranteed\s+results|cure[sd]?\b|will\s+prescribe|doctor[- ]recommended|miraculous)\b/i;
const PRICE_RE = /\$\s?\d/;

function getStatic(urlPath) {
  return new Promise((resolve) => {
    const u = new URL(urlPath, BASE);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.pathname + u.search,
        method: "GET",
        headers: { "User-Agent": "ro-clone-seo-audit/1.0" },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("error", (e) => resolve({ status: 0, body: "", error: String(e) }));
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 0,
            body: Buffer.concat(chunks).toString("utf8"),
            location: res.headers.location || "",
          }),
        );
      },
    );
    req.setTimeout(30_000, () => req.destroy(new Error("timeout")));
    req.on("error", (e) => resolve({ status: 0, body: "", error: String(e) }));
    req.end();
  });
}

let server = null;
function stopServer() {
  if (!server?.pid) return;
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    try {
      server.kill();
    } catch {
      /* ignore */
    }
  }
}

async function ensureServer() {
  const probe = await getStatic("/robots.txt");
  if (probe.status === 200) return;
  server = spawn("npx", ["vite", "preview", "--host", "127.0.0.1", "--port", String(PORT)], {
    cwd: ROOT,
    stdio: "ignore",
    detached: true,
    env: { ...process.env },
  });
  for (let i = 0; i < 45; i++) {
    await sleep(1000);
    if ((await getStatic("/robots.txt")).status === 200) return;
  }
  throw new Error(`vite preview did not come up on ${BASE}`);
}

async function dismissConsent(page) {
  const btn = page.getByTestId("consent-essential");
  if (await btn.count()) {
    await btn.click({ timeout: 5000 }).catch(async () => {
      await page.getByRole("button", { name: /Essential only/i }).click({ timeout: 5000 });
    });
    await page.waitForTimeout(200);
  }
}

async function auditPage(browser, pagePath) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const url = ORIGIN + pagePath;
  const result = {
    path: pagePath,
    status: 0,
    title: "",
    description: "",
    canonical: "",
    robots: "",
    h1: 0,
    h1Text: "",
    jsonLdValid: true,
    jsonLdCount: 0,
    bodyText: "",
    links: [],
    dollarHits: [],
    medicalHits: [],
  };

  try {
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
    result.status = response?.status() ?? 0;
    await dismissConsent(page);
    await page.waitForTimeout(150);

    result.title = await page.title();
    result.description =
      (await page.locator('meta[name="description"]').first().getAttribute("content")) || "";
    result.canonical =
      (await page.locator('link[rel="canonical"]').first().getAttribute("href")) || "";
    result.robots =
      (await page.locator('meta[name="robots"]').first().getAttribute("content")) || "";

    const h1s = page.locator("h1");
    result.h1 = await h1s.count();
    if (result.h1 > 0) result.h1Text = ((await h1s.first().innerText()) || "").trim();

    const ldHandles = await page.locator('script[type="application/ld+json"]').all();
    result.jsonLdCount = ldHandles.length;
    for (const handle of ldHandles) {
      const raw = await handle.textContent();
      try {
        JSON.parse(raw || "");
      } catch {
        result.jsonLdValid = false;
      }
    }

    result.bodyText = await page.locator("body").innerText();
    const hrefs = await page.$$eval("a[href]", (anchors) =>
      anchors.map((a) => a.getAttribute("href") || ""),
    );
    result.links = [...new Set(hrefs)];

    for (const line of result.bodyText.split(/\n+/)) {
      const t = line.trim();
      if (!t) continue;
      if (PRICE_RE.test(t)) result.dollarHits.push(t.slice(0, 120));
      if (MEDICAL_CLAIM_RE.test(t)) result.medicalHits.push(t.slice(0, 120));
    }
  } catch (e) {
    result.status = 0;
    result.error = e instanceof Error ? e.message : String(e);
  } finally {
    await page.close();
  }
  return result;
}

async function main() {
  await ensureServer();
  console.log(`Auditing SPA ${BASE}`);

  const robots = await getStatic("/robots.txt");
  if (robots.status !== 200) fail("robots.txt: missing or non-200");
  else if (!/Sitemap:\s*\S+/i.test(robots.body)) fail("robots.txt: missing Sitemap line");
  else if (/treatmentshub|topweightloss/i.test(robots.body)) {
    fail("robots.txt: legacy TreatmentsHub/topweightloss host present");
  }

  const sitemap = await getStatic("/sitemap.xml");
  if (sitemap.status !== 200) fail("sitemap.xml: missing or non-200");
  const locs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (!locs.length) fail("sitemap.xml: no <loc> entries");
  if (locs.some((l) => /treatmentshub|topweightloss/i.test(l))) {
    fail("sitemap.xml: legacy TreatmentsHub/topweightloss host present");
  }

  const paths = locs.map((loc) => {
    try {
      const u = new URL(loc);
      return u.pathname === "" ? "/" : u.pathname;
    } catch {
      return loc;
    }
  });
  console.log(`${paths.length} sitemap URLs`);

  const browser = await chromium.launch({ headless: true });
  const pages = [];
  const titles = new Map();
  const linkTargets = new Map();

  try {
    for (const p of paths) {
      process.stderr.write(`  audit ${p}\n`);
      const pg = await auditPage(browser, p);
      pages.push(pg);

      if (pg.status !== 200) {
        fail(`${p}: status ${pg.status}${pg.error ? ` (${pg.error})` : ""}`);
        continue;
      }
      const want = ORIGIN + (p === "/" ? "/" : p);
      const wantBare = ORIGIN + (p === "/" ? "" : p);
      if (pg.canonical !== want && pg.canonical !== wantBare && pg.canonical !== wantBare + "/") {
        fail(`${p}: canonical "${pg.canonical}" (want ${want})`);
      }
      if (/noindex/i.test(pg.robots)) {
        if (DEMO_NOINDEX_OK) warn(`${p}: noindex (expected without public VITE_SITE_ORIGIN)`);
        else fail(`${p}: noindex on a sitemap URL`);
      }
      if (!pg.title) fail(`${p}: no <title>`);
      else {
        if (titles.has(pg.title)) fail(`${p}: duplicate <title> with ${titles.get(pg.title)}`);
        titles.set(pg.title, p);
        if (pg.title.length > 70) warn(`${p}: title ${pg.title.length} chars`);
      }
      if (!pg.description) warn(`${p}: no meta description`);
      else if (pg.description.length > 200) warn(`${p}: description ${pg.description.length} chars`);
      if (pg.h1 !== 1) fail(`${p}: ${pg.h1} <h1> elements`);
      if (!pg.jsonLdValid) fail(`${p}: invalid JSON-LD`);
      if (pg.jsonLdCount < 1) warn(`${p}: no JSON-LD stub`);
      if (/>undefined<|>NaN</.test(pg.bodyText)) fail(`${p}: undefined/NaN leak`);
      if (/treatmentshub|topweightloss\.io/i.test(pg.bodyText)) {
        fail(`${p}: legacy TreatmentsHub/topweightloss brand text`);
      }
      for (const hit of pg.dollarHits) claim(`${p}: unverified $ price text — "${hit}"`);
      for (const hit of pg.medicalHits) claim(`${p}: medical-claim pattern — "${hit}"`);

      for (const href of pg.links) {
        if (!href || href.startsWith("http") || href.startsWith("//") || href.startsWith("#")) continue;
        if (LINK_ALLOW.some((re) => re.test(href))) continue;
        const pathOnly = href.split("?")[0].split("#")[0] || "/";
        if (!pathOnly.startsWith("/")) continue;
        if (paths.includes(pathOnly) || pathOnly === "/") continue;
        if (!linkTargets.has(pathOnly)) linkTargets.set(pathOnly, p);
      }
    }
  } finally {
    await browser.close();
  }

  for (const [l, src] of linkTargets) {
    const r = await getStatic(l);
    // Vite SPA preview returns 200 for unknown paths (index.html). Soft-warn only.
    if (r.status === 0) fail(`link to ${l} (from ${src}) unreachable`);
    else if (r.status >= 400) fail(`link to ${l} (from ${src}) answers ${r.status}`);
    else warn(`internal link ${l} (from ${src}) not in sitemap — verify route exists`);
  }

  const report = {
    base: BASE,
    generatedAt: new Date().toISOString(),
    result: fails.length ? "FAIL" : "PASS",
    fails,
    warns,
    claims,
    pageCount: pages.length,
    pages: pages.map((p) => ({
      path: p.path,
      status: p.status,
      title: p.title,
      h1: p.h1,
      canonical: p.canonical,
      robots: p.robots,
      dollarHits: p.dollarHits,
      medicalHits: p.medicalHits,
    })),
  };
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));

  for (const f of fails) console.log(`FAIL ${f}`);
  for (const w of warns) console.log(`WARN ${w}`);
  for (const c of claims) console.log(`CLAIM ${c}`);
  console.log(
    `\nRESULT: ${fails.length ? "FAIL" : "PASS"} (${fails.length} fails, ${warns.length} warns, ${claims.length} claims, ${pages.length} pages)`,
  );
  console.log(`Wrote ${OUT}`);
  stopServer();
  process.exit(fails.length ? 1 : 0);
}

main().catch((e) => {
  console.error("audit crashed:", e);
  stopServer();
  process.exit(2);
});
