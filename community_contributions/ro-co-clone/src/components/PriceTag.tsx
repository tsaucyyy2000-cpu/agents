import { formatPrice, type Price } from "../utils/formatPrice";
import "./PriceTag.css";

type Props = {
  price: Price;
  className?: string;
};

export function PriceTag({ price, className = "" }: Props) {
  const verified = price.amount !== null;
  return (
    <div className={`price-tag ${className}`.trim()} data-testid="price-tag">
      <p className="price-tag-amount">
        <span className="price-tag-value">{formatPrice(price)}</span>
        <span className="price-tag-unit">/ {price.unit}</span>
      </p>
      <p className="price-tag-note">
        {verified ? "Verified price" : "Price pending verification"}
        {price.note ? ` · ${price.note}` : ""}
      </p>
    </div>
  );
}
