import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BagTag {
  id: string;
  name: string;
  color: string | null;
}

export const useBagTags = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState<BagTag[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("bag_tags").select("*").eq("user_id", user.id).order("created_at");
    setTags((data ?? []) as any);
    setLoading(false);
  }, [user]);

  useEffect(() => { if (user) refresh(); }, [user, refresh]);

  const add = async (name: string, color?: string) => {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const { error } = await supabase.from("bag_tags").insert({ user_id: user.id, name: trimmed, color: color ?? null });
    if (!error) await refresh();
  };

  const remove = async (id: string) => {
    await supabase.from("bag_tags").delete().eq("id", id);
    await refresh();
  };

  return { tags, loading, refresh, add, remove };
};
