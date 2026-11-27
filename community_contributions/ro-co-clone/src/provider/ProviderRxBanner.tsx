/**
 * Persistent honesty banner: this shell cannot prescribe or issue Rx.
 */
export function ProviderRxBanner() {
  return (
    <div className="provider-rx-banner" role="status" data-testid="provider-rx-banner">
      <strong>Cannot prescribe / issue Rx.</strong> This provider shell is a demo worklist only —
      not a clinical system of record, not licensed e-prescribe infrastructure, and not a
      substitute for a real clinician workflow.
    </div>
  );
}
