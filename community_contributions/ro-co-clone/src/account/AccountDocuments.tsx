import { AccountEmptyState } from "./AccountEmptyState";

export function AccountDocuments() {
  return (
    <div className="account-section" data-testid="account-documents">
      <header className="account-section-head">
        <p className="section-kicker">Documents</p>
        <h2>Documents & records</h2>
        <p>
          Lab PDFs, prescriptions, and visit summaries are not stored in this SPA. Durable medical
          records require a future backend — do not treat browser storage as a chart.
        </p>
      </header>
      <AccountEmptyState
        testId="account-documents-empty"
        title="No documents on file"
        body="When a secure document store ships, downloads will list here. Until then, policy stubs and education guides live on the marketing site."
        ctas={[
          { to: "/privacy", label: "Privacy policy", primary: true },
          { to: "/guides", label: "Health guides" },
          { to: "/consumer-health-privacy", label: "Consumer health privacy" },
        ]}
      />
    </div>
  );
}
