export type Price = {
  amount: number | null;
  unit: string;
  note?: string;
};

/** Null amounts stay an em dash — never invent unverified `$` for the customer UI. */
export function formatPrice(price: Price): string {
  if (price.amount === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: price.amount % 1 === 0 ? 0 : 2,
  }).format(price.amount);
}

export const PENDING_PRICE: Price = {
  amount: null,
  unit: "mo",
  note: "Discussed during a demo visit once verified figures exist",
};
