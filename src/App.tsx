import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/i18n";
import AppShell from "@/components/AppShell";
import Home from "./pages/Home";
import TeamPage from "./pages/TeamPage";
import Battle from "./pages/Battle";
import Bag from "./pages/Bag";
import Sim from "./pages/Sim";
import Dex from "./pages/Dex";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<AppShell />}>
                <Route path="/" element={<Home />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/bag" element={<Bag />} />
                <Route path="/battle" element={<Battle />} />
                <Route path="/sim" element={<Sim />} />
                <Route path="/dex" element={<Dex />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
