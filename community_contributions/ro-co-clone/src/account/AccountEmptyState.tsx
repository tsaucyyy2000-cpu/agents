import { Link } from "react-router-dom";

export type EmptyCta = {
  to: string;
  label: string;
  primary?: boolean;
};

type AccountEmptyStateProps = {
  kicker?: string;
  title: string;
  body: string;
  ctas?: EmptyCta[];
  testId?: string;
};

/** Honest gated / empty panel — no invented orders, shipments, or payments. */
export function AccountEmptyState({
  kicker = "Coming when integrations live",
  title,
  body,
  ctas = [],
  testId,
}: AccountEmptyStateProps) {
  return (
    <div className="account-empty" data-testid={testId}>
      <p className="account-empty-kicker">{kicker}</p>
      <h2>{title}</h2>
      <p>{body}</p>
      {ctas.length > 0 ? (
        <div className="account-toolbar">
          {ctas.map((cta) => (
            <Link
              key={`${cta.to}-${cta.label}`}
              className={cta.primary ? "btn btn-primary" : "btn btn-ghost"}
              to={cta.to}
            >
              {cta.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
