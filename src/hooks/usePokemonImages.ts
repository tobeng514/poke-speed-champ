import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Map of pokemonId -> signed URL
type ImageMap = Record<string, string>;

let cache: ImageMap = {};
const subscribers = new Set<(m: ImageMap) => void>();
const notify = () => subscribers.forEach((cb) => cb({ ...cache }));

export const usePokemonImages = () => {
  const { user } = useAuth();
  const [images, setImages] = useState<ImageMap>(cache);

  useEffect(() => {
    const cb = (m: ImageMap) => setImages(m);
    subscribers.add(cb);
    return () => { subscribers.delete(cb); };
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("pokemon_images")
      .select("pokemon_id, image_path")
      .eq("user_id", user.id);
    if (!data) return;
    const next: ImageMap = {};
    await Promise.all(
      data.map(async (row: any) => {
        const { data: signed } = await supabase.storage
          .from("pokemon-images")
          .createSignedUrl(row.image_path, 60 * 60);
        if (signed?.signedUrl) next[row.pokemon_id] = signed.signedUrl;
      })
    );
    cache = next;
    notify();
  }, [user]);

  useEffect(() => {
    if (user) refresh();
    else { cache = {}; notify(); }
  }, [user, refresh]);

  const upload = async (pokemonId: string, file: File) => {
    if (!user) throw new Error("未登入");
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/${pokemonId}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("pokemon-images")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) throw upErr;

    // Find old row to delete old object
    const { data: existing } = await supabase
      .from("pokemon_images")
      .select("id, image_path")
      .eq("user_id", user.id)
      .eq("pokemon_id", pokemonId)
      .maybeSingle();

    if (existing) {
      await supabase.storage.from("pokemon-images").remove([(existing as any).image_path]);
      await supabase.from("pokemon_images").update({ image_path: path }).eq("id", (existing as any).id);
    } else {
      await supabase.from("pokemon_images").insert({
        user_id: user.id, pokemon_id: pokemonId, image_path: path,
      });
    }
    await refresh();
  };

  return { images, refresh, upload };
};
