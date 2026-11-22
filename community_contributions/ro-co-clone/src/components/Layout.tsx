import { Outlet, useLocation } from "react-router-dom";
import { DemoBanner } from "./DemoBanner";
import { DemoConsentBanner } from "./DemoConsentBanner";
import { Footer } from "./Footer";
import { Header } from "./Header";
import "./Layout.css";

export function Layout() {
  const { pathname } = useLocation();
  const stickyCtaPages = pathname === "/" || ["/weight-loss", "/sexual-health", "/hair", "/skin"].includes(pathname);

  return (
    <div className="page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="site-chrome">
        <DemoBanner />
        <Header />
      </div>
      <main id="main-content" className={`page-main ${stickyCtaPages ? "has-sticky-cta" : ""}`}>
        <Outlet />
      </main>
      <Footer />
      <DemoConsentBanner />
    </div>
  );
}
