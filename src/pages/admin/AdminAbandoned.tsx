import { AbandonedLeadsManager } from "@/components/admin/AbandonedLeadsManager";
export default function AdminAbandoned() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Abandoned Leads</h1><p className="text-muted-foreground text-sm mt-1">View captured abandoned checkout leads</p></div>
      <AbandonedLeadsManager />
    </div>
  );
}
