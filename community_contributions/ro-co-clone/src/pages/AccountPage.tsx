import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  AccountLayout,
  AccountPreviewLayout,
  isAccountShellPreview,
  PREVIEW_IDENTITY,
  useAccountIdentity,
  type ShellIdentity,
} from "../account/AccountLayout";
import { AccountOverview } from "../account/AccountOverview";
import { AccountCare } from "../account/AccountCare";
import { AccountOrders } from "../account/AccountOrders";
import { AccountMembership } from "../account/AccountMembership";
import { AccountProgress } from "../account/AccountProgress";
import { AccountDocuments } from "../account/AccountDocuments";
import { AccountAppointments } from "../account/AccountAppointments";
import { AccountMessages } from "../account/AccountMessages";
import { AccountSettings } from "../account/AccountSettings";
import { AuthUnavailable } from "../auth/AuthUnavailable";
import { RequireSignedIn } from "../auth/RequireSignedIn";
import { isClerkConfigured } from "../auth/clerkConfig";
import "../auth/auth.css";

function AccountSectionRoutes({
  identity,
  preview = false,
}: {
  identity: ShellIdentity;
  preview?: boolean;
}) {
  const patientKey = identity.email?.trim() || identity.displayName || "preview-patient";
  return (
    <Routes>
      <Route
        index
        element={<AccountOverview displayName={identity.displayName} preview={preview} />}
      />
      <Route path="care" element={<AccountCare preview={preview} />} />
      <Route
        path="appointments"
        element={
          <AccountAppointments
            patientKey={patientKey}
            patientLabel={identity.displayName}
            preview={preview}
          />
        }
      />
      <Route path="orders" element={<AccountOrders />} />
      <Route path="membership" element={<AccountMembership />} />
      <Route path="progress" element={<AccountProgress />} />
      <Route path="documents" element={<AccountDocuments />} />
      <Route
        path="messages"
        element={
          <AccountMessages
            patientKey={patientKey}
            patientLabel={identity.displayName}
            preview={preview}
          />
        }
      />
      <Route path="settings" element={<AccountSettings preview={preview} />} />
      <Route
        path="*"
        element={<Navigate to={preview ? "/account?previewShell=1" : "/account"} replace />}
      />
    </Routes>
  );
}

function SignedInAccount() {
  const identity = useAccountIdentity();
  return (
    <AccountLayout identity={identity}>
      <AccountSectionRoutes identity={identity} />
    </AccountLayout>
  );
}

/**
 * Customer account dashboard shell.
 * Requires Clerk signed-in when configured; optional ?previewShell=1 design preview when not.
 */
export function AccountPage() {
  const location = useLocation();

  if (!isClerkConfigured()) {
    if (isAccountShellPreview(location.search)) {
      return (
        <AccountPreviewLayout>
          <AccountSectionRoutes identity={PREVIEW_IDENTITY} preview />
        </AccountPreviewLayout>
      );
    }
    return <AuthUnavailable />;
  }

  return (
    <RequireSignedIn>
      <SignedInAccount />
    </RequireSignedIn>
  );
}
