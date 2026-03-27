import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { fetchStorefrontConfig, type StorefrontConfig } from "@/lib/storefront-config";
import { fetchActiveCategories } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontHero } from "@/components/storefront/StorefrontHero";
import { StorefrontProductGrid } from "@/components/storefront/StorefrontProductGrid";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { StorefrontSearch } from "@/components/storefront/StorefrontSearch";
import { Flame, Tag } from "lucide-react";

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

  const activeProducts = useMemo(() => products?.filter((p) => p.is_active) ?? [], [products]);

  const filteredProducts = useMemo(() => {
    let list = activeProducts;
    if (activeCategory) {
      list = list.filter((p: any) => p.category_id === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    return list;
  }, [activeProducts, activeCategory, searchQuery]);

  // Products with discounts (offers)
  const offersProducts = useMemo(
    () => activeProducts.filter((p) => p.compare_at_price && p.compare_at_price > p.price),
    [activeProducts]
  );

  // Best sellers: top products by lowest inventory (most sold) - simple heuristic
  const bestSellers = useMemo(
    () => [...activeProducts].sort((a, b) => a.inventory_quantity - b.inventory_quantity).slice(0, 8),
    [activeProducts]
  );

  if (!config) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {config.announcementBar?.enabled && (
        <div className="bg-primary text-primary-foreground text-center py-2 text-xs sm:text-sm font-medium">
          {config.announcementBar.text}
        </div>
      )}

      <StorefrontHeader config={config} storeName={storeName} />

      <main className="flex-1">
        <StorefrontHero config={config} />

        <StorefrontSearch value={searchQuery} onChange={setSearchQuery} />

        {/* Categories Section */}
        {config.featuredSection?.showCategories && categories.length > 0 && (
          <section className="container px-4 pt-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              الأقسام
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <button
                onClick={() => setActiveCategory(null)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all h-24 sm:h-28 flex items-center justify-center ${
                  !activeCategory
                    ? "border-accent bg-accent/10 shadow-md"
                    : "border-border bg-card hover:border-accent/50"
                }`}
              >
                <span className="text-sm font-semibold">الكل</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all h-24 sm:h-28 group ${
                    activeCategory === cat.id
                      ? "border-accent shadow-md"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  {cat.image ? (
                    <>
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-muted" />
                  )}
                  <span className="relative z-10 text-xs sm:text-sm font-semibold text-white drop-shadow-md mt-auto p-2 self-end">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Offers Section */}
        {offersProducts.length > 0 && !searchQuery && !activeCategory && (
          <section className="container px-4 pt-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-accent" />
              عروض خاصة
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {offersProducts.slice(0, 10).map((product) => {
                const discount = Math.round((1 - product.price / product.compare_at_price!) * 100);
                return (
                  <Link key={product.id} to={`/product/${product.slug}`} className="shrink-0 w-36 sm:w-44 group">
                    <Card className="overflow-hidden border-accent/30 hover:border-accent transition-colors">
                      <div className="aspect-square bg-muted overflow-hidden relative">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">لا صورة</div>
                        )}
                        <Badge className="absolute top-1.5 start-1.5 bg-accent text-accent-foreground text-[10px]">
                          -{discount}%
                        </Badge>
                      </div>
                      <CardContent className="p-2">
                        <p className="font-medium text-xs truncate">{product.title}</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="font-semibold text-xs">{Number(product.price).toLocaleString()} د.ج</span>
                          <span className="text-[10px] text-muted-foreground line-through">
                            {Number(product.compare_at_price).toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Best Sellers */}
        {bestSellers.length > 0 && !searchQuery && !activeCategory && (
          <section className="container px-4 pt-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-destructive" />
              الأكثر مبيعاً
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {bestSellers.map((product) => (
                <Link key={product.id} to={`/product/${product.slug}`} className="shrink-0 w-36 sm:w-44 group">
                  <Card className="overflow-hidden border-border hover:border-accent transition-colors">
                    <div className="aspect-square bg-muted overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">لا صورة</div>
                      )}
                    </div>
                    <CardContent className="p-2">
                      <p className="font-medium text-xs truncate">{product.title}</p>
                      <span className="font-semibold text-xs">{Number(product.price).toLocaleString()} د.ج</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Products Grid */}
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
