
CREATE TABLE public.exit_intent_popups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Wait! Don''t leave yet!',
  subtitle text NOT NULL DEFAULT 'Get a special discount before you go',
  discount_percent numeric DEFAULT 10,
  discount_code text DEFAULT '',
  cta_text text NOT NULL DEFAULT 'Claim My Discount',
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exit_intent_popups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active exit intent popups"
  ON public.exit_intent_popups FOR SELECT
  USING (is_active = true);

CREATE POLICY "Auth users manage exit intent popups"
  ON public.exit_intent_popups FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
