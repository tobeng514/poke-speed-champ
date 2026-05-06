import { useEffect, useMemo, useState } from "react";
import {
  POKEMON, calcStat, calcHp, stageMultiplier, speedNatureMod, findPokemon,
  type PokemonData,
} from "@/data/pokemon";
import type { TeamSlot } from "@/types/team";
import { emptySlot } from "@/types/team";
import { useTeams } from "@/hooks/useTeams";
import { localizedName } from "@/lib/pokemonName";
import { useT } from "@/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Sun, CloudRain, Wind, Snowflake, Repeat2, RotateCcw, Users, ChevronDown, Camera, Image as ImageIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

type Weather = "none" | "sun" | "rain" | "sand" | "snow";
type Side = "ally" | "enemy";

interface BattleSlot extends TeamSlot {
  stage: number;
  scarfOverride: boolean; // when true, treat as scarf regardless of held item
}

const toBattle = (s: TeamSlot): BattleSlot => ({ ...s, stage: 0, scarfOverride: s.item === "Choice Scarf" });
const emptyBattleTeam = (): BattleSlot[] => Array.from({ length: 6 }, () => toBattle(emptySlot()));
const STAGES = [6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6];

interface Row {
  slot: BattleSlot;
  data: PokemonData;
  side: Side;
  slotIdx: number;
  realSpeed: number;
  scarfSpeed: number | null;
  weatherSpeed: number;
  isScarf: boolean;
}

const PokeSpeedChamp = () => {
  const { teams, battleTeam, setActiveTeam } = useTeams();
  const { toast } = useToast();
  const { lang } = useT();
  const notImpl = (label: string) => toast({ title: `${label}（即將推出）` });
  const [ally, setAlly] = useState<BattleSlot[]>(emptyBattleTeam());
  const [enemy, setEnemy] = useState<BattleSlot[]>(emptyBattleTeam());
  const [allyTW, setAllyTW] = useState(false);
  const [enemyTW, setEnemyTW] = useState(false);
  const [trickRoom, setTrickRoom] = useState(false);
  const [weather, setWeather] = useState<Weather>("none");
  const [teamSheet, setTeamSheet] = useState<Side | null>(null);
  const [quickEdit, setQuickEdit] = useState<{ side: Side; idx: number } | null>(null);

  // Load active battle team into ally side whenever it changes.
  useEffect(() => {
    if (battleTeam) {
      const slots = battleTeam.slots.map(toBattle);
      while (slots.length < 6) slots.push(toBattle(emptySlot()));
      setAlly(slots.slice(0, 6));
    }
  }, [battleTeam?.id]);

  const updateSlot = (side: Side, idx: number, patch: Partial<BattleSlot>) => {
    const setter = side === "ally" ? setAlly : setEnemy;
    setter((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const reset = () => {
    setAlly(battleTeam ? battleTeam.slots.map(toBattle).concat(emptyBattleTeam()).slice(0, 6) : emptyBattleTeam());
    setEnemy(emptyBattleTeam());
    setAllyTW(false);
    setEnemyTW(false);
    setTrickRoom(false);
    setWeather("none");
  };

  const toggleWeather = (w: Weather) => setWeather((cur) => (cur === w ? "none" : w));

  const rows = useMemo<Row[]>(() => {
    const build = (slots: BattleSlot[], side: Side): Row[] =>
      slots
        .map((s, slotIdx) => ({ s, slotIdx }))
        .filter(({ s }) => s.id)
        .map(({ s, slotIdx }) => {
          const data = findPokemon(s.id)!;
          const baseSpd = calcStat(data.baseSpeed, s.ivs.spe, s.evs.spe, speedNatureMod(s.nature ?? "Hardy"));
          const real = Math.floor(baseSpd * stageMultiplier(s.stage));
          const isScarf = s.scarfOverride || s.item === "Choice Scarf";
          const scarfVal = Math.floor(real * 1.5);
          let wSpd = isScarf ? scarfVal : real;
          const matched =
            (weather === "sun" && data.weatherAbility === "Chlorophyll" && s.ability === "Chlorophyll") ||
            (weather === "rain" && data.weatherAbility === "Swift Swim" && s.ability === "Swift Swim") ||
            (weather === "sand" && data.weatherAbility === "Sand Rush" && s.ability === "Sand Rush") ||
            (weather === "snow" && data.weatherAbility === "Slush Rush" && s.ability === "Slush Rush");
          if (matched) wSpd = Math.floor(wSpd * 2);
          const tw = side === "ally" ? allyTW : enemyTW;
          if (tw) wSpd = Math.floor(wSpd * 2);
          return {
            slot: s, data, side, slotIdx, realSpeed: real,
            scarfSpeed: isScarf ? scarfVal : null,
            weatherSpeed: wSpd,
            isScarf,
          };
        });
    const all = [...build(ally, "ally"), ...build(enemy, "enemy")];
    all.sort((a, b) => (trickRoom ? a.weatherSpeed - b.weatherSpeed : b.weatherSpeed - a.weatherSpeed));
    return all;
  }, [ally, enemy, allyTW, enemyTW, trickRoom, weather]);

  const allyCount = ally.filter((s) => s.id).length;
  const enemyCount = enemy.filter((s) => s.id).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">對戰</h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">
              {battleTeam ? `當前隊伍：${battleTeam.name}` : "未設置當前隊伍"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => notImpl("拍照識別")} className="h-9 px-2" aria-label="拍照">
              <Camera className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => notImpl("匯入截圖")} className="h-9 px-2" aria-label="匯入截圖">
              <ImageIcon className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={reset} className="h-9 px-2">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="px-4 pb-3 grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className="rounded-xl border-2 border-ally/40 bg-ally-bg/40 p-2.5 flex items-center justify-between active:scale-95 transition-transform">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-ally" />
                  <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[7rem]">
                    {battleTeam ? battleTeam.name : "我方"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-mono font-bold">{allyCount}/6</span>
                  <ChevronDown className="w-4 h-4 opacity-60" />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-2">
              <button
                className="w-full text-left text-sm px-3 py-2 rounded hover:bg-secondary"
                onClick={() => setTeamSheet("ally")}
              >
                ✏️ 編輯個別 Pokémon
              </button>
              <div className="h-px bg-border my-1" />
              <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">快速切換隊伍</p>
              {teams.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">未有隊伍</p>
              ) : (
                <ul className="max-h-56 overflow-y-auto">
                  {teams.map((t) => (
                    <li key={t.id}>
                      <button
                        className={cn(
                          "w-full text-left text-sm px-3 py-2 rounded hover:bg-secondary flex items-center justify-between",
                          battleTeam?.id === t.id && "text-primary font-semibold"
                        )}
                        onClick={() => setActiveTeam("battle", t.id)}
                      >
                        <span className="truncate">{t.name}</span>
                        {battleTeam?.id === t.id && <span className="text-[10px]">✓</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </PopoverContent>
          </Popover>
          <TeamChip side="enemy" count={enemyCount} onClick={() => setTeamSheet("enemy")} />
        </div>
      </header>

      <main className="flex-1 px-3 py-3 pb-[200px]">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Speed Tier</h2>
          <span className="text-[10px] text-muted-foreground">
            {trickRoom ? "Trick Room ↑" : "Fastest ↓"}
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
            撳上面隊伍按鈕加 Pokémon
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((r, i) => (
              <li
                key={`${r.side}-${r.slotIdx}-${r.data.id}`}
                onClick={() => setQuickEdit({ side: r.side, idx: r.slotIdx })}
                className={cn(
                  "rounded-xl border p-3 flex items-center gap-3 active:scale-[0.99] transition-transform cursor-pointer",
                  r.side === "ally" ? "bg-ally-bg/50 border-ally/30" : "bg-enemy-bg/50 border-enemy/30"
                )}
              >
                <div className={cn("text-xs font-mono w-6 text-center", r.side === "ally" ? "text-ally" : "text-enemy")}>
                  #{i + 1}
                </div>
                <div className="w-12 h-12 rounded-lg bg-secondary/40 flex items-center justify-center text-xl font-bold text-muted-foreground shrink-0">?</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-sm truncate">{r.slot.nickname || localizedName(r.data, lang)}</span>
                    {r.slot.stage !== 0 && (
                      <span className={cn("text-[10px] px-1 py-0.5 rounded font-mono", r.slot.stage > 0 ? "bg-ally/20 text-ally" : "bg-enemy/20 text-enemy")}>
                        {r.slot.stage > 0 ? `+${r.slot.stage}` : r.slot.stage}
                      </span>
                    )}
                    {r.isScarf && <span className="text-[10px] px-1 py-0.5 rounded font-mono bg-primary/20 text-primary">SCF</span>}
                  </div>
                  <div className="flex gap-2 text-[10px] text-muted-foreground font-mono mt-0.5">
                    <span>Real {r.realSpeed}</span>
                    {r.scarfSpeed !== null && <span>· Scf {r.scarfSpeed}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono leading-none">{r.weatherSpeed}</div>
                  <div className="text-[9px] text-muted-foreground uppercase mt-0.5">Speed</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <nav className="fixed bottom-[calc(env(safe-area-inset-bottom)+72px)] inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="px-3 py-2.5 space-y-2 max-w-md mx-auto">
          <div className="grid grid-cols-4 gap-1.5">
            <WeatherBtn active={weather === "sun"} onClick={() => toggleWeather("sun")} variant="sun" icon={<Sun className="w-4 h-4" />} label="Sun" />
            <WeatherBtn active={weather === "rain"} onClick={() => toggleWeather("rain")} variant="rain" icon={<CloudRain className="w-4 h-4" />} label="Rain" />
            <WeatherBtn active={weather === "sand"} onClick={() => toggleWeather("sand")} variant="sand" icon={<Wind className="w-4 h-4" />} label="Sand" />
            <WeatherBtn active={weather === "snow"} onClick={() => toggleWeather("snow")} variant="snow" icon={<Snowflake className="w-4 h-4" />} label="Snow" />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <FieldBtn active={allyTW} onClick={() => setAllyTW((v) => !v)} className="data-[active=true]:bg-ally data-[active=true]:text-ally-foreground data-[active=true]:border-ally">
              <Wind className="w-3.5 h-3.5" /> Ally TW
            </FieldBtn>
            <FieldBtn active={enemyTW} onClick={() => setEnemyTW((v) => !v)} className="data-[active=true]:bg-enemy data-[active=true]:text-enemy-foreground data-[active=true]:border-enemy">
              <Wind className="w-3.5 h-3.5" /> Opp TW
            </FieldBtn>
            <FieldBtn active={trickRoom} onClick={() => setTrickRoom((v) => !v)} className="data-[active=true]:bg-trickroom data-[active=true]:text-white data-[active=true]:border-trickroom">
              <Repeat2 className="w-3.5 h-3.5" /> T.Room
            </FieldBtn>
          </div>
        </div>
      </nav>

      <Sheet open={teamSheet !== null} onOpenChange={(o) => !o && setTeamSheet(null)}>
        <SheetContent side="bottom" className="h-[88vh] p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b border-border">
            <SheetTitle className={cn("text-base", teamSheet === "ally" ? "text-ally" : "text-enemy")}>
              {teamSheet === "ally" ? "我方隊伍" : "對手隊伍"}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {teamSheet && (teamSheet === "ally" ? ally : enemy).map((s, i) => (
              <BattleSlotEditor
                key={i}
                slot={s}
                onChange={(p) => updateSlot(teamSheet, i, p)}
                accent={teamSheet}
              />
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const TeamChip = ({ side, count, onClick }: { side: Side; count: number; onClick: () => void }) => {
  const isAlly = side === "ally";
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl border-2 p-2.5 flex items-center justify-between active:scale-95 transition-transform",
        isAlly ? "border-ally/40 bg-ally-bg/40" : "border-enemy/40 bg-enemy-bg/40"
      )}
    >
      <div className="flex items-center gap-2">
        <Users className={cn("w-4 h-4", isAlly ? "text-ally" : "text-enemy")} />
        <span className="text-xs font-bold uppercase tracking-wider">{isAlly ? "我方" : "對手"}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-mono font-bold">{count}/6</span>
        <ChevronDown className="w-4 h-4 opacity-60" />
      </div>
    </button>
  );
};

const BattleSlotEditor = ({
  slot, onChange, accent,
}: {
  slot: BattleSlot; onChange: (patch: Partial<BattleSlot>) => void; accent: Side;
}) => {
  const data = findPokemon(slot.id);
  return (
    <div className={cn(
      "rounded-xl border p-3 space-y-2",
      accent === "ally" ? "border-ally/30 bg-ally-bg/20" : "border-enemy/30 bg-enemy-bg/20"
    )}>
      <Select value={slot.id ?? ""} onValueChange={(v) => {
        const p = findPokemon(v);
        onChange({ id: v, ability: p?.abilities[0] });
      }}>
        <SelectTrigger className="h-11">
          <SelectValue placeholder="選擇 Pokémon" />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {POKEMON.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {data && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground px-1">階段</label>
              <Select value={String(slot.stage)} onValueChange={(v) => onChange({ stage: Number(v) })}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGES.map((st) => <SelectItem key={st} value={String(st)}>{st > 0 ? `+${st}` : st}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground px-1">圍巾</label>
              <div className="h-10 rounded-md border border-input flex items-center justify-between px-3 bg-background">
                <span className="text-xs text-muted-foreground">{slot.scarfOverride || slot.item === "Choice Scarf" ? "On" : "Off"}</span>
                <Switch
                  checked={slot.scarfOverride || slot.item === "Choice Scarf"}
                  onCheckedChange={(v) => onChange({ scarfOverride: v })}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const WEATHER_STYLES: Record<string, string> = {
  sun: "bg-weather-sun/20 text-weather-sun border-weather-sun",
  rain: "bg-weather-rain/20 text-weather-rain border-weather-rain",
  sand: "bg-weather-sand/20 text-weather-sand border-weather-sand",
  snow: "bg-weather-snow/20 text-weather-snow border-weather-snow",
};

const WeatherBtn = ({ active, onClick, icon, label, variant }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg text-[10px] font-medium border transition-all active:scale-95",
      "border-border bg-secondary/50 text-muted-foreground",
      active && WEATHER_STYLES[variant]
    )}
  >
    {icon}{label}
  </button>
);

const FieldBtn = ({ active, onClick, children, className }: any) => (
  <button
    data-active={active}
    onClick={onClick}
    className={cn(
      "flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-semibold border transition-all active:scale-95 bg-secondary/40 text-muted-foreground border-border",
      className
    )}
  >
    {children}
  </button>
);

export default PokeSpeedChamp;
