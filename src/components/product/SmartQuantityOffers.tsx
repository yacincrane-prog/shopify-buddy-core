import { useQuery } from "@tanstack/react-query";
import { fetchOffersForProduct, type QuantityOffer } from "@/lib/quantity-offers";
import { Badge } from "@/components/ui/badge";
import { Truck, Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartQuantityOffersProps {
  productId: string;
  basePrice: number;
  selectedOfferId: string | null;
  onSelect: (offer: QuantityOffer) => void;
}

export function SmartQuantityOffers({
  productId,
  basePrice,
  selectedOfferId,
  onSelect,
}: SmartQuantityOffersProps) {
  const { data: offers } = useQuery({
    queryKey: ["quantity-offers", productId],
    queryFn: () => fetchOffersForProduct(productId),
    enabled: !!productId,
  });

  if (!offers?.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium flex items-center gap-1.5">
        <Zap className="w-4 h-4 text-accent" />
        Choose your offer
      </p>
      <div className="grid gap-2.5">
        {offers.map((offer) => {
          const isSelected = selectedOfferId === offer.id;
          const unitPrice = offer.price / offer.quantity;
          const normalTotal = basePrice * offer.quantity;
          const savings = normalTotal - offer.price;

          return (
            <button
              key={offer.id}
              type="button"
              onClick={() => onSelect(offer)}
              className={cn(
                "relative w-full text-left rounded-xl border-2 p-4 transition-all duration-150",
                "hover:shadow-md hover:border-accent/60",
                isSelected
                  ? "border-accent bg-accent/5 shadow-md ring-1 ring-accent/30"
                  : "border-border bg-card"
              )}
            >
              {/* Best offer ribbon */}
              {offer.is_best_offer && (
                <div className="absolute -top-2.5 left-4">
                  <Badge className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 shadow-sm">
                    Best Offer
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                {/* Left: selection indicator + quantity */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "border-accent bg-accent"
                        : "border-muted-foreground/40"
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-accent-foreground" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {offer.quantity} {offer.quantity === 1 ? "Piece" : "Pieces"}
                    </p>
                    {offer.label && (
                      <p className="text-xs text-muted-foreground">{offer.label}</p>
                    )}
                  </div>
                </div>

                {/* Right: price + savings */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-base">{Number(offer.price).toLocaleString()} DA</p>
                  {savings > 0 && (
                    <p className="text-xs font-medium text-accent">
                      Save {savings.toLocaleString()} DA
                    </p>
                  )}
                </div>
              </div>

              {/* Free delivery badge */}
              {offer.free_delivery && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-success">
                  <Truck className="w-3.5 h-3.5" />
                  Free Delivery
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
