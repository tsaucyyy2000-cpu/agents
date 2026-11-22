#!/usr/bin/env node
/**
 * Smoke: consent dismiss + care → insurance → visit → checkout confirmation.
 *   AUDIT_BASE=http://127.0.0.1:4173 node scripts/funnel-smoke.mjs
 */
import { spawn } from "node:child_process";
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
    await shot(page, "health-seo-mobile-home.png");

    await page.goto(`${BASE}/weight-loss`, { waitUntil: "networkidle" });
    check("weight page h1", (await page.locator("h1").count()) === 1);
    await shot(page, "health-seo-mobile-weight.png");

    await page.goto(`${BASE}/insurance-check?goal=weight&product=weekly-glp1`, {
      waitUntil: "networkidle",
    });
    await page.getByPlaceholder("Demo Health Plan").fill("Acme Health");
    await page.getByPlaceholder("ABC123").fill("MEM-1");
    await page.getByRole("button", { name: /Run demo check/i }).click();
    check("insurance result", await page.getByRole("heading", { name: /Demo result/i }).isVisible());
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
    await page.getByText(/non-clinical demo/i).click();
    await page.getByRole("button", { name: /Finish demo visit/i }).click();
    check("visit done", await page.getByRole("heading", { name: /Demo visit saved/i }).isVisible());
    await shot(page, "health-seo-mobile-visit-done.png");

    await page.getByRole("link", { name: /Review sample plan/i }).click();
    await page.waitForURL(/\/checkout/);
    await page.getByText(/local demo only/i).click();
    await page.getByRole("button", { name: /Confirm demo plan/i }).click();
    check(
      "checkout confirmed",
      await page.getByRole("heading", { name: /Demo plan confirmed/i }).isVisible(),
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
