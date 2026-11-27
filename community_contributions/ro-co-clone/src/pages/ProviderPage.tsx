import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  isProviderShellPreview,
  ProviderLayout,
  ProviderPreviewLayout,
  withProviderPreview,
} from "../provider/ProviderLayout";
import { ProviderWorklist } from "../provider/ProviderWorklist";
import { ProviderCaseDetail } from "../provider/ProviderCaseDetail";
import { ProviderMessages } from "../provider/ProviderMessages";
import { ProviderAppointments } from "../provider/ProviderAppointments";
import { ProviderTemplates } from "../provider/ProviderTemplates";
import { ProviderMisconfigured } from "../provider/ProviderMisconfigured";
import { isClerkConfigured } from "../provider/providerAllowlist";

function ProviderSectionRoutes({ preview = false }: { preview?: boolean }) {
  return (
    <Routes>
      <Route index element={<ProviderWorklist preview={preview} />} />
      <Route path="cases/:caseId" element={<ProviderCaseDetail preview={preview} />} />
      <Route path="messages" element={<ProviderMessages />} />
      <Route path="appointments" element={<ProviderAppointments />} />
      <Route path="templates" element={<ProviderTemplates />} />
      <Route
        path="*"
        element={
          <Navigate to={preview ? withProviderPreview("/provider") : "/provider"} replace />
        }
      />
    </Routes>
  );
}

/**
 * Provider portal shell — separate from `/admin` marketing CMS.
 * Live path: Clerk + provider allowlist. Preview: `?previewShell=1` when Clerk missing.
 */
export function ProviderPage() {
  const location = useLocation();

  if (!isClerkConfigured()) {
    if (isProviderShellPreview(location.search)) {
      return (
        <ProviderPreviewLayout>
          <ProviderSectionRoutes preview />
        </ProviderPreviewLayout>
      );
    }
    return <ProviderMisconfigured reason="clerk" />;
  }

  return (
    <Routes>
      <Route element={<ProviderLayout />}>
        <Route index element={<ProviderWorklist />} />
        <Route path="cases/:caseId" element={<ProviderCaseDetail />} />
        <Route path="messages" element={<ProviderMessages />} />
        <Route path="appointments" element={<ProviderAppointments />} />
        <Route path="templates" element={<ProviderTemplates />} />
        <Route path="*" element={<Navigate to="/provider" replace />} />
      </Route>
    </Routes>
  );
}
