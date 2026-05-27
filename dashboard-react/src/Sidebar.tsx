import { motion } from "framer-motion";
import {
  LayoutDashboard, Map, Layers, Building2, Workflow, Moon, Sun, Gamepad2, Joystick, Rocket,
} from "lucide-react";
import { MarioGlyph } from "./mario";

export type PageId = "overview" | "geo" | "typo" | "communes" | "method" | "game";
type Theme = "dark" | "light" | "mario";

const NAV: { id: PageId; label: string; icon: any; hint: string }[] = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard, hint: "KPIs & tendances" },
  { id: "geo", label: "Géographie", icon: Map, hint: "Carte & départements" },
  { id: "typo", label: "Typologie", icon: Layers, hint: "Types & segments" },
  { id: "communes", label: "Communes", icon: Building2, hint: "Classement détaillé" },
  { id: "method", label: "Données & Méthode", icon: Workflow, hint: "Pipeline ETL" },
  { id: "game", label: "Le Jeu", icon: Joystick, hint: "Cours sur la donnée 🎮" },
];

const THEMES: { id: Theme; icon: any; label: string }[] = [
  { id: "dark", icon: Moon, label: "Sombre" },
  { id: "light", icon: Sun, label: "Clair" },
  { id: "mario", icon: Gamepad2, label: "Mario" },
];

export default function Sidebar({
  page, setPage, theme, setTheme,
}: { page: PageId; setPage: (p: PageId) => void; theme: Theme; setTheme: (t: Theme) => void }) {
  return (
    <aside className="sticky top-0 flex h-screen w-[252px] flex-col border-r border-line bg-surface/55 px-4 py-6 backdrop-blur-xl">
      {/* Marque */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl text-lg"
          style={{ background: "color-mix(in srgb, var(--color-amber) 16%, transparent)" }}>
          {theme === "mario" ? <MarioGlyph className="h-8 w-8" /> : "🏠"}
        </div>
        <div className="leading-tight">
          <div className={`font-display text-lg font-semibold text-fg ${theme === "mario" ? "shimmer-gold" : ""}`}>
            DVF·Insight
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted">Atelier IA·Data</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.filter((n) => n.id !== "game" || theme === "mario").map((n) => {
          const active = page === n.id;
          return (
            <button key={n.id} onClick={() => setPage(n.id)}
              className="navlink relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left"
              aria-current={active ? "page" : undefined}>
              {active && (
                <motion.span layoutId="navpill"
                  className="absolute inset-0 rounded-xl border border-line"
                  style={{ background: "color-mix(in srgb, var(--color-amber) 13%, transparent)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <n.icon size={18} className="relative z-10 shrink-0"
                style={{ color: active ? "var(--color-amber)" : "var(--color-muted)" }} />
              <span className="relative z-10">
                <span className={`block text-sm font-medium ${active ? "text-fg" : "text-muted"}`}>{n.label}</span>
                <span className="block text-[10px] text-muted">{n.hint}</span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* Sélecteur de thème */}
      <div className="mt-4">
        <div className="mb-2 px-2 font-mono text-[10px] uppercase tracking-widest text-muted">Thème</div>
        <div className="flex gap-1 rounded-xl border border-line bg-ink/40 p-1">
          {THEMES.map((t) => {
            const active = theme === t.id;
            return (
              <button key={t.id} onClick={() => setTheme(t.id)} title={t.label} aria-label={`Thème ${t.label}`}
                className="relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium">
                {active && (
                  <motion.span layoutId="themepill" className="absolute inset-0 rounded-lg bg-amber"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <t.icon size={14} className="relative z-10"
                  style={{ color: active ? "#1a1206" : "var(--color-muted)" }} />
                <span className="relative z-10" style={{ color: active ? "#1a1206" : "var(--color-muted)" }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
