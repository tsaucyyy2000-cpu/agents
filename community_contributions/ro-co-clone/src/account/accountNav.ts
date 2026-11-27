export type AccountNavItem = {
  to: string;
  label: string;
  end?: boolean;
};

/** Secondary nav for the patient dashboard shell. */
export const ACCOUNT_NAV: AccountNavItem[] = [
  { to: "/account", label: "Overview", end: true },
  { to: "/account/care", label: "My care" },
  { to: "/account/appointments", label: "Appointments" },
  { to: "/account/orders", label: "Orders" },
  { to: "/account/membership", label: "Membership" },
  { to: "/account/progress", label: "Progress" },
  { to: "/account/documents", label: "Documents" },
  { to: "/account/messages", label: "Messages" },
  { to: "/account/settings", label: "Settings" },
];
