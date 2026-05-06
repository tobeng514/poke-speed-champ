import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Team, TeamSlot } from "@/types/team";
import { emptyTeam } from "@/types/team";

export interface UserSettings {
  user_id: string;
  home_team_id: string | null;
  battle_team_id: string | null;
}

export const useTeams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: t }, { data: s }] = await Promise.all([
      supabase.from("teams").select("*").order("sort_order", { ascending: true }).order("updated_at", { ascending: false }),
      supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    setTeams((t ?? []).map((row: any) => ({ ...row, slots: row.slots as TeamSlot[] })));
    setSettings((s as any) ?? { user_id: user.id, home_team_id: null, battle_team_id: null });
    setLoading(false);
  };

  useEffect(() => {
    if (user) refresh();
  }, [user]);

  const saveTeam = async (name: string, slots: TeamSlot[], teamId?: string) => {
    if (!user) return null;
    if (teamId) {
      const { data, error } = await supabase
        .from("teams")
        .update({ name, slots: slots as any })
        .eq("id", teamId)
        .select()
        .single();
      if (error) throw error;
      await refresh();
      return data;
    }
    const { data, error } = await supabase
      .from("teams")
      .insert({ user_id: user.id, name, slots: slots as any })
      .select()
      .single();
    if (error) throw error;
    await refresh();
    return data;
  };

  const duplicateTeam = async (id: string) => {
    if (!user) return null;
    const t = teams.find((x) => x.id === id);
    if (!t) return null;
    const baseName = t.name.replace(/\s*\(複製\d*\)$/, "");
    const used = new Set(teams.map((x) => x.name));
    let copyName = `${baseName} (複製)`;
    let n = 2;
    while (used.has(copyName)) copyName = `${baseName} (複製${n++})`;
    const { data, error } = await supabase
      .from("teams")
      .insert({ user_id: user.id, name: copyName, slots: t.slots as any })
      .select()
      .single();
    if (error) throw error;
    await refresh();
    return data;
  };

  const deleteTeams = async (ids: string[]) => {
    if (!ids.length) return;
    await supabase.from("teams").delete().in("id", ids);
    await refresh();
  };

  const deleteTeam = async (id: string) => {
    await supabase.from("teams").delete().eq("id", id);
    await refresh();
  };

  const setActiveTeam = async (kind: "home" | "battle", teamId: string | null) => {
    if (!user) return;
    const patch = kind === "home" ? { home_team_id: teamId } : { battle_team_id: teamId };
    await supabase.from("user_settings").update(patch).eq("user_id", user.id);
    setSettings((cur) => (cur ? { ...cur, ...patch } : cur));
  };

  // when user picks a new active team via Teams tab, set BOTH home & battle.
  const setBothActiveTeams = async (teamId: string) => {
    if (!user) return;
    await supabase
      .from("user_settings")
      .update({ home_team_id: teamId, battle_team_id: teamId })
      .eq("user_id", user.id);
    setSettings((cur) => (cur ? { ...cur, home_team_id: teamId, battle_team_id: teamId } : cur));
  };

  const reorderTeams = async (orderedIds: string[]) => {
    // optimistic
    setTeams((cur) => {
      const map = new Map(cur.map((t) => [t.id, t]));
      return orderedIds.map((id, i) => ({ ...(map.get(id) as Team), sort_order: i } as any));
    });
    await Promise.all(
      orderedIds.map((id, i) =>
        supabase.from("teams").update({ sort_order: i } as any).eq("id", id)
      )
    );
  };

  const homeTeam = teams.find((t) => t.id === settings?.home_team_id) ?? null;
  const battleTeam = teams.find((t) => t.id === settings?.battle_team_id) ?? null;

  return { teams, settings, homeTeam, battleTeam, loading, refresh, saveTeam, deleteTeam, deleteTeams, duplicateTeam, setActiveTeam, setBothActiveTeams, reorderTeams, emptyTeam };
};
