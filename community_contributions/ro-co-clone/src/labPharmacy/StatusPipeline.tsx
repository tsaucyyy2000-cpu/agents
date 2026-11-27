import { AWAITING_PARTNER_COPY } from "./types";

export type PipelineStep = {
  id: string;
  label: string;
  hint: string;
};

type StatusPipelineProps = {
  steps: PipelineStep[];
  /** Current stage id — later stages render as awaiting partner. */
  currentId: string;
  testId?: string;
  /** Extra honesty line under the rail (e.g. no results / no tracking). */
  footerNote?: string;
};

/**
 * Visual status pipeline for lab / pharmacy shells.
 * Stages after the current one stay labeled as awaiting partner integration.
 */
export function StatusPipeline({
  steps,
  currentId,
  testId = "status-pipeline",
  footerNote,
}: StatusPipelineProps) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((s) => s.id === currentId),
  );

  return (
    <div className="lp-pipeline" data-testid={testId} role="list" aria-label="Status pipeline">
      <ol className="lp-pipeline-rail">
        {steps.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          const pending = index > currentIndex;
          return (
            <li
              key={step.id}
              className={`lp-pipeline-step${done ? " is-done" : ""}${active ? " is-active" : ""}${pending ? " is-pending" : ""}`}
              role="listitem"
              data-testid={`pipeline-step-${step.id}`}
              aria-current={active ? "step" : undefined}
            >
              <span className="lp-pipeline-index" aria-hidden>
                {index + 1}
              </span>
              <div className="lp-pipeline-copy">
                <strong>{step.label}</strong>
                <span>
                  {pending || (active && step.id === "result_review") || (active && step.id === "shipped")
                    ? AWAITING_PARTNER_COPY
                    : active
                      ? step.hint
                      : done
                        ? "Recorded on this device (demo)"
                        : step.hint}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      {footerNote ? <p className="lp-pipeline-footer">{footerNote}</p> : null}
    </div>
  );
}
