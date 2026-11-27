#!/usr/bin/env node
/**
 * Capture provider-portal-*.png screenshots (design preview, no Clerk).
 *   AUDIT_BASE=http://127.0.0.1:4173 MEDIA_DIR=... node scripts/provider-shots.mjs
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
const CONTENT_KEY = "ro-clone-site-content-v2";
const SUPPORT_KEY = "ro-clone-support-messages-v1";
const APPT_KEY = "ro-clone-appointments-v1";

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

const SAMPLE_CASE_ID = "provider-demo-case-1";

async function seedProviderDemo(page) {
  await page.evaluate(
    ({ contentKey, supportKey, apptKey, caseId }) => {
      const now = new Date().toISOString();
      const slotStart = new Date();
      slotStart.setDate(slotStart.getDate() + 2);
      slotStart.setHours(10, 0, 0, 0);
      let base;
      try {
        base = JSON.parse(localStorage.getItem(contentKey) || "null");
      } catch {
        base = null;
      }
      if (!base || typeof base !== "object" || !Array.isArray(base.products)) {
        throw new Error("site content not initialized — open /provider preview first");
      }
      base.version = Math.max(Number(base.version) || 0, 10);
      base.updatedAt = now;
      base.staffAllowlist = [{ email: "preview@provider.local", roles: ["provider"] }];
      base.providerNoteTemplates = [
        "Intake answers viewed — no clinical decision recorded (demo).",
        "Requested more information from the patient via support messaging (demo).",
      ];
      base.leads = [
        {
          id: caseId,
          createdAt: now,
          goal: "Weight loss",
          state: "CA",
          notes: "Demo visit lead for provider portal screenshots.",
          status: "awaiting_review",
          source: "quiz",
          quizSlug: "weight-loss",
          answers: {
            goal: "Lose weight sustainably",
            bmi_band: "Demo band only",
            medications: "None listed (demo)",
          },
          providerNotes: [],
        },
      ];
      localStorage.setItem(contentKey, JSON.stringify(base));
      localStorage.setItem(
        supportKey,
        JSON.stringify({
          version: 1,
          threads: [
            {
              id: "provider-demo-thread-1",
              subject: "Shipping question (demo)",
              patientKey: "demo-patient@example.com",
              patientLabel: "Demo patient",
              status: "open",
              createdAt: now,
              updatedAt: now,
              messages: [
                {
                  id: "m1",
                  author: "patient",
                  body: "When should I expect a confirmation email?",
                  createdAt: now,
                },
              ],
            },
          ],
        }),
      );
      localStorage.setItem(
        apptKey,
        JSON.stringify({
          version: 1,
          appointments: [
            {
              id: "provider-demo-appt-1",
              patientKey: "demo-patient@example.com",
              patientLabel: "Demo patient",
              category: "weight",
              slotStart: slotStart.toISOString(),
              durationMin: 20,
              careTeamLabel: "Care team",
              slotLabel: "Slot A",
              status: "scheduled",
              modality: "video",
              reminderEnabled: false,
              createdAt: now,
              updatedAt: now,
            },
          ],
        }),
      );
    },
    {
      contentKey: CONTENT_KEY,
      supportKey: SUPPORT_KEY,
      apptKey: APPT_KEY,
      caseId: SAMPLE_CASE_ID,
    },
  );
}

async function main() {
  fs.mkdirSync(MEDIA, { recursive: true });
  await ensureServer();
  const browser = await chromium.launch({ headless: true });
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await desktop.newPage();

  try {
    await page.goto(`${BASE}/provider`, { waitUntil: "networkidle" });
    await dismissConsent(page);
    await shot(page, "provider-portal-locked.png");

    await page.goto(`${BASE}/provider?previewShell=1`, { waitUntil: "networkidle" });
    await dismissConsent(page);
    await seedProviderDemo(page);
    await page.reload({ waitUntil: "networkidle" });
    await dismissConsent(page);
    await shot(page, "provider-portal-worklist.png");

    await page.goto(`${BASE}/provider/cases/${SAMPLE_CASE_ID}?previewShell=1`, {
      waitUntil: "networkidle",
    });
    await dismissConsent(page);
    await page.getByTestId("provider-note-input").fill(
      "Intake answers viewed — no clinical decision recorded (demo).",
    );
    await page.getByTestId("provider-note-save").click();
    await page.waitForTimeout(400);
    await shot(page, "provider-portal-case.png");

    await page.goto(`${BASE}/provider/messages?previewShell=1`, { waitUntil: "networkidle" });
    await dismissConsent(page);
    await shot(page, "provider-portal-messages.png");

    await page.goto(`${BASE}/provider/appointments?previewShell=1`, { waitUntil: "networkidle" });
    await dismissConsent(page);
    await shot(page, "provider-portal-appointments.png");

    await page.goto(`${BASE}/provider/templates?previewShell=1`, { waitUntil: "networkidle" });
    await dismissConsent(page);
    await shot(page, "provider-portal-templates.png");

    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobilePage = await mobile.newPage();
    await mobilePage.goto(`${BASE}/provider?previewShell=1`, { waitUntil: "networkidle" });
    await dismissConsent(mobilePage);
    await seedProviderDemo(mobilePage);
    await mobilePage.reload({ waitUntil: "networkidle" });
    await dismissConsent(mobilePage);
    await shot(mobilePage, "provider-portal-worklist-mobile.png");
    await mobile.close();
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
