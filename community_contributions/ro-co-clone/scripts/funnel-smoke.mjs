#!/usr/bin/env node
/**
 * Smoke: consent dismiss + care → insurance → visit → checkout confirmation.
 *   AUDIT_BASE=http://127.0.0.1:4173 node scripts/funnel-smoke.mjs
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.AUDIT_PORT || 4173);
const BASE = (process.env.AUDIT_BASE || `http://127.0.0.1:${PORT}`).replace(/\/$/, "");
const MEDIA = process.env.SMOKE_MEDIA_DIR || "";

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

function getStatic(urlPath) {
  return new Promise((resolve) => {
    const u = new URL(urlPath, BASE);
    const req = http.request(
      { hostname: u.hostname, port: u.port || 80, path: u.pathname, method: "GET" },
      (res) => {
        res.resume();
        res.on("end", () => resolve(res.statusCode ?? 0));
      },
    );
    req.on("error", () => resolve(0));
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
  if ((await getStatic("/robots.txt")) === 200) return;
  server = spawn("npx", ["vite", "preview", "--host", "127.0.0.1", "--port", String(PORT)], {
    cwd: ROOT,
    stdio: "ignore",
    detached: true,
  });
  for (let i = 0; i < 45; i++) {
    await sleep(1000);
    if ((await getStatic("/robots.txt")) === 200) return;
  }
  throw new Error("preview not up");
}

async function shot(page, name) {
  if (!MEDIA) return;
  await page.screenshot({ path: path.join(MEDIA, name), fullPage: false });
}

async function main() {
  await ensureServer();

  // Host readiness: SPA deep links + media must resolve on preview (same contract as vercel/_redirects).
  const deepPaths = [
    "/weight-loss",
    "/products/weekly-glp1",
    "/quiz/hair",
    "/guides/g1",
    "/isi/glp1",
    "/this-route-does-not-exist",
  ];
  for (const p of deepPaths) {
    const code = await getStatic(p);
    check(`SPA shell ${p}`, code === 200, `status ${code}`);
  }
  const heroCode = await getStatic("/media/hero-home.jpg");
  check("media hero-home.jpg", heroCode === 200, `status ${heroCode}`);
  const vercelCfg = path.join(ROOT, "vercel.json");
  const redirectsCfg = path.join(ROOT, "public", "_redirects");
  check("vercel.json present", fs.existsSync(vercelCfg));
  check("public/_redirects present", fs.existsSync(redirectsCfg));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const consent = page.getByTestId("consent-essential");
    check("consent visible", (await consent.count()) > 0);
    await consent.click();
    await page.waitForTimeout(300);
    check("consent dismissed", (await page.getByTestId("consent-essential").count()) === 0);

    // P1-03: unpublished orphans must not appear on customer home.
    const homeText = await page.locator("main, .home").first().innerText();
    check(
      "home has no invented testimonials",
      !/Alex M\.|Jordan P\.|Sam R\./i.test(homeText),
    );
    check(
      "home has no vanity stats",
      !/\b3M\+|95%\b/.test(homeText) && (await page.getByTestId("vanity-stats").count()) === 0,
    );
    check(
      "home has no orphan sections",
      (await page.getByTestId("home-testimonials").count()) === 0 &&
        (await page.getByTestId("home-experts").count()) === 0 &&
        (await page.getByTestId("home-more-care").count()) === 0,
    );
    await shot(page, "health-seo-mobile-home.png");

    await page.goto(`${BASE}/weight-loss`, { waitUntil: "networkidle" });
    check("weight page h1", (await page.locator("h1").count()) === 1);
    const priceTag = page.getByTestId("price-tag").first();
    check("PriceTag pending amount", (await priceTag.count()) > 0);
    if ((await priceTag.count()) > 0) {
      const priceText = await priceTag.innerText();
      check(
        "PriceTag null (no invented $)",
        priceText.includes("—") && /pending verification/i.test(priceText) && !/\$\d/.test(priceText),
        priceText.replace(/\s+/g, " ").slice(0, 80),
      );
    }
    await shot(page, "health-seo-mobile-weight.png");

    // Clerk fail-closed without publishable key / allowlist in this preview build.
    await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
    const adminBody = await page.locator("body").innerText();
    check(
      "admin fail-closed without Clerk",
      /Admin locked/i.test(adminBody) &&
        /Auth not configured/i.test(adminBody) &&
        /VITE_CLERK_PUBLISHABLE_KEY/i.test(adminBody) &&
        (await page.locator('input[type="password"]').count()) === 0,
      adminBody.replace(/\s+/g, " ").slice(0, 120),
    );

    // Customer auth routes locked without publishable key (no live sign-in/out without secrets).
    for (const authPath of ["/sign-in", "/sign-up", "/account"]) {
      await page.goto(`${BASE}${authPath}`, { waitUntil: "networkidle" });
      const authUnavailable = page.getByTestId("auth-unavailable");
      const authBody = await page.locator("body").innerText();
      check(
        `customer auth locked ${authPath}`,
        (await authUnavailable.count()) > 0 &&
          /Auth not configured/i.test(authBody) &&
          /VITE_CLERK_PUBLISHABLE_KEY/i.test(authBody),
        authBody.replace(/\s+/g, " ").slice(0, 100),
      );
      await shot(page, `clerk-auth-locked-${authPath.replace(/\//g, "") || "root"}.png`);
    }
    check(
      "header account link (locked)",
      (await page.getByTestId("header-account-locked").count()) > 0 ||
        (await page.getByRole("link", { name: /^Account$/i }).count()) > 0,
    );

    // Patient dashboard shell design preview (no Clerk key) — honest empty states, no fake orders.
    await page.goto(`${BASE}/account?previewShell=1`, { waitUntil: "networkidle" });
    const dash = page.getByTestId("account-dashboard");
    const dashText = await page.locator("body").innerText();
    check(
      "account shell preview overview",
      (await dash.count()) > 0 &&
        (await page.getByTestId("account-preview-banner").count()) > 0 &&
        (await page.getByTestId("account-subnav").count()) > 0 &&
        (await page.getByTestId("account-overview").count()) > 0 &&
        (await page.getByTestId("account-activity-empty").count()) > 0 &&
        !/tracking\s*#|UPS|FedEx|\$\d+\.\d{2}/i.test(dashText),
    );
    await page.goto(`${BASE}/account/orders?previewShell=1`, { waitUntil: "networkidle" });
    check(
      "account shell preview orders empty",
      (await page.getByTestId("account-orders-empty").count()) > 0 &&
        /Coming when integrations live/i.test(await page.locator("body").innerText()),
    );
    await page.goto(`${BASE}/account/settings?previewShell=1`, { waitUntil: "networkidle" });
    check(
      "account shell preview settings stubs",
      (await page.getByTestId("account-notif-prefs").count()) > 0 &&
        (await page.getByTestId("account-clerk-stub").count()) > 0,
    );

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/sign-in`, { waitUntil: "networkidle" });
    await shot(page, "clerk-auth-signin-locked-desktop.png");
    await page.goto(`${BASE}/account`, { waitUntil: "networkidle" });
    await shot(page, "clerk-auth-account-locked-desktop.png");
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(`${BASE}/insurance-check?goal=weight&product=weekly-glp1`, {
      waitUntil: "networkidle",
    });
    await page.getByPlaceholder("Sample Health Plan").fill("Acme Health");
    await page.getByPlaceholder("ABC123").fill("MEM-1");
    await page.getByRole("button", { name: /Run coverage check/i }).click();
    check("insurance result", await page.getByRole("heading", { name: /Coverage result/i }).isVisible());
    await shot(page, "health-seo-mobile-insurance.png");
    await page.getByRole("link", { name: /Continue to visit/i }).click();
    await page.waitForURL(/\/visit/);

    // Visit steps
    await page.getByRole("button", { name: /^Weight$/ }).click();
    await page.getByRole("button", { name: /^Continue$/ }).click();
    await page.locator("select").selectOption("Texas");
    await page.getByRole("button", { name: /^Continue$/ }).click();
    await page.getByRole("button", { name: /Weekly GLP-1/i }).click();
    await page.getByRole("button", { name: /^Continue$/ }).click();
    await page.getByText(/non-clinical intake/i).click();
    await page.getByRole("button", { name: /Finish visit/i }).click();
    check("visit done", await page.getByRole("heading", { name: /Visit saved/i }).isVisible());
    await shot(page, "health-seo-mobile-visit-done.png");

    await page.getByRole("link", { name: /Review sample plan/i }).click();
    await page.waitForURL(/\/checkout/);
    await page.getByText(/local layout preview only/i).click();
    await page.getByRole("button", { name: /Confirm plan/i }).click();
    check(
      "checkout confirmed",
      await page.getByRole("heading", { name: /Plan confirmed/i }).isVisible(),
    );
    check("checkout back to care", await page.getByRole("link", { name: /Back to care/i }).isVisible());
    await shot(page, "health-seo-mobile-checkout.png");

    // Empty validation
    await page.getByRole("link", { name: /Edit visit answers/i }).click();
    await page.waitForURL(/\/visit/);
    // Desktop screenshot of home funnel entry
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await shot(page, "health-seo-desktop-home.png");
    await page.goto(`${BASE}/checkout?product=weekly-glp1`, { waitUntil: "networkidle" });
    await shot(page, "health-seo-desktop-checkout.png");
  } finally {
    await browser.close();
    stopServer();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\nSMOKE: ${failed.length ? "FAIL" : "PASS"} (${results.length - failed.length}/${results.length})`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  stopServer();
  process.exit(2);
});
