import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, PieChart, Pie, Cell, LabelList, Treemap, ScatterChart, Scatter, ZAxis,
} from "recharts";
import {
  Search, MapPin, TrendingUp, Building2, Home, X, Sparkles, Database, Filter,
  GitMerge, LineChart, Layers, ArrowRight, ArrowUpRight, ArrowDownRight,
  Rocket, Cpu, Palette, Target, Map as MapIcon, Joystick,
} from "lucide-react";
import FranceMap from "./FranceMap";
import { v, nf, eur, Kpi, Stat, SectionTitle, Sparkline } from "./lib";

const PRICE_COLORS = ["#2f6f72", "#5fb3a1", "#d9b46a", "#f0883e", "#e76a82"];
const priceColor = (p: number) =>
  p < 2500 ? PRICE_COLORS[0] : p < 3500 ? PRICE_COLORS[1] : p < 4500 ? PRICE_COLORS[2] : p < 6000 ? PRICE_COLORS[3] : PRICE_COLORS[4];

export type Ctx = {
  data: any; view: any; slice: string;
  selDep: string | null; setSelDep: (c: string | null) => void;
  q: string; setQ: (s: string) => void;
  depByCode: Record<string, any>; communes: any[];
  audio?: any;
};

const fade = (i = 0) => ({
  initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as any },
});

/* ════════════════ PRÉSENTATION (case-study portfolio) ════════════════ */
const FLOW = [
  { icon: Database, t: "Collecte", d: "API DVF + INSEE" },
  { icon: Filter, t: "Nettoyage", d: "Pandas · SQLite" },
  { icon: GitMerge, t: "Fusion", d: "DVF × INSEE" },
  { icon: Layers, t: "Agrégats", d: "médianes · segments" },
  { icon: LineChart, t: "Dashboard", d: "React · d3 · Recharts" },
];

export function Presentation({ c }: { c: Ctx }) {
  const k = c.view.kpis, meta = c.data.meta;
  const deps = c.view.departements;
  const top = deps[0], last = deps[deps.length - 1];
  const sparkPrix = c.view.evolution.map((e: any) => e.prix);
  const evo = k.evolution_pct;
  const stats = [
    { v: nf(meta.nb_total), s: "transactions" },
    { v: "93", s: "départements" },
    { v: eur(k.prix_median), s: "médian /m²" },
    { v: `${evo >= 0 ? "+" : ""}${evo} %`, s: "sur 3 ans" },
  ];
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* HERO */}
      <motion.section {...fade(0)} className="card relative overflow-hidden p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-20 blur-3xl" style={{ background: v("amber") }} />
        <div className="relative">
          <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-amber">
            <Rocket size={14} /> Projet Yboost IA &amp; Data · Ynov
          </div>
          <h1 className="font-display text-5xl font-bold leading-none text-fg">
            Immo<span className="text-amber">Dash</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            Un tableau de bord qui transforme <b className="text-fg">{nf(meta.nb_total)} ventes immobilières</b> brutes
            (données publiques <b className="text-fg">DVF</b>, {meta.periode}) en une lecture claire du marché français —
            <b className="text-fg"> compréhensible en quelques secondes</b>.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.s} className="rounded-xl border border-line bg-ink/40 p-3">
                <div className="font-mono text-xl font-bold text-fg">{s.v}</div>
                <div className="text-[11px] text-muted">{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* LE DÉFI / L'OBJECTIF */}
      <div className="grid gap-5 md:grid-cols-2">
        <motion.section {...fade(1)} className="card p-6">
          <SectionTitle kicker="Le défi" title="Des millions de lignes illisibles" />
          <p className="text-sm leading-relaxed text-muted">
            Chaque vente immobilière en France est publiée en open data. Des millions de transactions
            brutes : impossible d'en tirer du sens à l'œil nu. <b className="text-fg">Comment rendre cette
            masse compréhensible ?</b>
          </p>
        </motion.section>
        <motion.section {...fade(2)} className="card p-6">
          <SectionTitle kicker="L'objectif" title="Donner de la valeur à la donnée" />
          <p className="text-sm leading-relaxed text-muted">
            Répondre en 10 secondes à : <b className="text-fg">où</b> achète-t-on, à <b className="text-fg">quel
            prix</b>, <b className="text-fg">quel bien</b>, et <b className="text-fg">comment ça évolue</b> —
            via KPIs, carte, classements et un parcours interactif.
          </p>
        </motion.section>
      </div>

      {/* LES DONNÉES */}
      <motion.section {...fade(1)} className="card p-6">
        <SectionTitle kicker="Les données" title="DVF — Demandes de Valeurs Foncières" />
        <p className="mb-4 text-sm leading-relaxed text-muted">
          Le registre public de <b className="text-fg">toutes les mutations immobilières</b> en France
          (source DGFiP / data.gouv.fr). Chaque ligne = une vente : prix, surface, type de bien, localisation, date.
        </p>
        <div className="flex flex-wrap gap-2">
          {["valeur_fonciere", "surface_reelle", "type_bien", "commune", "code_departement", "date_mutation"].map((x) => (
            <span key={x} className="rounded-lg border border-line bg-surface2 px-2.5 py-1 font-mono text-xs text-fg">{x}</span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          → indicateur clé dérivé : <b className="text-fg">prix au m²</b> = valeur_fonciere / surface_reelle ·
          fusionné avec la <b className="text-fg">population INSEE</b> pour le dynamisme (ventes/100k hab.).
        </p>
      </motion.section>

      {/* LA DÉMARCHE */}
      <motion.section {...fade(2)} className="card p-6">
        <SectionTitle kicker="La démarche" title="Un pipeline de la donnée à la dataviz" />
        <div className="flex flex-wrap items-stretch gap-2">
          {FLOW.map((s, i) => (
            <div key={s.t} className="flex items-center gap-2">
              <div className="w-[120px] rounded-xl border border-line bg-ink/40 p-3 text-center">
                <s.icon size={17} className="mx-auto" style={{ color: v("amber") }} />
                <div className="mt-1.5 text-sm font-semibold text-fg">{s.t}</div>
                <div className="text-[10px] text-muted">{s.d}</div>
              </div>
              {i < FLOW.length - 1 && <ArrowRight size={15} className="shrink-0 text-amber" />}
            </div>
          ))}
        </div>
      </motion.section>

      {/* INSIGHTS CLÉS */}
      <div>
        <SectionTitle kicker="Ce que révèle la donnée" title="3 insights clés" />
        <div className="grid gap-5 md:grid-cols-3">
          <motion.div {...fade(0)} className="card p-5">
            <div className="text-sm text-muted">Une France à deux vitesses</div>
            <div className="mt-1 font-display text-2xl font-bold text-amber">{(top.prix_median / last.prix_median).toFixed(1)}×</div>
            <p className="mt-1 text-xs text-muted">{top.nom} ({eur(top.prix_median)}) vs {last.nom} ({eur(last.prix_median)}).</p>
          </motion.div>
          <motion.div {...fade(1)} className="card p-5">
            <div className="text-sm text-muted">Tendance sur 3 ans</div>
            <div className="mt-1 font-display text-2xl font-bold" style={{ color: evo >= 0 ? v("green") : v("rose") }}>
              {evo >= 0 ? "+" : ""}{evo} %
            </div>
            <div className="mt-1"><Sparkline data={sparkPrix} color={v("amber")} /></div>
          </motion.div>
          <motion.div {...fade(2)} className="card p-5">
            <div className="text-sm text-muted">Appartement vs Maison</div>
            <div className="mt-1 font-display text-2xl font-bold text-fg">{eur(k.prix_appart)}</div>
            <p className="mt-1 text-xs text-muted">au m² (appart.) · maison {eur(k.prix_maison)} — densité urbaine.</p>
          </motion.div>
        </div>
      </div>

      {/* STACK + FONCTIONNALITÉS */}
      <div className="grid gap-5 md:grid-cols-2">
        <motion.section {...fade(1)} className="card p-6">
          <SectionTitle kicker="Stack technique" title="Outils" />
          <div className="mb-2 flex items-center gap-2 text-xs text-muted"><Cpu size={14} className="text-amber" /> Back / data</div>
          <div className="mb-3 flex flex-wrap gap-2">{["Python", "Pandas", "SQLite", "API DVF", "INSEE"].map((t) => <Chip key={t}>{t}</Chip>)}</div>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted"><Palette size={14} className="text-amber" /> Front / dataviz</div>
          <div className="flex flex-wrap gap-2">{["React", "TypeScript", "Tailwind", "Recharts", "d3-geo", "Framer Motion"].map((t) => <Chip key={t}>{t}</Chip>)}</div>
        </motion.section>
        <motion.section {...fade(2)} className="card p-6">
          <SectionTitle kicker="Fonctionnalités" title="Ce que fait ImmoDash" />
          <ul className="space-y-2 text-sm text-muted">
            <li className="flex gap-2"><MapIcon size={16} className="mt-0.5 shrink-0 text-amber" /> Carte choroplèthe interactive des 93 départements.</li>
            <li className="flex gap-2"><Filter size={16} className="mt-0.5 shrink-0 text-amber" /> Filtres en direct : type de bien, département, prix, recherche, tri.</li>
            <li className="flex gap-2"><Target size={16} className="mt-0.5 shrink-0 text-amber" /> KPIs, classements, segmentation, tendances mensuelles.</li>
            <li className="flex gap-2"><Joystick size={16} className="mt-0.5 shrink-0 text-amber" /> Mini-jeu : on court sur la courbe des prix (la donnée devient le terrain).</li>
            <li className="flex gap-2"><Sparkles size={16} className="mt-0.5 shrink-0 text-amber" /> 3 thèmes (sombre / clair / Mario).</li>
          </ul>
        </motion.section>
      </div>
    </div>
  );
}

/* ════════════════ VUE D'ENSEMBLE ════════════════ */
export function Overview({ c }: { c: Ctx }) {
  const k = c.view.kpis;
  const top = c.view.departements[0];
  const last = c.view.departements[c.view.departements.length - 1];
  const sparkPrix = c.view.evolution.map((e: any) => e.prix);
  const sparkVol = c.view.evolution.map((e: any) => e.volume);
  const treemap = c.view.departements.slice(0, 30).map((d: any) => ({ name: d.code, nom: d.nom, size: d.nb, prix: d.prix_median }));
  const evo = k.evolution_pct;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Kpi i={0} label="Prix médian" value={k.prix_median} unit="€/m²" sub="national" icon={TrendingUp} color={v("amber")} spark={sparkPrix} />
        <Kpi i={1} label="Évolution 3 ans" value={evo} unit="%" sub="médian, depuis 2023" icon={evo >= 0 ? ArrowUpRight : ArrowDownRight} color={v("gold")}
          fmt={(n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}`} />
        <Kpi i={2} label="Transactions" value={k.nb} sub={c.data.meta.periode} icon={MapPin} color={v("teal")} spark={sparkVol} />
        <Kpi i={3} label="Appartement" value={k.prix_appart} unit="€/m²" sub="médian" icon={Building2} color={v("teal")} />
        <Kpi i={4} label="Maison" value={k.prix_maison} unit="€/m²" sub="médian" icon={Home} color={v("green")} />
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <motion.section {...fade(1)} className="card p-5 lg:col-span-7">
          <SectionTitle kicker="Tendance" title="Évolution mensuelle du prix médian" />
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={c.view.evolution} margin={{ left: -6, right: 6, top: 8 }}>
              <CartesianGrid stroke={v("line")} vertical={false} />
              <XAxis dataKey="mois" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis yAxisId="l" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(x) => x / 1000 + "k"} />
              <YAxis yAxisId="r" orientation="right" hide />
              <Tooltip formatter={(x: any, n: any) => [n === "volume" ? nf(x) : eur(x), n === "volume" ? "Ventes" : "€/m²"]} />
              <Bar yAxisId="r" dataKey="volume" fill={v("teal")} opacity={0.3} radius={3} />
              <Area yAxisId="l" dataKey="prix" stroke={v("amber")} strokeWidth={2.6} fill={v("amber")} fillOpacity={0.13} />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.section>

        <motion.section {...fade(2)} className="card flex flex-col justify-center gap-4 p-5 lg:col-span-5">
          <SectionTitle kicker="Fait marquant" title="Une France à deux vitesses" />
          <p className="text-sm leading-relaxed text-muted">
            Le marché s'étire de <b className="text-fg">{eur(last?.prix_median)}</b> ({last?.nom}) à{" "}
            <b className="text-amber">{eur(top?.prix_median)}</b> ({top?.nom}) au m² — un rapport de{" "}
            <b className="text-fg">{top && last ? (top.prix_median / last.prix_median).toFixed(1) : "—"}×</b>.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {c.view.segments.map((s: any, i: number) => (
              <div key={s.segment} className="rounded-xl border border-line bg-ink/40 p-3 text-center">
                <div className="font-mono text-xl font-semibold text-fg">{s.part}%</div>
                <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-muted">
                  <i className="h-2 w-2 rounded-full" style={{ background: [v("green"), v("teal"), v("amber")][i] }} />
                  {s.segment}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      <motion.section {...fade(3)} className="card p-5">
        <SectionTitle kicker="Volume" title="Où se concentrent les transactions ?" />
        <p className="-mt-2 mb-3 text-xs text-muted">Taille = nombre de ventes · couleur = prix moyen au m² (30 premiers départements).</p>
        <ResponsiveContainer width="100%" height={240}>
          <Treemap data={treemap} dataKey="size" stroke={v("ink")} content={<TreemapCell />} isAnimationActive>
            <Tooltip formatter={(x: any) => nf(x) + " ventes"} />
          </Treemap>
        </ResponsiveContainer>
      </motion.section>
    </div>
  );
}

/* ════════════════ GÉOGRAPHIE ════════════════ */
export function Geography({ c }: { c: Ctx }) {
  const selected = c.selDep ? c.depByCode[c.selDep] : null;
  const selRank = selected ? c.view.departements.findIndex((d: any) => d.code === c.selDep) + 1 : null;
  const topDep = useMemo(
    () => [...c.view.departements].sort((a, b) => (b.prix_median || 0) - (a.prix_median || 0)).slice(0, 14),
    [c.view]);
  const [ds, setDs] = useState<{ k: string; d: number }>({ k: "prix_median", d: -1 });
  const [dq, setDq] = useState("");
  const deprows = useMemo(() => {
    const q = dq.trim().toLowerCase();
    return [...c.view.departements]
      .filter((d: any) => !q || d.nom.toLowerCase().includes(q) || String(d.code).includes(q))
      .sort((a, b) => { const va = a[ds.k], vb = b[ds.k]; return typeof va === "string" ? ds.d * va.localeCompare(vb) : ds.d * ((va ?? 0) - (vb ?? 0)); });
  }, [c.view, ds, dq]);
  const dArrow = (k: string) => (ds.k === k ? (ds.d < 0 ? " ↓" : " ↑") : "");
  const DTh = ({ k, label, num }: any) => (
    <th onClick={() => setDs((s) => ({ k, d: s.k === k ? -s.d : (k === "nom" ? 1 : -1) }))}
      className={`cursor-pointer select-none px-4 py-2.5 font-medium hover:text-amber ${num ? "text-right" : ""}`}>{label}{dArrow(k)}</th>
  );

  return (
    <div className="space-y-5">
    <div className="grid gap-5 lg:grid-cols-12">
      <motion.section {...fade(0)} className="card p-5 lg:col-span-7">
        <SectionTitle kicker="Carte" title="Prix médian au m² par département" />
        <FranceMap data={c.view.departements} selected={c.selDep} onSelect={c.setSelDep} metric="prix_median" />
      </motion.section>

      <div className="flex flex-col gap-5 lg:col-span-5">
        <motion.section {...fade(1)} className="card p-5">
          {selected ? (
            <div>
              <div className="flex items-start justify-between">
                <SectionTitle kicker={`Rang national #${selRank}`} title={selected.nom} />
                <button onClick={() => c.setSelDep(null)} aria-label="Fermer" className="text-muted hover:text-fg"><X size={18} /></button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Stat label="Prix médian" value={eur(selected.prix_median)} />
                <Stat label="Population" value={nf(selected.population)} />
                <Stat label="Transactions" value={nf(selected.nb)} />
                <Stat label="Ventes / 100k hab." value={nf(selected.ventes_100k)} />
              </div>
            </div>
          ) : (
            <div>
              <SectionTitle kicker="Astuce" title="Explorez la carte" />
              <p className="text-sm text-muted">Cliquez un département pour afficher son détail, ou ciblez directement :</p>
              <button onClick={() => c.setSelDep("13")} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-amber hover:bg-amber/10">
                Focus Bouches-du-Rhône (13) <ArrowRight size={14} />
              </button>
            </div>
          )}
        </motion.section>

        <motion.section {...fade(2)} className="card flex-1 p-5">
          <SectionTitle kicker="Classement" title="Top 14 — prix médian" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topDep} layout="vertical" margin={{ left: 28, right: 42 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="nom" tickLine={false} axisLine={false} width={120} fontSize={10.5} interval={0} />
              <Tooltip formatter={(x: any) => eur(x)} cursor={{ fill: "color-mix(in srgb, var(--color-fg) 5%, transparent)" }} />
              <Bar dataKey="prix_median" radius={4} barSize={14} onClick={(d: any) => c.setSelDep(d.code)}>
                {topDep.map((d: any) => (
                  <Cell key={d.code} fill={c.selDep === d.code ? v("amber-soft") : v("amber")}
                    opacity={c.selDep && c.selDep !== d.code ? 0.45 : 1} cursor="pointer" />
                ))}
                <LabelList dataKey="prix_median" position="right" formatter={(x: any) => nf(x)} fill={v("muted")} fontSize={10} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.section>
      </div>
    </div>

      <motion.section {...fade(3)} className="card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <SectionTitle kicker="Donnée complète" title={`Les ${c.view.departements.length} départements`} />
          <div className="flex items-center gap-2 rounded-lg border border-line bg-ink px-3 py-2">
            <Search size={15} className="text-muted" />
            <input value={dq} onChange={(e) => setDq(e.target.value)} placeholder="Département…"
              className="w-40 bg-transparent text-sm text-fg outline-none placeholder:text-muted" />
          </div>
        </div>
        <div className="max-h-[380px] overflow-auto rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface2 text-left text-muted">
              <tr>
                <DTh k="nom" label="Département" />
                <DTh k="code" label="Code" />
                <DTh k="prix_median" label="€/m² médian" num />
                <DTh k="nb" label="Transactions" num />
                <DTh k="population" label="Population" num />
                <DTh k="ventes_100k" label="Ventes/100k hab." num />
              </tr>
            </thead>
            <tbody>
              {deprows.map((d: any) => (
                <tr key={d.code} className="cursor-pointer border-t border-line/60 hover:bg-surface2/60" onClick={() => c.setSelDep(d.code)}>
                  <td className="px-4 py-2 text-fg">{d.nom}</td>
                  <td className="px-4 py-2 font-mono text-muted">{d.code}</td>
                  <td className="px-4 py-2 text-right font-mono tnum text-amber">{eur(d.prix_median)}</td>
                  <td className="px-4 py-2 text-right font-mono tnum text-muted">{nf(d.nb)}</td>
                  <td className="px-4 py-2 text-right font-mono tnum text-muted">{nf(d.population)}</td>
                  <td className="px-4 py-2 text-right font-mono tnum text-muted">{nf(d.ventes_100k)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}

/* ════════════════ TYPOLOGIE & SEGMENTS ════════════════ */
export function Typology({ c }: { c: Ctx }) {
  const bubbles = c.view.departements
    .filter((d: any) => d.ventes_100k != null)
    .map((d: any) => ({ x: d.prix_median, y: d.ventes_100k, z: d.nb, nom: d.nom }));
  return (
    <div className="space-y-5">
    <div className="grid gap-5 lg:grid-cols-2">
      <motion.section {...fade(0)} className="card p-5">
        <SectionTitle kicker="Type de bien" title="Appartement vs Maison" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={c.data.type_compare} layout="vertical" margin={{ left: 12, right: 40 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="type" tickLine={false} axisLine={false} width={92} fontSize={13} />
            <Tooltip formatter={(x: any) => eur(x)} cursor={{ fill: "color-mix(in srgb, var(--color-fg) 5%, transparent)" }} />
            <Bar dataKey="prix" radius={7} barSize={34}>
              <Cell fill={v("teal")} /><Cell fill={v("amber")} />
              <LabelList dataKey="prix" position="right" formatter={(x: any) => eur(x)} fill={v("muted")} fontSize={13} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-2 text-sm text-muted">
          Au national, l'<b className="text-fg">appartement</b> ({eur(c.data.type_compare[0].prix)}) se vend plus cher au m²
          que la <b className="text-fg">maison</b> ({eur(c.data.type_compare[1].prix)}) — densité urbaine oblige.
        </p>
      </motion.section>

      <motion.section {...fade(1)} className="card p-5">
        <SectionTitle kicker="Marché" title="Segmentation des prix" />
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Pie data={c.view.segments} dataKey="nb" nameKey="segment" innerRadius={56} outerRadius={90} paddingAngle={3} stroke="none">
              {[v("green"), v("teal"), v("amber")].map((col, i) => <Cell key={i} fill={col} />)}
            </Pie>
            <Tooltip formatter={(x: any) => nf(x) + " biens"} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-1 space-y-1.5">
          {c.view.segments.map((s: any, i: number) => (
            <div key={s.segment} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted">
                <i className="h-2.5 w-2.5 rounded-full" style={{ background: [v("green"), v("teal"), v("amber")][i] }} />
                {s.segment} <span className="text-[11px]">{i === 0 ? "< 4 000" : i === 1 ? "4 000–8 000" : "> 8 000 €/m²"}</span>
              </span>
              <span className="font-mono tnum text-fg">{nf(s.nb)} · {s.part}%</span>
            </div>
          ))}
        </div>
      </motion.section>
    </div>

      <motion.section {...fade(2)} className="card p-5">
        <SectionTitle kicker="Lecture croisée" title="Prix vs dynamisme du marché" />
        <p className="-mt-2 mb-3 text-xs text-muted">Chaque bulle = un département · X : prix moyen €/m² · Y : ventes pour 100 000 hab. · taille : volume.</p>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ left: 4, right: 16, top: 8, bottom: 12 }}>
            <CartesianGrid stroke={v("line")} />
            <XAxis type="number" dataKey="x" name="Prix" tickLine={false} fontSize={11}
              tickFormatter={(x) => x / 1000 + "k"} label={{ value: "€/m² médian", position: "insideBottom", offset: -4, fill: v("muted"), fontSize: 11 }} />
            <YAxis type="number" dataKey="y" name="Dynamisme" tickLine={false} fontSize={11} width={42} />
            <ZAxis type="number" dataKey="z" range={[40, 600]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }}
              formatter={(val: any, name: any) => name === "Prix" ? eur(val) : nf(val)}
              labelFormatter={() => ""} />
            <Scatter data={bubbles} fill={v("amber")} fillOpacity={0.55} />
          </ScatterChart>
        </ResponsiveContainer>
      </motion.section>
    </div>
  );
}

/* ════════════════ COMMUNES ════════════════ */
export function Communes({ c }: { c: Ctx }) {
  const all: any[] = c.view.communes;
  const deps = useMemo(() => [...new Set(all.map((x) => x.dep))].sort(), [all]);
  const prices = all.map((x) => x.prix);
  const pmin = Math.min(...prices), pmax = Math.max(...prices);
  const [dep, setDep] = useState("");
  const [minP, setMinP] = useState(pmin);
  const [sort, setSort] = useState<{ k: string; d: number }>({ k: "prix", d: -1 });

  const rows = useMemo(() => {
    const q = c.q.trim().toLowerCase();
    let r = all.filter((x) =>
      (!q || x.commune.toLowerCase().includes(q)) && (!dep || x.dep === dep) && x.prix >= minP);
    r = [...r].sort((a, b) => {
      const va = a[sort.k], vb = b[sort.k];
      return typeof va === "string" ? sort.d * va.localeCompare(vb) : sort.d * (va - vb);
    });
    return r;
  }, [all, c.q, dep, minP, sort]);

  const setSortKey = (k: string) => setSort((s) => ({ k, d: s.k === k ? -s.d : (k === "commune" ? 1 : -1) }));
  const arrow = (k: string) => (sort.k === k ? (sort.d < 0 ? " ↓" : " ↑") : "");
  const Th = ({ k, label, num }: any) => (
    <th onClick={() => setSortKey(k)} className={`cursor-pointer select-none px-4 py-2.5 font-medium hover:text-amber ${num ? "text-right" : ""}`}>{label}{arrow(k)}</th>
  );
  const reset = () => { setDep(""); setMinP(pmin); c.setQ(""); setSort({ k: "prix", d: -1 }); };

  return (
    <div className="space-y-5">
      {/* Barre de filtres */}
      <motion.section {...fade(0)} className="card p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wide text-muted">Recherche</label>
            <div className="flex items-center gap-2 rounded-lg border border-line bg-ink px-3 py-2">
              <Search size={15} className="text-muted" />
              <input value={c.q} onChange={(e) => c.setQ(e.target.value)} placeholder="Commune…" aria-label="Rechercher une commune"
                className="w-40 bg-transparent text-sm text-fg outline-none placeholder:text-muted" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wide text-muted">Département</label>
            <select value={dep} onChange={(e) => setDep(e.target.value)}
              className="rounded-lg border border-line bg-ink px-3 py-2 text-sm text-fg outline-none">
              <option value="">Tous ({deps.length})</option>
              {deps.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-[10px] uppercase tracking-wide text-muted">Prix min : {eur(minP)}/m²</label>
            <input type="range" min={pmin} max={pmax} step={100} value={minP} onChange={(e) => setMinP(+e.target.value)}
              className="w-full accent-[var(--color-amber)]" aria-label="Prix minimum" />
          </div>
          <button onClick={reset} className="rounded-lg border border-line px-3 py-2 text-sm text-muted hover:text-amber">Réinitialiser</button>
          <div className="font-mono text-sm text-fg">{rows.length} commune{rows.length > 1 ? "s" : ""}</div>
        </div>
      </motion.section>

      <motion.section {...fade(1)} className="card p-5">
        <SectionTitle kicker="Podium" title="Top 10 (sélection filtrée)" />
        {rows.length ? <Leaderboard rows={[...rows].sort((a, b) => b.prix - a.prix).slice(0, 10)} />
          : <p className="text-sm text-muted">Aucune commune ne correspond aux filtres.</p>}
      </motion.section>

      <motion.section {...fade(2)} className="card p-5">
        <SectionTitle kicker="Détail complet" title={`${rows.length} communes`} />
        <div className="max-h-[420px] overflow-auto rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface2 text-left text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">#</th>
                <Th k="commune" label="Commune" />
                <Th k="dep" label="Dép." />
                <Th k="prix" label="€/m² médian" num />
                <Th k="nb" label="Ventes" num />
              </tr>
            </thead>
            <tbody>
              {rows.map((cm, i) => (
                <tr key={cm.commune + cm.dep} className="border-t border-line/60 hover:bg-surface2/60">
                  <td className="px-4 py-2 font-mono text-muted">{i + 1}</td>
                  <td className="px-4 py-2 text-fg">{cm.commune}</td>
                  <td className="px-4 py-2 font-mono text-muted">{cm.dep}</td>
                  <td className="px-4 py-2 text-right font-mono tnum text-amber">{eur(cm.prix)}</td>
                  <td className="px-4 py-2 text-right font-mono tnum text-muted">{nf(cm.nb)}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">Aucun résultat.</td></tr>}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}

/* ════════════════ DONNÉES & MÉTHODE ════════════════ */
const STEPS = [
  { icon: Database, t: "Collecte", d: "API DVF + INSEE" },
  { icon: Database, t: "SQLite", d: "raw_dvf · raw_insee" },
  { icon: Filter, t: "Nettoyage", d: "Pandas · NaN, doublons" },
  { icon: GitMerge, t: "Fusion", d: "DVF × INSEE" },
  { icon: Layers, t: "Agrégats", d: "médianes · segments" },
  { icon: LineChart, t: "Dashboard", d: "React · Recharts" },
];
const FUNNEL = [
  { label: "Période couverte", value: "2023 – 2025", note: "3 années · 36 mois de séries" },
  { label: "Mutations analysées", value: "2,79 M", note: "toute la France" },
  { label: "Maillage géographique", value: "96 dép.", note: "~38 700 communes agrégées" },
];

export function Method({ c }: { c: Ctx }) {
  return (
    <div className="space-y-5">
      <motion.section {...fade(0)} className="card p-5">
        <SectionTitle kicker="Pipeline ETL" title="Du fichier brut au dashboard" />
        <div className="flex flex-wrap items-stretch gap-2">
          {STEPS.map((s, i) => (
            <div key={s.t} className="flex items-center gap-2">
              <div className="w-[128px] rounded-xl border border-line bg-ink/40 p-3 text-center">
                <s.icon size={18} className="mx-auto" style={{ color: v("amber") }} />
                <div className="mt-1.5 text-sm font-semibold text-fg">{s.t}</div>
                <div className="text-[10px] text-muted">{s.d}</div>
              </div>
              {i < STEPS.length - 1 && <ArrowRight size={16} className="shrink-0 text-amber" />}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          Chaque étape correspond à une séance du module : collecte → stockage → nettoyage → fusion → feature engineering → visualisation.
        </p>
      </motion.section>

      <div className="grid gap-5 lg:grid-cols-2">
        <motion.section {...fade(1)} className="card p-5">
          <SectionTitle kicker="Couverture" title="3 ans · toute la France" />
          <div className="space-y-3">
            {FUNNEL.map((f, i) => (
              <div key={f.label} className="relative overflow-hidden rounded-xl border border-line bg-ink/40 p-3"
                style={{ marginLeft: i * 14, marginRight: i * 4 }}>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted">{f.label}</span>
                  <span className="font-mono text-lg font-semibold text-fg">{f.value}</span>
                </div>
                <div className="text-[11px] text-muted">{f.note}</div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section {...fade(2)} className="card p-5">
          <SectionTitle kicker="Stack technique" title="Outils mobilisés" />
          <div className="space-y-4 text-sm">
            <div>
              <div className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-amber">Back-end · data</div>
              <div className="flex flex-wrap gap-2">
                {["Python", "Pandas", "SQLite", "requests", "API DVF", "API INSEE"].map((t) => <Chip key={t}>{t}</Chip>)}
              </div>
            </div>
            <div>
              <div className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-amber">Front-end · dataviz</div>
              <div className="flex flex-wrap gap-2">
                {["React", "TypeScript", "Tailwind", "Recharts", "d3-geo", "Framer Motion"].map((t) => <Chip key={t}>{t}</Chip>)}
              </div>
            </div>
            <div className="rounded-xl border border-line bg-ink/40 p-3 text-[13px] text-muted">
              <Sparkles size={14} className="mb-1 inline text-amber" /> <b className="text-fg">Parti pris UX :</b> 3 thèmes
              (sombre / clair / <b className="text-fg">Mario</b> 🍄 avec sons &amp; animations), navigation latérale,
              filtres en direct, accessibilité (focus, reduced-motion), et lisibilité « en 10 secondes ».
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

/* ── petits composants ── */
function Chip({ children }: { children: any }) {
  return <span className="rounded-lg border border-line bg-surface2 px-2.5 py-1 font-mono text-xs text-fg">{children}</span>;
}

function TreemapCell(props: any) {
  const { x, y, width, height, nom, prix, name } = props;
  if (width <= 0 || height <= 0) return null;
  const big = width > 54 && height > 30;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={3}
        style={{ fill: prix ? priceColor(prix) : "#2a3142", stroke: "var(--color-ink)", strokeWidth: 2, transition: "fill .3s" }} />
      {big && (
        <>
          <text x={x + 6} y={y + 16} fill="#0a0d15" fontSize={11} fontWeight={700} fontFamily="Geist Mono">{name}</text>
          <text x={x + 6} y={y + 30} fill="#0a0d15" fontSize={9} opacity={0.75} fontFamily="Geist">{nom?.slice(0, 14)}</text>
        </>
      )}
    </g>
  );
}

function Leaderboard({ rows }: { rows: any[] }) {
  const max = Math.max(...rows.map((r) => r.prix));
  const medal = ["🥇", "🥈", "🥉"];
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <motion.div key={r.commune + r.dep}
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
          className="group flex items-center gap-3 rounded-xl border border-line bg-ink/40 px-3 py-2 transition hover:border-amber/40">
          <span className="w-6 text-center font-mono text-sm text-muted">{i < 3 ? medal[i] : i + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm text-fg">{r.commune} <span className="font-mono text-[11px] text-muted">({r.dep})</span></span>
              <span className="shrink-0 font-mono text-sm tnum text-amber">{eur(r.prix)}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface2">
              <motion.div className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${v("amber")}, ${v("amber-soft")})` }}
                initial={{ width: 0 }} animate={{ width: `${(r.prix / max) * 100}%` }}
                transition={{ duration: 0.7, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }} />
            </div>
          </div>
          <span className="hidden shrink-0 font-mono text-[11px] text-muted sm:block">{nf(r.nb)} ventes</span>
        </motion.div>
      ))}
    </div>
  );
}
