import { Link, Navigate, useParams } from "react-router-dom";
import { getIsi, isiDocuments } from "../data/isi";
import "./InfoPage.css";
import "./Isi.css";

export function IsiPage() {
  const { slug = "" } = useParams();
  const doc = getIsi(slug);

  if (!doc) {
    return <Navigate to="/safety" replace />;
  }

  return (
    <div className="info-page isi-page">
      <header className="info-page-head">
        <div className="container info-shell">
          <p className="eyebrow">
            <Link to="/safety">Safety</Link> / ISI stub
          </p>
          <h1>{doc.title}</h1>
          <p className="lede">Applies to: {doc.appliesTo}</p>
          <p className="info-updated">
            Illustrative placeholder copy · re-verify before launch · not FDA labeling
          </p>
        </div>
      </header>

      <div className="container info-shell">
        <nav className="isi-chip-nav" aria-label="ISI sections">
          {doc.sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.heading.split(":")[0]}
            </a>
          ))}
        </nav>

        <div className="info-prose">
          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} className="info-section isi-section">
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets && section.bullets.length > 0 ? (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <div className="callout warn">
            <p>
              This is not complete prescribing information. Replace with counsel- and
              clinician-reviewed content before any real launch.
            </p>
          </div>

          <div className="hero-actions info-actions">
            <Link to="/safety" className="btn btn-primary">
              Safety hub
            </Link>
            <Link to="/visit" className="btn btn-secondary">
              Visit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SafetyHubLinks() {
  return (
    <ul className="isi-hub-list">
      {isiDocuments.map((doc) => (
        <li key={doc.slug}>
          <Link to={`/isi/${doc.slug}`}>{doc.title}</Link>
          <span>{doc.appliesTo}</span>
        </li>
      ))}
    </ul>
  );
}
