import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductTable } from "@/components/admin/ProductTable";
import { BundleManager } from "@/components/admin/BundleManager";
import { QuantityDiscountManager } from "@/components/admin/QuantityDiscountManager";
import { UpsellManager } from "@/components/admin/UpsellManager";
import { ExitIntentManager } from "@/components/admin/ExitIntentManager";
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
        toast.success("Product created");
        setView("list");
      },
      onError: () => toast.error("Failed to create product"),
    });
  };

  const handleUpdate = (data: ProductFormData) => {
    if (!editingProduct) return;
    updateMutation.mutate(
      { id: editingProduct.id, data },
      {
        onSuccess: () => {
          toast.success("Product updated");
          setView("list");
          setEditingProduct(null);
        },
        onError: () => toast.error("Failed to update product"),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Product deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete product"),
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
            <h1 className="text-lg font-semibold">Admin</h1>
          </div>
          {view === "list" && (
            <Button onClick={() => setView("create")} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add product
            </Button>
          )}
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        {(view === "create" || view === "edit") ? (
          <Card>
            <CardHeader>
              <CardTitle>{view === "create" ? "New product" : "Edit product"}</CardTitle>
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
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="bundles">Bundles</TabsTrigger>
              <TabsTrigger value="discounts">Qty Discounts</TabsTrigger>
              <TabsTrigger value="upsells">Upsells</TabsTrigger>
              <TabsTrigger value="exit-intent">Exit Intent</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="text-center py-16 text-muted-foreground">Loading…</div>
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
          </Tabs>
        )}
      </main>

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
