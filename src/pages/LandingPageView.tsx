import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchLandingPageBySlug,
  fetchLPSections,
  type LPSection,
} from "@/lib/landing-pages";
import { fetchOffersForProduct, type QuantityOffer } from "@/lib/quantity-offers";
import { fetchDiscountsForProduct, getDiscountedPrice } from "@/lib/quantity-discounts";
import { ProductGallery } from "@/components/product/ProductGallery";
import { SmartQuantityOffers } from "@/components/product/SmartQuantityOffers";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { CODCheckoutForm } from "@/components/checkout/CODCheckoutForm";
import { ExitIntentPopup } from "@/components/product/ExitIntentPopup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, ShoppingBag, Star, HelpCircle, Play, Shield, Clock } from "lucide-react";
import type { Product } from "@/types/product";

export default function LandingPageView() {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading: pageLoading } = useQuery({
    queryKey: ["landing-page", slug],
    queryFn: () => fetchLandingPageBySlug(slug!),
    enabled: !!slug,
  });

  const { data: product } = useQuery({
    queryKey: ["landing-page-product", page?.product_id],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("id", page!.product_id).single();
      return data as Product | null;
    },
    enabled: !!page?.product_id,
  });

  const { data: sections } = useQuery({
    queryKey: ["landing-page-sections", page?.id],
    queryFn: () => fetchLPSections(page!.id),
    enabled: !!page?.id,
  });

  const { data: quantityOffers } = useQuery({
    queryKey: ["quantity-offers", product?.id],
    queryFn: () => fetchOffersForProduct(product!.id),
    enabled: !!product?.id,
  });

  const { data: discountTiers } = useQuery({
    queryKey: ["quantity-discounts", product?.id],
    queryFn: () => fetchDiscountsForProduct(product!.id),
    enabled: !!product?.id,
  });

  const [quantity, setQuantity] = useState(1);
  const [selectedOffer, setSelectedOffer] = useState<QuantityOffer | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  if (pageLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!page || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Page not found</p>
        <Link to="/"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to store</Button></Link>
      </div>
    );
  }

  const basePrice = Number(product.price);
  const hasOffers = (quantityOffers?.length ?? 0) > 0;
  const activeQuantity = selectedOffer ? selectedOffer.quantity : quantity;
  const activeUnitPrice = selectedOffer
    ? Number(selectedOffer.price) / selectedOffer.quantity
    : discountTiers?.length
      ? getDiscountedPrice(basePrice, quantity, discountTiers)
      : basePrice;
  const activeTotalPrice = selectedOffer ? Number(selectedOffer.price) : Math.round(activeUnitPrice) * quantity;
  const freeDelivery = selectedOffer?.free_delivery ?? false;
  const inStock = product.inventory_quantity > 0;

  const scrollToOrder = () => {
    document.getElementById("lp-order-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto">
        {sections?.map((section) => (
          <LPSectionBlock
            key={section.id}
            section={section}
            product={product}
            basePrice={basePrice}
            hasOffers={hasOffers}
            quantityOffers={quantityOffers ?? []}
            selectedOffer={selectedOffer}
            onSelectOffer={(o) => { setSelectedOffer(o); setQuantity(o.quantity); }}
            quantity={quantity}
            onQuantityChange={setQuantity}
            activeUnitPrice={activeUnitPrice}
            activeTotalPrice={activeTotalPrice}
            activeQuantity={activeQuantity}
            freeDelivery={freeDelivery}
            inStock={inStock}
            showCheckout={showCheckout}
            onOrderClick={() => setShowCheckout(true)}
            scrollToOrder={scrollToOrder}
          />
        ))}
      </div>
      <ExitIntentPopup />
    </div>
  );
}

// ── Section renderer ──

function LPSectionBlock({
  section,
  product,
  basePrice,
  hasOffers,
  quantityOffers,
  selectedOffer,
  onSelectOffer,
  quantity,
  onQuantityChange,
  activeUnitPrice,
  activeTotalPrice,
  activeQuantity,
  freeDelivery,
  inStock,
  showCheckout,
  onOrderClick,
  scrollToOrder,
}: {
  section: LPSection;
  product: Product;
  basePrice: number;
  hasOffers: boolean;
  quantityOffers: QuantityOffer[];
  selectedOffer: QuantityOffer | null;
  onSelectOffer: (o: QuantityOffer) => void;
  quantity: number;
  onQuantityChange: (q: number) => void;
  activeUnitPrice: number;
  activeTotalPrice: number;
  activeQuantity: number;
  freeDelivery: boolean;
  inStock: boolean;
  showCheckout: boolean;
  onOrderClick: () => void;
  scrollToOrder: () => void;
}) {
  const { content } = section;

  switch (section.section_type) {
    case "hero":
      return (
        <section className="relative py-12 md:py-20 px-4">
          {content.image_url && (
            <div className="absolute inset-0 z-0">
              <img src={content.image_url} alt="" className="w-full h-full object-cover opacity-20" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background" />
            </div>
          )}
          <div className="relative z-10 text-center max-w-2xl mx-auto space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              {content.headline || product.title}
            </h1>
            {content.subtitle && (
              <p className="text-lg md:text-xl text-muted-foreground">{content.subtitle}</p>
            )}
            <Button size="lg" className="text-base px-8" onClick={scrollToOrder}>
              {content.cta_text || "Order Now"}
            </Button>
          </div>
        </section>
      );

    case "gallery":
      return (
        <section className="py-8 px-4">
          <ProductGallery images={product.images ?? []} title={product.title} />
        </section>
      );

    case "video":
      if (!content.video_url) return null;
      return (
        <section className="py-8 px-4 space-y-4">
          {content.title && (
            <h2 className="text-xl font-bold text-center flex items-center justify-center gap-2">
              <Play className="w-5 h-5 text-accent" /> {content.title}
            </h2>
          )}
          <div className="aspect-video rounded-xl overflow-hidden border border-border shadow-lg">
            <iframe
              src={content.video_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              title={content.title ?? "Video"}
            />
          </div>
        </section>
      );

    case "benefits":
      return (
        <section className="py-10 px-4">
          <h2 className="text-2xl font-bold text-center mb-8">{content.heading || "Why Choose Us"}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {(content.items ?? []).map((item: any, i: number) => (
              <div key={i} className="flex gap-3 p-4 rounded-xl bg-card border border-border">
                <span className="text-2xl shrink-0">{item.icon || "✓"}</span>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      );

    case "reviews":
      return (
        <section className="py-10 px-4">
          <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
            <Star className="w-6 h-6 text-accent" /> {content.heading || "What Our Customers Say"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {(content.items ?? []).map((review: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center gap-3">
                  {review.image_url ? (
                    <img src={review.image_url} alt={review.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent font-bold">
                      {(review.name || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{review.name}</p>
                    <div className="flex">
                      {Array.from({ length: review.rating ?? 5 }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.text}</p>
              </div>
            ))}
          </div>
        </section>
      );

    case "before_after":
      if (!content.before_image && !content.after_image) return null;
      return (
        <section className="py-10 px-4 space-y-4">
          <h2 className="text-2xl font-bold text-center">{content.heading || "See the Difference"}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {content.before_image && (
                <img src={content.before_image} alt="Before" className="w-full rounded-xl border border-border" loading="lazy" />
              )}
              <p className="text-center text-sm font-medium text-muted-foreground">{content.before_label || "Before"}</p>
            </div>
            <div className="space-y-2">
              {content.after_image && (
                <img src={content.after_image} alt="After" className="w-full rounded-xl border border-border" loading="lazy" />
              )}
              <p className="text-center text-sm font-medium text-accent">{content.after_label || "After"}</p>
            </div>
          </div>
        </section>
      );

    case "faq":
      return (
        <section className="py-10 px-4">
          <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-accent" /> {content.heading || "FAQ"}
          </h2>
          <Accordion type="single" collapsible className="max-w-xl mx-auto">
            {(content.items ?? []).map((faq: any, i: number) =>
              faq.question ? (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ) : null
            )}
          </Accordion>
        </section>
      );

    case "countdown":
      return <CountdownSection content={content} />;

    case "order_form":
      return (
        <section id="lp-order-section" className="py-10 px-4">
          <div className="max-w-lg mx-auto space-y-4">
            {/* Price */}
            <div className="text-center">
              <p className="text-3xl font-bold">{activeTotalPrice.toLocaleString()} DA</p>
              {selectedOffer && basePrice * selectedOffer.quantity > activeTotalPrice && (
                <p className="text-muted-foreground line-through">{(basePrice * selectedOffer.quantity).toLocaleString()} DA</p>
              )}
            </div>

            {inStock ? (
              <>
                {hasOffers ? (
                  <SmartQuantityOffers
                    productId={product.id}
                    basePrice={basePrice}
                    selectedOfferId={selectedOffer?.id ?? null}
                    onSelect={onSelectOffer}
                  />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <QuantitySelector value={quantity} onChange={onQuantityChange} max={product.inventory_quantity} />
                  </div>
                )}

                {!showCheckout ? (
                  <Button size="lg" className="w-full text-base" onClick={onOrderClick}>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Order Now — {activeTotalPrice.toLocaleString()} DA
                  </Button>
                ) : (
                  <CODCheckoutForm
                    product={product}
                    quantity={activeQuantity}
                    unitPrice={Math.round(activeUnitPrice)}
                    freeDelivery={freeDelivery}
                  />
                )}
              </>
            ) : (
              <Button size="lg" className="w-full" disabled>Out of stock</Button>
            )}
          </div>
        </section>
      );

    case "guarantee":
      return (
        <section className="py-10 px-4">
          <div className="max-w-lg mx-auto text-center bg-card border border-border rounded-2xl p-8 space-y-3">
            <div className="text-4xl">{content.icon || "🛡️"}</div>
            <h2 className="text-xl font-bold flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-accent" /> {content.heading || "Our Guarantee"}
            </h2>
            {content.text && <p className="text-muted-foreground">{content.text}</p>}
          </div>
        </section>
      );

    default:
      return null;
  }
}

// ── Countdown component ──

function CountdownSection({ content }: { content: Record<string, any> }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const endDate = content.end_date ? new Date(content.end_date).getTime() : 0;

  useEffect(() => {
    if (!endDate) return;
    const tick = () => {
      const diff = Math.max(0, endDate - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  if (!endDate) return null;

  return (
    <section className="py-10 px-4 bg-accent/5">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Clock className="w-6 h-6 text-accent" /> {content.heading || "Limited Time Offer"}
        </h2>
        {content.subtitle && <p className="text-muted-foreground">{content.subtitle}</p>}
        <div className="flex justify-center gap-3">
          {(["days", "hours", "minutes", "seconds"] as const).map((unit) => (
            <div key={unit} className="bg-card border border-border rounded-xl px-4 py-3 min-w-[64px]">
              <p className="text-2xl md:text-3xl font-bold font-mono">{String(timeLeft[unit]).padStart(2, "0")}</p>
              <p className="text-xs text-muted-foreground capitalize">{unit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
