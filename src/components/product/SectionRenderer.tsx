import { useQuery } from "@tanstack/react-query";
import { fetchSectionsForProduct, type ProductSection } from "@/lib/product-sections";
import { ProductGallery } from "@/components/product/ProductGallery";
import { QuantityPricing } from "@/components/product/QuantityPricing";
import { BundleOffers } from "@/components/product/BundleOffers";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Star, HelpCircle, Play } from "lucide-react";
import type { Product } from "@/types/product";

interface SectionRendererProps {
  product: Product;
  basePrice: number;
  quantity: number;
  /** Render function for the order/checkout block */
  renderOrderBlock: () => React.ReactNode;
}

export function SectionRenderer({ product, basePrice, quantity, renderOrderBlock }: SectionRendererProps) {
  const { data: sections } = useQuery({
    queryKey: ["product-sections", product.id],
    queryFn: () => fetchSectionsForProduct(product.id),
    enabled: !!product.id,
  });

  if (!sections?.length) return null;

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <SectionBlock
          key={section.id}
          section={section}
          product={product}
          basePrice={basePrice}
          quantity={quantity}
          renderOrderBlock={renderOrderBlock}
        />
      ))}
    </div>
  );
}

function SectionBlock({
  section,
  product,
  basePrice,
  quantity,
  renderOrderBlock,
}: {
  section: ProductSection;
  product: Product;
  basePrice: number;
  quantity: number;
  renderOrderBlock: () => React.ReactNode;
}) {
  const { content } = section;

  switch (section.section_type) {
    case "gallery":
      return <ProductGallery images={product.images ?? []} title={product.title} />;

    case "description":
      const text = content.custom_text || product.description;
      return text ? <p className="text-muted-foreground leading-relaxed">{text}</p> : null;

    case "reviews":
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-accent" />
            {content.heading || "Customer Reviews"}
          </h3>
          {(content.items ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {(content.items ?? []).map((review: any, i: number) => (
                <div key={i} className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {Array.from({ length: review.rating ?? 5 }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-accent text-accent" />
                      ))}
                    </div>
                    <span className="font-medium text-sm">{review.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case "faq":
      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-accent" />
            {content.heading || "FAQ"}
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {(content.items ?? []).map((faq: any, i: number) =>
              faq.question ? (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ) : null
            )}
          </Accordion>
        </div>
      );

    case "bundle_offers":
      return <BundleOffers productId={product.id} />;

    case "upsell":
      return null; // Upsell is handled via modal, not inline

    case "image_text":
      if (!content.image_url && !content.text) return null;
      return (
        <div className={`grid md:grid-cols-2 gap-6 items-center ${content.layout === "right" ? "" : ""}`}>
          {content.layout === "right" ? (
            <>
              <div className="space-y-3">
                {content.heading && <h3 className="text-lg font-semibold">{content.heading}</h3>}
                {content.text && <p className="text-muted-foreground leading-relaxed">{content.text}</p>}
              </div>
              {content.image_url && (
                <img src={content.image_url} alt={content.heading ?? ""} className="rounded-lg w-full object-cover max-h-80" />
              )}
            </>
          ) : (
            <>
              {content.image_url && (
                <img src={content.image_url} alt={content.heading ?? ""} className="rounded-lg w-full object-cover max-h-80" />
              )}
              <div className="space-y-3">
                {content.heading && <h3 className="text-lg font-semibold">{content.heading}</h3>}
                {content.text && <p className="text-muted-foreground leading-relaxed">{content.text}</p>}
              </div>
            </>
          )}
        </div>
      );

    case "video":
      if (!content.video_url) return null;
      return (
        <div className="space-y-3">
          {content.title && (
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Play className="w-5 h-5 text-accent" />
              {content.title}
            </h3>
          )}
          <div className="aspect-video rounded-lg overflow-hidden border border-border">
            <iframe
              src={content.video_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={content.title ?? "Video"}
            />
          </div>
        </div>
      );

    case "quantity_pricing":
      return <QuantityPricing productId={product.id} basePrice={basePrice} quantity={quantity} />;

    case "order_button":
      return <>{renderOrderBlock()}</>;

    default:
      return null;
  }
}
