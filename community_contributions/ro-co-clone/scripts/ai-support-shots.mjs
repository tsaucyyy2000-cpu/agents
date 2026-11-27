#!/usr/bin/env node
/**
 * Capture ai-support-*.png screenshots for the site helper shell.
 *   AUDIT_BASE=http://127.0.0.1:4173 MEDIA_DIR=... node scripts/ai-support-shots.mjs
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

async function openHelper(page) {
  await page.getByTestId("support-assistant-launch").click();
  await page.getByTestId("support-assistant-panel").waitFor({ state: "visible" });
}

async function main() {
  fs.mkdirSync(MEDIA, { recursive: true });
  await ensureServer();
  const browser = await chromium.launch({ headless: true });

  try {
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await desktop.newPage();

    await page.goto(`${BASE}/help`, { waitUntil: "networkidle" });
    await dismissConsent(page);
    await shot(page, "ai-support-launcher-desktop.png");

    await openHelper(page);
    await shot(page, "ai-support-open-desktop.png");

    await page.getByTestId("support-assistant-chip").first().click();
    await page.waitForTimeout(400);
    await shot(page, "ai-support-faq-match-desktop.png");

    await page.getByTestId("support-assistant-input").fill("What medication should I take for hair loss?");
    await page.getByTestId("support-assistant-send").click();
    await page.waitForTimeout(400);
    await shot(page, "ai-support-clinical-refusal-desktop.png");

    await page.getByTestId("support-assistant-input").fill("How do I reset my florbnitz?");
    await page.getByTestId("support-assistant-send").click();
    await page.waitForTimeout(400);
    await shot(page, "ai-support-escalate-desktop.png");

    await desktop.close();

    const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const mpage = await mobile.newPage();
    await mpage.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await dismissConsent(mpage);
    await openHelper(mpage);
    await shot(mpage, "ai-support-open-mobile.png");

    await mpage.getByTestId("support-assistant-input").fill("How does membership work?");
    await mpage.getByTestId("support-assistant-send").click();
    await mpage.waitForTimeout(400);
    await shot(mpage, "ai-support-membership-mobile.png");

    await mobile.close();
  } finally {
    await browser.close();
    stopServer();
  }
}

main().catch((err) => {
  console.error(err);
  stopServer();
  process.exit(1);
});
