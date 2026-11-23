import { Link } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import "./InfoPage.css";

export function NotFound() {
  const { content } = useContent();

  return (
    <div className="info-page not-found-page">
      <header className="info-page-head">
        <div className="container info-shell">
          <p className="eyebrow">404 · Demo</p>
          <h1>Page not found</h1>
          <p className="lede">
            That path is not part of this local preview. Head home or pick a care area to continue
            the demo funnel.
          </p>
        </div>
      </header>

      <div className="container info-shell">
        <div className="info-prose">
          <div className="hero-actions info-actions">
            <Link to="/" className="btn btn-primary">
              Back home
            </Link>
            <Link to="/#find-care" className="btn btn-secondary">
              Choose a care area
            </Link>
          </div>

          <section className="info-section" aria-label="Care areas">
            <h2>Treatments / care</h2>
            <ul className="not-found-care-list">
              {content.nav.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
