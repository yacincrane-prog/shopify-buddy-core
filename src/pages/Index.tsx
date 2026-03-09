import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useProducts } from "@/hooks/useProducts";
import { fetchStorefrontConfig } from "@/lib/storefront-config";
import { fetchActiveCategories, type Category } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Facebook, Instagram, ArrowLeft } from "lucide-react";

export default function Index() {
  const { data: products, isLoading } = useProducts();
  const { data: config } = useQuery({
    queryKey: ["storefront-config"],
    queryFn: fetchStorefrontConfig,
    staleTime: 5 * 60 * 1000,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["active-categories"],
    queryFn: fetchActiveCategories,
    staleTime: 5 * 60 * 1000,
  });

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const activeProducts = products?.filter((p) => p.is_active) ?? [];
  const filteredProducts = activeCategory
    ? activeProducts.filter((p: any) => p.category_id === activeCategory)
    : activeProducts;

  const storeName = config?.storeName ?? "المتجر";
  const gridClass =
    config?.featuredSection?.layout === "grid-2"
      ? "grid-cols-2"
      : config?.featuredSection?.layout === "grid-3"
        ? "grid-cols-2 sm:grid-cols-3"
        : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Announcement Bar */}
      {config?.announcementBar?.enabled && (
        <div className="bg-primary text-primary-foreground text-center py-2 text-xs sm:text-sm font-medium">
          {config.announcementBar.text}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="container px-4 flex items-center justify-between h-12 sm:h-14">
          <div className="flex items-center gap-2.5">
            {config?.logo ? (
              <img src={config.logo} alt={storeName} className="h-7 sm:h-8 object-contain" />
            ) : (
              <h1 className="text-base sm:text-lg font-semibold tracking-tight">{storeName}</h1>
            )}
          </div>
          <span className="text-sm text-muted-foreground">🇩🇿</span>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        {config?.hero?.enabled && (
          <section
            className="relative flex items-center justify-center text-center py-16 sm:py-24 md:py-32 bg-gradient-to-br from-primary/80 to-accent/60"
            style={
              config.hero.backgroundImage
                ? { backgroundImage: `url(${config.hero.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                : {}
            }
          >
            {config.hero.overlay && <div className="absolute inset-0 bg-black/40" />}
            <div className="relative z-10 container px-4 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                {config.hero.title}
              </h2>
              <p className="text-sm sm:text-base text-white/80 mt-3">{config.hero.subtitle}</p>
              {config.hero.buttonText && (
                <a href={config.hero.buttonLink || "#products"}>
                  <Button size="lg" className="mt-6 gap-2">
                    {config.hero.buttonText}
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>
          </section>
        )}

        {/* Categories */}
        {config?.featuredSection?.showCategories && categories.length > 0 && (
          <section className="container px-4 py-6">
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

        {/* Products */}
        <section id="products" className="container px-4 py-6 sm:py-8 md:py-12">
          {config?.featuredSection?.title && (
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
              {config.featuredSection.title}
            </h2>
          )}

          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">جاري التحميل…</div>
          ) : !filteredProducts.length ? (
            <div className="text-center py-16 px-4">
              <p className="text-lg text-muted-foreground">
                {activeCategory ? "لا توجد منتجات في هذه الفئة" : "لا توجد منتجات متاحة"}
              </p>
              {!activeCategory && (
                <Link to="/admin" className="mt-4 inline-block">
                  <Button variant="outline">أضف أول منتج</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className={`grid ${gridClass} gap-3 sm:gap-4 md:gap-6`}>
              {filteredProducts.map((product) => {
                const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
                return (
                  <Link key={product.id} to={`/product/${product.slug}`} className="group">
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
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
                            لا توجد صورة
                          </div>
                        )}
                      </div>
                      <CardContent className="p-2 sm:p-3">
                        <p className="font-medium text-xs sm:text-sm truncate">{product.title}</p>
                        <div className="flex items-baseline gap-1 sm:gap-2 mt-1 flex-wrap">
                          <span className="font-semibold text-xs sm:text-sm">{Number(product.price).toLocaleString()} د.ج</span>
                          {hasDiscount && (
                            <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                              {Number(product.compare_at_price).toLocaleString()} د.ج
                            </span>
                          )}
                        </div>
                        {product.inventory_quantity <= 0 && (
                          <Badge variant="secondary" className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs">نفذ المخزون</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      {config?.footer?.enabled && (
        <footer className="border-t border-border bg-card mt-auto">
          <div className="container px-4 py-6 sm:py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-sm mb-2">{storeName}</h3>
                <p className="text-xs text-muted-foreground">{config.footer.text}</p>
              </div>
              {(config.footer.phone || config.footer.email) && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs mb-2">تواصل معنا</h4>
                  {config.footer.phone && (
                    <a href={`tel:${config.footer.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                      <Phone className="w-3.5 h-3.5" /> {config.footer.phone}
                    </a>
                  )}
                  {config.footer.email && (
                    <a href={`mailto:${config.footer.email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                      <Mail className="w-3.5 h-3.5" /> {config.footer.email}
                    </a>
                  )}
                </div>
              )}
              {(config.footer.socialLinks?.facebook || config.footer.socialLinks?.instagram || config.footer.socialLinks?.tiktok) && (
                <div>
                  <h4 className="font-semibold text-xs mb-2">تابعنا</h4>
                  <div className="flex gap-3">
                    {config.footer.socialLinks.facebook && (
                      <a href={config.footer.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {config.footer.socialLinks.instagram && (
                      <a href={config.footer.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {config.footer.socialLinks.tiktok && (
                      <a href={config.footer.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.16 15.2a6.34 6.34 0 0 0 6.33 6.34 6.34 6.34 0 0 0 6.33-6.34V8.87a8.28 8.28 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1-.31Z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
