import { useState } from "react";
import { useTeams } from "@/hooks/useTeams";
import type { TeamSlot, Team } from "@/types/team";
import { emptyTeam } from "@/types/team";
import { findPokemon, POKEMON } from "@/data/pokemon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TeamEditor from "@/components/TeamEditor";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Check, Pencil, Plus, Star, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const TeamPage = () => {
  const { teams, settings, saveTeam, deleteTeam, setBothActiveTeams, loading } = useTeams();
  const [editing, setEditing] = useState<{ team?: Team; slots: TeamSlot[]; name: string } | null>(null);
  const { toast } = useToast();

  const nextDefaultName = () => {
    const used = new Set(teams.map((t) => t.name));
    let i = 1;
    while (used.has(`新建隊伍${i}`)) i++;
    return `新建隊伍${i}`;
  };

  const startNew = () => setEditing({ slots: emptyTeam(), name: nextDefaultName() });
  const startEdit = (t: Team) => setEditing({ team: t, slots: [...t.slots], name: t.name });

  const handleSave = async () => {
    if (!editing) return;
    const finalName = editing.name.trim() || nextDefaultName();
    try {
      const saved = await saveTeam(finalName, editing.slots, editing.team?.id);
      if (saved && !editing.team) await setBothActiveTeams(saved.id);
      toast({ title: "已儲存" });
      setEditing(null);
    } catch (e: any) {
      toast({ title: "儲存失敗", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="px-4">
      <header className="py-3 flex items-center justify-end">
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
                      <div key={i} className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0 text-sm text-muted-foreground">
                        {p ? "?" : "—"}
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
              <div className="px-4 py-3 border-b border-border space-y-2">
                <Input
                  placeholder={nextDefaultName()}
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
                <BagPicker
                  slots={editing.slots}
                  onPick={(idx, id) => {
                    const next = [...editing.slots];
                    next[idx] = { ...next[idx], id };
                    setEditing({ ...editing, slots: next });
                  }}
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

const BagPicker = ({
  slots,
  onPick,
}: {
  slots: TeamSlot[];
  onPick: (slotIdx: number, pokemonId: string) => void;
}) => {
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  return (
    <div className="grid grid-cols-6 gap-1.5">
      {slots.map((s, i) => {
        const p = findPokemon(s.id);
        return (
          <Popover
            key={i}
            open={openSlot === i}
            onOpenChange={(o) => setOpenSlot(o ? i : null)}
          >
            <PopoverTrigger asChild>
              <button className="aspect-square rounded-lg border border-border bg-card flex flex-col items-center justify-center text-[10px] text-muted-foreground active:scale-95 transition">
                <span className="text-base">?</span>
                <span className="truncate w-full px-0.5">{p ? p.name.split("-")[0].slice(0, 5) : `+${i + 1}`}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-64" align="start">
              <div className="p-2 border-b text-[11px] font-semibold text-muted-foreground">背包 — 揀 Pokémon</div>
              <ul className="max-h-72 overflow-y-auto py-1">
                {POKEMON.map((pp) => (
                  <li key={pp.id}>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-secondary text-sm"
                      onClick={() => { onPick(i, pp.id); setOpenSlot(null); }}
                    >
                      {pp.name}
                    </button>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
};

export default TeamPage;
