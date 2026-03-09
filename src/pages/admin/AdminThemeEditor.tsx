import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTheme,
  saveTheme,
  applyThemeToDocument,
  DEFAULT_THEME,
  FONT_OPTIONS,
  RADIUS_OPTIONS,
  COLOR_PRESETS,
  type ThemeConfig,
  type ThemeColors,
} from "@/lib/theme";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Monitor,
  Tablet,
  Smartphone,
  Save,
  RotateCcw,
  Palette,
  Type,
  Paintbrush,
  Check,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeMarketplace } from "@/components/admin/ThemeMarketplace";

const VIEWPORTS = [
  { id: "desktop" as const, icon: Monitor, width: "100%", label: "Desktop" },
  { id: "tablet" as const, icon: Tablet, width: "768px", label: "Tablet" },
  { id: "mobile" as const, icon: Smartphone, width: "375px", label: "Mobile" },
];

function hslStringToHex(hsl: string): string {
  const parts = hsl.trim().split(/\s+/);
  if (parts.length < 3) return "#000000";
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHslString(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  background: "الخلفية",
  foreground: "لون النص",
  card: "خلفية البطاقة",
  primary: "اللون الأساسي",
  "primary-foreground": "نص اللون الأساسي",
  secondary: "اللون الثانوي",
  accent: "لون التمييز",
  "accent-foreground": "نص التمييز",
  muted: "لون خافت",
  "muted-foreground": "نص خافت",
  destructive: "لون التحذير",
  border: "الحدود",
  success: "النجاح",
};

export default function AdminThemeEditor() {
  const queryClient = useQueryClient();
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [showPreview, setShowPreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isMobile = useIsMobile();

  const { data: savedTheme, isLoading } = useQuery({
    queryKey: ["theme-settings"],
    queryFn: fetchTheme,
  });

  useEffect(() => {
    if (savedTheme) setTheme(savedTheme);
  }, [savedTheme]);

  const applyToIframe = useCallback((t: ThemeConfig) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    const root = iframe.contentDocument.documentElement;
    Object.entries(t.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    root.style.setProperty("--radius", t.borderRadius);
  }, []);

  useEffect(() => {
    applyToIframe(theme);
  }, [theme, applyToIframe]);

  const updateColor = (key: keyof ThemeColors, hex: string) => {
    const hsl = hexToHslString(hex);
    setTheme((prev) => ({ ...prev, colors: { ...prev.colors, [key]: hsl } }));
  };

  const updateFont = (field: "heading" | "body", value: string) => {
    setTheme((prev) => ({ ...prev, fonts: { ...prev.fonts, [field]: value } }));
  };

  const saveMutation = useMutation({
    mutationFn: () => saveTheme(theme),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["theme-settings"] });
      applyThemeToDocument(theme);
      toast.success("تم حفظ وتطبيق المظهر!");
    },
    onError: () => toast.error("فشل في حفظ المظهر"),
  });

  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
    toast.info("تم إعادة المظهر للافتراضي (لم يتم الحفظ بعد)");
  };

  const applyPreset = (preset: typeof COLOR_PRESETS[number]) => {
    setTheme((prev) => ({
      ...prev,
      colors: { ...prev.colors, ...preset.colors },
    }));
    toast.info(`تم تطبيق "${preset.name}"`);
  };

  const hasChanges = JSON.stringify(theme) !== JSON.stringify(savedTheme ?? DEFAULT_THEME);
  const currentVp = VIEWPORTS.find((v) => v.id === viewport)!;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> جاري تحميل المظهر…
      </div>
    );
  }

  const handleInstallTheme = (config: typeof theme) => {
    setTheme(config);
    toast.success("تم تطبيق الثيم! اضغط 'حفظ وتطبيق' لحفظه نهائياً");
  };

  const controlsPanel = (
    <ScrollArea className="flex-1">
      <div className="p-4">
        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="marketplace" className="text-xs gap-1">
              <Store className="w-3.5 h-3.5" /> ثيمات
            </TabsTrigger>
            <TabsTrigger value="colors" className="text-xs gap-1">
              <Palette className="w-3.5 h-3.5" /> الألوان
            </TabsTrigger>
            <TabsTrigger value="fonts" className="text-xs gap-1">
              <Type className="w-3.5 h-3.5" /> الخطوط
            </TabsTrigger>
            <TabsTrigger value="style" className="text-xs gap-1">
              <Paintbrush className="w-3.5 h-3.5" /> الأنماط
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="mt-0">
            <ThemeMarketplace currentTheme={theme} onInstallTheme={handleInstallTheme} />
          </TabsContent>

          <TabsContent value="colors" className="mt-0 space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">أنماط سريعة</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="text-left p-2 rounded-lg border border-border hover:border-accent/50 transition-colors group"
                  >
                    <div className="flex gap-1 mb-1.5">
                      {Object.values(preset.colors).slice(0, 3).map((c, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: `hsl(${c})` }}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground truncate">{preset.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">تخصيص الألوان</Label>
              <div className="space-y-2">
                {(Object.keys(COLOR_LABELS) as (keyof ThemeColors)[]).map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={hslStringToHex(theme.colors[key])}
                        onChange={(e) => updateColor(key, e.target.value)}
                        className="w-8 h-8 rounded-md border border-border cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-0"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{COLOR_LABELS[key]}</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">{theme.colors[key]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fonts" className="mt-0 space-y-5">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">خط العناوين</Label>
                <Select value={theme.fonts.heading} onValueChange={(v) => updateFont("heading", v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-lg font-bold" style={{ fontFamily: theme.fonts.heading }}>The quick brown fox</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">خط النص</Label>
                <Select value={theme.fonts.body} onValueChange={(v) => updateFont("body", v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm" style={{ fontFamily: theme.fonts.body }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style" className="mt-0 space-y-5">
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">حواف الزوايا</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme((prev) => ({ ...prev, borderRadius: opt.value }))}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border-2 transition-all ${
                      theme.borderRadius === opt.value ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="w-10 h-7 bg-accent/20 border-2 border-accent/50" style={{ borderRadius: opt.value }} />
                    <span className="text-[10px] font-medium">{opt.label}</span>
                    {theme.borderRadius === opt.value && <Check className="w-3 h-3 text-accent" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">معاينة العناصر</Label>
              <div className="space-y-2 p-3 rounded-lg bg-muted/30 border border-border">
                <Button size="sm" className="w-full" style={{ borderRadius: theme.borderRadius }}>زر أساسي</Button>
                <Button size="sm" variant="outline" className="w-full" style={{ borderRadius: theme.borderRadius }}>زر ثانوي</Button>
                <Input placeholder="حقل إدخال" style={{ borderRadius: theme.borderRadius }} className="h-9" />
                <Card style={{ borderRadius: theme.borderRadius }}>
                  <CardContent className="p-3"><p className="text-xs text-muted-foreground">معاينة عنصر بطاقة</p></CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );

  // Mobile layout: stacked vertically
  if (isMobile) {
    return (
      <div className="space-y-4 -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold">المظهر</h2>
            {hasChanges && <Badge variant="secondary" className="text-[10px]">●</Badge>}
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="outline" className="h-8 px-2" onClick={resetTheme}>
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" className="h-8" onClick={() => saveMutation.mutate()} disabled={!hasChanges || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {showPreview && (
          <div className="px-3">
            <div className="bg-background border border-border rounded-lg shadow-lg overflow-hidden h-[300px]">
              <iframe
                ref={iframeRef}
                src="/"
                className="w-full h-full border-0"
                title="Theme preview"
                onLoad={() => applyToIframe(theme)}
              />
            </div>
          </div>
        )}

        <div className="px-3">
          {controlsPanel}
        </div>
      </div>
    );
  }

  // Desktop layout: side-by-side
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] -m-4 md:-m-6 lg:-m-8">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-accent" />
          <h2 className="text-sm font-semibold">محرر المظهر</h2>
          {hasChanges && <Badge variant="secondary" className="text-[10px]">تغييرات غير محفوظة</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-border p-0.5 bg-muted/30">
            {VIEWPORTS.map((vp) => (
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
          <Button size="sm" variant="outline" onClick={resetTheme}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> إعادة تعيين
          </Button>
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={!hasChanges || saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
            حفظ وتطبيق
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Controls */}
        <div className="w-80 shrink-0 border-r border-border bg-card flex flex-col">
          {controlsPanel}
        </div>

        {/* Right: Live Preview */}
        <div className="flex-1 bg-muted/30 flex items-start justify-center overflow-auto p-4">
          <div
            className="bg-background border border-border rounded-lg shadow-lg overflow-hidden transition-all duration-300 h-full"
            style={{ width: currentVp.width, maxWidth: "100%" }}
          >
            <iframe
              ref={iframeRef}
              src="/"
              className="w-full h-full border-0"
              title="Theme preview"
              onLoad={() => applyToIframe(theme)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
