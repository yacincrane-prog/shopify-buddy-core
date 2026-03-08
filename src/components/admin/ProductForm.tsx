import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, Loader2, FileText, DollarSign, Image, Settings, Eye } from "lucide-react";
import { uploadProductImage } from "@/lib/products";
import type { Product, ProductFormData } from "@/types/product";
import { PreviewFrame } from "@/components/admin/PreviewFrame";
import { toast } from "sonner";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function FormSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="space-y-4 pl-0">{children}</div>
    </div>
  );
}

export function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compare_at_price?.toString() ?? "");
  const [inventory, setInventory] = useState(product?.inventory_quantity?.toString() ?? "0");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadProductImage(file);
        urls.push(url);
      }
      setImages((prev) => [...prev, ...urls]);
      toast.success("Images uploaded");
    } catch {
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
      inventory_quantity: parseInt(inventory) || 0,
      is_active: isActive,
      images,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-6">
          <TabsTrigger value="basic" className="gap-1.5 text-xs">
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Basic Info</span>
            <span className="sm:hidden">Info</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-1.5 text-xs">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pricing</span>
            <span className="sm:hidden">Price</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-1.5 text-xs">
            <Image className="w-3.5 h-3.5" />
            Media
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5 text-xs">
            <Settings className="w-3.5 h-3.5" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6 mt-0">
          <FormSection title="Product Details" description="Name and description for your product">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write a compelling product description…" rows={5} />
            </div>
          </FormSection>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6 mt-0">
          <FormSection title="Pricing" description="Set pricing and compare at price for sale display">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price (DA) <span className="text-destructive">*</span></Label>
                <Input id="price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comparePrice">Compare at Price (DA)</Label>
                <Input id="comparePrice" type="number" step="0.01" min="0" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="0.00" />
                <p className="text-xs text-muted-foreground">Original price shown with strikethrough</p>
              </div>
            </div>
            {price && compareAtPrice && Number(compareAtPrice) > Number(price) && (
              <div className="rounded-lg bg-accent/10 border border-accent/20 px-3 py-2">
                <p className="text-xs text-accent font-medium">
                  💰 Discount: {Math.round((1 - Number(price) / Number(compareAtPrice)) * 100)}% off
                </p>
              </div>
            )}
          </FormSection>

          <FormSection title="Inventory" description="Track stock levels">
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="inventory">Quantity in Stock</Label>
              <Input id="inventory" type="number" min="0" value={inventory} onChange={(e) => setInventory(e.target.value)} />
              {Number(inventory) < 10 && Number(inventory) > 0 && (
                <p className="text-xs text-destructive">⚠️ Low stock warning</p>
              )}
            </div>
          </FormSection>
        </TabsContent>

        <TabsContent value="media" className="space-y-6 mt-0">
          <FormSection title="Product Images" description="Upload high-quality images. First image is the main photo.">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {images.map((url, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted/30">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-foreground/80 text-background font-medium">
                      Main
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-accent hover:text-accent transition-colors gap-1"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span className="text-[10px]">Upload</span>
                  </>
                )}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </FormSection>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-0">
          <FormSection title="Visibility" description="Control whether this product is visible to customers">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
              <div>
                <Label htmlFor="active" className="font-medium cursor-pointer">Product is active</Label>
                <p className="text-xs text-muted-foreground">Active products appear on your storefront</p>
              </div>
            </div>
          </FormSection>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-6 mt-6 border-t border-border">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {product ? "Update product" : "Create product"}
        </Button>
        {product?.slug && (
          <PreviewProductButton slug={product.slug} />
        )}
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
