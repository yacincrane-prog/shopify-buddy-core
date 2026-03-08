import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProductBySlug } from "@/lib/products";
import { fetchDiscountsForProduct, getDiscountedPrice } from "@/lib/quantity-discounts";
import { ProductGallery } from "@/components/product/ProductGallery";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { QuantityPricing } from "@/components/product/QuantityPricing";
import { BundleOffers } from "@/components/product/BundleOffers";
import { UpsellModal } from "@/components/product/UpsellModal";
import { CODCheckoutForm } from "@/components/checkout/CODCheckoutForm";
import { ExitIntentPopup } from "@/components/product/ExitIntentPopup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import type { UpsellWithProduct } from "@/lib/upsells";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellItem, setUpsellItem] = useState<{ title: string; price: number; discountedPrice: number; quantity: number } | null>(null);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
  });

  const { data: discountTiers } = useQuery({
    queryKey: ["quantity-discounts", product?.id],
    queryFn: () => fetchDiscountsForProduct(product!.id),
    enabled: !!product?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Product not found</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to store
          </Button>
        </Link>
      </div>
    );
  }

  const basePrice = Number(product.price);
  const unitPrice = discountTiers?.length ? getDiscountedPrice(basePrice, quantity, discountTiers) : basePrice;
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const inStock = product.inventory_quantity > 0;

  const handleOrderClick = () => {
    // Show upsell modal first, then checkout
    setShowUpsell(true);
  };

  const handleAddUpsell = (upsell: UpsellWithProduct) => {
    const discountedPrice = Math.round(upsell.product_price * (1 - upsell.discount_percent / 100));
    setUpsellItem({
      title: upsell.product_title,
      price: upsell.product_price,
      discountedPrice,
      quantity: 1,
    });
    setShowUpsell(false);
    setShowCheckout(true);
  };

  const handleSkipUpsell = () => {
    setShowUpsell(false);
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex items-center h-14">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Store</span>
          </Link>
        </div>
      </header>

      <main className="container py-8 md:py-12 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <ProductGallery images={product.images ?? []} title={product.title} />

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{product.title}</h1>
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-2xl font-bold">{Math.round(unitPrice).toLocaleString()} DA</span>
                {(hasDiscount || unitPrice < basePrice) && (
                  <span className="text-lg text-muted-foreground line-through">
                    {(hasDiscount ? Number(product.compare_at_price) : basePrice).toLocaleString()} DA
                  </span>
                )}
                {hasDiscount && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round((1 - product.price / product.compare_at_price!) * 100)}% off
                  </Badge>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            <div className="space-y-4 pt-2">
              {inStock ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <QuantitySelector value={quantity} onChange={setQuantity} max={product.inventory_quantity} />
                    <p className="text-xs text-muted-foreground">{product.inventory_quantity} in stock</p>
                  </div>

                  <QuantityPricing productId={product.id} basePrice={basePrice} quantity={quantity} />

                  {!showCheckout ? (
                    <Button size="lg" className="w-full" onClick={handleOrderClick}>
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Order now — {(Math.round(unitPrice) * quantity).toLocaleString()} DA
                    </Button>
                  ) : (
                    <CODCheckoutForm
                      product={product}
                      quantity={quantity}
                      unitPrice={Math.round(unitPrice)}
                      upsellItem={upsellItem}
                    />
                  )}

                  <BundleOffers productId={product.id} />
                </>
              ) : (
                <Button size="lg" className="w-full" disabled>
                  Out of stock
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <UpsellModal
        productId={product.id}
        open={showUpsell}
        onClose={() => setShowUpsell(false)}
        onAddUpsell={handleAddUpsell}
        onSkip={handleSkipUpsell}
      />

      <ExitIntentPopup />
    </div>
  );
}
