import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Backpack, Users, Beaker } from "lucide-react";
import { cn } from "@/lib/utils";
import AppMenu from "./AppMenu";
import { useT } from "@/i18n";

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

const AppShell = () => {
  const { user, profile, loading } = useAuth();
  const { pathname } = useLocation();
  const { t } = useT();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const tabs = [
    { to: "/team", label: t("team"), icon: Users },
    { to: "/bag", label: t("bag"), icon: Backpack },
    { to: "/", label: t("home"), icon: PokeballIcon, end: true },
    { to: "/battle", label: t("battle"), icon: BattleIcon },
    { to: "/sim", label: t("sim"), icon: Beaker },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="px-2 h-10 flex items-center gap-2">
          <AppMenu />
          <span className="text-sm font-semibold truncate">{profile?.id_name ?? ""}</span>
        </div>
      </header>

      <div className="flex-1 pb-[calc(env(safe-area-inset-bottom)+52px)]">
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
                  "flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <t.icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_6px_hsl(var(--primary))]")} />
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
