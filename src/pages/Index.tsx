import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProducts } from "@/hooks/useProducts";
import { fetchStorefrontConfig, type StorefrontConfig } from "@/lib/storefront-config";
import { fetchActiveCategories } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontHero } from "@/components/storefront/StorefrontHero";
import { StorefrontProductGrid } from "@/components/storefront/StorefrontProductGrid";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { StorefrontSearch } from "@/components/storefront/StorefrontSearch";

export default function Index() {
  const { data: products, isLoading } = useProducts();
  const { data: savedConfig } = useQuery({
    queryKey: ["storefront-config"],
    queryFn: fetchStorefrontConfig,
    staleTime: 5 * 60 * 1000,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["active-categories"],
    queryFn: fetchActiveCategories,
    staleTime: 5 * 60 * 1000,
  });

  // Support instant preview via postMessage from admin
  const [previewConfig, setPreviewConfig] = useState<StorefrontConfig | null>(null);
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "storefront-config-preview") {
        setPreviewConfig(e.data.config);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const config = previewConfig ?? savedConfig;

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const storeName = config?.storeName ?? "المتجر";

  const filteredProducts = useMemo(() => {
    let list = products?.filter((p) => p.is_active) ?? [];
    if (activeCategory) {
      list = list.filter((p: any) => p.category_id === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    return list;
  }, [products, activeCategory, searchQuery]);

  if (!config) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Announcement Bar */}
      {config.announcementBar?.enabled && (
        <div className="bg-primary text-primary-foreground text-center py-2 text-xs sm:text-sm font-medium">
          {config.announcementBar.text}
        </div>
      )}

      <StorefrontHeader config={config} storeName={storeName} />

      <main className="flex-1">
        <StorefrontHero config={config} />

        {/* Search */}
        <StorefrontSearch value={searchQuery} onChange={setSearchQuery} />

        {/* Categories */}
        {config.featuredSection?.showCategories && categories.length > 0 && (
          <section className="container px-4 pt-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                size="sm"
                variant={!activeCategory ? "default" : "outline"}
                className="shrink-0 h-8 text-xs"
                onClick={() => setActiveCategory(null)}
              >
                الكل
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  className="shrink-0 h-8 text-xs gap-1.5"
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.image && <img src={cat.image} alt="" className="w-4 h-4 rounded-sm object-cover" />}
                  {cat.name}
                </Button>
              ))}
            </div>
          </section>
        )}

        <StorefrontProductGrid
          config={config}
          products={filteredProducts}
          isLoading={isLoading}
          activeCategory={activeCategory}
        />
      </main>

      <StorefrontFooter config={config} storeName={storeName} />
    </div>
  );
}
