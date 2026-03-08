import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { QuantityOfferManager } from "@/components/admin/QuantityOfferManager";

export default function AdminQtyOffers() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quantity Offers"
        description="Set up smart quantity-based pricing tiers for your products"
      />
      <QuantityOfferManager />
    </div>
  );
}
