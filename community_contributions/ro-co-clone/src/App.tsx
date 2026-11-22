import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./admin/AdminLayout";
import { ContentAdmin } from "./admin/ContentAdmin";
import { LeadsAdmin } from "./admin/LeadsAdmin";
import { MediaAdmin } from "./admin/MediaAdmin";
import { Overview } from "./admin/Overview";
import { ProductsAdmin } from "./admin/ProductsAdmin";
import { SettingsAdmin } from "./admin/SettingsAdmin";
import { Layout } from "./components/Layout";
import { Checkout } from "./pages/Checkout";
import { GuideDetail, GuidesIndex } from "./pages/Guides";
import { Hair } from "./pages/Hair";
import { Home } from "./pages/Home";
import { HowItWorks } from "./pages/HowItWorks";
import {
  AboutPage,
  ConsumerHealthPrivacyPage,
  CookiePolicyPage,
  DisclosurePage,
  HelpPage,
  PrivacyChoicesPage,
  PrivacyPage,
  SafetyPage,
  TermsPage,
} from "./pages/InfoPage";
import { InsuranceCheck } from "./pages/InsuranceCheck";
import { ProductDetail } from "./pages/ProductDetail";
import { SexualHealth } from "./pages/SexualHealth";
import { Skin } from "./pages/Skin";
import { Visit } from "./pages/Visit";
import { WeightLoss } from "./pages/WeightLoss";

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
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="insurance-check" element={<InsuranceCheck />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="guides" element={<GuidesIndex />} />
        <Route path="guides/:guideId" element={<GuideDetail />} />
        <Route path="products/:productId" element={<ProductDetail />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="safety" element={<SafetyPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="cookie-policy" element={<CookiePolicyPage />} />
        <Route path="privacy-choices" element={<PrivacyChoicesPage />} />
        <Route path="consumer-health-privacy" element={<ConsumerHealthPrivacyPage />} />
        <Route path="disclosure" element={<DisclosurePage />} />
      </Route>

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Overview />} />
        <Route path="content" element={<ContentAdmin />} />
        <Route path="products" element={<ProductsAdmin />} />
        <Route path="media" element={<MediaAdmin />} />
        <Route path="leads" element={<LeadsAdmin />} />
        <Route path="settings" element={<SettingsAdmin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
