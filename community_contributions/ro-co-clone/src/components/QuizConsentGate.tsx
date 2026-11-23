import { useState } from "react";
import { CONSENT_VERSION, writeIntakeConsent } from "../utils/intakeConsent";
import "./QuizShell.css";

type Props = {
  treatmentName: string;
  treatmentSlug: string;
  onAccepted: () => void;
};

export function QuizConsentGate({ treatmentName, treatmentSlug, onAccepted }: Props) {
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="quiz-consent-card" data-testid="quiz-consent-gate">
      <p className="eyebrow">Before you start</p>
      <h2>Demo consent</h2>
      <ul>
        <li>Answers stay in this browser (localStorage) only.</li>
        <li>No prescription, clinic, or payment is created.</li>
        <li>Published prices use “—” until verified.</li>
      </ul>
      <label className="field checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => {
            setChecked(event.target.checked);
            setError("");
          }}
        />
        <span>
          I understand this is a demo of {treatmentName} intake. Consent version{" "}
          {CONSENT_VERSION}.
        </span>
      </label>
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        className="btn btn-primary"
        data-testid="quiz-consent-accept"
        onClick={() => {
          if (!checked) {
            setError("Confirm the demo acknowledgment to continue.");
            return;
          }
          writeIntakeConsent(treatmentSlug);
          onAccepted();
        }}
      >
        Continue to questions
      </button>
    </div>
  );
}
