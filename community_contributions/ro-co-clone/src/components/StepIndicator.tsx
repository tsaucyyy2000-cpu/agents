import "./StepIndicator.css";

const steps = ["Care", "Visit", "Checkout"] as const;

type Props = {
  current: 0 | 1 | 2;
};

/** Compact Care → Visit → Checkout marker; complements JourneyRail. */
export function StepIndicator({ current }: Props) {
  return (
    <nav className="step-indicator" aria-label="Funnel steps">
      <ol>
        {steps.map((label, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={label} className={`${done ? "is-done" : ""} ${active ? "is-active" : ""}`}>
              {index > 0 ? <span className="step-indicator-connector" aria-hidden="true" /> : null}
              <span
                className="step-indicator-mark"
                aria-current={active ? "step" : undefined}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path
                      d="M2.5 6.2 4.8 8.5 9.5 3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span className="step-indicator-label">{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
