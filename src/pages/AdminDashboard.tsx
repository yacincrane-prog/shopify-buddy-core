import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductTable } from "@/components/admin/ProductTable";
import { BundleManager } from "@/components/admin/BundleManager";
import { QuantityDiscountManager } from "@/components/admin/QuantityDiscountManager";
import { UpsellManager } from "@/components/admin/UpsellManager";
import { ExitIntentManager } from "@/components/admin/ExitIntentManager";
import { SectionBuilder } from "@/components/admin/SectionBuilder";
import { QuantityOfferManager } from "@/components/admin/QuantityOfferManager";
import { PostOrderUpsellManager } from "@/components/admin/PostOrderUpsellManager";
import { AbandonedLeadsManager } from "@/components/admin/AbandonedLeadsManager";
import { LandingPageBuilder } from "@/components/admin/LandingPageBuilder";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { Plus, Package, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product, ProductFormData } from "@/types/product";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type View = "list" | "create" | "edit";

export default function AdminDashboard() {
  const [view, setView] = useState<View>("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: products, isLoading } = useProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const handleCreate = (data: ProductFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("تم إنشاء المنتج");
        setView("list");
      },
      onError: () => toast.error("فشل في إنشاء المنتج"),
    });
  };

  const handleUpdate = (data: ProductFormData) => {
    if (!editingProduct) return;
    updateMutation.mutate(
      { id: editingProduct.id, data },
      {
        onSuccess: () => {
          toast.success("تم تحديث المنتج");
          setView("list");
          setEditingProduct(null);
        },
        onError: () => toast.error("فشل في تحديث المنتج"),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("تم حذف المنتج");
        setDeleteId(null);
      },
      onError: () => toast.error("فشل في حذف المنتج"),
    });
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setView("edit");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Package className="w-5 h-5 text-accent" />
            <h1 className="text-lg font-semibold">الإدارة</h1>
          </div>
          {view === "list" && (
            <Button onClick={() => setView("create")} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              إضافة منتج
            </Button>
          )}
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        {(view === "create" || view === "edit") ? (
          <Card>
            <CardHeader>
              <CardTitle>{view === "create" ? "منتج جديد" : "تعديل المنتج"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductForm
                product={view === "edit" ? editingProduct! : undefined}
                onSubmit={view === "create" ? handleCreate : handleUpdate}
                onCancel={() => { setView("list"); setEditingProduct(null); }}
                isLoading={view === "create" ? createMutation.isPending : updateMutation.isPending}
              />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="products">
            <TabsList className="mb-6">
              <TabsTrigger value="products">المنتجات</TabsTrigger>
              <TabsTrigger value="bundles">الحزم</TabsTrigger>
              <TabsTrigger value="discounts">خصومات الكمية</TabsTrigger>
              <TabsTrigger value="upsells">العروض الإضافية</TabsTrigger>
              <TabsTrigger value="exit-intent">منبثق الخروج</TabsTrigger>
              <TabsTrigger value="page-builder">منشئ الصفحات</TabsTrigger>
              <TabsTrigger value="qty-offers">عروض الكمية</TabsTrigger>
              <TabsTrigger value="post-upsell">عروض ما بعد الطلب</TabsTrigger>
              <TabsTrigger value="abandoned">العملاء المهجورون</TabsTrigger>
              <TabsTrigger value="landing-pages">صفحات الهبوط</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="text-center py-16 text-muted-foreground">جاري التحميل…</div>
                  ) : (
                    <ProductTable products={products ?? []} onEdit={startEdit} onDelete={setDeleteId} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bundles">
              <BundleManager />
            </TabsContent>

            <TabsContent value="discounts">
              <QuantityDiscountManager />
            </TabsContent>

            <TabsContent value="upsells">
              <UpsellManager />
            </TabsContent>

            <TabsContent value="exit-intent">
              <ExitIntentManager />
            </TabsContent>

            <TabsContent value="page-builder">
              <SectionBuilder />
            </TabsContent>

            <TabsContent value="qty-offers">
              <QuantityOfferManager />
            </TabsContent>

            <TabsContent value="post-upsell">
              <PostOrderUpsellManager />
            </TabsContent>

            <TabsContent value="abandoned">
              <AbandonedLeadsManager />
            </TabsContent>

            <TabsContent value="landing-pages">
              <LandingPageBuilder />
            </TabsContent>
          </Tabs>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المنتج؟</AlertDialogTitle>
            <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
