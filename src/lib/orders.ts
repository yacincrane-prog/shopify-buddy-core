import { supabase } from "@/integrations/supabase/client";

export interface OrderData {
  product_id: string;
  product_title: string;
  product_price: number;
  quantity: number;
  customer_name: string;
  customer_phone: string;
  wilaya: string;
  commune: string;
  delivery_type: "home" | "stop_desk";
  shipping_price: number;
  total_price: number;
}

export async function createOrder(data: OrderData) {
  const { data: order, error } = await supabase
    .from("orders")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return order;
}

export async function fetchOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
