import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import { careNavKey } from "../i18n/carePaths";
import { openSiteConsent } from "../utils/siteConsent";

export function Footer() {
  const { content } = useContent();
  const { t } = useTranslation(["footer", "common", "nav"]);

  const careItems = content.nav.map((item) => {
    const key = careNavKey(item.to);
    return {
      to: item.to,
      label: key ? t(`nav:${key}`) : item.label,
    };
  });

  const columns = [
    {
      title: t("footer:columns.careAreas"),
      items: careItems,
    },
    {
      title: t("footer:columns.company"),
      items: [
        { to: "/about", label: t("footer:links.about") },
        { to: "/quiz/weight-loss", label: t("footer:links.weightQuiz") },
        { to: "/quiz/hair", label: t("footer:links.hairQuiz") },
        { to: "/quiz/sexual-health", label: t("footer:links.sexualHealthQuiz") },
        { to: "/quiz/skin", label: t("footer:links.skinQuiz") },
        { to: "/visit", label: t("footer:links.startVisit") },
        { to: "/how-it-works", label: t("footer:links.howItWorks") },
        { to: "/guides", label: t("footer:links.guides") },
      ],
    },
    {
      title: t("footer:columns.support"),
      items: [
        { to: "/help", label: t("footer:links.help") },
        { to: "/safety", label: t("footer:links.safety") },
        { to: "/isi/glp1", label: t("footer:links.glp1Isi") },
        { to: "/isi/minoxidil", label: t("footer:links.minoxidilIsi") },
        { to: "/privacy", label: t("footer:links.privacy") },
        { to: "/terms", label: t("footer:links.terms") },
      ],
    },
    {
      title: t("footer:columns.privacyChoices"),
      items: [
        { to: "/privacy-choices", label: t("footer:links.privacyChoices") },
        { to: "/cookie-policy", label: t("footer:links.cookiePolicy") },
        { to: "/consumer-health-privacy", label: t("footer:links.consumerHealth") },
        { to: "/disclosure", label: t("footer:links.disclosure") },
      ],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">{content.settings.brandName}</div>
          <p>{t("footer:blurb", { email: content.settings.supportEmail })}</p>
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
        <span>{t("footer:disclaimer")}</span>
        <button type="button" className="footer-linklike" onClick={() => openSiteConsent()}>
          {t("common:consent.cookieSettings")}
        </button>
      </div>
    </footer>
  );
}
