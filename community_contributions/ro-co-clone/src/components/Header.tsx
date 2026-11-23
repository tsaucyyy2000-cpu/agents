import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import "./Header.css";

export function Header() {
  const { content } = useContent();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      // Consent overlay owns the scroll lock while open — do not clear it.
      if (!document.body.classList.contains("consent-open")) {
        document.body.style.overflow = "";
      }
    };
  }, [open]);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label={`${content.settings.brandName} home`}>
          <span className="logo-mark">{content.settings.brandName}</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary">
          {content.nav.map((link) => (
            <NavLink key={link.to} to={link.to} className="nav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <Link to="/help" className="nav-link header-help">
            Help
          </Link>
          <Link to="/#find-care" className="btn btn-primary header-cta">
            Start demo quiz
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">Menu</span>
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`mobile-menu ${open ? "is-open" : ""}`}
        hidden={!open}
        aria-hidden={!open}
      >
        <nav aria-label="Mobile">
          {content.nav.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="mobile-link"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/how-it-works" className="mobile-link" onClick={() => setOpen(false)}>
            How care works
          </Link>
          <Link to="/help" className="mobile-link" onClick={() => setOpen(false)}>
            Help center
          </Link>
          <Link to="/#find-care" className="mobile-link" onClick={() => setOpen(false)}>
            Choose care area
          </Link>
          <Link to="/#find-care" className="btn btn-primary" onClick={() => setOpen(false)}>
            Start demo quiz
          </Link>
        </nav>
      </div>
    </header>
  );
}
