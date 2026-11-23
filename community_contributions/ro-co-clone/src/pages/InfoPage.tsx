import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SafetyHubLinks } from "./Isi";
import "./InfoPage.css";
import "./Isi.css";

interface Section {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  callout?: { tone?: "default" | "warn"; text: ReactNode };
}

interface InfoPageProps {
  kicker?: string;
  title: string;
  lede: string;
  updated?: string;
  bullets?: string[];
  sections?: Section[];
  showToc?: boolean;
}

export function InfoPage({
  kicker = "Clone info",
  title,
  lede,
  updated,
  bullets = [],
  sections = [],
  showToc = false,
}: InfoPageProps) {
  const tocItems = sections.map((section) => ({ id: section.id, title: section.title }));

  return (
    <div className="info-page">
      <header className="info-page-head">
        <div className="container info-shell">
          <p className="eyebrow">{kicker}</p>
          <h1>{title}</h1>
          <p className="lede">{lede}</p>
          {updated ? <p className="info-updated">Updated {updated} · demo placeholder</p> : null}
        </div>
      </header>

      <div className={`container ${showToc && sections.length > 0 ? "legal-wrap" : "info-shell"}`}>
        {showToc && tocItems.length > 0 ? (
          <nav className="legal-toc" aria-label="On this page">
            <p>On this page</p>
            <ol>
              {tocItems.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>{item.title}</a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="info-prose">
          {bullets.length > 0 ? (
            <ul>
              {bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}

          {sections.map((section) => (
            <section key={section.id} id={section.id} className="info-section">
              <h2>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets && section.bullets.length > 0 ? (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
              {section.callout ? (
                <div className={`callout ${section.callout.tone === "warn" ? "warn" : ""}`}>
                  <p>{section.callout.text}</p>
                </div>
              ) : null}
            </section>
          ))}

          <div className="hero-actions info-actions">
            <Link to="/" className="btn btn-primary">
              Back home
            </Link>
            <Link to="/visit" className="btn btn-secondary">
              Start demo visit
            </Link>
            <Link to="/privacy-choices" className="btn btn-secondary">
              Privacy choices
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <InfoPage
      kicker="About"
      title="About this clone"
      lede="Local Vite + React recreation of a telehealth marketing top-of-funnel for demo and review. Not affiliated with Ro."
      updated="November 2026"
      showToc
      sections={[
        {
          id: "what",
          title: "What this is",
          bullets: [
            "Original/placeholder marketing copy only — live site text was not scraped verbatim.",
            "Original generated media in /public/media — Ro CDN photography was not downloaded.",
            "Editable demo content lives in browser localStorage (operator tools are not linked from the customer UI).",
          ],
        },
        {
          id: "journey",
          title: "Suggested review path",
          paragraphs: [
            "On mobile, walk Home → Choose a care area → Start demo visit. Use Back and Edit controls on the intake to confirm the full path.",
          ],
          bullets: [
            "Home care finder anchors at /#find-care",
            "Category landings: /weight-loss, /sexual-health, /hair, /skin",
            "Demo intake: /visit with optional ?goal= and ?product=",
          ],
        },
        {
          id: "limits",
          title: "Hard limits for this preview",
          callout: {
            tone: "warn",
            text: "No real clinicians, prescriptions, payments, or insurance submissions. Sample data only.",
          },
        },
      ]}
    />
  );
}

export function SafetyPage() {
  return (
    <div className="info-page">
      <header className="info-page-head">
        <div className="container info-shell">
          <p className="eyebrow">Safety</p>
          <h1>Safety info</h1>
          <p className="lede">
            Placeholder safety hub for navigation review. This demo is not medical advice and does
            not prescribe medication.
          </p>
          <p className="info-updated">Updated November 2026 · demo placeholder</p>
        </div>
      </header>

      <div className="container legal-wrap">
        <nav className="legal-toc" aria-label="On this page">
          <p>On this page</p>
          <ol>
            <li>
              <a href="#demo-only">Demo-only notice</a>
            </li>
            <li>
              <a href="#isi-hub">ISI documents</a>
            </li>
            <li>
              <a href="#mapping">Care-area mapping</a>
            </li>
          </ol>
        </nav>

        <div className="info-prose">
          <section id="demo-only" className="info-section">
            <h2>Demo-only notice</h2>
            <p>
              Live telehealth sites include detailed medication safety disclosures reviewed by
              counsel and clinicians. This clone keeps abbreviated placeholders instead of copying
              those texts.
            </p>
            <div className="callout warn">
              <p>
                Do not use this preview to make care decisions. Replace with your own reviewed
                safety content before any real launch.
              </p>
            </div>
          </section>

          <section id="isi-hub" className="info-section">
            <h2>ISI documents (illustrative)</h2>
            <p>
              Anchored stubs for GLP-1 and minoxidil only. Sexual-health and skin aisles link here
              generally — they do <strong>not</strong> reuse the GLP-1 document.
            </p>
            <SafetyHubLinks />
          </section>

          <section id="mapping" className="info-section">
            <h2>Care-area mapping</h2>
            <ul>
              <li>
                Weight / weekly GLP-1 & oral option → <Link to="/isi/glp1">/isi/glp1</Link>
              </li>
              <li>
                Hair / density kit & topical foam → <Link to="/isi/minoxidil">/isi/minoxidil</Link>
              </li>
              <li>Sexual health & skin → this hub only (no invented drug ISI)</li>
            </ul>
          </section>

          <div className="hero-actions info-actions">
            <Link to="/" className="btn btn-primary">
              Back home
            </Link>
            <Link to="/visit" className="btn btn-secondary">
              Start demo visit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <InfoPage
      kicker="Privacy"
      title="Privacy"
      lede="Demo privacy note: visit leads and content edits stay in your browser localStorage. Nothing is sent to a backend."
      updated="November 2026"
      showToc
      sections={[
        {
          id: "what-we-store",
          title: "What this demo stores",
          bullets: [
            "Site content edits and visit leads in localStorage (key ro-clone-site-content-v2).",
            "Optional demo consent preference (key ro-clone-demo-consent-v1) with CONSENT_VERSION.",
            "Quiz intake consent (key ro-clone-intake-consent-v1) with the same CONSENT_VERSION.",
            "No account system, no server-side patient record, no payment data.",
          ],
        },
        {
          id: "health-data",
          title: "Consumer health data (demo)",
          paragraphs: [
            "Answers you type in the visit flow are fictional sample data for UI review. They are not transmitted and should not include real personal health information.",
          ],
          callout: {
            text: (
              <>
                See{" "}
                <Link to="/consumer-health-privacy">Consumer health data</Link> for the longer
                placeholder policy pattern used on comparison sites.
              </>
            ),
          },
        },
        {
          id: "choices",
          title: "Your choices",
          bullets: [
            "Open Cookie settings from the footer to change the demo preference banner.",
            "Clear site data in your browser to reset content and leads.",
            "Use Your privacy choices for the request-form layout prototype.",
          ],
        },
      ]}
    />
  );
}

export function TermsPage() {
  return (
    <InfoPage
      kicker="Terms"
      title="Terms"
      lede="Demo terms: this is an unofficial recreation for local review. Do not use it for real care decisions."
      updated="November 2026"
      showToc
      sections={[
        {
          id: "use",
          title: "Permitted use",
          paragraphs: [
            "Use this project to evaluate layout, copy structure, and intake UX. It is not a licensed medical practice and is not affiliated with Ro.",
          ],
        },
        {
          id: "no-care",
          title: "No clinical relationship",
          callout: {
            tone: "warn",
            text: "Submitting the demo visit does not create a patient relationship, prescription, or insurance claim.",
          },
        },
        {
          id: "placeholders",
          title: "Placeholder content",
          paragraphs: [
            "Prices, clinician bios, and testimonials are withheld or clearly marked as demo until verified source material is supplied.",
          ],
        },
      ]}
    />
  );
}

export function CookiePolicyPage() {
  return (
    <InfoPage
      kicker="Cookies"
      title="Cookie policy"
      lede="This local preview does not set marketing cookies. Preferences below describe the demo storage model only."
      updated="November 2026"
      showToc
      sections={[
        {
          id: "essential",
          title: "Essential demo storage",
          paragraphs: [
            "localStorage holds editable marketing content and fictional visit leads so the demo survives a refresh.",
          ],
        },
        {
          id: "optional",
          title: "Optional demo analytics",
          paragraphs: [
            "The consent banner includes an optional analytics toggle for layout review. No analytics SDK or pixel is loaded in this repository.",
          ],
        },
        {
          id: "manage",
          title: "How to manage",
          bullets: [
            "Footer → Cookie settings reopens the banner.",
            "Browser site-data controls clear all demo storage.",
          ],
        },
      ]}
    />
  );
}

export function PrivacyChoicesPage() {
  return (
    <InfoPage
      kicker="Privacy choices"
      title="Your privacy choices"
      lede="Prototype of a Do Not Sell / privacy-request layout. This form does not submit anywhere."
      updated="November 2026"
      showToc
      sections={[
        {
          id: "sale",
          title: "Sale or sharing",
          paragraphs: [
            "This demo does not sell or share personal information. The control below mirrors comparison-site patterns for review.",
          ],
          callout: {
            text: "Use Cookie settings in the footer to set the optional demo analytics preference.",
          },
        },
        {
          id: "request",
          title: "Privacy request (non-functional)",
          paragraphs: [
            "A production site would post requests to a ticketing or form service. Here, treat the fields as a layout exercise only.",
          ],
          bullets: [
            "Request types: access, delete, correct, opt out of sale/sharing (placeholder).",
            "Identity verification and response timelines are not implemented.",
          ],
        },
      ]}
    />
  );
}

export function ConsumerHealthPrivacyPage() {
  return (
    <InfoPage
      kicker="Consumer health data"
      title="Consumer health data privacy"
      lede="Placeholder policy pattern for health-adjacent marketing sites. No real consumer health data leaves this browser."
      updated="November 2026"
      showToc
      sections={[
        {
          id: "scope",
          title: "Scope for this demo",
          paragraphs: [
            "Visit answers and care-area selections are stored locally as sample data for UI review. Do not enter real patient information.",
          ],
        },
        {
          id: "sharing",
          title: "Sharing table (placeholder)",
          bullets: [
            "Analytics partners: none loaded.",
            "Advertising partners: none loaded.",
            "Affiliate networks: not used in this clone.",
            "Clinicians / pharmacies: not connected.",
          ],
        },
        {
          id: "rights",
          title: "Rights summary",
          paragraphs: [
            "State consumer-health laws can require additional notices and request channels. Replace this page with counsel-reviewed language before launch.",
          ],
        },
      ]}
    />
  );
}

export function DisclosurePage() {
  return (
    <InfoPage
      kicker="Disclosure"
      title="Demo disclosure"
      lede="This site is a local marketing recreation for design and flow review. It is not Ro and does not offer medical services."
      updated="November 2026"
      showToc
      sections={[
        {
          id: "affiliation",
          title: "Affiliation",
          paragraphs: [
            "Not affiliated with, endorsed by, or connected to Ro or any pharmacy benefit or telehealth brand depicted in third-party materials.",
          ],
        },
        {
          id: "content",
          title: "Content sourcing",
          bullets: [
            "Copy is original or clearly marked placeholder.",
            "Media is generated locally under public/media.",
            "Unverified prices, clinician bios, and testimonials stay out of the customer UI unless marked demo.",
          ],
        },
        {
          id: "ads",
          title: "Advertising note",
          paragraphs: [
            "Comparison-site templates often include an advertising disclosure bar. This clone uses a sticky Demo preview banner instead of affiliate commission language.",
          ],
        },
      ]}
    />
  );
}
