
-- bag_pokemon table
CREATE TABLE public.bag_pokemon (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pokemon_id TEXT NOT NULL,
  nickname TEXT,
  ability TEXT,
  item TEXT,
  nature TEXT DEFAULT 'Hardy',
  evs JSONB NOT NULL DEFAULT '{"hp":0,"atk":0,"def":0,"spa":0,"spd":0,"spe":0}'::jsonb,
  ivs JSONB NOT NULL DEFAULT '{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31}'::jsonb,
  level INT NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bag_pokemon ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bag select" ON public.bag_pokemon FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own bag insert" ON public.bag_pokemon FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own bag update" ON public.bag_pokemon FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own bag delete" ON public.bag_pokemon FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_bag_touch BEFORE UPDATE ON public.bag_pokemon FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX idx_bag_user ON public.bag_pokemon(user_id);

-- pokemon_images table
CREATE TABLE public.pokemon_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pokemon_id TEXT NOT NULL,
  image_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, pokemon_id)
);
ALTER TABLE public.pokemon_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own img select" ON public.pokemon_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own img insert" ON public.pokemon_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own img update" ON public.pokemon_images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own img delete" ON public.pokemon_images FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_img_touch BEFORE UPDATE ON public.pokemon_images FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- storage bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('pokemon-images', 'pokemon-images', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "own pokemon images select" ON storage.objects FOR SELECT
  USING (bucket_id = 'pokemon-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own pokemon images insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pokemon-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own pokemon images update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'pokemon-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own pokemon images delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'pokemon-images' AND auth.uid()::text = (storage.foldername(name))[1]);
