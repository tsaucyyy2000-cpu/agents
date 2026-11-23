import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = { children: ReactNode };
type State = { message: string | null };

/** Keeps `/admin` usable when Clerk fails to boot (bad key, network, etc.). */
export class AdminClerkErrorBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : "Clerk failed to initialize.";
    return { message };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error("Admin Clerk error", error, info.componentStack);
  }

  render() {
    if (this.state.message) {
      return (
        <div className="admin-unlock">
          <div className="admin-unlock-card">
            <p className="admin-unlock-badge admin-auth-badge-danger">Clerk error</p>
            <h1>Could not start auth</h1>
            <p className="admin-unlock-lead">
              Check <code>VITE_CLERK_PUBLISHABLE_KEY</code> and network access to Clerk. Admin stays
              locked until Clerk loads successfully.
            </p>
            <p className="toast-err" role="alert">
              {this.state.message}
            </p>
            <Link className="admin-unlock-exit" to="/">
              ← Back to site
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
