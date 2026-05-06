-- Add tags array to bag_pokemon for batch tagging
ALTER TABLE public.bag_pokemon
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_bag_pokemon_tags ON public.bag_pokemon USING gin (tags);

-- Custom tag definitions per user (so tags can exist before being assigned)
CREATE TABLE IF NOT EXISTS public.bag_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

ALTER TABLE public.bag_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own bag_tags select" ON public.bag_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own bag_tags insert" ON public.bag_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own bag_tags update" ON public.bag_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own bag_tags delete" ON public.bag_tags FOR DELETE USING (auth.uid() = user_id);