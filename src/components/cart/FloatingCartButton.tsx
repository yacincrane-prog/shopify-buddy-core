import { useCart } from "@/hooks/useCart";
import { ShoppingBag } from "lucide-react";

export function FloatingCartButton() {
  const { totalItems, setIsOpen } = useCart();

  if (totalItems === 0) return null;

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-5 start-5 z-50 bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
      aria-label="فتح السلة"
    >
      <ShoppingBag className="w-6 h-6" />
      <span className="absolute -top-1 -end-1 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
        {totalItems}
      </span>
    </button>
  );
}
