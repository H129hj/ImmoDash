import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import Sidebar, { type PageId } from "./Sidebar";
import { Overview, Geography, Typology, Communes, Method, type Ctx } from "./pages";
import { type Slice } from "./lib";
import { useAudio, MarioFx } from "./mario";
import DataGame from "./DataGame";

const Game = ({ c }: { c: Ctx }) => <DataGame data={c.view.evolution} audio={c.audio} />;

type Theme = "dark" | "light" | "mario";
const SLICES: Slice[] = ["Tous", "Appartement", "Maison"];

const PAGES: Record<PageId, { title: string; subtitle: string; Comp: (p: { c: Ctx }) => any }> = {
  overview: { title: "Vue d'ensemble", subtitle: "Les chiffres clés du marché", Comp: Overview },
  geo: { title: "Géographie", subtitle: "Le prix de l'immobilier, département par département", Comp: Geography },
  typo: { title: "Typologie & segments", subtitle: "Quels biens, à quels prix", Comp: Typology },
  communes: { title: "Communes", subtitle: "Le classement détaillé, ville par ville", Comp: Communes },
  method: { title: "Données & méthode", subtitle: "Du fichier brut au tableau de bord", Comp: Method },
  game: { title: "Le Jeu de la Donnée", subtitle: "Cours sur la courbe des prix immobiliers 🎮", Comp: Game },
};

export default function App() {
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState<PageId>("overview");
  const [slice, setSlice] = useState<Slice>("Tous");
  const [selDep, setSelDep] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("dvf-theme") as Theme) ||
      (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));

  const audio = useAudio();
  useEffect(() => { fetch("./data.json").then((r) => r.json()).then(setData); }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("dvf-theme", theme);
    // le Jeu n'existe qu'en thème Mario : on quitte la page si on en sort
    if (theme !== "mario" && page === "game") setPage("overview");
  }, [theme, page]);

  const mario = theme === "mario";
  const changeTheme = (t: Theme) => { t === "mario" ? audio.powerup() : audio.coin(); setTheme(t); };
  const goPage = (p: PageId) => { if (mario) audio.jump(); setPage(p); };
  const chooseSlice = (s: Slice) => { if (mario) audio.coin(); setSlice(s); };

  const view = data?.[slice];
  const depByCode = useMemo(
    () => (view ? Object.fromEntries(view.departements.map((d: any) => [d.code, d])) : {}), [view]);
  const communes = useMemo(() => {
    if (!view) return [];
    const t = q.trim().toLowerCase();
    return view.communes.filter((cm: any) => !t || cm.commune.toLowerCase().includes(t));
  }, [view, q]);

  if (!data) {
    return (
      <div className="flex">
        <div className="skeleton h-screen w-[252px] rounded-none" />
        <div className="flex-1 p-9"><div className="skeleton h-12 w-1/3" />
          <div className="mt-6 grid grid-cols-5 gap-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-24" />)}</div>
        </div>
      </div>
    );
  }

  const c: Ctx = { data, view, slice, selDep, setSelDep, q, setQ, depByCode, communes, audio };
  const meta = PAGES[page];
  const Comp = meta.Comp;

  return (
    <div className="flex min-h-screen">
      <MarioFx active={mario} />
      <Sidebar page={page} setPage={goPage} theme={theme} setTheme={changeTheme} />

      <main className="flex-1 overflow-x-hidden">
        {/* Barre supérieure */}
        <div className="sticky top-0 z-20 flex flex-wrap items-end justify-between gap-4 border-b border-line bg-ink/70 px-6 py-5 backdrop-blur-xl md:px-9">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-amber">
              DVF · {data.meta.periode}
            </div>
            <AnimatePresence mode="wait">
              <motion.h1 key={page}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="font-display text-3xl font-semibold leading-tight text-fg">
                {meta.title}
              </motion.h1>
            </AnimatePresence>
            <p className="text-sm text-muted">{meta.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {mario && (
              <button onClick={() => audio.setMuted(!audio.muted)} aria-label="Activer / couper le son"
                title={audio.muted ? "Son coupé" : "Son activé"}
                className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface/70 text-amber transition hover:scale-105">
                {audio.muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
            )}
            <div role="radiogroup" aria-label="Type de bien" className="flex rounded-xl border border-line bg-surface/70 p-1">
              {SLICES.map((s) => (
                <button key={s} role="radio" aria-checked={slice === s} onClick={() => chooseSlice(s)}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${slice === s ? "bg-amber text-[#1a1206]" : "text-muted hover:text-fg"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu de page */}
        <div className="px-6 py-6 md:px-9">
          <AnimatePresence mode="wait">
            <motion.div key={page}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
              <Comp c={c} />
            </motion.div>
          </AnimatePresence>

          <footer className="mt-10 border-t border-line pt-5 text-center font-mono text-[11px] text-muted">
            Pipeline Python · Pandas · SQLite — Front React + Tailwind + Framer Motion · {data.meta.source}
          </footer>
        </div>
      </main>
    </div>
  );
}
