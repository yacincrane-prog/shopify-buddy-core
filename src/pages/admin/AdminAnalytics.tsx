import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Track store performance and conversions"
      />
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
        <p className="text-lg font-medium">Coming soon</p>
        <p className="text-sm mt-1">Analytics dashboard will be available here.</p>
      </div>
    </div>
  );
}
