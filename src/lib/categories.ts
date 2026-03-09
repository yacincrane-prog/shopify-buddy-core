import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  position: number;
  is_active: boolean;
  created_at: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await (supabase as any)
    .from("categories")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchActiveCategories(): Promise<Category[]> {
  const { data, error } = await (supabase as any)
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(cat: Omit<Category, "id" | "created_at">): Promise<void> {
  const { error } = await (supabase as any).from("categories").insert(cat);
  if (error) throw error;
}

export async function updateCategory(id: string, cat: Partial<Category>): Promise<void> {
  const { error } = await (supabase as any)
    .from("categories")
    .update({ ...cat, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await (supabase as any).from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function updateProductCategory(productId: string, categoryId: string | null): Promise<void> {
  const { error } = await (supabase as any)
    .from("products")
    .update({ category_id: categoryId })
    .eq("id", productId);
  if (error) throw error;
}
