import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { JourneyRail } from "../components/JourneyRail";
import { StepIndicator } from "../components/StepIndicator";
import { useContent } from "../data/ContentContext";
import type { CareArea } from "../data/types";
import { careAreaFromParam, goalLabelForArea, quizPath } from "../utils/careRoutes";
import "./Visit.css";
import "./Flows.css";

const goals = ["Weight", "Sexual health", "Hair", "Skin"] as const;
type Goal = (typeof goals)[number];

const stepLabels = ["Care area", "Location", "Option", "Confirm"] as const;

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
  const [visitAck, setVisitAck] = useState(false);
  const [coverageReminder, setCoverageReminder] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const hero = mediaById["visit-hero"];

  const goalCategory = categoryForGoal(goal);
  const goalProducts = useMemo(
    () => content.products.filter((product) => product.active && product.category === goalCategory),
    [content.products, goalCategory],
  );
  const selectedProduct = content.products.find((item) => item.id === productId);

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

  function goToStep(next: number) {
    setError("");
    setDone(false);
    setStep(next);
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
    if (step === 3 && !visitAck) {
      setError("Confirm you understand this intake is non-clinical until a clinician reviews.");
      return;
    }

    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }

    addLead({
      goal,
      state,
      notes: `Visit · preferred ${selectedProduct?.name ?? productId}${
        coverageReminder ? " · coverage reminder" : ""
      }`,
      status: "submitted",
      source: "visit",
    });
    setDone(true);
  }

  return (
    <div className="visit-page">
      <div className="container visit-shell">
        <JourneyRail
          steps={[
            { label: "Home", to: "/", done: true },
            { label: "Care", to: "/#find-care", done: true },
            { label: "Quiz", to: quizPath(goalCategory), done: true },
            { label: "Visit", current: true },
            {
              label: "Checkout",
              to: productId ? `/checkout?product=${encodeURIComponent(productId)}` : "/checkout",
            },
          ]}
        />
        <StepIndicator current={1} />
        <p className="visit-flow-chip">Intake · answers stay in this browser</p>
        {hero ? <img src={hero.src} alt={hero.alt} className="visit-hero-img" /> : null}

        {!done ? (
          <div className="visit-progress" role="list" aria-label="Visit steps">
            {stepLabels.map((label, index) => (
              <button
                key={label}
                type="button"
                role="listitem"
                className={`visit-step-chip ${index === step ? "is-current" : ""} ${
                  index < step ? "is-done" : ""
                }`}
                disabled={index > step}
                onClick={() => {
                  if (index < step) goToStep(index);
                }}
              >
                <span className="visit-step-index">{index + 1}</span>
                <span className="visit-step-label">{label}</span>
              </button>
            ))}
          </div>
        ) : null}

        {done ? (
          <div className="visit-done">
            <h1>Visit saved locally</h1>
            <p>
              Nothing was sent to a clinic. Admin workflow status starts as Submitted and is updated
              only by a person in admin — this screen does not decide eligibility.
            </p>
            <dl className="visit-summary">
              <div>
                <dt>Care area</dt>
                <dd>
                  {goal}
                  <button type="button" className="text-link" onClick={() => goToStep(0)}>
                    Change
                  </button>
                </dd>
              </div>
              <div>
                <dt>State</dt>
                <dd>
                  {state || "—"}
                  <button type="button" className="text-link" onClick={() => goToStep(1)}>
                    Change
                  </button>
                </dd>
              </div>
              <div>
                <dt>Starting option</dt>
                <dd>
                  {selectedProduct?.name ?? productId}
                  <button type="button" className="text-link" onClick={() => goToStep(2)}>
                    Change
                  </button>
                </dd>
              </div>
            </dl>
            <div className="visit-next">
              <h2>What you can try next</h2>
              <p className="lede">
                The intake is saved locally. Continue the sample journey—still no clinic, payments,
                or verified prices.
              </p>
              <div className="visit-next-grid">
                <article className="visit-next-card">
                  <h3>Coverage check</h3>
                  <p>Run the insurance pathway prototype with placeholder carrier details.</p>
                  <Link
                    to={`/insurance-check?goal=${encodeURIComponent(goalCategory)}${
                      productId ? `&product=${encodeURIComponent(productId)}` : ""
                    }`}
                    className="btn btn-primary"
                  >
                    Check coverage
                  </Link>
                </article>
                <article className="visit-next-card">
                  <h3>Plan review</h3>
                  <p>Pick a sample membership cadence and save another local lead.</p>
                  <Link
                    to={`/checkout?product=${encodeURIComponent(productId || "")}`}
                    className="btn btn-primary"
                  >
                    Review sample plan
                  </Link>
                </article>
              </div>
            </div>
            <div className="visit-actions visit-actions-static">
              <Link to="/#find-care" className="btn btn-secondary">
                Back to care areas
              </Link>
              <Link to="/how-it-works" className="btn btn-secondary">
                How it works
              </Link>
              <button type="button" className="btn btn-secondary" onClick={() => goToStep(0)}>
                Edit answers
              </button>
            </div>
          </div>
        ) : (
          <form className="visit-form" onSubmit={onSubmit} noValidate>
            {step > 0 ? (
              <div className="visit-answers">
                <p>
                  <strong>So far:</strong> {goal}
                  {state ? ` · ${state}` : ""}
                  {step > 2 && selectedProduct ? ` · ${selectedProduct.name}` : ""}
                </p>
                <button type="button" className="text-link" onClick={() => goToStep(0)}>
                  Change care area
                </button>
              </div>
            ) : null}

            {step === 0 && (
              <>
                <h1>What are you here for?</h1>
                <p className="lede">Pick a care area. You can change this later.</p>
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
                <p className="lede">State gate only — stored in this browser.</p>
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
                <p className="lede">Choose a option. Pricing is not shown until verified.</p>
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
                      <span className="goal-meta">{product.meta}</span>
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
                <h1>Confirm this visit</h1>
                <p className="lede">Short acknowledgment before saving a local sample lead.</p>
                <div className="callout">
                  <p>
                    Saved only in this browser. No clinic, pharmacy, or payment system receives
                    these answers. Read the <Link to="/privacy">privacy note</Link> if you want
                    the storage details.
                  </p>
                </div>
                <ul className="visit-review-list">
                  <li>
                    Care: <strong>{goal}</strong>{" "}
                    <button type="button" className="text-link" onClick={() => goToStep(0)}>
                      Edit
                    </button>
                  </li>
                  <li>
                    State: <strong>{state}</strong>{" "}
                    <button type="button" className="text-link" onClick={() => goToStep(1)}>
                      Edit
                    </button>
                  </li>
                  <li>
                    Option: <strong>{selectedProduct?.name ?? "—"}</strong>{" "}
                    <button type="button" className="text-link" onClick={() => goToStep(2)}>
                      Edit
                    </button>
                  </li>
                </ul>
                <fieldset className="visit-consent">
                  <legend>Consent </legend>
                  <label className="field checkbox">
                    <input
                      type="checkbox"
                      checked={visitAck}
                      onChange={(event) => {
                        setVisitAck(event.target.checked);
                        setError("");
                      }}
                    />
                    <span>I understand this is a non-clinical intake with sample data.</span>
                  </label>
                  <label className="field checkbox">
                    <input
                      type="checkbox"
                      checked={coverageReminder}
                      onChange={(event) => setCoverageReminder(event.target.checked)}
                    />
                    <span>Remind me about the coverage-check prototype later (optional).</span>
                  </label>
                </fieldset>
              </>
            )}

            {error ? (
              <p className="field-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="visit-actions">
              {step > 0 ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => goToStep(step - 1)}
                >
                  Back
                </button>
              ) : (
                <Link to="/#find-care" className="btn btn-secondary">
                  Care areas
                </Link>
              )}
              <button type="submit" className="btn btn-primary">
                {step === 3 ? "Finish visit" : "Continue"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
