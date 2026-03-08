import { ExitIntentManager } from "@/components/admin/ExitIntentManager";
export default function AdminExitIntent() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Exit Intent</h1><p className="text-muted-foreground text-sm mt-1">Configure exit-intent popup offers</p></div>
      <ExitIntentManager />
    </div>
  );
}
