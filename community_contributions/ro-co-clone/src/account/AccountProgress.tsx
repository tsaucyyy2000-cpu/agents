import { AccountEmptyState } from "./AccountEmptyState";

export function AccountProgress() {
  return (
    <div className="account-section" data-testid="account-progress">
      <header className="account-section-head">
        <p className="section-kicker">Progress</p>
        <h2>Progress tracking</h2>
        <p>
          Weight, labs, and adherence charts need a durable backend and consented data collection.
          This shell does not invent progress metrics.
        </p>
      </header>
      <AccountEmptyState
        testId="account-progress-empty"
        title="Progress tools coming later"
        body="Personal metrics and lab results will appear when integrations and a secure store are in place. Explore education content in the meantime."
        ctas={[
          { to: "/guides", label: "Browse guides", primary: true },
          { to: "/weight-loss", label: "Weight care landing" },
          { to: "/safety", label: "Safety hub" },
        ]}
      />
    </div>
  );
}
