import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import { visitPath } from "../utils/careRoutes";
import "./Category.css";
import "./Flows.css";

export function WeightLoss() {
  const { content, mediaById } = useContent();
  const category = content.categories.find((item) => item.slug === "weight");
  const products = content.products.filter(
    (product) => product.category === "weight" && product.active,
  );
  const faqs = content.faqs.filter((faq) => faq.area === "weight" || faq.area === "general");
  const hero = category ? mediaById[category.heroImageId] : undefined;
  const [weight, setWeight] = useState(220);
  const projected = useMemo(() => Math.round(weight * 0.15), [weight]);
  const steps =
    category?.steps ??
    [
      "Answer a short online health questionnaire.",
      "A clinician reviews eligibility and may prescribe.",
      "Insurance or cash-pay pathways are explained clearly.",
      "Begin treatment with ongoing check-ins.",
    ];
  const firstProductId = products[0]?.id;

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
              <Link to={visitPath("weight", firstProductId)} className="btn btn-primary">
                {category.ctaLabel}
              </Link>
              <Link to="/insurance-check" className="btn btn-secondary">
                Coverage check
              </Link>
              <a href="#meds" className="btn btn-secondary">
                Browse options &amp; cost
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
            <p className="disclaimer">*Demo calculator only. Not clinical guidance.</p>
          </aside>
        </div>
      </section>

      <section className="section-tight timeline">
        <div className="container">
          <h2>How it works</h2>
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

      <section className="section" id="meds">
        <div className="container">
          <div className="section-head">
            <h2>Options &amp; placeholder cost</h2>
            <p>Demo catalog labels from the local content store—not scraped live prices.</p>
          </div>
          <div className="med-grid">
            {products.length === 0 ? (
              <article className="empty-stub">
                <h3>Options coming soon</h3>
                <p>No active weight products in the demo catalog yet.</p>
                <Link to={visitPath("weight")} className="text-link">
                  Start a visit anyway
                </Link>
              </article>
            ) : (
              products.map((med) => {
                const image = mediaById[med.imageId];
                return (
                  <article key={med.id}>
                    {image ? <img src={image.src} alt="" className="med-thumb" /> : null}
                    {med.tag ? <span className="chip">{med.tag}</span> : null}
                    <h3>{med.name}</h3>
                    <p>{med.meta}</p>
                    {med.priceLabel ? (
                      <p className="product-price">{med.priceLabel}</p>
                    ) : (
                      <p className="disclaimer">Price label missing — set in content store.</p>
                    )}
                    <div className="cta-row">
                      <Link to={`/products/${med.id}`} className="text-link">
                        Details
                      </Link>
                      <Link to={visitPath("weight", med.id)} className="text-link">
                        Start visit
                      </Link>
                      <Link to={`/checkout?product=${med.id}`} className="text-link">
                        Review plan
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>
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
            <div className="cta-row">
              <Link to={visitPath("weight", firstProductId)} className="btn btn-primary">
                Begin online visit
              </Link>
              <Link
                to={firstProductId ? `/checkout?product=${firstProductId}` : "/checkout"}
                className="btn btn-secondary"
              >
                Plan review
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <h2>Weight FAQs</h2>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details key={faq.id}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section safety-band">
        <div className="container">
          <h2>Safety note (demo)</h2>
          <p className="lede">
            Illustrative calculator and catalog only. Not medical advice. Add reviewed safety
            disclosures before any real launch.
          </p>
          <Link to="/safety" className="text-link">
            Open safety stub
          </Link>
        </div>
      </section>
    </div>
  );
}
