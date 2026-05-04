import { useEffect, useState } from "react";
import { POKEMON, findPokemon, NATURES, ITEMS } from "@/data/pokemon";
import { POKEMON_TYPES } from "@/data/pokemonTypes";
import { TYPE_COLORS, TYPE_ZH, weaknessOf, type PokeType } from "@/data/types";
import { fetchPokemon, type ApiPokemon } from "@/lib/pokeapi";
import { useBag } from "@/hooks/useBag";
import PokemonAvatar from "@/components/PokemonAvatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus } from "lucide-react";

const Dex = () => {
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const list = POKEMON.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="px-4 pb-4">
      <div className="py-3 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="搜索 Pokémon…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
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
    </div>
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
