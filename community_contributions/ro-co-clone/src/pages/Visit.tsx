import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import "./Visit.css";
import "./Flows.css";

const goals = ["Weight", "Sexual health", "Hair", "Skin"] as const;
type Goal = (typeof goals)[number];

export function Visit() {
  const { content, mediaById, addLead } = useContent();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal>("Weight");
  const [state, setState] = useState("");
  const [productId, setProductId] = useState(content.products[0]?.id ?? "");
  const [done, setDone] = useState(false);
  const hero = mediaById["visit-hero"];

  const goalCategory =
    goal === "Weight"
      ? "weight"
      : goal === "Sexual health"
        ? "sexual-health"
        : goal === "Hair"
          ? "hair"
          : "skin";

  const goalProducts = content.products.filter(
    (product) => product.active && product.category === goalCategory,
  );

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }
    const product = content.products.find((item) => item.id === productId);
    addLead({
      goal,
      state,
      notes: `Visit demo · preferred ${product?.name ?? productId}`,
    });
    setDone(true);
  }

  return (
    <div className="visit-page">
      <div className="container visit-shell">
        {hero ? (
          <img
            src={hero.src}
            alt={hero.alt}
            style={{ width: "100%", borderRadius: 16, marginBottom: "1.25rem" }}
          />
        ) : null}
        <div className="visit-progress" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <span key={index} className={index <= step ? "active" : ""} />
          ))}
        </div>

        {done ? (
          <div className="visit-done">
            <h1>Visit draft saved locally</h1>
            <p>
              Goal: <strong>{goal}</strong>
              {state ? ` · State: ${state}` : ""}
            </p>
            <p>Continue into coverage check or plan review when you are ready.</p>
            <div className="hero-actions">
              <Link to={`/checkout?product=${productId}`} className="btn btn-primary">
                Review plan
              </Link>
              <Link to="/insurance-check" className="btn btn-secondary">
                Coverage check
              </Link>
              <Link to="/admin/leads" className="btn btn-secondary">
                View in admin
              </Link>
            </div>
          </div>
        ) : (
          <form className="visit-form" onSubmit={onSubmit}>
            {step === 0 && (
              <>
                <h1>What are you here for?</h1>
                <p className="lede">Pick a care area to personalize the demo flow.</p>
                <div className="goal-grid">
                  {goals.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={goal === item ? "selected" : ""}
                      onClick={() => {
                        setGoal(item);
                        const nextCategory =
                          item === "Weight"
                            ? "weight"
                            : item === "Sexual health"
                              ? "sexual-health"
                              : item === "Hair"
                                ? "hair"
                                : "skin";
                        const first = content.products.find(
                          (product) => product.active && product.category === nextCategory,
                        );
                        if (first) setProductId(first.id);
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h1>Where do you live?</h1>
                <p className="lede">Demo state gate only—stored locally.</p>
                <label className="field">
                  <span>State</span>
                  <select
                    required
                    value={state}
                    onChange={(event) => setState(event.target.value)}
                  >
                    <option value="">Select</option>
                    {["California", "New York", "Texas", "Florida", "Illinois"].map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}

            {step === 2 && (
              <>
                <h1>Prefer a starting option?</h1>
                <p className="lede">Choose a product card to carry into plan review.</p>
                <div className="goal-grid">
                  {goalProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className={productId === product.id ? "selected" : ""}
                      onClick={() => setProductId(product.id)}
                    >
                      {product.name}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h1>Quick health snapshot</h1>
                <p className="lede">Shortened questionnaire cadence before saving the lead.</p>
                <label className="field checkbox">
                  <input type="checkbox" required />
                  <span>I understand this is a non-clinical demo.</span>
                </label>
                <label className="field checkbox">
                  <input type="checkbox" />
                  <span>I want a coverage-check reminder.</span>
                </label>
              </>
            )}

            <div className="visit-actions">
              {step > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep((current) => current - 1)}
                >
                  Back
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                {step === 3 ? "Finish demo visit" : "Continue"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
