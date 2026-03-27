import { useCart } from "@/hooks/useCart";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { CODCheckoutForm } from "@/components/checkout/CODCheckoutForm";
import { useState } from "react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4" dir="rtl">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
        <p className="text-lg text-muted-foreground">سلة التسوق فارغة</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للمتجر
          </Button>
        </Link>
      </div>
    );
  }

  // Build a combined product for checkout form
  const cartProduct = {
    id: items[0].productId,
    title: items.map((i) => `${i.title} x${i.quantity}`).join(" + "),
    price: totalPrice,
    compare_at_price: null,
    images: items[0].image ? [items[0].image] : [],
    inventory_quantity: 999,
    is_active: true,
    slug: "cart",
    description: null,
    created_at: "",
    updated_at: "",
    category_id: null,
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b border-border bg-card">
        <div className="container px-4 flex items-center h-12 sm:h-14">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="w-4 h-4" />
            <span className="text-sm">المتجر</span>
          </Link>
          <h1 className="text-sm font-semibold mr-auto">السلة</h1>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-3xl">
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.productId} className="overflow-hidden">
              <CardContent className="p-3 flex gap-3">
                <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">لا صورة</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.slug}`} className="text-sm font-medium hover:underline truncate block">
                    {item.title}
                  </Link>
                  <p className="text-sm font-semibold mt-1">{item.price.toLocaleString()} د.ج</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.maxQuantity}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive ms-auto" onClick={() => removeItem(item.productId)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between text-base font-semibold">
            <span>المجموع</span>
            <span>{totalPrice.toLocaleString()} د.ج</span>
          </div>
        </div>

        {!showCheckout ? (
          <Button className="w-full mt-4" size="lg" onClick={() => setShowCheckout(true)}>
            إتمام الطلب
          </Button>
        ) : (
          <div className="mt-6">
            <CODCheckoutForm
              product={cartProduct as any}
              quantity={1}
              unitPrice={totalPrice}
              upsellItem={null}
              freeDelivery={false}
            />
          </div>
        )}
      </main>
    </div>
  );
}
