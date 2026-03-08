import { QuantityOfferManager } from "@/components/admin/QuantityOfferManager";
export default function AdminQtyOffers() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Quantity Offers</h1><p className="text-muted-foreground text-sm mt-1">Set up smart quantity-based pricing</p></div>
      <QuantityOfferManager />
    </div>
  );
}
