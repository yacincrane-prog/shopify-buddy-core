import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Percent, Tag, Heart, Star, Eye } from "lucide-react";
import type { ExitIntentPopup, ExitIntentConfig, DEFAULT_EXIT_CONFIG } from "@/lib/exit-intent";

const ICON_MAP: Record<string, React.ElementType> = {
  gift: Gift, percent: Percent, tag: Tag, heart: Heart, star: Star,
};
const RADIUS_MAP: Record<string, string> = { sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", xl: "rounded-xl" };
const ANIM_MAP: Record<string, string> = {
  fade: "animate-in fade-in duration-300",
  slide_up: "animate-in slide-in-from-bottom duration-300",
  scale: "animate-in zoom-in-95 duration-300",
  bounce: "animate-in zoom-in-95 duration-500",
};

function MiniTimer({ minutes }: { minutes: number }) {
  const [secs, setSecs] = useState(minutes * 60);
  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secs]);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return (
    <div className="font-mono text-2xl font-bold tracking-wider" dir="ltr">
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </div>
  );
}

interface Props {
  popup: ExitIntentPopup;
}

export function ExitIntentPreviewButton({ popup }: Props) {
  const [open, setOpen] = useState(false);
  const cfg = popup.config;
  const IconComp = cfg.iconType !== "none" ? ICON_MAP[cfg.iconType] || Gift : null;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} title="معاينة">
        <Eye className="w-3.5 h-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={`sm:max-w-md text-center ${RADIUS_MAP[cfg.borderRadius] || ""} ${ANIM_MAP[cfg.animation] || ""}`}
          dir="rtl"
          style={{
            ...(cfg.bgColor ? { backgroundColor: cfg.bgColor } : {}),
            ...(cfg.textColor ? { color: cfg.textColor } : {}),
          }}
        >
          <DialogHeader className="items-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">معاينة نية الخروج</p>
            {IconComp && (
              <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mb-2 mx-auto">
                <IconComp className="w-7 h-7 text-accent" />
              </div>
            )}
            <DialogTitle className="text-xl" style={cfg.textColor ? { color: cfg.textColor } : {}}>
              {popup.title}
            </DialogTitle>
            <DialogDescription className="text-base" style={cfg.textColor ? { color: cfg.textColor, opacity: 0.8 } : {}}>
              {popup.subtitle}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {cfg.showTimer && (
              <div className="flex justify-center">
                <MiniTimer minutes={cfg.timerMinutes || 5} />
              </div>
            )}

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

            <div className="pointer-events-none opacity-70">
              <Button
                size="lg"
                className="w-full"
                style={{
                  ...(cfg.buttonColor ? { backgroundColor: cfg.buttonColor } : {}),
                  ...(cfg.buttonTextColor ? { color: cfg.buttonTextColor } : {}),
                }}
              >
                {popup.cta_text}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">لا شكراً</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
