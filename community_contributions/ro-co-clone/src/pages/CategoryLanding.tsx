import { Link } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import type { CareArea } from "../data/types";
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
              <Link to="/visit" className="btn btn-primary">
                {category.ctaLabel}
              </Link>
              <Link to="/insurance-check" className="btn btn-secondary">
                Coverage check
              </Link>
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
            <h2>Your path on this category</h2>
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

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Treatment formats</h2>
            <p>Product mosaic driven by admin content.</p>
          </div>
          <div className="med-grid">
            {products.map((option) => {
              const image = mediaById[option.imageId];
              return (
                <article key={option.id}>
                  {image ? <img src={image.src} alt="" className="med-thumb" /> : null}
                  {option.tag ? <span className="chip">{option.tag}</span> : null}
                  <h3>{option.name}</h3>
                  <p>{option.meta}</p>
                  <div className="cta-row">
                    <Link to={`/products/${option.id}`} className="text-link">
                      View details
                    </Link>
                    <Link to={`/checkout?product=${option.id}`} className="text-link">
                      Review plan
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
          <h2>FAQs</h2>
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
    </div>
  );
}
