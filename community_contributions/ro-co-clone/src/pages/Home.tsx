import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../data/ContentContext";
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

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Online care, built around goals</p>
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
              <Link to="/visit" className="btn btn-primary">
                Start free visit
              </Link>
              <Link to="/weight-loss" className="btn btn-secondary">
                Explore weight care
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-panel">
              {heroImage ? (
                <img className="hero-image" src={heroImage.src} alt={heroImage.alt} />
              ) : null}
              <div className="hero-stat">
                <strong>{content.settings.memberCountLabel}</strong>
                <span>members (demo marketing claim)</span>
              </div>
              <p>Calm slate · teal energy · goal-first IA</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section categories">
        <div className="container">
          <div className="section-head">
            <h2>Prescription-ready paths for everyday health goals</h2>
            <p>Four primary care areas mirrored from the live top-of-funnel.</p>
          </div>
          <div className="category-grid">
            {content.categories.map((item) => {
              const image = mediaById[item.heroImageId];
              const tone =
                item.slug === "weight"
                  ? "mint"
                  : item.slug === "sexual-health"
                    ? "warm"
                    : item.slug === "hair"
                      ? "calm"
                      : "peach";
              return (
                <Link key={item.path} to={item.path} className={`category-card tone-${tone}`}>
                  {image ? <img src={image.src} alt="" className="category-thumb" /> : null}
                  <h3>{item.eyebrow}</h3>
                  <p>{item.lede}</p>
                  <span className="card-cta">View options</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-tight product-strip">
        <div className="container">
          <div className="section-head inline">
            <h2>Spotlight treatments</h2>
            <p>Editable from Admin → Products.</p>
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
                  <Link to="/visit" className="text-link">
                    Check eligibility
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section convenience">
        <div className="container convenience-grid">
          <div>
            <h2>100% online, built for busy schedules</h2>
            <p>
              Convenience storytelling kept in three beats. Edit copy later via content export/import.
            </p>
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

      <section className="section social-proof">
        <div className="container">
          <div className="proof-banner">
            <div>
              <p className="eyebrow">Member voices</p>
              <h2>People stick with care when support feels close and clear</h2>
            </div>
            <div className="proof-metric">
              <strong>{content.settings.satisfactionLabel}</strong>
              <span>say the experience feels supportive (demo figure)</span>
            </div>
          </div>
          <div className="quote-rail">
            {content.testimonials.map((item) => (
              <blockquote key={item.id}>
                <p>“{item.quote}”</p>
                <footer>{item.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="section experts">
        <div className="container experts-grid">
          <div>
            <h2>Clinical leadership, summarized</h2>
            <p>Named clinician layouts without copying live biographies.</p>
            <ul className="expert-bullets">
              <li>Board-certified specialists across obesity, derm, and more</li>
              <li>Published research informing program design</li>
              <li>Policy and public-health advisors in the mix</li>
            </ul>
          </div>
          <div className="expert-cards">
            {content.experts.map((expert) => {
              const image = mediaById[expert.imageId];
              return (
                <article key={expert.id}>
                  {image ? (
                    <img className="avatar" src={image.src} alt={image.alt} />
                  ) : (
                    <div className="avatar" />
                  )}
                  <h3>{expert.name}</h3>
                  <p>{expert.role}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-tight guides">
        <div className="container">
          <div className="section-head inline">
            <h2>Health guide</h2>
            <p>Editorial tiles mirrored from the content hub pattern.</p>
          </div>
          <div className="guide-grid">
            {content.guides.map((guide) => {
              const image = mediaById[guide.imageId];
              return (
                <article key={guide.id}>
                  {image ? (
                    <img className="guide-thumb" src={image.src} alt={image.alt} />
                  ) : (
                    <div className="guide-thumb" />
                  )}
                  <h3>{guide.title}</h3>
                  <p>{guide.read} read</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-band-inner">
          <h2>Ready when you are</h2>
          <p>Start a mock online visit and manage content from /admin.</p>
          <div className="hero-actions">
            <Link to="/visit" className="btn btn-on-dark">
              Get started
            </Link>
            <Link to="/admin" className="btn btn-secondary">
              Open admin
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
