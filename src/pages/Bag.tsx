import { useEffect, useMemo, useState } from "react";
import { useBag, type BagPokemon } from "@/hooks/useBag";
import { useBagTags } from "@/hooks/useBagTags";
import { POKEMON, NATURES, findPokemon, calcHp, calcStat, speedNatureMod, EV_TOTAL_CAP, EV_INDIVIDUAL_CAP } from "@/data/pokemon";
import { POKEMON_TYPES } from "@/data/pokemonTypes";
import { TYPES, TYPE_COLORS, TYPE_ZH, type PokeType } from "@/data/types";
import { fetchPokemon, prettyName } from "@/lib/pokeapi";
import { fetchMovesForType, fetchLearnersOfMove } from "@/lib/moves";
import { localizedName } from "@/lib/pokemonName";
import { useT } from "@/i18n";
import PokemonAvatar from "@/components/PokemonAvatar";
import PokemonPickerDialog from "@/components/PokemonPickerDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter, Search, Trash2, X, ArrowUpDown, ArrowUp, ArrowDown, Tag, Copy, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type StatKey = "hp" | "atk" | "def" | "spa" | "spd" | "spe";
const STATS: { key: StatKey; label: string }[] = [
  { key: "hp", label: "HP" }, { key: "atk", label: "Atk" }, { key: "def", label: "Def" },
  { key: "spa", label: "SpA" }, { key: "spd", label: "SpD" }, { key: "spe", label: "Spe" },
];

const SORT_OPTIONS = [
  { v: "no", l: "編號" },
  { v: "type", l: "屬性" },
  { v: "added", l: "加入時間" },
] as const;
type SortKey = typeof SORT_OPTIONS[number]["v"];

const Bag = () => {
  const { bag, loading, add, update, remove, removeMany, duplicateMany, tagMany } = useBag();
  const { tags: allTags, add: addTag, remove: removeTag } = useBagTags();
  const { lang } = useT();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState<BagPokemon | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PokeType[]>([]);
  const [moveFilter, setMoveFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [moveLearners, setMoveLearners] = useState<Set<string> | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(() => {
    const v = localStorage.getItem("bag.sort") as SortKey | null;
    return (v && SORT_OPTIONS.some((o) => o.v === v)) ? v : "no";
  });
  const [sortAsc, setSortAsc] = useState<boolean>(() => localStorage.getItem("bag.sortAsc") !== "0");
  const [batchMode, setBatchMode] = useState(false);
  const [batchSel, setBatchSel] = useState<Set<string>>(new Set());
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => { localStorage.setItem("bag.sort", sortKey); }, [sortKey]);
  useEffect(() => { localStorage.setItem("bag.sortAsc", sortAsc ? "1" : "0"); }, [sortAsc]);

  // when move filter changes, fetch learners
  useEffect(() => {
    if (!moveFilter) { setMoveLearners(null); return; }
    fetchLearnersOfMove(moveFilter).then((arr) => setMoveLearners(new Set(arr)));
  }, [moveFilter]);

  const speciesIndex = useMemo(() => {
    const m = new Map<string, number>();
    POKEMON.forEach((p, i) => m.set(p.id, i));
    return m;
  }, []);

  const filtered = useMemo(() => {
    let arr = bag.filter((b) => {
      const data = findPokemon(b.pokemon_id);
      if (!data) return false;
      const dispName = (b.nickname || localizedName(data, lang)).toLowerCase();
      if (search && !dispName.includes(search.toLowerCase()) && !data.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter.length > 0) {
        const t = POKEMON_TYPES[b.pokemon_id] ?? [];
        if (!typeFilter.some((tf) => t.includes(tf))) return false;
      }
      if (tagFilter.length > 0) {
        const tg = b.tags ?? [];
        if (!tagFilter.some((tf) => tg.includes(tf))) return false;
      }
      if (moveLearners) {
        if (!moveLearners.has(b.pokemon_id)) return false;
      }
      return true;
    });
    if (sortKey === "no") {
      arr = [...arr].sort((a, b) => (speciesIndex.get(a.pokemon_id) ?? 9999) - (speciesIndex.get(b.pokemon_id) ?? 9999));
    } else if (sortKey === "type") {
      arr = [...arr].sort((a, b) => (POKEMON_TYPES[a.pokemon_id]?.[0] ?? "").localeCompare(POKEMON_TYPES[b.pokemon_id]?.[0] ?? ""));
    } else if (sortKey === "added") {
      arr = [...arr].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    }
    if (!sortAsc) arr = [...arr].reverse();
    return arr;
  }, [bag, search, typeFilter, tagFilter, moveLearners, sortKey, sortAsc, speciesIndex, lang]);

  const handleAdd = async (id: string) => {
    try { await add(id); toast({ title: "已加入背包" }); }
    catch (e: any) { toast({ title: "失敗", description: e.message, variant: "destructive" }); }
  };

  const toggleBatch = (id: string) => {
    const next = new Set(batchSel);
    if (next.has(id)) next.delete(id); else next.add(id);
    setBatchSel(next);
  };

  const exitBatch = () => { setBatchMode(false); setBatchSel(new Set()); };

  const activeFilterCount = typeFilter.length + tagFilter.length + (moveFilter ? 1 : 0);

  return (
    <div className="px-4 pb-4">
      <div className="py-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="搜索名字…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="icon" onClick={() => setSortAsc(!sortAsc)} title={sortAsc ? "正序" : "倒序"}>
          {sortAsc ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
        </Button>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-auto h-10 px-2 gap-1">
            <ArrowUpDown className="w-4 h-4" />
          </SelectTrigger>
          <SelectContent align="end">
            {SORT_OPTIONS.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => setFilterOpen(true)} className="relative">
          <Filter className="w-4 h-4" />
          {activeFilterCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center">{activeFilterCount}</span>}
        </Button>
        <Button variant={batchMode ? "default" : "outline"} size="icon" onClick={() => batchMode ? exitBatch() : setBatchMode(true)} title="批量">
          <CheckSquare className="w-4 h-4" />
        </Button>
        <Button size="icon" onClick={() => setPickerOpen(true)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {(typeFilter.length > 0 || tagFilter.length > 0 || moveFilter) && (
        <div className="flex flex-wrap gap-1 mb-2">
          {typeFilter.map((t) => (
            <button key={t} onClick={() => setTypeFilter(typeFilter.filter((x) => x !== t))}
              className="text-[10px] px-2 py-0.5 rounded-full text-white flex items-center gap-1"
              style={{ backgroundColor: TYPE_COLORS[t] }}>
              {TYPE_ZH[t]} <X className="w-3 h-3" />
            </button>
          ))}
          {moveFilter && (
            <button onClick={() => setMoveFilter(null)} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary flex items-center gap-1">
              {prettyName(moveFilter)} <X className="w-3 h-3" />
            </button>
          )}
          {tagFilter.map((t) => (
            <button key={t} onClick={() => setTagFilter(tagFilter.filter((x) => x !== t))}
              className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1">
              #{t} <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      {batchMode && (
        <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-secondary/50 text-xs">
          <span className="flex-1">已選 {batchSel.size}</span>
          <Button size="sm" variant="outline" onClick={() => setTagDialogOpen(true)} disabled={!batchSel.size}>
            <Tag className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={async () => { await duplicateMany([...batchSel]); toast({ title: "已複製" }); exitBatch(); }} disabled={!batchSel.size}>
            <Copy className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="destructive" onClick={async () => { await removeMany([...batchSel]); toast({ title: "已刪除" }); exitBatch(); }} disabled={!batchSel.size}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-center text-sm text-muted-foreground py-12">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
          {bag.length === 0 ? "背包係空，撳 + 加入 Pokémon" : "無符合結果"}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {filtered.map((b) => {
            const data = findPokemon(b.pokemon_id);
            const selected = batchSel.has(b.id);
            return (
              <button
                key={b.id}
                onClick={() => batchMode ? toggleBatch(b.id) : setEditing(b)}
                className={cn(
                  "relative flex flex-col items-center gap-1 p-1.5 rounded-xl border bg-card hover:bg-secondary/40 active:scale-95 transition",
                  selected ? "border-primary ring-2 ring-primary" : "border-border",
                )}
              >
                {b.favorite && <span className="absolute top-0.5 left-1 text-xs">⭐</span>}
                {(b.tags?.length ?? 0) > 0 && <span className="absolute top-0.5 right-1 text-[8px] bg-primary text-primary-foreground rounded-full px-1">{b.tags!.length}</span>}
                <PokemonAvatar pokemonId={b.pokemon_id} size="sm" interactive={false} />
                <span className="text-[10px] truncate w-full text-center font-medium">
                  {b.nickname || localizedName(data, lang).split("-")[0]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <PokemonPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onPick={handleAdd} title="加入背包" />

      <FilterDialog
        open={filterOpen} onOpenChange={setFilterOpen}
        types={typeFilter} onTypesChange={setTypeFilter}
        move={moveFilter} onMoveChange={setMoveFilter}
        tags={tagFilter} onTagsChange={setTagFilter}
        allTags={allTags.map((t) => t.name)}
      />

      <BatchTagDialog
        open={tagDialogOpen} onOpenChange={setTagDialogOpen}
        allTags={allTags}
        onCreateTag={addTag}
        onDeleteTag={removeTag}
        onApply={async (selectedTags) => {
          await tagMany([...batchSel], selectedTags);
          toast({ title: "已貼上標籤" });
          exitBatch();
        }}
      />

      <BagEditor entry={editing} onClose={() => setEditing(null)} onSave={update} onDelete={remove} allTags={allTags} onCreateTag={addTag} />
    </div>
  );
};

const FilterDialog = ({
  open, onOpenChange, types, onTypesChange, move, onMoveChange, tags, onTagsChange, allTags,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  types: PokeType[]; onTypesChange: (v: PokeType[]) => void;
  move: string | null; onMoveChange: (m: string | null) => void;
  tags: string[]; onTagsChange: (v: string[]) => void;
  allTags: string[];
}) => {
  // local state — filter has no memory, reset when closed
  const [tab, setTab] = useState<"type" | "move" | "tag">("type");
  const [localTypes, setLocalTypes] = useState<PokeType[]>(types);
  const [localMove, setLocalMove] = useState<string | null>(move);
  const [localTags, setLocalTags] = useState<string[]>(tags);
  const [moveTypeSel, setMoveTypeSel] = useState<PokeType | null>(null);
  const [moves, setMoves] = useState<string[]>([]);
  const [moveQ, setMoveQ] = useState("");

  useEffect(() => {
    if (open) { setLocalTypes(types); setLocalMove(move); setLocalTags(tags); }
  }, [open]);

  useEffect(() => {
    if (moveTypeSel) fetchMovesForType(moveTypeSel).then(setMoves);
    else setMoves([]);
  }, [moveTypeSel]);

  const toggleType = (t: PokeType) =>
    setLocalTypes(localTypes.includes(t) ? localTypes.filter((x) => x !== t) : [...localTypes, t]);
  const toggleTag = (t: string) =>
    setLocalTags(localTags.includes(t) ? localTags.filter((x) => x !== t) : [...localTags, t]);

  const filteredMoves = moves.filter((m) => m.includes(moveQ.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onTypesChange([]); onMoveChange(null); onTagsChange([]); } onOpenChange(o); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>篩選</DialogTitle></DialogHeader>
        <div className="flex gap-1.5">
          <Button size="sm" variant={tab === "type" ? "default" : "outline"} className="flex-1" onClick={() => setTab("type")}>屬性</Button>
          <Button size="sm" variant={tab === "move" ? "default" : "outline"} className="flex-1" onClick={() => setTab("move")}>技能</Button>
          <Button size="sm" variant={tab === "tag" ? "default" : "outline"} className="flex-1" onClick={() => setTab("tag")}>標籤</Button>
        </div>
        {tab === "type" && (
          <div>
            <p className="text-[10px] text-muted-foreground mb-2">多選 = 包含任一</p>
            <div className="grid grid-cols-3 gap-1.5">
              {TYPES.map((t) => (
                <button key={t} onClick={() => toggleType(t)}
                  className={cn("text-[11px] px-2 py-1.5 rounded-md border transition",
                    localTypes.includes(t) ? "ring-2 ring-primary" : "opacity-60")}
                  style={{ backgroundColor: TYPE_COLORS[t], color: "white", borderColor: TYPE_COLORS[t] }}>
                  {TYPE_ZH[t]}
                </button>
              ))}
            </div>
          </div>
        )}
        {tab === "move" && (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground">點擊屬性查看技能</p>
            <div className="grid grid-cols-3 gap-1.5">
              {TYPES.map((t) => (
                <button key={t} onClick={() => setMoveTypeSel(t)}
                  className={cn("text-[11px] px-2 py-1.5 rounded-md border transition",
                    localMove && "" )}
                  style={{ backgroundColor: TYPE_COLORS[t], color: "white", borderColor: TYPE_COLORS[t] }}>
                  {TYPE_ZH[t]}
                </button>
              ))}
            </div>
            {localMove && <p className="text-[10px]">已選技能：<b>{prettyName(localMove)}</b> <button onClick={() => setLocalMove(null)} className="text-destructive ml-1">清除</button></p>}
            <Dialog open={!!moveTypeSel} onOpenChange={(o) => !o && setMoveTypeSel(null)}>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>{moveTypeSel ? `${TYPE_ZH[moveTypeSel]} 技能` : ""}</DialogTitle></DialogHeader>
                <Input placeholder="搜索技能…" value={moveQ} onChange={(e) => setMoveQ(e.target.value)} />
                <div className="max-h-[55vh] overflow-y-auto space-y-0.5">
                  {filteredMoves.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">載入中或無資料…</p>}
                  {filteredMoves.slice(0, 300).map((m) => (
                    <button key={m} onClick={() => { setLocalMove(m); setMoveTypeSel(null); }}
                      className={cn("w-full text-left text-xs px-2 py-1.5 rounded hover:bg-secondary",
                        localMove === m && "bg-primary text-primary-foreground")}>
                      {prettyName(m)}
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
        {tab === "tag" && (
          <div>
            {allTags.length === 0
              ? <p className="text-xs text-muted-foreground text-center py-6">仲未有標籤，去批量功能新增</p>
              : (
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((t) => (
                    <button key={t} onClick={() => toggleTag(t)}
                      className={cn("text-[11px] px-2.5 py-1 rounded-full border transition",
                        localTags.includes(t) ? "bg-primary text-primary-foreground border-primary" : "bg-card")}>
                      #{t}
                    </button>
                  ))}
                </div>
              )}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => { onTypesChange([]); onMoveChange(null); onTagsChange([]); onOpenChange(false); }}>清除</Button>
          <Button className="flex-1" onClick={() => { onTypesChange(localTypes); onMoveChange(localMove); onTagsChange(localTags); onOpenChange(false); }}>套用</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const BatchTagDialog = ({
  open, onOpenChange, allTags, onCreateTag, onDeleteTag, onApply,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  allTags: { id: string; name: string }[];
  onCreateTag: (name: string) => Promise<void>;
  onDeleteTag: (id: string) => Promise<void>;
  onApply: (tags: string[]) => Promise<void>;
}) => {
  const [sel, setSel] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  useEffect(() => { if (open) setSel([]); }, [open]);
  const toggle = (n: string) => setSel(sel.includes(n) ? sel.filter((x) => x !== n) : [...sel, n]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>貼上標籤</DialogTitle></DialogHeader>
        <div className="flex gap-2">
          <Input placeholder="新增標籤名…" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Button onClick={async () => { await onCreateTag(newName); setNewName(""); }}>新增</Button>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
          {allTags.length === 0 && <p className="text-xs text-muted-foreground">仲未有標籤</p>}
          {allTags.map((t) => (
            <div key={t.id} className="flex items-center gap-1">
              <button onClick={() => toggle(t.name)}
                className={cn("text-[11px] px-2.5 py-1 rounded-full border",
                  sel.includes(t.name) ? "bg-primary text-primary-foreground border-primary" : "bg-card")}>
                #{t.name}
              </button>
              <button onClick={() => onDeleteTag(t.id)} className="text-[10px] text-destructive">×</button>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button disabled={!sel.length} onClick={async () => { await onApply(sel); onOpenChange(false); }}>貼上 {sel.length} 個</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const BagEditor = ({
  entry, onClose, onSave, onDelete, allTags, onCreateTag,
}: {
  entry: BagPokemon | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<BagPokemon>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  allTags: { id: string; name: string }[];
  onCreateTag: (name: string) => Promise<void>;
}) => {
  const [draft, setDraft] = useState<BagPokemon | null>(entry);
  const [moves, setMoves] = useState<string[]>([]);
  const [movePickerIdx, setMovePickerIdx] = useState<number | null>(null);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const { toast } = useToast();
  const { lang } = useT();

  useEffect(() => {
    if (entry) {
      setDraft({ ...entry, tags: entry.tags ?? [] });
      fetchPokemon(entry.pokemon_id).then((d) => setMoves(d?.moves ?? []));
    }
  }, [entry?.id]);

  if (!entry || !draft) return null;
  const data = findPokemon(draft.pokemon_id);
  if (!data) return null;

  const evTotal = Object.values(draft.evs).reduce((a, b) => a + b, 0);
  const slotMoves = draft.moves ?? [];
  const draftTags = draft.tags ?? [];

  const updateEv = (k: StatKey, v: number) => {
    const others = (Object.keys(draft.evs) as StatKey[]).filter((x) => x !== k).reduce((s, x) => s + draft.evs[x], 0);
    const max = Math.min(EV_INDIVIDUAL_CAP, EV_TOTAL_CAP - others);
    setDraft({ ...draft, evs: { ...draft.evs, [k]: Math.min(max, Math.max(0, Math.round(v))) } });
  };

  const setMoveAt = (i: number, m: string | null) => {
    const next = [...slotMoves];
    while (next.length <= i) next.push("");
    next[i] = m ?? "";
    setDraft({ ...draft, moves: next });
  };

  const toggleTag = (n: string) =>
    setDraft({ ...draft, tags: draftTags.includes(n) ? draftTags.filter((x) => x !== n) : [...draftTags, n] });

  const handleSave = async () => {
    try {
      await onSave(draft.id, {
        nickname: draft.nickname, ability: draft.ability,
        nature: draft.nature, evs: draft.evs,
        moves: (draft.moves ?? []).filter(Boolean),
        favorite: draft.favorite,
        tags: draftTags,
      } as any);
      toast({ title: "已儲存" });
      onClose();
    } catch (e: any) { toast({ title: "失敗", description: e.message, variant: "destructive" }); }
  };

  return (
    <Sheet open={!!entry} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="h-[92vh] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <PokemonAvatar pokemonId={draft.pokemon_id} size="sm" />
            <span className="flex-1 text-left">{draft.nickname || localizedName(data, lang)}</span>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <Field label="暱稱">
            <Input value={draft.nickname ?? ""} onChange={(e) => setDraft({ ...draft, nickname: e.target.value })} placeholder={localizedName(data, lang)} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="特性">
              <Select value={draft.ability ?? ""} onValueChange={(v) => setDraft({ ...draft, ability: v })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{data.abilities.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="性格">
              <Select value={draft.nature} onValueChange={(v) => setDraft({ ...draft, nature: v })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">{NATURES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="技能（4 個）">
            <div className="grid grid-cols-2 gap-1.5">
              {[0, 1, 2, 3].map((i) => {
                const m = slotMoves[i];
                return (
                  <button key={i} onClick={() => setMovePickerIdx(i)}
                    className="h-9 text-xs rounded-md border border-input bg-background flex items-center justify-between px-2 active:scale-95">
                    <span className={cn("truncate", !m && "text-muted-foreground")}>
                      {m ? prettyName(m) : `技能 ${i + 1}`}
                    </span>
                    {m && <X className="w-3 h-3 shrink-0 opacity-60" onClick={(e) => { e.stopPropagation(); setMoveAt(i, null); }} />}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="標籤">
            <div className="flex flex-wrap gap-1">
              {draftTags.length === 0 && <span className="text-[10px] text-muted-foreground">未貼標籤</span>}
              {draftTags.map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1">
                  #{t}
                  <button onClick={() => toggleTag(t)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </Field>

          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">努力值</span>
              <span className="font-mono text-muted-foreground">{evTotal}/{EV_TOTAL_CAP}</span>
            </div>
            {STATS.map(({ key, label }) => {
              const ev = draft.evs[key];
              const finalStat = key === "hp"
                ? calcHp(data.baseHp, draft.ivs.hp, ev, draft.level)
                : key === "spe"
                  ? calcStat(data.baseSpeed, draft.ivs.spe, ev, speedNatureMod(draft.nature as any))
                  : null;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-9 text-[11px] text-muted-foreground">{label}</span>
                  <Slider value={[ev]} min={0} max={EV_INDIVIDUAL_CAP} step={1}
                    onValueChange={([v]) => updateEv(key, v)} className="flex-1" />
                  <span className="w-9 text-right text-[11px] font-mono">{ev}</span>
                  {finalStat !== null && <span className="w-10 text-right text-[11px] font-mono text-primary">{finalStat}</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-3 border-t border-border flex gap-2 items-center">
          <Button variant="outline" size="icon" onClick={async () => { await onDelete(draft.id); onClose(); }}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTagPickerOpen(true)}>
            <Tag className="w-4 h-4 mr-1" />標籤
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>取消</Button>
          <Button className="flex-1" onClick={handleSave}>儲存</Button>
        </div>

        <MovePickerDialog
          open={movePickerIdx !== null}
          onOpenChange={(o) => !o && setMovePickerIdx(null)}
          allMoves={moves}
          selected={slotMoves}
          onPick={(m) => { if (movePickerIdx !== null) setMoveAt(movePickerIdx, m); setMovePickerIdx(null); }}
        />

        <Dialog open={tagPickerOpen} onOpenChange={setTagPickerOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>選擇標籤</DialogTitle></DialogHeader>
            <div className="flex gap-2">
              <Input placeholder="新增標籤名…" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
              <Button onClick={async () => { await onCreateTag(newTagName); setNewTagName(""); }}>新增</Button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
              {allTags.length === 0 && <p className="text-xs text-muted-foreground">仲未有標籤</p>}
              {allTags.map((t) => (
                <button key={t.id} onClick={() => toggleTag(t.name)}
                  className={cn("text-[11px] px-2.5 py-1 rounded-full border",
                    draftTags.includes(t.name) ? "bg-primary text-primary-foreground border-primary" : "bg-card")}>
                  #{t.name}
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => setTagPickerOpen(false)}>完成</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
};

const MovePickerDialog = ({
  open, onOpenChange, allMoves, selected, onPick,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  allMoves: string[]; selected: string[];
  onPick: (m: string) => void;
}) => {
  const [q, setQ] = useState("");
  const list = allMoves.filter((m) => m.includes(q.toLowerCase()));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>選擇技能</DialogTitle></DialogHeader>
        <Input placeholder="搜索技能…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="max-h-[55vh] overflow-y-auto space-y-1">
          {list.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">無資料</p>}
          {list.slice(0, 200).map((m) => {
            const used = selected.includes(m);
            return (
              <button key={m} disabled={used} onClick={() => onPick(m)}
                className={cn("w-full text-left text-sm px-3 py-2 rounded hover:bg-secondary",
                  used && "opacity-40")}>
                {prettyName(m)}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
    {children}
  </div>
);

export default Bag;
