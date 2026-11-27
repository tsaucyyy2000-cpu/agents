import { Link } from "react-router-dom";
import { quizPath } from "../utils/careRoutes";

type AccountOverviewProps = {
  displayName: string;
  preview?: boolean;
};

const DEMO_CHIPS = [
  { label: "Shell only", tone: "mint" as const },
  { label: "No live care record", tone: "peach" as const },
  { label: "SPA · not PHI storage", tone: "warn" as const },
];

const TASK_PLACEHOLDERS = [
  {
    title: "Start a care quiz",
    note: "Marketing funnel · answers stay in this browser",
    to: quizPath("weight"),
    cta: "Open weight quiz",
  },
  {
    title: "Complete visit intake",
    note: "Sample lead form · not a clinic chart",
    to: "/visit",
    cta: "Open visit",
  },
  {
    title: "Read a health guide",
    note: "Education tiles · not personal medical advice",
    to: "/guides",
    cta: "Browse guides",
  },
];

export function AccountOverview({ displayName, preview = false }: AccountOverviewProps) {
  return (
    <div className="account-section" data-testid="account-overview">
      <header className="account-section-head">
        <p className="section-kicker">Overview</p>
        <h2>Welcome{displayName ? `, ${displayName.split(" ")[0]}` : ""}</h2>
        <p>
          This is your patient dashboard shell. Status chips below are{" "}
          <strong>demo labels for the SPA</strong> — not a live clinical status, membership tier, or
          payment state.
          {preview ? " Preview mode: Clerk is not configured on this build." : null}
        </p>
      </header>

      <div className="account-chip-row" aria-label="Demo status chips">
        {DEMO_CHIPS.map((chip) => (
          <span key={chip.label} className={`account-chip account-chip-${chip.tone}`}>
            {chip.label}
          </span>
        ))}
      </div>

      <div className="account-panel-grid">
        <section className="account-card">
          <h3>Suggested next steps</h3>
          <p className="account-card-lede">
            Placeholders that link into existing visit and guide flows — not assigned clinician tasks.
          </p>
          <ul className="account-task-list">
            {TASK_PLACEHOLDERS.map((task) => (
              <li key={task.title}>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.note}</span>
                </div>
                <Link className="btn btn-ghost" to={task.to}>
                  {task.cta}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="account-card">
          <h3>Recent activity</h3>
          <div className="account-activity-empty" data-testid="account-activity-empty">
            <p className="account-empty-kicker">Nothing here yet</p>
            <p>
              Orders, shipment updates, messages, and payment events will appear when pharmacy, lab,
              and billing integrations are live. This SPA does not invent tracking numbers or
              receipts.
            </p>
            <div className="account-toolbar">
              <Link className="btn btn-primary" to="/how-it-works">
                How care works
              </Link>
              <Link className="btn btn-ghost" to="/help">
                Help center
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="callout">
        <p>
          <strong>Data note:</strong> Durable medical records, prescriptions, and payments need a
          future backend. Quiz answers, visit leads, and CMS edits on this marketing SPA still use{" "}
          <code>localStorage</code> (<code>ro-clone-site-content-v2</code>) — not HIPAA-ready
          storage.
        </p>
      </div>
    </div>
  );
}
