import { Link } from "react-router-dom";

const columns = [
  {
    title: "Care areas",
    items: [
      { to: "/weight-loss", label: "Weight loss" },
      { to: "/sexual-health", label: "Sexual health" },
      { to: "/hair", label: "Hair" },
      { to: "/skin", label: "Skin" },
    ],
  },
  {
    title: "Company",
    items: [
      { to: "/", label: "About this clone" },
      { to: "/visit", label: "Start a visit" },
      { to: "/", label: "Careers (placeholder)" },
      { to: "/", label: "Press (placeholder)" },
    ],
  },
  {
    title: "Support",
    items: [
      { to: "/", label: "Help center" },
      { to: "/", label: "Safety info" },
      { to: "/", label: "Privacy" },
      { to: "/", label: "Terms" },
    ],
  },
  {
    title: "Explore",
    items: [
      { to: "/weight-loss", label: "Membership overview" },
      { to: "/sexual-health", label: "Treatment options" },
      { to: "/hair", label: "Hair goals" },
      { to: "/skin", label: "Skin routines" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">ro</div>
          <p>
            A local UI recreation of a telehealth marketing experience. Not
            affiliated with Ro. Placeholder copy only.
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
        <span>Demo recreation for local review.</span>
        <span>No medical advice · No real prescriptions</span>
      </div>
    </footer>
  );
}
