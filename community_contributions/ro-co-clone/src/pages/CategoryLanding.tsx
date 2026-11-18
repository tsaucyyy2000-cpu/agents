import { Link } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import type { CareArea } from "../data/types";
import "./Category.css";

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
            <Link to="/visit" className="btn btn-primary">
              {category.ctaLabel}
            </Link>
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

      {products.length > 0 ? (
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
                    <h3>{option.name}</h3>
                    <p>{option.meta}</p>
                    <Link to="/visit" className="text-link">
                      Check fit
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <section className="section">
          <div className="container three-up">
            {category.bullets.map((bullet) => (
              <article key={bullet} className="plain-card">
                <h3>{bullet}</h3>
                <p>Editable from Admin → Categories.</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
