import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllExitIntents,
  upsertExitIntent,
  deleteExitIntent,
  DEFAULT_EXIT_CONFIG,
  type ExitIntentPopup,
  type ExitIntentConfig,
} from "@/lib/exit-intent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ExitIntentPreviewButton } from "@/components/admin/ExitIntentPreview";
import { Plus, Trash2, Save, MousePointerClick, Palette, Clock, Settings2 } from "lucide-react";
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
      toast.success("تم حفظ نافذة نية الخروج");
      setEditing(null);
    },
    onError: () => toast.error("فشل الحفظ"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExitIntent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exit-intents-admin"] });
      toast.success("تم الحذف");
    },
  });

  const cfg = (editing?.config ?? DEFAULT_EXIT_CONFIG) as ExitIntentConfig;
  const updateConfig = (patch: Partial<ExitIntentConfig>) =>
    setEditing((prev) => prev ? { ...prev, config: { ...cfg, ...patch } } : prev);

  const startNew = () =>
    setEditing({
      title: "انتظر! لا تغادر بعد!",
      subtitle: "احصل على خصم خاص قبل المغادرة",
      discount_percent: 10,
      discount_code: "",
      cta_text: "احصل على الخصم",
      is_active: true,
      config: { ...DEFAULT_EXIT_CONFIG },
    });

  const startEdit = (p: ExitIntentPopup) => setEditing({ ...p, config: { ...DEFAULT_EXIT_CONFIG, ...p.config } });

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-accent" />
          نوافذ نية الخروج
        </h3>
        {!editing && (
          <Button size="sm" onClick={startNew}>
            <Plus className="w-4 h-4 mr-1" /> نافذة جديدة
          </Button>
        )}
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editing.id ? "تعديل" : "إنشاء"} نافذة نية الخروج</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
                <TabsTrigger value="content" className="gap-1 px-2 sm:px-4"><Settings2 className="w-3.5 h-3.5" /> المحتوى</TabsTrigger>
                <TabsTrigger value="timing" className="gap-1 px-2 sm:px-4"><Clock className="w-3.5 h-3.5" /> التوقيت</TabsTrigger>
                <TabsTrigger value="design" className="gap-1 px-2 sm:px-4"><Palette className="w-3.5 h-3.5" /> التصميم</TabsTrigger>
              </TabsList>

              {/* ── Content Tab ── */}
              <TabsContent value="content" className="space-y-4">
                <div className="space-y-2">
                  <Label>العنوان</Label>
                  <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>العنوان الفرعي</Label>
                  <Input value={editing.subtitle ?? ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نسبة الخصم %</Label>
                    <Input type="number" value={editing.discount_percent ?? ""} onChange={(e) => setEditing({ ...editing, discount_percent: Number(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>كود الخصم (اختياري)</Label>
                    <Input value={editing.discount_code ?? ""} onChange={(e) => setEditing({ ...editing, discount_code: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>نص زر الدعوة</Label>
                  <Input value={editing.cta_text ?? ""} onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editing.is_active ?? false} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                  <Label>مفعّلة</Label>
                </div>
              </TabsContent>

              {/* ── Timing Tab ── */}
              <TabsContent value="timing" className="space-y-4">
                <div className="space-y-2">
                  <Label>نوع المحفز</Label>
                  <Select value={cfg.triggerType} onValueChange={(v) => updateConfig({ triggerType: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mouse_leave">مغادرة الماوس (سطح المكتب)</SelectItem>
                      <SelectItem value="time">بعد مدة زمنية</SelectItem>
                      <SelectItem value="scroll">نسبة التمرير</SelectItem>
                      <SelectItem value="mouse_leave_or_time">مغادرة الماوس أو مدة زمنية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(cfg.triggerType === "time" || cfg.triggerType === "mouse_leave_or_time" || cfg.triggerType === "mouse_leave") && (
                  <div className="space-y-2">
                    <Label>التأخير (ثوانٍ): {cfg.delaySeconds}</Label>
                    <Slider
                      value={[cfg.delaySeconds]}
                      onValueChange={([v]) => updateConfig({ delaySeconds: v })}
                      min={0} max={60} step={1}
                    />
                    <p className="text-xs text-muted-foreground">
                      {cfg.triggerType === "mouse_leave" ? "فترة الانتظار قبل تفعيل رصد مغادرة الماوس" : "عدد الثواني قبل ظهور النافذة"}
                    </p>
                  </div>
                )}

                {cfg.triggerType === "scroll" && (
                  <div className="space-y-2">
                    <Label>نسبة التمرير: {cfg.scrollPercent}%</Label>
                    <Slider
                      value={[cfg.scrollPercent]}
                      onValueChange={([v]) => updateConfig({ scrollPercent: v })}
                      min={10} max={100} step={5}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Switch checked={cfg.showOnMobile} onCheckedChange={(v) => updateConfig({ showOnMobile: v })} />
                  <Label>إظهار على الهاتف المحمول</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch checked={cfg.showTimer} onCheckedChange={(v) => updateConfig({ showTimer: v })} />
                  <Label>إظهار عداد تنازلي</Label>
                </div>

                {cfg.showTimer && (
                  <div className="space-y-2">
                    <Label>مدة العداد (دقائق): {cfg.timerMinutes}</Label>
                    <Slider
                      value={[cfg.timerMinutes]}
                      onValueChange={([v]) => updateConfig({ timerMinutes: v })}
                      min={1} max={30} step={1}
                    />
                  </div>
                )}
              </TabsContent>

              {/* ── Design Tab ── */}
              <TabsContent value="design" className="space-y-4">
                <div className="space-y-2">
                  <Label>الأيقونة</Label>
                  <Select value={cfg.iconType} onValueChange={(v) => updateConfig({ iconType: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gift">🎁 هدية</SelectItem>
                      <SelectItem value="percent">% نسبة</SelectItem>
                      <SelectItem value="tag">🏷️ علامة</SelectItem>
                      <SelectItem value="heart">❤️ قلب</SelectItem>
                      <SelectItem value="star">⭐ نجمة</SelectItem>
                      <SelectItem value="none">بدون أيقونة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>الحركة</Label>
                  <Select value={cfg.animation} onValueChange={(v) => updateConfig({ animation: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fade">تلاشي</SelectItem>
                      <SelectItem value="slide_up">انزلاق للأعلى</SelectItem>
                      <SelectItem value="scale">تكبير</SelectItem>
                      <SelectItem value="bounce">ارتداد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>حواف مستديرة</Label>
                  <Select value={cfg.borderRadius} onValueChange={(v) => updateConfig({ borderRadius: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">صغير</SelectItem>
                      <SelectItem value="md">متوسط</SelectItem>
                      <SelectItem value="lg">كبير</SelectItem>
                      <SelectItem value="xl">كبير جداً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>لون الخلفية</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={cfg.bgColor || "#ffffff"}
                        onChange={(e) => updateConfig({ bgColor: e.target.value })}
                        className="w-10 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={cfg.bgColor}
                        onChange={(e) => updateConfig({ bgColor: e.target.value })}
                        placeholder="افتراضي"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>لون النص</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={cfg.textColor || "#000000"}
                        onChange={(e) => updateConfig({ textColor: e.target.value })}
                        className="w-10 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={cfg.textColor}
                        onChange={(e) => updateConfig({ textColor: e.target.value })}
                        placeholder="افتراضي"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>لون الزر</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={cfg.buttonColor || "#000000"}
                        onChange={(e) => updateConfig({ buttonColor: e.target.value })}
                        className="w-10 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={cfg.buttonColor}
                        onChange={(e) => updateConfig({ buttonColor: e.target.value })}
                        placeholder="افتراضي"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>لون نص الزر</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={cfg.buttonTextColor || "#ffffff"}
                        onChange={(e) => updateConfig({ buttonTextColor: e.target.value })}
                        className="w-10 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={cfg.buttonTextColor}
                        onChange={(e) => updateConfig({ buttonTextColor: e.target.value })}
                        placeholder="افتراضي"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>شفافية الخلفية الداكنة: {cfg.overlayOpacity}%</Label>
                  <Slider
                    value={[cfg.overlayOpacity]}
                    onValueChange={([v]) => updateConfig({ overlayOpacity: v })}
                    min={0} max={100} step={5}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 mt-6">
              <Button onClick={() => saveMutation.mutate(editing as any)} disabled={saveMutation.isPending}>
                <Save className="w-4 h-4 mr-1" /> حفظ
              </Button>
              <ExitIntentPreviewButton popup={{ ...editing, config: cfg } as any} />
              <Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {!popups?.length && <p className="text-sm text-muted-foreground py-4">لم يتم إعداد أي نوافذ نية خروج.</p>}
          {popups?.map((p) => (
            <Card key={p.id} className="border-border">
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.subtitle}</p>
                  <div className="flex gap-2">
                    {p.discount_percent ? <Badge variant="secondary" className="text-xs">{p.discount_percent}% خصم</Badge> : null}
                    {p.is_active ? <Badge className="bg-green-600 text-white text-xs">مفعّلة</Badge> : <Badge variant="outline" className="text-xs">معطّلة</Badge>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <ExitIntentPreviewButton popup={p} />
                  <Button size="sm" variant="outline" onClick={() => startEdit(p)}>تعديل</Button>
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
