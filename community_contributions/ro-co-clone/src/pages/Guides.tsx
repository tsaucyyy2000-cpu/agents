import { Link, useParams } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import type { CareArea } from "../data/types";
import { visitPath } from "../utils/careRoutes";
import "./Flows.css";

/** Map demo guide ids to a care area so Visit opens pre-selected. */
const guideCareArea: Record<string, CareArea> = {
  g1: "weight",
  g2: "sexual-health",
  g3: "hair",
  g4: "weight",
};

const carePath: Record<CareArea, string> = {
  weight: "/weight-loss",
  "sexual-health": "/sexual-health",
  hair: "/hair",
  skin: "/skin",
};

export function GuidesIndex() {
  const { content, mediaById } = useContent();

  return (
    <div className="flow-page">
      <section className="section">
        <div className="container">
          <p className="eyebrow">Health guide</p>
          <h1>Education tiles for discovery</h1>
          <p className="lede">Original summaries only—editable via content export/import.</p>
          <div className="guide-index-grid">
            {content.guides.map((guide) => {
              const image = mediaById[guide.imageId];
              return (
                <Link key={guide.id} to={`/guides/${guide.id}`} className="guide-index-card">
                  {image ? <img src={image.src} alt={image.alt} /> : null}
                  <h2>{guide.title}</h2>
                  <p>{guide.summary ?? `${guide.read} read`}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export function GuideDetail() {
  const { guideId } = useParams();
  const { content, mediaById } = useContent();
  const guide = content.guides.find((item) => item.id === guideId);

  if (!guide) {
    return (
      <div className="flow-page section">
        <div className="container">
          <h1>Guide not found</h1>
          <Link to="/guides" className="btn btn-secondary">
            Back to guides
          </Link>
        </div>
      </div>
    );
  }

  const image = mediaById[guide.imageId];
  const area = guideCareArea[guide.id] ?? "weight";
  const relatedProducts = content.products
    .filter((product) => product.active && product.category === area)
    .slice(0, 2);

  return (
    <div className="flow-page">
      <section className="section">
        <div className="container guide-detail">
          {image ? <img src={image.src} alt={image.alt} className="guide-detail-hero" /> : null}
          <p className="eyebrow">{guide.read} read · demo education</p>
          <h1>{guide.title}</h1>
          <p className="lede">{guide.summary}</p>
          {(guide.body ?? []).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="cost-pending">
            Educational stub only — not medical advice and not a clinical recommendation.
          </p>
          <div className="cta-row">
            <Link to={visitPath(area)} className="btn btn-primary">
              Start related demo visit
            </Link>
            <Link to={carePath[area]} className="btn btn-secondary">
              Open care area
            </Link>
            <Link to="/guides" className="btn btn-secondary">
              All guides
            </Link>
          </div>
          {relatedProducts.length > 0 ? (
            <div className="guide-related" style={{ marginTop: "1.75rem" }}>
              <h2>Related demo options</h2>
              <div className="cta-row" style={{ marginTop: "0.75rem" }}>
                {relatedProducts.map((product) => (
                  <Link key={product.id} to={`/products/${product.id}`} className="btn btn-secondary">
                    {product.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
