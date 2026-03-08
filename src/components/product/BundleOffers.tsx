import { useQuery } from "@tanstack/react-query";
import { fetchBundlesForProduct, type BundleWithItems } from "@/lib/bundles";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PackageOpen } from "lucide-react";

interface BundleOffersProps {
  productId: string;
}

export function BundleOffers({ productId }: BundleOffersProps) {
  const { data: bundles } = useQuery({
    queryKey: ["bundles-for-product", productId],
    queryFn: () => fetchBundlesForProduct(productId),
  });

  if (!bundles?.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <PackageOpen className="w-4 h-4 text-accent" />
        Bundle Deals
      </h3>
      {bundles.map((b) => {
        const originalTotal = b.items.reduce((s, i) => s + i.product_price, 0);
        const savings = Math.round((1 - Number(b.bundle_price) / originalTotal) * 100);
        return (
          <Card key={b.id} className="border-accent/30 bg-accent/5">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">{b.title}</p>
                <Badge className="bg-accent text-accent-foreground text-xs">Save {savings}%</Badge>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {b.items.map((item) => (
                  <Badge key={item.product_id} variant="secondary" className="text-xs">
                    {item.product_title}
                  </Badge>
                ))}
              </div>
              <div className="flex items-baseline gap-2 text-sm">
                <span className="font-bold text-accent">{Number(b.bundle_price).toLocaleString()} DA</span>
                <span className="text-muted-foreground line-through text-xs">{originalTotal.toLocaleString()} DA</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
