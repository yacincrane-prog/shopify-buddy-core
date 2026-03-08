
-- Bundles table
CREATE TABLE public.bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  bundle_price numeric NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Bundle items (products in a bundle)
CREATE TABLE public.bundle_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid REFERENCES public.bundles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(bundle_id, product_id)
);

-- Quantity discounts per product
CREATE TABLE public.quantity_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  min_quantity integer NOT NULL,
  discount_percent numeric NOT NULL,
  UNIQUE(product_id, min_quantity)
);

-- Upsells: admin picks which product to upsell on which product page
CREATE TABLE public.upsells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  upsell_product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  discount_percent numeric NOT NULL DEFAULT 30,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(source_product_id, upsell_product_id)
);

-- RLS
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantity_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsells ENABLE ROW LEVEL SECURITY;

-- Public read for bundles
CREATE POLICY "Anyone can view active bundles" ON public.bundles FOR SELECT USING (is_active = true);
CREATE POLICY "Auth users manage bundles" ON public.bundles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public read for bundle_items
CREATE POLICY "Anyone can view bundle items" ON public.bundle_items FOR SELECT USING (true);
CREATE POLICY "Auth users manage bundle items" ON public.bundle_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public read for quantity_discounts
CREATE POLICY "Anyone can view quantity discounts" ON public.quantity_discounts FOR SELECT USING (true);
CREATE POLICY "Auth users manage quantity discounts" ON public.quantity_discounts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public read for active upsells
CREATE POLICY "Anyone can view active upsells" ON public.upsells FOR SELECT USING (is_active = true);
CREATE POLICY "Auth users manage upsells" ON public.upsells FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger for bundles updated_at
CREATE TRIGGER update_bundles_updated_at BEFORE UPDATE ON public.bundles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
