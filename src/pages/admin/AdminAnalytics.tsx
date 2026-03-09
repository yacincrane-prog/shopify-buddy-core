import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="التحليلات"
        description="تتبع أداء المتجر والتحويلات"
      />
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
        <p className="text-lg font-medium">قريباً</p>
        <p className="text-sm mt-1">لوحة التحليلات ستكون متاحة هنا.</p>
      </div>
    </div>
  );
}