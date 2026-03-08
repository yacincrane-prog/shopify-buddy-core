
CREATE TABLE public.quantity_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  label text NOT NULL DEFAULT '',
  is_best_offer boolean NOT NULL DEFAULT false,
  free_delivery boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_quantity_offers_product ON public.quantity_offers(product_id, position);

ALTER TABLE public.quantity_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quantity offers"
  ON public.quantity_offers FOR SELECT
  USING (true);

CREATE POLICY "Auth users manage quantity offers"
  ON public.quantity_offers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
