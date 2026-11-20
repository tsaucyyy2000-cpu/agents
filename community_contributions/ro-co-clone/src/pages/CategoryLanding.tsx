import { Link } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import type { CareArea } from "../data/types";
import { visitPath } from "../utils/careRoutes";
import "./Category.css";
import "./Flows.css";

const toneBySlug: Record<CareArea, string> = {
  weight: "tone-weight",
  "sexual-health": "tone-sex",
  hair: "tone-hair",
  skin: "tone-skin",
};

export function CategoryLanding({ slug }: { slug: CareArea }) {
  const { content, mediaById } = useContent();
  const category = content.categories.find((item) => item.slug === slug);
  const products = content.products.filter(
    (product) => product.category === slug && product.active,
  );
  const faqs = content.faqs.filter((faq) => faq.area === slug || faq.area === "general");
  const firstProductId = products[0]?.id;

  if (!category) return null;
  const hero = mediaById[category.heroImageId];

  return (
    <div className="category-page">
      <section className={`cat-hero ${toneBySlug[slug]}`}>
        <div className="container cat-hero-grid">
          <div>
            <p className="eyebrow">{category.eyebrow}</p>
            <h1>{category.title}</h1>
            <p className="lede">{category.lede}</p>
            <div className="cta-row">
              <Link to={visitPath(slug, firstProductId)} className="btn btn-primary">
                {category.ctaLabel}
              </Link>
              <Link to="/insurance-check" className="btn btn-secondary">
                Coverage check
              </Link>
              <a href="#options" className="btn btn-secondary">
                See options
              </a>
            </div>
          </div>
          <div className="feature-panel">
            {hero ? <img className="cat-hero-img" src={hero.src} alt={hero.alt} /> : null}
            <h2>Why people browse this aisle</h2>
            <ul>
              {category.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {category.steps && category.steps.length > 0 ? (
        <section className="section-tight timeline">
          <div className="container">
            <h2>How it works</h2>
            <ol>
              {category.steps.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <section className="section" id="options">
        <div className="container">
          <div className="section-head">
            <h2>Options</h2>
            <p>Demo catalog · verified prices are not published on this preview.</p>
          </div>
          <div className="med-grid">
            {products.length === 0 ? (
              <article className="empty-stub">
                <h3>Formats coming soon</h3>
                <p>This category has no active products yet—start a visit to explore the flow.</p>
                <Link to={visitPath(slug)} className="btn btn-primary">
                  Start demo visit
                </Link>
              </article>
            ) : (
              products.map((option) => {
                const image = mediaById[option.imageId];
                return (
                  <article key={option.id}>
                    {image ? <img src={image.src} alt="" className="med-thumb" /> : null}
                    {option.tag ? <span className="chip">{option.tag}</span> : null}
                    <h3>{option.name}</h3>
                    <p>{option.meta}</p>
                    <p className="cost-pending">Cost reviewed during visit</p>
                    <div className="cta-row">
                      <Link to={`/products/${option.id}`} className="btn btn-secondary">
                        Details
                      </Link>
                      <Link to={visitPath(slug, option.id)} className="btn btn-primary">
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
            <h2>What membership covers (demo)</h2>
            <ul>
              {category.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
          <div className="price-card">
            <p className="eyebrow">Cost</p>
            <p className="price">
              <strong>Not published yet</strong>
            </p>
            <p className="cost-pending">
              Membership pricing stays hidden until Trey supplies verified figures.
            </p>
            <div className="cta-row">
              <Link to={visitPath(slug, firstProductId)} className="btn btn-primary">
                {category.ctaLabel}
              </Link>
              <Link to="/how-it-works" className="btn btn-secondary">
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <h2>FAQs</h2>
          <div className="faq-list">
            {faqs.length === 0 ? (
              <details open>
                <summary>Is this medical advice?</summary>
                <p>No. Demo only—no real prescribing or clinical review happens here.</p>
              </details>
            ) : (
              faqs.map((faq) => (
                <details key={faq.id}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section safety-band">
        <div className="container">
          <h2>Safety note (demo)</h2>
          <p className="lede">
            This page is a structural recreation. It does not provide medical advice, diagnose
            conditions, or prescribe medication. Replace with your own reviewed safety content
            before any real launch.
          </p>
          <Link to="/safety" className="text-link">
            Open safety stub
          </Link>
        </div>
      </section>
    </div>
  );
}
