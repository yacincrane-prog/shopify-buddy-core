import { PostOrderUpsellManager } from "@/components/admin/PostOrderUpsellManager";
export default function AdminPostUpsell() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Post-Order Upsell</h1><p className="text-muted-foreground text-sm mt-1">Offer products after order submission</p></div>
      <PostOrderUpsellManager />
    </div>
  );
}
