import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { POKEMON } from "@/data/pokemon";
import PokemonAvatar from "./PokemonAvatar";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (pokemonId: string) => void;
  title?: string;
}

const PokemonPickerDialog = ({ open, onOpenChange, onPick, title = "選擇 Pokémon" }: Props) => {
  const [q, setQ] = useState("");
  const list = POKEMON.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <Input placeholder="搜索名字…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto">
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => { onPick(p.id); onOpenChange(false); }}
              className="flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-secondary active:scale-95 transition"
            >
              <PokemonAvatar pokemonId={p.id} size="sm" interactive={false} />
              <span className="text-[10px] truncate w-full text-center">{p.name.split("-")[0]}</span>
            </button>
          ))}
          {list.length === 0 && <p className="col-span-5 text-center text-xs text-muted-foreground py-6">無結果</p>}
        </div>
        <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
      </DialogContent>
    </Dialog>
  );
};

export default PokemonPickerDialog;
