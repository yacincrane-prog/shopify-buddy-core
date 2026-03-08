import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductTable } from "@/components/admin/ProductTable";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { Plus } from "lucide-react";
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

  const { data: products, isLoading } = useProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your product catalog</p>
        </div>
        {view === "list" && (
          <Button onClick={() => setView("create")} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add product
          </Button>
        )}
      </div>

      {view === "create" || view === "edit" ? (
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
      ) : (
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-16 text-muted-foreground">Loading…</div>
            ) : (
              <ProductTable products={products ?? []} onEdit={startEdit} onDelete={setDeleteId} />
            )}
          </CardContent>
        </Card>
      )}

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
