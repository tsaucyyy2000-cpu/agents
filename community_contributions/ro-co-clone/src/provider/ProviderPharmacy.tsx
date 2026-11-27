import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatusPipeline } from "../labPharmacy/StatusPipeline";
import {
  PHARMACY_STORE_KEY,
  formatShellTimestamp,
  listAllPharmacy,
  subscribePharmacyStore,
} from "../labPharmacy/labPharmacyStore";
import {
  AWAITING_PARTNER_COPY,
  PHARMACY_PIPELINE_STAGES,
  PHARMACY_STAGE_LABEL,
  type PharmacyShellRecord,
} from "../labPharmacy/types";

/**
 * Provider read-only pharmacy / orders queue.
 * No tracking mutation; partner integration required for fulfillment.
 */
export function ProviderPharmacy() {
  const [orders, setOrders] = useState<PharmacyShellRecord[]>([]);

  useEffect(() => {
    const refresh = () => setOrders(listAllPharmacy());
    refresh();
    return subscribePharmacyStore(refresh);
  }, []);

  return (
    <div data-testid="provider-pharmacy" className="provider-appointments-stub">
      <div className="admin-header">
        <div>
          <h1>Pharmacy / orders</h1>
          <p>
            Read-only view of local pharmacy status shells (<code>{PHARMACY_STORE_KEY}</code>).
            Patients request at <Link to="/account/orders">/account/orders</Link>. No fabricated
            tracking — {AWAITING_PARTNER_COPY.toLowerCase()}. Cannot prescribe from this portal.
          </p>
        </div>
        <Link className="btn btn-primary" to="/admin/pharmacy">
          Open admin pharmacy
        </Link>
      </div>

      <div className="admin-panel">
        <h2>Pending shells ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="provider-empty" data-testid="provider-pharmacy-empty">
            No pharmacy status shells in this browser yet. Patients can save a pending request from
            the account Orders tab — this portal does not invent tracking numbers or auto-dispense.
          </p>
        ) : (
          <div className="provider-thread-list">
            {orders.map((order) => (
              <div
                key={order.id}
                className="provider-thread-card"
                data-testid="provider-pharmacy-row"
              >
                <strong>
                  {order.pathwayLabel} · {PHARMACY_STAGE_LABEL[order.stage]}
                </strong>
                <span>
                  {order.patientLabel} · {formatShellTimestamp(order.createdAt)} · tracking: none ·{" "}
                  {AWAITING_PARTNER_COPY}
                </span>
                <StatusPipeline
                  steps={PHARMACY_PIPELINE_STAGES}
                  currentId={order.stage}
                  testId={`provider-pharmacy-pipeline-${order.id}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
