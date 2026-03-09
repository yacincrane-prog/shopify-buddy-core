import { supabase } from "@/integrations/supabase/client";

export interface StorefrontConfig {
  storeName: string;
  storeNameEn: string;
  logo: string;
  announcementBar: {
    enabled: boolean;
    text: string;
    bgColor: string;
    textColor: string;
  };
  hero: {
    enabled: boolean;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    backgroundImage: string;
    overlay: boolean;
  };
  featuredSection: {
    enabled: boolean;
    title: string;
    showCategories: boolean;
    layout: "grid-2" | "grid-3" | "grid-4";
  };
  footer: {
    enabled: boolean;
    text: string;
    phone: string;
    email: string;
    socialLinks: {
      facebook: string;
      instagram: string;
      tiktok: string;
    };
  };
  productPage: {
    showRelatedProducts: boolean;
    showBreadcrumb: boolean;
    imagePosition: "right" | "left";
    showStockBadge: boolean;
    showShareButtons: boolean;
    checkoutFormPosition: "below_title" | "below_gallery" | "below_description" | "bottom";
    alwaysShowCheckoutForm: boolean;
  };
}

export const DEFAULT_STOREFRONT: StorefrontConfig = {
  storeName: "متجر الجزائر",
  storeNameEn: "DZ Store",
  logo: "",
  announcementBar: {
    enabled: true,
    text: "🚚 توصيل سريع لجميع الولايات — الدفع عند الاستلام",
    bgColor: "primary",
    textColor: "primary-foreground",
  },
  hero: {
    enabled: true,
    title: "اكتشف أفضل المنتجات بأسعار لا تُقاوم",
    subtitle: "توصيل سريع لجميع 58 ولاية 🇩🇿 مع الدفع عند الاستلام",
    buttonText: "تسوّق الآن",
    buttonLink: "#products",
    backgroundImage: "",
    overlay: true,
  },
  featuredSection: {
    enabled: true,
    title: "أحدث المنتجات",
    showCategories: true,
    layout: "grid-4",
  },
  footer: {
    enabled: true,
    text: "© 2025 متجر الجزائر — جميع الحقوق محفوظة",
    phone: "",
    email: "",
    socialLinks: { facebook: "", instagram: "", tiktok: "" },
  },
  productPage: {
    showRelatedProducts: true,
    showBreadcrumb: true,
    imagePosition: "right",
    showStockBadge: true,
    showShareButtons: false,
  },
};

const CONFIG_KEY = "storefront_config";

export async function fetchStorefrontConfig(): Promise<StorefrontConfig> {
  const { data, error } = await supabase
    .from("theme_settings")
    .select("value")
    .eq("key", CONFIG_KEY)
    .maybeSingle();
  if (error || !data) return DEFAULT_STOREFRONT;
  return { ...DEFAULT_STOREFRONT, ...(data.value as any) };
}

export async function saveStorefrontConfig(config: StorefrontConfig): Promise<void> {
  const value = JSON.parse(JSON.stringify(config));
  const { data: existing } = await supabase
    .from("theme_settings")
    .select("id")
    .eq("key", CONFIG_KEY)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("theme_settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", CONFIG_KEY);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("theme_settings")
      .insert({ key: CONFIG_KEY, value });
    if (error) throw error;
  }
}
