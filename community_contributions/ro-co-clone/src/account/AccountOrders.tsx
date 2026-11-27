import { useEffect, useState } from "react";
import { AccountEmptyState } from "./AccountEmptyState";
import { StatusPipeline } from "../labPharmacy/StatusPipeline";
import {
  LocalDemoPharmacyAdapter,
  PHARMACY_STORE_KEY,
  createPharmacyShellRequest,
  formatShellTimestamp,
  listPharmacyForPatient,
  subscribePharmacyStore,
} from "../labPharmacy/labPharmacyStore";
import {
  AWAITING_PARTNER_COPY,
  PHARMACY_PATHWAY_OPTIONS,
  PHARMACY_PIPELINE_STAGES,
  SAFE_LAB_PHARMACY_NOTIFY,
  type PharmacyShellRecord,
} from "../labPharmacy/types";

type AccountOrdersProps = {
  patientKey: string;
  patientLabel: string;
  preview?: boolean;
};

/**
 * Pharmacy / orders status shell.
 * Pipeline: requested → ordered → preparing → shipped.
 * Never shows fabricated tracking numbers.
 */
export function AccountOrders({
  patientKey,
  patientLabel,
  preview = false,
}: AccountOrdersProps) {
  const [orders, setOrders] = useState<PharmacyShellRecord[]>([]);
  const [pathwayLabel, setPathwayLabel] = useState<string>(PHARMACY_PATHWAY_OPTIONS[0].label);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function refresh() {
    setOrders(listPharmacyForPatient(patientKey));
  }

  useEffect(() => {
    refresh();
    return subscribePharmacyStore(refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh closes over patientKey
  }, [patientKey]);

  function flash(safeCopy: string) {
    setToast(safeCopy);
    window.setTimeout(() => setToast(null), 2800);
  }

  async function handleRequest() {
    if (busy) return;
    setBusy(true);
    try {
      await createPharmacyShellRequest({ patientKey, patientLabel, pathwayLabel });
      refresh();
      flash(SAFE_LAB_PHARMACY_NOTIFY.pharmacyRequested);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="account-section" data-testid="account-orders">
      <header className="account-section-head">
        <p className="section-kicker">Orders</p>
        <h2>Orders & pharmacy</h2>
        <p>
          Fulfillment status pipeline for requested → ordered → preparing → shipped. Demo adapter{" "}
          <code>{LocalDemoPharmacyAdapter.id}</code> is <strong>non-operational</strong> — stored in{" "}
          <code>{PHARMACY_STORE_KEY}</code> only. This page never invents tracking numbers or
          carriers.
        </p>
        <div className="account-chip-row">
          <span className="account-chip account-chip-warn">Demo · non-operational</span>
          <span className="account-chip account-chip-mint">{AWAITING_PARTNER_COPY}</span>
          {preview ? <span className="account-chip account-chip-peach">Design preview</span> : null}
        </div>
      </header>

      {toast ? (
        <p className="msg-toast" role="status" data-testid="orders-toast">
          {toast}
        </p>
      ) : null}

      <div className="account-card lp-request-card" data-testid="orders-request-form">
        <h3>Request an order status shell</h3>
        <p className="account-card-lede">
          Creates a local pending pharmacy order at the Requested stage. Shipment / tracking stays{" "}
          {AWAITING_PARTNER_COPY.toLowerCase()} — no auto-dispense, no fabricated tracking IDs.
        </p>
        <label className="lp-field">
          Care pathway metaphor
          <select
            value={pathwayLabel}
            data-testid="orders-pathway-select"
            onChange={(e) => setPathwayLabel(e.target.value)}
          >
            {PHARMACY_PATHWAY_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn-primary"
          data-testid="orders-request-btn"
          disabled={busy}
          onClick={() => {
            void handleRequest();
          }}
        >
          Save pending order request
        </button>
      </div>

      {orders.length === 0 ? (
        <AccountEmptyState
          testId="account-orders-empty"
          kicker="Coming when integrations live"
          title="No orders to show"
          body="Order history and shipment status appear when pharmacy and payment integrations are live. Until then, requests stay pending with no fabricated tracking numbers."
          ctas={[
            { to: "/checkout", label: "Plan review shell", primary: true },
            { to: "/how-it-works", label: "How care works" },
            { to: "/guides", label: "Health guides" },
          ]}
        />
      ) : (
        <ul className="lp-card-list" data-testid="orders-list">
          {orders.map((order) => (
            <li key={order.id} className="account-card lp-status-card" data-testid="orders-item">
              <div className="lp-status-head">
                <div>
                  <strong>{order.pathwayLabel}</strong>
                  <p>
                    Saved {formatShellTimestamp(order.createdAt)} · adapter non-operational ·
                    tracking: none
                  </p>
                </div>
                <span className="account-chip account-chip-warn" data-testid="orders-partner-chip">
                  {AWAITING_PARTNER_COPY}
                </span>
              </div>
              <StatusPipeline
                steps={PHARMACY_PIPELINE_STAGES}
                currentId={order.stage}
                testId={`orders-pipeline-${order.id}`}
                footerNote="Shipped stage never invents tracking numbers. Fulfillment partner integration required before any carrier data appears."
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
