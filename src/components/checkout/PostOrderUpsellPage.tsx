import { useQuery } from "@tanstack/react-query";
import {
  fetchPostOrderUpsell,
  trackUpsellResponse,
  updateOrderWithUpsell,
} from "@/lib/post-order-upsell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface PostOrderUpsellPageProps {
  orderId: string;
  sourceProductId: string;
  onComplete: (finalTotal: number | null) => void;
}

export function PostOrderUpsellPage({ orderId, sourceProductId, onComplete }: PostOrderUpsellPageProps) {
  const [processing, setProcessing] = useState(false);

  const { data: upsell, isLoading } = useQuery({
    queryKey: ["post-order-upsell", sourceProductId],
    queryFn: () => fetchPostOrderUpsell(sourceProductId),
    enabled: !!sourceProductId,
  });

  // If no upsell configured or still loading, skip immediately
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!upsell) {
    // No upsell available, complete immediately
    onComplete(null);
    return null;
  }

  const discountedPrice = Math.round(upsell.product_price * (1 - upsell.discount_percent / 100));
  const savings = upsell.product_price - discountedPrice;

  const handleAccept = async () => {
    setProcessing(true);
    try {
      // Track acceptance
      await trackUpsellResponse({
        order_id: orderId,
        upsell_product_id: upsell.upsell_product_id,
        upsell_product_title: upsell.product_title,
        upsell_price: discountedPrice,
        discount_percent: upsell.discount_percent,
        accepted: true,
      });

      // Update order with upsell
      await updateOrderWithUpsell(orderId, upsell.product_title, discountedPrice);

      toast.success("Added to your order!");
      onComplete(discountedPrice);
    } catch {
      toast.error("Something went wrong");
      onComplete(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    setProcessing(true);
    try {
      await trackUpsellResponse({
        order_id: orderId,
        upsell_product_id: upsell.upsell_product_id,
        upsell_product_title: upsell.product_title,
        upsell_price: discountedPrice,
        discount_percent: upsell.discount_percent,
        accepted: false,
      });
    } catch {
      // Non-critical, proceed anyway
    }
    onComplete(null);
  };

  return (
    <Card className="border-accent/30 overflow-hidden">
      {/* Accent bar */}
      <div className="h-1 bg-accent w-full" />

      <CardContent className="py-8 px-6 space-y-6">
        {/* Headline */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto">
            <Gift className="w-7 h-7 text-accent" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            {upsell.headline}
          </h2>
        </div>

        {/* Product card */}
        <div className="flex gap-4 items-center bg-secondary/50 rounded-xl p-4">
          {upsell.product_image && (
            <img
              src={upsell.product_image}
              alt={upsell.product_title}
              className="w-24 h-24 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0 space-y-2">
            <p className="font-semibold text-lg">{upsell.product_title}</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-bold text-accent">
                {discountedPrice.toLocaleString()} DA
              </span>
              <span className="text-base text-muted-foreground line-through">
                {upsell.product_price.toLocaleString()} DA
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-accent text-accent-foreground text-xs">
                {upsell.discount_percent}% OFF
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Save {savings.toLocaleString()} DA
              </Badge>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full text-base"
            onClick={handleAccept}
            disabled={processing}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            {upsell.accept_text} — {discountedPrice.toLocaleString()} DA
          </Button>
          <button
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center justify-center gap-1.5"
            onClick={handleDecline}
            disabled={processing}
          >
            <X className="w-3.5 h-3.5" />
            {upsell.decline_text}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
