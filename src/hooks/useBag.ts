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

  return { bag, loading, refresh, add, update, remove };
};
