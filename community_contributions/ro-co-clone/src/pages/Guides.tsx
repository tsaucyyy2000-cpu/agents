import { Link, useParams } from "react-router-dom";
import { JourneyRail } from "../components/JourneyRail";
import { StickyMobileCta } from "../components/StickyMobileCta";
import { useContent } from "../data/ContentContext";
import type { CareArea } from "../data/types";
import { quizPath } from "../utils/careRoutes";
import "./Flows.css";

/** Map guide ids to a care area so quiz / care CTAs stay aisle-aware. */
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

const careLabel: Record<CareArea, string> = {
  weight: "Weight care",
  "sexual-health": "Sexual health",
  hair: "Hair",
  skin: "Skin",
};

export function GuidesIndex() {
  const { content, mediaById } = useContent();

  return (
    <div className="flow-page">
      <section className="section">
        <div className="container">
          <JourneyRail
            steps={[
              { label: "Home", to: "/" },
              { label: "Guides", current: true },
              { label: "Help", to: "/help" },
              { label: "Care", to: "/#find-care" },
            ]}
          />
          <p className="eyebrow">Health guides</p>
          <h1>Education tiles for discovery</h1>
          <p className="lede">
            Original summaries only — not medical advice, not clinical recommendations, and no
            verified prices. Editable via content export/import.
          </p>
          <div className="cta-row guide-index-actions">
            <Link to="/#find-care" className="btn btn-primary">
              Choose care · start quiz
            </Link>
            <Link to="/how-it-works" className="btn btn-secondary">
              How care works
            </Link>
            <Link to="/help" className="btn btn-secondary">
              Help center
            </Link>
          </div>
          <div className="guide-index-grid">
            {content.guides.map((guide) => {
              const image = mediaById[guide.imageId];
              const area = guideCareArea[guide.id];
              return (
                <Link key={guide.id} to={`/guides/${guide.id}`} className="guide-index-card">
                  {image ? <img src={image.src} alt={image.alt} /> : null}
                  <h2>{guide.title}</h2>
                  <p>{guide.summary ?? `${guide.read} read`}</p>
                  {area ? (
                    <p className="guide-card-meta">
                      {guide.read} · related: {careLabel[area]}
                    </p>
                  ) : (
                    <p className="guide-card-meta">{guide.read} read · education</p>
                  )}
                </Link>
              );
            })}
          </div>
          <p className="care-bridge">
            Looking for safety stubs?{" "}
            <Link to="/safety" className="text-link">
              Safety hub
            </Link>
            <span aria-hidden="true"> · </span>
            <Link to="/help#safety" className="text-link">
              Help · Safety &amp; education
            </Link>
          </p>
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
          <p className="lede">That education tile isn’t in this catalog.</p>
          <div className="cta-row">
            <Link to="/guides" className="btn btn-primary">
              Back to guides
            </Link>
            <Link to="/help" className="btn btn-secondary">
              Help center
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const image = mediaById[guide.imageId];
  const area = guideCareArea[guide.id] ?? "weight";
  const quizHref = quizPath(area);
  const relatedProducts = content.products
    .filter((product) => product.active && product.category === area)
    .slice(0, 2);

  return (
    <div className="flow-page">
      <section className="section">
        <div className="container guide-detail">
          <JourneyRail
            steps={[
              { label: "Guides", to: "/guides", done: true },
              { label: "Article", current: true },
              { label: "Quiz", to: quizHref },
              { label: "Care", to: carePath[area] },
            ]}
          />
          {image ? <img src={image.src} alt={image.alt} className="guide-detail-hero" /> : null}
          <p className="eyebrow">
            {guide.read} read · Education · {careLabel[area]}
          </p>
          <h1>{guide.title}</h1>
          <p className="lede">{guide.summary}</p>
          {(guide.body ?? []).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="cost-pending">
            Educational stub only — not medical advice, not a clinical recommendation, and no
            verified dollar prices.
          </p>
          <div className="cta-row">
            <Link to={quizHref} className="btn btn-primary">
              Start related quiz
            </Link>
            <Link to={carePath[area]} className="btn btn-secondary">
              Open {careLabel[area]} landing
            </Link>
            <Link to="/how-it-works" className="btn btn-secondary">
              How care works
            </Link>
          </div>
          <p className="care-bridge">
            <Link to="/guides" className="text-link">
              All guides
            </Link>
            <span aria-hidden="true"> · </span>
            <Link to="/help" className="text-link">
              Help center
            </Link>
            <span aria-hidden="true"> · </span>
            <Link to="/safety" className="text-link">
              Safety hub
            </Link>
          </p>
          {relatedProducts.length > 0 ? (
            <div className="guide-related">
              <h2>Related options</h2>
              <p className="section-dek">Catalog stubs only — pricing withheld until verified.</p>
              <div className="cta-row">
                {relatedProducts.map((product) => (
                  <Link key={product.id} to={`/products/${product.id}`} className="btn btn-secondary">
                    {product.name}
                  </Link>
                ))}
                <Link to={quizHref} className="btn btn-primary">
                  Start quiz
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <StickyMobileCta
        to={quizHref}
        label="Start related quiz"
        fine={`${careLabel[area]} · then visit funnel · Help anytime`}
      />
    </div>
  );
}
