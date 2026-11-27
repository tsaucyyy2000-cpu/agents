import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { JourneyRail } from "../components/JourneyRail";
import { PriceTag } from "../components/PriceTag";
import { StepIndicator } from "../components/StepIndicator";
import {
  MEMBERSHIP_CADENCES,
  MEMBERSHIP_PENDING_PRICE,
  MEMBERSHIP_PLANS,
  getMembershipPlan,
  isMembershipCadence,
  type MembershipCadence,
} from "../data/membershipPlans";
import {
  formatSandboxTimestamp,
  saveSandboxMembership,
  type SandboxBillingProfile,
  type SandboxMembershipRecord,
} from "../utils/sandboxMembership";
import "./Flows.css";
import "./MembershipSandbox.css";

const emptyProfile: SandboxBillingProfile = {
  fullName: "",
  email: "",
  addressLine1: "",
  city: "",
  region: "",
  postalCode: "",
};

export function SandboxCheckout() {
  const [params] = useSearchParams();
  const initialPlan =
    getMembershipPlan(params.get("plan")) ?? MEMBERSHIP_PLANS.find((p) => p.highlighted) ?? MEMBERSHIP_PLANS[0];
  const initialCadence: MembershipCadence = isMembershipCadence(params.get("cadence"))
    ? (params.get("cadence") as MembershipCadence)
    : "monthly";

  const [planId, setPlanId] = useState(initialPlan.id);
  const [cadence, setCadence] = useState<MembershipCadence>(initialCadence);
  const [profile, setProfile] = useState<SandboxBillingProfile>(emptyProfile);
  const [ack, setAck] = useState(false);
  const [error, setError] = useState("");
  const [record, setRecord] = useState<SandboxMembershipRecord | null>(null);

  const plan = useMemo(
    () => getMembershipPlan(planId) ?? MEMBERSHIP_PLANS[0],
    [planId],
  );
  const cadenceMeta = MEMBERSHIP_CADENCES.find((item) => item.id === cadence);

  function updateField<K extends keyof SandboxBillingProfile>(key: K, value: string) {
    setProfile((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!profile.fullName.trim()) {
      setError("Enter a billing name to continue the sandbox flow.");
      return;
    }
    if (!profile.email.trim() || !profile.email.includes("@")) {
      setError("Enter a sample email for the sandbox billing profile.");
      return;
    }
    if (!profile.addressLine1.trim() || !profile.city.trim() || !profile.region.trim()) {
      setError("Complete the sample address fields (local demo only).");
      return;
    }
    if (!profile.postalCode.trim()) {
      setError("Enter a sample postal code.");
      return;
    }
    if (!ack) {
      setError("Acknowledge that this is sandbox / simulated — no payment processed.");
      return;
    }

    const saved = saveSandboxMembership({
      planId: plan.id,
      planName: plan.name,
      cadence,
      billingProfile: {
        fullName: profile.fullName.trim(),
        email: profile.email.trim(),
        addressLine1: profile.addressLine1.trim(),
        city: profile.city.trim(),
        region: profile.region.trim(),
        postalCode: profile.postalCode.trim(),
      },
    });
    setRecord(saved);
  }

  return (
    <div className="flow-page membership-sandbox-page" data-testid="sandbox-checkout">
      <section className="flow-hero warm">
        <div className="container flow-hero-grid">
          <div>
            <JourneyRail
              steps={[
                { label: "Home", to: "/", done: true },
                { label: "Membership", to: "/membership", done: true },
                { label: "Sandbox checkout", current: true },
              ]}
            />
            <StepIndicator current={record ? 2 : 1} />
            <p className="eyebrow sandbox-badge" data-testid="sandbox-badge">
              Sandbox · simulated — no payment processed
            </p>
            <h1>{record ? "Sandbox confirmation" : "Sandbox billing profile"}</h1>
            <p className="lede">
              {record
                ? "A local demo membership record was saved in this browser. No card was charged and no pharmacy order was placed."
                : "Fill a sample billing profile, then confirm. Membership fees stay TBD / pending and are separate from medication costs."}
            </p>
          </div>
          <aside className="flow-form-card">
            <p className="section-kicker">Selected shell</p>
            <h2>{plan.name}</h2>
            <p>{plan.tagline}</p>
            <PriceTag
              price={{
                ...MEMBERSHIP_PENDING_PRICE,
                unit: cadenceMeta?.shortLabel ?? "membership",
              }}
            />
            <p className="membership-pending-label">Pricing pending verification</p>
            <p className="membership-med-note">{plan.medicationNote}</p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container checkout-grid">
          {record ? (
            <article className="flow-form-card" data-testid="sandbox-confirmation">
              <p className="toast-ok sandbox-confirm-banner" role="status">
                Sandbox / simulated — no payment processed
              </p>
              <h2>Demo membership saved locally</h2>
              <dl className="visit-summary" style={{ marginTop: "1rem" }}>
                <div>
                  <dt>Record id</dt>
                  <dd>
                    <code>{record.id}</code>
                  </dd>
                </div>
                <div>
                  <dt>Plan</dt>
                  <dd>{record.planName}</dd>
                </div>
                <div>
                  <dt>Cadence</dt>
                  <dd>{record.cadence}</dd>
                </div>
                <div>
                  <dt>Created (audit)</dt>
                  <dd>{formatSandboxTimestamp(record.createdAt)}</dd>
                </div>
                <div>
                  <dt>Billing name</dt>
                  <dd>{record.billingProfile.fullName}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{record.status}</dd>
                </div>
              </dl>
              <p className="membership-foot-note">
                Confirmation label: <strong>{record.confirmationLabel}</strong>. This never means a
                real charge succeeded.
              </p>
              <div className="cta-row">
                <Link to="/account/membership" className="btn btn-primary">
                  View in account Membership
                </Link>
                <Link to="/membership" className="btn btn-secondary">
                  Back to plans
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setRecord(null);
                    setAck(false);
                  }}
                >
                  Run another sandbox checkout
                </button>
              </div>
            </article>
          ) : (
            <article className="flow-form-card">
              <h2>Billing profile (sample)</h2>
              <p className="account-card-lede">
                Values stay in this browser only. Do not enter real payment credentials — there is
                no card field and no processor.
              </p>
              <form className="flow-form" onSubmit={onSubmit} data-testid="sandbox-billing-form">
                <label>
                  Plan
                  <select
                    value={planId}
                    onChange={(event) => setPlanId(event.target.value)}
                    data-testid="sandbox-plan-select"
                  >
                    {MEMBERSHIP_PLANS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <fieldset className="sandbox-cadence-fieldset">
                  <legend>Cadence</legend>
                  <div className="plan-toggle plan-toggle-3">
                    {MEMBERSHIP_CADENCES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={cadence === item.id ? "selected" : ""}
                        onClick={() => setCadence(item.id)}
                        data-testid={`sandbox-cadence-${item.id}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label>
                  Full name
                  <input
                    value={profile.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                    autoComplete="name"
                    data-testid="sandbox-full-name"
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    autoComplete="email"
                    data-testid="sandbox-email"
                  />
                </label>
                <label>
                  Address
                  <input
                    value={profile.addressLine1}
                    onChange={(event) => updateField("addressLine1", event.target.value)}
                    autoComplete="street-address"
                    data-testid="sandbox-address"
                  />
                </label>
                <div className="sandbox-address-row">
                  <label>
                    City
                    <input
                      value={profile.city}
                      onChange={(event) => updateField("city", event.target.value)}
                      autoComplete="address-level2"
                      data-testid="sandbox-city"
                    />
                  </label>
                  <label>
                    State / region
                    <input
                      value={profile.region}
                      onChange={(event) => updateField("region", event.target.value)}
                      autoComplete="address-level1"
                      data-testid="sandbox-region"
                    />
                  </label>
                  <label>
                    Postal code
                    <input
                      value={profile.postalCode}
                      onChange={(event) => updateField("postalCode", event.target.value)}
                      autoComplete="postal-code"
                      data-testid="sandbox-postal"
                    />
                  </label>
                </div>
                <label className="field checkbox">
                  <input
                    type="checkbox"
                    checked={ack}
                    onChange={(event) => {
                      setAck(event.target.checked);
                      setError("");
                    }}
                    data-testid="sandbox-ack"
                  />
                  <span>
                    I understand this is <strong>Sandbox / simulated — no payment processed</strong>.
                    Membership pricing is pending verification and separate from medication costs.
                  </span>
                </label>
                {error ? (
                  <p className="field-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <div className="cta-row">
                  <button type="submit" className="btn btn-primary" data-testid="sandbox-submit">
                    Confirm sandbox membership
                  </button>
                  <Link to="/membership" className="btn btn-secondary">
                    Back to plans
                  </Link>
                  <Link to="/checkout" className="btn btn-secondary">
                    Product plan review
                  </Link>
                </div>
              </form>
            </article>
          )}

          <aside className="flow-form-card">
            <h3>Sandbox rules</h3>
            <ul>
              <li>Labeled sandbox on every step</li>
              <li>No Stripe / card capture</li>
              <li>No invented membership dollar amounts</li>
              <li>Medication costs stay out of membership fees</li>
              <li>Demo records → Account → Membership</li>
            </ul>
            <div className="cta-row" style={{ marginTop: "1rem" }}>
              <Link to="/membership" className="text-link">
                Compare plans
              </Link>
              <Link to="/help" className="text-link">
                Help center
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
