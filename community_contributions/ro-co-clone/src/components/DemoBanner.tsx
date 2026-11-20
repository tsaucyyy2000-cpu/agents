import { Link } from "react-router-dom";
import "./DemoBanner.css";

export function DemoBanner() {
  return (
    <div className="demo-banner" role="status">
      <div className="container demo-banner-inner">
        <strong>Demo preview</strong>
        <span>Not a real clinic · No payments or prescriptions · Sample data only</span>
        <Link to="/about" className="demo-banner-link">
          About this demo
        </Link>
      </div>
    </div>
  );
}
