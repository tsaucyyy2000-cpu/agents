import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import "./Flows.css";

export function InsuranceCheck() {
  const { mediaById } = useContent();
  const hero = mediaById["insurance-check"];
  const [carrier, setCarrier] = useState("");
  const [memberId, setMemberId] = useState("");
  const [done, setDone] = useState(false);

  const result = useMemo(() => {
    if (!done) return null;
    const hash = (carrier + memberId).length;
    if (hash % 3 === 0) return "Likely cash-pay pathway (demo)";
    if (hash % 3 === 1) return "Partial coverage metaphor (demo)";
    return "Prior-auth style follow-up (demo)";
  }, [carrier, memberId, done]);

  return (
    <div className="flow-page">
      <section className="flow-hero cool">
        <div className="container flow-hero-grid">
          <div>
            <p className="eyebrow">Coverage check</p>
            <h1>See a demo insurance pathway</h1>
            <p className="lede">
              Local prototype only—no payer APIs. Enter any placeholder values to unlock a
              fake result, then continue to visit/checkout.
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
              <div className="cta-row">
                <Link to="/visit" className="btn btn-primary">
                  Continue to visit
                </Link>
                <Link to="/checkout" className="btn btn-secondary">
                  Jump to plan review
                </Link>
                <button type="button" className="btn btn-secondary" onClick={() => setDone(false)}>
                  Run again
                </button>
              </div>
            </>
          ) : (
            <form
              className="flow-form"
              onSubmit={(event) => {
                event.preventDefault();
                setDone(true);
              }}
            >
              <label>
                Insurance carrier (placeholder)
                <input
                  required
                  value={carrier}
                  onChange={(event) => setCarrier(event.target.value)}
                  placeholder="Demo Health Plan"
                />
              </label>
              <label>
                Member ID (placeholder)
                <input
                  required
                  value={memberId}
                  onChange={(event) => setMemberId(event.target.value)}
                  placeholder="ABC123"
                />
              </label>
              <button className="btn btn-primary" type="submit">
                Run demo check
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
