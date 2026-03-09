import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LandingPageBuilder } from "@/components/admin/LandingPageBuilder";

export default function AdminLandingPages() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="صفحات الهبوط"
        description="إنشاء صفحات هبوط عالية التحويل لمنتجاتك"
      />
      <LandingPageBuilder />
    </div>
  );
}