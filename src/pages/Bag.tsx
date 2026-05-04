import { useMemo, useState } from "react";
import { useBag, type BagPokemon } from "@/hooks/useBag";
import { POKEMON, NATURES, ITEMS, findPokemon, calcHp, calcStat, speedNatureMod, EV_TOTAL_CAP, EV_INDIVIDUAL_CAP } from "@/data/pokemon";
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
import { Plus, Filter, Search, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type StatKey = "hp" | "atk" | "def" | "spa" | "spd" | "spe";
const STATS: { key: StatKey; label: string }[] = [
  { key: "hp", label: "HP" }, { key: "atk", label: "Atk" }, { key: "def", label: "Def" },
  { key: "spa", label: "SpA" }, { key: "spd", label: "SpD" }, { key: "spe", label: "Spe" },
];

const Bag = () => {
  const { bag, loading, add, update, remove } = useBag();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState<BagPokemon | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PokeType[]>([]);
  const [moveFilter, setMoveFilter] = useState<string[]>([]); // for now: search-only; UI present
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return bag.filter((b) => {
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
  }, [bag, search, typeFilter]);

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
        types={typeFilter} onTypesChange={setTypeFilter}
        moves={moveFilter} onMovesChange={setMoveFilter} />

      <BagEditor entry={editing} onClose={() => setEditing(null)} onSave={update} onDelete={remove} />
    </div>
  );
};

const FilterDialog = ({
  open, onOpenChange, types, onTypesChange,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  types: PokeType[]; onTypesChange: (v: PokeType[]) => void;
  moves: string[]; onMovesChange: (v: string[]) => void;
}) => {
  const toggle = (t: PokeType) =>
    onTypesChange(types.includes(t) ? types.filter((x) => x !== t) : [...types, t]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>篩選</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold mb-2">屬性（多選 = 包含任一）</p>
            <div className="grid grid-cols-3 gap-1.5">
              {TYPES.map((t) => (
                <button key={t} onClick={() => toggle(t)}
                  className={cn("text-[11px] px-2 py-1.5 rounded-md border transition",
                    types.includes(t) ? "ring-2 ring-primary" : "opacity-60")}
                  style={{ backgroundColor: TYPE_COLORS[t], color: "white", borderColor: TYPE_COLORS[t] }}>
                  {TYPE_ZH[t]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold mb-2">技能篩選</p>
            <Input placeholder="輸入技能名（即將推出）" disabled />
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
              {TYPES.map((t) => (
                <div key={t} className="text-[10px] px-2 py-1 rounded-md text-white shrink-0 opacity-60"
                  style={{ backgroundColor: TYPE_COLORS[t] }}>{TYPE_ZH[t]}</div>
              ))}
            </div>
          </div>
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
  const { toast } = useToast();

  // Sync when entry changes
  if (entry && (!draft || draft.id !== entry.id)) setDraft(entry);
  if (!entry || !draft) return null;
  const data = findPokemon(draft.pokemon_id);
  if (!data) return null;

  const evTotal = Object.values(draft.evs).reduce((a, b) => a + b, 0);

  const updateEv = (k: StatKey, v: number) => {
    const others = (Object.keys(draft.evs) as StatKey[]).filter((x) => x !== k).reduce((s, x) => s + draft.evs[x], 0);
    const max = Math.min(EV_INDIVIDUAL_CAP, EV_TOTAL_CAP - others);
    setDraft({ ...draft, evs: { ...draft.evs, [k]: Math.min(max, Math.max(0, Math.round(v))) } });
  };

  const handleSave = async () => {
    try {
      await onSave(draft.id, {
        nickname: draft.nickname, ability: draft.ability, item: draft.item,
        nature: draft.nature, evs: draft.evs,
      });
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
            <span>{draft.nickname || data.name}</span>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <Field label="暱稱">
            <Input value={draft.nickname ?? ""} onChange={(e) => setDraft({ ...draft, nickname: e.target.value })} placeholder={data.name} />
          </Field>
          <div className="grid grid-cols-3 gap-2">
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
            <Field label="道具">
              <Select value={draft.item ?? "None"} onValueChange={(v) => setDraft({ ...draft, item: v })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">{ITEMS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>

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
      </SheetContent>
    </Sheet>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
    {children}
  </div>
);

export default Bag;
