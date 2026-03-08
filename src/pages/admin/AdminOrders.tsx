import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminOrders() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="View and manage customer orders"
      />
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
        <p className="text-lg font-medium">Coming soon</p>
        <p className="text-sm mt-1">Order management will be available here.</p>
      </div>
    </div>
  );
}
