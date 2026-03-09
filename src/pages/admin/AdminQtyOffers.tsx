import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { QuantityOfferManager } from "@/components/admin/QuantityOfferManager";

export default function AdminQtyOffers() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="عروض الكمية"
        description="إعداد مستويات تسعير ذكية بناءً على الكمية لمنتجاتك"
      />
      <QuantityOfferManager />
    </div>
  );
}