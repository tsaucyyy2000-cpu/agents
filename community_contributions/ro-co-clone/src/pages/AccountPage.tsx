import { UserProfile, useClerk, useUser } from "@clerk/react";
import { Link } from "react-router-dom";
import { RequireSignedIn } from "../auth/RequireSignedIn";
import { clerkAppearance } from "../auth/clerkConfig";
import { isAdminEmail } from "../admin/adminAllowlist";
import "../auth/auth.css";

function AccountDashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const email = user?.primaryEmailAddress?.emailAddress;
  const displayName =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    email ||
    "Customer";
  const staff = isAdminEmail(email);

  return (
    <div className="account-page" data-testid="account-dashboard">
      <section className="account-hero">
        <div className="container account-hero-inner">
          <p className="section-kicker">Your account</p>
          <h1>{isLoaded ? `Hi, ${displayName}` : "Your account"}</h1>
          <p className="account-hero-dek">
            Manage your profile, email, and password with Clerk. Care quizzes, visit answers, and
            plan reviews on this marketing SPA still stay in browser localStorage — not a production
            orders or PHI backend.
          </p>
          <div className="account-meta">
            {email ? (
              <span>
                Signed in as <strong>{email}</strong>
              </span>
            ) : null}
            <span>Role: {staff ? "Administrator / staff" : "Customer"}</span>
          </div>
          <div className="account-toolbar">
            <button
              type="button"
              className="btn btn-ghost"
              data-testid="account-sign-out"
              onClick={() => {
                void signOut({ redirectUrl: "/" });
              }}
            >
              Sign out
            </button>
            {staff ? (
              <Link className="btn btn-primary" to="/admin">
                Open admin
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <div className="container account-body">
        <div className="account-grid">
          <div className="account-card account-profile-mount">
            <h2>Profile & security</h2>
            <p>
              Update name, email, password, and connected accounts. Email verification and password
              recovery are provided by Clerk when enabled for this app.
            </p>
            <UserProfile
              routing="hash"
              appearance={clerkAppearance}
            />
          </div>

          <aside className="account-card">
            <h2>Care shortcuts</h2>
            <p>Continue the marketing funnel — these paths do not sync to a clinic API yet.</p>
            <ul className="account-link-list">
              <li>
                <Link to="/#find-care">
                  Find care <span>Quiz start</span>
                </Link>
              </li>
              <li>
                <Link to="/visit">
                  Visit intake <span>Local lead</span>
                </Link>
              </li>
              <li>
                <Link to="/how-it-works">
                  How care works <span>Funnel</span>
                </Link>
              </li>
              <li>
                <Link to="/help">
                  Help center <span>FAQs</span>
                </Link>
              </li>
            </ul>
            <div className="callout">
              <p>
                <strong>Data note:</strong> CMS edits and visit leads use{" "}
                <code>localStorage</code> (<code>ro-clone-site-content-v2</code>). Do not treat this
                account UI as HIPAA-ready storage.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function AccountPage() {
  return (
    <RequireSignedIn>
      <AccountDashboard />
    </RequireSignedIn>
  );
}
