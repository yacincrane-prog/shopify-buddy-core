
-- Post-order upsell configuration (admin-managed, one per product)
CREATE TABLE public.post_order_upsells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  upsell_product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  discount_percent numeric NOT NULL DEFAULT 40,
  headline text NOT NULL DEFAULT 'Special Offer Before Finalizing Your Order',
  accept_text text NOT NULL DEFAULT 'Add to My Order',
  decline_text text NOT NULL DEFAULT 'No Thanks',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(source_product_id)
);

ALTER TABLE public.post_order_upsells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active post order upsells"
  ON public.post_order_upsells FOR SELECT
  USING (is_active = true);

CREATE POLICY "Auth users manage post order upsells"
  ON public.post_order_upsells FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Tracking table for upsell responses
CREATE TABLE public.order_upsell_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  upsell_product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  upsell_product_title text NOT NULL,
  upsell_price numeric NOT NULL,
  discount_percent numeric NOT NULL,
  accepted boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_upsell_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert upsell tracking"
  ON public.order_upsell_tracking FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Auth users can view upsell tracking"
  ON public.order_upsell_tracking FOR SELECT
  TO authenticated
  USING (true);
