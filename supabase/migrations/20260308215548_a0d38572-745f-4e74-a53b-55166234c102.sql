
CREATE TABLE public.roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  project_idea text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read roadmaps" ON public.roadmaps FOR SELECT USING (true);
CREATE POLICY "Anyone can insert roadmaps" ON public.roadmaps FOR INSERT WITH CHECK (true);
