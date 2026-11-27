import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("common");
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
        aria-label={t("consent.dismissUnavailable")}
        tabIndex={-1}
      />
      <div className="consent" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="consent-body">
          <h2 id={titleId}>{t("consent.title")}</h2>
          <p>
            {t("consent.bodyBefore", { version: CONSENT_VERSION })}{" "}
            <Link to="/privacy">{t("consent.privacyLink")}</Link> {t("consent.bodyMid")}{" "}
            <Link to="/cookie-policy">{t("consent.cookieLink")}</Link>.
          </p>

          {showPrefs ? (
            <div className="consent-prefs">
              <div className="consent-switch-row">
                <div>
                  <b>{t("consent.essentialStorage")}</b>
                  <p>{t("consent.essentialStorageHint")}</p>
                </div>
                <label className="consent-switch">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    aria-label={t("consent.essentialAlwaysOn")}
                  />
                  <span />
                </label>
              </div>
              <div className="consent-switch-row">
                <div>
                  <b>{t("consent.optionalAnalytics")}</b>
                  <p>{t("consent.optionalAnalyticsHint")}</p>
                </div>
                <label className="consent-switch">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(event) => setAnalytics(event.target.checked)}
                    aria-label={t("consent.optionalAnalyticsLabel")}
                  />
                  <span />
                </label>
              </div>
              <p className="consent-note">{t("consent.note")}</p>
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
              {t("consent.saveChoices")}
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
                {t("consent.essentialOnly")}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowPrefs(true)}>
                {t("consent.customize")}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => save({ analytics: true })}
              >
                {t("consent.acceptAll")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
