import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchActiveExitIntent, type ExitIntentConfig } from "@/lib/exit-intent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Percent, Tag, Heart, Star } from "lucide-react";

const SESSION_KEY = "exit_intent_shown";

const ICON_MAP: Record<string, React.ElementType> = {
  gift: Gift,
  percent: Percent,
  tag: Tag,
  heart: Heart,
  star: Star,
};

const RADIUS_MAP: Record<string, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
};

const ANIM_MAP: Record<string, string> = {
  fade: "animate-in fade-in duration-300",
  slide_up: "animate-in slide-in-from-bottom duration-300",
  scale: "animate-in zoom-in-95 duration-300",
  bounce: "animate-in zoom-in-95 duration-500",
};

function CountdownTimer({ minutes }: { minutes: number }) {
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

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const readyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: popup } = useQuery({
    queryKey: ["exit-intent-active"],
    queryFn: fetchActiveExitIntent,
  });

  const show = useCallback(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (!popup) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setOpen(true);
  }, [popup]);

  // Delay gate
  useEffect(() => {
    if (!popup) return;
    const delay = (popup.config?.delaySeconds ?? 0) * 1000;
    if (delay <= 0) {
      readyRef.current = true;
      return;
    }
    const t = setTimeout(() => {
      readyRef.current = true;
    }, delay);
    return () => clearTimeout(t);
  }, [popup]);

  // Mouse leave trigger
  useEffect(() => {
    if (!popup) return;
    const cfg = popup.config;
    if (cfg.triggerType !== "mouse_leave" && cfg.triggerType !== "mouse_leave_or_time") return;

    const handler = (e: MouseEvent) => {
      if (e.clientY > 10) return;
      if (!readyRef.current) return;
      show();
    };
    document.addEventListener("mouseleave", handler);
    return () => document.removeEventListener("mouseleave", handler);
  }, [popup, show]);

  // Time trigger
  useEffect(() => {
    if (!popup) return;
    const cfg = popup.config;
    if (cfg.triggerType !== "time" && cfg.triggerType !== "mouse_leave_or_time") return;
    const delay = (cfg.delaySeconds || 5) * 1000;
    timerRef.current = setTimeout(() => show(), delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [popup, show]);

  // Scroll trigger
  useEffect(() => {
    if (!popup) return;
    if (popup.config.triggerType !== "scroll") return;
    const handler = () => {
      if (!readyRef.current) return;
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (pct >= (popup.config.scrollPercent || 50)) show();
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [popup, show]);

  // Mobile check
  useEffect(() => {
    if (!popup) return;
    if (!popup.config.showOnMobile && window.innerWidth < 768) {
      // Don't show on mobile
    }
  }, [popup]);

  if (!popup) return null;
  if (!popup.config.showOnMobile && typeof window !== "undefined" && window.innerWidth < 768) return null;

  const cfg = popup.config;
  const IconComp = cfg.iconType !== "none" ? ICON_MAP[cfg.iconType] || Gift : null;

  const customStyles: React.CSSProperties = {
    ...(cfg.bgColor ? { backgroundColor: cfg.bgColor } : {}),
    ...(cfg.textColor ? { color: cfg.textColor } : {}),
  };

  return (
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
              <CountdownTimer minutes={cfg.timerMinutes || 5} />
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
              <p className="font-mono font-bold text-lg tracking-wider" dir="ltr">
                {popup.discount_code}
              </p>
            </div>
          ) : null}

          <Button
            size="lg"
            className="w-full"
            style={{
              ...(cfg.buttonColor ? { backgroundColor: cfg.buttonColor } : {}),
              ...(cfg.buttonTextColor ? { color: cfg.buttonTextColor } : {}),
            }}
            onClick={() => setOpen(false)}
          >
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
