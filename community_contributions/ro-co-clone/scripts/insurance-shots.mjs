#!/usr/bin/env node
/**
 * Capture insurance-shell-*.png screenshots (patient + funnel + design-preview admin).
 *   AUDIT_BASE=http://127.0.0.1:4173 MEDIA_DIR=... node scripts/insurance-shots.mjs
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
const MEDIA =
  process.env.MEDIA_DIR ||
  "/cursor/stores/bc-4def6ec3-e169-4d36-ace1-7746b505cc6d/media";

const INS_KEY = "ro-clone-insurance-inquiries-v1";

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

async function dismissConsent(page) {
  const consent = page.getByTestId("consent-essential");
  if ((await consent.count()) > 0) await consent.click();
}

async function shot(page, name) {
  const dest = path.join(MEDIA, name);
  await page.screenshot({ path: dest, fullPage: false });
  console.log("wrote", dest);
}

async function main() {
  fs.mkdirSync(MEDIA, { recursive: true });
  await ensureServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE}/account/insurance?previewShell=1`, { waitUntil: "networkidle" });
    await dismissConsent(page);
    await page.evaluate((key) => localStorage.removeItem(key), INS_KEY);
    await page.reload({ waitUntil: "networkidle" });
    await dismissConsent(page);
    await page.getByTestId("account-insurance").scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await shot(page, "insurance-shell-form.png");

    await page.getByTestId("insurance-carrier").fill("Acme Health");
    await page.getByTestId("insurance-member-id").fill("MEM-42");
    await page.getByTestId("insurance-subscriber").fill("Alex Preview");
    await page.getByTestId("insurance-submit").evaluate((el) => el.click());
    await page.waitForTimeout(400);
    await page.getByTestId("insurance-item").first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await shot(page, "insurance-shell-inquiry.png");

    await page.getByTestId("insurance-cashpay").scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    await shot(page, "insurance-shell-cashpay.png");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/account/insurance?previewShell=1`, { waitUntil: "networkidle" });
    await dismissConsent(page);
    await page.getByTestId("account-insurance").scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await shot(page, "insurance-shell-mobile.png");

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/insurance-check?goal=weight`, { waitUntil: "networkidle" });
    await dismissConsent(page);
    await page.evaluate((key) => localStorage.removeItem(key), INS_KEY);
    await page.reload({ waitUntil: "networkidle" });
    await dismissConsent(page);
    await page.getByTestId("funnel-insurance-form").scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await shot(page, "insurance-shell-funnel.png");

    await page.getByTestId("funnel-insurance-carrier").fill("Sample Health Plan");
    await page.getByTestId("funnel-insurance-member").fill("ABC123");
    await page.getByTestId("funnel-insurance-submit").click();
    await page.waitForTimeout(350);
    await shot(page, "insurance-shell-funnel-saved.png");

    await page.goto(`${BASE}/design/insurance-queue?previewShell=1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    await shot(page, "insurance-shell-admin.png");

    await page.getByTestId("admin-insurance-set-under_review").first().evaluate((el) => el.click());
    await page.waitForTimeout(300);
    await shot(page, "insurance-shell-admin-review.png");

    console.log("insurance shots done");
  } finally {
    await browser.close();
    stopServer();
  }
}

main().catch((e) => {
  console.error(e);
  stopServer();
  process.exit(2);
});
