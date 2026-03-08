import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SectionBuilder } from "@/components/admin/SectionBuilder";

export default function AdminPageBuilder() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Page Builder"
        description="Manage and customize product page sections"
      />
      <SectionBuilder />
    </div>
  );
}
