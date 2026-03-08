import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProductBySlug } from "@/lib/products";
import { fetchDiscountsForProduct, getDiscountedPrice } from "@/lib/quantity-discounts";
import { fetchSectionsForProduct } from "@/lib/product-sections";
import { fetchOffersForProduct, type QuantityOffer } from "@/lib/quantity-offers";
import { ProductGallery } from "@/components/product/ProductGallery";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { QuantityPricing } from "@/components/product/QuantityPricing";
import { BundleOffers } from "@/components/product/BundleOffers";
import { SmartQuantityOffers } from "@/components/product/SmartQuantityOffers";
import { UpsellModal } from "@/components/product/UpsellModal";
import { CODCheckoutForm } from "@/components/checkout/CODCheckoutForm";
import { ExitIntentPopup } from "@/components/product/ExitIntentPopup";
import { SectionRenderer } from "@/components/product/SectionRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import type { UpsellWithProduct } from "@/lib/upsells";
import { useTrackingPixels } from "@/hooks/useTrackingPixels";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellItem, setUpsellItem] = useState<{ title: string; price: number; discountedPrice: number; quantity: number } | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<QuantityOffer | null>(null);
  const { trackEvent } = useTrackingPixels();

  // Track PageView + ViewContent
  useEffect(() => {
    if (!product) return;
    trackEvent("PageView");
    trackEvent("ViewContent", {
      content_name: product.title,
      content_ids: [product.id],
      content_type: "product",
      value: Number(product.price),
      currency: "DZD",
    });
  }, [product?.id]);

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

  const { data: customSections } = useQuery({
    queryKey: ["product-sections", product?.id],
    queryFn: () => fetchSectionsForProduct(product!.id),
    enabled: !!product?.id,
  });

  const { data: quantityOffers } = useQuery({
    queryKey: ["quantity-offers", product?.id],
    queryFn: () => fetchOffersForProduct(product!.id),
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
  const hasOffers = (quantityOffers?.length ?? 0) > 0;

  // When a smart offer is selected, use its price; otherwise use discount tiers / base
  const activeQuantity = selectedOffer ? selectedOffer.quantity : quantity;
  const activeUnitPrice = selectedOffer
    ? Number(selectedOffer.price) / selectedOffer.quantity
    : discountTiers?.length
      ? getDiscountedPrice(basePrice, quantity, discountTiers)
      : basePrice;
  const activeTotalProductPrice = selectedOffer
    ? Number(selectedOffer.price)
    : Math.round(activeUnitPrice) * quantity;
  const freeDelivery = selectedOffer?.free_delivery ?? false;

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const inStock = product.inventory_quantity > 0;
  const hasCustomSections = (customSections?.length ?? 0) > 0;

  const handleOrderClick = () => {
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

  const handleOfferSelect = (offer: QuantityOffer) => {
    setSelectedOffer(offer);
    setQuantity(offer.quantity);
  };

  /** The quantity/order block used in both default and custom layouts */
  const renderOrderBlock = () => (
    <div className="space-y-4">
      {inStock ? (
        <>
          {/* Smart Quantity Offers replace the standard selector when available */}
          {hasOffers ? (
            <SmartQuantityOffers
              productId={product.id}
              basePrice={basePrice}
              selectedOfferId={selectedOffer?.id ?? null}
              onSelect={handleOfferSelect}
            />
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <QuantitySelector value={quantity} onChange={setQuantity} max={product.inventory_quantity} />
              <p className="text-xs text-muted-foreground">{product.inventory_quantity} in stock</p>
            </div>
          )}

          {!showCheckout ? (
            <Button size="lg" className="w-full" onClick={handleOrderClick}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Order now — {activeTotalProductPrice.toLocaleString()} DA
            </Button>
          ) : (
            <CODCheckoutForm
              product={product}
              quantity={activeQuantity}
              unitPrice={Math.round(activeUnitPrice)}
              upsellItem={upsellItem}
              freeDelivery={freeDelivery}
            />
          )}
        </>
      ) : (
        <Button size="lg" className="w-full" disabled>
          Out of stock
        </Button>
      )}
    </div>
  );

  // Display price — use offer price when selected
  const displayPrice = selectedOffer ? Number(selectedOffer.price) : Math.round(activeUnitPrice);
  const displayComparePrice = selectedOffer
    ? basePrice * selectedOffer.quantity
    : hasDiscount
      ? Number(product.compare_at_price)
      : activeUnitPrice < basePrice
        ? basePrice
        : null;

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
        {hasCustomSections ? (
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="md:col-span-2">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{product.title}</h1>
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-2xl font-bold">{displayPrice.toLocaleString()} DA</span>
                {displayComparePrice && displayComparePrice > displayPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {displayComparePrice.toLocaleString()} DA
                  </span>
                )}
                {hasDiscount && !selectedOffer && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round((1 - product.price / product.compare_at_price!) * 100)}% off
                  </Badge>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <SectionRenderer
                product={product}
                basePrice={basePrice}
                quantity={activeQuantity}
                renderOrderBlock={renderOrderBlock}
              />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <ProductGallery images={product.images ?? []} title={product.title} />

            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{product.title}</h1>
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-2xl font-bold">{displayPrice.toLocaleString()} DA</span>
                  {displayComparePrice && displayComparePrice > displayPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      {displayComparePrice.toLocaleString()} DA
                    </span>
                  )}
                  {hasDiscount && !selectedOffer && (
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
                {renderOrderBlock()}

                {!hasOffers && (
                  <QuantityPricing productId={product.id} basePrice={basePrice} quantity={quantity} />
                )}

                <BundleOffers productId={product.id} />
              </div>
            </div>
          </div>
        )}
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
