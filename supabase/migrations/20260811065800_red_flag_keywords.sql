CREATE TABLE public.red_flag_keywords (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  keyword text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE public.red_flag_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Keywords are viewable by everyone"
  ON public.red_flag_keywords FOR SELECT
  USING ( true );

-- Insert some default common red flags
INSERT INTO public.red_flag_keywords (keyword) VALUES 
('chest pain'),
('breathing difficulty'),
('shortness of breath'),
('heart attack'),
('stroke'),
('severe bleeding'),
('unconscious'),
('seizure'),
('choking'),
('severe burn');
