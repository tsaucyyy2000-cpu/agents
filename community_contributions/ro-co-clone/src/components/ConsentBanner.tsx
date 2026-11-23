import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CONSENT_VERSION,
  hasCurrentSiteConsent,
  readSiteConsent,
  writeSiteConsent,
} from "../utils/siteConsent";
import "./ConsentBanner.css";

function initialVisible() {
  if (typeof window === "undefined") return false;
  return !hasCurrentSiteConsent();
}

export function ConsentBanner() {
  const titleId = useId();
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(initialVisible);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(() => Boolean(readSiteConsent()?.analytics));

  useEffect(() => {
    const onOpen = () => {
      const current = readSiteConsent();
      setAnalytics(Boolean(current?.analytics));
      setShowPrefs(true);
      setVisible(true);
    };
    window.addEventListener("ro-clone:open-consent", onOpen);
    return () => window.removeEventListener("ro-clone:open-consent", onOpen);
  }, []);

  useEffect(() => {
    const chrome = document.querySelector(".site-chrome");
    const main = document.getElementById("main-content");
    const footer = document.querySelector(".site-footer");
    const stickyTargets = document.querySelectorAll(".sticky-mobile-cta");
    const lockTargets = [chrome, main, footer, ...stickyTargets].filter(
      (node): node is Element => node instanceof Element,
    );

    if (!visible) {
      document.body.classList.remove("consent-open");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      for (const node of lockTargets) {
        node.removeAttribute("inert");
      }
      return;
    }

    document.body.classList.add("consent-open");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    for (const node of lockTargets) {
      node.setAttribute("inert", "");
    }
    const timer = window.setTimeout(() => firstActionRef.current?.focus(), 50);
    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("consent-open");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      for (const node of lockTargets) {
        node.removeAttribute("inert");
      }
    };
  }, [visible]);

  function save(choice: { analytics: boolean }) {
    writeSiteConsent({ analytics: choice.analytics, decided: true });
    setVisible(false);
    setShowPrefs(false);
  }

  if (!visible) return null;

  return (
    <div className="consent-root">
      <button
        type="button"
        className="consent-backdrop"
        aria-label="Dismiss is not available — choose a privacy option below"
        tabIndex={-1}
      />
      <div className="consent" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="consent-body">
          <h2 id={titleId}>Privacy & cookie choices</h2>
          <p>
            We store preferences and visit answers in your browser. Nothing is sold. Consent version{" "}
            {CONSENT_VERSION}. See the <Link to="/privacy">privacy note</Link> and{" "}
            <Link to="/cookie-policy">cookie policy</Link>.
          </p>

          {showPrefs ? (
            <div className="consent-prefs">
              <div className="consent-switch-row">
                <div>
                  <b>Essential storage</b>
                  <p>Visit answers and site content edits stay in localStorage.</p>
                </div>
                <label className="consent-switch">
                  <input type="checkbox" checked disabled aria-label="Essential storage always on" />
                  <span />
                </label>
              </div>
              <div className="consent-switch-row">
                <div>
                  <b>Optional analytics</b>
                  <p>No third-party tracker is wired yet. Toggle saves your preference for launch.</p>
                </div>
                <label className="consent-switch">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(event) => setAnalytics(event.target.checked)}
                    aria-label="Optional analytics preference"
                  />
                  <span />
                </label>
              </div>
              <p className="consent-note">
                No Google tags, pixels, or affiliate scripts load until you enable them in a later
                release.
              </p>
            </div>
          ) : null}
        </div>

        <div className="consent-actions">
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
                Accept all
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
