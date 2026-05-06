// Helpers for filtering Pokémon by learnable moves via PokeAPI.
const TYPE_MOVES_CACHE: Record<string, string[]> = {};
const MOVE_LEARNERS_CACHE: Record<string, string[]> = {};

const BASE = "https://pokeapi.co/api/v2";

export interface MoveInfo { name: string; type: string; }

export const fetchMovesForType = async (type: string): Promise<string[]> => {
  const key = type.toLowerCase();
  if (TYPE_MOVES_CACHE[key]) return TYPE_MOVES_CACHE[key];
  try {
    const r = await fetch(`${BASE}/type/${key}`);
    const j = await r.json();
    const arr = (j.moves ?? []).map((m: any) => m.name as string);
    TYPE_MOVES_CACHE[key] = arr;
    return arr;
  } catch { return []; }
};

// list of pokemon-species names that can learn the given move (kebab-case)
export const fetchLearnersOfMove = async (move: string): Promise<string[]> => {
  const key = move.toLowerCase();
  if (MOVE_LEARNERS_CACHE[key]) return MOVE_LEARNERS_CACHE[key];
  try {
    const r = await fetch(`${BASE}/move/${key}`);
    const j = await r.json();
    const arr = (j.learned_by_pokemon ?? []).map((p: any) => p.name as string);
    MOVE_LEARNERS_CACHE[key] = arr;
    return arr;
  } catch { return []; }
};
