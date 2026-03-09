import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SectionBuilder } from "@/components/admin/SectionBuilder";

export default function AdminPageBuilder() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="منشئ الصفحات"
        description="إدارة وتخصيص أقسام صفحات المنتجات"
      />
      <SectionBuilder />
    </div>
  );
}