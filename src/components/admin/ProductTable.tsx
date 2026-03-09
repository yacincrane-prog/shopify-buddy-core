import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PreviewFrame } from "@/components/admin/PreviewFrame";
import type { Product } from "@/types/product";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onView?: (product: Product) => void;
  isLoading?: boolean;
}

export function ProductTable({ products, onEdit, onDelete, onView, isLoading }: ProductTableProps) {
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);

  const columns: DataTableColumn<Product>[] = [
    {
      key: "image",
      header: "",
      headerClassName: "w-12",
      className: "w-12",
      render: (p) =>
        p.images?.[0] ? (
          <img src={p.images[0]} alt="" className="w-9 h-9 rounded-md object-cover ring-1 ring-border" />
        ) : (
          <div className="w-9 h-9 rounded-md bg-muted" />
        ),
    },
    {
      key: "title",
      header: "المنتج",
      sortable: true,
      sortValue: (p) => p.title,
      render: (p) => <span className="font-medium text-foreground">{p.title}</span>,
    },
    {
      key: "price",
      header: "السعر",
      sortable: true,
      sortValue: (p) => Number(p.price),
      render: (p) => (
        <span className="font-mono text-sm">{Number(p.price).toLocaleString()} DA</span>
      ),
    },
    {
      key: "stock",
      header: "المخزون",
      sortable: true,
      sortValue: (p) => p.inventory_quantity,
      render: (p) => (
        <span className={`font-mono text-sm ${p.inventory_quantity < 10 ? "text-destructive" : ""}`}>
          {p.inventory_quantity}
        </span>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      sortable: true,
      sortValue: (p) => (p.is_active ? 1 : 0),
      render: (p) => (
        <Badge
          variant={p.is_active ? "default" : "secondary"}
          className={p.is_active ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]" : ""}
        >
          {p.is_active ? "Active" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (p) => (
        <div className="flex justify-end gap-0.5">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewSlug(p.slug)} title="Preview">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          {onView && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(p)}>
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(p)}>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(p.id)}>
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={products}
        columns={columns}
        keyExtractor={(p) => p.id}
        emptyMessage="No products yet. Create your first product to get started."
        pageSize={10}
        isLoading={isLoading}
      />
      <PreviewFrame
        url={previewSlug ? `/product/${previewSlug}` : "/"}
        open={!!previewSlug}
        onOpenChange={(open) => !open && setPreviewSlug(null)}
        title="Product Page Preview"
      />
    </>
  );
}
