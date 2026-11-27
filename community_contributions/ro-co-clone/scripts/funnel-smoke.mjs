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
    "/membership",
    "/membership/checkout",
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

    // Provider portal fail-closed without Clerk; design preview shows Rx banner + demo chrome.
    await page.goto(`${BASE}/provider`, { waitUntil: "networkidle" });
    const providerLocked = await page.locator("body").innerText();
    check(
      "provider fail-closed without Clerk",
      /Provider locked/i.test(providerLocked) &&
        /Auth not configured/i.test(providerLocked) &&
        (await page.getByTestId("provider-locked").count()) > 0,
      providerLocked.replace(/\s+/g, " ").slice(0, 120),
    );
    await page.goto(`${BASE}/provider?previewShell=1`, { waitUntil: "networkidle" });
    const providerPreview = await page.locator("body").innerText();
    check(
      "provider shell preview",
      (await page.getByTestId("provider-portal").count()) > 0 &&
        (await page.getByTestId("provider-rx-banner").count()) > 0 &&
        /Cannot prescribe/i.test(providerPreview) &&
        /not clinical system of record/i.test(providerPreview),
      providerPreview.replace(/\s+/g, " ").slice(0, 140),
    );
    await page.goto(`${BASE}/provider/appointments?previewShell=1`, { waitUntil: "networkidle" });
    const providerApptText = await page.locator("body").innerText();
    check(
      "provider appointments handoff stub",
      (await page.getByTestId("provider-appointments").count()) > 0 &&
        /booking sandbox/i.test(providerApptText) &&
        /Video consult integration is pending/i.test(providerApptText) &&
        (await page.getByRole("link", { name: /admin appointments/i }).count()) > 0,
      providerApptText.replace(/\s+/g, " ").slice(0, 140),
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
        /Coming when integrations live/i.test(await page.locator("body").innerText()) &&
        /awaiting partner integration/i.test(await page.locator("body").innerText()) &&
        !/tracking\s*#|1Z[A-Z0-9]{10,}|UPS|FedEx/i.test(await page.locator("body").innerText()),
    );
    await page.goto(`${BASE}/account/labs?previewShell=1`, { waitUntil: "networkidle" });
    check(
      "account shell preview labs empty",
      (await page.getByTestId("account-labs").count()) > 0 &&
        (await page.getByTestId("account-labs-empty").count()) > 0 &&
        /awaiting partner integration/i.test(await page.locator("body").innerText()) &&
        !/hemoglobin|ng\/dL|positive|negative result/i.test(await page.locator("body").innerText()),
    );
    // Lab + pharmacy pending shell request (no fabricated results / tracking).
    await page.getByTestId("labs-request-btn").evaluate((el) => {
      /** @type {HTMLElement} */ (el).click();
    });
    await page.waitForTimeout(200);
    check(
      "labs pending request pipeline",
      (await page.getByTestId("labs-item").count()) > 0 &&
        (await page.getByTestId("labs-partner-chip").count()) > 0 &&
        /Awaiting partner integration/i.test(
          await page.getByTestId("labs-partner-chip").first().innerText(),
        ) &&
        (await page.getByTestId("pipeline-step-result_review").count()) > 0,
    );
    await page.goto(`${BASE}/account/orders?previewShell=1`, { waitUntil: "networkidle" });
    await page.getByTestId("orders-request-btn").evaluate((el) => {
      /** @type {HTMLElement} */ (el).click();
    });
    await page.waitForTimeout(200);
    check(
      "orders pharmacy pending pipeline",
      (await page.getByTestId("orders-item").count()) > 0 &&
        (await page.getByTestId("orders-partner-chip").count()) > 0 &&
        /tracking: none/i.test(await page.getByTestId("orders-item").first().innerText()) &&
        !/tracking\s*#|1Z[A-Z0-9]{10,}/i.test(await page.locator("body").innerText()),
    );
    await page.goto(`${BASE}/design/labs-queue?previewShell=1`, { waitUntil: "networkidle" });
    check(
      "admin labs design preview queue",
      (await page.getByTestId("admin-labs-preview").count()) > 0 &&
        (await page.getByTestId("admin-labs").count()) > 0 &&
        (await page.getByTestId("admin-labs-row").count()) > 0,
    );
    await page.goto(`${BASE}/design/pharmacy-queue?previewShell=1`, { waitUntil: "networkidle" });
    check(
      "admin pharmacy design preview queue",
      (await page.getByTestId("admin-pharmacy-preview").count()) > 0 &&
        (await page.getByTestId("admin-pharmacy").count()) > 0 &&
        (await page.getByTestId("admin-pharmacy-row").count()) > 0,
    );
    await page.goto(`${BASE}/provider/labs?previewShell=1`, { waitUntil: "networkidle" });
    check(
      "provider labs read-only queue",
      (await page.getByTestId("provider-labs").count()) > 0 &&
        (await page.getByTestId("provider-labs-row").count()) > 0 &&
        /awaiting partner integration/i.test(await page.locator("body").innerText()),
    );
    await page.goto(`${BASE}/provider/pharmacy?previewShell=1`, { waitUntil: "networkidle" });
    check(
      "provider pharmacy read-only queue",
      (await page.getByTestId("provider-pharmacy").count()) > 0 &&
        (await page.getByTestId("provider-pharmacy-row").count()) > 0 &&
        /tracking: none/i.test(await page.locator("body").innerText()),
    );
    await page.goto(`${BASE}/account/settings?previewShell=1`, { waitUntil: "networkidle" });
    check(
      "account shell preview settings stubs",
      (await page.getByTestId("account-notif-prefs").count()) > 0 &&
        (await page.getByTestId("account-clerk-stub").count()) > 0,
    );

    // Appointment booking shell (fake calendar; Care team slots; safe toasts; no video provider).
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/account/appointments?previewShell=1`, { waitUntil: "networkidle" });
    const apptRoot = page.getByTestId("account-appointments");
    const apptText = (await apptRoot.count()) > 0 ? await apptRoot.innerText() : "";
    check(
      "account appointments shell preview",
      (await apptRoot.count()) > 0 &&
        (await page.getByTestId("appointments-upcoming").count()) > 0 &&
        /localStorage|sandbox|Video integration pending/i.test(apptText) &&
        !/Dr\.|MD,|licensed clinician/i.test(apptText),
      apptText.slice(0, 120),
    );
    await page.getByTestId("appointments-book-open").evaluate((el) => {
      /** @type {HTMLElement} */ (el).click();
    });
    await page.waitForTimeout(150);
    check(
      "appointments book panel calendar",
      (await page.getByTestId("appointments-book-panel").count()) > 0 &&
        (await page.getByTestId("appointments-calendar").count()) > 0 &&
        (await page.getByTestId("appointments-slot").count()) > 0,
    );
    await page.getByTestId("appointments-slot").first().evaluate((el) => {
      /** @type {HTMLElement} */ (el).click();
    });
    await page.getByTestId("appointments-confirm-btn").evaluate((el) => {
      /** @type {HTMLElement} */ (el).click();
    });
    await page.waitForTimeout(200);
    const apptToast = ((await page.getByTestId("appointments-toast").count()) > 0
      ? await page.getByTestId("appointments-toast").innerText()
      : "");
    check(
      "appointments toast has no PHI",
      /visit was booked/i.test(apptToast) && !/lab|diagnosis|prescription/i.test(apptToast),
      apptToast.slice(0, 80),
    );
    check(
      "appointments upcoming after book",
      (await page.getByTestId("appointments-upcoming-item").count()) > 0 &&
        /Care team/i.test(await page.getByTestId("appointments-upcoming-item").first().innerText()),
    );
    await page.getByTestId("appointments-video-cta").first().evaluate((el) => {
      /** @type {HTMLElement} */ (el).click();
    });
    await page.waitForTimeout(150);
    const videoToast = ((await page.getByTestId("appointments-toast").count()) > 0
      ? await page.getByTestId("appointments-toast").innerText()
      : "");
    check(
      "appointments video pending toast",
      /integration is pending/i.test(videoToast),
      videoToast.slice(0, 80),
    );

    // Support messaging shell (localStorage demo; safe toasts; no PHI in previews).
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/account/messages?previewShell=1`, { waitUntil: "networkidle" });
    const msgRoot = page.getByTestId("account-messages");
    check(
      "account messages shell preview",
      (await msgRoot.count()) > 0 &&
        (await page.getByTestId("messages-thread-list").count()) > 0 &&
        /localStorage|non-durable|Not clinical messaging/i.test(await page.locator("body").innerText()),
    );
    await page.getByTestId("messages-compose-open").evaluate((el) => {
      /** @type {HTMLElement} */ (el).click();
    });
    await page.getByTestId("messages-subject").fill("Billing question");
    await page.getByTestId("messages-body").fill("Can you clarify my invoice total?");
    await page.getByTestId("messages-send").evaluate((el) => {
      /** @type {HTMLElement} */ (el).click();
    });
    await page.waitForTimeout(200);
    const toastText = ((await page.getByTestId("messages-toast").count()) > 0
      ? await page.getByTestId("messages-toast").innerText()
      : "");
    check(
      "messages toast has no PHI body",
      /message was sent to support/i.test(toastText) &&
        !/invoice total|clarify my/i.test(toastText),
      toastText.slice(0, 80),
    );
    check(
      "messages thread created",
      (await page.getByTestId("messages-timeline").count()) > 0,
    );
    await page.setViewportSize({ width: 390, height: 844 });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/sign-in`, { waitUntil: "networkidle" });
    await shot(page, "clerk-auth-signin-locked-desktop.png");
    await page.goto(`${BASE}/account`, { waitUntil: "networkidle" });
    await shot(page, "clerk-auth-account-locked-desktop.png");
    await page.setViewportSize({ width: 390, height: 844 });

    // Quiz engine: consent → steps → branching → review → submit
    await page.goto(`${BASE}/quiz/weight-loss`, { waitUntil: "networkidle" });
    check(
      "quiz storage note",
      (await page.getByTestId("quiz-storage-note").count()) > 0 &&
        /Non-PHI demo storage/i.test(await page.getByTestId("quiz-storage-note").innerText()),
    );
    const consentGate = page.getByTestId("quiz-consent-gate");
    if ((await consentGate.count()) > 0) {
      await page.getByRole("checkbox").check();
      await page.getByTestId("quiz-consent-accept").click();
    }
    if ((await page.getByTestId("quiz-start").count()) > 0) {
      await page.getByTestId("quiz-start").click();
    } else if ((await page.getByTestId("quiz-start-fresh").count()) > 0) {
      await page.getByTestId("quiz-start-fresh").click();
    }
    check("quiz shell", (await page.getByTestId("quiz-shell").count()) > 0);
    await shot(page, "quiz-engine-weight-step.png");

    async function answerNumber(value) {
      await page.locator(".quiz-number-field input").fill(String(value));
      await page.getByTestId("quiz-next").click();
    }
    async function answerChoice(label) {
      await page.getByRole("button", { name: label, exact: true }).click();
      await page.getByTestId("quiz-next").click();
    }

    await answerNumber(70);
    await answerNumber(210);
    await answerNumber(180);
    await answerChoice("Type 2 diabetes");
    // Branching: optional conditions_notes appears
    check(
      "quiz branch note step",
      /clinician story|optional/i.test(await page.locator(".quiz-shell h2").innerText()),
    );
    await page.getByTestId("quiz-next").click(); // optional text can be empty
    await answerChoice("Yes, currently");
    check(
      "quiz prior notes branch",
      /prior medication/i.test(await page.locator(".quiz-shell h2").innerText()),
    );
    await page.getByTestId("quiz-next").click();
    check("quiz review", (await page.getByTestId("quiz-review").count()) > 0);
    await shot(page, "quiz-engine-review.png");
    await page.getByTestId("quiz-review-ack").check();
    await page.getByTestId("quiz-review-submit").click();
    await page.waitForURL(/\/visit/);
    check("quiz → visit", /\/visit/.test(page.url()));
    await shot(page, "quiz-engine-visit-handoff.png");

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
    check(
      "visit no auto-eligibility",
      /admin workflow status|does not decide eligibility/i.test(await page.locator(".visit-done").innerText()),
    );
    await shot(page, "health-seo-mobile-visit-done.png");
    await shot(page, "quiz-engine-visit-done.png");

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

    // Membership sandbox: plans compare → billing profile → confirmation (no payment).
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/membership`, { waitUntil: "networkidle" });
    const membershipBody = await page.locator("body").innerText();
    check(
      "membership plans sandbox",
      (await page.getByTestId("membership-plans").count()) > 0 &&
        (await page.getByTestId("membership-compare-table").count()) > 0 &&
        /Pricing pending verification/i.test(membershipBody) &&
        /Sandbox/i.test(membershipBody) &&
        !/\$\d/.test(membershipBody),
      membershipBody.replace(/\s+/g, " ").slice(0, 120),
    );
    check(
      "membership fees separate from medication",
      /separate from medication|medication costs/i.test(membershipBody),
    );
    await shot(page, "membership-sandbox-plans-mobile.png");

    const planCta = page.getByTestId("membership-checkout-care-plus-monthly");
    check(
      "membership plan CTA href",
      (await planCta.count()) > 0 &&
        /\/membership\/checkout\?.*plan=care-plus.*cadence=monthly/.test(
          (await planCta.getAttribute("href")) || "",
        ),
    );

    await page.goto(`${BASE}/membership/checkout?plan=care-plus&cadence=monthly`, {
      waitUntil: "networkidle",
    });
    check("sandbox checkout form", (await page.getByTestId("sandbox-billing-form").count()) > 0);
    await shot(page, "membership-sandbox-checkout-mobile.png");
    await page.getByTestId("sandbox-full-name").fill("Alex Sandbox");
    await page.getByTestId("sandbox-email").fill("alex.sandbox@example.local");
    await page.getByTestId("sandbox-address").fill("100 Demo Street");
    await page.getByTestId("sandbox-city").fill("Austin");
    await page.getByTestId("sandbox-region").fill("TX");
    await page.getByTestId("sandbox-postal").fill("78701");
    await page.getByTestId("sandbox-ack").check();
    await page.getByTestId("sandbox-submit").click();
    await page.getByTestId("sandbox-confirmation").waitFor({ state: "visible", timeout: 5000 });
    const confirm = page.getByTestId("sandbox-confirmation");
    check(
      "sandbox confirmation no payment",
      (await confirm.count()) > 0 &&
        /Sandbox \/ simulated — no payment processed/i.test(await confirm.innerText()),
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(page, "membership-sandbox-confirm-mobile.png");

    await page.goto(`${BASE}/account/membership?previewShell=1`, { waitUntil: "networkidle" });
    check(
      "account membership demo records",
      (await page.getByTestId("account-membership-demo-records").count()) > 0 &&
        (await page.getByTestId("account-membership-demo-item").count()) > 0 &&
        /no payment processed/i.test(await page.locator("body").innerText()),
    );
    await shot(page, "membership-sandbox-account-mobile.png");

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/membership`, { waitUntil: "networkidle" });
    await shot(page, "membership-sandbox-plans-desktop.png");
    await page.goto(`${BASE}/membership/checkout?plan=care-plus&cadence=quarterly`, {
      waitUntil: "networkidle",
    });
    await shot(page, "membership-sandbox-checkout-desktop.png");
    await page.goto(`${BASE}/account/membership?previewShell=1`, { waitUntil: "networkidle" });
    await shot(page, "membership-sandbox-account-desktop.png");
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
