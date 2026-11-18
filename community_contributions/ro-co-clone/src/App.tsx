import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./admin/AdminLayout";
import { ContentAdmin } from "./admin/ContentAdmin";
import { LeadsAdmin } from "./admin/LeadsAdmin";
import { MediaAdmin } from "./admin/MediaAdmin";
import { Overview } from "./admin/Overview";
import { ProductsAdmin } from "./admin/ProductsAdmin";
import { SettingsAdmin } from "./admin/SettingsAdmin";
import { Layout } from "./components/Layout";
import { Hair } from "./pages/Hair";
import { Home } from "./pages/Home";
import {
  AboutPage,
  HelpPage,
  PrivacyPage,
  SafetyPage,
  TermsPage,
} from "./pages/InfoPage";
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
        <Route path="about" element={<AboutPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="safety" element={<SafetyPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
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
