import { useState, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/products";
import { fetchAllUpsells, createUpsell, deleteUpsell } from "@/lib/upsells";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminUpsells() {
  const qc = useQueryClient();
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: upsells, isLoading } = useQuery({ queryKey: ["upsells"], queryFn: fetchAllUpsells });
  const [creating, setCreating] = useState(false);
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [discount, setDiscount] = useState("30");
  const [search, setSearch] = useState("");

  const createMut = useMutation({
    mutationFn: () => createUpsell(sourceId, targetId, Number(discount)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["upsells"] }); toast.success("Upsell created"); setCreating(false); setSourceId(""); setTargetId(""); setDiscount("30"); },
    onError: () => toast.error("Failed to create upsell"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteUpsell,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["upsells"] }); toast.success("Upsell removed"); },
  });

  const canSubmit = sourceId && targetId && sourceId !== targetId && Number(discount) > 0;

  const filtered = useMemo(() => {
    if (!search) return upsells ?? [];
    const q = search.toLowerCase();
    return (upsells ?? []).filter((u) =>
      (u.source as any)?.title?.toLowerCase().includes(q) ||
      (u.target as any)?.title?.toLowerCase().includes(q)
    );
  }, [upsells, search]);

  if (creating) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to upsells
        </Button>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold">New Upsell</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>When viewing product</Label>
                <Select value={sourceId} onValueChange={setSourceId}>
                  <SelectTrigger><SelectValue placeholder="Source product" /></SelectTrigger>
                  <SelectContent>{(products ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Suggest adding</Label>
                <Select value={targetId} onValueChange={setTargetId}>
                  <SelectTrigger><SelectValue placeholder="Upsell product" /></SelectTrigger>
                  <SelectContent>{(products ?? []).filter((p) => p.id !== sourceId).map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5 max-w-[200px]"><Label>Discount %</Label><Input type="number" min={1} max={99} value={discount} onChange={(e) => setDiscount(e.target.value)} /></div>
            <div className="flex gap-2">
              <Button onClick={() => createMut.mutate()} disabled={!canSubmit || createMut.isPending}>{createMut.isPending ? "Creating…" : "Create Upsell"}</Button>
              <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Upsells"
        description="Configure pre-order upsell offers"
        count={upsells?.length}
        action={{ label: "New Upsell", icon: <Plus className="w-4 h-4 mr-1" />, onClick: () => setCreating(true) }}
        search={{ value: search, onChange: setSearch, placeholder: "Search upsells…" }}
      />

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading…</div>
      ) : !filtered.length ? (
        <div className="text-center py-16 text-muted-foreground">
          {search ? "No upsells match your search" : "No upsells configured yet"}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <Card key={u.id as string}>
              <CardContent className="py-3 flex items-center justify-between">
                <p className="text-sm">
                  <span className="font-medium">{(u.source as { title: string }).title}</span>
                  <span className="text-muted-foreground mx-2">→</span>
                  <span className="font-medium">{(u.target as { title: string }).title}</span>
                  <span className="text-accent ml-2">-{Number(u.discount_percent)}%</span>
                </p>
                <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(u.id as string)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
