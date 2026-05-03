import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idName, setIdName] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        if (!idName.trim()) {
          toast({ title: "請輸入 ID Name", variant: "destructive" });
          setBusy(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { id_name: idName.trim(), display_name: idName.trim() },
          },
        });
        if (error) throw error;
        toast({ title: "註冊成功", description: "已自動登入" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      nav("/");
    } catch (err: any) {
      toast({ title: "錯誤", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background pt-[env(safe-area-inset-top)]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ally to-enemy bg-clip-text text-transparent">
            PokeSpeed Champ
          </h1>
        </div>

        <form onSubmit={submit} className="space-y-3 bg-card border border-border rounded-2xl p-5">
          <h2 className="text-lg font-semibold">{mode === "signin" ? "登入" : "註冊"}</h2>
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="idname">ID Name</Label>
              <Input
                id="idname"
                value={idName}
                onChange={(e) => setIdName(e.target.value)}
                placeholder="可重複、任何文字皆可"
                required
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">密碼</Label>
            <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "處理中…" : mode === "signin" ? "登入" : "註冊"}
          </Button>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "未有帳號？立即註冊" : "已有帳號？登入"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
