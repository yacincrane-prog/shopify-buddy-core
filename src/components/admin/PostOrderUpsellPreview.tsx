import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, ShoppingBag, X as XIcon, Eye } from "lucide-react";

interface PostOrderUpsellPreviewProps {
  headline: string;
  productTitle: string;
  productPrice: number;
  discountPercent: number;
  acceptText: string;
  declineText: string;
  productImage?: string;
}

export function PostOrderUpsellPreviewButton(props: PostOrderUpsellPreviewProps) {
  const [open, setOpen] = useState(false);
  const discountedPrice = Math.round(props.productPrice * (1 - props.discountPercent / 100));
  const savings = props.productPrice - discountedPrice;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} title="Preview post-order upsell">
        <Eye className="w-3.5 h-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">Post-Order Upsell Preview</DialogTitle>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-4 pt-3">Post-Order Upsell Preview</p>
          <Card className="border-accent/30 overflow-hidden border-0 shadow-none">
            <div className="h-1 bg-accent w-full" />
            <CardContent className="py-8 px-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto">
                  <Gift className="w-7 h-7 text-accent" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">{props.headline}</h2>
              </div>

              <div className="flex gap-4 items-center bg-secondary/50 rounded-xl p-4">
                {props.productImage ? (
                  <img src={props.productImage} alt={props.productTitle} className="w-24 h-24 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-muted shrink-0 flex items-center justify-center text-muted-foreground text-xs">No image</div>
                )}
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="font-semibold text-lg">{props.productTitle}</p>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-2xl font-bold text-accent">{discountedPrice.toLocaleString()} DA</span>
                    <span className="text-base text-muted-foreground line-through">{props.productPrice.toLocaleString()} DA</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-accent text-accent-foreground text-xs">{props.discountPercent}% OFF</Badge>
                    <Badge variant="secondary" className="text-xs">Save {savings.toLocaleString()} DA</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pointer-events-none opacity-70">
                <Button size="lg" className="w-full text-base">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {props.acceptText} — {discountedPrice.toLocaleString()} DA
                </Button>
                <p className="w-full text-center text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                  <XIcon className="w-3.5 h-3.5" />
                  {props.declineText}
                </p>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}
