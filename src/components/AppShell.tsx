import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Swords, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const PokeballIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M2.5 12 H9.2 a3 3 0 0 1 5.6 0 H21.5" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.15" />
  </svg>
);

const tabs = [
  { to: "/", label: "主頁", icon: PokeballIcon, end: true },
  { to: "/team", label: "隊伍", icon: Users, end: false },
  { to: "/battle", label: "對戰", icon: Swords, end: false },
];

const AppShell = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="flex-1 pb-[calc(env(safe-area-inset-bottom)+72px)]">
        <Outlet />
      </div>

      <nav className="fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-3 max-w-md mx-auto">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
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
