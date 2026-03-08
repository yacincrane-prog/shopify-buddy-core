
CREATE TABLE public.theme_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view theme settings"
  ON public.theme_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Auth users manage theme settings"
  ON public.theme_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default theme
INSERT INTO public.theme_settings (key, value) VALUES (
  'storefront',
  '{
    "colors": {
      "background": "0 0% 98%",
      "foreground": "220 20% 10%",
      "card": "0 0% 100%",
      "primary": "220 20% 10%",
      "primary-foreground": "0 0% 98%",
      "secondary": "220 14% 96%",
      "accent": "36 100% 50%",
      "accent-foreground": "220 20% 10%",
      "muted": "220 14% 96%",
      "muted-foreground": "220 10% 46%",
      "destructive": "0 72% 51%",
      "border": "220 13% 91%",
      "success": "142 72% 29%"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "borderRadius": "0.5rem",
    "buttonStyle": "default"
  }'::jsonb
);
