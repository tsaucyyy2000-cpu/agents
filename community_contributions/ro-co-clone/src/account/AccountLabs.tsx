import { useEffect, useState } from "react";
import { AccountEmptyState } from "./AccountEmptyState";
import { StatusPipeline } from "../labPharmacy/StatusPipeline";
import {
  LAB_STORE_KEY,
  LocalDemoLabAdapter,
  createLabShellRequest,
  formatShellTimestamp,
  listLabsForPatient,
  subscribeLabStore,
} from "../labPharmacy/labPharmacyStore";
import {
  AWAITING_PARTNER_COPY,
  LAB_PANEL_OPTIONS,
  LAB_PIPELINE_STAGES,
  SAFE_LAB_PHARMACY_NOTIFY,
  type LabShellRecord,
} from "../labPharmacy/types";

type AccountLabsProps = {
  patientKey: string;
  patientLabel: string;
  preview?: boolean;
};

export function AccountLabs({ patientKey, patientLabel, preview = false }: AccountLabsProps) {
  const [labs, setLabs] = useState<LabShellRecord[]>([]);
  const [panelLabel, setPanelLabel] = useState<string>(LAB_PANEL_OPTIONS[0].label);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function refresh() {
    setLabs(listLabsForPatient(patientKey));
  }

  useEffect(() => {
    refresh();
    return subscribeLabStore(refresh);
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
      await createLabShellRequest({ patientKey, patientLabel, panelLabel });
      refresh();
      flash(SAFE_LAB_PHARMACY_NOTIFY.labRequested);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="account-section" data-testid="account-labs">
      <header className="account-section-head">
        <p className="section-kicker">Labs</p>
        <h2>Lab status</h2>
        <p>
          Pipeline shell for requested → ordered → specimen → result review. Demo adapter{" "}
          <code>{LocalDemoLabAdapter.id}</code> is <strong>non-operational</strong> — stored in{" "}
          <code>{LAB_STORE_KEY}</code> only. This page never shows fabricated lab results.
        </p>
        <div className="account-chip-row">
          <span className="account-chip account-chip-warn">Demo · non-operational</span>
          <span className="account-chip account-chip-mint">{AWAITING_PARTNER_COPY}</span>
          {preview ? <span className="account-chip account-chip-peach">Design preview</span> : null}
        </div>
      </header>

      {toast ? (
        <p className="msg-toast" role="status" data-testid="labs-toast">
          {toast}
        </p>
      ) : null}

      <div className="account-card lp-request-card" data-testid="labs-request-form">
        <h3>Request a lab status shell</h3>
        <p className="account-card-lede">
          Creates a local pending record at the Requested stage. Later stages stay labeled{" "}
          {AWAITING_PARTNER_COPY.toLowerCase()} — no CLIA partner, no result values.
        </p>
        <label className="lp-field">
          Panel metaphor
          <select
            value={panelLabel}
            data-testid="labs-panel-select"
            onChange={(e) => setPanelLabel(e.target.value)}
          >
            {LAB_PANEL_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn-primary"
          data-testid="labs-request-btn"
          disabled={busy}
          onClick={() => {
            void handleRequest();
          }}
        >
          Save pending lab request
        </button>
      </div>

      {labs.length === 0 ? (
        <AccountEmptyState
          testId="account-labs-empty"
          kicker="Coming when integrations live"
          title="No lab status to show"
          body="When a lab partner is connected, orders and result review will appear here. Until then, requests stay pending with no fabricated results."
          ctas={[
            { to: "/visit", label: "Visit intake", primary: true },
            { to: "/how-it-works", label: "How care works" },
            { to: "/guides", label: "Health guides" },
          ]}
        />
      ) : (
        <ul className="lp-card-list" data-testid="labs-list">
          {labs.map((lab) => (
            <li key={lab.id} className="account-card lp-status-card" data-testid="labs-item">
              <div className="lp-status-head">
                <div>
                  <strong>{lab.panelLabel}</strong>
                  <p>
                    Saved {formatShellTimestamp(lab.createdAt)} · adapter non-operational · result
                    payload: none
                  </p>
                </div>
                <span className="account-chip account-chip-warn" data-testid="labs-partner-chip">
                  {AWAITING_PARTNER_COPY}
                </span>
              </div>
              <StatusPipeline
                steps={LAB_PIPELINE_STAGES}
                currentId={lab.stage}
                testId={`labs-pipeline-${lab.id}`}
                footerNote="Result review never invents values. Partner integration required before any assay data appears."
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
