// Lightweight PokeAPI client + cache
import { POKEAPI_SLUG } from "@/data/pokemonTypes";

const memCache = new Map<string, any>();
const moveCache = new Map<string, MoveData>();

export interface ApiPokemon {
  id: number;
  name: string;
  stats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  types: string[];
  moves: string[]; // move names (kebab-case)
}

export interface MoveData {
  name: string;
  type: string;        // capitalized
  damage_class: "physical" | "special" | "status";
  power: number | null;
  accuracy: number | null;
  pp: number | null;
}

const slug = (id: string) => POKEAPI_SLUG[id] ?? id;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const fetchPokemon = async (pokemonId: string): Promise<ApiPokemon | null> => {
  const s = slug(pokemonId);
  if (memCache.has(s)) return memCache.get(s);
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${s}`);
    if (!res.ok) return null;
    const j = await res.json();
    const get = (k: string) => j.stats.find((x: any) => x.stat.name === k)?.base_stat ?? 0;
    const out: ApiPokemon = {
      id: j.id,
      name: j.name,
      stats: {
        hp: get("hp"),
        atk: get("attack"),
        def: get("defense"),
        spa: get("special-attack"),
        spd: get("special-defense"),
        spe: get("speed"),
      },
      types: j.types.map((t: any) => cap(t.type.name)),
      moves: j.moves.map((m: any) => m.move.name),
    };
    memCache.set(s, out);
    return out;
  } catch { return null; }
};

export const fetchMove = async (moveName: string): Promise<MoveData | null> => {
  if (moveCache.has(moveName)) return moveCache.get(moveName)!;
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
    if (!res.ok) return null;
    const j = await res.json();
    const data: MoveData = {
      name: moveName,
      type: cap(j.type.name),
      damage_class: j.damage_class.name,
      power: j.power,
      accuracy: j.accuracy,
      pp: j.pp,
    };
    moveCache.set(moveName, data);
    return data;
  } catch { return null; }
};

// Pretty display name from kebab-case
export const prettyName = (name: string) =>
  name.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
