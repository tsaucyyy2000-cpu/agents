import { useEffect, useState } from "react";
import {
  INSURANCE_STATUS_LABEL,
  INSURANCE_STATUS_OPTIONS,
  INSURANCE_STORE_KEY,
  PAYER_UNVERIFIED_COPY,
  SAFE_INSURANCE_NOTIFY,
  formatBytes,
  formatInsuranceTimestamp,
  listAllInquiries,
  maskMemberId,
  setInquiryStatus,
  subscribeInsuranceStore,
  type InsuranceInquiry,
  type InsuranceReviewStatus,
} from "../insurance/insuranceStore";

const FILTER_OPTIONS: Array<"all" | InsuranceReviewStatus> = ["all", ...INSURANCE_STATUS_OPTIONS];

/**
 * Admin coverage-review workflow queue.
 * Statuses are demo/admin labeled only — never claim coverage or eligibility.
 */
export function InsuranceAdmin() {
  const [inquiries, setInquiries] = useState<InsuranceInquiry[]>([]);
  const [filter, setFilter] = useState<"all" | InsuranceReviewStatus>("all");
  const [toast, setToast] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  function refresh() {
    setInquiries(listAllInquiries());
  }

  useEffect(() => {
    refresh();
    return subscribeInsuranceStore(refresh);
  }, []);

  function flash(safeCopy: string) {
    setToast(safeCopy);
    window.setTimeout(() => setToast(null), 2800);
  }

  const filtered =
    filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);

  const submittedCount = inquiries.filter((i) => i.status === "submitted").length;
  const reviewCount = inquiries.filter((i) => i.status === "under_review").length;
  const closedCount = inquiries.filter((i) => i.status === "closed").length;

  function handleStatus(id: string, status: InsuranceReviewStatus) {
    setInquiryStatus(id, status, notes[id]);
    refresh();
    flash(SAFE_INSURANCE_NOTIFY.statusUpdated);
  }

  return (
    <div data-testid="admin-insurance">
      <div className="admin-header">
        <div>
          <h1>Insurance</h1>
          <p>
            Coverage-review workflow queue stored in <code>{INSURANCE_STORE_KEY}</code> only.
            Statuses are <strong>admin / demo labeled</strong> — {PAYER_UNVERIFIED_COPY.toLowerCase()}
            . This queue never marks inquiries as approved, covered, or eligible.
          </p>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <span>Submitted</span>
          <strong>{submittedCount}</strong>
        </div>
        <div className="admin-card">
          <span>Under review</span>
          <strong>{reviewCount}</strong>
        </div>
        <div className="admin-card">
          <span>Closed (no determination)</span>
          <strong>{closedCount}</strong>
        </div>
        <div className="admin-card">
          <span>Payer verified</span>
          <strong>0</strong>
        </div>
      </div>

      {toast ? (
        <p className="admin-msg-toast" role="status" data-testid="admin-insurance-toast">
          {toast}
        </p>
      ) : null}

      <div className="admin-card admin-appt-shell">
        <div className="admin-msg-filters">
          <label>
            Status
            <select
              value={filter}
              data-testid="admin-insurance-filter"
              onChange={(e) => setFilter(e.target.value as "all" | InsuranceReviewStatus)}
            >
              {FILTER_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All" : INSURANCE_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filtered.length === 0 ? (
          <p className="admin-msg-hint" data-testid="admin-insurance-empty">
            No insurance inquiries in this filter. Patient saves from{" "}
            <code>/account/insurance</code> or the funnel <code>/insurance-check</code> appear here
            in the same browser. This queue does not invent coverage decisions.
          </p>
        ) : (
          <ul className="admin-appt-list">
            {filtered.map((inq) => (
              <li key={inq.id} className="admin-appt-row" data-testid="admin-insurance-row">
                <div className="admin-appt-main">
                  <strong>{inq.details.carrier || "Carrier placeholder"}</strong>
                  <span className="admin-msg-patient">
                    {inq.patientLabel}
                    {inq.patientKey ? <span> · {inq.patientKey}</span> : null}
                  </span>
                  <span>
                    Member {maskMemberId(inq.details.memberId)}
                    {inq.details.groupNumber ? ` · Group ${inq.details.groupNumber}` : ""} ·{" "}
                    {inq.details.planType} · {inq.source} ·{" "}
                    {formatInsuranceTimestamp(inq.updatedAt)}
                  </span>
                  <span data-testid="admin-insurance-payer">
                    Payer verified: no · operational: false
                  </span>
                  {inq.documents.length > 0 ? (
                    <span>
                      Docs:{" "}
                      {inq.documents
                        .map((d) => `${d.fileName} (${formatBytes(d.sizeBytes)})`)
                        .join("; ")}{" "}
                      — bytes not stored
                    </span>
                  ) : (
                    <span>Docs: none</span>
                  )}
                  <label className="admin-ins-note">
                    Admin demo note (optional)
                    <input
                      value={notes[inq.id] ?? inq.adminNote}
                      data-testid={`admin-insurance-note-${inq.id}`}
                      placeholder="Logistics only — not an eligibility ruling"
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [inq.id]: e.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="admin-appt-actions">
                  <span className="account-chip account-chip-warn" data-testid="admin-insurance-status">
                    {inq.statusLabel}
                  </span>
                  {INSURANCE_STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className="btn btn-ghost"
                      data-testid={`admin-insurance-set-${status}`}
                      disabled={inq.status === status}
                      onClick={() => handleStatus(inq.id, status)}
                    >
                      {status === "under_review"
                        ? "Under review"
                        : status === "needs_documents"
                          ? "Needs docs"
                          : status === "info_incomplete"
                            ? "Incomplete"
                            : status === "closed"
                              ? "Close (no determination)"
                              : "Submitted"}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
