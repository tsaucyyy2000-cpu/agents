import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { readDemoConsent, writeDemoConsent } from "../utils/demoConsent";
import "./DemoConsentBanner.css";

function initialVisible() {
  if (typeof window === "undefined") return false;
  return !readDemoConsent()?.decided;
}

export function DemoConsentBanner() {
  const titleId = useId();
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(initialVisible);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(() => Boolean(readDemoConsent()?.analytics));

  useEffect(() => {
    const onOpen = () => {
      const current = readDemoConsent();
      setAnalytics(Boolean(current?.analytics));
      setShowPrefs(true);
      setVisible(true);
    };
    window.addEventListener("ro-clone:open-consent", onOpen);
    return () => window.removeEventListener("ro-clone:open-consent", onOpen);
  }, []);

  useEffect(() => {
    if (!visible) {
      document.body.classList.remove("consent-open");
      document.body.style.overflow = "";
      return;
    }
    document.body.classList.add("consent-open");
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => firstActionRef.current?.focus(), 50);
    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("consent-open");
      document.body.style.overflow = "";
    };
  }, [visible]);

  function save(choice: { analytics: boolean }) {
    writeDemoConsent({ analytics: choice.analytics, decided: true });
    setVisible(false);
    setShowPrefs(false);
  }

  if (!visible) return null;

  return (
    <div className="demo-consent-root">
      <button
        type="button"
        className="demo-consent-backdrop"
        aria-label="Dismiss is not available — choose a privacy option below"
        tabIndex={-1}
      />
      <div
        className="demo-consent"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="demo-consent-body">
          <h2 id={titleId}>Demo privacy choices</h2>
          <p>
            This local preview stores sample preferences in your browser only. Nothing is sold or
            shared. See the <Link to="/privacy">privacy note</Link> and{" "}
            <Link to="/cookie-policy">cookie policy</Link>.
          </p>

          {showPrefs ? (
            <div className="demo-consent-prefs">
              <div className="demo-switch-row">
                <div>
                  <b>Essential demo storage</b>
                  <p>Visit answers and site content edits stay in localStorage.</p>
                </div>
                <label className="demo-switch">
                  <input type="checkbox" checked disabled aria-label="Essential storage always on" />
                  <span />
                </label>
              </div>
              <div className="demo-switch-row">
                <div>
                  <b>Optional demo analytics (placeholder)</b>
                  <p>No real tracker runs in this preview. Toggle is for layout review only.</p>
                </div>
                <label className="demo-switch">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(event) => setAnalytics(event.target.checked)}
                    aria-label="Optional demo analytics preference"
                  />
                  <span />
                </label>
              </div>
              <p className="demo-consent-note">
                Placeholder · no Google tags, pixels, or affiliate scripts load here.
              </p>
            </div>
          ) : null}
        </div>

        <div className="demo-consent-actions">
          {showPrefs ? (
            <button
              ref={firstActionRef}
              type="button"
              className="btn btn-primary"
              onClick={() => save({ analytics })}
            >
              Save choices
            </button>
          ) : (
            <>
              <button
                ref={firstActionRef}
                type="button"
                className="btn btn-primary"
                data-testid="consent-essential"
                onClick={() => save({ analytics: false })}
              >
                Essential only
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowPrefs(true)}>
                Customize
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => save({ analytics: true })}
              >
                Accept demo prefs
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
