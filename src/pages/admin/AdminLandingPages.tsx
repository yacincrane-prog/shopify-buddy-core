import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LandingPageBuilder } from "@/components/admin/LandingPageBuilder";

export default function AdminLandingPages() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Landing Pages"
        description="Build high-converting product landing pages"
      />
      <LandingPageBuilder />
    </div>
  );
}
