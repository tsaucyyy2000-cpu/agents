#!/usr/bin/env node
/**
 * Capture appointments-shell-*.png screenshots (patient + design-preview admin).
 *   AUDIT_BASE=http://127.0.0.1:4173 MEDIA_DIR=... node scripts/appointments-shots.mjs
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

const STORE_KEY = "ro-clone-appointments-v1";

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
    await page.goto(`${BASE}/account/appointments?previewShell=1`, { waitUntil: "networkidle" });
    await dismissConsent(page);
    await page.evaluate((key) => localStorage.removeItem(key), STORE_KEY);
    await page.reload({ waitUntil: "networkidle" });
    await dismissConsent(page);
    await shot(page, "appointments-shell-empty.png");

    await page.getByTestId("appointments-book-open").evaluate((el) => el.click());
    await page.waitForTimeout(250);
    await page.getByTestId("appointments-calendar").scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await shot(page, "appointments-shell-book-calendar.png");

    await page.getByTestId("appointments-category-weight").evaluate((el) => el.click());
    await page.waitForTimeout(100);
    await page.getByTestId("appointments-slot").first().evaluate((el) => el.click());
    await page.waitForTimeout(150);
    await page.getByTestId("appointments-confirm").scrollIntoViewIfNeeded();
    await shot(page, "appointments-shell-confirm.png");

    await page.getByTestId("appointments-book-reminder").check();
    await page.getByTestId("appointments-confirm-btn").evaluate((el) => el.click());
    await page.waitForTimeout(400);
    await shot(page, "appointments-shell-upcoming.png");

    await page.getByTestId("appointments-video-cta").first().evaluate((el) => el.click());
    await page.waitForTimeout(200);
    await shot(page, "appointments-shell-video-pending.png");

    await page.getByTestId("appointments-reschedule").first().evaluate((el) => el.click());
    await page.waitForTimeout(250);
    await page.getByTestId("appointments-slot").nth(1).evaluate((el) => el.click());
    await page.waitForTimeout(100);
    await page.getByTestId("appointments-confirm-btn").evaluate((el) => el.click());
    await page.waitForTimeout(300);
    await shot(page, "appointments-shell-rescheduled.png");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/account/appointments?previewShell=1`, { waitUntil: "networkidle" });
    await dismissConsent(page);
    await page.getByTestId("account-appointments").scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await shot(page, "appointments-shell-patient-mobile.png");

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/design/appointments-queue?previewShell=1`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(300);
    await shot(page, "appointments-shell-admin.png");

    console.log("appointments shots done");
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
