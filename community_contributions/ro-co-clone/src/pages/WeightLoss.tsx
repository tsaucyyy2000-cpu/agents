import { useState } from "react";
import { Link } from "react-router-dom";
import { IsiBlock } from "../components/IsiBlock";
import { JourneyRail } from "../components/JourneyRail";
import { PriceTag } from "../components/PriceTag";
import { StepIndicator } from "../components/StepIndicator";
import { StickyMobileCta } from "../components/StickyMobileCta";
import { useContent } from "../data/ContentContext";
import { PENDING_PRICE } from "../utils/formatPrice";
import { quizPath, visitPath } from "../utils/careRoutes";
import "./Category.css";
import "./Flows.css";
import "./Isi.css";

export function WeightLoss() {
  const { content, mediaById } = useContent();
  const category = content.categories.find((item) => item.slug === "weight");
  const products = content.products.filter(
    (product) => product.category === "weight" && product.active,
  );
  const faqs = content.faqs.filter((faq) => faq.area === "weight" || faq.area === "general");
  const hero = category ? mediaById[category.heroImageId] : undefined;
  const [weight, setWeight] = useState(220);
  const steps =
    category?.steps ??
    [
      "Answer a short online health questionnaire.",
      "A provider reviews eligibility for the demo pathway.",
      "Insurance or cash-pay pathways are explained clearly.",
      "Begin a sample plan metaphor with ongoing check-ins.",
    ];
  const firstProductId = products[0]?.id;
  const visitHref = visitPath("weight", firstProductId);
  const quizHref = quizPath("weight");

  if (!category) return null;

  return (
    <div className="category-page">
      <section className="cat-hero tone-weight">
        <div className="container cat-hero-grid">
          <div>
            <JourneyRail
              steps={[
                { label: "Home", to: "/", done: true },
                { label: "Care", current: true },
                { label: "Quiz", to: quizHref },
                { label: "Visit", to: visitHref },
              ]}
            />
            <StepIndicator current={0} />
            <p className="eyebrow">{category.eyebrow}</p>
            <h1>{category.title}</h1>
            <p className="lede">{category.lede}</p>
            <div className="hero-actions">
              <Link to={quizHref} className="btn btn-primary">
                Start demo quiz
              </Link>
              <Link to={visitHref} className="btn btn-secondary">
                {category.ctaLabel}
              </Link>
              <a href="#meds" className="btn btn-secondary">
                Browse options
              </a>
            </div>
            <p className="cat-fine">Quiz → visit → checkout · Back/Edit stay available</p>
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
                <span>demo starting lbs</span>
              </div>
              <div>
                <strong>—</strong>
                <span>outcomes not projected</span>
              </div>
            </div>
            <p className="disclaimer">
              Layout slider only. No weight-loss predictions or clinical guidance.
            </p>
          </aside>
        </div>
      </section>

      <section className="section-tight timeline">
        <div className="container">
          <p className="section-kicker">Process</p>
          <h2>How it works</h2>
          <p className="section-dek">Short path from interest to a fictional visit in this demo.</p>
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
          <p className="section-kicker">Options</p>
          <div className="section-head">
            <h2>Options</h2>
            <p>Demo catalog · verified prices are not published on this preview.</p>
          </div>
          <div className="med-grid">
            {products.length === 0 ? (
              <article className="empty-stub">
                <h3>Options coming soon</h3>
                <p>No active weight products in the demo catalog yet.</p>
                <Link to={visitPath("weight")} className="btn btn-primary">
                  Start demo visit
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
                    <PriceTag price={PENDING_PRICE} />
                    <div className="cta-row">
                      <Link to={`/products/${med.id}`} className="btn btn-secondary">
                        Details
                      </Link>
                      <Link to={visitPath("weight", med.id)} className="btn btn-primary">
                        Start demo visit
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
            <p className="section-kicker">Membership</p>
            <h2>What’s in the membership (demo)</h2>
            <ul>
              {category.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
              <li>Progress tracking placeholders</li>
            </ul>
          </div>
          <div className="price-card">
            <p className="eyebrow">Cost</p>
            <PriceTag price={{ ...PENDING_PRICE, unit: "membership" }} />
            <div className="cta-row">
              <Link to={quizHref} className="btn btn-primary">
                Start demo quiz
              </Link>
              <Link to="/insurance-check" className="btn btn-secondary">
                Coverage check
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <p className="section-kicker">FAQ</p>
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
          <p className="section-kicker">Safety</p>
          <h2>Safety note (demo)</h2>
          <IsiBlock slug="glp1" />
        </div>
      </section>

      <section className="cta-band cat-cta-band">
        <div className="container cta-band-inner">
          <p className="section-kicker section-kicker-on-dark">Next · Quiz</p>
          <h2>Continue to the demo quiz</h2>
          <p>Then the shared visit funnel. Answers stay in this browser.</p>
          <div className="hero-actions">
            <Link to={quizHref} className="btn btn-on-dark">
              Start demo quiz
            </Link>
            <Link to={visitHref} className="btn btn-secondary">
              Skip to visit
            </Link>
            <Link to="/#find-care" className="btn btn-secondary">
              Other care areas
            </Link>
          </div>
        </div>
      </section>

      <StickyMobileCta
        to={quizHref}
        label="Start demo quiz"
        fine="Then continue into the shared visit funnel"
      />
    </div>
  );
}
