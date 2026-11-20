import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import type { CareArea } from "../data/types";
import { careAreaFromParam, goalLabelForArea } from "../utils/careRoutes";
import "./Visit.css";
import "./Flows.css";

const goals = ["Weight", "Sexual health", "Hair", "Skin"] as const;
type Goal = (typeof goals)[number];

function categoryForGoal(goal: Goal): CareArea {
  if (goal === "Weight") return "weight";
  if (goal === "Sexual health") return "sexual-health";
  if (goal === "Hair") return "hair";
  return "skin";
}

function goalFromArea(area: CareArea): Goal {
  return goalLabelForArea(area) as Goal;
}

export function Visit() {
  const { content, mediaById, addLead } = useContent();
  const [params] = useSearchParams();
  const initialArea = careAreaFromParam(params.get("goal"));
  const initialProduct = params.get("product") ?? "";
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal>(initialArea ? goalFromArea(initialArea) : "Weight");
  const [state, setState] = useState("");
  const [productId, setProductId] = useState(initialProduct);
  const [demoAck, setDemoAck] = useState(false);
  const [coverageReminder, setCoverageReminder] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const hero = mediaById["visit-hero"];

  const goalCategory = categoryForGoal(goal);
  const goalProducts = useMemo(
    () => content.products.filter((product) => product.active && product.category === goalCategory),
    [content.products, goalCategory],
  );

  useEffect(() => {
    if (productId && goalProducts.some((product) => product.id === productId)) return;
    const first = goalProducts[0];
    if (first) setProductId(first.id);
  }, [goalProducts, productId]);

  function selectGoal(next: Goal) {
    setGoal(next);
    setError("");
    const nextCategory = categoryForGoal(next);
    const first = content.products.find(
      (product) => product.active && product.category === nextCategory,
    );
    if (first) setProductId(first.id);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (step === 1 && !state) {
      setError("Select a state to continue.");
      return;
    }
    if (step === 2 && !productId) {
      setError("Choose a starting option to continue.");
      return;
    }
    if (step === 3 && !demoAck) {
      setError("Confirm you understand this is a non-clinical demo.");
      return;
    }

    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }

    const product = content.products.find((item) => item.id === productId);
    addLead({
      goal,
      state,
      notes: `Visit demo · preferred ${product?.name ?? productId}${
        coverageReminder ? " · coverage reminder" : ""
      }`,
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
              <Link to="/" className="btn btn-secondary">
                Back home
              </Link>
            </div>
          </div>
        ) : (
          <form className="visit-form" onSubmit={onSubmit} noValidate>
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
                      onClick={() => selectGoal(item)}
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
                    aria-invalid={Boolean(error)}
                    onChange={(event) => {
                      setState(event.target.value);
                      setError("");
                    }}
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
                      onClick={() => {
                        setProductId(product.id);
                        setError("");
                      }}
                    >
                      <strong>{product.name}</strong>
                      {product.priceLabel ? (
                        <span className="goal-price">{product.priceLabel}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
                {goalProducts.length === 0 ? (
                  <p className="field-error">No active products for this care area yet.</p>
                ) : null}
              </>
            )}

            {step === 3 && (
              <>
                <h1>Quick health snapshot</h1>
                <p className="lede">Shortened questionnaire cadence before saving the lead.</p>
                <label className="field checkbox">
                  <input
                    type="checkbox"
                    checked={demoAck}
                    onChange={(event) => {
                      setDemoAck(event.target.checked);
                      setError("");
                    }}
                  />
                  <span>I understand this is a non-clinical demo.</span>
                </label>
                <label className="field checkbox">
                  <input
                    type="checkbox"
                    checked={coverageReminder}
                    onChange={(event) => setCoverageReminder(event.target.checked)}
                  />
                  <span>I want a coverage-check reminder.</span>
                </label>
              </>
            )}

            {error ? (
              <p className="field-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="visit-actions">
              {step > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setError("");
                    setStep((current) => current - 1);
                  }}
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
