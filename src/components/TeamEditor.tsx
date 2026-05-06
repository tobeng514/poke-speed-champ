import { useEffect, useState } from "react";
import type { TeamSlot } from "@/types/team";
import { POKEMON, NATURES, ITEMS, findPokemon, calcHp, calcStat, speedNatureMod, EV_TOTAL_CAP, EV_INDIVIDUAL_CAP } from "@/data/pokemon";
import { fetchPokemon, prettyName } from "@/lib/pokeapi";
import { localizedName } from "@/lib/pokemonName";
import { useT } from "@/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

type StatKey = "hp" | "atk" | "def" | "spa" | "spd" | "spe";
const STATS: { key: StatKey; label: string }[] = [
  { key: "hp", label: "HP" },
  { key: "atk", label: "Atk" },
  { key: "def", label: "Def" },
  { key: "spa", label: "SpA" },
  { key: "spd", label: "SpD" },
  { key: "spe", label: "Spe" },
];

const TeamEditor = ({
  slots,
  onChange,
}: {
  slots: TeamSlot[];
  onChange: (slots: TeamSlot[]) => void;
}) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [movesByPid, setMovesByPid] = useState<Record<string, string[]>>({});
  const [movePicker, setMovePicker] = useState<{ slot: number; idx: number } | null>(null);
  const { lang } = useT();

  useEffect(() => {
    const ids = Array.from(new Set(slots.map((s) => s.id).filter(Boolean) as string[]));
    ids.forEach((id) => {
      if (!movesByPid[id]) {
        fetchPokemon(id).then((d) => setMovesByPid((m) => ({ ...m, [id]: d?.moves ?? [] })));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  const update = (i: number, patch: Partial<TeamSlot>) => {
    onChange(slots.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const updateEv = (i: number, k: StatKey, v: number) => {
    const slot = slots[i];
    const others = (Object.keys(slot.evs) as StatKey[])
      .filter((x) => x !== k)
      .reduce((sum, x) => sum + slot.evs[x], 0);
    const max = Math.min(EV_INDIVIDUAL_CAP, EV_TOTAL_CAP - others);
    update(i, { evs: { ...slot.evs, [k]: Math.min(max, Math.max(0, Math.round(v))) } });
  };

  return (
    <div className="space-y-2">
      {slots.map((slot, i) => {
        const data = findPokemon(slot.id);
        const open = openIdx === i;
        const evTotal = Object.values(slot.evs).reduce((a, b) => a + b, 0);
        return (
          <Collapsible key={i} open={open} onOpenChange={(v) => setOpenIdx(v ? i : null)}>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <CollapsibleTrigger className="w-full flex items-center gap-3 p-3 active:bg-secondary/40">
                <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0 text-sm text-muted-foreground">
                  {data ? "?" : <span className="text-[10px]">{i + 1}</span>}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-sm truncate">{data ? localizedName(data, lang) : `空位 ${i + 1}`}</p>
                  {data && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {slot.nature} · {slot.item} · EV {evTotal}/{EV_TOTAL_CAP}
                    </p>
                  )}
                </div>
                <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
              </CollapsibleTrigger>

              <CollapsibleContent className="px-3 pb-3 space-y-3 border-t border-border pt-3">
                <Select value={slot.id ?? ""} onValueChange={(v) => {
                  const p = findPokemon(v);
                  update(i, { id: v, ability: p?.abilities[0] });
                }}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="選擇 Pokémon" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {POKEMON.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{localizedName(p, lang)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {data && (
                  <>
                    <Input
                      placeholder="暱稱（可選）"
                      value={slot.nickname ?? ""}
                      onChange={(e) => update(i, { nickname: e.target.value })}
                      className="h-9"
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <Field label="特性">
                        <Select value={slot.ability} onValueChange={(v) => update(i, { ability: v })}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {data.abilities.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="性格">
                        <Select value={slot.nature} onValueChange={(v) => update(i, { nature: v as any })}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {NATURES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="道具">
                        <Select value={slot.item} onValueChange={(v) => update(i, { item: v as any })}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {ITEMS.map((it) => <SelectItem key={it} value={it}>{it}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold">努力值 (EVs)</span>
                        <span className="font-mono text-muted-foreground">{evTotal}/{EV_TOTAL_CAP}</span>
                      </div>
                      {STATS.map(({ key, label }) => {
                        const ev = slot.evs[key];
                        const finalStat = key === "hp"
                          ? calcHp(data.baseHp, slot.ivs.hp, ev, slot.level)
                          : key === "spe"
                            ? calcStat(data.baseSpeed, slot.ivs.spe, ev, speedNatureMod(slot.nature ?? "Hardy"))
                            : null;
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <span className="w-9 text-[11px] text-muted-foreground">{label}</span>
                            <Slider
                              value={[ev]}
                              min={0}
                              max={EV_INDIVIDUAL_CAP}
                              step={1}
                              onValueChange={([v]) => updateEv(i, key, v)}
                              className="flex-1"
                            />
                            <span className="w-9 text-right text-[11px] font-mono">{ev}</span>
                            {finalStat !== null && (
                              <span className="w-10 text-right text-[11px] font-mono text-primary">{finalStat}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <Field label="技能（4 個）">
                      <div className="grid grid-cols-2 gap-1.5">
                        {[0, 1, 2, 3].map((mi) => {
                          const m = (slot.moves ?? [])[mi];
                          return (
                            <button key={mi} type="button"
                              onClick={() => setMovePicker({ slot: i, idx: mi })}
                              className="h-9 text-xs rounded-md border border-input bg-background flex items-center justify-between px-2 active:scale-95">
                              <span className={cn("truncate", !m && "text-muted-foreground")}>
                                {m ? prettyName(m) : `技能 ${mi + 1}`}
                              </span>
                              {m && <X className="w-3 h-3 shrink-0 opacity-60" onClick={(e) => {
                                e.stopPropagation();
                                const next = [...(slot.moves ?? [])];
                                next[mi] = "";
                                update(i, { moves: next });
                              }} />}
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                  </>
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}

      <Dialog open={movePicker !== null} onOpenChange={(o) => !o && setMovePicker(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>選擇技能</DialogTitle></DialogHeader>
          {movePicker && (() => {
            const slot = slots[movePicker.slot];
            const all = (slot?.id && movesByPid[slot.id]) || [];
            const used = new Set((slot?.moves ?? []).filter(Boolean));
            return (
              <div className="max-h-[55vh] overflow-y-auto space-y-1">
                {all.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">載入中…</p>}
                {all.slice(0, 300).map((m) => {
                  const isUsed = used.has(m);
                  return (
                    <button key={m} disabled={isUsed} onClick={() => {
                      const next = [...(slot.moves ?? [])];
                      while (next.length <= movePicker.idx) next.push("");
                      next[movePicker.idx] = m;
                      update(movePicker.slot, { moves: next });
                      setMovePicker(null);
                    }}
                      className={cn("w-full text-left text-sm px-3 py-2 rounded hover:bg-secondary",
                        isUsed && "opacity-40")}>
                      {prettyName(m)}
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
    {children}
  </div>
);

export default TeamEditor;
