import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickyOrderBarProps {
  totalPrice: number;
  quantity: number;
  onOrderClick: () => void;
  triggerElementId?: string;
}

export function StickyOrderBar({
  totalPrice,
  quantity,
  onOrderClick,
  triggerElementId = "lp-order-section",
}: StickyOrderBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const trigger = document.getElementById(triggerElementId);
    if (!trigger) {
      const handleScroll = () => setVisible(window.scrollY > 300);
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [triggerElementId]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-md shadow-[0_-4px_20px_-4px_hsl(var(--foreground)/0.08)]" dir="rtl">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg font-bold whitespace-nowrap">
            {totalPrice.toLocaleString()} د.ج
          </span>
          {quantity > 1 && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              × {quantity}
            </span>
          )}
        </div>
        <Button size="lg" className="shrink-0 text-sm px-6" onClick={onOrderClick}>
          <ShoppingBag className="w-4 h-4 ml-2" />
          اطلب الآن
        </Button>
      </div>
    </div>
  );
}
