import { supabase } from "@/integrations/supabase/client";

export interface ExitIntentConfig {
  triggerType: "mouse_leave" | "scroll" | "time" | "mouse_leave_or_time";
  delaySeconds: number;
  scrollPercent: number;
  showOnMobile: boolean;
  mobileTriggerBack: boolean;
  mobileTriggerScroll: boolean;
  mobileTriggerTabSwitch: boolean;
  bgColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  overlayOpacity: number;
  animation: "fade" | "slide_up" | "scale" | "bounce";
  iconType: "gift" | "percent" | "tag" | "heart" | "star" | "none";
  borderRadius: "sm" | "md" | "lg" | "xl";
  showTimer: boolean;
  timerMinutes: number;
}

export const DEFAULT_EXIT_CONFIG: ExitIntentConfig = {
  triggerType: "mouse_leave",
  delaySeconds: 0,
  scrollPercent: 50,
  showOnMobile: false,
  mobileTriggerBack: true,
  mobileTriggerScroll: true,
  mobileTriggerTabSwitch: true,
  bgColor: "",
  textColor: "",
  buttonColor: "",
  buttonTextColor: "",
  overlayOpacity: 50,
  animation: "scale",
  iconType: "gift",
  borderRadius: "lg",
  showTimer: false,
  timerMinutes: 5,
};

export interface ExitIntentPopup {
  id: string;
  title: string;
  subtitle: string;
  discount_percent: number | null;
  discount_code: string | null;
  cta_text: string;
  is_active: boolean;
  config: ExitIntentConfig;
}

export async function fetchActiveExitIntent(): Promise<ExitIntentPopup | null> {
  const { data } = await supabase
    .from("exit_intent_popups")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .single();
  if (!data) return null;
  return {
    ...data,
    config: { ...DEFAULT_EXIT_CONFIG, ...((data as any).config || {}) },
  } as ExitIntentPopup;
}

export async function fetchAllExitIntents(): Promise<ExitIntentPopup[]> {
  const { data } = await supabase
    .from("exit_intent_popups")
    .select("*")
    .order("created_at", { ascending: false });
  return (
    (data ?? []).map((d: any) => ({
      ...d,
      config: { ...DEFAULT_EXIT_CONFIG, ...(d.config || {}) },
    })) as ExitIntentPopup[]
  );
}

export async function upsertExitIntent(
  popup: Partial<ExitIntentPopup> & { title: string; subtitle: string; cta_text: string }
) {
  if (popup.is_active) {
    await supabase.from("exit_intent_popups").update({ is_active: false }).neq("id", popup.id ?? "");
  }
  if (popup.id) {
    const { data } = await supabase.from("exit_intent_popups").update(popup as any).eq("id", popup.id).select().single();
    return data;
  }
  const { data } = await supabase.from("exit_intent_popups").insert(popup as any).select().single();
  return data;
}

export async function deleteExitIntent(id: string) {
  await supabase.from("exit_intent_popups").delete().eq("id", id);
}
