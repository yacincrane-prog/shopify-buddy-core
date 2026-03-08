import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ShippingRate {
  id: string;
  wilaya_code: string;
  wilaya_name: string;
  home_delivery_price: number;
  stop_desk_price: number;
  is_active: boolean;
  stop_desk_enabled: boolean;
}

async function fetchShippingRates() {
  const { data, error } = await supabase
    .from("shipping_rates")
    .select("*")
    .order("wilaya_code", { ascending: true });
  if (error) throw error;
  return data as ShippingRate[];
}

async function fetchActiveShippingRates() {
  const { data, error } = await supabase
    .from("shipping_rates")
    .select("*")
    .eq("is_active", true)
    .order("wilaya_code", { ascending: true });
  if (error) throw error;
  return data as ShippingRate[];
}

export function useShippingRates() {
  return useQuery({
    queryKey: ["shipping-rates"],
    queryFn: fetchShippingRates,
    staleTime: 5 * 60 * 1000,
  });
}

export function useActiveShippingRates() {
  return useQuery({
    queryKey: ["shipping-rates-active"],
    queryFn: fetchActiveShippingRates,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateShippingRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rate: Partial<ShippingRate> & { id: string }) => {
      const { error } = await supabase
        .from("shipping_rates")
        .update({
          home_delivery_price: rate.home_delivery_price,
          stop_desk_price: rate.stop_desk_price,
          is_active: rate.is_active,
          stop_desk_enabled: rate.stop_desk_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", rate.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shipping-rates"] });
      qc.invalidateQueries({ queryKey: ["shipping-rates-active"] });
    },
  });
}

export function useBulkUpdateShippingRates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rates: Array<Partial<ShippingRate> & { id: string }>) => {
      for (const rate of rates) {
        const { error } = await supabase
          .from("shipping_rates")
          .update({
            home_delivery_price: rate.home_delivery_price,
            stop_desk_price: rate.stop_desk_price,
            is_active: rate.is_active,
            stop_desk_enabled: rate.stop_desk_enabled,
            updated_at: new Date().toISOString(),
          })
          .eq("id", rate.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shipping-rates"] });
      qc.invalidateQueries({ queryKey: ["shipping-rates-active"] });
    },
  });
}
