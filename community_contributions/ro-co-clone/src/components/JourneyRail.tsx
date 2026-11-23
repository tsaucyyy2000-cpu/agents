import { Link } from "react-router-dom";
import "./JourneyRail.css";

type Step = {
  label: string;
  to?: string;
  current?: boolean;
  done?: boolean;
};

export function JourneyRail({ steps }: { steps: Step[] }) {
  return (
    <nav className="journey-rail" aria-label="Care journey">
      <ol>
        {steps.map((step) => (
          <li
            key={step.label}
            className={`${step.current ? "is-current" : ""} ${step.done ? "is-done" : ""}`}
          >
            {step.to && !step.current ? (
              <Link to={step.to}>{step.label}</Link>
            ) : (
              <span>{step.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
