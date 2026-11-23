import { Link, useParams } from "react-router-dom";
import { IsiBlock } from "../components/IsiBlock";
import { JourneyRail } from "../components/JourneyRail";
import { PriceTag } from "../components/PriceTag";
import { StickyMobileCta } from "../components/StickyMobileCta";
import { Subnav } from "../components/Subnav";
import { useContent } from "../data/ContentContext";
import { isiSlugForProduct } from "../data/isi";
import type { CareArea } from "../data/types";
import { PENDING_PRICE } from "../utils/formatPrice";
import { quizPath, visitPath } from "../utils/careRoutes";
import "./Flows.css";
import "./ProductDetail.css";

const carePath: Record<CareArea, string> = {
  weight: "/weight-loss",
  "sexual-health": "/sexual-health",
  hair: "/hair",
  skin: "/skin",
};

const careLabel: Record<CareArea, string> = {
  weight: "Weight care",
  "sexual-health": "Sexual health",
  hair: "Hair",
  skin: "Skin",
};

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
          <p className="lede">That catalog stub isn’t in this demo — pick a care area instead.</p>
          <div className="cta-row">
            <Link to="/#find-care" className="btn btn-primary">
              Choose care · start quiz
            </Link>
            <Link to="/help" className="btn btn-secondary">
              Help center
            </Link>
          </div>
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
  const quizHref = quizPath(product.category);
  const visitHref = visitPath(product.category, product.id);
  const landingHref = carePath[product.category];
  const aisleLabel = careLabel[product.category];

  return (
    <div className="flow-page product-detail-page">
      <section className="section" id="overview">
        <div className="container product-detail-grid">
          {image ? <img src={image.src} alt={image.alt} /> : <div />}
          <div>
            <JourneyRail
              steps={[
                { label: "Care", to: landingHref, done: true },
                { label: "Product", current: true },
                { label: "Quiz", to: quizHref },
                { label: "Visit", to: visitHref },
              ]}
            />
            <p className="eyebrow">Demo · {aisleLabel} · Catalog stub</p>
            {product.tag ? <span className="chip">{product.tag}</span> : null}
            <h1 className="product-detail-title">{product.name}</h1>
            <p className="lede">{product.description ?? product.meta}</p>
            <PriceTag price={PENDING_PRICE} />
            <p className="cost-pending">
              Pricing withheld until verified — PriceTag stays pending on this preview.
            </p>
            <div className="cta-row product-detail-actions">
              <Link to={quizHref} className="btn btn-primary">
                Start related demo quiz
              </Link>
              <Link to={visitHref} className="btn btn-secondary">
                Skip to visit
              </Link>
              <Link to={landingHref} className="btn btn-secondary">
                Open {aisleLabel} landing
              </Link>
            </div>
            <p className="care-bridge">
              <Link to="/how-it-works" className="text-link">
                How care works
              </Link>
              <span aria-hidden="true"> · </span>
              <Link to="/help" className="text-link">
                Help center
              </Link>
              <span aria-hidden="true"> · </span>
              <Link to={`/checkout?product=${encodeURIComponent(product.id)}`} className="text-link">
                Plan review
              </Link>
            </p>
          </div>
        </div>
      </section>

      <div className="container">
        <Subnav items={subnavItems} />
      </div>

      <section className="section-tight" id="how">
        <div className="container">
          <p className="section-kicker">Process · Demo</p>
          <h2>How this demo path works</h2>
          <ol className="product-how-list">
            <li>Optional short quiz for this care area (versioned demo consent).</li>
            <li>Shared visit intake with Back / Edit on every step.</li>
            <li>Optional coverage check and local plan review — no payments.</li>
          </ol>
          <p className="care-bridge">
            <Link to="/how-it-works" className="text-link">
              Full how-it-works explainer
            </Link>
            <span aria-hidden="true"> · </span>
            <Link to="/help" className="text-link">
              Help center
            </Link>
            <span aria-hidden="true"> · </span>
            <Link to={landingHref} className="text-link">
              {aisleLabel} landing
            </Link>
          </p>
        </div>
      </section>

      <section className="section-tight" id="safety">
        <div className="container">
          <p className="section-kicker">Safety · Demo</p>
          <h2>Safety note</h2>
          <p className="lede">
            Demo only. Not medical advice. A real program requires a licensed clinician for every
            patient.
          </p>
          <p className="care-bridge">
            <Link to="/safety" className="text-link">
              Open safety hub
            </Link>
            <span aria-hidden="true"> · </span>
            <Link to="/help#safety" className="text-link">
              Help · Safety &amp; education
            </Link>
          </p>
        </div>
      </section>

      <section className="section-tight" id="faq">
        <div className="container">
          <p className="section-kicker">FAQ · Demo</p>
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
          <p className="care-bridge">
            More answers in the{" "}
            <Link to="/help" className="text-link">
              Help center
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="section" id="isi">
        <div className="container">
          <p className="section-kicker">ISI · Demo</p>
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
            <p className="section-kicker">Related · Demo</p>
            <h2>Related options</h2>
            <p className="section-dek">Catalog stubs only — pricing withheld until verified.</p>
            <div className="more-care-grid" style={{ marginTop: "1rem" }}>
              {related.map((item) => {
                const thumb = mediaById[item.imageId];
                return (
                  <Link key={item.id} to={`/products/${item.id}`} className="more-care-card">
                    {thumb ? <img src={thumb.src} alt={thumb.alt} /> : null}
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.meta}</p>
                      <p className="cost-pending">Price pending</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <StickyMobileCta
        to={quizHref}
        label="Start related demo quiz"
        fine={`${aisleLabel} · then visit funnel · Help anytime`}
      />
    </div>
  );
}
