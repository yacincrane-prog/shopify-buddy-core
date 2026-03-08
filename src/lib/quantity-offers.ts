import { supabase } from "@/integrations/supabase/client";

export interface QuantityOffer {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  label: string;
  is_best_offer: boolean;
  free_delivery: boolean;
  position: number;
}

export async function fetchOffersForProduct(productId: string): Promise<QuantityOffer[]> {
  const { data } = await supabase
    .from("quantity_offers")
    .select("*")
    .eq("product_id", productId)
    .order("position", { ascending: true });
  return (data as QuantityOffer[]) ?? [];
}

export async function createOffer(offer: Omit<QuantityOffer, "id" | "position"> & { position?: number }) {
  const { data } = await supabase
    .from("quantity_offers")
    .insert(offer)
    .select()
    .single();
  return data;
}

export async function updateOffer(id: string, updates: Partial<QuantityOffer>) {
  const { data } = await supabase
    .from("quantity_offers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return data;
}

export async function deleteOffer(id: string) {
  await supabase.from("quantity_offers").delete().eq("id", id);
}
