import { useState, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBundles, createBundle, deleteBundle } from "@/lib/bundles";
import { fetchProducts } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminBundles() {
  const qc = useQueryClient();
  const { data: bundles, isLoading } = useQuery({ queryKey: ["bundles"], queryFn: fetchBundles });
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bundlePrice, setBundlePrice] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const createMut = useMutation({
    mutationFn: () => createBundle(title, description, Number(bundlePrice), selectedProducts),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bundles"] }); toast.success("تم إنشاء الحزمة"); resetForm(); },
    onError: () => toast.error("فشل في إنشاء الحزمة"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteBundle,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bundles"] }); toast.success("تم حذف الحزمة"); },
  });

  const resetForm = () => { setCreating(false); setTitle(""); setDescription(""); setBundlePrice(""); setSelectedProducts([]); };

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const selectedTotal = (products ?? []).filter((p) => selectedProducts.includes(p.id)).reduce((sum, p) => sum + Number(p.price), 0);
  const canSubmit = title.trim() && Number(bundlePrice) > 0 && selectedProducts.length >= 2;

  const filtered = useMemo(() => {
    if (!search) return bundles ?? [];
    const q = search.toLowerCase();
    return (bundles ?? []).filter((b) => b.title.toLowerCase().includes(q));
  }, [bundles, search]);

  if (creating) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={resetForm}>
          <ArrowLeft className="w-4 h-4 mr-1" /> العودة للحزم
        </Button>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold">حزمة جديدة</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>عنوان الحزمة</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="باقة الصيف" /></div>
              <div className="space-y-1.5"><Label>سعر الحزمة (د.ج)</Label><Input type="number" value={bundlePrice} onChange={(e) => setBundlePrice(e.target.value)} placeholder="0" /></div>
            </div>
            <div className="space-y-1.5"><Label>الوصف</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف اختياري" /></div>
            <div className="space-y-2">
              <Label>اختر المنتجات (الحد الأدنى 2)</Label>
              <div className="grid gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {(products ?? []).map((p) => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <Checkbox checked={selectedProducts.includes(p.id)} onCheckedChange={() => toggleProduct(p.id)} />
                    <span className="flex-1">{p.title}</span>
                    <span className="text-muted-foreground">{Number(p.price).toLocaleString()} د.ج</span>
                  </label>
                ))}
              </div>
              {selectedProducts.length >= 2 && (
                <p className="text-xs text-muted-foreground">
                  المجموع الفردي: {selectedTotal.toLocaleString()} د.ج ←{" "}
                  <span className="text-accent font-medium">
                    الحزمة: {Number(bundlePrice || 0).toLocaleString()} د.ج
                    {Number(bundlePrice) < selectedTotal && Number(bundlePrice) > 0 && <> (وفّر {Math.round((1 - Number(bundlePrice) / selectedTotal) * 100)}%)</>}
                  </span>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createMut.mutate()} disabled={!canSubmit || createMut.isPending}>{createMut.isPending ? "جاري الإنشاء…" : "إنشاء الحزمة"}</Button>
              <Button variant="outline" onClick={resetForm}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="الحزم"
        description="إنشاء وإدارة حزم المنتجات"
        count={bundles?.length}
        action={{ label: "حزمة جديدة", icon: <Plus className="w-4 h-4 mr-1" />, onClick: () => setCreating(true) }}
        search={{ value: search, onChange: setSearch, placeholder: "بحث في الحزم…" }}
      />

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">جاري التحميل…</div>
      ) : !filtered.length ? (
        <div className="text-center py-16 text-muted-foreground">
          {search ? "لا توجد حزم مطابقة للبحث" : "لا توجد حزم بعد. أنشئ واحدة للبدء."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <Card key={b.id}>
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{b.title}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {b.items.map((item) => (
                      <Badge key={item.product_id} variant="secondary" className="text-xs">{item.product_title}</Badge>
                    ))}
                  </div>
                  <p className="text-sm mt-1">
                    <span className="font-semibold text-accent">{Number(b.bundle_price).toLocaleString()} د.ج</span>
                    <span className="text-muted-foreground ml-2">(كان {b.items.reduce((s, i) => s + i.product_price, 0).toLocaleString()} د.ج)</span>
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}