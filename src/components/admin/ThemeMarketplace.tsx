import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Download, Eye, Palette, Pencil, ShoppingBag, Sparkles, Store, Sun, Moon, Zap, Heart, Leaf, Crown } from "lucide-react";
import type { ThemeConfig, ThemeColors } from "@/lib/theme";

interface MarketplaceTheme {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  category: string;
  icon: React.ElementType;
  config: ThemeConfig;
  tags: string[];
  preview: {
    gradient: string;
    accentHex: string;
  };
}

const MARKETPLACE_THEMES: MarketplaceTheme[] = [
  {
    id: "sahara-gold",
    name: "ذهب الصحراء",
    nameEn: "Sahara Gold",
    description: "مظهر أنيق بألوان ذهبية دافئة مستوحاة من رمال الصحراء الجزائرية. مثالي للمنتجات الفاخرة والعطور.",
    category: "فاخر",
    icon: Crown,
    tags: ["فاخر", "ذهبي", "أنيق"],
    preview: { gradient: "from-amber-700 via-yellow-600 to-amber-500", accentHex: "#d4a017" },
    config: {
      colors: {
        background: "40 30% 97%",
        foreground: "30 20% 12%",
        card: "40 25% 100%",
        primary: "30 25% 15%",
        "primary-foreground": "40 30% 97%",
        secondary: "38 20% 94%",
        accent: "40 90% 45%",
        "accent-foreground": "30 25% 10%",
        muted: "38 15% 93%",
        "muted-foreground": "30 10% 45%",
        destructive: "0 72% 51%",
        border: "38 18% 88%",
        success: "142 72% 29%",
      },
      fonts: { heading: "Playfair Display", body: "Cairo" },
      borderRadius: "0.5rem",
      buttonStyle: "default",
    },
  },
  {
    id: "casbah-blue",
    name: "أزرق القصبة",
    nameEn: "Casbah Blue",
    description: "مستوحى من أزقة القصبة العريقة وزرقة البحر الأبيض المتوسط. مظهر نظيف وعصري لمتاجر الملابس والإلكترونيات.",
    category: "عصري",
    icon: Store,
    tags: ["عصري", "أزرق", "نظيف"],
    preview: { gradient: "from-blue-800 via-sky-600 to-cyan-500", accentHex: "#0284c7" },
    config: {
      colors: {
        background: "210 25% 98%",
        foreground: "215 25% 12%",
        card: "210 20% 100%",
        primary: "215 40% 18%",
        "primary-foreground": "210 25% 98%",
        secondary: "210 18% 95%",
        accent: "205 90% 48%",
        "accent-foreground": "0 0% 100%",
        muted: "210 14% 94%",
        "muted-foreground": "215 12% 48%",
        destructive: "0 72% 51%",
        border: "210 16% 90%",
        success: "142 72% 29%",
      },
      fonts: { heading: "Tajawal", body: "Tajawal" },
      borderRadius: "0.75rem",
      buttonStyle: "default",
    },
  },
  {
    id: "atlas-green",
    name: "أخضر الأطلس",
    nameEn: "Atlas Green",
    description: "ألوان طبيعية هادئة مستوحاة من جبال الأطلس والطبيعة الجزائرية. مناسب لمنتجات الصحة والمنتجات الطبيعية.",
    category: "طبيعي",
    icon: Leaf,
    tags: ["طبيعي", "أخضر", "هادئ"],
    preview: { gradient: "from-emerald-800 via-green-600 to-teal-500", accentHex: "#059669" },
    config: {
      colors: {
        background: "150 15% 97%",
        foreground: "155 25% 10%",
        card: "150 12% 100%",
        primary: "155 30% 15%",
        "primary-foreground": "150 15% 97%",
        secondary: "150 14% 94%",
        accent: "160 80% 38%",
        "accent-foreground": "0 0% 100%",
        muted: "150 12% 93%",
        "muted-foreground": "155 10% 45%",
        destructive: "0 72% 51%",
        border: "150 14% 89%",
        success: "142 72% 29%",
      },
      fonts: { heading: "Cairo", body: "Cairo" },
      borderRadius: "1rem",
      buttonStyle: "default",
    },
  },
  {
    id: "souk-warm",
    name: "دفء السوق",
    nameEn: "Souk Warmth",
    description: "ألوان دافئة تحاكي أجواء الأسواق الشعبية الجزائرية. مثالي لمتاجر الحلويات والأطعمة التقليدية.",
    category: "تقليدي",
    icon: ShoppingBag,
    tags: ["تقليدي", "دافئ", "شعبي"],
    preview: { gradient: "from-orange-800 via-red-600 to-rose-500", accentHex: "#ea580c" },
    config: {
      colors: {
        background: "25 20% 97%",
        foreground: "15 22% 12%",
        card: "25 18% 100%",
        primary: "15 28% 14%",
        "primary-foreground": "25 20% 97%",
        secondary: "25 16% 94%",
        accent: "20 92% 50%",
        "accent-foreground": "0 0% 100%",
        muted: "25 14% 93%",
        "muted-foreground": "15 10% 46%",
        destructive: "0 72% 51%",
        border: "25 15% 89%",
        success: "142 72% 29%",
      },
      fonts: { heading: "Tajawal", body: "Cairo" },
      borderRadius: "0.5rem",
      buttonStyle: "default",
    },
  },
  {
    id: "modern-dark",
    name: "عصري داكن",
    nameEn: "Modern Dark",
    description: "مظهر داكن عصري وأنيق بتدرجات رمادية. مناسب لمتاجر التقنية والإلكترونيات والساعات.",
    category: "عصري",
    icon: Moon,
    tags: ["داكن", "عصري", "تقني"],
    preview: { gradient: "from-gray-900 via-slate-700 to-gray-600", accentHex: "#6366f1" },
    config: {
      colors: {
        background: "225 15% 12%",
        foreground: "220 15% 92%",
        card: "225 14% 16%",
        primary: "220 15% 92%",
        "primary-foreground": "225 15% 12%",
        secondary: "225 12% 22%",
        accent: "240 70% 60%",
        "accent-foreground": "0 0% 100%",
        muted: "225 10% 20%",
        "muted-foreground": "220 10% 55%",
        destructive: "0 62% 40%",
        border: "225 10% 25%",
        success: "142 60% 40%",
      },
      fonts: { heading: "Space Grotesk", body: "DM Sans" },
      borderRadius: "0.75rem",
      buttonStyle: "default",
    },
  },
  {
    id: "tlemcen-purple",
    name: "بنفسجي تلمسان",
    nameEn: "Tlemcen Purple",
    description: "مستوحى من جمال مدينة تلمسان التاريخية. ألوان بنفسجية ملكية مناسبة لمتاجر مستحضرات التجميل والعناية.",
    category: "فاخر",
    icon: Sparkles,
    tags: ["فاخر", "بنفسجي", "أنثوي"],
    preview: { gradient: "from-purple-900 via-violet-600 to-fuchsia-500", accentHex: "#9333ea" },
    config: {
      colors: {
        background: "270 15% 98%",
        foreground: "275 25% 12%",
        card: "270 12% 100%",
        primary: "275 30% 16%",
        "primary-foreground": "270 15% 98%",
        secondary: "270 15% 95%",
        accent: "270 75% 55%",
        "accent-foreground": "0 0% 100%",
        muted: "270 12% 94%",
        "muted-foreground": "275 10% 48%",
        destructive: "0 72% 51%",
        border: "270 14% 90%",
        success: "142 72% 29%",
      },
      fonts: { heading: "Playfair Display", body: "Tajawal" },
      borderRadius: "1rem",
      buttonStyle: "default",
    },
  },
  {
    id: "djurdjura-fresh",
    name: "نسمة جرجرة",
    nameEn: "Djurdjura Fresh",
    description: "مظهر منعش بألوان فيروزية مستوحاة من نقاء جبال جرجرة. مثالي لمتاجر الرياضة والمنتجات الطبيعية.",
    category: "طبيعي",
    icon: Zap,
    tags: ["منعش", "فيروزي", "رياضي"],
    preview: { gradient: "from-teal-800 via-cyan-600 to-sky-400", accentHex: "#0891b2" },
    config: {
      colors: {
        background: "185 18% 97%",
        foreground: "190 25% 10%",
        card: "185 15% 100%",
        primary: "190 30% 14%",
        "primary-foreground": "185 18% 97%",
        secondary: "185 15% 94%",
        accent: "185 85% 42%",
        "accent-foreground": "0 0% 100%",
        muted: "185 12% 93%",
        "muted-foreground": "190 10% 45%",
        destructive: "0 72% 51%",
        border: "185 14% 89%",
        success: "142 72% 29%",
      },
      fonts: { heading: "Montserrat", body: "Tajawal" },
      borderRadius: "0.75rem",
      buttonStyle: "default",
    },
  },
  {
    id: "rose-romance",
    name: "وردة الجزائر",
    nameEn: "Algerian Rose",
    description: "ألوان وردية رومانسية ناعمة. مثالي لمتاجر الهدايا والإكسسوارات النسائية والعطور.",
    category: "أنثوي",
    icon: Heart,
    tags: ["وردي", "أنثوي", "رومانسي"],
    preview: { gradient: "from-pink-800 via-rose-500 to-pink-400", accentHex: "#e11d48" },
    config: {
      colors: {
        background: "350 20% 98%",
        foreground: "345 22% 12%",
        card: "350 18% 100%",
        primary: "345 28% 16%",
        "primary-foreground": "350 20% 98%",
        secondary: "350 16% 95%",
        accent: "350 80% 50%",
        "accent-foreground": "0 0% 100%",
        muted: "350 12% 94%",
        "muted-foreground": "345 10% 48%",
        destructive: "0 72% 51%",
        border: "350 14% 90%",
        success: "142 72% 29%",
      },
      fonts: { heading: "Playfair Display", body: "Cairo" },
      borderRadius: "1.5rem",
      buttonStyle: "default",
    },
  },
  {
    id: "clean-minimal",
    name: "بسيط ونظيف",
    nameEn: "Clean Minimal",
    description: "تصميم بسيط ومرتب بألوان محايدة. يناسب جميع أنواع المتاجر ويبرز المنتجات بشكل واضح.",
    category: "عصري",
    icon: Sun,
    tags: ["بسيط", "نظيف", "محايد"],
    preview: { gradient: "from-gray-600 via-slate-400 to-gray-300", accentHex: "#1e293b" },
    config: {
      colors: {
        background: "0 0% 99%",
        foreground: "220 18% 12%",
        card: "0 0% 100%",
        primary: "220 18% 12%",
        "primary-foreground": "0 0% 99%",
        secondary: "220 10% 96%",
        accent: "220 18% 12%",
        "accent-foreground": "0 0% 99%",
        muted: "220 10% 95%",
        "muted-foreground": "220 8% 50%",
        destructive: "0 72% 51%",
        border: "220 10% 92%",
        success: "142 72% 29%",
      },
      fonts: { heading: "DM Sans", body: "DM Sans" },
      borderRadius: "0.25rem",
      buttonStyle: "default",
    },
  },
];

const CATEGORIES = ["الكل", "فاخر", "عصري", "طبيعي", "تقليدي", "أنثوي"];

interface ThemeMarketplaceProps {
  currentTheme: ThemeConfig;
  onInstallTheme: (config: ThemeConfig) => void;
}

export function ThemeMarketplace({ currentTheme, onInstallTheme }: ThemeMarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [previewTheme, setPreviewTheme] = useState<MarketplaceTheme | null>(null);
  const [customizing, setCustomizing] = useState<MarketplaceTheme | null>(null);
  const [customColors, setCustomColors] = useState<ThemeColors | null>(null);

  const filtered = selectedCategory === "الكل"
    ? MARKETPLACE_THEMES
    : MARKETPLACE_THEMES.filter((t) => t.category === selectedCategory);

  const handleInstall = (theme: MarketplaceTheme) => {
    const config = customColors
      ? { ...theme.config, colors: customColors }
      : theme.config;
    onInstallTheme(config);
    setPreviewTheme(null);
    setCustomizing(null);
    setCustomColors(null);
  };

  const startCustomize = (theme: MarketplaceTheme) => {
    setCustomColors({ ...theme.config.colors });
    setCustomizing(theme);
  };

  function hslToHex(hsl: string): string {
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

  function hexToHsl(hex: string): string {
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

  const MAIN_COLORS: { key: keyof ThemeColors; label: string }[] = [
    { key: "background", label: "الخلفية" },
    { key: "foreground", label: "النص" },
    { key: "primary", label: "الأساسي" },
    { key: "accent", label: "التمييز" },
    { key: "card", label: "البطاقة" },
    { key: "border", label: "الحدود" },
  ];

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={selectedCategory === cat ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Theme grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((theme) => (
          <Card key={theme.id} className="overflow-hidden group hover:shadow-md transition-shadow border-border">
            {/* Preview header */}
            <div className={`h-28 bg-gradient-to-br ${theme.preview.gradient} relative flex items-end p-3`}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <theme.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{theme.name}</h3>
                  <p className="text-[10px] text-white/70">{theme.nameEn}</p>
                </div>
              </div>
              <Badge className="absolute top-2 end-2 text-[10px] bg-white/20 text-white border-0 backdrop-blur-sm">
                {theme.category}
              </Badge>
            </div>

            <CardContent className="p-3 space-y-2.5">
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{theme.description}</p>
              
              {/* Color dots */}
              <div className="flex items-center gap-1.5">
                {["primary", "accent", "background", "foreground"].map((key) => (
                  <div
                    key={key}
                    className="w-5 h-5 rounded-full border border-border"
                    style={{ backgroundColor: `hsl(${theme.config.colors[key as keyof ThemeColors]})` }}
                    title={key}
                  />
                ))}
                <span className="text-[10px] text-muted-foreground ms-1">{theme.config.fonts.heading}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {theme.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[9px] h-4 px-1.5">{tag}</Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 pt-1">
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs gap-1"
                  onClick={() => handleInstall(theme)}
                >
                  <Download className="w-3 h-3" /> تثبيت
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1"
                  onClick={() => setPreviewTheme(theme)}
                >
                  <Eye className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1"
                  onClick={() => startCustomize(theme)}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTheme} onOpenChange={() => setPreviewTheme(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewTheme && <previewTheme.icon className="w-5 h-5" />}
              {previewTheme?.name}
            </DialogTitle>
            <DialogDescription>{previewTheme?.description}</DialogDescription>
          </DialogHeader>
          {previewTheme && (
            <div className="space-y-4">
              {/* Full preview with theme applied */}
              <div
                className="rounded-lg border overflow-hidden p-4 space-y-3"
                style={{
                  backgroundColor: `hsl(${previewTheme.config.colors.background})`,
                  color: `hsl(${previewTheme.config.colors.foreground})`,
                  borderColor: `hsl(${previewTheme.config.colors.border})`,
                }}
              >
                <h3 className="text-lg font-bold" style={{ fontFamily: previewTheme.config.fonts.heading }}>
                  مرحباً بكم في متجرنا
                </h3>
                <p className="text-sm opacity-70" style={{ fontFamily: previewTheme.config.fonts.body }}>
                  اكتشف أفضل المنتجات بأسعار مميزة مع توصيل سريع لجميع ولايات الجزائر
                </p>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 text-xs font-medium"
                    style={{
                      backgroundColor: `hsl(${previewTheme.config.colors.accent})`,
                      color: `hsl(${previewTheme.config.colors["accent-foreground"]})`,
                      borderRadius: previewTheme.config.borderRadius,
                    }}
                  >
                    اطلب الآن
                  </button>
                  <button
                    className="px-4 py-2 text-xs font-medium border"
                    style={{
                      borderColor: `hsl(${previewTheme.config.colors.border})`,
                      color: `hsl(${previewTheme.config.colors.foreground})`,
                      borderRadius: previewTheme.config.borderRadius,
                    }}
                  >
                    تصفح المنتجات
                  </button>
                </div>
                <div
                  className="p-3 mt-2"
                  style={{
                    backgroundColor: `hsl(${previewTheme.config.colors.card})`,
                    borderRadius: previewTheme.config.borderRadius,
                    border: `1px solid hsl(${previewTheme.config.colors.border})`,
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold">منتج تجريبي</p>
                      <p className="text-xs" style={{ color: `hsl(${previewTheme.config.colors["muted-foreground"]})` }}>
                        وصف قصير للمنتج
                      </p>
                    </div>
                    <div className="text-sm font-bold" style={{ color: `hsl(${previewTheme.config.colors.accent})` }}>
                      2,500 د.ج
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>الخط: {previewTheme.config.fonts.heading} / {previewTheme.config.fonts.body}</span>
                <span>الحواف: {previewTheme.config.borderRadius}</span>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 gap-1" onClick={() => handleInstall(previewTheme)}>
                  <Download className="w-4 h-4" /> تثبيت الثيم
                </Button>
                <Button variant="outline" className="gap-1" onClick={() => { setPreviewTheme(null); startCustomize(previewTheme); }}>
                  <Pencil className="w-4 h-4" /> تعديل وتثبيت
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Customize Dialog */}
      <Dialog open={!!customizing} onOpenChange={() => { setCustomizing(null); setCustomColors(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              تعديل: {customizing?.name}
            </DialogTitle>
            <DialogDescription>عدّل الألوان الرئيسية ثم ثبّت الثيم المخصص</DialogDescription>
          </DialogHeader>
          {customizing && customColors && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {MAIN_COLORS.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hslToHex(customColors[key])}
                      onChange={(e) => setCustomColors((prev) => prev ? { ...prev, [key]: hexToHsl(e.target.value) } : prev)}
                      className="w-8 h-8 rounded border border-border cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-0"
                    />
                    <Label className="text-xs">{label}</Label>
                  </div>
                ))}
              </div>

              {/* Live mini preview */}
              <div
                className="rounded-lg border p-3 space-y-2"
                style={{
                  backgroundColor: `hsl(${customColors.background})`,
                  color: `hsl(${customColors.foreground})`,
                  borderColor: `hsl(${customColors.border})`,
                }}
              >
                <p className="text-sm font-bold" style={{ fontFamily: customizing.config.fonts.heading }}>معاينة مباشرة</p>
                <div className="flex gap-2">
                  <div
                    className="px-3 py-1.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: `hsl(${customColors.accent})`,
                      color: `hsl(${customColors["accent-foreground"]})`,
                      borderRadius: customizing.config.borderRadius,
                    }}
                  >
                    زر أساسي
                  </div>
                  <div
                    className="px-3 py-1.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: `hsl(${customColors.primary})`,
                      color: `hsl(${customColors["primary-foreground"]})`,
                      borderRadius: customizing.config.borderRadius,
                    }}
                  >
                    زر ثانوي
                  </div>
                </div>
                <div
                  className="p-2 text-[10px]"
                  style={{
                    backgroundColor: `hsl(${customColors.card})`,
                    borderRadius: customizing.config.borderRadius,
                    border: `1px solid hsl(${customColors.border})`,
                  }}
                >
                  بطاقة منتج — <span style={{ color: `hsl(${customColors.accent})` }}>2,500 د.ج</span>
                </div>
              </div>

              <Button className="w-full gap-1" onClick={() => handleInstall(customizing)}>
                <Check className="w-4 h-4" /> تثبيت الثيم المعدّل
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
