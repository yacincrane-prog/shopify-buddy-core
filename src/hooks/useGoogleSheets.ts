import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GoogleSheetsConfig {
  id: string;
  webhook_url: string | null;
  sheet_url: string | null;
  sheet_name: string | null;
  is_active: boolean | null;
  column_mapping: string[] | null;
  total_exported: number | null;
  last_export_at: string | null;
  created_at: string;
  updated_at: string;
}

const DEFAULT_COLUMNS = [
  "date", "product_name", "quantity", "customer_name", "phone",
  "wilaya", "commune", "delivery_type", "shipping_price", "total_price", "status",
];

export function useGoogleSheetsConfig() {
  return useQuery({
    queryKey: ["google-sheets-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("google_sheets_config")
        .select("*")
        .limit(1);
      if (error) throw error;
      if (data?.length) return data[0] as GoogleSheetsConfig;
      // Create default config
      const { data: created, error: createErr } = await supabase
        .from("google_sheets_config")
        .insert({ column_mapping: DEFAULT_COLUMNS })
        .select()
        .single();
      if (createErr) throw createErr;
      return created as GoogleSheetsConfig;
    },
  });
}

export function useSaveGoogleSheetsConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<GoogleSheetsConfig> & { id: string }) => {
      const { id, ...rest } = updates;
      const { error } = await supabase
        .from("google_sheets_config")
        .update(rest)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["google-sheets-config"] });
      toast.success("تم حفظ الإعدادات");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useExportOrders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderIds?: string[]) => {
      const { data, error } = await supabase.functions.invoke("export-to-sheets", {
        body: { orderIds },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["google-sheets-config"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success(`تم تصدير ${data.exported ?? 0} طلب بنجاح`);
    },
    onError: (err: Error) => toast.error("فشل التصدير: " + err.message),
  });
}

export function useTestConnection() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("export-to-sheets", {
        body: { testMode: true },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => toast.success("تم إرسال صف تجريبي بنجاح"),
    onError: (err: Error) => toast.error("فشل الاختبار: " + err.message),
  });
}
