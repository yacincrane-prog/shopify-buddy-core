import { supabase } from "@/integrations/supabase/client";

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  accent: string;
  "accent-foreground": string;
  muted: string;
  "muted-foreground": string;
  destructive: string;
  border: string;
  success: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: string;
  buttonStyle: string;
}

export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    background: "0 0% 98%",
    foreground: "220 20% 10%",
    card: "0 0% 100%",
    primary: "220 20% 10%",
    "primary-foreground": "0 0% 98%",
    secondary: "220 14% 96%",
    accent: "36 100% 50%",
    "accent-foreground": "220 20% 10%",
    muted: "220 14% 96%",
    "muted-foreground": "220 10% 46%",
    destructive: "0 72% 51%",
    border: "220 13% 91%",
    success: "142 72% 29%",
  },
  fonts: { heading: "Inter", body: "Inter" },
  borderRadius: "0.5rem",
  buttonStyle: "default",
};

export const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Poppins",
  "Montserrat",
  "Lato",
  "Playfair Display",
  "Merriweather",
  "Raleway",
  "Nunito",
  "Cairo",
  "Tajawal",
  "IBM Plex Sans",
  "DM Sans",
  "Space Grotesk",
];

export const RADIUS_OPTIONS = [
  { label: "None", value: "0rem" },
  { label: "Small", value: "0.25rem" },
  { label: "Medium", value: "0.5rem" },
  { label: "Large", value: "0.75rem" },
  { label: "XL", value: "1rem" },
  { label: "Full", value: "1.5rem" },
];

export const COLOR_PRESETS: { name: string; colors: Partial<ThemeColors> }[] = [
  {
    name: "Default",
    colors: { accent: "36 100% 50%", primary: "220 20% 10%", background: "0 0% 98%" },
  },
  {
    name: "Ocean Blue",
    colors: { accent: "210 100% 50%", primary: "220 60% 20%", background: "210 20% 98%" },
  },
  {
    name: "Forest Green",
    colors: { accent: "152 70% 40%", primary: "160 30% 15%", background: "150 10% 97%" },
  },
  {
    name: "Royal Purple",
    colors: { accent: "270 70% 55%", primary: "275 40% 15%", background: "270 10% 98%" },
  },
  {
    name: "Coral",
    colors: { accent: "16 90% 55%", primary: "10 30% 15%", background: "20 15% 97%" },
  },
  {
    name: "Midnight",
    colors: { accent: "45 100% 55%", primary: "230 30% 12%", background: "230 15% 96%" },
  },
];

export async function fetchTheme(): Promise<ThemeConfig> {
  const { data, error } = await supabase
    .from("theme_settings")
    .select("value")
    .eq("key", "storefront")
    .single();
  if (error || !data) return DEFAULT_THEME;
  return data.value as unknown as ThemeConfig;
}

export async function saveTheme(theme: ThemeConfig): Promise<void> {
  // Try update first, then insert
  const { data } = await supabase
    .from("theme_settings")
    .select("id")
    .eq("key", "storefront")
    .single();
  
  if (data) {
    const { error } = await supabase
      .from("theme_settings")
      .update({ value: theme as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
      .eq("key", "storefront");
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("theme_settings")
      .insert({ key: "storefront", value: theme as unknown as Record<string, unknown> });
    if (error) throw error;
  }
}

/** Apply theme CSS variables to document root */
export function applyThemeToDocument(theme: ThemeConfig) {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  root.style.setProperty("--radius", theme.borderRadius);

  // Load fonts
  const fonts = new Set([theme.fonts.heading, theme.fonts.body]);
  fonts.forEach((font) => {
    if (font && font !== "Inter") {
      const link = document.querySelector(`link[data-font="${font}"]`);
      if (!link) {
        const el = document.createElement("link");
        el.rel = "stylesheet";
        el.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@300;400;500;600;700&display=swap`;
        el.dataset.font = font;
        document.head.appendChild(el);
      }
    }
  });
}

/** Generate CSS variable string for iframe injection */
export function themeToCSS(theme: ThemeConfig): string {
  const vars = Object.entries(theme.colors)
    .map(([key, value]) => `--${key}: ${value};`)
    .join("\n    ");
  return `:root {\n    ${vars}\n    --radius: ${theme.borderRadius};\n  }`;
}
