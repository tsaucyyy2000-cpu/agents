import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import "./Category.css";

const steps = [
  "Answer a short online health questionnaire.",
  "A clinician reviews eligibility and may prescribe.",
  "Insurance or cash-pay pathways are explained clearly.",
  "Medication ships or is routed to a pharmacy.",
  "Ongoing messaging and check-ins keep you supported.",
];

export function WeightLoss() {
  const { content, mediaById } = useContent();
  const category = content.categories.find((item) => item.slug === "weight");
  const products = content.products.filter(
    (product) => product.category === "weight" && product.active,
  );
  const hero = category ? mediaById[category.heroImageId] : undefined;
  const [weight, setWeight] = useState(220);
  const projected = useMemo(() => Math.round(weight * 0.15), [weight]);

  if (!category) return null;

  return (
    <div className="category-page">
      <section className="cat-hero tone-weight">
        <div className="container cat-hero-grid">
          <div>
            <p className="eyebrow">{category.eyebrow}</p>
            <h1>{category.title}</h1>
            <p className="lede">{category.lede}</p>
            <div className="hero-actions">
              <Link to="/visit" className="btn btn-primary">
                {category.ctaLabel}
              </Link>
              <a href="#meds" className="btn btn-secondary">
                Browse options
              </a>
            </div>
          </div>
          <aside className="weight-widget">
            {hero ? <img className="cat-hero-img" src={hero.src} alt={hero.alt} /> : null}
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
              *Demo calculator only. Not clinical guidance.
            </p>
          </aside>
        </div>
      </section>

      <section className="section" id="meds">
        <div className="container">
          <div className="section-head">
            <h2>A full suite of weight medications</h2>
            <p>Managed in Admin → Products.</p>
          </div>
          <div className="med-grid">
            {products.map((med) => {
              const image = mediaById[med.imageId];
              return (
                <article key={med.id}>
                  {image ? <img src={image.src} alt="" className="med-thumb" /> : null}
                  {med.tag ? <span className="chip">{med.tag}</span> : null}
                  <h3>{med.name}</h3>
                  <p>{med.meta}</p>
                  <Link to="/visit" className="text-link">
                    Start visit
                  </Link>
                </article>
              );
            })}
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
              {category.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
              <li>Progress tracking placeholders</li>
            </ul>
          </div>
          <div className="price-card">
            <p className="eyebrow">Membership</p>
            <p className="price">
              <strong>{content.settings.membershipFirstMonth}</strong> first month demo
            </p>
            <p>Then {content.settings.membershipOngoing} depending on plan (placeholder).</p>
            <Link to="/visit" className="btn btn-primary">
              Begin online visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
