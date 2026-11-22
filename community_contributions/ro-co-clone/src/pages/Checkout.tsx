import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { JourneyRail } from "../components/JourneyRail";
import { PriceTag } from "../components/PriceTag";
import { StepIndicator } from "../components/StepIndicator";
import { useContent } from "../data/ContentContext";
import { PENDING_PRICE } from "../utils/formatPrice";
import { quizPath, visitPath } from "../utils/careRoutes";
import "./Flows.css";

const carePath: Record<string, string> = {
  weight: "/weight-loss",
  "sexual-health": "/sexual-health",
  hair: "/hair",
  skin: "/skin",
};

export function Checkout() {
  const { content, mediaById, addLead } = useContent();
  const [params] = useSearchParams();
  const productId = params.get("product") ?? content.products.find((p) => p.active)?.id;
  const product = content.products.find((item) => item.id === productId) ?? content.products[0];
  const image = product ? mediaById[product.imageId] : mediaById["checkout-review"];
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [ack, setAck] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  if (!product) {
    return (
      <div className="flow-page section">
        <div className="container">
          <h1>No products available</h1>
          <p className="lede">Add demo products in the content store before reviewing a plan.</p>
          <Link to="/" className="btn btn-secondary">
            Home
          </Link>
        </div>
      </div>
    );
  }

  const careHref = carePath[product.category] ?? "/#find-care";
  const visitHref = visitPath(product.category, product.id);
  const insuranceHref = `/insurance-check?goal=${encodeURIComponent(product.category)}&product=${encodeURIComponent(product.id)}`;

  return (
    <div className="flow-page">
      <section className="flow-hero warm">
        <div className="container flow-hero-grid">
          <div>
            <JourneyRail
              steps={[
                { label: "Home", to: "/", done: true },
                { label: "Care", to: careHref, done: true },
                { label: "Quiz", to: quizPath(product.category), done: true },
                { label: "Visit", to: visitHref, done: true },
                { label: "Plan", current: true },
              ]}
            />
            <StepIndicator current={2} />
            <p className="eyebrow">Demo plan review</p>
            <h1>{confirmed ? "Demo plan confirmed locally" : "Confirm a sample membership cadence"}</h1>
            <p className="lede">
              Prototype only: choose a cadence and save a local lead. No payments and no verified
              prices are shown.
            </p>
          </div>
          {image ? <img src={image.src} alt={image.alt} className="flow-hero-img" /> : null}
        </div>
      </section>

      <section className="section">
        <div className="container checkout-grid">
          <article className="flow-form-card">
            <h2>{product.name}</h2>
            <p>{product.description ?? product.meta}</p>
            <PriceTag price={PENDING_PRICE} />
            {confirmed ? (
              <>
                <p className="toast-ok" role="status">
                  Demo confirmation saved in this browser. Nothing was charged, shipped, or sent to a
                  clinic.
                </p>
                <dl className="visit-summary" style={{ marginTop: "1rem" }}>
                  <div>
                    <dt>Option</dt>
                    <dd>{product.name}</dd>
                  </div>
                  <div>
                    <dt>Cadence</dt>
                    <dd>
                      {plan}{" "}
                      <button
                        type="button"
                        className="text-link"
                        onClick={() => {
                          setConfirmed(false);
                          setError("");
                        }}
                      >
                        Edit
                      </button>
                    </dd>
                  </div>
                </dl>
                <div className="cta-row">
                  <Link to={visitHref} className="btn btn-primary">
                    Edit visit answers
                  </Link>
                  <Link to={careHref} className="btn btn-secondary">
                    Back to care
                  </Link>
                  <Link to="/" className="btn btn-secondary">
                    Home
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="plan-toggle">
                  <button
                    type="button"
                    className={plan === "monthly" ? "selected" : ""}
                    onClick={() => setPlan("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    className={plan === "annual" ? "selected" : ""}
                    onClick={() => setPlan("annual")}
                  >
                    Annual cadence
                  </button>
                </div>
                <p className="price-line">
                  Selected cadence: <strong>{plan}</strong> (demo)
                </p>
                <label className="field checkbox">
                  <input
                    type="checkbox"
                    checked={ack}
                    onChange={(event) => {
                      setAck(event.target.checked);
                      setError("");
                    }}
                  />
                  <span>I understand this confirms a local demo only—no payment or Rx.</span>
                </label>
                {error ? (
                  <p className="field-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <div className="cta-row">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      if (!ack) {
                        setError("Confirm the demo acknowledgment to continue.");
                        return;
                      }
                      addLead({
                        goal: product.category,
                        state: "N/A",
                        notes: `Checkout demo · ${product.name} · ${plan}`,
                      });
                      setConfirmed(true);
                    }}
                  >
                    Confirm demo plan
                  </button>
                  <Link to={visitHref} className="btn btn-secondary">
                    Back to visit
                  </Link>
                  <Link to={careHref} className="btn btn-secondary">
                    Back to care
                  </Link>
                </div>
              </>
            )}
          </article>
          <aside className="flow-form-card">
            <h3>Includes (demo)</h3>
            <ul>
              <li>Provider messaging metaphor</li>
              <li>Progress tracking placeholders</li>
              <li>Shipping / pharmacy routing story</li>
              <li>No published dollar prices in this preview</li>
            </ul>
            <div className="cta-row" style={{ marginTop: "1rem" }}>
              <Link to={visitHref} className="text-link">
                Edit demo visit
              </Link>
              <Link to={insuranceHref} className="text-link">
                Coverage check
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
