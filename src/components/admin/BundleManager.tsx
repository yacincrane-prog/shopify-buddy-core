import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBundles, createBundle, deleteBundle } from "@/lib/bundles";
import { fetchProducts } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, PackageOpen } from "lucide-react";
import { toast } from "sonner";

export function BundleManager() {
  const qc = useQueryClient();
  const { data: bundles, isLoading } = useQuery({ queryKey: ["bundles"], queryFn: fetchBundles });
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bundlePrice, setBundlePrice] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const createMut = useMutation({
    mutationFn: () => createBundle(title, description, Number(bundlePrice), selectedProducts),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bundles"] });
      toast.success("تم إنشاء الحزمة");
      resetForm();
    },
    onError: () => toast.error("فشل إنشاء الحزمة"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteBundle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bundles"] });
      toast.success("تم حذف الحزمة");
    },
  });

  const resetForm = () => {
    setCreating(false);
    setTitle("");
    setDescription("");
    setBundlePrice("");
    setSelectedProducts([]);
  };

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const selectedTotal = (products ?? [])
    .filter((p) => selectedProducts.includes(p.id))
    .reduce((sum, p) => sum + Number(p.price), 0);

  const canSubmit = title.trim() && Number(bundlePrice) > 0 && selectedProducts.length >= 2;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <PackageOpen className="w-5 h-5 text-accent" />
          حزم المنتجات
        </h2>
        {!creating && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4 ml-1" /> حزمة جديدة
          </Button>
        )}
      </div>

      {creating && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* قسم: تفاصيل الحزمة */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">تفاصيل الحزمة</h3>
              <p className="text-xs text-muted-foreground">الاسم والوصف لهذه الحزمة</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>عنوان الحزمة <span className="text-destructive">*</span></Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عرض الصيف" />
              </div>
              <div className="space-y-1.5">
                <Label>الوصف</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف اختياري" />
              </div>
            </div>

            <div className="border-t border-border" />

            {/* قسم: اختيار المنتجات */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">اختيار المنتجات</h3>
              <p className="text-xs text-muted-foreground">اختر منتجين على الأقل لدمجهما في حزمة</p>
            </div>
            <div className="grid gap-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-muted/20">
              {(products ?? []).map((p) => (
                <label key={p.id} className="flex items-center gap-2.5 cursor-pointer text-sm hover:bg-muted/40 rounded-md px-2 py-1.5 -mx-1 transition-colors">
                  <Checkbox
                    checked={selectedProducts.includes(p.id)}
                    onCheckedChange={() => toggleProduct(p.id)}
                  />
                  <span className="flex-1 font-medium">{p.title}</span>
                  <span className="text-muted-foreground text-xs font-mono">{Number(p.price).toLocaleString()} د.ج</span>
                </label>
              ))}
            </div>

            <div className="border-t border-border" />

            {/* قسم: التسعير */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">تسعير الحزمة</h3>
              <p className="text-xs text-muted-foreground">حدد سعراً مخفضاً للحزمة</p>
            </div>
            <div className="max-w-xs space-y-2">
              <Label>سعر الحزمة (د.ج) <span className="text-destructive">*</span></Label>
              <Input type="number" value={bundlePrice} onChange={(e) => setBundlePrice(e.target.value)} placeholder="0" />
            </div>
            {selectedProducts.length >= 2 && (
              <div className="rounded-lg bg-accent/10 border border-accent/20 px-3 py-2">
                <p className="text-xs text-accent font-medium">
                  المجموع الفردي: {selectedTotal.toLocaleString()} د.ج ←{" "}
                  الحزمة: {Number(bundlePrice || 0).toLocaleString()} د.ج
                  {Number(bundlePrice) < selectedTotal && Number(bundlePrice) > 0 && (
                    <> (وفّر {Math.round((1 - Number(bundlePrice) / selectedTotal) * 100)}%)</>
                  )}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-border">
              <Button onClick={() => createMut.mutate()} disabled={!canSubmit || createMut.isPending}>
                {createMut.isPending ? "جاري الإنشاء…" : "إنشاء الحزمة"}
              </Button>
              <Button variant="outline" onClick={resetForm}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-muted-foreground text-sm">جاري التحميل…</p>
      ) : !bundles?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">لا توجد حزم بعد</p>
      ) : (
        <div className="space-y-3">
          {bundles.map((b) => (
            <Card key={b.id}>
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{b.title}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {b.items.map((item) => (
                      <Badge key={item.product_id} variant="secondary" className="text-xs">
                        {item.product_title}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm mt-1">
                    <span className="font-semibold text-accent">{Number(b.bundle_price).toLocaleString()} د.ج</span>
                    <span className="text-muted-foreground mr-2">
                      (كان {b.items.reduce((s, i) => s + i.product_price, 0).toLocaleString()} د.ج)
                    </span>
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(b.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
