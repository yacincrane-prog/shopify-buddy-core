import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Index() {
  const { data: products, isLoading } = useProducts();
  const activeProducts = products?.filter((p) => p.is_active) ?? [];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b border-border bg-card">
        <div className="container px-4 flex items-center justify-between h-12 sm:h-14">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight">المتجر</h1>
          <span className="text-sm text-muted-foreground">🇩🇿</span>
        </div>
      </header>

      <main className="container px-4 py-6 sm:py-8 md:py-12">
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">جاري التحميل…</div>
        ) : !activeProducts.length ? (
          <div className="text-center py-16 px-4">
            <p className="text-lg text-muted-foreground">لا توجد منتجات متاحة</p>
            <Link to="/admin" className="mt-4 inline-block">
              <Button variant="outline">أضف أول منتج</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {activeProducts.map((product) => {
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
      </main>
    </div>
  );
}
