import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import "./Flows.css";

export function Checkout() {
  const { content, mediaById, addLead } = useContent();
  const [params] = useSearchParams();
  const productId = params.get("product") ?? content.products.find((p) => p.active)?.id;
  const product = content.products.find((item) => item.id === productId) ?? content.products[0];
  const image = product ? mediaById[product.imageId] : mediaById["checkout-review"];
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [confirmed, setConfirmed] = useState(false);

  const totalLabel = useMemo(() => {
    if (plan === "annual") {
      return product?.priceLabel
        ? `${product.priceLabel} · annual prepay demo`
        : content.settings.membershipOngoing;
    }
    return (
      product?.priceLabel ??
      `${content.settings.membershipFirstMonth} first month · then ${content.settings.membershipOngoing}`
    );
  }, [plan, content.settings, product]);

  if (!product) return null;

  return (
    <div className="flow-page">
      <section className="flow-hero warm">
        <div className="container flow-hero-grid">
          <div>
            <p className="eyebrow">Plan review</p>
            <h1>Confirm a demo membership plan</h1>
            <p className="lede">
              Checkout-ish prototype: choose a cadence, review placeholders, and save a local
              lead. No payments are processed.
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
                Prepay annual
              </button>
            </div>
            <p className="price-line">
              Estimated label: <strong>{totalLabel}</strong>
            </p>
            {confirmed ? (
              <>
                <p className="toast-ok">Demo order saved locally. Nothing was charged.</p>
                <div className="cta-row">
                  <Link to="/visit" className="btn btn-primary">
                    Start another visit
                  </Link>
                  <Link to="/" className="btn btn-secondary">
                    Home
                  </Link>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
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
            )}
          </article>
          <aside className="flow-form-card">
            <h3>Includes (demo)</h3>
            <ul>
              <li>Provider messaging metaphor</li>
              <li>Progress tracking placeholders</li>
              <li>Shipping / pharmacy routing story</li>
              <li>Placeholder pricing (demo labels only)</li>
            </ul>
            <Link to="/insurance-check" className="text-link">
              Run coverage check first
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
