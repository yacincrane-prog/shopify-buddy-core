import { BundleManager } from "@/components/admin/BundleManager";
export default function AdminBundles() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Bundles</h1><p className="text-muted-foreground text-sm mt-1">Create and manage product bundles</p></div>
      <BundleManager />
    </div>
  );
}
