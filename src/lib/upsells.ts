import { supabase } from "@/integrations/supabase/client";

export interface UpsellWithProduct {
  id: string;
  source_product_id: string;
  upsell_product_id: string;
  discount_percent: number;
  is_active: boolean;
  product_title: string;
  product_price: number;
  product_image: string | null;
}

export async function fetchUpsellsForProduct(sourceProductId: string): Promise<UpsellWithProduct[]> {
  const { data, error } = await supabase
    .from("upsells")
    .select("*, products!upsells_upsell_product_id_fkey(title, price, images)")
    .eq("source_product_id", sourceProductId)
    .eq("is_active", true)
    .returns<(Record<string, unknown> & { products: { title: string; price: number; images: string[] | null } })[]>();
  if (error) throw error;
  return (data ?? []).map((u) => ({
    id: u.id as string,
    source_product_id: u.source_product_id as string,
    upsell_product_id: u.upsell_product_id as string,
    discount_percent: Number(u.discount_percent),
    is_active: u.is_active as boolean,
    product_title: u.products.title,
    product_price: Number(u.products.price),
    product_image: u.products.images?.[0] ?? null,
  }));
}

export async function fetchAllUpsells() {
  const { data, error } = await supabase
    .from("upsells")
    .select("*, source:products!upsells_source_product_id_fkey(title), target:products!upsells_upsell_product_id_fkey(title)")
    .returns<(Record<string, unknown> & { source: { title: string }; target: { title: string } })[]>();
  if (error) throw error;
  return data ?? [];
}

export async function createUpsell(sourceProductId: string, upsellProductId: string, discountPercent: number) {
  const { error } = await supabase
    .from("upsells")
    .insert({ source_product_id: sourceProductId, upsell_product_id: upsellProductId, discount_percent: discountPercent });
  if (error) throw error;
}

export async function deleteUpsell(id: string) {
  const { error } = await supabase.from("upsells").delete().eq("id", id);
  if (error) throw error;
}
