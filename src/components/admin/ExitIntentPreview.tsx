import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Eye } from "lucide-react";

interface ExitIntentPreviewProps {
  title: string;
  subtitle: string;
  discountPercent?: number | null;
  discountCode?: string | null;
  ctaText: string;
}

export function ExitIntentPreviewButton({ title, subtitle, discountPercent, discountCode, ctaText }: ExitIntentPreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} title="Preview popup">
        <Eye className="w-3.5 h-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Exit Intent Preview</p>
            <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mb-2 mx-auto">
              <Gift className="w-7 h-7 text-accent" />
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
            <DialogDescription className="text-base">{subtitle}</DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {discountPercent ? (
              <div className="flex justify-center">
                <Badge className="bg-accent text-accent-foreground text-lg px-4 py-2">
                  {discountPercent}% OFF
                </Badge>
              </div>
            ) : null}

            {discountCode ? (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Use code:</p>
                <p className="font-mono font-bold text-lg tracking-wider">{discountCode}</p>
              </div>
            ) : null}

            <div className="pointer-events-none opacity-70">
              <Button size="lg" className="w-full">{ctaText}</Button>
            </div>
            <p className="text-sm text-muted-foreground">No thanks, I'll pass</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
