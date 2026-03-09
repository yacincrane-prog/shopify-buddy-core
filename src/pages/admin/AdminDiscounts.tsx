import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { QuantityDiscountManager } from "@/components/admin/QuantityDiscountManager";

export default function AdminDiscounts() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="خصومات الكمية"
        description="إعداد خصومات متدرجة بناءً على الكمية المشتراة"
      />
      <QuantityDiscountManager />
    </div>
  );
}