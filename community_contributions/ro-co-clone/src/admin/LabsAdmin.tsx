import { useEffect, useState } from "react";
import { StatusPipeline } from "../labPharmacy/StatusPipeline";
import {
  LAB_STORE_KEY,
  LocalDemoLabAdapter,
  formatShellTimestamp,
  listAllLabs,
  subscribeLabStore,
} from "../labPharmacy/labPharmacyStore";
import {
  AWAITING_PARTNER_COPY,
  LAB_PIPELINE_STAGES,
  LAB_STAGE_LABEL,
  type LabPipelineStage,
  type LabShellRecord,
} from "../labPharmacy/types";

const STAGE_OPTIONS: Array<"all" | LabPipelineStage> = [
  "all",
  "requested",
  "ordered",
  "specimen",
  "result_review",
];

/**
 * Admin read-only lab status queue.
 * Does not advance stages or invent result payloads.
 */
export function LabsAdmin() {
  const [labs, setLabs] = useState<LabShellRecord[]>([]);
  const [filter, setFilter] = useState<"all" | LabPipelineStage>("all");

  function refresh() {
    setLabs(listAllLabs());
  }

  useEffect(() => {
    refresh();
    return subscribeLabStore(refresh);
  }, []);

  const filtered = filter === "all" ? labs : labs.filter((l) => l.stage === filter);

  return (
    <div data-testid="admin-labs">
      <div className="admin-header">
        <div>
          <h1>Labs</h1>
          <p>
            Read-only queue of lab status shells in <code>{LAB_STORE_KEY}</code>. Adapter{" "}
            <code>{LocalDemoLabAdapter.id}</code> is non-operational — no fabricated results, no
            stage mutation from admin.
          </p>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <span>Pending shells</span>
          <strong>{labs.length}</strong>
        </div>
        <div className="admin-card">
          <span>With results</span>
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
              data-testid="admin-labs-filter"
              onChange={(e) => setFilter(e.target.value as "all" | LabPipelineStage)}
            >
              {STAGE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All" : LAB_STAGE_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filtered.length === 0 ? (
          <p className="admin-msg-hint" data-testid="admin-labs-empty">
            No lab status shells in this filter. Patient requests from{" "}
            <code>/account/labs</code> appear here in the same browser. This queue does not invent
            assays or result values.
          </p>
        ) : (
          <ul className="admin-appt-list">
            {filtered.map((lab) => (
              <li key={lab.id} className="admin-appt-row" data-testid="admin-labs-row">
                <div className="admin-appt-main">
                  <strong>{lab.panelLabel}</strong>
                  <span className="admin-msg-patient">
                    {lab.patientLabel}
                    {lab.patientKey ? <span> · {lab.patientKey}</span> : null}
                  </span>
                  <span>
                    {LAB_STAGE_LABEL[lab.stage]} · {formatShellTimestamp(lab.createdAt)} · result:
                    none
                  </span>
                  <StatusPipeline
                    steps={LAB_PIPELINE_STAGES}
                    currentId={lab.stage}
                    testId={`admin-labs-pipeline-${lab.id}`}
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
