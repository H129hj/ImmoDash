import { useEffect, useRef, useState } from "react";
import { Gamepad2, RotateCcw, Volume2, VolumeX, Coins } from "lucide-react";

type Pt = { mois: string; prix: number; volume: number };
type Char = "mario" | "luigi" | "peach" | "yoshi" | "bowser";
const CHARS: { id: Char; nom: string; c1: string; c2: string }[] = [
  { id: "mario", nom: "Mario", c1: "#e52521", c2: "#1f5fd8" },
  { id: "luigi", nom: "Luigi", c1: "#43b047", c2: "#1f5fd8" },
  { id: "peach", nom: "Peach", c1: "#ff8fc8", c2: "#ff6fb3" },
  { id: "yoshi", nom: "Yoshi", c1: "#43d06a", c2: "#ffffff" },
  { id: "bowser", nom: "Bowser", c1: "#2f7d32", c2: "#e08828" },
];

const W = 940, H = 440, SP = 96, GROUND = 70, AMP = 190;

export default function DataGame({ data, audio }: { data: Pt[]; audio: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [char, setChar] = useState<Char>("mario");
  const [hud, setHud] = useState({ mois: "", prix: 0, volume: 0, coins: 0, total: data.length });
  const [won, setWon] = useState(false);
  const [running, setRunning] = useState(true);
  const stateRef = useRef<any>(null);

  // (ré)initialise la partie
  const reset = () => {
    const prices = data.map((d) => d.prix);
    const min = Math.min(...prices), max = Math.max(...prices), span = max - min || 1;
    const maxIdx = prices.indexOf(max), minIdx = prices.indexOf(min);
    const groundAt = (wx: number) => {
      const f = Math.max(0, Math.min(wx / SP, data.length - 1));
      const i = Math.floor(f), frac = f - i;
      const pa = prices[i], pb = prices[Math.min(i + 1, prices.length - 1)];
      const p = pa + (pb - pa) * frac;
      return H - GROUND - ((p - min) / span) * AMP;
    };
    stateRef.current = {
      groundAt, min, max, span, prices, data, maxIdx, minIdx,
      worldW: (data.length - 1) * SP + 120,
      player: { x: 30, y: groundAt(30) - 40, vy: 0, onGround: true, face: 1 },
      keys: {} as Record<string, boolean>,
      coins: data.map((_, i) => ({ x: i * SP, y: groundAt(i * SP) - 46, got: false })),
      cam: 0, score: 0, t: 0,
    };
    setWon(false); setRunning(true);
    setHud({ mois: data[0]?.mois || "", prix: data[0]?.prix || 0, volume: data[0]?.volume || 0, coins: 0, total: data.length });
  };

  useEffect(() => { reset(); /* eslint-disable-next-line */ }, [data]);

  // contrôles clavier
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(e.key)) e.preventDefault();
      if (stateRef.current) stateRef.current.keys[e.key] = true;
    };
    const up = (e: KeyboardEvent) => { if (stateRef.current) stateRef.current.keys[e.key] = false; };
    window.addEventListener("keydown", dn); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, []);

  // boucle de jeu
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!; let raf = 0; let hudTick = 0;
    const loop = () => {
      const s = stateRef.current;
      if (s && running) {
        const p = s.player, k = s.keys;
        // déplacement
        if (k["ArrowRight"]) { p.x += 4.2; p.face = 1; }
        if (k["ArrowLeft"]) { p.x = Math.max(0, p.x - 4.2); p.face = -1; }
        if ((k["ArrowUp"] || k[" "]) && p.onGround) { p.vy = -13.5; p.onGround = false; audio?.jump?.(); }
        // gravité
        p.vy += 0.8; p.y += p.vy;
        const gy = s.groundAt(p.x + 17) - 40;
        if (p.y >= gy) { p.y = gy; p.vy = 0; p.onGround = true; }
        // pièces
        s.coins.forEach((c: any) => {
          if (!c.got && Math.abs(c.x - (p.x + 17)) < 30 && Math.abs(c.y - (p.y + 20)) < 46) {
            c.got = true; s.score++; audio?.coin?.();
          }
        });
        // caméra
        s.cam = Math.max(0, Math.min(p.x - W / 3, s.worldW - W));
        s.t++;
        // victoire
        if (p.x >= (data.length - 1) * SP && !won) { setRunning(false); setWon(true); }
        // HUD throttlé
        if (++hudTick % 6 === 0) {
          const mi = Math.max(0, Math.min(Math.round(p.x / SP), data.length - 1));
          setHud({ mois: data[mi]?.mois || "", prix: data[mi]?.prix || 0, volume: data[mi]?.volume || 0, coins: s.score, total: data.length });
        }
        draw(ctx, s, char);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [char, running, won, data, audio]);

  return (
    <div className="space-y-4">
      {/* barre de contrôle */}
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="text-amber" size={18} />
          <span className="text-sm text-muted">Personnage :</span>
          <div className="flex flex-wrap gap-1.5">
            {CHARS.map((c) => (
              <button key={c.id} onClick={() => setChar(c.id)}
                className="rounded-lg border px-2.5 py-1 text-xs font-semibold transition"
                style={{ borderColor: char === c.id ? c.c1 : "var(--color-line)", background: char === c.id ? c.c1 : "transparent", color: char === c.id ? "#fff" : "var(--color-muted)" }}>
                {c.nom}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-sm text-fg"><Coins size={15} className="text-amber" /> {hud.coins}/{hud.total}</span>
          <button onClick={() => audio?.setMuted?.(!audio?.muted)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:text-amber" aria-label="Son">
            {audio?.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button onClick={reset} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:text-amber"><RotateCcw size={14} /> Rejouer</button>
        </div>
      </div>

      {/* canvas + HUD données */}
      <div className="card relative overflow-hidden p-2">
        <div className="absolute left-4 top-4 z-10 rounded-xl border border-line bg-ink/70 px-4 py-2 backdrop-blur">
          <div className="font-mono text-[11px] uppercase tracking-widest text-amber">{hud.mois}</div>
          <div className="font-mono text-lg font-semibold text-fg">{hud.prix.toLocaleString("fr-FR")} €/m²</div>
          <div className="text-[11px] text-muted">{hud.volume.toLocaleString("fr-FR")} ventes ce mois</div>
        </div>
        <canvas ref={canvasRef} width={W} height={H} className="w-full rounded-xl" style={{ aspectRatio: `${W}/${H}`, imageRendering: "auto" }} />
        {won && <WinReport data={data} coins={hud.coins} onReplay={reset} />}
      </div>
      <p className="text-center text-xs text-muted">
        ⌨️ <b className="text-fg">← →</b> se déplacer · <b className="text-fg">Espace / ↑</b> sauter — cours sur la courbe des prix immobiliers (chaque colline = un mois, chaque pièce = une donnée).
      </p>
    </div>
  );
}

/* ───────── rendu canvas ───────── */
function draw(ctx: CanvasRenderingContext2D, s: any, char: Char) {
  const cam = s.cam, prices = s.prices, n = prices.length;
  // ciel
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#5c94fc"); sky.addColorStop(1, "#a9caff");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  // nuages
  ctx.fillStyle = "rgba(255,255,255,.9)";
  for (let i = 0; i < 6; i++) cloud(ctx, ((i * 360 - cam * 0.3) % (W + 200)) - 100, 50 + (i % 3) * 40);
  // terrain rempli
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 6) ctx.lineTo(x, s.groundAt(x + cam));
  ctx.lineTo(W, H); ctx.closePath();
  const g = ctx.createLinearGradient(0, 120, 0, H);
  g.addColorStop(0, "#cdeec0"); g.addColorStop(0.16, "#43b047"); g.addColorStop(0.17, "#c84c0c"); g.addColorStop(1, "#8a3408");
  ctx.fillStyle = g; ctx.fill();
  // ligne de prix colorée par TENDANCE (vert = hausse, rouge = baisse)
  ctx.lineWidth = 4; ctx.lineCap = "round";
  for (let i = 0; i < n - 1; i++) {
    const x1 = i * SP - cam, x2 = (i + 1) * SP - cam;
    if (x2 < -10 || x1 > W + 10) continue;
    ctx.beginPath();
    ctx.moveTo(x1, s.groundAt(i * SP)); ctx.lineTo(x2, s.groundAt((i + 1) * SP));
    ctx.strokeStyle = prices[i + 1] >= prices[i] ? "#2fd06a" : "#ff5d5d";
    ctx.stroke();
  }
  // pièces + étiquette de prix (chaque pièce = un mois, on lit la donnée)
  ctx.textAlign = "center";
  s.coins.forEach((c: any, i: number) => {
    const x = c.x - cam; if (x < -40 || x > W + 40) return;
    if (!c.got) {
      const sx = Math.abs(Math.sin(s.t / 14 + i)) * 0.85 + 0.15;
      ctx.save(); ctx.translate(x, c.y); ctx.scale(sx, 1);
      ctx.beginPath(); ctx.arc(0, 0, 11, 0, 7); ctx.fillStyle = "#fbd000"; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = "#b07400"; ctx.stroke(); ctx.restore();
    }
    // prix du mois au-dessus de la pièce
    ctx.font = "bold 11px 'Geist Mono', monospace";
    ctx.fillStyle = "rgba(10,13,21,.55)"; ctx.fillText(prices[i].toLocaleString("fr-FR"), x, c.y - 20);
    ctx.fillStyle = "#fff"; ctx.fillText(prices[i].toLocaleString("fr-FR"), x, c.y - 21);
  });
  // panneaux Sommet / Creux
  signpost(ctx, s.maxIdx * SP - cam, s.groundAt(s.maxIdx * SP), "▲ Sommet", prices[s.maxIdx], "#2fd06a", s);
  signpost(ctx, s.minIdx * SP - cam, s.groundAt(s.minIdx * SP), "▼ Creux", prices[s.minIdx], "#ff5d5d", s);
  // drapeau d'arrivée
  const fgy = s.groundAt((n - 1) * SP), fx = (n - 1) * SP - cam;
  ctx.strokeStyle = "#3a3a3a"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(fx, fgy); ctx.lineTo(fx, fgy - 120); ctx.stroke();
  ctx.fillStyle = "#e52521"; ctx.fillRect(fx, fgy - 120, 34, 22);
  // personnage
  const p = s.player;
  drawChar(ctx, p.x - cam, p.y, char, p.face, p.onGround ? Math.sin(s.t / 5) : 0);
}

function signpost(ctx: CanvasRenderingContext2D, x: number, gy: number, label: string, val: number, col: string, s: any) {
  if (x < -60 || x > W + 60) return;
  ctx.strokeStyle = "#7a5a2a"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy - 74); ctx.stroke();
  const bw = 78, bh = 30, bx = x - bw / 2, by = gy - 74 - bh;
  ctx.fillStyle = "#1c1a17"; rrect(ctx, bx, by, bw, bh, 6);
  ctx.fillStyle = col; ctx.font = "bold 10px 'Geist Mono', monospace"; ctx.textAlign = "center";
  ctx.fillText(label, x, by + 13);
  ctx.fillStyle = "#fff"; ctx.fillText(val.toLocaleString("fr-FR") + " €", x, by + 25);
}

function cloud(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, 7); ctx.arc(x + 20, y - 8, 20, 0, 7); ctx.arc(x + 40, y, 16, 0, 7);
  ctx.rect(x - 6, y, 52, 16); ctx.fill();
}

function drawChar(ctx: CanvasRenderingContext2D, x: number, y: number, char: Char, face: number, bob: number) {
  const def = CHARS.find((c) => c.id === char)!;
  ctx.save(); ctx.translate(x + 17, y + 20); ctx.scale(face, 1); ctx.translate(0, bob * 1.5);
  const sh = "#f7c9a3";
  if (char === "yoshi") {
    ctx.fillStyle = def.c1; rrect(ctx, -14, -6, 26, 26, 10);                 // corps
    ctx.fillStyle = "#fff"; rrect(ctx, -8, 4, 18, 14, 6);                    // ventre
    ctx.fillStyle = def.c1; ctx.beginPath(); ctx.arc(8, -14, 11, 0, 7); ctx.fill(); // tête
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(16, -10, 8, 6, 0, 0, 7); ctx.fill(); // museau
    ctx.fillStyle = "#1c1a17"; ctx.beginPath(); ctx.arc(8, -18, 2.4, 0, 7); ctx.fill();
  } else if (char === "bowser") {
    ctx.fillStyle = def.c2; ctx.beginPath(); ctx.arc(-4, 4, 18, 0, 7); ctx.fill();   // carapace
    ctx.fillStyle = def.c1; rrect(ctx, -12, -8, 24, 26, 8);                          // corps
    ctx.fillStyle = def.c1; ctx.beginPath(); ctx.arc(8, -14, 11, 0, 7); ctx.fill();  // tête
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(2, -22); ctx.lineTo(5, -30); ctx.lineTo(8, -22); ctx.fill();
    ctx.beginPath(); ctx.moveTo(12, -22); ctx.lineTo(15, -30); ctx.lineTo(18, -22); ctx.fill();
    ctx.fillStyle = "#1c1a17"; ctx.beginPath(); ctx.arc(9, -15, 2.2, 0, 7); ctx.fill();
  } else {
    // Mario / Luigi / Peach (humanoïde)
    ctx.fillStyle = def.c2; rrect(ctx, -12, 0, 24, 22, 6);                    // corps / robe
    ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(2, -10, 11, 0, 7); ctx.fill(); // tête
    if (char === "peach") {
      ctx.fillStyle = "#ffd86b"; rrect(ctx, -10, -16, 24, 12, 6);             // cheveux
      ctx.fillStyle = "#ffd000"; ctx.beginPath(); ctx.moveTo(-4, -22); ctx.lineTo(0, -28); ctx.lineTo(4, -22); ctx.lineTo(8, -28); ctx.lineTo(12, -22); ctx.fill(); // couronne
    } else {
      ctx.fillStyle = def.c1; ctx.beginPath(); ctx.arc(2, -14, 12, Math.PI, 0); ctx.fill(); // casquette
      ctx.fillRect(-10, -15, 26, 3);
      ctx.fillStyle = "#5a3210"; ctx.fillRect(6, -8, 9, 3);                   // moustache
    }
    ctx.fillStyle = "#1c1a17"; ctx.beginPath(); ctx.arc(6, -10, 2, 0, 7); ctx.fill(); // œil
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-12, 14, 4, 0, 7); ctx.arc(14, 14, 4, 0, 7); ctx.fill(); // gants
  }
  ctx.restore();
}
function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill();
}

/* ───────── rapport de données (écran de fin) ───────── */
function WinReport({ data, coins, onReplay }: { data: Pt[]; coins: number; onReplay: () => void }) {
  const start = data[0].prix, end = data[data.length - 1].prix;
  const evo = ((end - start) / start) * 100;
  const prices = data.map((d) => d.prix);
  const maxI = prices.indexOf(Math.max(...prices)), minI = prices.indexOf(Math.min(...prices));
  let jI = 1, jv = 0;
  for (let i = 1; i < data.length; i++) {
    const dlt = data[i].prix - data[i - 1].prix;
    if (Math.abs(dlt) > Math.abs(jv)) { jv = dlt; jI = i; }
  }
  const volTot = data.reduce((a, d) => a + d.volume, 0);
  const fr = (n: number) => n.toLocaleString("fr-FR");
  const Row = ({ k, v, sub }: any) => (
    <div className="rounded-xl border border-line bg-ink/50 p-3 text-left">
      <div className="text-[10px] uppercase tracking-wide text-muted">{k}</div>
      <div className="font-mono text-base font-semibold text-fg">{v}</div>
      {sub && <div className="text-[11px] text-muted">{sub}</div>}
    </div>
  );
  return (
    <div className="absolute inset-2 z-20 grid place-items-center rounded-xl bg-ink/85 p-4 backdrop-blur">
      <div className="w-full max-w-lg text-center">
        <div className="font-display text-3xl font-bold text-amber">🏁 Parcours terminé !</div>
        <p className="mt-1 text-sm text-muted">Voici ce que raconte la donnée que tu viens de parcourir :</p>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <Row k="Période" v={`${data[0].mois} → ${data[data.length - 1].mois}`} sub={`${data.length} mois`} />
          <Row k="Évolution" v={`${evo >= 0 ? "+" : ""}${evo.toFixed(1)} %`} sub={`${fr(start)} → ${fr(end)} €/m²`} />
          <Row k="Pièces / données" v={`${coins}/${data.length}`} sub="mois collectés" />
          <Row k="📈 Sommet" v={`${fr(data[maxI].prix)} €`} sub={data[maxI].mois} />
          <Row k="📉 Creux" v={`${fr(data[minI].prix)} €`} sub={data[minI].mois} />
          <Row k="Plus forte variation" v={`${jv >= 0 ? "+" : ""}${fr(jv)} €`} sub={data[jI].mois} />
        </div>
        <p className="mt-3 text-xs text-muted">Volume total parcouru : <b className="text-fg">{fr(volTot)}</b> ventes</p>
        <button onClick={onReplay} className="mt-4 rounded-xl bg-amber px-5 py-2.5 font-semibold text-[#1a1206]">Rejouer 🔁</button>
      </div>
    </div>
  );
}
