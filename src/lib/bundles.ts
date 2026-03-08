import { supabase } from "@/integrations/supabase/client";

export interface BundleWithItems {
  id: string;
  title: string;
  description: string | null;
  bundle_price: number;
  is_active: boolean;
  created_at: string;
  items: { product_id: string; product_title: string; product_price: number; product_image: string | null }[];
}

export async function fetchBundles(): Promise<BundleWithItems[]> {
  const { data: bundles, error } = await supabase
    .from("bundles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const { data: items, error: itemsError } = await supabase
    .from("bundle_items")
    .select("bundle_id, product_id, products(title, price, images)")
    .returns<{ bundle_id: string; product_id: string; products: { title: string; price: number; images: string[] | null } }[]>();
  if (itemsError) throw itemsError;

  return (bundles ?? []).map((b) => ({
    ...b,
    items: (items ?? [])
      .filter((i) => i.bundle_id === b.id)
      .map((i) => ({
        product_id: i.product_id,
        product_title: i.products.title,
        product_price: Number(i.products.price),
        product_image: i.products.images?.[0] ?? null,
      })),
  }));
}

export async function fetchBundlesForProduct(productId: string): Promise<BundleWithItems[]> {
  const { data: bundleIds, error: biError } = await supabase
    .from("bundle_items")
    .select("bundle_id")
    .eq("product_id", productId);
  if (biError) throw biError;
  if (!bundleIds?.length) return [];

  const ids = bundleIds.map((b) => b.bundle_id);
  const all = await fetchBundles();
  return all.filter((b) => ids.includes(b.id) && b.is_active);
}

export async function createBundle(title: string, description: string, bundlePrice: number, productIds: string[]) {
  const { data: bundle, error } = await supabase
    .from("bundles")
    .insert({ title, description, bundle_price: bundlePrice })
    .select()
    .single();
  if (error) throw error;

  const items = productIds.map((pid) => ({ bundle_id: bundle.id, product_id: pid }));
  const { error: itemsError } = await supabase.from("bundle_items").insert(items);
  if (itemsError) throw itemsError;
  return bundle;
}

export async function deleteBundle(id: string) {
  const { error } = await supabase.from("bundles").delete().eq("id", id);
  if (error) throw error;
}
