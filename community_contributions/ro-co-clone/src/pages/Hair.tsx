import { Link } from "react-router-dom";
import "./Category.css";

export function Hair() {
  return (
    <div className="category-page">
      <section className="cat-hero tone-hair">
        <div className="container cat-hero-grid">
          <div>
            <p className="eyebrow">Hair</p>
            <h1>Plans for thinning, shedding, and density goals</h1>
            <p className="lede">
              Category landing recreation with topical/oral combo storytelling and
              a soft clinical tone.
            </p>
            <Link to="/visit" className="btn btn-primary">
              Build a hair plan
            </Link>
          </div>
          <div className="feature-panel">
            <h2>Typical kit building blocks</h2>
            <ul>
              <li>Topical foam or liquid</li>
              <li>Oral support when appropriate</li>
              <li>Progress photos and check-ins</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container three-up">
          {[
            ["Spot thinning", "Focus on crown or hairline patterns."],
            ["Overall shedding", "Understand triggers and routines."],
            ["Maintenance", "Keep gains with a sustainable cadence."],
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
