import { useEffect, useMemo, useState } from "react";
import { POKEMON, findPokemon, NATURES, ITEMS } from "@/data/pokemon";
import { POKEMON_TYPES } from "@/data/pokemonTypes";
import { TYPES, TYPE_COLORS, TYPE_ZH, weaknessOf, type PokeType } from "@/data/types";
import { fetchPokemon, type ApiPokemon } from "@/lib/pokeapi";
import { useBag } from "@/hooks/useBag";
import PokemonAvatar from "@/components/PokemonAvatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, ArrowUpDown, ArrowUp, ArrowDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { v: "no", l: "編號" },
  { v: "type", l: "屬性" },
  { v: "hp", l: "HP" },
  { v: "atk", l: "攻擊" },
  { v: "def", l: "防禦" },
  { v: "spa", l: "特攻" },
  { v: "spd", l: "特防" },
  { v: "spe", l: "速度" },
] as const;
type SortKey = typeof SORT_OPTIONS[number]["v"];

const Dex = () => {
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<PokeType[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>(() => {
    const v = localStorage.getItem("dex.sort") as SortKey | null;
    return (v && SORT_OPTIONS.some((o) => o.v === v)) ? v : "no";
  });
  const [sortAsc, setSortAsc] = useState<boolean>(() => localStorage.getItem("dex.sortAsc") !== "0");

  useEffect(() => { localStorage.setItem("dex.sort", sortKey); }, [sortKey]);
  useEffect(() => { localStorage.setItem("dex.sortAsc", sortAsc ? "1" : "0"); }, [sortAsc]);

  const list = useMemo(() => {
    let arr = POKEMON.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter.length > 0) {
      arr = arr.filter((p) => {
        const t = POKEMON_TYPES[p.id] ?? [];
        return typeFilter.some((tf) => t.includes(tf));
      });
    }
    if (sortKey === "type") {
      arr = [...arr].sort((a, b) => (POKEMON_TYPES[a.id]?.[0] ?? "").localeCompare(POKEMON_TYPES[b.id]?.[0] ?? ""));
    } else if (sortKey === "hp") arr = [...arr].sort((a, b) => b.baseHp - a.baseHp);
    else if (sortKey === "spe") arr = [...arr].sort((a, b) => b.baseSpeed - a.baseSpeed);
    if (!sortAsc) arr = [...arr].reverse();
    return arr;
  }, [search, typeFilter, sortKey, sortAsc]);

  return (
    <div className="px-4 pb-4">
      <div className="py-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="搜索 Pokémon…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
        <Button variant="outline" size="icon" onClick={() => setFilterOpen(true)}>
          <Filter className="w-4 h-4" />
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
      <div className="grid grid-cols-5 gap-2">
        {list.map((p) => (
          <button key={p.id} onClick={() => setOpenId(p.id)}
            className="flex flex-col items-center gap-1 p-1.5 rounded-xl border border-border bg-card hover:bg-secondary/40 active:scale-95 transition">
            <PokemonAvatar pokemonId={p.id} size="sm" interactive={false} />
            <span className="text-[10px] truncate w-full text-center">{p.name.split("-")[0]}</span>
          </button>
        ))}
      </div>
      <DexDetail pokemonId={openId} onClose={() => setOpenId(null)} />
      <DexFilterDialog open={filterOpen} onOpenChange={setFilterOpen}
        types={typeFilter} onTypesChange={setTypeFilter} />
    </div>
  );
};

const DexFilterDialog = ({
  open, onOpenChange, types, onTypesChange,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  types: PokeType[]; onTypesChange: (v: PokeType[]) => void;
}) => {
  const [local, setLocal] = useState<PokeType[]>(types);
  useEffect(() => { if (open) setLocal(types); }, [open]);
  const toggle = (t: PokeType) =>
    setLocal(local.includes(t) ? local.filter((x) => x !== t) : [...local, t]);
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onTypesChange([]); onOpenChange(o); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>篩選</DialogTitle></DialogHeader>
        <div>
          <p className="text-xs font-semibold mb-2">屬性（多選 = 包含任一）</p>
          <div className="grid grid-cols-3 gap-1.5">
            {TYPES.map((t) => (
              <button key={t} onClick={() => toggle(t)}
                className={cn("text-[11px] px-2 py-1.5 rounded-md border transition",
                  local.includes(t) ? "ring-2 ring-primary" : "opacity-60")}
                style={{ backgroundColor: TYPE_COLORS[t], color: "white", borderColor: TYPE_COLORS[t] }}>
                {TYPE_ZH[t]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => { onTypesChange([]); onOpenChange(false); }}>清除</Button>
          <Button className="flex-1" onClick={() => { onTypesChange(local); onOpenChange(false); }}>套用</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


const DexDetail = ({ pokemonId, onClose }: { pokemonId: string | null; onClose: () => void }) => {
  const [api, setApi] = useState<ApiPokemon | null>(null);
  const { add } = useBag();
  const { toast } = useToast();

  useEffect(() => {
    setApi(null);
    if (pokemonId) fetchPokemon(pokemonId).then(setApi);
  }, [pokemonId]);

  if (!pokemonId) return <Sheet open={false} onOpenChange={onClose}><SheetContent /></Sheet>;
  const data = findPokemon(pokemonId);
  if (!data) return null;
  const types = POKEMON_TYPES[pokemonId] ?? [];
  const { weak, resist, immune } = weaknessOf(types);

  // Recommendations (simple heuristics)
  const recommendedNature = data.baseSpeed >= 100 ? "Timid" : "Modest";
  const recommendedItem = "Choice Scarf";
  const recommendedEvs = "Spe 32 / SpA 32 / HP 2"; // 66 cap

  // Hard / easy matchups based on type chart vs all known POKEMON
  const matchups = POKEMON
    .filter((p) => p.id !== pokemonId)
    .map((p) => {
      const otherTypes = POKEMON_TYPES[p.id] ?? [];
      const myAttackEff = otherTypes.length ? Math.max(...types.map((t) => effOf(t, otherTypes))) : 1;
      const theirAttackEff = otherTypes.length
        ? Math.max(...otherTypes.map((t) => effOf(t, types))) : 1;
      return { p, score: myAttackEff - theirAttackEff };
    });
  const easy = [...matchups].sort((a, b) => b.score - a.score).slice(0, 5);
  const hard = [...matchups].sort((a, b) => a.score - b.score).slice(0, 5);

  return (
    <Sheet open={!!pokemonId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="h-[92vh] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-border">
          <SheetTitle>{data.name}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center gap-3">
            <PokemonAvatar pokemonId={pokemonId} size="xl" />
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap gap-1">
                {types.map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: TYPE_COLORS[t] }}>{TYPE_ZH[t]}</span>
                ))}
              </div>
              {api && (
                <div className="text-[11px] text-muted-foreground grid grid-cols-3 gap-x-2">
                  <span>HP {api.stats.hp}</span><span>Atk {api.stats.atk}</span><span>Def {api.stats.def}</span>
                  <span>SpA {api.stats.spa}</span><span>SpD {api.stats.spd}</span><span>Spe {api.stats.spe}</span>
                </div>
              )}
              {!api && <p className="text-[11px] text-muted-foreground">載入種族值中…</p>}
            </div>
          </div>

          <Button className="w-full" onClick={async () => {
            try { await add(pokemonId); toast({ title: "已加入背包" }); }
            catch (e: any) { toast({ title: "失敗", description: e.message, variant: "destructive" }); }
          }}>
            <Plus className="w-4 h-4" /> 新增至背包
          </Button>

          <Section title="推薦配置">
            <Row k="性格" v={recommendedNature} />
            <Row k="道具" v={recommendedItem} />
            <Row k="特性" v={data.abilities[0]} />
            <Row k="努力值" v={recommendedEvs} />
          </Section>

          <Section title="弱點屬性">
            <TypePills types={weak} />
            {weak.length === 0 && <p className="text-xs text-muted-foreground">無</p>}
          </Section>
          <Section title="抵抗屬性">
            <TypePills types={resist} />
            {resist.length === 0 && <p className="text-xs text-muted-foreground">無</p>}
          </Section>
          {immune.length > 0 && (
            <Section title="無效屬性"><TypePills types={immune} /></Section>
          )}

          <Section title="難以對抗">
            <MatchupList items={hard.map((x) => x.p)} />
          </Section>
          <Section title="易對抗">
            <MatchupList items={easy.map((x) => x.p)} />
          </Section>

          {api && api.moves.length > 0 && (
            <Section title="可習得技能（前 30）">
              <div className="flex flex-wrap gap-1">
                {api.moves.slice(0, 30).map((m) => (
                  <span key={m} className="text-[10px] px-2 py-0.5 rounded bg-secondary">{m}</span>
                ))}
              </div>
            </Section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const effOf = (atk: PokeType, defTypes: PokeType[]) => {
  const r = weaknessOf(defTypes);
  if (r.immune.includes(atk)) return 0;
  if (r.weak.includes(atk)) return 2;
  if (r.resist.includes(atk)) return 0.5;
  return 1;
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{title}</p>
    <div className="space-y-1">{children}</div>
  </div>
);
const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between text-xs"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>
);
const TypePills = ({ types }: { types: PokeType[] }) => (
  <div className="flex flex-wrap gap-1">
    {types.map((t) => (
      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full text-white"
        style={{ backgroundColor: TYPE_COLORS[t] }}>{TYPE_ZH[t]}</span>
    ))}
  </div>
);
const MatchupList = ({ items }: { items: typeof POKEMON }) => (
  <div className="grid grid-cols-5 gap-1.5">
    {items.map((p) => (
      <div key={p.id} className="flex flex-col items-center gap-0.5">
        <PokemonAvatar pokemonId={p.id} size="sm" interactive={false} />
        <span className="text-[9px] truncate w-full text-center">{p.name.split("-")[0]}</span>
      </div>
    ))}
  </div>
);

export default Dex;
