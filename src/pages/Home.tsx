import { useTeams } from "@/hooks/useTeams";
import { useAuth } from "@/contexts/AuthContext";
import { findPokemon, calcHp } from "@/data/pokemon";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PokemonAvatar from "@/components/PokemonAvatar";
import { localizedName } from "@/lib/pokemonName";
import { useT } from "@/i18n";

const Home = () => {
  const { homeTeam, loading } = useTeams();
  const { profile } = useAuth();
  const { lang } = useT();

  return (
    <div className="px-4">
      <div className="py-3">
        <p className="text-lg font-bold">{profile?.id_name ?? "—"}</p>
      </div>

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
        <>
          <div className="rounded-2xl border border-border bg-card p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">當前隊伍</p>
                <h2 className="text-lg font-bold">{homeTeam.name}</h2>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/team">更換</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-4">
            {homeTeam.slots.map((slot, i) => {
              const data = findPokemon(slot.id);
              if (!data) {
                return (
                  <div key={i} className="aspect-[3/4] rounded-2xl border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                    空位 {i + 1}
                  </div>
                );
              }
              const hp = calcHp(data.baseHp, slot.ivs.hp, slot.evs.hp, slot.level);
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-gradient-to-b from-card to-secondary/40 p-3 flex flex-col items-center"
                >
                  <PokemonAvatar pokemonId={data.id} size="lg" />
                  <p className="text-sm font-semibold text-center truncate w-full mt-2">
                    {slot.nickname || localizedName(data, lang)}
                  </p>
                  <div className="mt-2 w-full">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>HP</span>
                      <span className="font-mono">{hp}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2 justify-center">
                    {slot.item && slot.item !== "None" && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">{slot.item}</span>
                    )}
                    {slot.nature && slot.nature !== "Hardy" && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{slot.nature}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
