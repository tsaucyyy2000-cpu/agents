import { Link, useParams } from "react-router-dom";
import { IsiBlock } from "../components/IsiBlock";
import { PriceTag } from "../components/PriceTag";
import { Subnav } from "../components/Subnav";
import { useContent } from "../data/ContentContext";
import { isiSlugForProduct } from "../data/isi";
import { PENDING_PRICE } from "../utils/formatPrice";
import { quizPath, visitPath } from "../utils/careRoutes";
import "./Flows.css";
import "./ProductDetail.css";

const subnavItems = [
  { id: "overview", label: "Overview" },
  { id: "how", label: "How it works" },
  { id: "safety", label: "Safety" },
  { id: "faq", label: "FAQ" },
  { id: "isi", label: "ISI" },
];

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
  const isiSlug = isiSlugForProduct(product.id, product.category);
  const faqs = content.faqs.filter(
    (faq) => faq.area === product.category || faq.area === "general",
  );

  return (
    <div className="flow-page product-detail-page">
      <section className="section" id="overview">
        <div className="container product-detail-grid">
          {image ? <img src={image.src} alt={image.alt} /> : <div />}
          <div>
            {product.tag ? <span className="chip">{product.tag}</span> : null}
            <h1 style={{ margin: "0.75rem 0" }}>{product.name}</h1>
            <p className="lede">{product.description ?? product.meta}</p>
            <PriceTag price={PENDING_PRICE} />
            <div className="cta-row" style={{ marginTop: "1.25rem" }}>
              <Link to={quizPath(product.category)} className="btn btn-primary">
                Start demo quiz
              </Link>
              <Link to={visitPath(product.category, product.id)} className="btn btn-secondary">
                Skip to visit
              </Link>
              <Link to={`/checkout?product=${encodeURIComponent(product.id)}`} className="btn btn-secondary">
                Plan review
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <Subnav items={subnavItems} />
      </div>

      <section className="section-tight" id="how">
        <div className="container">
          <h2>How this demo path works</h2>
          <ol className="product-how-list">
            <li>Optional short quiz for this care area (versioned demo consent).</li>
            <li>Shared visit intake with Back / Edit on every step.</li>
            <li>Optional coverage check and local plan review — no payments.</li>
          </ol>
          <Link to="/how-it-works" className="text-link">
            Full how-it-works explainer
          </Link>
        </div>
      </section>

      <section className="section-tight" id="safety">
        <div className="container">
          <h2>Safety note</h2>
          <p className="lede">
            Demo only. Not medical advice. A real program requires a licensed clinician for every
            patient.
          </p>
          <Link to="/safety" className="text-link">
            Open safety hub
          </Link>
        </div>
      </section>

      <section className="section-tight" id="faq">
        <div className="container">
          <h2>FAQ</h2>
          <div className="faq-list">
            {faqs.length === 0 ? (
              <details open>
                <summary>Are prices shown here?</summary>
                <p>No verified dollar amounts — PriceTag shows “—” until figures are supplied.</p>
              </details>
            ) : (
              faqs.slice(0, 4).map((faq) => (
                <details key={faq.id}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section" id="isi">
        <div className="container">
          {isiSlug ? (
            <IsiBlock slug={isiSlug} />
          ) : (
            <div className="isi-block">
              <h3>No drug-specific ISI for this aisle</h3>
              <p>
                Sexual-health and skin demo cards do not reuse GLP-1 or minoxidil stubs. Use the
                general safety hub until reviewed content exists.
              </p>
              <Link to="/safety" className="text-link">
                Open safety hub
              </Link>
            </div>
          )}
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
