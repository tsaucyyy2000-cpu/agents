import { AccountEmptyState } from "./AccountEmptyState";
import { quizPath } from "../utils/careRoutes";

function previewPath(to: string, preview: boolean): string {
  if (!preview) return to;
  const [path, existing] = to.split("?");
  const params = new URLSearchParams(existing ?? "");
  params.set("previewShell", "1");
  return `${path}?${params.toString()}`;
}

export function AccountCare({ preview = false }: { preview?: boolean }) {
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
        body="When telehealth and EHR integrations ship, your active plans and visit summaries will show here. Until then, use the marketing funnel or the appointments sandbox to explore care areas."
        ctas={[
          { to: "/#find-care", label: "Find care", primary: true },
          {
            to: previewPath("/account/appointments", preview),
            label: "Appointments sandbox",
          },
          { to: quizPath("weight"), label: "Start a quiz" },
          { to: "/visit", label: "Visit intake" },
        ]}
      />
    </div>
  );
}
