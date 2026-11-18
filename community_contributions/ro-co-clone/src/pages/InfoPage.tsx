import { Link } from "react-router-dom";
import "./InfoPage.css";

interface InfoPageProps {
  title: string;
  lede: string;
  bullets?: string[];
}

export function InfoPage({ title, lede, bullets = [] }: InfoPageProps) {
  return (
    <div className="info-page">
      <div className="container info-shell">
        <p className="eyebrow">Clone info</p>
        <h1>{title}</h1>
        <p className="lede">{lede}</p>
        {bullets.length > 0 ? (
          <ul>
            {bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        ) : null}
        <div className="hero-actions">
          <Link to="/" className="btn btn-primary">
            Back home
          </Link>
          <Link to="/visit" className="btn btn-secondary">
            Start visit
          </Link>
          <Link to="/admin" className="btn btn-secondary">
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <InfoPage
      title="About this clone"
      lede="Local Vite + React recreation of the ro.co marketing top-of-funnel for demo and review. Not affiliated with Ro."
      bullets={[
        "Original/placeholder marketing copy only — live site text was not scraped verbatim.",
        "Original SVG media in /public/media — Ro CDN photography was not downloaded.",
        "Editable content lives in localStorage and Admin → Settings import/export.",
      ]}
    />
  );
}

export function HelpPage() {
  return (
    <InfoPage
      title="Help center"
      lede="Demo help only. Use these paths to review the clone."
      bullets={[
        "Home and care areas: /, /weight-loss, /sexual-health, /hair, /skin",
        "Flows: /how-it-works, /insurance-check, /visit, /checkout",
        "Content: /guides, /products/:id",
        "Admin dashboard: /admin (content, products, media, leads, settings)",
      ]}
    />
  );
}

export function SafetyPage() {
  return (
    <InfoPage
      title="Safety info"
      lede="Placeholder safety page for navigation review. This demo is not medical advice and does not prescribe medication."
      bullets={[
        "Live ro.co includes detailed medication safety disclosures.",
        "This clone keeps abbreviated placeholders instead of copying those texts.",
      ]}
    />
  );
}

export function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy"
      lede="Demo privacy note: visit leads and content edits stay in your browser localStorage. Nothing is sent to a backend."
    />
  );
}

export function TermsPage() {
  return (
    <InfoPage
      title="Terms"
      lede="Demo terms: this is an unofficial recreation for local review. Do not use it for real care decisions."
    />
  );
}
