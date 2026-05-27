import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export const v = (name: string) => `var(--color-${name})`;
export const nf = (n: number | null | undefined) =>
  n == null ? "—" : Math.round(n).toLocaleString("fr-FR");
export const eur = (n: number | null | undefined) => (n == null ? "—" : nf(n) + " €");

export type Slice = "Tous" | "Appartement" | "Maison";
export type Metric = "prix_moyen" | "prix_median";

/* compteur animé (ease-out cubic) */
export function useCountUp(target: number, dur = 750) {
  const [val, setVal] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current, b = target;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      setVal(a + (b - a) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = b;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return val;
}

export function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber">{kicker}</div>
      <h2 className="font-display text-xl font-semibold text-fg">{title}</h2>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-ink/40 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 font-mono text-lg font-semibold tnum text-fg">{value}</div>
    </div>
  );
}

/* mini-courbe (sparkline) en SVG pur */
export function Sparkline({ data, color, h = 30 }: { data: number[]; color: string; h?: number }) {
  if (!data || data.length < 2) return null;
  const w = 100, min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - ((d - min) / span) * (h - 6) - 3]);
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const id = "sg" + Math.random().toString(36).slice(2, 7);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.35" /><stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient></defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.6" fill={color} />
    </svg>
  );
}

export function Kpi({ label, value, unit, sub, icon: Icon, color, i = 0, spark, fmt }: any) {
  const n = useCountUp(value ?? 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="card card-hover relative overflow-hidden p-4"
    >
      <span className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div className="flex items-center justify-between text-muted">
        <span className="text-[11px] uppercase tracking-wide">{label}</span>
        <span className="grid h-7 w-7 place-items-center rounded-lg"
          style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}>
          {Icon && <Icon size={14} />}
        </span>
      </div>
      <div className="mt-2 font-mono text-[1.7rem] font-semibold leading-none tnum text-fg">
        {value == null ? "—" : fmt ? fmt(n) : nf(n)}
        {unit && <span className="ml-1 text-sm text-muted">{unit}</span>}
      </div>
      <div className="mt-1 flex items-end justify-between gap-2">
        <span className="text-[11px] text-muted">{sub}</span>
        {spark && <span className="w-20 shrink-0"><Sparkline data={spark} color={color} /></span>}
      </div>
    </motion.div>
  );
}

/* conteneur animé pour les sections de page (stagger) */
export const pageMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as any },
};
