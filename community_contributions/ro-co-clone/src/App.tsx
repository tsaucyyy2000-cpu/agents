import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Checkout } from "./pages/Checkout";
import { GuideDetail, GuidesIndex } from "./pages/Guides";
import { Hair } from "./pages/Hair";
import { Home } from "./pages/Home";
import { HowItWorks } from "./pages/HowItWorks";
import { HelpPage } from "./pages/Help";
import {
  AboutPage,
  ConsumerHealthPrivacyPage,
  CookiePolicyPage,
  DisclosurePage,
  PrivacyChoicesPage,
  PrivacyPage,
  SafetyPage,
  TermsPage,
} from "./pages/InfoPage";
import { InsuranceCheck } from "./pages/InsuranceCheck";
import { IsiPage } from "./pages/Isi";
import { NotFound } from "./pages/NotFound";
import { ProductDetail } from "./pages/ProductDetail";
import { Quiz } from "./pages/Quiz";
import { SexualHealth } from "./pages/SexualHealth";
import { Skin } from "./pages/Skin";
import { Visit } from "./pages/Visit";
import { WeightLoss } from "./pages/WeightLoss";

const AdminLayout = lazy(async () => {
  const mod = await import("./admin/AdminLayout");
  return { default: mod.AdminLayout };
});
const Overview = lazy(async () => {
  const mod = await import("./admin/Overview");
  return { default: mod.Overview };
});
const ContentAdmin = lazy(async () => {
  const mod = await import("./admin/ContentAdmin");
  return { default: mod.ContentAdmin };
});
const ProductsAdmin = lazy(async () => {
  const mod = await import("./admin/ProductsAdmin");
  return { default: mod.ProductsAdmin };
});
const MediaAdmin = lazy(async () => {
  const mod = await import("./admin/MediaAdmin");
  return { default: mod.MediaAdmin };
});
const LeadsAdmin = lazy(async () => {
  const mod = await import("./admin/LeadsAdmin");
  return { default: mod.LeadsAdmin };
});
const SettingsAdmin = lazy(async () => {
  const mod = await import("./admin/SettingsAdmin");
  return { default: mod.SettingsAdmin };
});

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="weight-loss" element={<WeightLoss />} />
        <Route path="sexual-health" element={<SexualHealth />} />
        <Route path="hair" element={<Hair />} />
        <Route path="skin" element={<Skin />} />
        <Route path="visit" element={<Visit />} />
        <Route path="quiz/:slug" element={<Quiz />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="insurance-check" element={<InsuranceCheck />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="guides" element={<GuidesIndex />} />
        <Route path="guides/:guideId" element={<GuideDetail />} />
        <Route path="products/:productId" element={<ProductDetail />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="safety" element={<SafetyPage />} />
        <Route path="isi/:slug" element={<IsiPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="cookie-policy" element={<CookiePolicyPage />} />
        <Route path="privacy-choices" element={<PrivacyChoicesPage />} />
        <Route path="consumer-health-privacy" element={<ConsumerHealthPrivacyPage />} />
        <Route path="disclosure" element={<DisclosurePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="admin"
        element={
          <Suspense fallback={<p style={{ padding: "2rem" }}>Loading admin…</p>}>
            <AdminLayout />
          </Suspense>
        }
      >
        <Route index element={<Overview />} />
        <Route path="content" element={<ContentAdmin />} />
        <Route path="products" element={<ProductsAdmin />} />
        <Route path="media" element={<MediaAdmin />} />
        <Route path="leads" element={<LeadsAdmin />} />
        <Route path="settings" element={<SettingsAdmin />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
