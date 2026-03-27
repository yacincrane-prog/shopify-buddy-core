import { type StorefrontConfig } from "@/lib/storefront-config";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  config: StorefrontConfig;
  storeName: string;
}

export function StorefrontHeader({ config, storeName }: Props) {
  const { totalItems, setIsOpen } = useCart();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-20">
      <div className="container px-4 flex items-center justify-between h-12 sm:h-14">
        <div className="flex items-center gap-2.5">
          {config.logo ? (
            <img src={config.logo} alt={storeName} className="h-7 sm:h-8 object-contain" />
          ) : (
            <h1 className="text-base sm:text-lg font-semibold tracking-tight">{storeName}</h1>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="فتح السلة"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -end-1 bg-accent text-accent-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <span className="text-sm text-muted-foreground">🇩🇿</span>
        </div>
      </div>
    </header>
  );
}
