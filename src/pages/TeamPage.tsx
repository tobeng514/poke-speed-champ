import { useEffect, useState } from "react";
import { useTeams } from "@/hooks/useTeams";
import { useBag } from "@/hooks/useBag";
import type { TeamSlot, Team } from "@/types/team";
import { emptyTeam, emptySlot } from "@/types/team";
import { findPokemon } from "@/data/pokemon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TeamEditor from "@/components/TeamEditor";
import PokemonAvatar from "@/components/PokemonAvatar";
import PokemonPickerDialog from "@/components/PokemonPickerDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpToLine, Check, CheckSquare, Copy, GripVertical, Pencil, Plus, Square, Star, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const TeamPage = () => {
  const { teams, settings, saveTeam, deleteTeam, deleteTeams, duplicateTeam, setBothActiveTeams, reorderTeams, loading } = useTeams();
  const [editing, setEditing] = useState<{ team?: Team; slots: TeamSlot[]; name: string } | null>(null);
  const [picking, setPicking] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [batchSel, setBatchSel] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 5 } }));

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

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = teams.findIndex((t) => t.id === active.id);
    const newIdx = teams.findIndex((t) => t.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = arrayMove(teams, oldIdx, newIdx).map((t) => t.id);
    reorderTeams(reordered);
  };

  const moveToTop = (id: string) => {
    const idx = teams.findIndex((t) => t.id === id);
    if (idx <= 0) return;
    const ordered = [id, ...teams.filter((t) => t.id !== id).map((t) => t.id)];
    reorderTeams(ordered);
  };

  const toggleBatch = (id: string) => {
    const next = new Set(batchSel);
    next.has(id) ? next.delete(id) : next.add(id);
    setBatchSel(next);
  };

  const exitBatch = () => { setBatchMode(false); setBatchSel(new Set()); };

  const batchDelete = async () => {
    if (!batchSel.size) return;
    if (!confirm(`刪除 ${batchSel.size} 個隊伍？`)) return;
    await deleteTeams(Array.from(batchSel));
    exitBatch();
    toast({ title: "已刪除" });
  };

  const batchDuplicate = async () => {
    if (!batchSel.size) return;
    for (const id of batchSel) await duplicateTeam(id);
    exitBatch();
    toast({ title: "已複製" });
  };

  return (
    <div className="px-4">
      <header className="py-3 flex items-center justify-end gap-2">
        {batchMode ? (
          <>
            <span className="text-sm text-muted-foreground mr-auto">已選 {batchSel.size}</span>
            <Button size="sm" variant="outline" onClick={batchDuplicate} disabled={!batchSel.size}>
              <Copy className="w-4 h-4" /> 複製
            </Button>
            <Button size="sm" variant="destructive" onClick={batchDelete} disabled={!batchSel.size}>
              <Trash2 className="w-4 h-4" /> 刪除
            </Button>
            <Button size="sm" variant="ghost" onClick={exitBatch}>
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" onClick={startNew}>
              <Plus className="w-4 h-4" /> 新建
            </Button>
            <Button size="sm" variant="outline" onClick={() => setBatchMode(true)} disabled={teams.length === 0}>
              <CheckSquare className="w-4 h-4" /> 批量
            </Button>
          </>
        )}
      </header>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-20">Loading…</div>
      ) : teams.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">仲未有隊伍，撳「新建」開始組隊</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} autoScroll={{ threshold: { x: 0, y: 0.15 } }}>
          <SortableContext items={teams.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-3 pb-4">
              {teams.map((t) => (
                <SortableTeam
                  key={t.id} team={t}
                  isActive={settings?.home_team_id === t.id}
                  batchMode={batchMode}
                  batchSelected={batchSel.has(t.id)}
                  onBatchToggle={() => toggleBatch(t.id)}
                  onActivate={() => setBothActiveTeams(t.id)}
                  onEdit={() => startEdit(t)}
                  onDelete={() => deleteTeam(t.id)}
                  onDuplicate={async () => { await duplicateTeam(t.id); toast({ title: "已複製" }); }}
                  onMoveTop={() => moveToTop(t.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
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
                  // Replace strategy: keep slots whose bagId still selected (preserving custom edits),
                  // then append newly added bag entries; pad to 6.
                  const keptIds = new Set(pickedBag.map((b) => b.id));
                  const kept = editing.slots.filter((s) => s.bagId && keptIds.has(s.bagId));
                  const keptBagIds = new Set(kept.map((s) => s.bagId));
                  const added = pickedBag
                    .filter((b) => !keptBagIds.has(b.id))
                    .map<TeamSlot>((b) => ({
                      ...emptySlot(),
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
                    }));
                  const next = [...kept, ...added];
                  while (next.length < 6) next.push(emptySlot());
                  setEditing({ ...editing, slots: next.slice(0, 6) });
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

const SortableTeam = ({ team, isActive, onActivate, onEdit, onDelete }: {
  team: Team; isActive: boolean;
  onActivate: () => void; onEdit: () => void; onDelete: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: team.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <li ref={setNodeRef} style={style} className={cn(
      "rounded-2xl border p-3 touch-manipulation",
      isActive ? "border-primary bg-primary/5" : "border-border bg-card"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {isActive && <Star className="w-4 h-4 text-primary fill-primary shrink-0" />}
          <h3 className="font-semibold truncate">{team.name}</h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!isActive && (
            <Button size="sm" variant="outline" onClick={onActivate}>
              <Check className="w-3.5 h-3.5" /> 設為當前
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-6 gap-1.5 flex-1">
          {team.slots.map((s, i) => (
            <PokemonAvatar key={i} pokemonId={s.id ?? ""} size="sm" interactive={false} />
          ))}
        </div>
        <button
          {...attributes}
          {...listeners}
          aria-label="拖動排序"
          className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary touch-none cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      </div>
    </li>
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
  const [selected, setSelected] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const { toast } = useToast();

  // sync selection with current team's bag entries each time the dialog opens
  useEffect(() => {
    if (open) {
      setSelected(currentSlots.map((s) => s.bagId).filter(Boolean) as string[]);
    }
  }, [open]);

  const toggle = (bagId: string) => {
    if (selected.includes(bagId)) setSelected(selected.filter((x) => x !== bagId));
    else if (selected.length < 6) setSelected([...selected, bagId]);
    else toast({ title: "最多揀 6 隻" });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>從背包選（{selected.length}/6）</DialogTitle>
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
              return (
                <button key={b.id} onClick={() => toggle(b.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-1.5 rounded-xl border transition active:scale-95",
                    sel ? "border-primary bg-primary/10 ring-2 ring-primary" : "border-border bg-card",
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
          <Button className="flex-1" onClick={() => {
            const picked = selected
              .map((id) => bag.find((b) => b.id === id))
              .filter(Boolean) as import("@/hooks/useBag").BagPokemon[];
            onConfirm(picked);
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
              if (created && selected.length < 6) setSelected([...selected, created.id]);
              toast({ title: "已加入背包" });
            } catch (e: any) { toast({ title: "失敗", description: e.message, variant: "destructive" }); }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TeamPage;
