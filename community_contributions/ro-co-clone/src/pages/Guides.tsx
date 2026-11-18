import { Link, useParams } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import "./Flows.css";

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

  return (
    <div className="flow-page">
      <section className="section">
        <div className="container guide-detail">
          {image ? <img src={image.src} alt={image.alt} className="guide-detail-hero" /> : null}
          <p className="eyebrow">{guide.read} read</p>
          <h1>{guide.title}</h1>
          <p className="lede">{guide.summary}</p>
          {(guide.body ?? []).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="cta-row">
            <Link to="/visit" className="btn btn-primary">
              Start visit
            </Link>
            <Link to="/guides" className="btn btn-secondary">
              All guides
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
