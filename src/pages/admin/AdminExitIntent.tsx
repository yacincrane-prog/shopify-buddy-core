import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExitIntentManager } from "@/components/admin/ExitIntentManager";

export default function AdminExitIntent() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Exit Intent"
        description="Configure exit-intent popup offers to retain leaving visitors"
      />
      <ExitIntentManager />
    </div>
  );
}
