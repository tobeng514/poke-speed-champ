import type { Item, Nature } from "@/data/pokemon";

export interface TeamSlot {
  id: string | null;       // pokemon id
  nickname?: string;
  ability?: string;
  item?: Item;
  nature?: Nature;
  evs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  ivs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  level: number;
}

export const emptySlot = (): TeamSlot => ({
  id: null,
  ability: undefined,
  item: "None",
  nature: "Hardy",
  evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
  level: 50,
});

export const emptyTeam = (): TeamSlot[] => Array.from({ length: 6 }, emptySlot);

export interface Team {
  id: string;
  name: string;
  slots: TeamSlot[];
  updated_at?: string;
}
