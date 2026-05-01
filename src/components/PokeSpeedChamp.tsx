import { useMemo, useState } from "react";
import { POKEMON, calcMaxSpeed, stageMultiplier, type PokemonData } from "@/data/pokemon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Sun, CloudRain, Wind, Snowflake, Repeat2, RotateCcw, Users, Settings2, ChevronDown } from "lucide-react";

type Weather = "none" | "sun" | "rain" | "sand" | "snow";
type Side = "ally" | "enemy";

interface Slot {
  id: string | null;
  stage: number;
  scarf: boolean;
}

const emptySlot = (): Slot => ({ id: null, stage: 0, scarf: false });
const emptyTeam = (): Slot[] => Array.from({ length: 6 }, emptySlot);
const STAGES = [6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6];

interface Row {
  slot: Slot;
  data: PokemonData;
  side: Side;
  realSpeed: number;
  scarfSpeed: number | null;
  weatherSpeed: number;
  finalSpeed: number;
}

const PokeSpeedChamp = () => {
  const [ally, setAlly] = useState<Slot[]>(emptyTeam());
  const [enemy, setEnemy] = useState<Slot[]>(emptyTeam());
  const [allyTW, setAllyTW] = useState(false);
  const [enemyTW, setEnemyTW] = useState(false);
  const [trickRoom, setTrickRoom] = useState(false);
  const [weather, setWeather] = useState<Weather>("none");
  const [teamSheet, setTeamSheet] = useState<Side | null>(null);

  const updateSlot = (side: Side, idx: number, patch: Partial<Slot>) => {
    const setter = side === "ally" ? setAlly : setEnemy;
    setter((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const reset = () => {
    setAlly(emptyTeam());
    setEnemy(emptyTeam());
    setAllyTW(false);
    setEnemyTW(false);
    setTrickRoom(false);
    setWeather("none");
  };

  const toggleWeather = (w: Weather) => setWeather((cur) => (cur === w ? "none" : w));

  const rows = useMemo<Row[]>(() => {
    const build = (slots: Slot[], side: Side): Row[] =>
      slots
        .filter((s) => s.id)
        .map((s) => {
          const data = POKEMON.find((p) => p.id === s.id)!;
          const max = calcMaxSpeed(data.baseSpeed);
          const real = Math.floor(max * stageMultiplier(s.stage));
          const scarfVal = Math.floor(real * 1.5);
          let wSpd = s.scarf ? scarfVal : real;
          const matched =
            (weather === "sun" && data.weatherAbility === "Chlorophyll") ||
            (weather === "rain" && data.weatherAbility === "Swift Swim") ||
            (weather === "sand" && data.weatherAbility === "Sand Rush") ||
            (weather === "snow" && data.weatherAbility === "Slush Rush");
          if (matched) wSpd = Math.floor(wSpd * 2);
          const tw = side === "ally" ? allyTW : enemyTW;
          const finalSpd = tw ? Math.floor(wSpd * 2) : wSpd;
          return { slot: s, data, side, realSpeed: real, scarfSpeed: s.scarf ? scarfVal : null, weatherSpeed: wSpd, finalSpeed: finalSpd };
        });
    const all = [...build(ally, "ally"), ...build(enemy, "enemy")];
    all.sort((a, b) => (trickRoom ? a.finalSpeed - b.finalSpeed : b.finalSpeed - a.finalSpeed));
    return all;
  }, [ally, enemy, allyTW, enemyTW, trickRoom, weather]);

  const allyCount = ally.filter((s) => s.id).length;
  const enemyCount = enemy.filter((s) => s.id).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Status bar safe area + Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-ally to-enemy bg-clip-text text-transparent">
              PokeSpeed Champ
            </h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">VGC Live Speed Tier</p>
          </div>
          <Button variant="ghost" size="sm" onClick={reset} className="h-9 px-2">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Team selector chips */}
        <div className="px-4 pb-3 grid grid-cols-2 gap-2">
          <TeamChip side="ally" count={allyCount} onClick={() => setTeamSheet("ally")} />
          <TeamChip side="enemy" count={enemyCount} onClick={() => setTeamSheet("enemy")} />
        </div>
      </header>

      {/* Speed list */}
      <main className="flex-1 px-3 py-3 pb-[180px]">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Speed Tier</h2>
          <span className="text-[10px] text-muted-foreground">
            {trickRoom ? "Trick Room ↑" : "Fastest ↓"}
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
            Tap a team above to add Pokémon
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((r, i) => (
              <li
                key={`${r.side}-${i}-${r.data.id}`}
                className={cn(
                  "rounded-xl border p-3 flex items-center gap-3 active:scale-[0.99] transition-transform",
                  r.side === "ally"
                    ? "bg-ally-bg/50 border-ally/30"
                    : "bg-enemy-bg/50 border-enemy/30"
                )}
              >
                <div className={cn("text-xs font-mono w-6 text-center", r.side === "ally" ? "text-ally" : "text-enemy")}>
                  #{i + 1}
                </div>
                <img src={r.data.sprite} alt={r.data.name} className="w-12 h-12 object-contain shrink-0" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm truncate">{r.data.name}</span>
                    {r.slot.stage !== 0 && (
                      <span className={cn("text-[10px] px-1 py-0.5 rounded font-mono", r.slot.stage > 0 ? "bg-ally/20 text-ally" : "bg-enemy/20 text-enemy")}>
                        {r.slot.stage > 0 ? `+${r.slot.stage}` : r.slot.stage}
                      </span>
                    )}
                    {r.slot.scarf && (
                      <span className="text-[10px] px-1 py-0.5 rounded font-mono bg-primary/20 text-primary">SCF</span>
                    )}
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

      {/* Bottom fixed control dock */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="px-3 py-2.5 space-y-2">
          {/* Weather row */}
          <div className="grid grid-cols-4 gap-1.5">
            <WeatherBtn active={weather === "sun"} onClick={() => toggleWeather("sun")} variant="sun" icon={<Sun className="w-4 h-4" />} label="Sun" />
            <WeatherBtn active={weather === "rain"} onClick={() => toggleWeather("rain")} variant="rain" icon={<CloudRain className="w-4 h-4" />} label="Rain" />
            <WeatherBtn active={weather === "sand"} onClick={() => toggleWeather("sand")} variant="sand" icon={<Wind className="w-4 h-4" />} label="Sand" />
            <WeatherBtn active={weather === "snow"} onClick={() => toggleWeather("snow")} variant="snow" icon={<Snowflake className="w-4 h-4" />} label="Snow" />
          </div>
          {/* Field effects */}
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

      {/* Team sheet (bottom) */}
      <Sheet open={teamSheet !== null} onOpenChange={(o) => !o && setTeamSheet(null)}>
        <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b border-border">
            <SheetTitle className={cn("text-base", teamSheet === "ally" ? "text-ally" : "text-enemy")}>
              {teamSheet === "ally" ? "Your Team" : "Opponent Team"}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {teamSheet && (teamSheet === "ally" ? ally : enemy).map((s, i) => (
              <SlotEditor
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

/* ---------------- Sub-components ---------------- */

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
        <span className="text-xs font-bold uppercase tracking-wider">
          {isAlly ? "Your" : "Opponent"}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-mono font-bold">{count}/6</span>
        <ChevronDown className="w-4 h-4 opacity-60" />
      </div>
    </button>
  );
};

const SlotEditor = ({
  slot,
  onChange,
  accent,
}: {
  slot: Slot;
  onChange: (patch: Partial<Slot>) => void;
  accent: Side;
}) => {
  return (
    <div className={cn(
      "rounded-xl border p-3 space-y-2",
      accent === "ally" ? "border-ally/30 bg-ally-bg/20" : "border-enemy/30 bg-enemy-bg/20"
    )}>
      <Select value={slot.id ?? ""} onValueChange={(v) => onChange({ id: v })}>
        <SelectTrigger className="h-11">
          <SelectValue placeholder="Select Pokémon" />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {POKEMON.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              <span className="flex items-center gap-2">
                <img src={p.sprite} alt="" className="w-6 h-6 object-contain" />
                {p.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground px-1">Stage</label>
          <Select value={String(slot.stage)} onValueChange={(v) => onChange({ stage: Number(v) })}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((st) => (
                <SelectItem key={st} value={String(st)}>{st > 0 ? `+${st}` : st}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground px-1">Choice Scarf</label>
          <div className="h-10 rounded-md border border-input flex items-center justify-between px-3 bg-background">
            <span className="text-xs text-muted-foreground">{slot.scarf ? "On" : "Off"}</span>
            <Switch checked={slot.scarf} onCheckedChange={(v) => onChange({ scarf: v })} disabled={!slot.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

const WEATHER_STYLES: Record<string, string> = {
  sun: "bg-weather-sun/20 text-weather-sun border-weather-sun",
  rain: "bg-weather-rain/20 text-weather-rain border-weather-rain",
  sand: "bg-weather-sand/20 text-weather-sand border-weather-sand",
  snow: "bg-weather-snow/20 text-weather-snow border-weather-snow",
};

const WeatherBtn = ({
  active, onClick, icon, label, variant,
}: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; variant: "sun" | "rain" | "sand" | "snow";
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg text-[10px] font-medium border transition-all active:scale-95",
      "border-border bg-secondary/50 text-muted-foreground",
      active && WEATHER_STYLES[variant]
    )}
  >
    {icon}
    {label}
  </button>
);

const FieldBtn = ({
  active, onClick, children, className,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode; className?: string;
}) => (
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
