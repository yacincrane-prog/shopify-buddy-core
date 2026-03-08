import { useQuery } from "@tanstack/react-query";
import { fetchUpsellsForProduct, type UpsellWithProduct } from "@/lib/upsells";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface UpsellModalProps {
  productId: string;
  open: boolean;
  onClose: () => void;
  onAddUpsell: (upsell: UpsellWithProduct) => void;
  onSkip: () => void;
}

export function UpsellModal({ productId, open, onClose, onAddUpsell, onSkip }: UpsellModalProps) {
  const { data: upsells } = useQuery({
    queryKey: ["upsells-for-product", productId],
    queryFn: () => fetchUpsellsForProduct(productId),
    enabled: !!productId,
  });

  const upsell = upsells?.[0];
  if (!upsell) return null;

  const discountedPrice = Math.round(upsell.product_price * (1 - upsell.discount_percent / 100));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Special Offer!
          </DialogTitle>
          <DialogDescription>
            Add this to your order with an exclusive discount
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex gap-4 items-center">
            {upsell.product_image && (
              <img
                src={upsell.product_image}
                alt={upsell.product_title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{upsell.product_title}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-accent">{discountedPrice.toLocaleString()} DA</span>
                <span className="text-sm text-muted-foreground line-through">
                  {upsell.product_price.toLocaleString()} DA
                </span>
              </div>
              <Badge className="bg-accent text-accent-foreground mt-1">
                {upsell.discount_percent}% OFF
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => onAddUpsell(upsell)}>
              Add to Order
            </Button>
            <Button variant="outline" className="flex-1" onClick={onSkip}>
              No Thanks
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
