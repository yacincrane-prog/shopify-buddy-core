
CREATE TABLE public.abandoned_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_title text NOT NULL,
  customer_name text NOT NULL DEFAULT '',
  customer_phone text NOT NULL,
  wilaya text NOT NULL DEFAULT '',
  commune text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'abandoned',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_abandoned_leads_phone_date ON public.abandoned_leads(customer_phone, created_at DESC);

ALTER TABLE public.abandoned_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous visitors)
CREATE POLICY "Anyone can insert abandoned leads"
  ON public.abandoned_leads FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can view
CREATE POLICY "Auth users can view abandoned leads"
  ON public.abandoned_leads FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can delete
CREATE POLICY "Auth users can delete abandoned leads"
  ON public.abandoned_leads FOR DELETE
  TO authenticated
  USING (true);

-- DB function to deduplicate: only insert if no lead with same phone in last 24h
CREATE OR REPLACE FUNCTION public.capture_abandoned_lead(
  p_product_id uuid,
  p_product_title text,
  p_customer_name text,
  p_customer_phone text,
  p_wilaya text,
  p_commune text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only insert if no existing lead with same phone in last 24 hours
  IF NOT EXISTS (
    SELECT 1 FROM public.abandoned_leads
    WHERE customer_phone = p_customer_phone
      AND created_at > now() - interval '24 hours'
  ) THEN
    INSERT INTO public.abandoned_leads (product_id, product_title, customer_name, customer_phone, wilaya, commune)
    VALUES (p_product_id, p_product_title, p_customer_name, p_customer_phone, p_wilaya, p_commune);
  END IF;
END;
$$;
