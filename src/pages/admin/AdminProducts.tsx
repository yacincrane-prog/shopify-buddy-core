import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductTable } from "@/components/admin/ProductTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductFormData } from "@/types/product";
import { useLanguage } from "@/hooks/useLanguage";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type View = "list" | "create" | "edit";

export default function AdminProducts() {
  const [view, setView] = useState<View>("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const { t } = useLanguage();

  const { data: products, isLoading } = useProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (statusFilter === "active") list = list.filter((p) => p.is_active);
    if (statusFilter === "inactive") list = list.filter((p) => !p.is_active);
    if (sortBy === "newest") list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (sortBy === "oldest") list = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
    if (sortBy === "price-high") list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    if (sortBy === "price-low") list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === "name") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [products, search, statusFilter, sortBy]);

  const handleCreate = (data: ProductFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => { toast.success(t("products.created")); setView("list"); },
      onError: () => toast.error(t("products.createFail")),
    });
  };

  const handleUpdate = (data: ProductFormData) => {
    if (!editingProduct) return;
    updateMutation.mutate({ id: editingProduct.id, data }, {
      onSuccess: () => { toast.success(t("products.updated")); setView("list"); setEditingProduct(null); },
      onError: () => toast.error(t("products.updateFail")),
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => { toast.success(t("products.deleted")); setDeleteId(null); },
      onError: () => toast.error(t("products.deleteFail")),
    });
  };

  const startEdit = (product: Product) => { setEditingProduct(product); setView("edit"); };

  if (view === "create" || view === "edit") {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => { setView("list"); setEditingProduct(null); }}>
          <ArrowLeft className="w-4 h-4 me-1" /> {t("products.backToProducts")}
        </Button>
        <Card>
          <CardHeader><CardTitle>{view === "create" ? t("products.new") : t("products.editProduct")}</CardTitle></CardHeader>
          <CardContent>
            <ProductForm
              product={view === "edit" ? editingProduct! : undefined}
              onSubmit={view === "create" ? handleCreate : handleUpdate}
              onCancel={() => { setView("list"); setEditingProduct(null); }}
              isLoading={view === "create" ? createMutation.isPending : updateMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("products.title")}
        description={t("products.description")}
        count={products?.length}
        action={{
          label: t("products.add"),
          icon: <Plus className="w-4 h-4 me-1" />,
          onClick: () => setView("create"),
        }}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: t("products.searchPlaceholder"),
        }}
        filters={[
          {
            label: t("common.status"),
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: t("common.allStatuses"), value: "all" },
              { label: t("common.active"), value: "active" },
              { label: t("common.inactive"), value: "inactive" },
            ],
          },
        ]}
        sort={{
          value: sortBy,
          onChange: setSortBy,
          options: [
            { label: t("products.newest"), value: "newest" },
            { label: t("products.oldest"), value: "oldest" },
            { label: t("products.priceHigh"), value: "price-high" },
            { label: t("products.priceLow"), value: "price-low" },
            { label: t("products.nameAZ"), value: "name" },
          ],
        }}
      />

      <ProductTable
        products={filtered}
        onEdit={startEdit}
        onDelete={setDeleteId}
        isLoading={isLoading}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("products.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("products.deleteWarning")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
