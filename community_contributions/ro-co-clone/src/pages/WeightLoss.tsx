import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Category.css";

const meds = [
  { name: "Weekly injectable A", tag: "In stock", note: "Insurance or cash-pay" },
  { name: "Weekly injectable B", tag: "New", note: "Cash-pay pathway" },
  { name: "Daily oral option", tag: "New", note: "Cash-pay only" },
  { name: "Pen alternative", tag: "Available", note: "Provider-guided choice" },
];

const steps = [
  "Answer a short online health questionnaire.",
  "A clinician reviews eligibility and may prescribe.",
  "Insurance or cash-pay pathways are explained clearly.",
  "Medication ships or is routed to a pharmacy.",
  "Ongoing messaging and check-ins keep you supported.",
];

export function WeightLoss() {
  const [weight, setWeight] = useState(220);
  const projected = useMemo(() => Math.round(weight * 0.15), [weight]);

  return (
    <div className="category-page">
      <section className="cat-hero tone-weight">
        <div className="container cat-hero-grid">
          <div>
            <p className="eyebrow">Weight care</p>
            <h1>Online access to GLP-1 style weight programs</h1>
            <p className="lede">
              Recreated merchandising layout: eligibility CTA, projection widget,
              medication suite, timeline, and FAQ—using original placeholder copy.
            </p>
            <div className="hero-actions">
              <Link to="/visit" className="btn btn-primary">
                See if you qualify
              </Link>
              <a href="#meds" className="btn btn-secondary">
                Browse options
              </a>
            </div>
          </div>
          <aside className="weight-widget">
            <label htmlFor="weight">Current weight (lbs)</label>
            <input
              id="weight"
              type="range"
              min={140}
              max={360}
              value={weight}
              onChange={(event) => setWeight(Number(event.target.value))}
            />
            <div className="weight-readout">
              <div>
                <strong>{weight}</strong>
                <span>starting</span>
              </div>
              <div>
                <strong>{projected}</strong>
                <span>illustrative loss*</span>
              </div>
            </div>
            <p className="disclaimer">
              *Demo calculator only. Not clinical guidance. Live site cites
              manufacturer trial ranges.
            </p>
          </aside>
        </div>
      </section>

      <section className="section" id="meds">
        <div className="container">
          <div className="section-head">
            <h2>A full suite of weight medications</h2>
            <p>Card grid mirroring the live product mosaic.</p>
          </div>
          <div className="med-grid">
            {meds.map((med) => (
              <article key={med.name}>
                <span className="chip">{med.tag}</span>
                <h3>{med.name}</h3>
                <p>{med.note}</p>
                <Link to="/visit" className="text-link">
                  Start visit
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight timeline">
        <div className="container">
          <h2>Start in five simple steps</h2>
          <ol>
            {steps.map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section membership">
        <div className="container membership-grid">
          <div>
            <h2>What’s in the membership (demo)</h2>
            <ul>
              <li>Access to clinician-prescribed options when appropriate</li>
              <li>Insurance concierge style support narrative</li>
              <li>Unlimited messaging metaphor</li>
              <li>Progress tracking placeholders</li>
            </ul>
          </div>
          <div className="price-card">
            <p className="eyebrow">Membership</p>
            <p className="price">
              <strong>$39</strong> first month demo
            </p>
            <p>Then from $74–$149/mo depending on plan (placeholder).</p>
            <Link to="/visit" className="btn btn-primary">
              Begin online visit
            </Link>
          </div>
        </div>
      </section>

      <section className="section-tight faq">
        <div className="container">
          <h2>Weight loss FAQs</h2>
          <details open>
            <summary>How much does membership cost?</summary>
            <p>
              Demo figures only. Live pricing varies by plan and medication path.
            </p>
          </details>
          <details>
            <summary>What medications might be offered?</summary>
            <p>
              Clinicians choose based on history, goals, and coverage. This clone
              does not list branded marketing claims verbatim.
            </p>
          </details>
          <details>
            <summary>How do I get started?</summary>
            <p>
              Complete the mock visit flow to experience the interaction pattern.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
