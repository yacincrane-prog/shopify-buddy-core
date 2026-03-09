import { useState, useEffect, useRef, useCallback } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchStorefrontConfig,
  saveStorefrontConfig,
  DEFAULT_STOREFRONT,
  type StorefrontConfig,
} from "@/lib/storefront-config";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "@/lib/categories";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Store,
  Home,
  FolderTree,
  Palette,
  ShoppingBag,
  Save,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Megaphone,
  Image,
  FileText,
  Phone,
  Mail,
  Facebook,
  Instagram,
  LayoutGrid,
  Monitor,
  Tablet,
  Smartphone,
  PanelRightOpen,
  PanelRightClose,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

function SortableCategoryCard({ cat, onToggle, onEdit, onDelete }: {
  cat: Category;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <Card ref={setNodeRef} style={style}>
      <CardContent className="p-3 flex items-center gap-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none shrink-0">
          <GripVertical className="w-4 h-4 text-muted-foreground/40" />
        </button>
        {cat.image ? (
          <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-lg object-cover border border-border" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <FolderTree className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{cat.name}</p>
          <p className="text-[10px] text-muted-foreground">/{cat.slug}</p>
        </div>
        <Badge variant={cat.is_active ? "default" : "secondary"} className="text-[10px]">
          {cat.is_active ? "نشطة" : "معطلة"}
        </Badge>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onToggle}>
            {cat.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>حذف الفئة؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف الفئة "{cat.name}" نهائياً. المنتجات المرتبطة لن تُحذف.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                  حذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminStorefront() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [config, setConfig] = useState<StorefrontConfig>(DEFAULT_STOREFRONT);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name: "", slug: "", image: "", description: "", position: 0 });
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Send config to iframe for instant preview
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "storefront-config-preview", config },
      "*"
    );
  }, [config]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const { data: savedConfig, isLoading: configLoading } = useQuery({
    queryKey: ["storefront-config"],
    queryFn: fetchStorefrontConfig,
  });

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    if (savedConfig) setConfig(savedConfig);
  }, [savedConfig]);

  const saveMutation = useMutation({
    mutationFn: () => saveStorefrontConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storefront-config"] });
      setPreviewKey((k) => k + 1);
      toast.success("تم حفظ إعدادات المتجر");
    },
    onError: () => toast.error("فشل في حفظ الإعدادات"),
  });

  const createCatMutation = useMutation({
    mutationFn: (cat: any) => createCategory(cat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryDialog(false);
      resetCatForm();
      toast.success("تم إضافة الفئة");
    },
    onError: () => toast.error("فشل في إضافة الفئة"),
  });

  const updateCatMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryDialog(false);
      setEditingCategory(null);
      resetCatForm();
      toast.success("تم تحديث الفئة");
    },
    onError: () => toast.error("فشل في تحديث الفئة"),
  });

  const deleteCatMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("تم حذف الفئة");
    },
  });

  const toggleCatMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateCategory(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  const handleCategoryDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...categories];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    queryClient.setQueryData(["categories"], reordered);
    try {
      await Promise.all(reordered.map((cat, i) => updateCategory(cat.id, { position: i })));
      toast.success("تم تحديث ترتيب الفئات");
    } catch {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.error("فشل في تحديث الترتيب");
    }
  }, [categories, queryClient]);

  const resetCatForm = () => setCatForm({ name: "", slug: "", image: "", description: "", position: 0 });

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatForm({ name: cat.name, slug: cat.slug, image: cat.image, description: cat.description, position: cat.position });
    setCategoryDialog(true);
  };

  const openNewCategory = () => {
    setEditingCategory(null);
    resetCatForm();
    setCatForm((prev) => ({ ...prev, position: categories.length }));
    setCategoryDialog(true);
  };

  const handleCatSubmit = () => {
    if (!catForm.name || !catForm.slug) {
      toast.error("الاسم والرابط مطلوبان");
      return;
    }
    if (editingCategory) {
      updateCatMutation.mutate({ id: editingCategory.id, ...catForm, is_active: editingCategory.is_active });
    } else {
      createCatMutation.mutate({ ...catForm, is_active: true });
    }
  };

  const autoSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^\u0621-\u064Aa-z0-9-]/g, "");
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(savedConfig ?? DEFAULT_STOREFRONT);

  if (configLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin me-2" /> جاري التحميل…
      </div>
    );
  }

  const VIEWPORTS = [
    { id: "desktop" as const, icon: Monitor, width: "100%", label: "سطح المكتب" },
    { id: "tablet" as const, icon: Tablet, width: "768px", label: "جهاز لوحي" },
    { id: "mobile" as const, icon: Smartphone, width: "375px", label: "هاتف" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <AdminPageHeader
          title="تخصيص المتجر"
          description="تحكم في مظهر متجرك: الصفحة الرئيسية، الفئات، صفحة المنتج، والمزيد"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview((p) => !p)}
            className="hidden lg:flex"
          >
            {showPreview ? <PanelRightClose className="w-4 h-4 me-1" /> : <PanelRightOpen className="w-4 h-4 me-1" />}
            {showPreview ? "إخفاء المعاينة" : "إظهار المعاينة"}
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={!hasChanges || saveMutation.isPending} size="sm">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : <Save className="w-4 h-4 me-1" />}
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <div className={`flex gap-4 ${showPreview ? "" : ""}`}>
        {/* Settings Panel */}
        <div className={`min-w-0 ${showPreview ? "w-1/2 hidden lg:block" : "w-full"} lg:block w-full`}>
      <Tabs defaultValue="homepage" className="w-full">
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-5 mb-4 h-auto">
          <TabsTrigger value="homepage" className="text-xs gap-1.5 py-2">
            <Home className="w-3.5 h-3.5" /> الصفحة الرئيسية
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs gap-1.5 py-2">
            <FolderTree className="w-3.5 h-3.5" /> الفئات
          </TabsTrigger>
          <TabsTrigger value="product-page" className="text-xs gap-1.5 py-2">
            <ShoppingBag className="w-3.5 h-3.5" /> صفحة المنتج
          </TabsTrigger>
          <TabsTrigger value="footer" className="text-xs gap-1.5 py-2">
            <FileText className="w-3.5 h-3.5" /> التذييل
          </TabsTrigger>
          <TabsTrigger value="theme" className="text-xs gap-1.5 py-2">
            <Palette className="w-3.5 h-3.5" /> المظهر
          </TabsTrigger>
        </TabsList>

        {/* ═══════ Homepage Tab ═══════ */}
        <TabsContent value="homepage" className="space-y-4">
          {/* Store Identity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Store className="w-4 h-4" /> هوية المتجر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">اسم المتجر (عربي)</Label>
                  <Input
                    value={config.storeName}
                    onChange={(e) => setConfig((p) => ({ ...p, storeName: e.target.value }))}
                    placeholder="متجري"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">اسم المتجر (إنجليزي)</Label>
                  <Input
                    value={config.storeNameEn}
                    onChange={(e) => setConfig((p) => ({ ...p, storeNameEn: e.target.value }))}
                    placeholder="My Store"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">الشعار</Label>
                <ImageUploadField
                  value={config.logo}
                  onChange={(url) => setConfig((p) => ({ ...p, logo: url }))}
                  folder="storefront/logo"
                  placeholder="https://example.com/logo.png"
                  previewClassName="w-16 h-16 rounded-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Announcement Bar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Megaphone className="w-4 h-4" /> شريط الإعلانات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs">تفعيل شريط الإعلانات</Label>
                <Switch
                  checked={config.announcementBar.enabled}
                  onCheckedChange={(v) =>
                    setConfig((p) => ({ ...p, announcementBar: { ...p.announcementBar, enabled: v } }))
                  }
                />
              </div>
              {config.announcementBar.enabled && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">نص الإعلان</Label>
                    <Input
                      value={config.announcementBar.text}
                      onChange={(e) =>
                        setConfig((p) => ({ ...p, announcementBar: { ...p.announcementBar, text: e.target.value } }))
                      }
                    />
                  </div>
                  {/* Preview */}
                  <div className="rounded-md bg-primary text-primary-foreground text-center py-2 text-xs font-medium">
                    {config.announcementBar.text || "نص الإعلان هنا"}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hero Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Image className="w-4 h-4" /> قسم الترحيب (Hero)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs">تفعيل قسم الترحيب</Label>
                <Switch
                  checked={config.hero.enabled}
                  onCheckedChange={(v) =>
                    setConfig((p) => ({ ...p, hero: { ...p.hero, enabled: v } }))
                  }
                />
              </div>
              {config.hero.enabled && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">العنوان الرئيسي</Label>
                    <Input
                      value={config.hero.title}
                      onChange={(e) => setConfig((p) => ({ ...p, hero: { ...p.hero, title: e.target.value } }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">العنوان الفرعي</Label>
                    <Input
                      value={config.hero.subtitle}
                      onChange={(e) => setConfig((p) => ({ ...p, hero: { ...p.hero, subtitle: e.target.value } }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">نص الزر</Label>
                      <Input
                        value={config.hero.buttonText}
                        onChange={(e) => setConfig((p) => ({ ...p, hero: { ...p.hero, buttonText: e.target.value } }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">رابط الزر</Label>
                      <Input
                        value={config.hero.buttonLink}
                        onChange={(e) => setConfig((p) => ({ ...p, hero: { ...p.hero, buttonLink: e.target.value } }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">صورة الخلفية (اختياري)</Label>
                    <ImageUploadField
                      value={config.hero.backgroundImage}
                      onChange={(url) => setConfig((p) => ({ ...p, hero: { ...p.hero, backgroundImage: url } }))}
                      folder="storefront/hero"
                      placeholder="https://example.com/hero.jpg"
                      previewClassName="w-full h-24 rounded-lg"
                    />
                  </div>
                  {/* Hero Preview */}
                  <div
                    className="rounded-lg overflow-hidden relative h-32 flex items-center justify-center text-center bg-gradient-to-br from-primary/80 to-accent/60"
                    style={
                      config.hero.backgroundImage
                        ? { backgroundImage: `url(${config.hero.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                        : {}
                    }
                  >
                    {config.hero.overlay && <div className="absolute inset-0 bg-black/40" />}
                    <div className="relative z-10 text-white px-4">
                      <p className="font-bold text-sm">{config.hero.title}</p>
                      <p className="text-xs opacity-80 mt-1">{config.hero.subtitle}</p>
                      <div className="mt-2 inline-block bg-accent text-accent-foreground px-3 py-1 rounded text-[10px] font-medium">
                        {config.hero.buttonText}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" /> قسم المنتجات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">عنوان القسم</Label>
                <Input
                  value={config.featuredSection.title}
                  onChange={(e) =>
                    setConfig((p) => ({ ...p, featuredSection: { ...p.featuredSection, title: e.target.value } }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">عرض الفئات</Label>
                <Switch
                  checked={config.featuredSection.showCategories}
                  onCheckedChange={(v) =>
                    setConfig((p) => ({ ...p, featuredSection: { ...p.featuredSection, showCategories: v } }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">تخطيط الشبكة</Label>
                <Select
                  value={config.featuredSection.layout}
                  onValueChange={(v: any) =>
                    setConfig((p) => ({ ...p, featuredSection: { ...p.featuredSection, layout: v } }))
                  }
                >
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid-2">عمودين</SelectItem>
                    <SelectItem value="grid-3">3 أعمدة</SelectItem>
                    <SelectItem value="grid-4">4 أعمدة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ Categories Tab ═══════ */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">فئات المنتجات</h3>
              <p className="text-xs text-muted-foreground">أنشئ فئات لتنظيم منتجاتك وتسهيل التصفح</p>
            </div>
            <Button size="sm" onClick={openNewCategory}>
              <Plus className="w-3.5 h-3.5 me-1" /> إضافة فئة
            </Button>
          </div>

          {catsLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" /> جاري التحميل…
            </div>
          ) : !categories.length ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FolderTree className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">لا توجد فئات بعد</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={openNewCategory}>
                  <Plus className="w-3.5 h-3.5 me-1" /> أضف أول فئة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
              <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <SortableCategoryCard
                      key={cat.id}
                      cat={cat}
                      onToggle={() => toggleCatMutation.mutate({ id: cat.id, is_active: !cat.is_active })}
                      onEdit={() => openEditCategory(cat)}
                      onDelete={() => deleteCatMutation.mutate(cat.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>

        {/* ═══════ Product Page Tab ═══════ */}
        <TabsContent value="product-page" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">إعدادات صفحة المنتج</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">عرض مسار التنقل (Breadcrumb)</Label>
                  <p className="text-[10px] text-muted-foreground">المتجر &gt; الفئة &gt; المنتج</p>
                </div>
                <Switch
                  checked={config.productPage.showBreadcrumb}
                  onCheckedChange={(v) =>
                    setConfig((p) => ({ ...p, productPage: { ...p.productPage, showBreadcrumb: v } }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">عرض شارة المخزون</Label>
                <Switch
                  checked={config.productPage.showStockBadge}
                  onCheckedChange={(v) =>
                    setConfig((p) => ({ ...p, productPage: { ...p.productPage, showStockBadge: v } }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">عرض المنتجات ذات الصلة</Label>
                <Switch
                  checked={config.productPage.showRelatedProducts}
                  onCheckedChange={(v) =>
                    setConfig((p) => ({ ...p, productPage: { ...p.productPage, showRelatedProducts: v } }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">أزرار المشاركة</Label>
                <Switch
                  checked={config.productPage.showShareButtons}
                  onCheckedChange={(v) =>
                    setConfig((p) => ({ ...p, productPage: { ...p.productPage, showShareButtons: v } }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">إظهار نموذج الطلب دائمًا</Label>
                  <p className="text-[10px] text-muted-foreground">عرض نموذج الطلب مباشرة بدون الضغط على زر</p>
                </div>
                <Switch
                  checked={config.productPage.alwaysShowCheckoutForm ?? true}
                  onCheckedChange={(v) =>
                    setConfig((p) => ({ ...p, productPage: { ...p.productPage, alwaysShowCheckoutForm: v } }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">موضع نموذج الطلب</Label>
                <Select
                  value={config.productPage.checkoutFormPosition ?? "below_title"}
                  onValueChange={(v: any) =>
                    setConfig((p) => ({ ...p, productPage: { ...p.productPage, checkoutFormPosition: v } }))
                  }
                >
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below_title">تحت العنوان والسعر</SelectItem>
                    <SelectItem value="below_description">تحت الوصف</SelectItem>
                    <SelectItem value="below_gallery">تحت معرض الصور</SelectItem>
                    <SelectItem value="bottom">أسفل الصفحة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">موضع الصور</Label>
                <Select
                  value={config.productPage.imagePosition}
                  onValueChange={(v: any) =>
                    setConfig((p) => ({ ...p, productPage: { ...p.productPage, imagePosition: v } }))
                  }
                >
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="right">يمين (افتراضي RTL)</SelectItem>
                    <SelectItem value="left">يسار</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">أدوات متقدمة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-xs gap-2" onClick={() => navigate("/admin/page-builder")}>
                <LayoutGrid className="w-4 h-4" /> منشئ أقسام المنتج
                <span className="text-muted-foreground ms-auto">تخصيص أقسام صفحة كل منتج</span>
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs gap-2" onClick={() => navigate("/admin/landing-pages")}>
                <FileText className="w-4 h-4" /> صفحات الهبوط
                <span className="text-muted-foreground ms-auto">إنشاء صفحات تسويقية مخصصة</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ Footer Tab ═══════ */}
        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">تذييل المتجر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs">تفعيل التذييل</Label>
                <Switch
                  checked={config.footer.enabled}
                  onCheckedChange={(v) => setConfig((p) => ({ ...p, footer: { ...p.footer, enabled: v } }))}
                />
              </div>
              {config.footer.enabled && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">نص حقوق الملكية</Label>
                    <Input
                      value={config.footer.text}
                      onChange={(e) => setConfig((p) => ({ ...p, footer: { ...p.footer, text: e.target.value } }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1"><Phone className="w-3 h-3" /> رقم الهاتف</Label>
                      <Input
                        value={config.footer.phone}
                        onChange={(e) => setConfig((p) => ({ ...p, footer: { ...p.footer, phone: e.target.value } }))}
                        placeholder="0555 123 456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> البريد الإلكتروني</Label>
                      <Input
                        value={config.footer.email}
                        onChange={(e) => setConfig((p) => ({ ...p, footer: { ...p.footer, email: e.target.value } }))}
                        placeholder="info@store.dz"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold">روابط التواصل الاجتماعي</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Facebook className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Input
                          value={config.footer.socialLinks.facebook}
                          onChange={(e) =>
                            setConfig((p) => ({ ...p, footer: { ...p.footer, socialLinks: { ...p.footer.socialLinks, facebook: e.target.value } } }))
                          }
                          placeholder="https://facebook.com/..."
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Input
                          value={config.footer.socialLinks.instagram}
                          onChange={(e) =>
                            setConfig((p) => ({ ...p, footer: { ...p.footer, socialLinks: { ...p.footer.socialLinks, instagram: e.target.value } } }))
                          }
                          placeholder="https://instagram.com/..."
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted-foreground shrink-0 fill-current">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.16 15.2a6.34 6.34 0 0 0 6.33 6.34 6.34 6.34 0 0 0 6.33-6.34V8.87a8.28 8.28 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1-.31Z" />
                        </svg>
                        <Input
                          value={config.footer.socialLinks.tiktok}
                          onChange={(e) =>
                            setConfig((p) => ({ ...p, footer: { ...p.footer, socialLinks: { ...p.footer.socialLinks, tiktok: e.target.value } } }))
                          }
                          placeholder="https://tiktok.com/@..."
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ Theme Tab ═══════ */}
        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">المظهر والألوان</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                يمكنك تعديل ألوان المتجر وتثبيت ثيمات جاهزة من محرر المظهر المتقدم.
              </p>
              <Button className="w-full gap-2" onClick={() => navigate("/admin/theme")}>
                <Palette className="w-4 h-4" /> فتح محرر المظهر والثيمات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>

        {/* Live Preview Panel */}
        {showPreview && (
          <div className="hidden lg:flex flex-col w-1/2 sticky top-0 h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between px-3 py-2 border border-border rounded-t-lg bg-card">
              <span className="text-xs font-semibold text-muted-foreground">معاينة مباشرة</span>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center rounded-md border border-border p-0.5 bg-muted/30">
                  {VIEWPORTS.map((vp) => (
                    <Button
                      key={vp.id}
                      variant={previewViewport === vp.id ? "default" : "ghost"}
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setPreviewViewport(vp.id)}
                      title={vp.label}
                    >
                      <vp.icon className="w-3 h-3" />
                    </Button>
                  ))}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setPreviewKey((k) => k + 1)}
                  title="تحديث المعاينة"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex-1 border border-t-0 border-border rounded-b-lg bg-muted/20 flex items-start justify-center overflow-auto p-2">
              <div
                className="bg-background border border-border rounded-lg shadow-sm overflow-hidden transition-all duration-300 h-full"
                style={{
                  width: VIEWPORTS.find((v) => v.id === previewViewport)!.width,
                  maxWidth: "100%",
                }}
              >
                <iframe
                  key={previewKey}
                  src="/"
                  className="w-full h-full border-0"
                  title="معاينة الصفحة الرئيسية"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">اسم الفئة *</Label>
              <Input
                value={catForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setCatForm((p) => ({ ...p, name, slug: editingCategory ? p.slug : autoSlug(name) }));
                }}
                placeholder="مثال: ملابس نسائية"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">الرابط (slug) *</Label>
              <Input
                value={catForm.slug}
                onChange={(e) => setCatForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="ملابس-نسائية"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">صورة الفئة</Label>
              {catForm.image && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={catForm.image} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCatForm((p) => ({ ...p, image: "" }))}
                    className="absolute top-0.5 end-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    const ext = file.name.split(".").pop();
                    const path = `categories/${Date.now()}.${ext}`;
                    const { error } = await supabase.storage.from("product-images").upload(path, file);
                    if (error) throw error;
                    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
                    setCatForm((p) => ({ ...p, image: urlData.publicUrl }));
                    toast.success("تم رفع الصورة");
                  } catch {
                    toast.error("فشل في رفع الصورة");
                  } finally {
                    setUploading(false);
                    e.target.value = "";
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1.5"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Image className="w-3.5 h-3.5" />}
                {uploading ? "جاري الرفع…" : "رفع صورة"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">الوصف (اختياري)</Label>
              <Textarea
                value={catForm.description}
                onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="وصف مختصر للفئة"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">الترتيب</Label>
              <Input
                type="number"
                value={catForm.position}
                onChange={(e) => setCatForm((p) => ({ ...p, position: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleCatSubmit}
              disabled={createCatMutation.isPending || updateCatMutation.isPending}
            >
              {(createCatMutation.isPending || updateCatMutation.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin me-1" />
              )}
              {editingCategory ? "تحديث الفئة" : "إضافة الفئة"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
