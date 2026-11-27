import { useEffect, useId, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { AccountEmptyState } from "./AccountEmptyState";
import {
  INSURANCE_STATUS_LABEL,
  INSURANCE_STORE_KEY,
  PAYER_UNVERIFIED_COPY,
  PLAN_TYPE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  SAFE_INSURANCE_NOTIFY,
  addInquiryDocument,
  createInsuranceInquiry,
  emptyInsuranceDetails,
  formatBytes,
  formatInsuranceTimestamp,
  listInquiriesForPatient,
  maskMemberId,
  noteInsuranceDocStub,
  subscribeInsuranceStore,
  type InsuranceDetails,
  type InsuranceDocStub,
  type InsuranceInquiry,
} from "../insurance/insuranceStore";

type AccountInsuranceProps = {
  patientKey: string;
  patientLabel: string;
  preview?: boolean;
};

export function AccountInsurance({
  patientKey,
  patientLabel,
  preview = false,
}: AccountInsuranceProps) {
  const formId = useId();
  const [inquiries, setInquiries] = useState<InsuranceInquiry[]>([]);
  const [details, setDetails] = useState<InsuranceDetails>(emptyInsuranceDetails);
  const [docStub, setDocStub] = useState<InsuranceDocStub | null>(null);
  const [attachNotice, setAttachNotice] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function refresh() {
    setInquiries(listInquiriesForPatient(patientKey));
  }

  useEffect(() => {
    refresh();
    return subscribeInsuranceStore(refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh closes over patientKey
  }, [patientKey]);

  function flash(safeCopy: string) {
    setToast(safeCopy);
    window.setTimeout(() => setToast(null), 3200);
  }

  function onPickFile(files: FileList | null) {
    const result = noteInsuranceDocStub(files?.[0]);
    if (!result.ok) {
      setDocStub(null);
      setAttachNotice(result.notice);
      return;
    }
    setDocStub(result.meta);
    setAttachNotice(result.notice);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!details.carrier.trim() || !details.memberId.trim()) {
      setError("Enter carrier and member ID placeholders to save a local inquiry.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      createInsuranceInquiry({
        patientKey,
        patientLabel,
        source: "account",
        details,
        document: docStub ?? undefined,
      });
      refresh();
      setDetails(emptyInsuranceDetails());
      setDocStub(null);
      setAttachNotice(null);
      setShowForm(false);
      flash(SAFE_INSURANCE_NOTIFY.inquirySaved);
    } finally {
      setBusy(false);
    }
  }

  function handleAddDoc(inquiryId: string, files: FileList | null) {
    const result = noteInsuranceDocStub(files?.[0]);
    if (!result.ok) {
      flash(result.notice);
      return;
    }
    addInquiryDocument(inquiryId, result.meta);
    refresh();
    flash(result.notice);
  }

  return (
    <div className="account-section" data-testid="account-insurance">
      <header className="account-section-head">
        <p className="section-kicker">Insurance</p>
        <h2>Insurance assistance</h2>
        <p>
          Secure-looking inquiry form for coverage review workflow practice. Details stay in{" "}
          <code>{INSURANCE_STORE_KEY}</code> on this browser only — no payer API, no eligibility
          determination, and <strong>coverage is never claimed</strong> without a verified payer
          partner.
        </p>
        <div className="account-chip-row">
          <span className="account-chip account-chip-warn">Demo · non-operational</span>
          <span className="account-chip account-chip-peach" data-testid="insurance-payer-chip">
            {PAYER_UNVERIFIED_COPY}
          </span>
          {preview ? <span className="account-chip account-chip-mint">Design preview</span> : null}
        </div>
      </header>

      {toast ? (
        <p className="msg-toast" role="status" data-testid="insurance-toast">
          {toast}
        </p>
      ) : null}

      <div className="account-card ins-cashpay-card" data-testid="insurance-cashpay">
        <h3>Prefer cash-pay?</h3>
        <p className="account-card-lede">
          Skip insurance review and compare placeholder membership plans in the sandbox. Pricing
          stays pending verification — no live billing.
        </p>
        <div className="account-toolbar">
          <Link className="btn btn-primary" to="/membership" data-testid="insurance-cashpay-link">
            View membership sandbox
          </Link>
          <Link className="btn btn-ghost" to="/membership/checkout">
            Sandbox checkout
          </Link>
        </div>
      </div>

      {!showForm && inquiries.length > 0 ? (
        <div className="account-toolbar" style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            className="btn btn-secondary"
            data-testid="insurance-new-inquiry"
            onClick={() => setShowForm(true)}
          >
            New insurance inquiry
          </button>
        </div>
      ) : null}

      {(showForm || inquiries.length === 0) && (
        <div className="account-card ins-secure-card" data-testid="insurance-form-card">
          <div className="ins-secure-banner" role="status">
            <span className="ins-lock" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M8 11V8a4 4 0 0 1 8 0v3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div>
              <strong>Local secure form metaphor</strong>
              <p>
                Fields look like a benefits intake, but values never leave this browser. Clearing
                site data deletes them. Not HIPAA-ready storage.
              </p>
            </div>
          </div>
          <h3>Insurance details</h3>
          <p className="account-card-lede">
            Submitting creates a local inquiry at{" "}
            <em>{INSURANCE_STATUS_LABEL.submitted}</em>. Admin can move demo statuses later —
            none of those statuses mean covered or approved.
          </p>
          <form className="ins-form" onSubmit={handleSubmit} noValidate data-testid="insurance-form">
            <div className="ins-form-grid">
              <label htmlFor={`${formId}-carrier`}>
                Insurance carrier
                <input
                  id={`${formId}-carrier`}
                  value={details.carrier}
                  data-testid="insurance-carrier"
                  aria-invalid={Boolean(error) && !details.carrier.trim()}
                  autoComplete="organization"
                  placeholder="Sample Health Plan"
                  onChange={(e) => {
                    setDetails((d) => ({ ...d, carrier: e.target.value }));
                    setError("");
                  }}
                />
              </label>
              <label htmlFor={`${formId}-member`}>
                Member ID
                <input
                  id={`${formId}-member`}
                  value={details.memberId}
                  data-testid="insurance-member-id"
                  aria-invalid={Boolean(error) && !details.memberId.trim()}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="ABC123"
                  onChange={(e) => {
                    setDetails((d) => ({ ...d, memberId: e.target.value }));
                    setError("");
                  }}
                />
              </label>
              <label htmlFor={`${formId}-group`}>
                Group number (optional)
                <input
                  id={`${formId}-group`}
                  value={details.groupNumber}
                  data-testid="insurance-group"
                  autoComplete="off"
                  placeholder="GRP-000"
                  onChange={(e) => setDetails((d) => ({ ...d, groupNumber: e.target.value }))}
                />
              </label>
              <label htmlFor={`${formId}-subscriber`}>
                Subscriber name
                <input
                  id={`${formId}-subscriber`}
                  value={details.subscriberName}
                  data-testid="insurance-subscriber"
                  autoComplete="name"
                  placeholder="As shown on card"
                  onChange={(e) => setDetails((d) => ({ ...d, subscriberName: e.target.value }))}
                />
              </label>
              <label htmlFor={`${formId}-plan`}>
                Plan type (placeholder)
                <select
                  id={`${formId}-plan`}
                  value={details.planType}
                  data-testid="insurance-plan-type"
                  onChange={(e) => setDetails((d) => ({ ...d, planType: e.target.value }))}
                >
                  {PLAN_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor={`${formId}-rel`}>
                Relationship to subscriber
                <select
                  id={`${formId}-rel`}
                  value={details.relationship}
                  data-testid="insurance-relationship"
                  onChange={(e) => setDetails((d) => ({ ...d, relationship: e.target.value }))}
                >
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label htmlFor={`${formId}-notes`}>
              Notes for admin review (optional)
              <textarea
                id={`${formId}-notes`}
                value={details.notes}
                data-testid="insurance-notes"
                rows={3}
                placeholder="Logistics only — avoid clinical detail in this demo store."
                onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))}
              />
            </label>

            <div className="ins-attach" data-testid="insurance-attach">
              <label htmlFor={`${formId}-file`} className="ins-attach-label">
                Document upload stub (metadata only)
                <input
                  id={`${formId}-file`}
                  type="file"
                  accept="image/*,.pdf"
                  data-testid="insurance-attach-input"
                  onChange={(e) => {
                    onPickFile(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              {docStub ? (
                <p className="ins-attach-meta">
                  Noted: <code>{docStub.fileName}</code> · {formatBytes(docStub.sizeBytes)} ·{" "}
                  {docStub.mimeType}
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setDocStub(null);
                      setAttachNotice(null);
                    }}
                  >
                    Remove stub
                  </button>
                </p>
              ) : null}
              {attachNotice ? (
                <p className="ins-attach-notice" role="status" data-testid="insurance-attach-notice">
                  {attachNotice}
                </p>
              ) : (
                <p className="ins-attach-hint">
                  Card photos and EOBs are filename stubs only. File bytes are never read or stored.
                </p>
              )}
            </div>

            {error ? (
              <p className="field-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="account-toolbar">
              <button
                type="submit"
                className="btn btn-primary"
                data-testid="insurance-submit"
                disabled={busy}
              >
                Save insurance inquiry
              </button>
              {inquiries.length > 0 ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>
      )}

      {inquiries.length === 0 && !showForm ? (
        <AccountEmptyState
          testId="account-insurance-empty"
          kicker="Coming when a payer partner is live"
          title="No insurance inquiries yet"
          body="Save placeholder carrier details above to practice the coverage-review workflow. Until a verified payer is connected, statuses stay admin/demo labeled and never claim coverage."
          ctas={[
            { to: "/membership", label: "Cash-pay membership", primary: true },
            { to: "/insurance-check", label: "Funnel coverage check" },
            { to: "/help", label: "Help center" },
          ]}
        />
      ) : (
        <ul className="lp-card-list" data-testid="insurance-list">
          {inquiries.map((inq) => (
            <li key={inq.id} className="account-card lp-status-card" data-testid="insurance-item">
              <div className="lp-status-head">
                <div>
                  <strong>{inq.details.carrier || "Carrier placeholder"}</strong>
                  <p>
                    Member {maskMemberId(inq.details.memberId)}
                    {inq.details.groupNumber ? ` · Group ${inq.details.groupNumber}` : ""} ·{" "}
                    {inq.details.planType} · Saved {formatInsuranceTimestamp(inq.createdAt)}
                  </p>
                </div>
                <span
                  className="account-chip account-chip-warn"
                  data-testid="insurance-status-chip"
                >
                  {inq.statusLabel}
                </span>
              </div>
              <p className="ins-payer-note" data-testid="insurance-unverified">
                Payer verified: <strong>no</strong> · {PAYER_UNVERIFIED_COPY}
              </p>
              {inq.details.subscriberName ? (
                <p className="ins-meta-line">Subscriber: {inq.details.subscriberName}</p>
              ) : null}
              {inq.adminNote ? (
                <p className="ins-meta-line">
                  Admin demo note: {inq.adminNote}
                </p>
              ) : null}

              <div className="ins-docs" data-testid={`insurance-docs-${inq.id}`}>
                <h4>Documents (stubs)</h4>
                {inq.documents.length === 0 ? (
                  <p className="ins-attach-hint">No document stubs yet.</p>
                ) : (
                  <ul>
                    {inq.documents.map((doc, i) => (
                      <li key={`${doc.fileName}-${i}`}>
                        <code>{doc.fileName}</code> · {formatBytes(doc.sizeBytes)} ·{" "}
                        {doc.mimeType} (bytes not stored)
                      </li>
                    ))}
                  </ul>
                )}
                <label className="ins-attach-label">
                  Add document stub
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    data-testid={`insurance-add-doc-${inq.id}`}
                    onChange={(e) => {
                      handleAddDoc(inq.id, e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="callout warn">
        <p>
          <strong>Honesty note:</strong> Inquiries live only in this browser under{" "}
          <code>{INSURANCE_STORE_KEY}</code>. Admin status chips are demo workflow labels — not
          coverage, prior-auth, or benefits decisions. Prefer cash-pay via the{" "}
          <Link to="/membership">membership sandbox</Link> when you do not want an insurance
          inquiry.
        </p>
      </div>
    </div>
  );
}
