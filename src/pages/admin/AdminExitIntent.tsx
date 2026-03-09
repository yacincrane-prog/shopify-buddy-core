import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExitIntentManager } from "@/components/admin/ExitIntentManager";

export default function AdminExitIntent() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="منبثق الخروج"
        description="إعداد عروض منبثقة لاستبقاء الزوار عند محاولتهم المغادرة"
      />
      <ExitIntentManager />
    </div>
  );
}