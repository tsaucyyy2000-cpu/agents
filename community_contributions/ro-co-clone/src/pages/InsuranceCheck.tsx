import { useEffect, useId, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { JourneyRail } from "../components/JourneyRail";
import { useContent } from "../data/ContentContext";
import {
  INSURANCE_STATUS_LABEL,
  INSURANCE_STORE_KEY,
  PAYER_UNVERIFIED_COPY,
  PLAN_TYPE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  SAFE_INSURANCE_NOTIFY,
  createInsuranceInquiry,
  emptyInsuranceDetails,
  formatBytes,
  listInquiriesForPatient,
  maskMemberId,
  noteInsuranceDocStub,
  subscribeInsuranceStore,
  type InsuranceDetails,
  type InsuranceDocStub,
  type InsuranceInquiry,
} from "../insurance/insuranceStore";
import { careAreaFromParam, visitPath } from "../utils/careRoutes";
import "./Flows.css";

const carePath: Record<string, string> = {
  weight: "/weight-loss",
  "sexual-health": "/sexual-health",
  hair: "/hair",
  skin: "/skin",
};

const FUNNEL_PATIENT_KEY = "funnel-guest";

export function InsuranceCheck() {
  const formId = useId();
  const { mediaById } = useContent();
  const [params] = useSearchParams();
  const area = careAreaFromParam(params.get("goal"));
  const productId = params.get("product") ?? undefined;
  const hero = mediaById["insurance-check"];
  const [details, setDetails] = useState<InsuranceDetails>(emptyInsuranceDetails);
  const [docStub, setDocStub] = useState<InsuranceDocStub | null>(null);
  const [attachNotice, setAttachNotice] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<InsuranceInquiry | null>(null);
  const [recent, setRecent] = useState<InsuranceInquiry[]>([]);

  const continueVisit = area
    ? visitPath(area, productId)
    : productId
      ? `/visit?product=${productId}`
      : "/visit";
  const continueCheckout = productId
    ? `/checkout?product=${encodeURIComponent(productId)}`
    : "/checkout";
  const careHref = area ? carePath[area] : "/#find-care";

  function refresh() {
    setRecent(listInquiriesForPatient(FUNNEL_PATIENT_KEY).slice(0, 3));
  }

  useEffect(() => {
    refresh();
    return subscribeInsuranceStore(refresh);
  }, []);

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

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!details.carrier.trim() || !details.memberId.trim()) {
      setError("Enter carrier and member ID placeholders to save a local inquiry.");
      return;
    }
    setError("");
    const inquiry = createInsuranceInquiry({
      patientKey: FUNNEL_PATIENT_KEY,
      patientLabel: "Funnel guest",
      source: "funnel",
      details,
      document: docStub ?? undefined,
    });
    setSaved(inquiry);
    refresh();
  }

  return (
    <div className="flow-page">
      <section className="flow-hero cool">
        <div className="container flow-hero-grid">
          <div>
            <JourneyRail
              steps={[
                { label: "Home", to: "/", done: true },
                { label: "Care", to: careHref, done: true },
                { label: "Coverage", current: true },
                { label: "Visit", to: continueVisit },
              ]}
            />
            <p className="eyebrow">Coverage inquiry · demo</p>
            <h1>Insurance assistance shell</h1>
            <p className="lede">
              Local prototype only—no payer APIs. Save placeholder carrier details for an admin
              review workflow. {PAYER_UNVERIFIED_COPY}. Prefer cash-pay? Use the membership sandbox.
            </p>
          </div>
          {hero ? <img src={hero.src} alt={hero.alt} className="flow-hero-img" /> : null}
        </div>
      </section>

      <section className="section">
        <div className="container flow-form-card ins-funnel-card">
          {saved ? (
            <>
              <p className="ins-secure-pill" role="status">
                Inquiry saved locally · {SAFE_INSURANCE_NOTIFY.inquirySaved}
              </p>
              <h2>Inquiry submitted</h2>
              <p className="lede" data-testid="insurance-funnel-status">
                Status: <strong>{saved.statusLabel}</strong>
              </p>
              <p className="cost-pending" data-testid="insurance-funnel-unverified">
                Payer verified: no. This is not a real eligibility determination. Coverage is never
                claimed without a contracted payer partner.
              </p>
              <p>
                Carrier <strong>{saved.details.carrier}</strong> · Member{" "}
                {maskMemberId(saved.details.memberId)} · stored in{" "}
                <code>{INSURANCE_STORE_KEY}</code>
              </p>
              {saved.documents[0] ? (
                <p className="ins-attach-meta">
                  Document stub: <code>{saved.documents[0].fileName}</code> ·{" "}
                  {formatBytes(saved.documents[0].sizeBytes)} (bytes not stored)
                </p>
              ) : null}
              <div className="cta-row">
                <Link to={continueVisit} className="btn btn-primary">
                  Continue to visit
                </Link>
                <Link to={continueCheckout} className="btn btn-secondary">
                  Jump to plan review
                </Link>
                <Link to="/membership" className="btn btn-secondary" data-testid="funnel-cashpay">
                  Cash-pay membership
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSaved(null);
                    setError("");
                  }}
                >
                  Submit another
                </button>
                <Link to={careHref} className="btn btn-secondary">
                  Back to care
                </Link>
              </div>
            </>
          ) : (
            <form className="flow-form ins-form" onSubmit={onSubmit} noValidate data-testid="funnel-insurance-form">
              <div className="ins-secure-banner">
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
                    Values stay in this browser under <code>{INSURANCE_STORE_KEY}</code>. Starting
                    status: {INSURANCE_STATUS_LABEL.submitted}. No coverage claim.
                  </p>
                </div>
              </div>
              <label>
                Insurance carrier (placeholder)
                <input
                  value={details.carrier}
                  data-testid="funnel-insurance-carrier"
                  aria-invalid={Boolean(error) && !details.carrier.trim()}
                  onChange={(event) => {
                    setDetails((d) => ({ ...d, carrier: event.target.value }));
                    setError("");
                  }}
                  placeholder="Sample Health Plan"
                />
              </label>
              <label>
                Member ID (placeholder)
                <input
                  value={details.memberId}
                  data-testid="funnel-insurance-member"
                  aria-invalid={Boolean(error) && !details.memberId.trim()}
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(event) => {
                    setDetails((d) => ({ ...d, memberId: event.target.value }));
                    setError("");
                  }}
                  placeholder="ABC123"
                />
              </label>
              <label>
                Group number (optional)
                <input
                  value={details.groupNumber}
                  onChange={(event) =>
                    setDetails((d) => ({ ...d, groupNumber: event.target.value }))
                  }
                  placeholder="GRP-000"
                />
              </label>
              <label>
                Plan type (placeholder)
                <select
                  value={details.planType}
                  onChange={(event) => setDetails((d) => ({ ...d, planType: event.target.value }))}
                >
                  {PLAN_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Relationship to subscriber
                <select
                  value={details.relationship}
                  onChange={(event) =>
                    setDetails((d) => ({ ...d, relationship: event.target.value }))
                  }
                >
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <div className="ins-attach">
                <label htmlFor={`${formId}-funnel-file`} className="ins-attach-label">
                  Document upload stub (metadata only)
                  <input
                    id={`${formId}-funnel-file`}
                    type="file"
                    accept="image/*,.pdf"
                    data-testid="funnel-insurance-attach"
                    onChange={(e) => {
                      onPickFile(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
                {docStub ? (
                  <p className="ins-attach-meta">
                    Noted: <code>{docStub.fileName}</code> · {formatBytes(docStub.sizeBytes)}
                  </p>
                ) : null}
                {attachNotice ? (
                  <p className="ins-attach-notice" role="status">
                    {attachNotice}
                  </p>
                ) : (
                  <p className="ins-attach-hint">File bytes are never stored in this demo.</p>
                )}
              </div>
              {error ? (
                <p className="field-error" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="cta-row">
                <button className="btn btn-primary" type="submit" data-testid="funnel-insurance-submit">
                  Save insurance inquiry
                </button>
                <Link to="/membership" className="btn btn-secondary">
                  Prefer cash-pay
                </Link>
                <Link to={continueVisit} className="btn btn-secondary">
                  Skip to visit
                </Link>
                <Link to={careHref} className="btn btn-secondary">
                  Back to care
                </Link>
              </div>
            </form>
          )}

          {recent.length > 0 && !saved ? (
            <div className="ins-recent" data-testid="funnel-insurance-recent">
              <h3>Recent local inquiries</h3>
              <ul>
                {recent.map((inq) => (
                  <li key={inq.id}>
                    {inq.details.carrier} · {inq.statusLabel}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
