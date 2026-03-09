import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/products";
import { fetchAllUpsells, createUpsell, deleteUpsell } from "@/lib/upsells";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { UpsellPreviewButton } from "@/components/admin/UpsellPreview";
import { Trash2, TrendingUp, Plus } from "lucide-react";
import { toast } from "sonner";

export function UpsellManager() {
  const qc = useQueryClient();
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: upsells, isLoading } = useQuery({ queryKey: ["upsells"], queryFn: fetchAllUpsells });
  const [creating, setCreating] = useState(false);
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [discount, setDiscount] = useState("30");

  const createMut = useMutation({
    mutationFn: () => createUpsell(sourceId, targetId, Number(discount)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["upsells"] });
      toast.success("تم إنشاء عرض الترقية");
      setCreating(false);
      setSourceId("");
      setTargetId("");
      setDiscount("30");
    },
    onError: () => toast.error("فشل إنشاء عرض الترقية"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteUpsell,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["upsells"] });
      toast.success("تم حذف عرض الترقية");
    },
  });

  const canSubmit = sourceId && targetId && sourceId !== targetId && Number(discount) > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          عروض الترقية
        </h2>
        {!creating && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4 ml-1" /> عرض جديد
          </Button>
        )}
      </div>

      {creating && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* قسم: ربط المنتجات */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">ربط المنتجات</h3>
              <p className="text-xs text-muted-foreground">اختر المنتج الذي يفعّل العرض والمنتج المقترح</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>عند عرض المنتج <span className="text-destructive">*</span></Label>
                <Select value={sourceId} onValueChange={setSourceId}>
                  <SelectTrigger><SelectValue placeholder="المنتج المصدر" /></SelectTrigger>
                  <SelectContent>
                    {(products ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>اقتراح إضافة <span className="text-destructive">*</span></Label>
                <Select value={targetId} onValueChange={setTargetId}>
                  <SelectTrigger><SelectValue placeholder="منتج الترقية" /></SelectTrigger>
                  <SelectContent>
                    {(products ?? []).filter((p) => p.id !== sourceId).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {sourceId && targetId && sourceId !== targetId && (
              <div className="rounded-lg bg-muted/50 border border-border px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  عندما يعرض العميل <span className="font-medium text-foreground">{products?.find(p => p.id === sourceId)?.title}</span>،
                  سيرى عرضاً لـ <span className="font-medium text-foreground">{products?.find(p => p.id === targetId)?.title}</span>
                </p>
              </div>
            )}

            <div className="border-t border-border" />

            {/* قسم: الخصم */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">الخصم</h3>
              <p className="text-xs text-muted-foreground">حدد نسبة الخصم لعرض الترقية</p>
            </div>
            <div className="space-y-1.5 max-w-[200px]">
              <Label>نسبة الخصم % <span className="text-destructive">*</span></Label>
              <Input type="number" min={1} max={99} value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <Button onClick={() => createMut.mutate()} disabled={!canSubmit || createMut.isPending}>
                {createMut.isPending ? "جاري الإنشاء…" : "إنشاء عرض الترقية"}
              </Button>
              <Button variant="outline" onClick={() => setCreating(false)}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-muted-foreground text-sm">جاري التحميل…</p>
      ) : !upsells?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">لا توجد عروض ترقية مُعدّة بعد</p>
      ) : (
        <div className="space-y-2">
          {upsells.map((u) => {
            const targetProduct = products?.find((p) => p.id === (u.upsell_product_id as string));
            return (
              <Card key={u.id as string}>
                <CardContent className="py-3 flex items-center justify-between">
                  <p className="text-sm">
                    <span className="font-medium">{(u.source as { title: string }).title}</span>
                    <span className="text-muted-foreground mx-2">←</span>
                    <span className="font-medium">{(u.target as { title: string }).title}</span>
                    <span className="text-accent mr-2">-{Number(u.discount_percent)}%</span>
                  </p>
                  <div className="flex items-center gap-0.5">
                    <UpsellPreviewButton
                      sourceName={(u.source as { title: string }).title}
                      targetName={(u.target as { title: string }).title}
                      targetPrice={Number(targetProduct?.price ?? 0)}
                      discountPercent={Number(u.discount_percent)}
                      targetImage={targetProduct?.images?.[0]}
                    />
                    <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(u.id as string)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
