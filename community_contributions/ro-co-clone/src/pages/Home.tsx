import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import { visitPath } from "../utils/careRoutes";
import "./Flows.css";
import "./Home.css";

export function Home() {
  const { content, mediaById } = useContent();
  const [goalIndex, setGoalIndex] = useState(0);
  const heroImage = mediaById["hero-home"];

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
            <p className="eyebrow">Demo · Online care paths</p>
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
              <Link to="/visit" className="btn btn-secondary">
                Start demo visit
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-panel">
              {heroImage ? (
                <img className="hero-image" src={heroImage.src} alt={heroImage.alt} />
              ) : null}
              <p className="hero-demo-note">Local demo preview · generated media · not affiliated with Ro</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section categories" id="find-care">
        <div className="container">
          <div className="section-head">
            <h2>What do you need help with?</h2>
            <p>Pick a care area, see how the demo works, then start a fictional visit.</p>
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
                    <Link to={visitPath(item.slug)} className="btn btn-primary">
                      Start demo visit
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
          <div className="section-head inline">
            <h2>Spotlight options</h2>
            <p>Demo catalog · pricing withheld until verified</p>
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
                  <p className="cost-pending">Pricing after eligibility (demo)</p>
                  <div className="cta-row">
                    <Link to={`/products/${product.id}`} className="btn btn-secondary">
                      Details
                    </Link>
                    <Link to={visitPath(product.category, product.id)} className="btn btn-primary">
                      Check eligibility
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className="section-head inline">
            <h2>How it works</h2>
            <Link to="/how-it-works" className="text-link">
              Full process
            </Link>
          </div>
          <div className="step-grid">
            {content.howItWorks.map((step, index) => (
              <article key={step.id} className="step-card">
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section convenience">
        <div className="container convenience-grid">
          <div>
            <h2>100% online demo flow</h2>
            <p>Convenience beats for layout review. Not a live care promise.</p>
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

      <section className="section-tight guides">
        <div className="container">
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

      <section className="cta-band">
        <div className="container cta-band-inner">
          <h2>Ready to try the demo?</h2>
          <p>Fictional intake only — change answers anytime before you finish.</p>
          <div className="hero-actions">
            <Link to="/#find-care" className="btn btn-on-dark">
              Choose care
            </Link>
            <Link to="/visit" className="btn btn-secondary">
              Start demo visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
