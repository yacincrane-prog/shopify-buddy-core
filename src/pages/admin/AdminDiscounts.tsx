import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { QuantityDiscountManager } from "@/components/admin/QuantityDiscountManager";

export default function AdminDiscounts() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quantity Discounts"
        description="Configure tiered percentage discounts based on quantity"
      />
      <QuantityDiscountManager />
    </div>
  );
}
