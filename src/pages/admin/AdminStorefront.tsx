import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function AdminStorefront() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [config, setConfig] = useState<StorefrontConfig>(DEFAULT_STOREFRONT);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name: "", slug: "", image: "", description: "", position: 0 });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader
          title="تخصيص المتجر"
          description="تحكم في مظهر متجرك: الصفحة الرئيسية، الفئات، صفحة المنتج، والمزيد"
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4 me-1" /> معاينة المتجر
            </a>
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={!hasChanges || saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : <Save className="w-4 h-4 me-1" />}
            حفظ التغييرات
          </Button>
        </div>
      </div>

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
                <Label className="text-xs">رابط الشعار (اختياري)</Label>
                <Input
                  value={config.logo}
                  onChange={(e) => setConfig((p) => ({ ...p, logo: e.target.value }))}
                  placeholder="https://example.com/logo.png"
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
                    <Input
                      value={config.hero.backgroundImage}
                      onChange={(e) => setConfig((p) => ({ ...p, hero: { ...p.hero, backgroundImage: e.target.value } }))}
                      placeholder="https://example.com/hero.jpg"
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
            <div className="space-y-2">
              {categories.map((cat) => (
                <Card key={cat.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
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
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => toggleCatMutation.mutate({ id: cat.id, is_active: !cat.is_active })}
                      >
                        {cat.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditCategory(cat)}>
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
                            <AlertDialogAction onClick={() => deleteCatMutation.mutate(cat.id)} className="bg-destructive text-destructive-foreground">
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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

      {/* Category Dialog */}
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
              <Label className="text-xs">صورة الفئة (رابط)</Label>
              <Input
                value={catForm.image}
                onChange={(e) => setCatForm((p) => ({ ...p, image: e.target.value }))}
                placeholder="https://..."
              />
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
