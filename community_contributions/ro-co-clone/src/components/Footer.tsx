import { Link } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import { openDemoConsent } from "../utils/demoConsent";

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
        { to: "/about", label: "About this clone" },
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
        { to: "/disclosure", label: "Demo disclosure" },
      ],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">{content.settings.brandName}</div>
          <p>
            A local UI recreation of a telehealth marketing experience. Not affiliated with
            Ro. Placeholder copy only. Contact {content.settings.supportEmail}.
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
        <span>Demo recreation for local review · No medical advice · No real prescriptions</span>
        <button type="button" className="footer-linklike" onClick={() => openDemoConsent()}>
          Cookie settings
        </button>
      </div>
    </footer>
  );
}
