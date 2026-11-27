import { useState } from "react";
import { Link } from "react-router-dom";
import {
  formatSandboxTimestamp,
  loadSandboxMemberships,
} from "../utils/sandboxMembership";
import { AccountEmptyState } from "./AccountEmptyState";
import "../pages/MembershipSandbox.css";

export function AccountMembership() {
  const [records] = useState(() => loadSandboxMemberships());

  return (
    <div className="account-section" data-testid="account-membership">
      <header className="account-section-head">
        <p className="section-kicker">Membership</p>
        <h2>Membership & billing</h2>
        <p>
          Live subscription tiers, invoices, and card-on-file wait on a real billing provider.
          Membership fees stay TBD / pending verification and are separate from medication costs.
          Sandbox demo records below never mean a payment succeeded.
        </p>
      </header>

      <div className="account-chip-row" aria-label="Membership status chips">
        <span className="account-chip account-chip-peach">Sandbox demos only</span>
        <span className="account-chip account-chip-mint">Pricing pending verification</span>
        <span className="account-chip account-chip-warn">No live charges</span>
      </div>

      {records.length > 0 ? (
        <div className="account-card" data-testid="account-membership-demo-records">
          <h3>Sandbox demo records</h3>
          <p className="account-card-lede">
            Stored in this browser under <code>ro-clone-sandbox-memberships-v1</code>. Status is
            always <strong>sandbox-simulated</strong> — Sandbox / simulated — no payment processed.
          </p>
          <ul className="membership-demo-list">
            {records.map((record) => (
              <li key={record.id} data-testid="account-membership-demo-item">
                <strong>{record.planName}</strong>
                <div className="membership-demo-meta">
                  <span>Cadence: {record.cadence}</span>
                  <span>Created: {formatSandboxTimestamp(record.createdAt)}</span>
                  <span>
                    Id: <code>{record.id}</code>
                  </span>
                </div>
                <p className="membership-pending-label">{record.confirmationLabel}</p>
                <p className="membership-med-note">
                  Membership fee TBD · medication costs are separate and not included.
                </p>
              </li>
            ))}
          </ul>
          <div className="account-toolbar">
            <Link className="btn btn-primary" to="/membership">
              Compare plans
            </Link>
            <Link className="btn btn-ghost" to="/membership/checkout">
              Another sandbox checkout
            </Link>
          </div>
        </div>
      ) : (
        <AccountEmptyState
          testId="account-membership-empty"
          kicker="Sandbox ready · no live billing"
          title="No sandbox membership demos yet"
          body="Compare placeholder monthly / quarterly / annual plans, then run the labeled sandbox checkout. Demo records will show here with audit timestamps. No invented prices and no real charges."
          ctas={[
            { to: "/membership", label: "Compare membership plans", primary: true },
            { to: "/membership/checkout", label: "Sandbox checkout" },
            { to: "/checkout", label: "Product plan review" },
            { to: "/insurance-check", label: "Coverage check (sample)" },
          ]}
        />
      )}
    </div>
  );
}
