import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatusPipeline } from "../labPharmacy/StatusPipeline";
import {
  LAB_STORE_KEY,
  formatShellTimestamp,
  listAllLabs,
  subscribeLabStore,
} from "../labPharmacy/labPharmacyStore";
import {
  AWAITING_PARTNER_COPY,
  LAB_PIPELINE_STAGES,
  LAB_STAGE_LABEL,
  type LabShellRecord,
} from "../labPharmacy/types";

/**
 * Provider read-only lab status queue.
 * No result mutation; partner integration required for real assays.
 */
export function ProviderLabs() {
  const [labs, setLabs] = useState<LabShellRecord[]>([]);

  useEffect(() => {
    const refresh = () => setLabs(listAllLabs());
    refresh();
    return subscribeLabStore(refresh);
  }, []);

  return (
    <div data-testid="provider-labs" className="provider-appointments-stub">
      <div className="admin-header">
        <div>
          <h1>Labs</h1>
          <p>
            Read-only view of local lab status shells (<code>{LAB_STORE_KEY}</code>). Patients
            request at <Link to="/account/labs">/account/labs</Link>. No fabricated results —{" "}
            {AWAITING_PARTNER_COPY.toLowerCase()}.
          </p>
        </div>
        <Link className="btn btn-primary" to="/admin/labs">
          Open admin labs
        </Link>
      </div>

      <div className="admin-panel">
        <h2>Pending shells ({labs.length})</h2>
        {labs.length === 0 ? (
          <p className="provider-empty" data-testid="provider-labs-empty">
            No lab status shells in this browser yet. Patients can save a pending request from the
            account Labs tab — this portal does not invent assays or result values.
          </p>
        ) : (
          <div className="provider-thread-list">
            {labs.map((lab) => (
              <div key={lab.id} className="provider-thread-card" data-testid="provider-labs-row">
                <strong>
                  {lab.panelLabel} · {LAB_STAGE_LABEL[lab.stage]}
                </strong>
                <span>
                  {lab.patientLabel} · {formatShellTimestamp(lab.createdAt)} · result: none ·{" "}
                  {AWAITING_PARTNER_COPY}
                </span>
                <StatusPipeline
                  steps={LAB_PIPELINE_STAGES}
                  currentId={lab.stage}
                  testId={`provider-labs-pipeline-${lab.id}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
