import { useQuery } from "@tanstack/react-query";
import { fetchDiscountsForProduct, getDiscountedPrice, type QuantityDiscount } from "@/lib/quantity-discounts";
import { Badge } from "@/components/ui/badge";

interface QuantityPricingProps {
  productId: string;
  basePrice: number;
  quantity: number;
}

export function QuantityPricing({ productId, basePrice, quantity }: QuantityPricingProps) {
  const { data: tiers } = useQuery({
    queryKey: ["quantity-discounts", productId],
    queryFn: () => fetchDiscountsForProduct(productId),
  });

  if (!tiers?.length) return null;

  const currentPrice = getDiscountedPrice(basePrice, quantity, tiers);
  const hasDiscount = currentPrice < basePrice;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">خصومات الكمية</p>
      <div className="flex flex-wrap gap-1.5">
        {tiers.map((t) => {
          const isActive = quantity >= t.min_quantity;
          return (
            <Badge
              key={t.id}
              variant={isActive ? "default" : "outline"}
              className={`text-xs ${isActive ? "bg-accent text-accent-foreground" : ""}`}
            >
              {t.min_quantity}+ → خصم {t.discount_percent}%
            </Badge>
          );
        })}
      </div>
      {hasDiscount && (
        <p className="text-sm">
          <span className="text-muted-foreground line-through ml-2">{basePrice.toLocaleString()} د.ج</span>
          <span className="font-bold text-accent">{Math.round(currentPrice).toLocaleString()} د.ج/وحدة</span>
        </p>
      )}
    </div>
  );
}

export { getDiscountedPrice, type QuantityDiscount };
export { fetchDiscountsForProduct };
