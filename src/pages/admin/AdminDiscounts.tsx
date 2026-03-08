import { QuantityDiscountManager } from "@/components/admin/QuantityDiscountManager";
export default function AdminDiscounts() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Quantity Discounts</h1><p className="text-muted-foreground text-sm mt-1">Configure tiered quantity discounts</p></div>
      <QuantityDiscountManager />
    </div>
  );
}
