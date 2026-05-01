// Common VGC Pokemon data — base speed + weather speed ability (if any)
// Speed values shown in selector "Max Speed" reflect Lv50, 31 IV, 252 EV, +Speed nature.

export type WeatherAbility = "Chlorophyll" | "Swift Swim" | "Sand Rush" | "Slush Rush" | null;

export interface PokemonData {
  id: string;
  name: string;
  baseSpeed: number;
  weatherAbility?: WeatherAbility;
  sprite: string;
}

// Sprite source: PokeAPI official sprites via raw GitHub
const sprite = (dex: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dex}.png`;

export const POKEMON: PokemonData[] = [
  // Restricted / Box Legends
  { id: "calyrex-shadow", name: "Calyrex-Shadow", baseSpeed: 150, sprite: sprite(898) },
  { id: "calyrex-ice", name: "Calyrex-Ice", baseSpeed: 50, sprite: sprite(898) },
  { id: "miraidon", name: "Miraidon", baseSpeed: 135, sprite: sprite(1008) },
  { id: "koraidon", name: "Koraidon", baseSpeed: 135, sprite: sprite(1007) },
  { id: "zacian-crowned", name: "Zacian-Crowned", baseSpeed: 148, sprite: sprite(888) },
  { id: "zamazenta-crowned", name: "Zamazenta-Crowned", baseSpeed: 138, sprite: sprite(889) },
  { id: "kyogre", name: "Kyogre", baseSpeed: 90, sprite: sprite(382) },
  { id: "groudon", name: "Groudon", baseSpeed: 90, sprite: sprite(383) },
  { id: "rayquaza", name: "Rayquaza", baseSpeed: 95, sprite: sprite(384) },
  { id: "lunala", name: "Lunala", baseSpeed: 97, sprite: sprite(792) },
  { id: "solgaleo", name: "Solgaleo", baseSpeed: 97, sprite: sprite(791) },
  { id: "necrozma-dusk", name: "Necrozma-Dusk-Mane", baseSpeed: 77, sprite: sprite(800) },
  { id: "necrozma-dawn", name: "Necrozma-Dawn-Wings", baseSpeed: 77, sprite: sprite(800) },
  { id: "terapagos", name: "Terapagos", baseSpeed: 85, sprite: sprite(1024) },

  // Top tier supports / attackers
  { id: "incineroar", name: "Incineroar", baseSpeed: 60, sprite: sprite(727) },
  { id: "rillaboom", name: "Rillaboom", baseSpeed: 85, sprite: sprite(812) },
  { id: "urshifu-rapid", name: "Urshifu-Rapid", baseSpeed: 97, sprite: sprite(892) },
  { id: "urshifu-single", name: "Urshifu-Single", baseSpeed: 97, sprite: sprite(892) },
  { id: "ogerpon-hearth", name: "Ogerpon-Hearthflame", baseSpeed: 110, sprite: sprite(1017) },
  { id: "ogerpon-wellspring", name: "Ogerpon-Wellspring", baseSpeed: 110, sprite: sprite(1017) },
  { id: "ogerpon-cornerstone", name: "Ogerpon-Cornerstone", baseSpeed: 110, sprite: sprite(1017) },
  { id: "ogerpon-teal", name: "Ogerpon-Teal", baseSpeed: 110, sprite: sprite(1017) },
  { id: "flutter-mane", name: "Flutter Mane", baseSpeed: 135, sprite: sprite(987) },
  { id: "iron-hands", name: "Iron Hands", baseSpeed: 50, sprite: sprite(992) },
  { id: "iron-bundle", name: "Iron Bundle", baseSpeed: 136, sprite: sprite(991) },
  { id: "chien-pao", name: "Chien-Pao", baseSpeed: 135, sprite: sprite(1002) },
  { id: "chi-yu", name: "Chi-Yu", baseSpeed: 100, sprite: sprite(1004) },
  { id: "ting-lu", name: "Ting-Lu", baseSpeed: 45, sprite: sprite(1003) },
  { id: "wo-chien", name: "Wo-Chien", baseSpeed: 70, sprite: sprite(1001) },
  { id: "landorus-therian", name: "Landorus-Therian", baseSpeed: 91, sprite: sprite(645) },
  { id: "tornadus", name: "Tornadus", baseSpeed: 121, sprite: sprite(641) },
  { id: "thundurus", name: "Thundurus", baseSpeed: 111, sprite: sprite(642) },
  { id: "regieleki", name: "Regieleki", baseSpeed: 200, sprite: sprite(894) },
  { id: "dragapult", name: "Dragapult", baseSpeed: 142, sprite: sprite(887) },
  { id: "dragonite", name: "Dragonite", baseSpeed: 80, sprite: sprite(149) },
  { id: "garchomp", name: "Garchomp", baseSpeed: 102, sprite: sprite(445) },
  { id: "gholdengo", name: "Gholdengo", baseSpeed: 84, sprite: sprite(1000) },
  { id: "annihilape", name: "Annihilape", baseSpeed: 90, sprite: sprite(979) },
  { id: "amoonguss", name: "Amoonguss", baseSpeed: 30, sprite: sprite(591) },
  { id: "indeedee-f", name: "Indeedee-F", baseSpeed: 85, sprite: sprite(876) },
  { id: "indeedee-m", name: "Indeedee-M", baseSpeed: 85, sprite: sprite(876) },
  { id: "farigiraf", name: "Farigiraf", baseSpeed: 60, sprite: sprite(981) },
  { id: "porygon2", name: "Porygon2", baseSpeed: 60, sprite: sprite(233) },
  { id: "grimmsnarl", name: "Grimmsnarl", baseSpeed: 60, sprite: sprite(861) },
  { id: "whimsicott", name: "Whimsicott", baseSpeed: 116, sprite: sprite(547) },
  { id: "tornadus-therian", name: "Tornadus-Therian", baseSpeed: 121, sprite: sprite(641) },
  { id: "raging-bolt", name: "Raging Bolt", baseSpeed: 75, sprite: sprite(1021) },
  { id: "gouging-fire", name: "Gouging Fire", baseSpeed: 105, sprite: sprite(1020) },
  { id: "iron-crown", name: "Iron Crown", baseSpeed: 90, sprite: sprite(1023) },
  { id: "iron-valiant", name: "Iron Valiant", baseSpeed: 116, sprite: sprite(1006) },
  { id: "roaring-moon", name: "Roaring Moon", baseSpeed: 119, sprite: sprite(1005) },
  { id: "kingambit", name: "Kingambit", baseSpeed: 50, sprite: sprite(983) },
  { id: "primarina", name: "Primarina", baseSpeed: 60, sprite: sprite(730) },
  { id: "tyranitar", name: "Tyranitar", baseSpeed: 61, sprite: sprite(248) },
  { id: "excadrill", name: "Excadrill", baseSpeed: 88, weatherAbility: "Sand Rush", sprite: sprite(530) },
  { id: "venusaur", name: "Venusaur", baseSpeed: 80, weatherAbility: "Chlorophyll", sprite: sprite(3) },
  { id: "ludicolo", name: "Ludicolo", baseSpeed: 70, weatherAbility: "Swift Swim", sprite: sprite(272) },
  { id: "barraskewda", name: "Barraskewda", baseSpeed: 136, weatherAbility: "Swift Swim", sprite: sprite(847) },
  { id: "arctozolt", name: "Arctozolt", baseSpeed: 55, weatherAbility: "Slush Rush", sprite: sprite(881) },
  { id: "arctovish", name: "Arctovish", baseSpeed: 55, weatherAbility: "Slush Rush", sprite: sprite(882) },
  { id: "beartic", name: "Beartic", baseSpeed: 50, weatherAbility: "Slush Rush", sprite: sprite(614) },
  { id: "smeargle", name: "Smeargle", baseSpeed: 75, sprite: sprite(235) },
  { id: "tatsugiri", name: "Tatsugiri", baseSpeed: 109, sprite: sprite(978) },
  { id: "dondozo", name: "Dondozo", baseSpeed: 35, sprite: sprite(977) },
  { id: "pelipper", name: "Pelipper", baseSpeed: 65, sprite: sprite(279) },
  { id: "torkoal", name: "Torkoal", baseSpeed: 20, sprite: sprite(324) },
];

// Calculate Lv50 max-speed real stat (31 IV, 252 EV, +Spe nature)
export const calcMaxSpeed = (base: number): number =>
  Math.floor((Math.floor(((2 * base + 31 + 63) * 50) / 100) + 5) * 1.1);

// Stat stage multiplier
export const stageMultiplier = (stage: number): number => {
  if (stage >= 0) return (2 + stage) / 2;
  return 2 / (2 - stage);
};
