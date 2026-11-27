import { Link } from "react-router-dom";
import { JourneyRail } from "../components/JourneyRail";
import { PriceTag } from "../components/PriceTag";
import {
  MEMBERSHIP_CADENCES,
  MEMBERSHIP_PENDING_PRICE,
  MEMBERSHIP_PLANS,
  type MembershipCadence,
} from "../data/membershipPlans";
import "./Flows.css";
import "./MembershipSandbox.css";

function checkoutHref(planId: string, cadence: MembershipCadence): string {
  const params = new URLSearchParams({ plan: planId, cadence });
  return `/membership/checkout?${params.toString()}`;
}

export function MembershipPlans() {
  return (
    <div className="flow-page membership-sandbox-page" data-testid="membership-plans">
      <section className="flow-hero warm">
        <div className="container flow-hero-grid">
          <div>
            <JourneyRail
              steps={[
                { label: "Home", to: "/", done: true },
                { label: "Membership", current: true },
                { label: "Sandbox checkout", to: "/membership/checkout" },
              ]}
            />
            <p className="eyebrow sandbox-badge" data-testid="sandbox-badge">
              Sandbox · simulated
            </p>
            <h1>Compare membership cadences</h1>
            <p className="lede">
              Placeholder plan names for layout review only. Membership fees are TBD / pending
              verification and are separate from medication costs. No live billing and no invented
              dollar amounts.
            </p>
            <div className="cta-row">
              <Link to="/membership/checkout" className="btn btn-primary">
                Start sandbox checkout
              </Link>
              <Link to="/checkout" className="btn btn-secondary">
                Product plan review
              </Link>
              <Link to="/account/membership" className="btn btn-secondary">
                Account membership
              </Link>
            </div>
          </div>
          <aside className="flow-form-card membership-hero-aside">
            <p className="section-kicker">Honesty</p>
            <h2>What this page is not</h2>
            <ul>
              <li>Not a real subscription catalog</li>
              <li>Not verified pricing (PriceTag stays —)</li>
              <li>Not medication or pharmacy checkout</li>
              <li>Not a successful charge — nothing is billed</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="membership-section-head">
            <p className="section-kicker">Plans</p>
            <h2>Monthly · quarterly · annual</h2>
            <p>
              Each column uses a placeholder name. Every cadence shows{" "}
              <strong>Pricing pending verification</strong> — never a fake <code>$</code> amount.
              Care-membership fees are listed separately from medication.
            </p>
          </div>

          <div className="membership-compare" data-testid="membership-compare-table" role="table">
            <div className="membership-compare-row membership-compare-head" role="row">
              <div role="columnheader">Plan</div>
              {MEMBERSHIP_CADENCES.map((cadence) => (
                <div key={cadence.id} role="columnheader">
                  {cadence.label}
                </div>
              ))}
            </div>

            {MEMBERSHIP_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`membership-compare-row${plan.highlighted ? " is-highlighted" : ""}`}
                role="row"
                data-testid={`membership-plan-row-${plan.id}`}
              >
                <div className="membership-plan-meta" role="cell">
                  <p className="membership-plan-name">{plan.name}</p>
                  <p className="membership-plan-tagline">{plan.tagline}</p>
                  <ul className="membership-include-list">
                    {plan.membershipIncludes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="membership-med-note">{plan.medicationNote}</p>
                </div>
                {MEMBERSHIP_CADENCES.map((cadence) => (
                  <div
                    key={cadence.id}
                    className="membership-plan-cell"
                    role="cell"
                    data-cadence={cadence.label}
                  >
                    <p className="membership-cell-cadence">{cadence.label}</p>
                    <PriceTag
                      price={{
                        ...MEMBERSHIP_PENDING_PRICE,
                        unit: cadence.shortLabel,
                      }}
                    />
                    <p className="membership-pending-label">Pricing pending verification</p>
                    <Link
                      className="btn btn-primary membership-cell-cta"
                      to={checkoutHref(plan.id, cadence.id)}
                      data-testid={`membership-checkout-${plan.id}-${cadence.id}`}
                    >
                      Sandbox checkout
                    </Link>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <p className="membership-foot-note">
            Demo records from sandbox checkout are stored in this browser under{" "}
            <code>ro-clone-sandbox-memberships-v1</code> and appear on Account → Membership. They
            never mean a payment succeeded.
          </p>
        </div>
      </section>
    </div>
  );
}
