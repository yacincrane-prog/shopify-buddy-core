import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CheckoutField {
  id: string;
  type: "text" | "tel" | "email" | "textarea" | "select" | "wilaya" | "commune" | "delivery_type";
  label: string;
  placeholder: string;
  required: boolean;
  visible: boolean;
  position: number;
  isSystem?: boolean; // system fields can be hidden but not deleted
}

export interface CheckoutConfig {
  formTitle: string;
  buttonText: string;
  successTitle: string;
  successMessage: string;
  showDiscountCode: boolean;
  showPriceBreakdown: boolean;
  fields: CheckoutField[];
}

const DEFAULT_FIELDS: CheckoutField[] = [
  { id: "name", type: "text", label: "الاسم الكامل", placeholder: "أدخل اسمك الكامل", required: true, visible: true, position: 0, isSystem: true },
  { id: "phone", type: "tel", label: "رقم الهاتف", placeholder: "0555 123 456", required: true, visible: true, position: 1, isSystem: true },
  { id: "wilaya", type: "wilaya", label: "الولاية", placeholder: "اختر الولاية", required: true, visible: true, position: 2, isSystem: true },
  { id: "commune", type: "commune", label: "البلدية", placeholder: "اختر البلدية", required: true, visible: true, position: 3, isSystem: true },
  { id: "delivery_type", type: "delivery_type", label: "نوع التوصيل", placeholder: "", required: true, visible: true, position: 4, isSystem: true },
];

export const DEFAULT_CONFIG: CheckoutConfig = {
  formTitle: "الدفع عند الاستلام",
  buttonText: "تأكيد الطلب",
  successTitle: "تم تأكيد الطلب!",
  successMessage: "تم تسجيل طلبك بنجاح. سنتواصل معك لتأكيد التوصيل.",
  showDiscountCode: true,
  showPriceBreakdown: true,
  fields: DEFAULT_FIELDS,
};

const CONFIG_KEY = "checkout_config";

async function fetchCheckoutConfig(): Promise<CheckoutConfig> {
  const { data, error } = await supabase
    .from("theme_settings")
    .select("value")
    .eq("key", CONFIG_KEY)
    .maybeSingle();
  if (error) throw error;
  if (!data) return DEFAULT_CONFIG;
  return { ...DEFAULT_CONFIG, ...(data.value as any) };
}

export function useCheckoutConfig() {
  return useQuery({
    queryKey: ["checkout-config"],
    queryFn: fetchCheckoutConfig,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveCheckoutConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: CheckoutConfig) => {
      const { data: existing } = await supabase
        .from("theme_settings")
        .select("id")
        .eq("key", CONFIG_KEY)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("theme_settings")
          .update({ value: config as any, updated_at: new Date().toISOString() })
          .eq("key", CONFIG_KEY);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("theme_settings")
          .insert({ key: CONFIG_KEY, value: config as any });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checkout-config"] });
    },
  });
}
