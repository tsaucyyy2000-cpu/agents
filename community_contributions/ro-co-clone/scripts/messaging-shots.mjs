#!/usr/bin/env node
/**
 * Capture messaging-shell-*.png screenshots (patient + design-preview admin queue).
 *   AUDIT_BASE=http://127.0.0.1:4173 MEDIA_DIR=... node scripts/messaging-shots.mjs
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

const STORE_KEY = "ro-clone-support-messages-v1";

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
    await page.goto(`${BASE}/account/messages?previewShell=1`, { waitUntil: "networkidle" });
    await dismissConsent(page);
    await page.evaluate((key) => localStorage.removeItem(key), STORE_KEY);
    await page.reload({ waitUntil: "networkidle" });
    await dismissConsent(page);
    await shot(page, "messaging-shell-patient-empty.png");

    await page.getByTestId("messages-compose-open").evaluate((el) => el.click());
    await page.waitForTimeout(200);
    await shot(page, "messaging-shell-patient-compose.png");

    await page.getByTestId("messages-subject").fill("Shipping update");
    await page.getByTestId("messages-body").fill("When should I expect my order confirmation email?");
    await page.getByTestId("messages-send").evaluate((el) => el.click());
    await page.waitForTimeout(400);
    await shot(page, "messaging-shell-patient-thread.png");

    // Attachment reject path (PHI-ish filename)
    await page.getByTestId("messages-compose-open").evaluate((el) => el.click());
    await page.waitForTimeout(150);
    await page.setInputFiles('[data-testid="messages-attach-input"]', {
      name: "lab-result-phi.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-fake"),
    });
    await page.waitForTimeout(200);
    const attachNotice = page.getByTestId("messages-attach-notice");
    await attachNotice.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await shot(page, "messaging-shell-attach-reject.png");

    // Seed a second thread + support reply for admin queue preview
    await page.evaluate((key) => {
      const now = new Date().toISOString();
      const store = {
        version: 1,
        threads: [
          {
            id: "thr-shot-1",
            subject: "Shipping update",
            patientKey: "preview@example.local",
            patientLabel: "Alex Preview",
            status: "pending",
            createdAt: now,
            updatedAt: now,
            messages: [
              {
                id: "msg-1",
                author: "patient",
                body: "When should I expect my order confirmation email?",
                createdAt: now,
              },
              {
                id: "msg-2",
                author: "support",
                body: "Thanks for writing in — we will check the confirmation status shortly.",
                createdAt: now,
              },
            ],
          },
          {
            id: "thr-shot-2",
            subject: "Billing question",
            patientKey: "preview@example.local",
            patientLabel: "Alex Preview",
            status: "open",
            createdAt: now,
            updatedAt: now,
            messages: [
              {
                id: "msg-3",
                author: "patient",
                body: "Can you clarify my invoice total?",
                createdAt: now,
              },
            ],
          },
        ],
      };
      localStorage.setItem(key, JSON.stringify(store));
    }, STORE_KEY);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/account/messages?previewShell=1`, { waitUntil: "networkidle" });
    await dismissConsent(page);
    await page.getByTestId("account-messages").scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await shot(page, "messaging-shell-patient-mobile.png");

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/design/support-queue?previewShell=1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    await shot(page, "messaging-shell-admin-queue.png");

    // Reply + status controls visible
    if ((await page.getByTestId("admin-messages-reply-body").count()) > 0) {
      await page.getByTestId("admin-messages-reply-body").fill("We opened a logistics check.");
      await page.getByTestId("admin-status-open").evaluate((el) => el.click());
      await page.waitForTimeout(200);
      await shot(page, "messaging-shell-admin-reply.png");
    }

    console.log("messaging shots done");
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
