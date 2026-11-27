import { AccountEmptyState } from "./AccountEmptyState";
import { quizPath } from "../utils/careRoutes";

export function AccountCare() {
  return (
    <div className="account-section" data-testid="account-care">
      <header className="account-section-head">
        <p className="section-kicker">My care</p>
        <h2>Care plan & visits</h2>
        <p>
          Provider messaging, care plans, and visit history stay gated until a real clinical backend
          exists. No clinician names or chart data are invented here.
        </p>
      </header>
      <AccountEmptyState
        testId="account-care-empty"
        title="No live care record yet"
        body="When telehealth and EHR integrations ship, your active plans and visit summaries will show here. Until then, use the marketing funnel to explore care areas."
        ctas={[
          { to: "/#find-care", label: "Find care", primary: true },
          { to: quizPath("weight"), label: "Start a quiz" },
          { to: "/visit", label: "Visit intake" },
        ]}
      />
    </div>
  );
}
