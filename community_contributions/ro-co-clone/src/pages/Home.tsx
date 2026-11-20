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

  const careFinder = useMemo(() => {
    return content.categories.map((category) => {
      const priced = content.products.filter(
        (product) => product.active && product.category === category.slug && product.priceLabel,
      );
      return {
        ...category,
        fromPrice: priced[0]?.priceLabel ?? content.settings.membershipFirstMonth + " first month (demo)",
        image: mediaById[category.heroImageId],
      };
    });
  }, [content.categories, content.products, content.settings.membershipFirstMonth, mediaById]);

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

      <section className="section categories" id="find-care">
        <div className="container">
          <div className="section-head">
            <h2>What do you need help with?</h2>
            <p>
              Pick a care area, skim placeholder cost, then open the service page or start a demo
              visit.
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
                  <p className="product-price">From {item.fromPrice}</p>
                  <div className="cta-row">
                    <Link to={item.path} className="btn btn-secondary">
                      How it works &amp; cost
                    </Link>
                    <Link to={visitPath(item.slug)} className="btn btn-primary">
                      Start visit
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
            <h2>Spotlight treatments</h2>
            <p>Demo catalog with placeholder pricing labels.</p>
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
                  {product.priceLabel ? (
                    <p className="product-price">{product.priceLabel}</p>
                  ) : null}
                  <div className="cta-row">
                    <Link to={`/products/${product.id}`} className="text-link">
                      Details
                    </Link>
                    <Link to={visitPath(product.category, product.id)} className="text-link">
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
              <p className="eyebrow">Member voices (demo quotes)</p>
              <h2>Placeholder social proof for layout review</h2>
            </div>
            <div className="proof-metric">
              <strong>{content.settings.satisfactionLabel}</strong>
              <span>demo satisfaction label — replace before launch</span>
            </div>
          </div>
          <div className="quote-rail">
            {content.testimonials.map((item) => (
              <blockquote key={item.id}>
                <p>“{item.quote}”</p>
                <footer>
                  {item.name} · demo
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="section experts">
        <div className="container experts-grid">
          <div>
            <h2>Care team placeholders</h2>
            <p>
              Layout slots only. Do not treat names/roles as verified credentials until Trey
              supplies approved bios.
            </p>
            <ul className="expert-bullets">
              <li>Replace roles with reviewed provider profiles before launch</li>
              <li>Keep portraits as local placeholders until licensed photos exist</li>
              <li>No clinical claims attached to these cards</li>
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

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>More from this clone</h2>
            <p>Adjacent discovery tiles with local SVG art.</p>
          </div>
          <div className="more-care-grid">
            {content.moreCare.map((item) => {
              const image = mediaById[item.imageId];
              return (
                <Link key={item.id} to={item.to} className="more-care-card">
                  {image ? <img src={image.src} alt={image.alt} /> : null}
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </div>
                </Link>
              );
            })}
            <Link to="/insurance-check" className="more-care-card">
              <img
                src={mediaById["insurance-check"]?.src ?? "/media/insurance-check.svg"}
                alt="Coverage check"
              />
              <div>
                <h3>Coverage check demo</h3>
                <p>Prototype insurance pathway before visit or checkout.</p>
              </div>
            </Link>
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
          <h2>Ready when you are</h2>
          <p>Start a mock online visit, coverage check, or plan review.</p>
          <div className="hero-actions">
            <Link to="/visit" className="btn btn-on-dark">
              Get started
            </Link>
            <Link to="/checkout" className="btn btn-secondary">
              Plan review
            </Link>
            <Link to="/how-it-works" className="btn btn-secondary">
              How it works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
