import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCheckoutConfig,
  useSaveCheckoutConfig,
  DEFAULT_CONFIG,
  type CheckoutConfig,
  type CheckoutField,
} from "@/hooks/useCheckoutConfig";
import { toast } from "sonner";
import {
  GripVertical,
  Plus,
  Trash2,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Settings2,
  Type,
  Phone,
  Mail,
  AlignLeft,
  Truck,
  Building2,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";

const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "نص", icon: Type },
  { value: "tel", label: "هاتف", icon: Phone },
  { value: "email", label: "بريد إلكتروني", icon: Mail },
  { value: "textarea", label: "نص طويل", icon: AlignLeft },
];

const VIEWPORT_OPTIONS = [
  { id: "desktop" as const, icon: Monitor, width: "480px", label: "Desktop" },
  { id: "mobile" as const, icon: Smartphone, width: "340px", label: "Mobile" },
];

export default function AdminCheckoutPreview() {
  const { data: savedConfig, isLoading } = useCheckoutConfig();
  const saveMutation = useSaveCheckoutConfig();
  const [config, setConfig] = useState<CheckoutConfig>(DEFAULT_CONFIG);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"fields" | "settings">("fields");

  useEffect(() => {
    if (savedConfig) setConfig(savedConfig);
  }, [savedConfig]);

  const updateConfig = (partial: Partial<CheckoutConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const updateField = (id: string, updates: Partial<CheckoutField>) => {
    setConfig((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  const addField = () => {
    const newId = `custom_${Date.now()}`;
    const newField: CheckoutField = {
      id: newId,
      type: "text",
      label: "حقل جديد",
      placeholder: "أدخل القيمة...",
      required: false,
      visible: true,
      position: config.fields.length,
      isSystem: false,
    };
    setConfig((prev) => ({ ...prev, fields: [...prev.fields, newField] }));
  };

  const removeField = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id),
    }));
  };

  const moveField = (id: string, direction: "up" | "down") => {
    setConfig((prev) => {
      const fields = [...prev.fields];
      const idx = fields.findIndex((f) => f.id === id);
      if (idx < 0) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= fields.length) return prev;
      [fields[idx], fields[swapIdx]] = [fields[swapIdx], fields[idx]];
      return { ...prev, fields: fields.map((f, i) => ({ ...f, position: i })) };
    });
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(config);
      toast.success("تم حفظ إعدادات الشراء");
    } catch {
      toast.error("فشل في الحفظ");
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const currentVp = VIEWPORT_OPTIONS.find((v) => v.id === viewport)!;
  const visibleFields = config.fields.filter((f) => f.visible);

  if (isLoading) {
    return <div className="text-center py-16 text-muted-foreground">جاري التحميل…</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <AdminPageHeader
        title="تخصيص صفحة الشراء"
        description="تعديل تصميم نموذج الشراء وإضافة أو حذف الحقول"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Editor - full width on mobile, 60% on desktop */}
        <div className="flex-1 space-y-4">
          {/* Tabs - horizontal scroll on mobile */}
          <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto"
            >
            <div className="flex gap-2 shrink-0">
              variant={activeTab === "fields" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("fields")}
            >
              <GripVertical className="w-3.5 h-3.5 ml-1" /> الحقول
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("settings")}
            >
              <Settings2 className="w-3.5 h-3.5 ml-1" /> الإعدادات
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-3.5 h-3.5 ml-1" /> استعادة
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" /> : <Save className="w-3.5 h-3.5 ml-1" />}
              حفظ
            </Button>
          </div>

          {activeTab === "fields" ? (
            <div className="space-y-3">
              {config.fields.map((field, idx) => (
                <Card key={field.id} className={`transition-all ${!field.visible ? "opacity-50" : ""}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {/* Reorder */}
                      <div className="flex flex-col gap-0.5 pt-1">
                        <button
                          onClick={() => moveField(field.id, "up")}
                          disabled={idx === 0}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                        >▲</button>
                        <button
                          onClick={() => moveField(field.id, "down")}
                          disabled={idx === config.fields.length - 1}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                        >▼</button>
                      </div>

                      {/* Field config */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={field.isSystem ? "secondary" : "outline"} className="text-[10px]">
                            {field.isSystem ? "نظام" : "مخصص"}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {field.type}
                          </Badge>
                          {field.required && (
                            <Badge variant="destructive" className="text-[10px]">مطلوب</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">العنوان</Label>
                            <Input
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              className="h-8 text-sm"
                            />
                          </div>
                          {!["wilaya", "commune", "delivery_type"].includes(field.type) && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">النص التوضيحي</Label>
                              <Input
                                value={field.placeholder}
                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                className="h-8 text-sm"
                              />
                            </div>
                          )}
                        </div>

                        {!field.isSystem && (
                          <div className="flex gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">النوع</Label>
                              <Select
                                value={field.type}
                                onValueChange={(v) => updateField(field.id, { type: v as CheckoutField["type"] })}
                              >
                                <SelectTrigger className="h-8 w-36 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FIELD_TYPE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 items-center pt-1">
                        <div className="flex items-center gap-1.5">
                          <Label className="text-[10px] text-muted-foreground">إظهار</Label>
                          <Switch
                            checked={field.visible}
                            onCheckedChange={(v) => updateField(field.id, { visible: v })}
                          />
                        </div>
                        {!field.isSystem && (
                          <>
                            <div className="flex items-center gap-1.5">
                              <Label className="text-[10px] text-muted-foreground">مطلوب</Label>
                              <Switch
                                checked={field.required}
                                onCheckedChange={(v) => updateField(field.id, { required: v })}
                              />
                            </div>
                            <button
                              onClick={() => removeField(field.id)}
                              className="text-destructive hover:text-destructive/80 mt-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" className="w-full" onClick={addField}>
                <Plus className="w-4 h-4 ml-1" /> إضافة حقل جديد
              </Button>
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">عنوان النموذج</Label>
                  <Input
                    value={config.formTitle}
                    onChange={(e) => updateConfig({ formTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">نص زر التأكيد</Label>
                  <Input
                    value={config.buttonText}
                    onChange={(e) => updateConfig({ buttonText: e.target.value })}
                  />
                </div>
                <Separator />
                <div className="space-y-1.5">
                  <Label className="text-sm">عنوان التأكيد</Label>
                  <Input
                    value={config.successTitle}
                    onChange={(e) => updateConfig({ successTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">رسالة التأكيد</Label>
                  <Textarea
                    value={config.successMessage}
                    onChange={(e) => updateConfig({ successMessage: e.target.value })}
                    rows={2}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label className="text-sm">إظهار كود الخصم</Label>
                  <Switch
                    checked={config.showDiscountCode}
                    onCheckedChange={(v) => updateConfig({ showDiscountCode: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">إظهار تفاصيل السعر</Label>
                  <Switch
                    checked={config.showPriceBreakdown}
                    onCheckedChange={(v) => updateConfig({ showPriceBreakdown: v })}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Live Preview */}
        <div className="xl:w-[500px] shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">معاينة مباشرة</span>
            <div className="flex items-center rounded-md border border-border p-0.5 bg-muted/30">
              {VIEWPORT_OPTIONS.map((vp) => (
                <Button
                  key={vp.id}
                  variant={viewport === vp.id ? "default" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewport(vp.id)}
                  title={vp.label}
                >
                  <vp.icon className="w-3.5 h-3.5" />
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div
              className="transition-all duration-300"
              style={{ width: currentVp.width, maxWidth: "100%" }}
            >
              <Card className="border-border shadow-lg" dir="rtl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{config.formTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {visibleFields.map((field, idx) => {
                      if (idx > 0 && visibleFields[idx - 1] &&
                        ((["wilaya", "commune"].includes(field.type) && !["wilaya", "commune"].includes(visibleFields[idx - 1].type)) ||
                        (field.type === "delivery_type" && visibleFields[idx - 1].type !== "delivery_type"))) {
                        return (
                          <div key={field.id}>
                            <Separator className="mb-4" />
                            {renderPreviewField(field)}
                          </div>
                        );
                      }
                      return <div key={field.id}>{renderPreviewField(field)}</div>;
                    })}

                    {config.showDiscountCode && (
                      <>
                        <Separator />
                        <div className="space-y-1.5">
                          <Label className="text-sm">كود الخصم</Label>
                          <div className="flex gap-2">
                            <Input placeholder="أدخل الكود" className="font-mono" dir="ltr" disabled />
                            <Button variant="outline" size="sm" disabled>تطبيق</Button>
                          </div>
                        </div>
                      </>
                    )}

                    {config.showPriceBreakdown && (
                      <>
                        <Separator />
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">المنتج × 1</span>
                            <span>2,500 د.ج</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">التوصيل</span>
                            <span>400 د.ج</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-base">
                            <span>المجموع</span>
                            <span>2,900 د.ج</span>
                          </div>
                        </div>
                      </>
                    )}

                    <Button size="lg" className="w-full pointer-events-none">
                      <ShoppingBag className="w-4 h-4 ml-2" />
                      {config.buttonText} — 2,900 د.ج
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <p className="text-[10px] text-center text-muted-foreground/60 mt-2">
                معاينة — لن يتم تقديم طلب
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderPreviewField(field: CheckoutField) {
  const labelEl = (
    <Label className="text-sm">
      {field.label}
      {field.required && <span className="text-destructive mr-0.5">*</span>}
    </Label>
  );

  switch (field.type) {
    case "wilaya":
      return (
        <div className="space-y-1.5">
          {labelEl}
          <Select disabled>
            <SelectTrigger><SelectValue placeholder={field.placeholder || "اختر الولاية"} /></SelectTrigger>
            <SelectContent><SelectItem value="x">16 - Alger</SelectItem></SelectContent>
          </Select>
        </div>
      );
    case "commune":
      return (
        <div className="space-y-1.5">
          {labelEl}
          <Select disabled>
            <SelectTrigger><SelectValue placeholder={field.placeholder || "اختر البلدية"} /></SelectTrigger>
            <SelectContent><SelectItem value="x">Alger Centre</SelectItem></SelectContent>
          </Select>
        </div>
      );
    case "delivery_type":
      return (
        <div className="space-y-2">
          {labelEl}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-3 rounded-lg border-2 border-accent bg-accent/10 text-right text-sm">
              <Truck className="w-4 h-4 flex-shrink-0" />
              <div>
                <p className="font-medium">المنزل</p>
                <p className="text-xs text-muted-foreground">400 د.ج</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg border-2 border-border text-right text-sm">
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <div>
                <p className="font-medium">المكتب</p>
                <p className="text-xs text-muted-foreground">250 د.ج</p>
              </div>
            </div>
          </div>
        </div>
      );
    case "textarea":
      return (
        <div className="space-y-1.5">
          {labelEl}
          <Textarea placeholder={field.placeholder} disabled rows={2} />
        </div>
      );
    case "tel":
      return (
        <div className="space-y-1.5">
          {labelEl}
          <Input type="tel" placeholder={field.placeholder} disabled dir="ltr" />
        </div>
      );
    case "email":
      return (
        <div className="space-y-1.5">
          {labelEl}
          <Input type="email" placeholder={field.placeholder} disabled dir="ltr" />
        </div>
      );
    default:
      return (
        <div className="space-y-1.5">
          {labelEl}
          <Input placeholder={field.placeholder} disabled />
        </div>
      );
  }
}
