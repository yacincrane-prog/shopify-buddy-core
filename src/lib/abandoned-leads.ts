import { supabase } from "@/integrations/supabase/client";

export async function captureAbandonedLead(data: {
  product_id: string;
  product_title: string;
  customer_name: string;
  customer_phone: string;
  wilaya: string;
  commune: string;
}) {
  // Use the dedup function — silently fails if duplicate within 24h
  const { error } = await supabase.rpc("capture_abandoned_lead", {
    p_product_id: data.product_id,
    p_product_title: data.product_title,
    p_customer_name: data.customer_name,
    p_customer_phone: data.customer_phone,
    p_wilaya: data.wilaya,
    p_commune: data.commune,
  });
  // Silent — never throw, never disturb user
  if (error) console.warn("Abandoned lead capture failed silently:", error.message);
}

export async function fetchAbandonedLeads() {
  const { data } = await supabase
    .from("abandoned_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return data ?? [];
}

export async function deleteAbandonedLead(id: string) {
  await supabase.from("abandoned_leads").delete().eq("id", id);
}
