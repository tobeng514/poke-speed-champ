import { useRef, useState } from "react";
import { usePokemonImages } from "@/hooks/usePokemonImages";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Eye, ImagePlus, Trash2, X } from "lucide-react";

interface Props {
  pokemonId: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  interactive?: boolean; // show menu on click
}

const sizeMap = {
  sm: "w-10 h-10 text-base",
  md: "w-16 h-16 text-2xl",
  lg: "w-24 h-24 text-4xl",
  xl: "w-32 h-32 text-5xl",
};

const PokemonAvatar = ({ pokemonId, size = "md", className, interactive = true }: Props) => {
  const { images, upload, remove } = usePokemonImages();
  const url = images[pokemonId];
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { await upload(pokemonId, f); toast({ title: "已更新圖片" }); }
    catch (err: any) { toast({ title: "上傳失敗", description: err.message, variant: "destructive" }); }
    e.target.value = "";
  };

  const Avatar = (
    <div className={cn(
      "rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground overflow-hidden shrink-0",
      sizeMap[size], className
    )}>
      {url ? <img src={url} alt={pokemonId} className="w-full h-full object-cover" /> : <span>?</span>}
    </div>
  );

  if (!interactive) return Avatar;

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="active:scale-95 transition">{Avatar}</button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-1" align="start">
          <button
            disabled={!url}
            onClick={() => { setViewOpen(true); setMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-secondary disabled:opacity-50"
          >
            <Eye className="w-4 h-4" /> 觀看圖片
          </button>
          <button
            onClick={() => { fileRef.current?.click(); setMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-secondary"
          >
            <ImagePlus className="w-4 h-4" /> 設定圖片
          </button>
          <button
            disabled={!url}
            onClick={async () => {
              setMenuOpen(false);
              try { await remove(pokemonId); toast({ title: "已移除頭像" }); }
              catch (err: any) { toast({ title: "移除失敗", description: err.message, variant: "destructive" }); }
            }}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-secondary text-destructive disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> 移除頭像
          </button>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-secondary text-muted-foreground"
          >
            <X className="w-4 h-4" /> 退出選單
          </button>
        </PopoverContent>
      </Popover>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md p-2">
          {url && <img src={url} alt={pokemonId} className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PokemonAvatar;
