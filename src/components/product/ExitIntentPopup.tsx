import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchActiveExitIntent } from "@/lib/exit-intent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";

const SESSION_KEY = "exit_intent_shown";

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);

  const { data: popup } = useQuery({
    queryKey: ["exit-intent-active"],
    queryFn: fetchActiveExitIntent,
  });

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (e.clientY > 10) return;
      if (sessionStorage.getItem(SESSION_KEY)) return;
      if (!popup) return;
      sessionStorage.setItem(SESSION_KEY, "1");
      setOpen(true);
    },
    [popup]
  );

  useEffect(() => {
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [handleMouseLeave]);

  if (!popup) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md text-center" dir="rtl">
        <DialogHeader className="items-center">
          <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mb-2 mx-auto">
            <Gift className="w-7 h-7 text-accent" />
          </div>
          <DialogTitle className="text-xl">{popup.title}</DialogTitle>
          <DialogDescription className="text-base">{popup.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {popup.discount_percent ? (
            <div className="flex justify-center">
              <Badge className="bg-accent text-accent-foreground text-lg px-4 py-2">
                خصم {popup.discount_percent}%
              </Badge>
            </div>
          ) : null}

          {popup.discount_code ? (
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">استخدم الكود:</p>
              <p className="font-mono font-bold text-lg tracking-wider" dir="ltr">{popup.discount_code}</p>
            </div>
          ) : null}

          <Button size="lg" className="w-full" onClick={() => setOpen(false)}>
            {popup.cta_text}
          </Button>
          <button
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setOpen(false)}
          >
            لا شكراً
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
