import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllExitIntents, upsertExitIntent, deleteExitIntent, type ExitIntentPopup } from "@/lib/exit-intent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, MousePointerClick } from "lucide-react";
import { toast } from "sonner";

export function ExitIntentManager() {
  const queryClient = useQueryClient();
  const { data: popups, isLoading } = useQuery({
    queryKey: ["exit-intents-admin"],
    queryFn: fetchAllExitIntents,
  });

  const [editing, setEditing] = useState<Partial<ExitIntentPopup> | null>(null);

  const saveMutation = useMutation({
    mutationFn: upsertExitIntent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exit-intents-admin"] });
      toast.success("Exit intent popup saved");
      setEditing(null);
    },
    onError: () => toast.error("Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExitIntent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exit-intents-admin"] });
      toast.success("Popup deleted");
    },
  });

  const startNew = () =>
    setEditing({
      title: "Wait! Don't leave yet!",
      subtitle: "Get a special discount before you go",
      discount_percent: 10,
      discount_code: "",
      cta_text: "Claim My Discount",
      is_active: true,
    });

  const startEdit = (p: ExitIntentPopup) => setEditing({ ...p });

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-accent" />
          Exit Intent Popups
        </h3>
        {!editing && (
          <Button size="sm" onClick={startNew}>
            <Plus className="w-4 h-4 mr-1" /> New Popup
          </Button>
        )}
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editing.id ? "Edit" : "New"} Exit Intent Popup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input value={editing.subtitle ?? ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input type="number" value={editing.discount_percent ?? ""} onChange={(e) => setEditing({ ...editing, discount_percent: Number(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Discount Code (optional)</Label>
                <Input value={editing.discount_code ?? ""} onChange={(e) => setEditing({ ...editing, discount_code: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>CTA Button Text</Label>
              <Input value={editing.cta_text ?? ""} onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editing.is_active ?? false} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              <Label>Active</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => saveMutation.mutate(editing as any)} disabled={saveMutation.isPending}>
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {!popups?.length && <p className="text-sm text-muted-foreground py-4">No exit intent popups configured.</p>}
          {popups?.map((p) => (
            <Card key={p.id} className="border-border">
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.subtitle}</p>
                  <div className="flex gap-2">
                    {p.discount_percent ? <Badge variant="secondary" className="text-xs">{p.discount_percent}% off</Badge> : null}
                    {p.is_active ? <Badge className="bg-success text-success-foreground text-xs">Active</Badge> : <Badge variant="outline" className="text-xs">Inactive</Badge>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => startEdit(p)}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(p.id)}>
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
