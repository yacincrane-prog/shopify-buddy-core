import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProducts } from "@/hooks/useProducts";
import {
  fetchAllPostOrderUpsells,
  upsertPostOrderUpsell,
  deletePostOrderUpsell,
  type PostOrderUpsellConfig,
} from "@/lib/post-order-upsell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, Gift } from "lucide-react";
import { toast } from "sonner";

export function PostOrderUpsellManager() {
  const queryClient = useQueryClient();
  const { data: products } = useProducts();
  const { data: configs, isLoading } = useQuery({
    queryKey: ["post-order-upsells-admin"],
    queryFn: fetchAllPostOrderUpsells,
  });

  const [editing, setEditing] = useState<Partial<PostOrderUpsellConfig> | null>(null);

  const saveMutation = useMutation({
    mutationFn: upsertPostOrderUpsell,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-order-upsells-admin"] });
      toast.success("Post-order upsell saved");
      setEditing(null);
    },
    onError: () => toast.error("Failed to save — each product can only have one post-order upsell"),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePostOrderUpsell,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-order-upsells-admin"] });
      toast.success("Deleted");
    },
  });

  const getProductTitle = (id: string) => products?.find((p) => p.id === id)?.title ?? id;

  const startNew = () =>
    setEditing({
      source_product_id: "",
      upsell_product_id: "",
      discount_percent: 40,
      headline: "Special Offer Before Finalizing Your Order",
      accept_text: "Add to My Order",
      decline_text: "No Thanks",
      is_active: true,
    });

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Gift className="w-4 h-4 text-accent" />
          Post-Order Upsells
        </h3>
        {!editing && (
          <Button size="sm" onClick={startNew}>
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        )}
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editing.id ? "Edit" : "New"} Post-Order Upsell</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Source Product (triggers on order)</Label>
                <Select value={editing.source_product_id ?? ""} onValueChange={(v) => setEditing({ ...editing, source_product_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {products?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Upsell Product (offered after order)</Label>
                <Select value={editing.upsell_product_id ?? ""} onValueChange={(v) => setEditing({ ...editing, upsell_product_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {products?.filter((p) => p.id !== editing.source_product_id).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Discount %</Label>
              <Input type="number" min={0} max={100} value={editing.discount_percent ?? 40} onChange={(e) => setEditing({ ...editing, discount_percent: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Headline</Label>
              <Input value={editing.headline ?? ""} onChange={(e) => setEditing({ ...editing, headline: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Accept Button Text</Label>
                <Input value={editing.accept_text ?? ""} onChange={(e) => setEditing({ ...editing, accept_text: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Decline Button Text</Label>
                <Input value={editing.decline_text ?? ""} onChange={(e) => setEditing({ ...editing, decline_text: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              <Label className="text-xs">Active</Label>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => saveMutation.mutate(editing as any)}
                disabled={!editing.source_product_id || !editing.upsell_product_id || saveMutation.isPending}
              >
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {!configs?.length && <p className="text-sm text-muted-foreground py-4">No post-order upsells configured.</p>}
          {configs?.map((c: any) => (
            <Card key={c.id} className="border-border">
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{getProductTitle(c.source_product_id)}</span>
                    <span className="text-muted-foreground mx-2">→</span>
                    <span className="font-medium">{getProductTitle(c.upsell_product_id)}</span>
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">{c.discount_percent}% off</Badge>
                    {c.is_active
                      ? <Badge className="bg-success text-success-foreground text-xs">Active</Badge>
                      : <Badge variant="outline" className="text-xs">Inactive</Badge>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => setEditing(c)}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(c.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
