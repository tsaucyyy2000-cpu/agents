import { Link } from "react-router-dom";
import "./Category.css";

export function Skin() {
  return (
    <div className="category-page">
      <section className="cat-hero tone-skin">
        <div className="container cat-hero-grid">
          <div>
            <p className="eyebrow">Skin</p>
            <h1>Clearer, calmer skin with guided routines</h1>
            <p className="lede">
              Soft peach gradients and simple goal cards echo the live marketing
              language without reusing campaign lines.
            </p>
            <Link to="/visit" className="btn btn-primary">
              Start skin visit
            </Link>
          </div>
          <div className="feature-panel">
            <h2>Common goals</h2>
            <ul>
              <li>Texture and tone</li>
              <li>Breakout cycles</li>
              <li>Aging and firmness</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container three-up">
          {[
            ["Assess", "Share photos and history in a short flow."],
            ["Personalize", "Clinician suggests an Rx/OTC mix when needed."],
            ["Refine", "Adjust the routine as skin responds."],
          ].map(([title, copy]) => (
            <article key={title} className="plain-card">
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
