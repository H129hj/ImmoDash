import { useEffect, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";

type Dep = { code: string; nom: string; prix_moyen: number; prix_median: number; nb: number };
type Metric = "prix_moyen" | "prix_median";
type Props = {
  data: Dep[];
  selected: string | null;
  onSelect: (code: string | null) => void;
  metric: Metric;
};

const BUCKETS = [
  { max: 2500, color: "#2f6f72", label: "< 2 500" },
  { max: 3500, color: "#5fb3a1", label: "2 500–3 500" },
  { max: 4500, color: "#d9b46a", label: "3 500–4 500" },
  { max: 6000, color: "#f0883e", label: "4 500–6 000" },
  { max: Infinity, color: "#e76a82", label: "> 6 000" },
];
const colorFor = (v?: number) =>
  v == null ? "color-mix(in srgb, var(--color-muted) 22%, transparent)" : (BUCKETS.find((b) => v < b.max) ?? BUCKETS[4]).color;

export default function FranceMap({ data, selected, onSelect, metric }: Props) {
  const [geo, setGeo] = useState<any>(null);
  const [hover, setHover] = useState<{ code: string; x: number; y: number } | null>(null);

  useEffect(() => {
    fetch("./departements.geojson").then((r) => r.json()).then(setGeo);
  }, []);

  const byCode = useMemo(() => Object.fromEntries(data.map((d) => [d.code, d])), [data]);
  const paths = useMemo(() => {
    if (!geo) return [] as { code: string; d: string }[];
    const projection = geoMercator().fitSize([600, 560], geo);
    const path = geoPath(projection);
    return geo.features.map((f: any) => ({ code: f.properties.code, d: path(f) || "" }));
  }, [geo]);

  const hovered = hover ? byCode[hover.code] : null;

  if (!geo) return <div className="skeleton h-[440px] w-full" aria-busy="true" />;

  return (
    <div className="relative">
      <svg viewBox="0 0 600 560" className="w-full h-auto" style={{ maxHeight: 470 }}
        role="img" aria-label="Carte des prix immobiliers par département">
        {paths.map((p) => {
          const dep = byCode[p.code];
          const isSel = selected === p.code;
          const dim = selected && !isSel;
          return (
            <path
              key={p.code} d={p.d} fill={colorFor(dep?.[metric])}
              style={{
                stroke: isSel ? "var(--color-fg)" : "var(--color-ink)",
                strokeWidth: isSel ? 1.6 : 0.5,
                opacity: dim ? 0.38 : 1,
                cursor: dep ? "pointer" : "default",
                transition: "opacity .25s, fill .35s",
              }}
              tabIndex={dep ? 0 : -1}
              onMouseEnter={(e) => setHover({ code: p.code, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
              onMouseMove={(e) => setHover({ code: p.code, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
              onMouseLeave={() => setHover(null)}
              onClick={() => dep && onSelect(isSel ? null : p.code)}
              onKeyDown={(e) => { if (dep && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onSelect(isSel ? null : p.code); } }}
            />
          );
        })}
      </svg>

      {hovered && hover && (
        <div className="card pointer-events-none absolute z-10 px-3 py-2 text-xs shadow-xl"
          style={{ left: Math.min(hover.x + 14, 430), top: hover.y + 10 }}>
          <div className="font-display text-sm text-fg">{hovered.nom}</div>
          <div className="font-mono text-amber">{hovered[metric].toLocaleString("fr-FR")} €/m²</div>
          <div className="text-muted">{hovered.nb.toLocaleString("fr-FR")} ventes</div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
        <span className="uppercase tracking-wide">€/m² {metric === "prix_moyen" ? "moyen" : "médian"}</span>
        {BUCKETS.map((b) => (
          <span key={b.label} className="inline-flex items-center gap-1.5">
            <i className="h-3 w-3 rounded-sm" style={{ background: b.color }} />{b.label}
          </span>
        ))}
      </div>
    </div>
  );
}
