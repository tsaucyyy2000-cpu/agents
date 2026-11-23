import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import { quizPath } from "../utils/careRoutes";
import { HeaderAuth } from "./HeaderAuth";
import "./Header.css";

const FEATURED_LINKS = [
  { to: "/how-it-works", label: "How care works" },
  { to: "/guides", label: "Health guides" },
  { to: "/help", label: "Help center" },
  { to: "/#find-care", label: "Choose care area" },
] as const;

export function Header() {
  const { content } = useContent();
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

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""} ${megaOpen ? "mega-open" : ""}`}>
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label={`${content.settings.brandName} home`}>
          <span className="logo-mark">{content.settings.brandName}</span>
        </Link>

        <nav
          className="desktop-nav"
          aria-label="Primary"
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
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <HeaderAuth />
          <Link to="/help" className="nav-link header-help">
            Help
          </Link>
          <Link to="/#find-care" className="btn btn-primary header-cta">
            Start quiz
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className={`menu-toggle ${open ? "is-open" : ""}`}
            aria-expanded={open}
            aria-controls={drawerId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
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
            <p className="mega-kicker">Care areas</p>
            <ul>
              {content.nav.map((link) => {
                const category = categoryByPath(link.to);
                return (
                  <li key={link.to}>
                    <Link to={link.to} className="mega-cat" onClick={closeMegaNow}>
                      <span className="mega-cat-label">{link.label}</span>
                      <span className="mega-cat-lede">
                        {category?.lede?.slice(0, 72) ?? "Explore this care path"}
                        {(category?.lede?.length ?? 0) > 72 ? "…" : ""}
                      </span>
                    </Link>
                    {category ? (
                      <Link
                        to={quizPath(category.slug)}
                        className="mega-cat-quiz"
                        onClick={closeMegaNow}
                      >
                        Start {link.label.toLowerCase()} quiz
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mega-featured">
            <p className="mega-kicker">Featured</p>
            <ul>
              {FEATURED_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} onClick={closeMegaNow}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/#find-care" className="btn btn-primary mega-cta" onClick={closeMegaNow}>
              Start quiz
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
        aria-label="Site menu"
        aria-hidden={!open}
        {...(!open ? { inert: true as const } : {})}
      >
        <div className="drawer-header">
          <span className="drawer-brand">{content.settings.brandName}</span>
          <button
            ref={closeBtnRef}
            type="button"
            className="drawer-close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <nav className="drawer-nav" aria-label="Mobile">
          <button
            type="button"
            className={`drawer-accordion ${careExpanded ? "is-open" : ""}`}
            aria-expanded={careExpanded}
            onClick={() => setCareExpanded((value) => !value)}
          >
            Care areas
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
                    {link.label}
                  </NavLink>
                  {category ? (
                    <Link
                      to={quizPath(category.slug)}
                      className="drawer-sublink"
                      onClick={() => setOpen(false)}
                    >
                      Start quiz
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>

          {FEATURED_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="mobile-link"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <HeaderAuth mobile onNavigate={() => setOpen(false)} />

          <Link
            to="/#find-care"
            className="btn btn-primary drawer-cta"
            onClick={() => setOpen(false)}
          >
            Start quiz
          </Link>
        </nav>
      </div>
    </header>
  );
}
