import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Eye } from "lucide-react";

interface UpsellPreviewProps {
  sourceName: string;
  targetName: string;
  targetPrice: number;
  discountPercent: number;
  targetImage?: string;
}

export function UpsellPreviewButton({ sourceName, targetName, targetPrice, discountPercent, targetImage }: UpsellPreviewProps) {
  const [open, setOpen] = useState(false);
  const discountedPrice = Math.round(targetPrice * (1 - discountPercent / 100));

  return (
    <>
      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setOpen(true)} title="Preview upsell">
        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Upsell Preview</p>
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
              {targetImage ? (
                <img src={targetImage} alt={targetName} className="w-20 h-20 rounded-lg object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">No image</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{targetName}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-bold text-accent">{discountedPrice.toLocaleString()} DA</span>
                  <span className="text-sm text-muted-foreground line-through">
                    {targetPrice.toLocaleString()} DA
                  </span>
                </div>
                <Badge className="bg-accent text-accent-foreground mt-1">
                  {discountPercent}% OFF
                </Badge>
              </div>
            </div>

            <div className="flex gap-2 pointer-events-none opacity-70">
              <Button className="flex-1">Add to Order</Button>
              <Button variant="outline" className="flex-1">No Thanks</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
