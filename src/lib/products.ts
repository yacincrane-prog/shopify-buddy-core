import { supabase } from "@/integrations/supabase/client";
import type { ProductFormData } from "@/types/product";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createProduct(formData: ProductFormData) {
  const slug = generateSlug(formData.title);
  const { data, error } = await supabase
    .from("products")
    .insert({ ...formData, slug })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, formData: Partial<ProductFormData>) {
  const updates: Record<string, unknown> = { ...formData };
  if (formData.title) {
    updates.slug = generateSlug(formData.title);
  }
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);
  return data.publicUrl;
}
