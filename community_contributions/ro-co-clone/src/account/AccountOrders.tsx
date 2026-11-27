import { AccountEmptyState } from "./AccountEmptyState";

export function AccountOrders() {
  return (
    <div className="account-section" data-testid="account-orders">
      <header className="account-section-head">
        <p className="section-kicker">Orders</p>
        <h2>Orders & shipments</h2>
        <p>
          Pharmacy fulfillment and tracking are not connected. This page will not show fake order IDs,
          tracking numbers, or delivery ETAs.
        </p>
      </header>
      <AccountEmptyState
        testId="account-orders-empty"
        title="No orders to show"
        body="Order history and shipment status appear when pharmacy and payment integrations are live. Plan review on this SPA is still a no-payment checkout shell."
        ctas={[
          { to: "/checkout", label: "Plan review shell", primary: true },
          { to: "/how-it-works", label: "How care works" },
          { to: "/guides", label: "Health guides" },
        ]}
      />
    </div>
  );
}
