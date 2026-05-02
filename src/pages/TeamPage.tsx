import { useState } from "react";
import { useTeams } from "@/hooks/useTeams";
import type { TeamSlot, Team } from "@/types/team";
import { emptyTeam } from "@/types/team";
import { findPokemon } from "@/data/pokemon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TeamEditor from "@/components/TeamEditor";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Check, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TeamPage = () => {
  const { teams, settings, saveTeam, deleteTeam, setBothActiveTeams, loading } = useTeams();
  const [editing, setEditing] = useState<{ team?: Team; slots: TeamSlot[]; name: string } | null>(null);
  const { toast } = useToast();

  const startNew = () => setEditing({ slots: emptyTeam(), name: "" });
  const startEdit = (t: Team) => setEditing({ team: t, slots: [...t.slots], name: t.name });

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast({ title: "請輸入隊伍名稱", variant: "destructive" });
      return;
    }
    try {
      const saved = await saveTeam(editing.name.trim(), editing.slots, editing.team?.id);
      if (saved && !editing.team) {
        // new team -> set as active
        await setBothActiveTeams(saved.id);
      }
      toast({ title: "已儲存" });
      setEditing(null);
    } catch (e: any) {
      toast({ title: "儲存失敗", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="px-4 pt-[env(safe-area-inset-top)]">
      <header className="py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">隊伍</h1>
        <Button size="sm" onClick={startNew}>
          <Plus className="w-4 h-4" /> 新建
        </Button>
      </header>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-20">Loading…</div>
      ) : teams.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">仲未有隊伍，撳「新建」開始組隊</p>
        </div>
      ) : (
        <ul className="space-y-3 pb-4">
          {teams.map((t) => {
            const isActive = settings?.home_team_id === t.id;
            return (
              <li key={t.id} className={cn(
                "rounded-2xl border p-3",
                isActive ? "border-primary bg-primary/5" : "border-border bg-card"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {isActive && <Star className="w-4 h-4 text-primary fill-primary shrink-0" />}
                    <h3 className="font-semibold truncate">{t.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!isActive && (
                      <Button size="sm" variant="outline" onClick={() => setBothActiveTeams(t.id)}>
                        <Check className="w-3.5 h-3.5" /> 設為當前
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => startEdit(t)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteTeam(t.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-1.5 overflow-x-auto">
                  {t.slots.map((s, i) => {
                    const p = findPokemon(s.id);
                    return (
                      <div key={i} className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                        {p ? (
                          <img src={p.sprite} alt={p.name} className="w-11 h-11 object-contain" loading="lazy" />
                        ) : (
                          <span className="text-[10px] text-muted-foreground">空</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="bottom" className="h-[92vh] p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b border-border">
            <SheetTitle>{editing?.team ? "編輯隊伍" : "新建隊伍"}</SheetTitle>
          </SheetHeader>
          {editing && (
            <>
              <div className="px-4 py-3 border-b border-border">
                <Input
                  placeholder="隊伍名稱"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <TeamEditor
                  slots={editing.slots}
                  onChange={(slots) => setEditing({ ...editing, slots })}
                />
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>取消</Button>
                <Button className="flex-1" onClick={handleSave}>儲存</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TeamPage;
