import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LandingPageBuilder } from "@/components/admin/LandingPageBuilder";
import { useLanguage } from "@/hooks/useLanguage";

export default function AdminLandingPages() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("landingPages.title")}
        description={t("landingPages.description")}
      />
      <LandingPageBuilder />
    </div>
  );
}
