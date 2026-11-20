import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import { visitPath } from "../utils/careRoutes";
import "./Flows.css";

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

  return (
    <div className="flow-page">
      <section className="flow-hero warm">
        <div className="container flow-hero-grid">
          <div>
            <p className="eyebrow">Demo plan review</p>
            <h1>Confirm a sample membership cadence</h1>
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
            <p className="cost-pending">Dollar amounts hidden until verified pricing is supplied.</p>
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
            {confirmed ? (
              <>
                <p className="toast-ok">Demo order saved locally. Nothing was charged.</p>
                <div className="cta-row">
                  <Link to={visitPath(product.category, product.id)} className="btn btn-primary">
                    Start another visit
                  </Link>
                  <Link to="/" className="btn btn-secondary">
                    Home
                  </Link>
                </div>
              </>
            ) : (
              <>
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
            <Link to="/visit" className="text-link">
              Or start a demo visit first
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
