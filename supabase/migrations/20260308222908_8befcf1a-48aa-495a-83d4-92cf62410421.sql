
CREATE TABLE public.tracking_pixels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  pixel_id TEXT NOT NULL,
  name TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_pixels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pixels" ON public.tracking_pixels FOR SELECT USING (is_active = true);
CREATE POLICY "Auth users manage pixels" ON public.tracking_pixels FOR ALL TO authenticated USING (true) WITH CHECK (true);
