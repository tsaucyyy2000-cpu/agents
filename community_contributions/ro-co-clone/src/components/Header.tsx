import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import { careNavKey, FEATURED_LINK_KEYS } from "../i18n/carePaths";
import { LanguageSwitcher } from "../i18n/LanguageSwitcher";
import { quizPath } from "../utils/careRoutes";
import { HeaderAuth } from "./HeaderAuth";
import "./Header.css";

export function Header() {
  const { content } = useContent();
  const { t } = useTranslation(["nav", "common"]);
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [careExpanded, setCareExpanded] = useState(true);
  const drawerId = useId();
  const megaId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const megaTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const closeMenu = () => setOpen(false);
    window.addEventListener("ro-clone:open-consent", closeMenu);
    return () => window.removeEventListener("ro-clone:open-consent", closeMenu);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setOpen(false);
    setMegaOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.classList.add("nav-drawer-open");

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    // Focus close control when drawer opens
    window.requestAnimationFrame(() => closeBtnRef.current?.focus());

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("nav-drawer-open");
      // Consent overlay owns the scroll lock while open — do not clear it.
      if (!document.body.classList.contains("consent-open")) {
        document.body.style.overflow = previousOverflow;
        document.documentElement.style.overflow = previousHtmlOverflow;
      }
      toggleRef.current?.focus();
    };
  }, [open]);

  const openMega = () => {
    if (megaTimer.current) window.clearTimeout(megaTimer.current);
    setMegaOpen(true);
  };

  const closeMegaSoon = () => {
    if (megaTimer.current) window.clearTimeout(megaTimer.current);
    megaTimer.current = window.setTimeout(() => setMegaOpen(false), 120);
  };

  const closeMegaNow = () => {
    if (megaTimer.current) window.clearTimeout(megaTimer.current);
    setMegaOpen(false);
  };

  const categoryByPath = (path: string) =>
    content.categories.find((category) => category.path === path);

  const labelForNav = (path: string, fallback: string) => {
    const key = careNavKey(path);
    return key ? t(`nav:${key}`) : fallback;
  };

  const menuOpenLabel = open ? t("common:a11y.closeMenu") : t("common:a11y.openMenu");

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""} ${megaOpen ? "mega-open" : ""}`}>
      <div className="container header-inner">
        <Link
          to="/"
          className="logo"
          aria-label={t("common:a11y.brandHome", { brand: content.settings.brandName })}
        >
          <span className="logo-mark">{content.settings.brandName}</span>
        </Link>

        <nav
          className="desktop-nav"
          aria-label={t("common:a11y.primaryNav")}
          onMouseEnter={openMega}
          onMouseLeave={closeMegaSoon}
          onFocus={openMega}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              closeMegaNow();
            }
          }}
        >
          {content.nav.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="nav-link"
              aria-haspopup="true"
              aria-controls={megaId}
            >
              {labelForNav(link.to, link.label)}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <LanguageSwitcher />
          <HeaderAuth />
          <Link to="/help" className="nav-link header-help">
            {t("nav:help")}
          </Link>
          <Link to="/#find-care" className="btn btn-primary header-cta">
            {t("common:cta.startQuiz")}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className={`menu-toggle ${open ? "is-open" : ""}`}
            aria-expanded={open}
            aria-controls={drawerId}
            aria-label={menuOpenLabel}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{menuOpenLabel}</span>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        id={megaId}
        className={`mega-panel ${megaOpen ? "is-open" : ""}`}
        aria-hidden={!megaOpen}
        onMouseEnter={openMega}
        onMouseLeave={closeMegaSoon}
      >
        <div className="container mega-inner">
          <div className="mega-categories">
            <p className="mega-kicker">{t("nav:careAreas")}</p>
            <ul>
              {content.nav.map((link) => {
                const category = categoryByPath(link.to);
                const careLabel = labelForNav(link.to, link.label);
                return (
                  <li key={link.to}>
                    <Link to={link.to} className="mega-cat" onClick={closeMegaNow}>
                      <span className="mega-cat-label">{careLabel}</span>
                      <span className="mega-cat-lede">
                        {category?.lede?.slice(0, 72) ?? t("nav:exploreCarePath")}
                        {(category?.lede?.length ?? 0) > 72 ? "…" : ""}
                      </span>
                    </Link>
                    {category ? (
                      <Link
                        to={quizPath(category.slug)}
                        className="mega-cat-quiz"
                        onClick={closeMegaNow}
                      >
                        {t("nav:startCareQuiz", { care: careLabel.toLowerCase() })}
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mega-featured">
            <p className="mega-kicker">{t("nav:featured")}</p>
            <ul>
              {FEATURED_LINK_KEYS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} onClick={closeMegaNow}>
                    {t(`nav:${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/#find-care" className="btn btn-primary mega-cta" onClick={closeMegaNow}>
              {t("common:cta.startQuiz")}
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`drawer-backdrop ${open ? "is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div
        id={drawerId}
        className={`mobile-drawer ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("common:a11y.siteMenu")}
        aria-hidden={!open}
        {...(!open ? { inert: true as const } : {})}
      >
        <div className="drawer-header">
          <span className="drawer-brand">{content.settings.brandName}</span>
          <button
            ref={closeBtnRef}
            type="button"
            className="drawer-close"
            aria-label={t("common:a11y.closeMenu")}
            onClick={() => setOpen(false)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <nav className="drawer-nav" aria-label={t("common:a11y.mobileNav")}>
          <div className="drawer-lang">
            <LanguageSwitcher compact />
          </div>
          <button
            type="button"
            className={`drawer-accordion ${careExpanded ? "is-open" : ""}`}
            aria-expanded={careExpanded}
            onClick={() => setCareExpanded((value) => !value)}
          >
            {t("nav:careAreas")}
            <span className="drawer-chevron" aria-hidden="true" />
          </button>
          <div
            className={`drawer-panel ${careExpanded ? "is-open" : ""}`}
            aria-hidden={!careExpanded}
            {...(!careExpanded ? { inert: true as const } : {})}
          >
            {content.nav.map((link) => {
              const category = categoryByPath(link.to);
              return (
                <div key={link.to} className="drawer-cat-block">
                  <NavLink to={link.to} className="mobile-link" onClick={() => setOpen(false)}>
                    {labelForNav(link.to, link.label)}
                  </NavLink>
                  {category ? (
                    <Link
                      to={quizPath(category.slug)}
                      className="drawer-sublink"
                      onClick={() => setOpen(false)}
                    >
                      {t("common:cta.startQuiz")}
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>

          {FEATURED_LINK_KEYS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="mobile-link"
              onClick={() => setOpen(false)}
            >
              {t(`nav:${link.key}`)}
            </Link>
          ))}

          <HeaderAuth mobile onNavigate={() => setOpen(false)} />

          <Link
            to="/#find-care"
            className="btn btn-primary drawer-cta"
            onClick={() => setOpen(false)}
          >
            {t("common:cta.startQuiz")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
