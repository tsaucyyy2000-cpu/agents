import { Link } from "react-router-dom";
import "./Category.css";

const options = [
  {
    title: "Fast dual-action dissolvable",
    copy: "Built for shorter lead times and longer windows—structure only.",
  },
  {
    title: "Daily gummy routine",
    copy: "A steady cadence for people who prefer not to plan around a dose.",
  },
  {
    title: "Classic on-demand tablet",
    copy: "Familiar timing profile with clear safety callouts on the live site.",
  },
  {
    title: "Longer-lasting tablet",
    copy: "Another common pathway presented in a comparable product card.",
  },
];

export function SexualHealth() {
  return (
    <div className="category-page">
      <section className="cat-hero tone-sex">
        <div className="container cat-hero-grid">
          <div>
            <p className="eyebrow">Sexual health</p>
            <h1>Discrete care that fits real life</h1>
            <p className="lede">
              Homepage spotlight becomes a dedicated category: speed, duration,
              and format choices without copying branded ad copy.
            </p>
            <Link to="/visit" className="btn btn-primary">
              Start a private visit
            </Link>
          </div>
          <div className="feature-panel">
            <h2>Why people browse this aisle</h2>
            <ul>
              <li>Compare onset vs duration tradeoffs</li>
              <li>Choose daily vs on-demand formats</li>
              <li>Keep packaging and messaging discreet</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Treatment formats</h2>
            <p>Product mosaic pattern with placeholder descriptions.</p>
          </div>
          <div className="med-grid">
            {options.map((option) => (
              <article key={option.title}>
                <h3>{option.title}</h3>
                <p>{option.copy}</p>
                <Link to="/visit" className="text-link">
                  Check fit
                </Link>
              </article>
            ))}
          </div>
          <p className="disclaimer" style={{ marginTop: "1.5rem" }}>
            Safety note placeholder: live pages include nitrate contraindications
            and compounded-drug disclosures. This demo is not medical advice.
          </p>
        </div>
      </section>
    </div>
  );
}
