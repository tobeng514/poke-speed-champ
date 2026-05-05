import { useState } from "react";
import { useTeams } from "@/hooks/useTeams";
import { useBag } from "@/hooks/useBag";
import type { TeamSlot, Team } from "@/types/team";
import { emptyTeam } from "@/types/team";
import { findPokemon } from "@/data/pokemon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TeamEditor from "@/components/TeamEditor";
import PokemonAvatar from "@/components/PokemonAvatar";
import PokemonPickerDialog from "@/components/PokemonPickerDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Check, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TeamPage = () => {
  const { teams, settings, saveTeam, deleteTeam, setBothActiveTeams, loading } = useTeams();
  const [editing, setEditing] = useState<{ team?: Team; slots: TeamSlot[]; name: string } | null>(null);
  const [picking, setPicking] = useState(false);
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
                <div className="grid grid-cols-6 gap-1.5">
                  {t.slots.map((s, i) => (
                    <PokemonAvatar key={i} pokemonId={s.id ?? ""} size="sm" interactive={false} />
                  ))}
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
                <div className="grid grid-cols-6 gap-1.5">
                  {editing.slots.map((s, i) => (
                    <div key={i}
                      className="aspect-square rounded-lg border border-dashed border-border bg-card flex items-center justify-center">
                      {s.id ? <PokemonAvatar pokemonId={s.id} size="sm" interactive={false} /> : <Plus className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full" onClick={() => setPicking(true)}>
                  <span className="text-lg mr-1" role="img" aria-label="bag">🎒</span> 打開背包
                </Button>
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

              <BagSelectDialog
                open={picking}
                onOpenChange={setPicking}
                currentSlots={editing.slots}
                onConfirm={(pickedBag) => {
                  const next = [...editing.slots];
                  let idx = 0;
                  for (const b of pickedBag) {
                    while (idx < 6 && next[idx]?.id) idx++;
                    if (idx >= 6) break;
                    next[idx] = {
                      ...next[idx],
                      id: b.pokemon_id,
                      bagId: b.id,
                      nickname: b.nickname ?? undefined,
                      ability: b.ability ?? undefined,
                      item: (b.item ?? "None") as any,
                      nature: (b.nature ?? "Hardy") as any,
                      evs: b.evs,
                      ivs: b.ivs,
                      level: b.level,
                      moves: b.moves ?? [],
                    };
                    idx++;
                  }
                  setEditing({ ...editing, slots: next });
                  setPicking(false);
                }}
              />
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

const BagSelectDialog = ({
  open, onOpenChange, currentSlots, onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentSlots: TeamSlot[];
  onConfirm: (picked: import("@/hooks/useBag").BagPokemon[]) => void;
}) => {
  const { bag, add } = useBag();
  const [selected, setSelected] = useState<string[]>([]); // bag entry ids
  const [addOpen, setAddOpen] = useState(false);
  const { toast } = useToast();

  const filledCount = currentSlots.filter((s) => s.id).length;
  const remaining = 6 - filledCount;
  const usedBagIds = new Set(currentSlots.map((s) => s.bagId).filter(Boolean) as string[]);

  const toggle = (bagId: string) => {
    if (selected.includes(bagId)) setSelected(selected.filter((x) => x !== bagId));
    else if (selected.length < remaining) setSelected([...selected, bagId]);
    else toast({ title: `最多揀 ${remaining} 隻` });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setSelected([]); onOpenChange(o); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>從背包選（{selected.length}/{remaining}）</DialogTitle>
            <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4" /> 新增
            </Button>
          </div>
        </DialogHeader>
        {bag.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">背包係空，撳「新增」加入 Pokémon</p>
        ) : (
          <div className="grid grid-cols-5 gap-2 max-h-[55vh] overflow-y-auto">
            {bag.map((b) => {
              const data = findPokemon(b.pokemon_id);
              const sel = selected.includes(b.id);
              const inUse = usedBagIds.has(b.id);
              return (
                <button key={b.id} disabled={inUse} onClick={() => toggle(b.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-1.5 rounded-xl border transition active:scale-95",
                    sel ? "border-primary bg-primary/10 ring-2 ring-primary" : "border-border bg-card",
                    inUse && "opacity-40"
                  )}>
                  <PokemonAvatar pokemonId={b.pokemon_id} size="sm" interactive={false} />
                  <span className="text-[10px] truncate w-full text-center">
                    {b.nickname || data?.name.split("-")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>取消</Button>
          <Button className="flex-1" disabled={selected.length === 0} onClick={() => {
            const picked = bag.filter((b) => selected.includes(b.id));
            onConfirm(picked);
            setSelected([]);
          }}>
            確認
          </Button>
        </div>

        <PokemonPickerDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          title="加入背包 + 隊伍"
          onPick={async (id) => {
            try {
              const created = await add(id);
              if (created && selected.length < remaining) setSelected([...selected, created.id]);
              toast({ title: "已加入背包" });
            } catch (e: any) { toast({ title: "失敗", description: e.message, variant: "destructive" }); }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TeamPage;
