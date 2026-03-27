import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProductBySlug } from "@/lib/products";
import { fetchDiscountsForProduct, getDiscountedPrice } from "@/lib/quantity-discounts";
import { fetchSectionsForProduct } from "@/lib/product-sections";
import { fetchOffersForProduct, type QuantityOffer } from "@/lib/quantity-offers";
import { fetchStorefrontConfig } from "@/lib/storefront-config";
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
import { ArrowRight, ShoppingBag } from "lucide-react";
import type { UpsellWithProduct } from "@/lib/upsells";
import { useTrackingPixels } from "@/hooks/useTrackingPixels";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellItem, setUpsellItem] = useState<{ title: string; price: number; discountedPrice: number; quantity: number } | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<QuantityOffer | null>(null);
  const { trackEvent } = useTrackingPixels();
  const { addItem } = useCart();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
  });

  const { data: storefrontConfig } = useQuery({
    queryKey: ["storefront-config"],
    queryFn: fetchStorefrontConfig,
  });

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
        جاري التحميل…
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" dir="rtl">
        <p className="text-lg text-muted-foreground">المنتج غير موجود</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للمتجر
          </Button>
        </Link>
      </div>
    );
  }

  const basePrice = Number(product.price);
  const hasOffers = (quantityOffers?.length ?? 0) > 0;
  const alwaysShowForm = storefrontConfig?.productPage?.alwaysShowCheckoutForm ?? true;
  const formPosition = storefrontConfig?.productPage?.checkoutFormPosition ?? "below_title";

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
    trackEvent("AddToCart", {
      content_name: product.title,
      content_ids: [product.id],
      value: activeTotalProductPrice,
      currency: "DZD",
    });
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
  };

  const handleSkipUpsell = () => {
    setShowUpsell(false);
  };

  const handleOfferSelect = (offer: QuantityOffer) => {
    setSelectedOffer(offer);
    setQuantity(offer.quantity);
  };

  const renderQuantityBlock = () => (
    <>
      {hasOffers ? (
        <SmartQuantityOffers
          productId={product.id}
          basePrice={basePrice}
          selectedOfferId={selectedOffer?.id ?? null}
          onSelect={handleOfferSelect}
        />
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium">الكمية</label>
          <QuantitySelector value={quantity} onChange={setQuantity} max={product.inventory_quantity} />
          <p className="text-xs text-muted-foreground">{product.inventory_quantity} متوفر في المخزون</p>
        </div>
      )}
    </>
  );

  const renderCheckoutForm = () => (
    <CODCheckoutForm
      product={product}
      quantity={activeQuantity}
      unitPrice={Math.round(activeUnitPrice)}
      upsellItem={upsellItem}
      freeDelivery={freeDelivery}
    />
  );

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      price: Math.round(activeUnitPrice),
      compareAtPrice: product.compare_at_price,
      image: product.images?.[0] ?? null,
      maxQuantity: product.inventory_quantity,
      quantity: activeQuantity,
    });
    toast.success("تمت الإضافة إلى السلة");
  };

  const renderOrderBlock = () => (
    <div className="space-y-3">
      {inStock ? (
        <>
          {renderQuantityBlock()}

          {alwaysShowForm ? (
            renderCheckoutForm()
          ) : (
            <Button size="lg" className="w-full text-sm sm:text-base" onClick={handleOrderClick}>
              <ShoppingBag className="w-4 h-4 ml-2" />
              اطلب الآن — {activeTotalProductPrice.toLocaleString()} د.ج
            </Button>
          )}

          <Button
            size="lg"
            variant="outline"
            className="w-full text-sm sm:text-base"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="w-4 h-4 ml-2" />
            أضف إلى السلة
          </Button>
        </>
      ) : (
        <Button size="lg" className="w-full" disabled>
          نفذ المخزون
        </Button>
      )}
    </div>
  );

  const displayPrice = selectedOffer ? Number(selectedOffer.price) : Math.round(activeUnitPrice);
  const displayComparePrice = selectedOffer
    ? basePrice * selectedOffer.quantity
    : hasDiscount
      ? Number(product.compare_at_price)
      : activeUnitPrice < basePrice
        ? basePrice
        : null;

  const renderPriceBlock = () => (
    <div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">{product.title}</h1>
      <div className="flex items-baseline gap-2 sm:gap-3 mt-2 sm:mt-3 flex-wrap">
        <span className="text-xl sm:text-2xl font-bold">{displayPrice.toLocaleString()} د.ج</span>
        {displayComparePrice && displayComparePrice > displayPrice && (
          <span className="text-base sm:text-lg text-muted-foreground line-through">
            {displayComparePrice.toLocaleString()} د.ج
          </span>
        )}
        {hasDiscount && !selectedOffer && (
          <Badge variant="secondary" className="text-xs">
            خصم {Math.round((1 - product.price / product.compare_at_price!) * 100)}%
          </Badge>
        )}
      </div>
    </div>
  );

  // For default layout (no custom sections), position the form based on config
  const renderDefaultLayout = () => {
    const galleryBlock = <ProductGallery images={product.images ?? []} title={product.title} />;
    const descBlock = product.description ? (
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{product.description}</p>
    ) : null;
    const extraBlock = (
      <>
        {!hasOffers && <QuantityPricing productId={product.id} basePrice={basePrice} quantity={quantity} />}
        <BundleOffers productId={product.id} />
      </>
    );

    // Build content sections in order based on formPosition
    const contentSections: React.ReactNode[] = [];

    if (formPosition === "below_title") {
      contentSections.push(renderPriceBlock());
      contentSections.push(renderOrderBlock());
      if (descBlock) contentSections.push(descBlock);
      contentSections.push(extraBlock);
    } else if (formPosition === "below_gallery") {
      // Form goes after gallery in left column context - we put it after price
      contentSections.push(renderPriceBlock());
      if (descBlock) contentSections.push(descBlock);
      contentSections.push(renderOrderBlock());
      contentSections.push(extraBlock);
    } else if (formPosition === "below_description") {
      contentSections.push(renderPriceBlock());
      if (descBlock) contentSections.push(descBlock);
      contentSections.push(renderOrderBlock());
      contentSections.push(extraBlock);
    } else {
      // bottom
      contentSections.push(renderPriceBlock());
      if (descBlock) contentSections.push(descBlock);
      contentSections.push(extraBlock);
      contentSections.push(renderOrderBlock());
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
        {formPosition === "below_gallery" ? (
          <div className="space-y-4">
            {galleryBlock}
            {renderOrderBlock()}
          </div>
        ) : (
          galleryBlock
        )}

        <div className="space-y-4 sm:space-y-6">
          {formPosition === "below_gallery" ? (
            <>
              {renderPriceBlock()}
              {descBlock}
              {extraBlock}
            </>
          ) : (
            contentSections.map((node, i) => <div key={i}>{node}</div>)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b border-border bg-card">
        <div className="container px-4 flex items-center h-12 sm:h-14">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="w-4 h-4" />
            <span className="text-sm">المتجر</span>
          </Link>
        </div>
      </header>

      <main className="container px-4 py-6 sm:py-8 md:py-12 max-w-5xl">
        {hasCustomSections ? (
          <div className="space-y-6">
            {renderPriceBlock()}
            <SectionRenderer
              product={product}
              basePrice={basePrice}
              quantity={activeQuantity}
              renderOrderBlock={renderOrderBlock}
            />
          </div>
        ) : (
          renderDefaultLayout()
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
