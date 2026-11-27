import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { JourneyRail } from "../components/JourneyRail";
import { StickyMobileCta } from "../components/StickyMobileCta";
import { useContent } from "../data/ContentContext";
import {
  customerExperts,
  customerMoreCare,
  customerTestimonials,
  customerVanityStats,
} from "../data/orphanContentGate";
import { quizPath } from "../utils/careRoutes";
import "./Flows.css";
import "./Home.css";

export function Home() {
  // customerContent strips unpublished orphans; selectors double-check the gate.
  const { customerContent: content, mediaById } = useContent();
  const { t } = useTranslation("common");
  const [goalIndex, setGoalIndex] = useState(0);
  const heroImage = mediaById["hero-home"];
  const publishedTestimonials = customerTestimonials(content);
  const publishedExperts = customerExperts(content);
  const publishedMoreCare = customerMoreCare(content);
  const vanityStats = customerVanityStats(content);

  useEffect(() => {
    if (content.heroGoals.length === 0) return;
    const id = window.setInterval(() => {
      setGoalIndex((current) => (current + 1) % content.heroGoals.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [content.heroGoals.length]);

  const activeProducts = content.products.filter((product) => product.active).slice(0, 3);

  const careFinder = useMemo(
    () =>
      content.categories.map((category) => ({
        ...category,
        image: mediaById[category.heroImageId],
      })),
    [content.categories, mediaById],
  );

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <JourneyRail
              steps={[
                { label: "Home", current: true },
                { label: "Care", to: "/#find-care" },
                { label: "Quiz", to: "/#find-care" },
                { label: "Visit", to: "/visit" },
              ]}
            />
            <p className="eyebrow">Online care paths</p>
            <h1>
              <span className="hero-brand">{content.settings.brandName}</span>
              <span className="hero-line">{content.settings.tagline}</span>
            </h1>
            <p className="hero-rotator" aria-live="polite">
              <span className="gradient-text">
                {content.heroGoals[goalIndex] ?? "Personalized care paths"}
              </span>
            </p>
            <p className="hero-support">{content.homeSupport}</p>
            <div className="hero-actions">
              <Link to="/#find-care" className="btn btn-primary">
                Choose a care area
              </Link>
              <Link to="/how-it-works" className="btn btn-secondary">
                How care works
              </Link>
            </div>
            <p className="hero-fine">
              Quiz → visit → optional coverage → plan review.{" "}
              <Link to="/help" className="text-link">
                Help center
              </Link>{" "}
              maps every route.
            </p>
          </div>
          <div className="hero-visual">
            <div className="hero-panel">
              {heroImage ? (
                <img className="hero-image" src={heroImage.src} alt={heroImage.alt} />
              ) : null}
              <p className="hero-media-note">Local media · not affiliated with Ro</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section categories" id="find-care">
        <div className="container">
          <p className="section-kicker">Step 1 · Care</p>
          <div className="section-head">
            <h2>What do you need help with?</h2>
            <p className="section-dek">
              Pick a care area, start the matching quiz, then continue into the shared visit.
              Costs stay hidden until verified.
            </p>
          </div>
          <div className="care-finder-grid">
            {careFinder.map((item) => {
              const tone =
                item.slug === "weight"
                  ? "mint"
                  : item.slug === "sexual-health"
                    ? "warm"
                    : item.slug === "hair"
                      ? "calm"
                      : "peach";
              return (
                <article key={item.path} className={`care-finder-card tone-${tone}`}>
                  {item.image ? (
                    <img src={item.image.src} alt="" className="category-thumb" />
                  ) : null}
                  <h3>{item.eyebrow}</h3>
                  <p>{item.lede}</p>
                  <p className="cost-pending">Cost reviewed during visit · no public prices yet</p>
                  <div className="cta-row">
                    <Link to={item.path} className="btn btn-secondary">
                      How it works
                    </Link>
                    <Link to={quizPath(item.slug)} className="btn btn-primary">
                      {t("cta.startQuiz")}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-tight product-strip">
        <div className="container">
          <p className="section-kicker">Spotlight</p>
          <div className="section-head inline">
            <h2>Spotlight options</h2>
            <p>Catalog · pricing withheld until verified</p>
          </div>
          <div className="product-rail">
            {activeProducts.map((product) => {
              const image = mediaById[product.imageId];
              return (
                <article key={product.id} className="product-card">
                  {image ? (
                    <img className="product-swatch" src={image.src} alt={image.alt} />
                  ) : (
                    <div className="product-swatch" />
                  )}
                  <h3>{product.name}</h3>
                  <p>{product.meta}</p>
                  <p className="cost-pending">Pricing after eligibility</p>
                  <div className="cta-row">
                    <Link to={`/products/${product.id}`} className="btn btn-secondary">
                      Details
                    </Link>
                    <Link to={quizPath(product.category)} className="btn btn-primary">
                      {t("cta.startQuiz")}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-tight" id="how-care-works">
        <div className="container">
          <p className="section-kicker">Process</p>
          <div className="section-head inline">
            <h2>How care works</h2>
            <Link to="/how-it-works" className="text-link">
              Full funnel explainer
            </Link>
          </div>
          <p className="section-dek home-process-dek">
            Same four beats as the Help hub: quiz, visit, optional coverage check, plan review.
          </p>
          <div className="step-grid">
            {content.howItWorks.map((step, index) => (
              <article key={step.id} className="step-card">
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
          <div className="cta-row home-process-actions">
            <Link to="/how-it-works" className="btn btn-secondary">
              Read how care works
            </Link>
            <Link to="/help" className="btn btn-secondary">
              Open help center
            </Link>
          </div>
        </div>
      </section>

      <section className="section convenience">
        <div className="container convenience-grid">
          <div>
            <p className="section-kicker section-kicker-on-dark">Convenience</p>
            <h2>100% online care flow</h2>
            <p>Convenience beats for layout review. Not a live care promise.</p>
            {vanityStats ? (
              <p className="vanity-stats" data-testid="vanity-stats">
                {vanityStats.memberCountLabel ? (
                  <span>{vanityStats.memberCountLabel} members (approved)</span>
                ) : null}
                {vanityStats.memberCountLabel && vanityStats.satisfactionLabel ? " · " : null}
                {vanityStats.satisfactionLabel ? (
                  <span>{vanityStats.satisfactionLabel} satisfaction (approved)</span>
                ) : null}
              </p>
            ) : null}
          </div>
          <ul>
            {content.convenience.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {publishedTestimonials.length > 0 ? (
        <section className="section-tight" data-testid="home-testimonials">
          <div className="container">
            <p className="section-kicker">Stories</p>
            <h2>Member stories</h2>
            <div className="quote-rail">
              {publishedTestimonials.map((item) => (
                <blockquote key={item.id}>
                  <p>{item.quote}</p>
                  <footer>{item.name}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {publishedExperts.length > 0 ? (
        <section className="section experts" data-testid="home-experts">
          <div className="container experts-grid">
            <div>
              <p className="section-kicker">Clinicians</p>
              <h2>Care team</h2>
              <p>Approved clinician bios only — no invented credentials.</p>
            </div>
            <div className="expert-cards">
              {publishedExperts.map((expert) => {
                const image = mediaById[expert.imageId];
                return (
                  <article key={expert.id} className="expert-card">
                    {image ? <img src={image.src} alt={image.alt} /> : null}
                    <h3>{expert.name}</h3>
                    <p>{expert.role}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {publishedMoreCare.length > 0 ? (
        <section className="section-tight" data-testid="home-more-care">
          <div className="container">
            <p className="section-kicker">More care</p>
            <h2>Explore more</h2>
            <div className="care-finder-grid">
              {publishedMoreCare.map((item) => {
                const image = mediaById[item.imageId];
                return (
                  <article key={item.id} className="care-finder-card">
                    {image ? <img src={image.src} alt="" className="category-thumb" /> : null}
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                    <Link to={item.to} className="btn btn-secondary">
                      Learn more
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-tight guides">
        <div className="container">
          <p className="section-kicker">Guides</p>
          <div className="section-head inline">
            <h2>Health guides</h2>
            <Link to="/guides" className="text-link">
              View all
            </Link>
          </div>
          <div className="guide-grid">
            {content.guides.map((guide) => {
              const image = mediaById[guide.imageId];
              return (
                <Link key={guide.id} to={`/guides/${guide.id}`} className="guide-card-link">
                  {image ? (
                    <img className="guide-thumb" src={image.src} alt={image.alt} />
                  ) : (
                    <div className="guide-thumb" />
                  )}
                  <h3>{guide.title}</h3>
                  <p>{guide.read} read</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <p className="section-kicker">FAQ</p>
          <h2>FAQs</h2>
          <div className="faq-list">
            {content.faqs
              .filter((faq) => faq.area === "general")
              .map((faq) => (
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
          <h2>Important safety note</h2>
          <div className="isi-block">
            <h3>Placeholder disclosure</h3>
            <p>
              This marketing recreation does not diagnose, treat, or prescribe. Replace with your
              own counsel-reviewed medication safety language before any real launch.
            </p>
            <ul>
              <li>Not everyone qualifies for treatment in a live program.</li>
              <li>Talk to a licensed clinician about risks, interactions, and pregnancy plans.</li>
            </ul>
            <Link to="/safety" className="text-link">
              Open safety page
            </Link>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-band-inner">
          <p className="section-kicker section-kicker-on-dark">Step 2 · Quiz</p>
          <h2>Ready to get started?</h2>
          <p>Pick a care area quiz, then continue into the shared visit funnel.</p>
          <div className="hero-actions">
            <Link to="/#find-care" className="btn btn-on-dark">
              Choose care · start quiz
            </Link>
            <Link to="/visit" className="btn btn-secondary">
              Skip to visit
            </Link>
          </div>
        </div>
      </section>

      <StickyMobileCta
        to="/#find-care"
        label="Choose care · start quiz"
        fine="Quiz paths: weight-loss, hair, sexual-health, skin · sample data only"
      />
    </div>
  );
}
