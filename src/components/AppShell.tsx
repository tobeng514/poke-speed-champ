import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Backpack, Users, Beaker } from "lucide-react";
import { cn } from "@/lib/utils";
import AppMenu from "./AppMenu";

// Single Pokéball
export const PokeballIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M2.5 12 H9.2 a3 3 0 0 1 5.6 0 H21.5" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.15" />
  </svg>
);

// Two pokéballs colliding (battle icon)
export const BattleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <circle cx="9" cy="12" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.4 12 H7.2 a1.8 1.8 0 0 1 3.6 0 H16" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="12" r="1.6" stroke="currentColor" strokeWidth="1.4" />
    </g>
    <g>
      <circle cx="23" cy="12" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 12 H21.2 a1.8 1.8 0 0 1 3.6 0 H29.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="23" cy="12" r="1.6" stroke="currentColor" strokeWidth="1.4" />
    </g>
    <path d="M14.5 6 L17.5 18 M17.5 6 L14.5 18" stroke="currentColor" strokeWidth="1" opacity="0.7" />
  </svg>
);

const tabs = [
  { to: "/team", label: "隊伍", icon: Users },
  { to: "/bag", label: "背包", icon: Backpack },
  { to: "/", label: "主頁", icon: PokeballIcon, end: true },
  { to: "/battle", label: "對戰", icon: BattleIcon },
  { to: "/sim", label: "模擬", icon: Beaker },
];

const titleByRoute: Record<string, string> = {
  "/": "主頁",
  "/team": "隊伍",
  "/bag": "背包",
  "/battle": "對戰",
  "/sim": "模擬對戰",
  "/dex": "圖鑑",
};

const AppShell = () => {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const title = titleByRoute[pathname] ?? "";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="px-2 h-14 flex items-center gap-1">
          <AppMenu />
          <h1 className="flex-1 text-base font-semibold truncate">{title}</h1>
        </div>
      </header>

      <div className="flex-1 pb-[calc(env(safe-area-inset-bottom)+72px)]">
        <Outlet />
      </div>

      <nav className="fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 max-w-md mx-auto">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={(t as any).end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <t.icon className={cn("w-6 h-6", isActive && "drop-shadow-[0_0_6px_hsl(var(--primary))]")} />
                  <span>{t.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppShell;
