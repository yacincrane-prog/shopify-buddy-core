import { type StorefrontConfig } from "@/lib/storefront-config";

interface Props {
  config: StorefrontConfig;
  storeName: string;
}

export function StorefrontHeader({ config, storeName }: Props) {
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
        <span className="text-sm text-muted-foreground">🇩🇿</span>
      </div>
    </header>
  );
}
