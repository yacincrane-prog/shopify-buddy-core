import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  inventory_quantity: number;
  is_active: boolean;
  images: string[];
}
