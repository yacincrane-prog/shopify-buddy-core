import { supabase } from "@/integrations/supabase/client";

export interface QuantityDiscount {
  id: string;
  product_id: string;
  min_quantity: number;
  discount_percent: number;
}

export async function fetchDiscountsForProduct(productId: string): Promise<QuantityDiscount[]> {
  const { data, error } = await supabase
    .from("quantity_discounts")
    .select("*")
    .eq("product_id", productId)
    .order("min_quantity", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function setDiscountsForProduct(productId: string, tiers: { min_quantity: number; discount_percent: number }[]) {
  // Delete existing
  const { error: delErr } = await supabase.from("quantity_discounts").delete().eq("product_id", productId);
  if (delErr) throw delErr;

  if (tiers.length === 0) return;

  const rows = tiers.map((t) => ({ product_id: productId, ...t }));
  const { error } = await supabase.from("quantity_discounts").insert(rows);
  if (error) throw error;
}

export function getDiscountedPrice(basePrice: number, quantity: number, tiers: QuantityDiscount[]): number {
  const sorted = [...tiers].sort((a, b) => b.min_quantity - a.min_quantity);
  const tier = sorted.find((t) => quantity >= t.min_quantity);
  if (!tier) return basePrice;
  return basePrice * (1 - tier.discount_percent / 100);
}
