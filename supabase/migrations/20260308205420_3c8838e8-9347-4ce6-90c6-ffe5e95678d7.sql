
CREATE TABLE public.landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  template text NOT NULL DEFAULT 'classic',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_landing_pages_slug ON public.landing_pages(slug);

ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published landing pages"
  ON public.landing_pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Auth users manage landing pages"
  ON public.landing_pages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE public.landing_page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id uuid NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lp_sections_page ON public.landing_page_sections(landing_page_id, position);

ALTER TABLE public.landing_page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible lp sections"
  ON public.landing_page_sections FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Auth users manage lp sections"
  ON public.landing_page_sections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
