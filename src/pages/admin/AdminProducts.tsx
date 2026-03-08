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

export default function AdminProducts() {
  const [view, setView] = useState<View>("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

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
      onSuccess: () => { toast.success("Product created"); setView("list"); },
      onError: () => toast.error("Failed to create product"),
    });
  };

  const handleUpdate = (data: ProductFormData) => {
    if (!editingProduct) return;
    updateMutation.mutate(
      { id: editingProduct.id, data },
      {
        onSuccess: () => { toast.success("Product updated"); setView("list"); setEditingProduct(null); },
        onError: () => toast.error("Failed to update product"),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => { toast.success("Product deleted"); setDeleteId(null); },
      onError: () => toast.error("Failed to delete product"),
    });
  };

  const startEdit = (product: Product) => { setEditingProduct(product); setView("edit"); };

  if (view === "create" || view === "edit") {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => { setView("list"); setEditingProduct(null); }}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to products
        </Button>
        <Card>
          <CardHeader><CardTitle>{view === "create" ? "New product" : "Edit product"}</CardTitle></CardHeader>
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
        title="Products"
        description="Manage your store product catalog"
        count={products?.length}
        action={{
          label: "Add product",
          icon: <Plus className="w-4 h-4 mr-1" />,
          onClick: () => setView("create"),
        }}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search products…",
        }}
        filters={[
          {
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All Status", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
        ]}
        sort={{
          value: sortBy,
          onChange: setSortBy,
          options: [
            { label: "Newest First", value: "newest" },
            { label: "Oldest First", value: "oldest" },
            { label: "Price: High → Low", value: "price-high" },
            { label: "Price: Low → High", value: "price-low" },
            { label: "Name A-Z", value: "name" },
          ],
        }}
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Loading…</div>
          ) : !filtered.length ? (
            <div className="text-center py-16 text-muted-foreground">
              {search || statusFilter !== "all" ? "No products match your filters" : "No products yet"}
            </div>
          ) : (
            <ProductTable products={filtered} onEdit={startEdit} onDelete={setDeleteId} />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
