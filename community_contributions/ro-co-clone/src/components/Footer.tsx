import { Link } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import { openSiteConsent } from "../utils/siteConsent";

export function Footer() {
  const { content } = useContent();

  const columns = [
    {
      title: "Care areas",
      items: content.nav,
    },
    {
      title: "Company",
      items: [
        { to: "/about", label: "About" },
        { to: "/quiz/weight-loss", label: "Weight quiz" },
        { to: "/quiz/hair", label: "Hair quiz" },
        { to: "/quiz/sexual-health", label: "Sexual health quiz" },
        { to: "/quiz/skin", label: "Skin quiz" },
        { to: "/visit", label: "Start a visit" },
        { to: "/how-it-works", label: "How it works" },
        { to: "/guides", label: "Health guides" },
      ],
    },
    {
      title: "Support",
      items: [
        { to: "/help", label: "Help center" },
        { to: "/safety", label: "Safety info" },
        { to: "/isi/glp1", label: "GLP-1 ISI stub" },
        { to: "/isi/minoxidil", label: "Minoxidil ISI stub" },
        { to: "/privacy", label: "Privacy" },
        { to: "/terms", label: "Terms" },
      ],
    },
    {
      title: "Privacy choices",
      items: [
        { to: "/privacy-choices", label: "Your privacy choices" },
        { to: "/cookie-policy", label: "Cookie policy" },
        { to: "/consumer-health-privacy", label: "Consumer health data" },
        { to: "/disclosure", label: "Disclosure" },
      ],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">{content.settings.brandName}</div>
          <p>
            Online care paths for common health goals. Not affiliated with Ro. Contact{" "}
            {content.settings.supportEmail}.
          </p>
        </div>
        {columns.map((column) => (
          <div className="footer-col" key={column.title}>
            <h4>{column.title}</h4>
            <ul>
              {column.items.map((item) => (
                <li key={`${column.title}-${item.label}`}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container footer-bottom">
        <span>Not medical advice · Licensed clinicians required for any real treatment</span>
        <button type="button" className="footer-linklike" onClick={() => openSiteConsent()}>
          Cookie settings
        </button>
      </div>
    </footer>
  );
}
