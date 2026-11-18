import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import "./Visit.css";

const goals = ["Weight", "Sexual health", "Hair", "Skin"] as const;

type Goal = (typeof goals)[number];

export function Visit() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal>("Weight");
  const [state, setState] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (step < 2) {
      setStep((current) => current + 1);
      return;
    }
    setDone(true);
  }

  return (
    <div className="visit-page">
      <div className="container visit-shell">
        <div className="visit-progress" aria-hidden="true">
          {[0, 1, 2].map((index) => (
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
            <p>
              This is a UI prototype. No data leaves your browser and no clinician
              is contacted.
            </p>
            <div className="hero-actions">
              <Link to="/" className="btn btn-primary">
                Back home
              </Link>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setDone(false);
                  setStep(0);
                }}
              >
                Restart
              </button>
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
                      onClick={() => setGoal(item)}
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
                <p className="lede">
                  Live visits gate by licensed state. This clone only stores a
                  demo value locally.
                </p>
                <label className="field">
                  <span>State</span>
                  <select
                    required
                    value={state}
                    onChange={(event) => setState(event.target.value)}
                  >
                    <option value="">Select</option>
                    {["California", "New York", "Texas", "Florida", "Illinois"].map(
                      (name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </>
            )}

            {step === 2 && (
              <>
                <h1>Quick health snapshot</h1>
                <p className="lede">
                  A shortened questionnaire to mimic the online-visit cadence.
                </p>
                <label className="field checkbox">
                  <input type="checkbox" required />
                  <span>I understand this is a non-clinical demo.</span>
                </label>
                <label className="field checkbox">
                  <input type="checkbox" />
                  <span>I want reminders about membership options.</span>
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
                {step === 2 ? "Finish demo visit" : "Continue"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
