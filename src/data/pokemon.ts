// VGC Pokemon dataset with full stats for HP & speed calculation.

export type WeatherAbility = "Chlorophyll" | "Swift Swim" | "Sand Rush" | "Slush Rush" | null;

export interface PokemonData {
  id: string;
  name: string;
  baseHp: number;
  baseSpeed: number;
  weatherAbility?: WeatherAbility;
  abilities: string[]; // selectable abilities
  sprite: string;
}

const sprite = (dex: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dex}.png`;

export const POKEMON: PokemonData[] = [
  { id: "calyrex-shadow", name: "Calyrex-Shadow", baseHp: 100, baseSpeed: 150, abilities: ["As One (Spectrier)"], sprite: sprite(898) },
  { id: "calyrex-ice", name: "Calyrex-Ice", baseHp: 100, baseSpeed: 50, abilities: ["As One (Glastrier)"], sprite: sprite(898) },
  { id: "miraidon", name: "Miraidon", baseHp: 100, baseSpeed: 135, abilities: ["Hadron Engine"], sprite: sprite(1008) },
  { id: "koraidon", name: "Koraidon", baseHp: 100, baseSpeed: 135, abilities: ["Orichalcum Pulse"], sprite: sprite(1007) },
  { id: "zacian-crowned", name: "Zacian-Crowned", baseHp: 92, baseSpeed: 148, abilities: ["Intrepid Sword"], sprite: sprite(888) },
  { id: "zamazenta-crowned", name: "Zamazenta-Crowned", baseHp: 92, baseSpeed: 138, abilities: ["Dauntless Shield"], sprite: sprite(889) },
  { id: "kyogre", name: "Kyogre", baseHp: 100, baseSpeed: 90, abilities: ["Drizzle"], sprite: sprite(382) },
  { id: "groudon", name: "Groudon", baseHp: 100, baseSpeed: 90, abilities: ["Drought"], sprite: sprite(383) },
  { id: "rayquaza", name: "Rayquaza", baseHp: 105, baseSpeed: 95, abilities: ["Air Lock"], sprite: sprite(384) },
  { id: "lunala", name: "Lunala", baseHp: 137, baseSpeed: 97, abilities: ["Shadow Shield"], sprite: sprite(792) },
  { id: "solgaleo", name: "Solgaleo", baseHp: 137, baseSpeed: 97, abilities: ["Full Metal Body"], sprite: sprite(791) },
  { id: "necrozma-dusk", name: "Necrozma-Dusk-Mane", baseHp: 97, baseSpeed: 77, abilities: ["Prism Armor"], sprite: sprite(800) },
  { id: "necrozma-dawn", name: "Necrozma-Dawn-Wings", baseHp: 97, baseSpeed: 77, abilities: ["Prism Armor"], sprite: sprite(800) },
  { id: "terapagos", name: "Terapagos", baseHp: 90, baseSpeed: 85, abilities: ["Tera Shift"], sprite: sprite(1024) },

  { id: "incineroar", name: "Incineroar", baseHp: 95, baseSpeed: 60, abilities: ["Intimidate", "Blaze"], sprite: sprite(727) },
  { id: "rillaboom", name: "Rillaboom", baseHp: 100, baseSpeed: 85, abilities: ["Grassy Surge", "Overgrow"], sprite: sprite(812) },
  { id: "urshifu-rapid", name: "Urshifu-Rapid", baseHp: 100, baseSpeed: 97, abilities: ["Unseen Fist"], sprite: sprite(892) },
  { id: "urshifu-single", name: "Urshifu-Single", baseHp: 100, baseSpeed: 97, abilities: ["Unseen Fist"], sprite: sprite(892) },
  { id: "ogerpon-hearth", name: "Ogerpon-Hearthflame", baseHp: 80, baseSpeed: 110, abilities: ["Mold Breaker"], sprite: sprite(1017) },
  { id: "ogerpon-wellspring", name: "Ogerpon-Wellspring", baseHp: 80, baseSpeed: 110, abilities: ["Water Absorb"], sprite: sprite(1017) },
  { id: "ogerpon-cornerstone", name: "Ogerpon-Cornerstone", baseHp: 80, baseSpeed: 110, abilities: ["Sturdy"], sprite: sprite(1017) },
  { id: "ogerpon-teal", name: "Ogerpon-Teal", baseHp: 80, baseSpeed: 110, abilities: ["Defiant"], sprite: sprite(1017) },
  { id: "flutter-mane", name: "Flutter Mane", baseHp: 55, baseSpeed: 135, abilities: ["Protosynthesis"], sprite: sprite(987) },
  { id: "iron-hands", name: "Iron Hands", baseHp: 154, baseSpeed: 50, abilities: ["Quark Drive"], sprite: sprite(992) },
  { id: "iron-bundle", name: "Iron Bundle", baseHp: 56, baseSpeed: 136, abilities: ["Quark Drive"], sprite: sprite(991) },
  { id: "chien-pao", name: "Chien-Pao", baseHp: 80, baseSpeed: 135, abilities: ["Sword of Ruin"], sprite: sprite(1002) },
  { id: "chi-yu", name: "Chi-Yu", baseHp: 55, baseSpeed: 100, abilities: ["Beads of Ruin"], sprite: sprite(1004) },
  { id: "ting-lu", name: "Ting-Lu", baseHp: 155, baseSpeed: 45, abilities: ["Vessel of Ruin"], sprite: sprite(1003) },
  { id: "wo-chien", name: "Wo-Chien", baseHp: 85, baseSpeed: 70, abilities: ["Tablets of Ruin"], sprite: sprite(1001) },
  { id: "landorus-therian", name: "Landorus-Therian", baseHp: 89, baseSpeed: 91, abilities: ["Intimidate"], sprite: sprite(645) },
  { id: "tornadus", name: "Tornadus", baseHp: 79, baseSpeed: 121, abilities: ["Prankster", "Defiant"], sprite: sprite(641) },
  { id: "tornadus-therian", name: "Tornadus-Therian", baseHp: 79, baseSpeed: 121, abilities: ["Regenerator"], sprite: sprite(641) },
  { id: "thundurus", name: "Thundurus", baseHp: 79, baseSpeed: 111, abilities: ["Prankster", "Defiant"], sprite: sprite(642) },
  { id: "regieleki", name: "Regieleki", baseHp: 80, baseSpeed: 200, abilities: ["Transistor"], sprite: sprite(894) },
  { id: "dragapult", name: "Dragapult", baseHp: 88, baseSpeed: 142, abilities: ["Clear Body", "Infiltrator"], sprite: sprite(887) },
  { id: "dragonite", name: "Dragonite", baseHp: 91, baseSpeed: 80, abilities: ["Multiscale", "Inner Focus"], sprite: sprite(149) },
  { id: "garchomp", name: "Garchomp", baseHp: 108, baseSpeed: 102, abilities: ["Rough Skin", "Sand Veil"], sprite: sprite(445) },
  { id: "gholdengo", name: "Gholdengo", baseHp: 87, baseSpeed: 84, abilities: ["Good as Gold"], sprite: sprite(1000) },
  { id: "annihilape", name: "Annihilape", baseHp: 110, baseSpeed: 90, abilities: ["Defiant", "Vital Spirit"], sprite: sprite(979) },
  { id: "amoonguss", name: "Amoonguss", baseHp: 114, baseSpeed: 30, abilities: ["Regenerator", "Effect Spore"], sprite: sprite(591) },
  { id: "indeedee-f", name: "Indeedee-F", baseHp: 70, baseSpeed: 85, abilities: ["Own Tempo", "Synchronize", "Psychic Surge"], sprite: sprite(876) },
  { id: "indeedee-m", name: "Indeedee-M", baseHp: 60, baseSpeed: 85, abilities: ["Inner Focus", "Synchronize", "Psychic Surge"], sprite: sprite(876) },
  { id: "farigiraf", name: "Farigiraf", baseHp: 120, baseSpeed: 60, abilities: ["Cud Chew", "Armor Tail"], sprite: sprite(981) },
  { id: "porygon2", name: "Porygon2", baseHp: 85, baseSpeed: 60, abilities: ["Trace", "Download"], sprite: sprite(233) },
  { id: "grimmsnarl", name: "Grimmsnarl", baseHp: 95, baseSpeed: 60, abilities: ["Prankster", "Frisk"], sprite: sprite(861) },
  { id: "whimsicott", name: "Whimsicott", baseHp: 60, baseSpeed: 116, abilities: ["Prankster", "Infiltrator"], sprite: sprite(547) },
  { id: "raging-bolt", name: "Raging Bolt", baseHp: 125, baseSpeed: 75, abilities: ["Protosynthesis"], sprite: sprite(1021) },
  { id: "gouging-fire", name: "Gouging Fire", baseHp: 105, baseSpeed: 105, abilities: ["Protosynthesis"], sprite: sprite(1020) },
  { id: "iron-crown", name: "Iron Crown", baseHp: 90, baseSpeed: 90, abilities: ["Quark Drive"], sprite: sprite(1023) },
  { id: "iron-valiant", name: "Iron Valiant", baseHp: 74, baseSpeed: 116, abilities: ["Quark Drive"], sprite: sprite(1006) },
  { id: "roaring-moon", name: "Roaring Moon", baseHp: 105, baseSpeed: 119, abilities: ["Protosynthesis"], sprite: sprite(1005) },
  { id: "kingambit", name: "Kingambit", baseHp: 100, baseSpeed: 50, abilities: ["Defiant", "Supreme Overlord"], sprite: sprite(983) },
  { id: "primarina", name: "Primarina", baseHp: 80, baseSpeed: 60, abilities: ["Torrent", "Liquid Voice"], sprite: sprite(730) },
  { id: "tyranitar", name: "Tyranitar", baseHp: 100, baseSpeed: 61, abilities: ["Sand Stream"], sprite: sprite(248) },
  { id: "excadrill", name: "Excadrill", baseHp: 110, baseSpeed: 88, weatherAbility: "Sand Rush", abilities: ["Sand Rush", "Sand Force", "Mold Breaker"], sprite: sprite(530) },
  { id: "venusaur", name: "Venusaur", baseHp: 80, baseSpeed: 80, weatherAbility: "Chlorophyll", abilities: ["Chlorophyll", "Overgrow"], sprite: sprite(3) },
  { id: "ludicolo", name: "Ludicolo", baseHp: 80, baseSpeed: 70, weatherAbility: "Swift Swim", abilities: ["Swift Swim", "Rain Dish"], sprite: sprite(272) },
  { id: "barraskewda", name: "Barraskewda", baseHp: 61, baseSpeed: 136, weatherAbility: "Swift Swim", abilities: ["Swift Swim", "Propeller Tail"], sprite: sprite(847) },
  { id: "arctozolt", name: "Arctozolt", baseHp: 90, baseSpeed: 55, weatherAbility: "Slush Rush", abilities: ["Slush Rush", "Static"], sprite: sprite(881) },
  { id: "beartic", name: "Beartic", baseHp: 95, baseSpeed: 50, weatherAbility: "Slush Rush", abilities: ["Slush Rush", "Snow Cloak"], sprite: sprite(614) },
  { id: "smeargle", name: "Smeargle", baseHp: 55, baseSpeed: 75, abilities: ["Own Tempo", "Moody"], sprite: sprite(235) },
  { id: "tatsugiri", name: "Tatsugiri", baseHp: 68, baseSpeed: 109, abilities: ["Commander"], sprite: sprite(978) },
  { id: "dondozo", name: "Dondozo", baseHp: 150, baseSpeed: 35, abilities: ["Unaware", "Oblivious"], sprite: sprite(977) },
  { id: "pelipper", name: "Pelipper", baseHp: 60, baseSpeed: 65, abilities: ["Drizzle", "Rain Dish"], sprite: sprite(279) },
  { id: "torkoal", name: "Torkoal", baseHp: 70, baseSpeed: 20, abilities: ["Drought", "White Smoke"], sprite: sprite(324) },
];

// ---------------- Natures ----------------
export const NATURES = [
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
  "Bold", "Docile", "Relaxed", "Impish", "Lax",
  "Timid", "Hasty", "Serious", "Jolly", "Naive",
  "Modest", "Mild", "Quiet", "Bashful", "Rash",
  "Calm", "Gentle", "Sassy", "Careful", "Quirky",
] as const;
export type Nature = typeof NATURES[number];

const SPEED_PLUS: Nature[] = ["Timid", "Hasty", "Jolly", "Naive"];
const SPEED_MINUS: Nature[] = ["Brave", "Relaxed", "Quiet", "Sassy"];
const HP_NEUTRAL = true; // HP is unaffected by nature

export const speedNatureMod = (n: Nature): number =>
  SPEED_PLUS.includes(n) ? 1.1 : SPEED_MINUS.includes(n) ? 0.9 : 1;

// ---------------- Items ----------------
export const ITEMS = [
  "None",
  "Choice Scarf",
  "Life Orb",
  "Focus Sash",
  "Leftovers",
  "Sitrus Berry",
  "Assault Vest",
  "Rocky Helmet",
  "Mental Herb",
  "Safety Goggles",
  "Booster Energy",
  "Clear Amulet",
  "Covert Cloak",
  "Loaded Dice",
  "Choice Band",
  "Choice Specs",
] as const;
export type Item = typeof ITEMS[number];

// ---------------- EV system (custom: 1 EV = 1 stat point) ----------------
// Total cap: 66, individual cap: 32, step: 1.
export const EV_TOTAL_CAP = 66;
export const EV_INDIVIDUAL_CAP = 32;

// ---------------- Stat formulas (Lv50) ----------------
// HP base: floor((2*base+IV)*Level/100)+Level+10, then EV adds 1:1.
export const calcHp = (base: number, iv: number, ev: number, level = 50): number =>
  Math.floor(((2 * base + iv) * level) / 100) + level + 10 + ev;

// Other stat base: floor((floor((2*base+IV)*Level/100)+5) * nature), then EV adds 1:1.
export const calcStat = (base: number, iv: number, ev: number, natureMod: number, level = 50): number =>
  Math.floor((Math.floor(((2 * base + iv) * level) / 100) + 5) * natureMod) + ev;

// Backward-compat: max-speed shortcut (31 IV, 32 EV, +Speed nature)
export const calcMaxSpeed = (base: number): number => calcStat(base, 31, EV_INDIVIDUAL_CAP, 1.1);

// Stat stage multiplier
export const stageMultiplier = (stage: number): number => {
  if (stage >= 0) return (2 + stage) / 2;
  return 2 / (2 - stage);
};

export const findPokemon = (id: string | null | undefined): PokemonData | undefined =>
  id ? POKEMON.find((p) => p.id === id) : undefined;
