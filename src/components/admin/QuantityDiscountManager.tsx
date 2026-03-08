import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/products";
import { fetchDiscountsForProduct, setDiscountsForProduct } from "@/lib/quantity-discounts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Percent } from "lucide-react";
import { toast } from "sonner";

export function QuantityDiscountManager() {
  const qc = useQueryClient();
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const [selectedProduct, setSelectedProduct] = useState("");
  const [tiers, setTiers] = useState<{ min_quantity: number; discount_percent: number }[]>([]);

  const { isLoading } = useQuery({
    queryKey: ["quantity-discounts", selectedProduct],
    queryFn: () => fetchDiscountsForProduct(selectedProduct),
    enabled: !!selectedProduct,
    // sync tiers state on fetch
    meta: { onSuccess: true },
  });

  // Refetch and sync when product changes
  const { data: existingTiers } = useQuery({
    queryKey: ["quantity-discounts", selectedProduct],
    queryFn: async () => {
      const data = await fetchDiscountsForProduct(selectedProduct);
      setTiers(data.map((d) => ({ min_quantity: d.min_quantity, discount_percent: d.discount_percent })));
      return data;
    },
    enabled: !!selectedProduct,
  });

  const saveMut = useMutation({
    mutationFn: () => setDiscountsForProduct(selectedProduct, tiers.filter((t) => t.min_quantity > 0 && t.discount_percent > 0)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quantity-discounts"] });
      toast.success("Discounts saved");
    },
    onError: () => toast.error("Failed to save discounts"),
  });

  const addTier = () => setTiers((prev) => [...prev, { min_quantity: prev.length ? Math.max(...prev.map((t) => t.min_quantity)) + 1 : 2, discount_percent: 5 }]);
  const removeTier = (i: number) => setTiers((prev) => prev.filter((_, idx) => idx !== i));
  const updateTier = (i: number, field: "min_quantity" | "discount_percent", val: number) =>
    setTiers((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: val } : t)));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Percent className="w-5 h-5 text-accent" />
        Quantity Discounts
      </h2>

      <div className="space-y-1.5">
        <Label>Select Product</Label>
        <Select value={selectedProduct} onValueChange={(v) => { setSelectedProduct(v); setTiers([]); }}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a product" />
          </SelectTrigger>
          <SelectContent>
            {(products ?? []).map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProduct && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Discount Tiers</Label>
            <Button size="sm" variant="outline" onClick={addTier}>
              <Plus className="w-3 h-3 mr-1" /> Add Tier
            </Button>
          </div>

          {tiers.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No tiers set. Add one above.</p>
          )}

          {tiers.map((tier, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Min Qty</Label>
                <Input
                  type="number"
                  min={2}
                  value={tier.min_quantity}
                  onChange={(e) => updateTier(i, "min_quantity", Number(e.target.value))}
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Discount %</Label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={tier.discount_percent}
                  onChange={(e) => updateTier(i, "discount_percent", Number(e.target.value))}
                />
              </div>
              <Button variant="ghost" size="icon" className="mt-5" onClick={() => removeTier(i)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}

          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
            {saveMut.isPending ? "Saving…" : "Save Discounts"}
          </Button>
        </div>
      )}
    </div>
  );
}
