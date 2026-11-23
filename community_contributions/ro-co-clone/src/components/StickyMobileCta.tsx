import { Link } from "react-router-dom";
import "./StickyMobileCta.css";

type Props = {
  to: string;
  label: string;
  fine?: string;
};

/** Mobile-only sticky CTA (guide lander pattern). Hidden on visit form pages. */
export function StickyMobileCta({ to, label, fine }: Props) {
  return (
    <div className="sticky-mobile-cta" role="region" aria-label="Continue">
      <div className="sticky-mobile-cta-inner">
        <Link to={to} className="btn btn-primary">
          {label}
        </Link>
        {fine ? <p className="sticky-mobile-cta-fine">{fine}</p> : null}
      </div>
    </div>
  );
}
