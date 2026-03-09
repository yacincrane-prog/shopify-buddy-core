
CREATE TABLE public.admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  password_plain text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view credentials" ON public.admin_credentials
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can insert credentials" ON public.admin_credentials
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Auth users can delete credentials" ON public.admin_credentials
  FOR DELETE TO authenticated USING (true);
