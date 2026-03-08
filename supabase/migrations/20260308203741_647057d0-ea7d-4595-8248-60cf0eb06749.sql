
CREATE TABLE public.product_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_sections_product ON public.product_sections(product_id, position);

ALTER TABLE public.product_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible product sections"
  ON public.product_sections FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Auth users manage product sections"
  ON public.product_sections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
