import { useMemo, useState } from "react";
import { POKEMON, calcMaxSpeed, stageMultiplier, type PokemonData } from "@/data/pokemon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sun, CloudRain, Wind, Snowflake, Repeat2, RotateCcw } from "lucide-react";

type Weather = "none" | "sun" | "rain" | "sand" | "snow";
type Side = "ally" | "enemy";

interface Slot {
  id: string | null;
  stage: number; // -6..+6
  scarf: boolean;
}

const emptySlot = (): Slot => ({ id: null, stage: 0, scarf: false });
const emptyTeam = (): Slot[] => Array.from({ length: 6 }, emptySlot);

const STAGES = [6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6];

interface Row {
  slot: Slot;
  data: PokemonData;
  side: Side;
  realSpeed: number;        // base + stage
  scarfSpeed: number | null; // base + stage + scarf (or null if not scarf)
  weatherSpeed: number;      // base + stage + scarf + weather/ability
  finalSpeed: number;        // + tailwind (sort key)
}

const PokeSpeedChamp = () => {
  const [ally, setAlly] = useState<Slot[]>(emptyTeam());
  const [enemy, setEnemy] = useState<Slot[]>(emptyTeam());
  const [allyTW, setAllyTW] = useState(false);
  const [enemyTW, setEnemyTW] = useState(false);
  const [trickRoom, setTrickRoom] = useState(false);
  const [weather, setWeather] = useState<Weather>("none");

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
          // apply stage
          const real = Math.floor(max * stageMultiplier(s.stage));
          // scarf column
          const scarfVal = Math.floor(real * 1.5);
          // weather column = real (or scarf if scarf on) then ability x2 if matched
          let wSpd = s.scarf ? scarfVal : real;
          const matched =
            (weather === "sun" && data.weatherAbility === "Chlorophyll") ||
            (weather === "rain" && data.weatherAbility === "Swift Swim") ||
            (weather === "sand" && data.weatherAbility === "Sand Rush") ||
            (weather === "snow" && data.weatherAbility === "Slush Rush");
          if (matched) wSpd = Math.floor(wSpd * 2);
          // final w/ tailwind
          const tw = side === "ally" ? allyTW : enemyTW;
          const finalSpd = tw ? Math.floor(wSpd * 2) : wSpd;
          return {
            slot: s,
            data,
            side,
            realSpeed: real,
            scarfSpeed: s.scarf ? scarfVal : null,
            weatherSpeed: wSpd,
            finalSpeed: finalSpd,
          };
        });
    const all = [...build(ally, "ally"), ...build(enemy, "enemy")];
    all.sort((a, b) => (trickRoom ? a.finalSpeed - b.finalSpeed : b.finalSpeed - a.finalSpeed));
    return all;
  }, [ally, enemy, allyTW, enemyTW, trickRoom, weather]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-8 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-ally to-enemy bg-clip-text text-transparent">
            PokeSpeed Champ
          </h1>
          <p className="text-muted-foreground">VGC Live Speed Tier Calculator</p>
        </header>

        {/* Teams */}
        <div className="grid md:grid-cols-2 gap-6">
          <TeamPanel side="ally" slots={ally} onChange={(i, p) => updateSlot("ally", i, p)} />
          <TeamPanel side="enemy" slots={enemy} onChange={(i, p) => updateSlot("enemy", i, p)} />
        </div>

        {/* Environment controls */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Weather (left) */}
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground mr-1">Weather</span>
              <WeatherBtn active={weather === "sun"} onClick={() => toggleWeather("sun")} variant="sun" icon={<Sun className="w-4 h-4" />} label="Sun" />
              <WeatherBtn active={weather === "rain"} onClick={() => toggleWeather("rain")} variant="rain" icon={<CloudRain className="w-4 h-4" />} label="Rain" />
              <WeatherBtn active={weather === "sand"} onClick={() => toggleWeather("sand")} variant="sand" icon={<Wind className="w-4 h-4" />} label="Sand" />
              <WeatherBtn active={weather === "snow"} onClick={() => toggleWeather("snow")} variant="snow" icon={<Snowflake className="w-4 h-4" />} label="Snow" />
            </div>

            {/* Tailwinds */}
            <div className="flex items-center gap-4">
              <ToggleChip active={allyTW} onClick={() => setAllyTW((v) => !v)} className="data-[active=true]:bg-ally data-[active=true]:text-ally-foreground border-ally/50">
                Your Tailwind
              </ToggleChip>
              <ToggleChip active={enemyTW} onClick={() => setEnemyTW((v) => !v)} className="data-[active=true]:bg-enemy data-[active=true]:text-enemy-foreground border-enemy/50">
                Opp. Tailwind
              </ToggleChip>
              <ToggleChip active={trickRoom} onClick={() => setTrickRoom((v) => !v)} className="data-[active=true]:bg-trickroom data-[active=true]:text-white border-trickroom/50">
                <Repeat2 className="w-4 h-4 mr-1.5 inline" /> Trick Room
              </ToggleChip>
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-1" /> Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Speed Tier Table */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-wide">LIVE SPEED TIER</h2>
            <span className="text-xs text-muted-foreground">
              {trickRoom ? "Trick Room order (slowest first)" : "Sorted by final speed (fastest first)"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left w-16">Rank</th>
                  <th className="px-4 py-3 text-left">Pokémon</th>
                  <th className="px-4 py-3 text-right">Real Speed</th>
                  <th className="px-4 py-3 text-right">Scarf Speed</th>
                  <th className="px-4 py-3 text-right">Weather Speed</th>
                  <th className="px-4 py-3 text-right pr-6">Boosted Speed</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      Select Pokémon above to see the speed tier
                    </td>
                  </tr>
                )}
                {rows.map((r, i) => (
                  <tr
                    key={`${r.side}-${i}-${r.data.id}`}
                    className={cn(
                      "border-t border-border transition-colors",
                      r.side === "ally" ? "bg-ally-bg/40 hover:bg-ally-bg/60" : "bg-enemy-bg/40 hover:bg-enemy-bg/60"
                    )}
                  >
                    <td className="px-4 py-2 font-mono text-muted-foreground">#{i + 1}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <img src={r.data.sprite} alt={r.data.name} className="w-10 h-10 object-contain" loading="lazy" />
                        <span className="font-medium">{r.data.name}</span>
                        {r.slot.stage !== 0 && (
                          <span className={cn("text-xs px-1.5 py-0.5 rounded font-mono", r.slot.stage > 0 ? "bg-ally/20 text-ally" : "bg-enemy/20 text-enemy")}>
                            {r.slot.stage > 0 ? `+${r.slot.stage}` : r.slot.stage}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right font-mono">{r.realSpeed}</td>
                    <td className="px-4 py-2 text-right font-mono text-muted-foreground">
                      {r.scarfSpeed === null ? "/" : r.scarfSpeed}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">{r.weatherSpeed}</td>
                    <td className="px-4 py-2 text-right font-mono font-bold text-lg pr-6">{r.finalSpeed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ---------------- Sub-components ---------------- */

const TeamPanel = ({
  side,
  slots,
  onChange,
}: {
  side: Side;
  slots: Slot[];
  onChange: (idx: number, patch: Partial<Slot>) => void;
}) => {
  const isAlly = side === "ally";
  return (
    <Card className={cn("p-4 border-2", isAlly ? "border-ally/40" : "border-enemy/40")}>
      <h2 className={cn("text-sm font-bold uppercase tracking-widest mb-3", isAlly ? "text-ally" : "text-enemy")}>
        {isAlly ? "Your Team" : "Opponent Team"}
      </h2>
      {/* Header row */}
      <div className="grid grid-cols-[1fr_70px_70px] gap-2 px-1 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <div>Pokémon</div>
        <div className="text-center">Stage</div>
        <div className="text-center">Scarf</div>
      </div>
      <div className="space-y-1.5">
        {slots.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_70px_70px] gap-2 items-center">
            <Select value={s.id ?? ""} onValueChange={(v) => onChange(i, { id: v })}>
              <SelectTrigger className="h-9">
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
            <Select value={String(s.stage)} onValueChange={(v) => onChange(i, { stage: Number(v) })}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((st) => (
                  <SelectItem key={st} value={String(st)}>
                    {st > 0 ? `+${st}` : st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-center">
              <Switch checked={s.scarf} onCheckedChange={(v) => onChange(i, { scarf: v })} disabled={!s.id} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const WEATHER_STYLES: Record<string, string> = {
  sun: "bg-weather-sun/20 text-weather-sun border-weather-sun/60",
  rain: "bg-weather-rain/20 text-weather-rain border-weather-rain/60",
  sand: "bg-weather-sand/20 text-weather-sand border-weather-sand/60",
  snow: "bg-weather-snow/20 text-weather-snow border-weather-snow/60",
};

const WeatherBtn = ({
  active,
  onClick,
  icon,
  label,
  variant,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant: "sun" | "rain" | "sand" | "snow";
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
      "border-border bg-secondary/50 text-muted-foreground hover:text-foreground",
      active && WEATHER_STYLES[variant]
    )}
  >
    {icon}
    {label}
  </button>
);

const ToggleChip = ({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    data-active={active}
    onClick={onClick}
    className={cn(
      "px-3 py-1.5 rounded-md text-xs font-semibold border transition-all bg-secondary/40 text-muted-foreground",
      className
    )}
  >
    {children}
  </button>
);

export default PokeSpeedChamp;
