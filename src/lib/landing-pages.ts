import { supabase } from "@/integrations/supabase/client";

export const LP_SECTION_TYPES = [
  { value: "hero", label: "Hero Section" },
  { value: "gallery", label: "Product Gallery" },
  { value: "video", label: "Video Section" },
  { value: "benefits", label: "Benefits" },
  { value: "reviews", label: "Customer Reviews" },
  { value: "before_after", label: "Before / After" },
  { value: "faq", label: "FAQ" },
  { value: "countdown", label: "Countdown Timer" },
  { value: "order_form", label: "Order Form" },
  { value: "guarantee", label: "Guarantee" },
] as const;

export type LPSectionType = (typeof LP_SECTION_TYPES)[number]["value"];

export interface LandingPage {
  id: string;
  product_id: string;
  title: string;
  slug: string;
  template: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LPSection {
  id: string;
  landing_page_id: string;
  section_type: LPSectionType;
  position: number;
  content: Record<string, any>;
  is_visible: boolean;
}

export function getDefaultLPContent(type: LPSectionType): Record<string, any> {
  switch (type) {
    case "hero":
      return { headline: "", subtitle: "", image_url: "", cta_text: "Order Now" };
    case "gallery":
      return {};
    case "video":
      return { video_url: "", title: "" };
    case "benefits":
      return { heading: "Why Choose Us", items: [{ icon: "✓", title: "", description: "" }] };
    case "reviews":
      return { heading: "What Our Customers Say", items: [{ name: "", rating: 5, text: "", image_url: "" }] };
    case "before_after":
      return { heading: "See the Difference", before_image: "", after_image: "", before_label: "Before", after_label: "After" };
    case "faq":
      return { heading: "Frequently Asked Questions", items: [{ question: "", answer: "" }] };
    case "countdown":
      return { heading: "Limited Time Offer", end_date: "", subtitle: "Don't miss out!" };
    case "order_form":
      return {};
    case "guarantee":
      return { heading: "Our Guarantee", text: "", icon: "🛡️" };
    default:
      return {};
  }
}

export const TEMPLATES = [
  {
    id: "classic",
    name: "Classic Sales Page",
    sections: ["hero", "gallery", "benefits", "reviews", "faq", "order_form", "guarantee"] as LPSectionType[],
  },
  {
    id: "video_sales",
    name: "Video Sales Letter",
    sections: ["hero", "video", "benefits", "before_after", "reviews", "countdown", "order_form", "guarantee"] as LPSectionType[],
  },
  {
    id: "minimal",
    name: "Minimal & Clean",
    sections: ["hero", "gallery", "order_form"] as LPSectionType[],
  },
];

// ── CRUD ──

export async function fetchAllLandingPages(): Promise<LandingPage[]> {
  const { data } = await supabase
    .from("landing_pages")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as LandingPage[]) ?? [];
}

export async function fetchLandingPageBySlug(slug: string): Promise<LandingPage | null> {
  const { data } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data as LandingPage | null;
}

export async function createLandingPage(page: {
  product_id: string;
  title: string;
  slug: string;
  template: string;
}): Promise<LandingPage | null> {
  const { data } = await supabase
    .from("landing_pages")
    .insert(page)
    .select()
    .single();
  return data as LandingPage | null;
}

export async function updateLandingPage(id: string, updates: Partial<LandingPage>) {
  const { data } = await supabase
    .from("landing_pages")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return data;
}

export async function deleteLandingPage(id: string) {
  await supabase.from("landing_pages").delete().eq("id", id);
}

// ── Sections ──

export async function fetchLPSections(pageId: string): Promise<LPSection[]> {
  const { data } = await supabase
    .from("landing_page_sections")
    .select("*")
    .eq("landing_page_id", pageId)
    .order("position", { ascending: true });
  return (data as LPSection[]) ?? [];
}

export async function createLPSection(pageId: string, type: LPSectionType, position: number) {
  const { data } = await supabase
    .from("landing_page_sections")
    .insert({
      landing_page_id: pageId,
      section_type: type,
      position,
      content: getDefaultLPContent(type),
    })
    .select()
    .single();
  return data;
}

export async function updateLPSection(id: string, updates: Partial<Pick<LPSection, "content" | "is_visible" | "position">>) {
  await supabase.from("landing_page_sections").update(updates).eq("id", id);
}

export async function deleteLPSection(id: string) {
  await supabase.from("landing_page_sections").delete().eq("id", id);
}

export async function reorderLPSections(sections: { id: string; position: number }[]) {
  await Promise.all(
    sections.map((s) =>
      supabase.from("landing_page_sections").update({ position: s.position }).eq("id", s.id)
    )
  );
}

export async function bulkCreateSections(pageId: string, types: LPSectionType[]) {
  const rows = types.map((type, i) => ({
    landing_page_id: pageId,
    section_type: type,
    position: i,
    content: getDefaultLPContent(type),
  }));
  await supabase.from("landing_page_sections").insert(rows);
}
