import { AccountEmptyState } from "./AccountEmptyState";

export function AccountMembership() {
  return (
    <div className="account-section" data-testid="account-membership">
      <header className="account-section-head">
        <p className="section-kicker">Membership</p>
        <h2>Membership & billing</h2>
        <p>
          Subscription tiers, invoices, and card-on-file management wait on a real billing provider.
          No invented prices or membership levels are listed here.
        </p>
      </header>
      <AccountEmptyState
        testId="account-membership-empty"
        title="Membership not connected"
        body="When membership and payment integrations go live, plan details and billing history will show here. Coverage checks today are sample-only."
        ctas={[
          { to: "/insurance-check", label: "Coverage check (sample)", primary: true },
          { to: "/checkout", label: "Plan review shell" },
          { to: "/help", label: "Help center" },
        ]}
      />
    </div>
  );
}
