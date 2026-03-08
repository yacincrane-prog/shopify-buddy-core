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

export async function duplicateLPSection(section: LPSection, newPosition: number) {
  const { data } = await supabase
    .from("landing_page_sections")
    .insert({
      landing_page_id: section.landing_page_id,
      section_type: section.section_type,
      position: newPosition,
      content: section.content,
      is_visible: section.is_visible,
    })
    .select()
    .single();
  return data;
}

// Pre-filled section templates with ready-to-use content
export const SECTION_PRESETS: { id: string; label: string; type: LPSectionType; content: Record<string, any> }[] = [
  {
    id: "hero_sale",
    label: "🔥 Hero – Flash Sale",
    type: "hero",
    content: { headline: "Flash Sale – Up to 50% OFF!", subtitle: "Limited time offer. Don't miss out!", image_url: "", cta_text: "Shop Now" },
  },
  {
    id: "hero_launch",
    label: "🚀 Hero – Product Launch",
    type: "hero",
    content: { headline: "Introducing Our Latest Product", subtitle: "The solution you've been waiting for", image_url: "", cta_text: "Get Yours Now" },
  },
  {
    id: "benefits_3",
    label: "✅ 3 Key Benefits",
    type: "benefits",
    content: {
      heading: "Why Choose Us",
      items: [
        { icon: "🚚", title: "Fast Delivery", description: "Get your order delivered quickly" },
        { icon: "💰", title: "Best Price", description: "Guaranteed lowest price" },
        { icon: "⭐", title: "Premium Quality", description: "Only the finest materials" },
      ],
    },
  },
  {
    id: "reviews_social",
    label: "⭐ Social Proof Reviews",
    type: "reviews",
    content: {
      heading: "What Our Customers Say",
      items: [
        { name: "Ahmed K.", text: "Amazing product! Exactly what I needed.", image_url: "" },
        { name: "Sara M.", text: "Fast delivery and great quality. Highly recommend!", image_url: "" },
        { name: "Youssef B.", text: "Best purchase I've made this year.", image_url: "" },
      ],
    },
  },
  {
    id: "faq_common",
    label: "❓ Common FAQ",
    type: "faq",
    content: {
      heading: "Frequently Asked Questions",
      items: [
        { question: "How long does delivery take?", answer: "Delivery takes 2-5 business days depending on your location." },
        { question: "Can I return the product?", answer: "Yes, we offer a 30-day money-back guarantee." },
        { question: "Is cash on delivery available?", answer: "Yes, we accept cash on delivery across all wilayas." },
      ],
    },
  },
  {
    id: "guarantee_money",
    label: "🛡️ Money-Back Guarantee",
    type: "guarantee",
    content: { heading: "30-Day Money-Back Guarantee", text: "If you're not 100% satisfied, return it within 30 days for a full refund. No questions asked.", icon: "🛡️" },
  },
  {
    id: "countdown_urgency",
    label: "⏰ Urgency Countdown",
    type: "countdown",
    content: { heading: "🔥 Offer Ends Soon!", subtitle: "Order now before it's too late!", end_date: "" },
  },
];

export async function bulkCreateSections(pageId: string, types: LPSectionType[]) {
  const rows = types.map((type, i) => ({
    landing_page_id: pageId,
    section_type: type,
    position: i,
    content: getDefaultLPContent(type),
  }));
  await supabase.from("landing_page_sections").insert(rows);
}
