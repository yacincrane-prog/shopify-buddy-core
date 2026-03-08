import { useState, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useShippingRates, useUpdateShippingRate, type ShippingRate } from "@/hooks/useShippingRates";
import { toast } from "sonner";
import { Search, Truck, Building2, Save, Loader2 } from "lucide-react";

export default function AdminShipping() {
  const { data: rates, isLoading } = useShippingRates();
  const updateMutation = useUpdateShippingRate();
  const [search, setSearch] = useState("");
  const [editedRates, setEditedRates] = useState<Record<string, Partial<ShippingRate>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!rates) return [];
    if (!search.trim()) return rates;
    const q = search.toLowerCase();
    return rates.filter(
      (r) => r.wilaya_name.toLowerCase().includes(q) || r.wilaya_code.includes(q)
    );
  }, [rates, search]);

  const getEdited = (rate: ShippingRate): ShippingRate => ({
    ...rate,
    ...editedRates[rate.id],
  });

  const hasChanges = (id: string) => !!editedRates[id];

  const updateField = (id: string, field: keyof ShippingRate, value: any) => {
    setEditedRates((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (rate: ShippingRate) => {
    const edited = getEdited(rate);
    setSavingId(rate.id);
    try {
      await updateMutation.mutateAsync({
        id: rate.id,
        home_delivery_price: edited.home_delivery_price,
        stop_desk_price: edited.stop_desk_price,
        is_active: edited.is_active,
        stop_desk_enabled: edited.stop_desk_enabled,
      });
      setEditedRates((prev) => {
        const next = { ...prev };
        delete next[rate.id];
        return next;
      });
      toast.success(`تم حفظ أسعار ${edited.wilaya_name}`);
    } catch {
      toast.error("فشل في الحفظ");
    } finally {
      setSavingId(null);
    }
  };

  const activeCount = rates?.filter((r) => r.is_active).length ?? 0;
  const totalCount = rates?.length ?? 0;

  return (
    <div className="space-y-6" dir="rtl">
      <AdminPageHeader
        title="أسعار التوصيل"
        description="تعديل أسعار التوصيل للمنزل والمكتب لكل ولاية مع إمكانية تشغيل أو إيقاف الولاية أو المكتب"
      />

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالولاية أو الرمز..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{activeCount} مفعّلة</Badge>
          <Badge variant="outline">{totalCount} إجمالي</Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">جاري التحميل…</div>
      ) : (
        <div className="grid gap-3">
          {/* Header */}
          <div className="hidden md:grid grid-cols-[60px_1fr_140px_140px_100px_100px_80px] gap-3 px-4 py-2 text-xs font-medium text-muted-foreground">
            <span>الرمز</span>
            <span>الولاية</span>
            <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> المنزل (د.ج)</span>
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> المكتب (د.ج)</span>
            <span>المكتب</span>
            <span>الولاية</span>
            <span></span>
          </div>
          <Separator />

          {filtered.map((rate) => {
            const edited = getEdited(rate);
            const changed = hasChanges(rate.id);
            const saving = savingId === rate.id;

            return (
              <Card
                key={rate.id}
                className={`transition-all ${!edited.is_active ? "opacity-50" : ""} ${changed ? "ring-2 ring-primary/30" : ""}`}
              >
                <CardContent className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-[60px_1fr_140px_140px_100px_100px_80px] gap-3 items-center">
                    {/* Code */}
                    <Badge variant="outline" className="w-fit font-mono text-xs">
                      {rate.wilaya_code}
                    </Badge>

                    {/* Name */}
                    <span className="font-medium text-sm">{edited.wilaya_name}</span>

                    {/* Home price */}
                    <div className="flex items-center gap-1">
                      <span className="md:hidden text-xs text-muted-foreground min-w-[60px]">المنزل:</span>
                      <Input
                        type="number"
                        min={0}
                        value={edited.home_delivery_price}
                        onChange={(e) => updateField(rate.id, "home_delivery_price", Number(e.target.value))}
                        className="h-8 text-sm"
                        dir="ltr"
                      />
                    </div>

                    {/* Stop desk price */}
                    <div className="flex items-center gap-1">
                      <span className="md:hidden text-xs text-muted-foreground min-w-[60px]">المكتب:</span>
                      <Input
                        type="number"
                        min={0}
                        value={edited.stop_desk_price}
                        onChange={(e) => updateField(rate.id, "stop_desk_price", Number(e.target.value))}
                        className="h-8 text-sm"
                        disabled={!edited.stop_desk_enabled}
                        dir="ltr"
                      />
                    </div>

                    {/* Stop desk toggle */}
                    <div className="flex items-center gap-2">
                      <span className="md:hidden text-xs text-muted-foreground">المكتب:</span>
                      <Switch
                        checked={edited.stop_desk_enabled}
                        onCheckedChange={(v) => updateField(rate.id, "stop_desk_enabled", v)}
                      />
                      <span className="text-xs text-muted-foreground md:hidden">
                        {edited.stop_desk_enabled ? "مفعّل" : "معطّل"}
                      </span>
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center gap-2">
                      <span className="md:hidden text-xs text-muted-foreground">الولاية:</span>
                      <Switch
                        checked={edited.is_active}
                        onCheckedChange={(v) => updateField(rate.id, "is_active", v)}
                      />
                      <span className="text-xs text-muted-foreground md:hidden">
                        {edited.is_active ? "مفعّلة" : "معطّلة"}
                      </span>
                    </div>

                    {/* Save */}
                    <Button
                      size="sm"
                      variant={changed ? "default" : "ghost"}
                      disabled={!changed || saving}
                      onClick={() => handleSave(rate)}
                      className="h-8"
                    >
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              لا توجد نتائج
            </div>
          )}
        </div>
      )}
    </div>
  );
}
