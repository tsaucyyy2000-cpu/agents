import { Link } from "react-router-dom";
import { useContent } from "../data/ContentContext";

export function Overview() {
  const { content } = useContent();
  const activeProducts = content.products.filter((product) => product.active).length;
  const openSubmissions = content.leads.filter(
    (lead) =>
      lead.status === "submitted" ||
      lead.status === "awaiting_review" ||
      lead.status === "more_information_required" ||
      lead.status === "under_clinician_review" ||
      lead.status === "draft",
  ).length;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Dashboard</h1>
          <p>Local content store updated {new Date(content.updatedAt).toLocaleString()}.</p>
        </div>
        <div className="admin-actions">
          <Link to="/" className="btn btn-secondary">
            Preview site
          </Link>
          <Link to="/admin/content" className="btn btn-primary">
            Edit content
          </Link>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <span>Active products</span>
          <strong>{activeProducts}</strong>
        </div>
        <div className="admin-card">
          <span>Media assets</span>
          <strong>{content.media.length}</strong>
        </div>
        <div className="admin-card">
          <span>Open submissions</span>
          <strong>{openSubmissions}</strong>
        </div>
        <div className="admin-card">
          <span>Questionnaires</span>
          <strong>{content.questionnaires.length}</strong>
        </div>
        <div className="admin-card">
          <span>Guides</span>
          <strong>{content.guides.length}</strong>
        </div>
        <div className="admin-card">
          <span>Orphan publish</span>
          <strong>
            {Object.values(content.orphanPublish).some(Boolean) ? "Partial" : "All gated"}
          </strong>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Quick links</h2>
        <div className="admin-actions">
          <Link to="/admin/products" className="btn btn-secondary">
            Manage products
          </Link>
          <Link to="/admin/media" className="btn btn-secondary">
            Media library
          </Link>
          <Link to="/admin/leads" className="btn btn-secondary">
            Review submissions
          </Link>
          <Link to="/admin/messages" className="btn btn-secondary">
            Support messages
          </Link>
          <Link to="/admin/content" className="btn btn-secondary">
            Edit questionnaires
          </Link>
          <Link to="/admin/settings" className="btn btn-secondary">
            Settings / import-export
          </Link>
        </div>
      </div>
    </div>
  );
}
