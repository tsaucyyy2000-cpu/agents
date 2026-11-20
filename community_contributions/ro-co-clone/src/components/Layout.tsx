import { Outlet } from "react-router-dom";
import { DemoBanner } from "./DemoBanner";
import { Footer } from "./Footer";
import { Header } from "./Header";
import "./Layout.css";

export function Layout() {
  return (
    <div className="page">
      <div className="site-chrome">
        <DemoBanner />
        <Header />
      </div>
      <main className="page-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
