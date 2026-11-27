#!/usr/bin/env node
/**
 * Capture weight-progress-*.png screenshots (patient progress shell).
 *   AUDIT_BASE=http://127.0.0.1:4173 MEDIA_DIR=... node scripts/progress-shots.mjs
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

const STORE_KEY = "ro-clone-weight-progress-v1";

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

async function seedProgress(page, { escalateToday = false } = {}) {
  await page.evaluate(
    ({ key, escalateToday: escalate }) => {
      const today = new Date();
      const iso = (offsetDays) => {
        const d = new Date(today);
        d.setDate(d.getDate() + offsetDays);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };
      const payload = {
        version: 1,
        profile: {
          startingWeightLb: 220,
          goalWeightLb: 180,
          unit: "lb",
          updatedAt: new Date().toISOString(),
        },
        checkIns: [
          {
            id: "checkin-seed-1",
            date: iso(-21),
            weightLb: 218,
            createdAt: new Date().toISOString(),
          },
          {
            id: "checkin-seed-2",
            date: iso(-14),
            weightLb: 214,
            sideEffects: ["fatigue"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "checkin-seed-3",
            date: iso(-7),
            weightLb: 210,
            note: "Feeling steadier this week",
            createdAt: new Date().toISOString(),
          },
          {
            id: "checkin-seed-4",
            date: iso(0),
            weightLb: 208,
            sideEffects: escalate ? ["nausea"] : ["fatigue"],
            createdAt: new Date().toISOString(),
          },
        ],
        habits: [
          {
            date: iso(0),
            hydrationGlasses: 6,
            activityMinutes: 35,
            proteinGoal: true,
            sleepGoal: true,
            movementGoal: false,
          },
        ],
      };
      localStorage.setItem(key, JSON.stringify(payload));
    },
    { key: STORE_KEY, escalateToday },
  );
}

async function openProgress(page) {
  await page.goto(`${BASE}/account/progress?previewShell=1`, { waitUntil: "networkidle" });
  await dismissConsent(page);
}

async function main() {
  fs.mkdirSync(MEDIA, { recursive: true });
  await ensureServer();
  const browser = await chromium.launch({ headless: true });

  try {
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await openProgress(desktop);
    await seedProgress(desktop);
    await desktop.reload({ waitUntil: "networkidle" });
    await dismissConsent(desktop);
    await desktop.getByTestId("progress-summary").waitFor({ state: "visible" });
    await desktop.getByTestId("progress-summary").scrollIntoViewIfNeeded();
    await desktop.waitForTimeout(200);
    await shot(desktop, "weight-progress-desktop.png");

    await desktop.getByTestId("progress-chart").scrollIntoViewIfNeeded();
    await desktop.waitForTimeout(150);
    await shot(desktop, "weight-progress-chart.png");

    await desktop.getByTestId("progress-unit-kg").click();
    await desktop.waitForTimeout(200);
    await desktop.getByTestId("progress-summary").scrollIntoViewIfNeeded();
    await desktop.waitForTimeout(150);
    await shot(desktop, "weight-progress-units-kg.png");

    await desktop.getByTestId("progress-unit-lb").click();
    await desktop.waitForTimeout(100);
    await desktop.getByTestId("progress-checkin-weight").fill("207");
    await desktop.getByTestId("progress-se-nausea").check();
    await desktop.getByTestId("progress-checkin-save").click();
    await desktop.waitForTimeout(300);
    await desktop.getByTestId("progress-escalation").scrollIntoViewIfNeeded();
    await desktop.waitForTimeout(150);
    await shot(desktop, "weight-progress-escalation.png");

    await desktop.evaluate((key) => localStorage.removeItem(key), STORE_KEY);
    await openProgress(desktop);
    await desktop.getByTestId("progress-summary").scrollIntoViewIfNeeded();
    await desktop.waitForTimeout(150);
    await shot(desktop, "weight-progress-empty.png");

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await openProgress(mobile);
    await seedProgress(mobile);
    await mobile.reload({ waitUntil: "networkidle" });
    await dismissConsent(mobile);
    await mobile.getByTestId("progress-summary").waitFor({ state: "visible" });
    await mobile.getByTestId("progress-summary").scrollIntoViewIfNeeded();
    await mobile.waitForTimeout(200);
    await shot(mobile, "weight-progress-mobile.png");

    await mobile.getByTestId("progress-habits-form").scrollIntoViewIfNeeded();
    await mobile.waitForTimeout(150);
    await shot(mobile, "weight-progress-habits-mobile.png");
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
