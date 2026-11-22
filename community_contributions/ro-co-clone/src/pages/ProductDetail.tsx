import { Link, useParams } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import { visitPath } from "../utils/careRoutes";
import "./Flows.css";

export function ProductDetail() {
  const { productId } = useParams();
  const { content, mediaById } = useContent();
  const product = content.products.find((item) => item.id === productId);

  if (!product) {
    return (
      <div className="flow-page section">
        <div className="container">
          <h1>Product not found</h1>
          <Link to="/" className="btn btn-secondary">
            Home
          </Link>
        </div>
      </div>
    );
  }

  const image = mediaById[product.imageId];
  const related = content.products.filter(
    (item) => item.category === product.category && item.id !== product.id && item.active,
  );

  return (
    <div className="flow-page">
      <section className="section">
        <div className="container product-detail-grid">
          {image ? <img src={image.src} alt={image.alt} /> : <div />}
          <div>
            {product.tag ? <span className="chip">{product.tag}</span> : null}
            <h1 style={{ margin: "0.75rem 0" }}>{product.name}</h1>
            <p className="lede">{product.description ?? product.meta}</p>
            <p className="cost-pending">Pricing withheld until verified · reviewed during demo visit</p>
            <div className="cta-row" style={{ marginTop: "1.25rem" }}>
              <Link to={visitPath(product.category, product.id)} className="btn btn-primary">
                Start demo visit
              </Link>
              <Link to={`/checkout?product=${encodeURIComponent(product.id)}`} className="btn btn-secondary">
                Plan review
              </Link>
              <Link to="/how-it-works" className="btn btn-secondary">
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section-tight">
          <div className="container">
            <h2>Related options</h2>
            <div className="more-care-grid" style={{ marginTop: "1rem" }}>
              {related.map((item) => {
                const thumb = mediaById[item.imageId];
                return (
                  <Link key={item.id} to={`/products/${item.id}`} className="more-care-card">
                    {thumb ? <img src={thumb.src} alt={thumb.alt} /> : null}
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.meta}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
