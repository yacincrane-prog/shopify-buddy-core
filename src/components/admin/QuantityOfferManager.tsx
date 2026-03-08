import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProducts } from "@/hooks/useProducts";
import {
  fetchOffersForProduct,
  createOffer,
  updateOffer,
  deleteOffer,
  type QuantityOffer,
} from "@/lib/quantity-offers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, Zap } from "lucide-react";
import { toast } from "sonner";

export function QuantityOfferManager() {
  const queryClient = useQueryClient();
  const { data: products } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState("");

  const { data: offers, isLoading } = useQuery({
    queryKey: ["quantity-offers-admin", selectedProductId],
    queryFn: () => fetchOffersForProduct(selectedProductId),
    enabled: !!selectedProductId,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["quantity-offers-admin", selectedProductId] });

  const addMutation = useMutation({
    mutationFn: () =>
      createOffer({
        product_id: selectedProductId,
        quantity: (offers?.length ?? 0) + 1,
        price: 0,
        label: "",
        is_best_offer: false,
        free_delivery: false,
        position: (offers?.length ?? 0),
      }),
    onSuccess: () => { invalidate(); toast.success("Tier added"); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<QuantityOffer> }) =>
      updateOffer(id, updates),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => { invalidate(); toast.success("Tier removed"); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Smart Quantity Offers</h2>
      </div>

      <div className="space-y-2">
        <Label>Select Product</Label>
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a product…" />
          </SelectTrigger>
          <SelectContent>
            {products?.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProductId && (
        <>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-3">
              {!offers?.length && (
                <p className="text-sm text-muted-foreground py-2">
                  No quantity offers configured. The standard quantity selector will be used.
                </p>
              )}

              {offers?.map((offer, index) => (
                <OfferRow
                  key={offer.id}
                  offer={offer}
                  onUpdate={(updates) => updateMutation.mutate({ id: offer.id, updates })}
                  onDelete={() => deleteMutation.mutate(offer.id)}
                />
              ))}

              <Button variant="outline" size="sm" onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
                <Plus className="w-4 h-4 mr-1" /> Add Tier
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OfferRow({
  offer,
  onUpdate,
  onDelete,
}: {
  offer: QuantityOffer;
  onUpdate: (u: Partial<QuantityOffer>) => void;
  onDelete: () => void;
}) {
  const [qty, setQty] = useState(String(offer.quantity));
  const [price, setPrice] = useState(String(offer.price));
  const [label, setLabel] = useState(offer.label);
  const [bestOffer, setBestOffer] = useState(offer.is_best_offer);
  const [freeDelivery, setFreeDelivery] = useState(offer.free_delivery);

  const hasChanges =
    Number(qty) !== offer.quantity ||
    Number(price) !== offer.price ||
    label !== offer.label ||
    bestOffer !== offer.is_best_offer ||
    freeDelivery !== offer.free_delivery;

  const save = () =>
    onUpdate({
      quantity: Number(qty),
      price: Number(price),
      label,
      is_best_offer: bestOffer,
      free_delivery: freeDelivery,
    });

  return (
    <Card className="border-border">
      <CardContent className="py-3 px-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Quantity</Label>
            <Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Price (DA)</Label>
            <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Label (optional)</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Most Popular" />
          </div>
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Switch checked={bestOffer} onCheckedChange={setBestOffer} />
            <Label className="text-xs">Best Offer</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={freeDelivery} onCheckedChange={setFreeDelivery} />
            <Label className="text-xs">Free Delivery</Label>
          </div>
          <div className="ml-auto flex gap-1">
            {hasChanges && (
              <Button size="sm" onClick={save}>
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
