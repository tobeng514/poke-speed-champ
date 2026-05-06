import type { PokemonData } from "@/data/pokemon";
import type { Lang } from "@/i18n";

export const localizedName = (p: Pick<PokemonData, "name" | "nameZh" | "nameJp"> | undefined, lang: Lang): string => {
  if (!p) return "";
  if (lang === "zh-TW" || lang === "zh-CN") return p.nameZh || p.name;
  if (lang === "ja") return p.nameJp || p.name;
  // en / ko -> english name (no Korean dataset yet)
  return p.name;
};
