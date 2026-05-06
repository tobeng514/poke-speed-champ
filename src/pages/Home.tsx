import { useTeams } from "@/hooks/useTeams";
import { findPokemon, calcHp } from "@/data/pokemon";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PokemonAvatar from "@/components/PokemonAvatar";
import { localizedName } from "@/lib/pokemonName";
import { useT } from "@/i18n";

const Home = () => {
  const { homeTeam, loading } = useTeams();
  const { lang } = useT();

  return (
    <div className="px-3">
      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-20">Loading…</div>
      ) : !homeTeam ? (
        <div className="border border-dashed border-border rounded-2xl p-8 text-center mt-6">
          <p className="text-sm text-muted-foreground mb-3">仲未有當前隊伍</p>
          <Button asChild>
            <Link to="/team">前往隊伍頁建立</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 pt-3">
          {homeTeam.slots.map((slot, i) => {
            const data = findPokemon(slot.id);
            if (!data) {
              return (
                <div key={i} className="aspect-square rounded-xl border border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground">
                  空位 {i + 1}
                </div>
              );
            }
            const hp = calcHp(data.baseHp, slot.ivs.hp, slot.evs.hp, slot.level);
            return (
              <div
                key={i}
                className="rounded-xl border border-border bg-gradient-to-b from-card to-secondary/40 p-1.5 flex flex-col items-center"
              >
                <PokemonAvatar pokemonId={data.id} size="sm" />
                <p className="text-[11px] font-semibold text-center truncate w-full mt-1">
                  {slot.nickname || localizedName(data, lang)}
                </p>
                <div className="mt-1 w-full">
                  <div className="flex items-center justify-between text-[8px] text-muted-foreground">
                    <span>HP</span>
                    <span className="font-mono">{hp}</span>
                  </div>
                  <div className="h-1 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
