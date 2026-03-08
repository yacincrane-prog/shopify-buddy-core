import { supabase } from "@/integrations/supabase/client";

export const SECTION_TYPES = [
  { value: "gallery", label: "Product Gallery", icon: "Image" },
  { value: "description", label: "Description", icon: "FileText" },
  { value: "reviews", label: "Reviews", icon: "Star" },
  { value: "faq", label: "FAQ", icon: "HelpCircle" },
  { value: "bundle_offers", label: "Bundle Offers", icon: "PackageOpen" },
  { value: "upsell", label: "Upsell Block", icon: "TrendingUp" },
  { value: "image_text", label: "Image + Text", icon: "LayoutList" },
  { value: "video", label: "Video", icon: "Play" },
  { value: "quantity_pricing", label: "Quantity Pricing", icon: "Hash" },
  { value: "order_button", label: "Order Button", icon: "ShoppingBag" },
] as const;

export type SectionType = (typeof SECTION_TYPES)[number]["value"];

export interface ProductSection {
  id: string;
  product_id: string;
  section_type: SectionType;
  position: number;
  content: Record<string, any>;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export function getDefaultContent(type: SectionType): Record<string, any> {
  switch (type) {
    case "gallery":
      return {};
    case "description":
      return { custom_text: "" };
    case "reviews":
      return { heading: "Customer Reviews", items: [] };
    case "faq":
      return { heading: "Frequently Asked Questions", items: [{ question: "", answer: "" }] };
    case "bundle_offers":
      return {};
    case "upsell":
      return {};
    case "image_text":
      return { image_url: "", text: "", heading: "", layout: "left" };
    case "video":
      return { video_url: "", title: "", autoplay: false };
    case "quantity_pricing":
      return {};
    case "order_button":
      return {};
    default:
      return {};
  }
}

export async function fetchSectionsForProduct(productId: string): Promise<ProductSection[]> {
  const { data } = await supabase
    .from("product_sections")
    .select("*")
    .eq("product_id", productId)
    .order("position", { ascending: true });
  return (data as ProductSection[]) ?? [];
}

export async function fetchAllSectionsForProduct(productId: string): Promise<ProductSection[]> {
  // For admin - need all sections including hidden ones
  // We use the authenticated policy which allows all
  const { data } = await supabase
    .from("product_sections")
    .select("*")
    .eq("product_id", productId)
    .order("position", { ascending: true });
  return (data as ProductSection[]) ?? [];
}

export async function createSection(
  productId: string,
  sectionType: SectionType,
  position: number
): Promise<ProductSection | null> {
  const { data } = await supabase
    .from("product_sections")
    .insert({
      product_id: productId,
      section_type: sectionType,
      position,
      content: getDefaultContent(sectionType),
    })
    .select()
    .single();
  return data as ProductSection | null;
}

export async function updateSection(
  id: string,
  updates: Partial<Pick<ProductSection, "content" | "is_visible" | "position">>
) {
  const { data } = await supabase
    .from("product_sections")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return data;
}

export async function deleteSection(id: string) {
  await supabase.from("product_sections").delete().eq("id", id);
}

export async function reorderSections(sections: { id: string; position: number }[]) {
  const promises = sections.map((s) =>
    supabase.from("product_sections").update({ position: s.position }).eq("id", s.id)
  );
  await Promise.all(promises);
}
