import { supabase } from "@/integrations/supabase/client";

export type DiscountType = "percentage" | "fixed";

export interface DiscountCode {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchDiscountCodes(): Promise<DiscountCode[]> {
  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DiscountCode[];
}

export async function createDiscountCode(input: {
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number | null;
  is_active?: boolean;
  expires_at?: string | null;
}): Promise<DiscountCode> {
  const { data, error } = await supabase
    .from("discount_codes")
    .insert({ ...input, code: input.code.toUpperCase().trim() })
    .select()
    .single();
  if (error) throw error;
  return data as DiscountCode;
}

export async function updateDiscountCode(
  id: string,
  updates: Partial<{
    code: string;
    discount_type: DiscountType;
    discount_value: number;
    min_order_amount: number;
    max_uses: number | null;
    is_active: boolean;
    expires_at: string | null;
  }>
): Promise<DiscountCode> {
  const payload = updates.code
    ? { ...updates, code: updates.code.toUpperCase().trim() }
    : updates;
  const { data, error } = await supabase
    .from("discount_codes")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as DiscountCode;
}

export async function deleteDiscountCode(id: string) {
  const { error } = await supabase.from("discount_codes").delete().eq("id", id);
  if (error) throw error;
}

export interface ValidateResult {
  valid: boolean;
  discount: DiscountCode | null;
  error?: string;
}

export async function validateDiscountCode(
  code: string,
  orderSubtotal: number
): Promise<ValidateResult> {
  const trimmed = code.toUpperCase().trim();
  if (!trimmed) return { valid: false, discount: null, error: "Enter a discount code" };

  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", trimmed)
    .eq("is_active", true)
    .maybeSingle();

  if (error) return { valid: false, discount: null, error: "Error validating code" };
  if (!data) return { valid: false, discount: null, error: "Invalid discount code" };

  const dc = data as DiscountCode;

  if (dc.expires_at && new Date(dc.expires_at) < new Date()) {
    return { valid: false, discount: null, error: "This code has expired" };
  }

  if (dc.max_uses !== null && dc.current_uses >= dc.max_uses) {
    return { valid: false, discount: null, error: "This code has reached its usage limit" };
  }

  if (orderSubtotal < dc.min_order_amount) {
    return {
      valid: false,
      discount: null,
      error: `Minimum order of ${dc.min_order_amount.toLocaleString()} DA required`,
    };
  }

  return { valid: true, discount: dc };
}

export function calculateDiscount(dc: DiscountCode, subtotal: number): number {
  if (dc.discount_type === "percentage") {
    return Math.round(subtotal * (dc.discount_value / 100));
  }
  return Math.min(dc.discount_value, subtotal);
}

export async function incrementDiscountUsage(id: string) {
  const { error } = await supabase.rpc("increment_discount_usage" as any, { p_id: id });
  // Fallback: if RPC doesn't exist, do manual update
  if (error) {
    const { data } = await supabase
      .from("discount_codes")
      .select("current_uses")
      .eq("id", id)
      .single();
    if (data) {
      await supabase
        .from("discount_codes")
        .update({ current_uses: (data as any).current_uses + 1 })
        .eq("id", id);
    }
  }
}
