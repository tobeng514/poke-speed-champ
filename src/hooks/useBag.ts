import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BagPokemon {
  id: string;
  pokemon_id: string;
  nickname: string | null;
  ability: string | null;
  item: string | null;
  nature: string;
  evs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  ivs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  level: number;
  moves: string[];
  favorite?: boolean;
  tags?: string[];
  created_at?: string;
}

export const useBag = () => {
  const { user } = useAuth();
  const [bag, setBag] = useState<BagPokemon[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("bag_pokemon")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setBag((data ?? []) as any);
    setLoading(false);
  }, [user]);

  useEffect(() => { if (user) refresh(); }, [user, refresh]);

  const add = async (pokemon_id: string) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("bag_pokemon")
      .insert({ user_id: user.id, pokemon_id })
      .select()
      .single();
    if (error) throw error;
    await refresh();
    return data as any as BagPokemon;
  };

  const update = async (id: string, patch: Partial<BagPokemon>) => {
    const { error } = await supabase.from("bag_pokemon").update(patch as any).eq("id", id);
    if (error) throw error;
    await refresh();
  };

  const remove = async (id: string) => {
    await supabase.from("bag_pokemon").delete().eq("id", id);
    await refresh();
  };

  const removeMany = async (ids: string[]) => {
    if (!ids.length) return;
    await supabase.from("bag_pokemon").delete().in("id", ids);
    await refresh();
  };

  const duplicateMany = async (ids: string[]) => {
    if (!user || !ids.length) return;
    const sources = bag.filter((b) => ids.includes(b.id));
    const rows = sources.map((s) => ({
      user_id: user.id,
      pokemon_id: s.pokemon_id,
      nickname: s.nickname,
      ability: s.ability,
      item: s.item,
      nature: s.nature,
      evs: s.evs,
      ivs: s.ivs,
      level: s.level,
      moves: s.moves ?? [],
      favorite: s.favorite ?? false,
      tags: s.tags ?? [],
    }));
    await supabase.from("bag_pokemon").insert(rows as any);
    await refresh();
  };

  // append tags (union) to many bag pokemon
  const tagMany = async (ids: string[], tagsToAdd: string[]) => {
    if (!ids.length || !tagsToAdd.length) return;
    const targets = bag.filter((b) => ids.includes(b.id));
    await Promise.all(
      targets.map((t) => {
        const merged = Array.from(new Set([...(t.tags ?? []), ...tagsToAdd]));
        return supabase.from("bag_pokemon").update({ tags: merged } as any).eq("id", t.id);
      }),
    );
    await refresh();
  };

  return { bag, loading, refresh, add, update, remove, removeMany, duplicateMany, tagMany };
};
