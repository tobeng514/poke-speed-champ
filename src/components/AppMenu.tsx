import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Menu, BookOpen, Share2, User as UserIcon, Bug, Send, Settings, LogOut, ChevronRight, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT, LANGS } from "@/i18n";

type View = "menu" | "account" | "settings";

const AppMenu = () => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const { profile, user, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { t } = useT();
  const [idDraft, setIdDraft] = useState(profile?.id_name ?? "");
  const [savingId, setSavingId] = useState(false);
  useEffect(() => { setIdDraft(profile?.id_name ?? ""); }, [profile?.id_name]);

  const saveIdName = async () => {
    if (!user) return;
    const v = idDraft.trim();
    if (!v) { toast({ title: "ID Name 不可留空", variant: "destructive" }); return; }
    setSavingId(true);
    const { error } = await supabase.from("profiles").update({ id_name: v }).eq("id", user.id);
    setSavingId(false);
    if (error) toast({ title: "失敗", description: error.message, variant: "destructive" });
    else { await refreshProfile(); toast({ title: "已更新 ID Name" }); }
  };

  const close = () => { setOpen(false); setTimeout(() => setView("menu"), 200); };

  const share = async () => {
    const url = window.location.origin;
    if (navigator.share) {
      try { await navigator.share({ title: "PokeSpeed Champ", url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "已複製連結" });
    }
  };

  return (
    <>
      <button
        aria-label="開啟選單"
        onClick={() => setOpen(true)}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary/60 active:scale-95 transition"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Sheet open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
        <SheetContent side="left" className="w-[85vw] max-w-sm p-0 flex flex-col">
          <SheetHeader className="px-4 py-4 border-b border-border">
            <SheetTitle>
              {view === "menu" && "選單"}
              {view === "account" && "帳號"}
              {view === "settings" && "設定"}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {view === "menu" && (
              <div className="py-2">
                <Section>
                  <Row icon={BookOpen} label="圖鑑" onClick={() => { close(); window.location.assign("/dex"); }} />
                  <Row icon={Share2} label="隊伍分享" onClick={() => toast({ title: "即將推出" })} />
                </Section>
                <div className="h-px bg-border my-2" />
                <Section>
                  <Row icon={UserIcon} label="帳號" onClick={() => setView("account")} chevron />
                  <Row icon={Bug} label="回報或建議" onClick={() => toast({ title: "即將推出" })} />
                  <Row icon={Send} label="分享這個 APP" onClick={share} />
                  <Row icon={Settings} label="設定" onClick={() => setView("settings")} chevron />
                  <Row icon={LogOut} label="登出" onClick={async () => { await signOut(); close(); }} destructive />
                </Section>
              </div>
            )}

            {view === "account" && (
              <div className="p-4 space-y-4">
                <Button variant="ghost" size="sm" onClick={() => setView("menu")}>← 返回</Button>
                <InfoBlock label="Email" value={user?.email ?? "—"} />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">ID Name</p>
                  <div className="flex gap-2">
                    <Input value={idDraft} onChange={(e) => setIdDraft(e.target.value)} className="h-9" />
                    <Button size="sm" onClick={saveIdName} disabled={savingId || idDraft.trim() === (profile?.id_name ?? "")}>
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">連動帳號</p>
                  {["Google", "Facebook"].map((p) => (
                    <button
                      key={p}
                      onClick={() => toast({ title: `${p} 連動即將推出` })}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-secondary/40 text-sm"
                    >
                      <span>{p}</span>
                      <span className="text-[11px] text-muted-foreground">未連動</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {view === "settings" && (
              <div className="p-4 space-y-4">
                <Button variant="ghost" size="sm" onClick={() => setView("menu")}>← 返回</Button>
                <ThemeToggle />
                <LanguageSelect />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

const Section = ({ children }: { children: React.ReactNode }) => (
  <div className="px-2">{children}</div>
);

const Row = ({
  icon: Icon, label, onClick, chevron, destructive,
}: {
  icon: any; label: string; onClick: () => void; chevron?: boolean; destructive?: boolean;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary/50 active:scale-[0.99] transition text-left",
      destructive && "text-destructive"
    )}
  >
    <Icon className="w-5 h-5 shrink-0" />
    <span className="flex-1 text-sm font-medium">{label}</span>
    {chevron && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
  </button>
);

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

const ThemeToggle = () => {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border">
      <span className="text-sm font-medium">外觀模式</span>
      <button onClick={toggle} className="text-xs px-3 py-1.5 rounded-md bg-secondary">
        {dark ? "🌙 黑色" : "☀️ 白色"}
      </button>
    </div>
  );
};

const LanguageSelect = () => {
  const { lang, setLang } = useT();
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">語言 / Language</p>
      <div className="grid grid-cols-2 gap-1.5">
        {LANGS.map((o: any) => (
          <button
            key={o.v}
            onClick={() => setLang(o.v)}
            className={cn(
              "px-3 py-2 rounded-lg border text-sm",
              lang === o.v ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
            )}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AppMenu;
