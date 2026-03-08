import { supabase } from "@/integrations/supabase/client";

export interface PostOrderUpsellConfig {
  id: string;
  source_product_id: string;
  upsell_product_id: string;
  discount_percent: number;
  headline: string;
  accept_text: string;
  decline_text: string;
  is_active: boolean;
}

export interface PostOrderUpsellWithProduct extends PostOrderUpsellConfig {
  product_title: string;
  product_price: number;
  product_image: string | null;
}

export async function fetchPostOrderUpsell(sourceProductId: string): Promise<PostOrderUpsellWithProduct | null> {
  const { data: config } = await supabase
    .from("post_order_upsells")
    .select("*")
    .eq("source_product_id", sourceProductId)
    .eq("is_active", true)
    .single();

  if (!config) return null;

  const { data: product } = await supabase
    .from("products")
    .select("title, price, images")
    .eq("id", (config as any).upsell_product_id)
    .single();

  if (!product) return null;

  const c = config as any;
  return {
    id: c.id,
    source_product_id: c.source_product_id,
    upsell_product_id: c.upsell_product_id,
    discount_percent: Number(c.discount_percent),
    headline: c.headline,
    accept_text: c.accept_text,
    decline_text: c.decline_text,
    is_active: c.is_active,
    product_title: product.title,
    product_price: Number(product.price),
    product_image: (product.images as string[] | null)?.[0] ?? null,
  };
}

export async function fetchAllPostOrderUpsells(): Promise<any[]> {
  const { data } = await supabase
    .from("post_order_upsells")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function upsertPostOrderUpsell(config: Partial<PostOrderUpsellConfig> & {
  source_product_id: string;
  upsell_product_id: string;
}) {
  if (config.id) {
    const { data } = await supabase
      .from("post_order_upsells")
      .update(config)
      .eq("id", config.id)
      .select()
      .single();
    return data;
  }
  const { data } = await supabase
    .from("post_order_upsells")
    .insert(config)
    .select()
    .single();
  return data;
}

export async function deletePostOrderUpsell(id: string) {
  await supabase.from("post_order_upsells").delete().eq("id", id);
}

export async function trackUpsellResponse(data: {
  order_id: string;
  upsell_product_id: string;
  upsell_product_title: string;
  upsell_price: number;
  discount_percent: number;
  accepted: boolean;
}) {
  await supabase.from("order_upsell_tracking").insert(data);
}

export async function updateOrderWithUpsell(orderId: string, upsellTitle: string, upsellPrice: number) {
  // Get current order
  const { data: order } = await supabase
    .from("orders")
    .select("product_title, total_price")
    .eq("id", orderId)
    .single();

  if (!order) return;

  await supabase
    .from("orders")
    .update({
      product_title: order.product_title + ` + ${upsellTitle} (post-upsell)`,
      total_price: Number(order.total_price) + upsellPrice,
    })
    .eq("id", orderId);
}
