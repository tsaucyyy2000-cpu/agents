import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { JourneyRail } from "../components/JourneyRail";
import { useContent } from "../data/ContentContext";
import { careAreaFromParam, visitPath } from "../utils/careRoutes";
import "./Flows.css";

const carePath: Record<string, string> = {
  weight: "/weight-loss",
  "sexual-health": "/sexual-health",
  hair: "/hair",
  skin: "/skin",
};

export function InsuranceCheck() {
  const { mediaById } = useContent();
  const [params] = useSearchParams();
  const area = careAreaFromParam(params.get("goal"));
  const productId = params.get("product") ?? undefined;
  const hero = mediaById["insurance-check"];
  const [carrier, setCarrier] = useState("");
  const [memberId, setMemberId] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const continueVisit = area
    ? visitPath(area, productId)
    : productId
      ? `/visit?product=${productId}`
      : "/visit";
  const continueCheckout = productId
    ? `/checkout?product=${encodeURIComponent(productId)}`
    : "/checkout";
  const careHref = area ? carePath[area] : "/#find-care";

  const result = useMemo(() => {
    if (!done) return null;
    const hash = (carrier + memberId).length;
    if (hash % 3 === 0) return "Likely cash-pay pathway (demo)";
    if (hash % 3 === 1) return "Partial coverage metaphor (demo)";
    return "Prior-auth style follow-up (demo)";
  }, [carrier, memberId, done]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!carrier.trim() || !memberId.trim()) {
      setError("Enter both carrier and member ID placeholders to run the demo check.");
      return;
    }
    setError("");
    setDone(true);
  }

  return (
    <div className="flow-page">
      <section className="flow-hero cool">
        <div className="container flow-hero-grid">
          <div>
            <JourneyRail
              steps={[
                { label: "Home", to: "/", done: true },
                { label: "Care", to: careHref, done: true },
                { label: "Coverage", current: true },
                { label: "Visit", to: continueVisit },
              ]}
            />
            <p className="eyebrow">Coverage check · demo</p>
            <h1>See a demo insurance pathway</h1>
            <p className="lede">
              Local prototype only—no payer APIs. Enter any placeholder values to unlock a fake
              result, then continue to visit and plan review.
            </p>
          </div>
          {hero ? <img src={hero.src} alt={hero.alt} className="flow-hero-img" /> : null}
        </div>
      </section>

      <section className="section">
        <div className="container flow-form-card">
          {done ? (
            <>
              <h2>Demo result</h2>
              <p className="lede">{result}</p>
              <p className="cost-pending">Not a real eligibility determination.</p>
              <div className="cta-row">
                <Link to={continueVisit} className="btn btn-primary">
                  Continue to visit
                </Link>
                <Link to={continueCheckout} className="btn btn-secondary">
                  Jump to plan review
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setDone(false);
                    setError("");
                  }}
                >
                  Edit answers
                </button>
                <Link to={careHref} className="btn btn-secondary">
                  Back to care
                </Link>
              </div>
            </>
          ) : (
            <form className="flow-form" onSubmit={onSubmit} noValidate>
              <label>
                Insurance carrier (placeholder)
                <input
                  value={carrier}
                  aria-invalid={Boolean(error) && !carrier.trim()}
                  onChange={(event) => {
                    setCarrier(event.target.value);
                    setError("");
                  }}
                  placeholder="Demo Health Plan"
                />
              </label>
              <label>
                Member ID (placeholder)
                <input
                  value={memberId}
                  aria-invalid={Boolean(error) && !memberId.trim()}
                  onChange={(event) => {
                    setMemberId(event.target.value);
                    setError("");
                  }}
                  placeholder="ABC123"
                />
              </label>
              {error ? (
                <p className="field-error" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="cta-row">
                <button className="btn btn-primary" type="submit">
                  Run demo check
                </button>
                <Link to={continueVisit} className="btn btn-secondary">
                  Skip to visit
                </Link>
                <Link to={careHref} className="btn btn-secondary">
                  Back to care
                </Link>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
