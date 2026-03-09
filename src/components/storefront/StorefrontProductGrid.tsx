import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type StorefrontConfig } from "@/lib/storefront-config";

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  inventory_quantity: number;
  is_active: boolean;
  category_id?: string | null;
}

interface Props {
  config: StorefrontConfig;
  products: Product[];
  isLoading: boolean;
  activeCategory: string | null;
}

export function StorefrontProductGrid({ config, products, isLoading, activeCategory }: Props) {
  const gridClass =
    config.featuredSection?.layout === "grid-2"
      ? "grid-cols-2"
      : config.featuredSection?.layout === "grid-3"
        ? "grid-cols-2 sm:grid-cols-3"
        : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <section id="products" className="container px-4 py-6 sm:py-8 md:py-12">
      {config.featuredSection?.title && (
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
          {config.featuredSection.title}
        </h2>
      )}

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">جاري التحميل…</div>
      ) : !products.length ? (
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
          {products.map((product) => {
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
  );
}
