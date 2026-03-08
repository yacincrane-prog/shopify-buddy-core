import { supabase } from "@/integrations/supabase/client";

export interface ExitIntentPopup {
  id: string;
  title: string;
  subtitle: string;
  discount_percent: number | null;
  discount_code: string | null;
  cta_text: string;
  is_active: boolean;
}

export async function fetchActiveExitIntent(): Promise<ExitIntentPopup | null> {
  const { data } = await supabase
    .from("exit_intent_popups")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .single();
  return data as ExitIntentPopup | null;
}

export async function fetchAllExitIntents(): Promise<ExitIntentPopup[]> {
  const { data } = await supabase
    .from("exit_intent_popups")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as ExitIntentPopup[]) ?? [];
}

export async function upsertExitIntent(popup: Partial<ExitIntentPopup> & { title: string; subtitle: string; cta_text: string }) {
  // Deactivate all others first if activating
  if (popup.is_active) {
    await supabase.from("exit_intent_popups").update({ is_active: false }).neq("id", popup.id ?? "");
  }
  if (popup.id) {
    const { data } = await supabase.from("exit_intent_popups").update(popup).eq("id", popup.id).select().single();
    return data;
  }
  const { data } = await supabase.from("exit_intent_popups").insert(popup).select().single();
  return data;
}

export async function deleteExitIntent(id: string) {
  await supabase.from("exit_intent_popups").delete().eq("id", id);
}
