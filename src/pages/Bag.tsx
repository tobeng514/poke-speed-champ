import { useEffect, useMemo, useState } from "react";
import { useBag, type BagPokemon } from "@/hooks/useBag";
import { POKEMON, NATURES, findPokemon, calcHp, calcStat, speedNatureMod, EV_TOTAL_CAP, EV_INDIVIDUAL_CAP } from "@/data/pokemon";
import { POKEMON_TYPES } from "@/data/pokemonTypes";
import { TYPES, TYPE_COLORS, TYPE_ZH, type PokeType } from "@/data/types";
import { fetchPokemon, prettyName } from "@/lib/pokeapi";
import PokemonAvatar from "@/components/PokemonAvatar";
import PokemonPickerDialog from "@/components/PokemonPickerDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter, Search, Trash2, X, ArrowUpDown } from "lucide-react";
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
  { v: "favorite", l: "我的最愛" },
  { v: "added", l: "加入時間" },
] as const;
type SortKey = typeof SORT_OPTIONS[number]["v"];

const Bag = () => {
  const { bag, loading, add, update, remove } = useBag();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState<BagPokemon | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PokeType[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>(() => {
    const v = localStorage.getItem("bag.sort") as SortKey | null;
    return (v && SORT_OPTIONS.some((o) => o.v === v)) ? v : "no";
  });
  const { toast } = useToast();

  useEffect(() => { localStorage.setItem("bag.sort", sortKey); }, [sortKey]);

  const speciesIndex = useMemo(() => {
    const m = new Map<string, number>();
    POKEMON.forEach((p, i) => m.set(p.id, i));
    return m;
  }, []);

  const filtered = useMemo(() => {
    let arr = bag.filter((b) => {
      const data = findPokemon(b.pokemon_id);
      if (!data) return false;
      const name = (b.nickname || data.name).toLowerCase();
      if (search && !name.includes(search.toLowerCase()) && !data.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter.length > 0) {
        const t = POKEMON_TYPES[b.pokemon_id] ?? [];
        if (!typeFilter.some((tf) => t.includes(tf))) return false;
      }
      return true;
    });
    if (sortKey === "no") {
      arr = [...arr].sort((a, b) => (speciesIndex.get(a.pokemon_id) ?? 9999) - (speciesIndex.get(b.pokemon_id) ?? 9999));
    } else if (sortKey === "type") {
      arr = [...arr].sort((a, b) => (POKEMON_TYPES[a.pokemon_id]?.[0] ?? "").localeCompare(POKEMON_TYPES[b.pokemon_id]?.[0] ?? ""));
    } else if (sortKey === "favorite") {
      arr = [...arr].sort((a, b) => Number(b.favorite ?? false) - Number(a.favorite ?? false));
    } else if (sortKey === "added") {
      arr = [...arr].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    }
    return arr;
  }, [bag, search, typeFilter, sortKey, speciesIndex]);

  const handleAdd = async (id: string) => {
    try { await add(id); toast({ title: "已加入背包" }); }
    catch (e: any) { toast({ title: "失敗", description: e.message, variant: "destructive" }); }
  };

  return (
    <div className="px-4 pb-4">
      <div className="py-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="搜索名字…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-auto h-10 px-2 gap-1">
            <ArrowUpDown className="w-4 h-4" />
          </SelectTrigger>
          <SelectContent align="end">
            {SORT_OPTIONS.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => setFilterOpen(true)}>
          <Filter className="w-4 h-4" />
        </Button>
        <Button size="icon" onClick={() => setPickerOpen(true)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {typeFilter.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {typeFilter.map((t) => (
            <button key={t} onClick={() => setTypeFilter(typeFilter.filter((x) => x !== t))}
              className="text-[10px] px-2 py-0.5 rounded-full text-white flex items-center gap-1"
              style={{ backgroundColor: TYPE_COLORS[t] }}>
              {TYPE_ZH[t]} <X className="w-3 h-3" />
            </button>
          ))}
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
            return (
              <button key={b.id} onClick={() => setEditing(b)}
                className="flex flex-col items-center gap-1 p-1.5 rounded-xl border border-border bg-card hover:bg-secondary/40 active:scale-95 transition">
                <PokemonAvatar pokemonId={b.pokemon_id} size="sm" interactive={false} />
                <span className="text-[10px] truncate w-full text-center font-medium">
                  {b.nickname || data?.name.split("-")[0]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <PokemonPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onPick={handleAdd} title="加入背包" />

      <FilterDialog open={filterOpen} onOpenChange={setFilterOpen}
        types={typeFilter} onTypesChange={setTypeFilter} />

      <BagEditor entry={editing} onClose={() => setEditing(null)} onSave={update} onDelete={remove} />
    </div>
  );
};

const FilterDialog = ({
  open, onOpenChange, types, onTypesChange,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  types: PokeType[]; onTypesChange: (v: PokeType[]) => void;
}) => {
  // local state — filter has no memory, reset when closed
  const [localTypes, setLocalTypes] = useState<PokeType[]>(types);
  useEffect(() => { if (open) setLocalTypes(types); }, [open]);

  const toggle = (t: PokeType) =>
    setLocalTypes(localTypes.includes(t) ? localTypes.filter((x) => x !== t) : [...localTypes, t]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onTypesChange([]); } onOpenChange(o); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>篩選</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold mb-2">屬性（多選 = 包含任一）</p>
            <div className="grid grid-cols-3 gap-1.5">
              {TYPES.map((t) => (
                <button key={t} onClick={() => toggle(t)}
                  className={cn("text-[11px] px-2 py-1.5 rounded-md border transition",
                    localTypes.includes(t) ? "ring-2 ring-primary" : "opacity-60")}
                  style={{ backgroundColor: TYPE_COLORS[t], color: "white", borderColor: TYPE_COLORS[t] }}>
                  {TYPE_ZH[t]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => { onTypesChange([]); onOpenChange(false); }}>清除</Button>
          <Button className="flex-1" onClick={() => { onTypesChange(localTypes); onOpenChange(false); }}>套用</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const BagEditor = ({
  entry, onClose, onSave, onDelete,
}: {
  entry: BagPokemon | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<BagPokemon>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const [draft, setDraft] = useState<BagPokemon | null>(entry);
  const [moves, setMoves] = useState<string[]>([]);
  const [movePickerIdx, setMovePickerIdx] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (entry) {
      setDraft(entry);
      fetchPokemon(entry.pokemon_id).then((d) => setMoves(d?.moves ?? []));
    }
  }, [entry?.id]);

  if (!entry || !draft) return null;
  const data = findPokemon(draft.pokemon_id);
  if (!data) return null;

  const evTotal = Object.values(draft.evs).reduce((a, b) => a + b, 0);
  const slotMoves = draft.moves ?? [];

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

  const handleSave = async () => {
    try {
      await onSave(draft.id, {
        nickname: draft.nickname, ability: draft.ability,
        nature: draft.nature, evs: draft.evs,
        moves: (draft.moves ?? []).filter(Boolean),
        favorite: draft.favorite,
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
            <span className="flex-1 text-left">{draft.nickname || data.name}</span>
            <button
              onClick={() => setDraft({ ...draft, favorite: !draft.favorite })}
              className="text-xl leading-none"
              aria-label="favorite"
            >
              {draft.favorite ? "⭐" : "☆"}
            </button>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <Field label="暱稱">
            <Input value={draft.nickname ?? ""} onChange={(e) => setDraft({ ...draft, nickname: e.target.value })} placeholder={data.name} />
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
        <div className="p-3 border-t border-border flex gap-2">
          <Button variant="outline" size="icon" onClick={async () => { await onDelete(draft.id); onClose(); }}>
            <Trash2 className="w-4 h-4 text-destructive" />
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
