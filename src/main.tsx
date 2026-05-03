import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply saved theme before React mounts
try {
  const t = localStorage.getItem("theme");
  if (t === "dark") document.documentElement.classList.add("dark");
  else if (t === "light") document.documentElement.classList.remove("dark");
} catch {}

createRoot(document.getElementById("root")!).render(<App />);
