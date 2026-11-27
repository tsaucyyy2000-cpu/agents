import { useEffect, useState } from "react";
import { StatusPipeline } from "../labPharmacy/StatusPipeline";
import {
  LocalDemoPharmacyAdapter,
  PHARMACY_STORE_KEY,
  formatShellTimestamp,
  listAllPharmacy,
  subscribePharmacyStore,
} from "../labPharmacy/labPharmacyStore";
import {
  AWAITING_PARTNER_COPY,
  PHARMACY_PIPELINE_STAGES,
  PHARMACY_STAGE_LABEL,
  type PharmacyPipelineStage,
  type PharmacyShellRecord,
} from "../labPharmacy/types";

const STAGE_OPTIONS: Array<"all" | PharmacyPipelineStage> = [
  "all",
  "requested",
  "ordered",
  "preparing",
  "shipped",
];

/**
 * Admin read-only pharmacy / orders queue.
 * Does not advance fulfillment or invent tracking numbers.
 */
export function PharmacyAdmin() {
  const [orders, setOrders] = useState<PharmacyShellRecord[]>([]);
  const [filter, setFilter] = useState<"all" | PharmacyPipelineStage>("all");

  function refresh() {
    setOrders(listAllPharmacy());
  }

  useEffect(() => {
    refresh();
    return subscribePharmacyStore(refresh);
  }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.stage === filter);

  return (
    <div data-testid="admin-pharmacy">
      <div className="admin-header">
        <div>
          <h1>Pharmacy / orders</h1>
          <p>
            Read-only queue of pharmacy status shells in <code>{PHARMACY_STORE_KEY}</code>. Adapter{" "}
            <code>{LocalDemoPharmacyAdapter.id}</code> is non-operational — no fabricated tracking,
            no auto-dispense from admin.
          </p>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <span>Pending shells</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="admin-card">
          <span>With tracking</span>
          <strong>0</strong>
        </div>
        <div className="admin-card">
          <span>Partner</span>
          <strong>{AWAITING_PARTNER_COPY}</strong>
        </div>
      </div>

      <div className="admin-card admin-appt-shell">
        <div className="admin-msg-filters">
          <label>
            Stage
            <select
              value={filter}
              data-testid="admin-pharmacy-filter"
              onChange={(e) => setFilter(e.target.value as "all" | PharmacyPipelineStage)}
            >
              {STAGE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All" : PHARMACY_STAGE_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filtered.length === 0 ? (
          <p className="admin-msg-hint" data-testid="admin-pharmacy-empty">
            No pharmacy status shells in this filter. Patient requests from{" "}
            <code>/account/orders</code> appear here in the same browser. This queue does not invent
            shipment tracking numbers.
          </p>
        ) : (
          <ul className="admin-appt-list">
            {filtered.map((order) => (
              <li key={order.id} className="admin-appt-row" data-testid="admin-pharmacy-row">
                <div className="admin-appt-main">
                  <strong>{order.pathwayLabel}</strong>
                  <span className="admin-msg-patient">
                    {order.patientLabel}
                    {order.patientKey ? <span> · {order.patientKey}</span> : null}
                  </span>
                  <span>
                    {PHARMACY_STAGE_LABEL[order.stage]} · {formatShellTimestamp(order.createdAt)} ·
                    tracking: none
                  </span>
                  <StatusPipeline
                    steps={PHARMACY_PIPELINE_STAGES}
                    currentId={order.stage}
                    testId={`admin-pharmacy-pipeline-${order.id}`}
                    footerNote={AWAITING_PARTNER_COPY}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
