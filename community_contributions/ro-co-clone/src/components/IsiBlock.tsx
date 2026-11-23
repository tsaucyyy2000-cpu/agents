import { Link } from "react-router-dom";
import { getIsi } from "../data/isi";

type Props = {
  slug: string;
  maxSections?: number;
};

/** Condensed ISI callout for care/product pages — illustrative placeholder copy only. */
export function IsiBlock({ slug, maxSections = 3 }: Props) {
  const doc = getIsi(slug);
  if (!doc) return null;

  const sections = doc.sections.slice(0, maxSections);

  return (
    <div className="isi-block" data-testid={`isi-block-${slug}`}>
      <p className="section-kicker">Safety</p>
      <h3>{doc.title}</h3>
      <p className="isi-applies">Applies to: {doc.appliesTo}</p>
      <p className="cost-pending">
        Illustrative layout stub — re-verify with counsel/clinicians before launch. Not FDA labeling.
      </p>
      {sections.map((section) => (
        <div key={section.id} className="isi-block-section">
          <h4>{section.heading}</h4>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ))}
      <Link to={`/isi/${slug}`} className="text-link">
        Open full {slug.toUpperCase()} safety stub
      </Link>
    </div>
  );
}
