import { useCallback, useEffect, useRef, useState } from "react";

/* ───────── Audio synthétisé (Web Audio) — sons façon Mario ───────── */
export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState(() => localStorage.getItem("dvf-muted") === "1");
  useEffect(() => { localStorage.setItem("dvf-muted", muted ? "1" : "0"); }, [muted]);

  const ensure = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  };
  const note = (freq: number, start: number, dur: number, type: OscillatorType = "square", gain = 0.05) => {
    const ac = ensure(); const t = ac.currentTime + start;
    const o = ac.createOscillator(); const g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.02);
  };
  /* pièce : si bémol5 -> mi6 (le fameux "bling") */
  const coin = useCallback(() => { if (muted) return; note(988, 0, 0.08); note(1319, 0.07, 0.18); }, [muted]);
  /* saut : balayage montant */
  const jump = useCallback(() => {
    if (muted) return; const ac = ensure(); const t = ac.currentTime;
    const o = ac.createOscillator(); const g = ac.createGain();
    o.type = "square"; o.frequency.setValueAtTime(360, t); o.frequency.exponentialRampToValueAtTime(760, t + 0.13);
    o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(0.045, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.start(t); o.stop(t + 0.18);
  }, [muted]);
  /* power-up : gamme ascendante */
  const powerup = useCallback(() => {
    if (muted) return; [392, 523, 659, 784, 1047, 1319].forEach((f, i) => note(f, i * 0.07, 0.16, "square", 0.05));
  }, [muted]);

  return { muted, setMuted, coin, jump, powerup };
}

/* ───────── pièces qui jaillissent au clic ───────── */
function spawnCoins(x: number, y: number) {
  for (let i = 0; i < 6; i++) {
    const s = document.createElement("span");
    s.textContent = "🪙";
    Object.assign(s.style, {
      position: "fixed", left: x + "px", top: y + "px", zIndex: "9999", pointerEvents: "none",
      fontSize: 14 + Math.random() * 12 + "px", transform: "translate(-50%,-50%)",
      filter: "drop-shadow(0 2px 2px rgba(0,0,0,.3))",
    } as CSSStyleDeclaration);
    document.body.appendChild(s);
    const dx = (Math.random() - 0.5) * 120;
    s.animate(
      [
        { transform: "translate(-50%,-50%) translateY(0) rotate(0deg)", opacity: 1 },
        { transform: `translate(-50%,-50%) translate(${dx}px, -90px) rotate(${(Math.random() - .5) * 360}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(-50%,-50%) translate(${dx * 1.3}px, 40px) rotate(${(Math.random() - .5) * 540}deg)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 300, easing: "cubic-bezier(.3,.7,.4,1)" }
    ).onfinish = () => s.remove();
  }
}

/* ───────── décor + effets (mode Mario) ───────── */
export function MarioFx({ active, onClickSound }: { active: boolean; onClickSound?: () => void }) {
  useEffect(() => {
    if (!active) return;
    const onClick = (e: MouseEvent) => { spawnCoins(e.clientX, e.clientY); onClickSound?.(); };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [active, onClickSound]);

  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
      {/* nuages qui défilent */}
      <div style={{ position: "absolute", top: "8%", animation: "drift 38s linear infinite" }}><Cloud /></div>
      <div style={{ position: "absolute", top: "24%", scale: "0.7", animation: "drift 52s linear infinite", animationDelay: "-8s" }}><Cloud /></div>
      <div style={{ position: "absolute", top: "50%", scale: "0.85", animation: "drift 64s linear infinite", animationDelay: "-30s" }}><Cloud /></div>
      {/* éléments flottants */}
      <div style={{ position: "absolute", right: "4%", top: "16%", animation: "floaty 4s ease-in-out infinite" }}><QBlock /></div>
      <div style={{ position: "absolute", left: "calc(252px + 3%)", bottom: "14%", animation: "floaty 5s ease-in-out infinite", animationDelay: "-1.5s", opacity: .9 }}><Coin /></div>
      <div style={{ position: "absolute", right: "9%", bottom: "16%", animation: "floaty 6s ease-in-out infinite", animationDelay: "-2s" }}><Star /></div>
      <div style={{ position: "absolute", right: "2%", bottom: "26px" }}><Pipe /></div>
      {/* Mario qui court sur le sol */}
      <div style={{ position: "absolute", bottom: 22, animation: "mario-run 16s linear infinite" }}>
        <div style={{ animation: "mario-bob .42s ease-in-out infinite" }}><MarioChar /></div>
      </div>
      {/* sol en briques */}
      <div style={{ position: "absolute", insetInline: 0, bottom: 0, height: 26 }}>
        <svg width="100%" height="26" preserveAspectRatio="none" viewBox="0 0 64 26">
          <defs>
            <pattern id="brick" width="32" height="26" patternUnits="userSpaceOnUse">
              <rect width="32" height="26" fill="#c84c0c" />
              <rect width="32" height="13" fill="#e06a1e" />
              <rect x="0" y="0" width="32" height="2" fill="#7a2e06" />
              <rect x="0" y="13" width="32" height="2" fill="#7a2e06" />
              <rect x="15" y="2" width="2" height="11" fill="#7a2e06" />
              <rect x="-1" y="15" width="2" height="11" fill="#7a2e06" />
              <rect x="31" y="15" width="2" height="11" fill="#7a2e06" />
            </pattern>
          </defs>
          <rect width="64" height="26" fill="url(#brick)" />
        </svg>
      </div>
    </div>
  );
}

/* ───────── SVG Mario ───────── */
export function MarioGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <circle cx="20" cy="20" r="18" fill="#e52521" stroke="#1c1a17" strokeWidth="2.5" />
      <path d="M11 26V15h4l5 6 5-6h4v11" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
function Coin() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden style={{ animation: "spin-coin 1.6s ease-in-out infinite" }}>
      <circle cx="17" cy="17" r="15" fill="#fbd000" stroke="#b07400" strokeWidth="2.5" />
      <ellipse cx="17" cy="17" rx="7" ry="11" fill="none" stroke="#e0a300" strokeWidth="2.5" />
    </svg>
  );
}
function QBlock() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
      <rect x="3" y="3" width="38" height="38" rx="5" fill="#f8b800" stroke="#7a4a00" strokeWidth="3" />
      {[[8, 8], [33, 8], [8, 33], [33, 33]].map(([x, y], i) => <rect key={i} x={x} y={y} width="3" height="3" fill="#7a4a00" />)}
      <text x="22" y="30" textAnchor="middle" fontSize="22" fontWeight="900" fill="#fff" fontFamily="Geist Mono">?</text>
    </svg>
  );
}
function Star() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
      <path d="M20 3l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="#fbd000" stroke="#b07400" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="16" cy="22" r="2" fill="#1c1a17" /><circle cx="24" cy="22" r="2" fill="#1c1a17" />
    </svg>
  );
}
function Pipe() {
  return (
    <svg width="70" height="80" viewBox="0 0 70 80" aria-hidden>
      <rect x="12" y="22" width="46" height="58" fill="#00a651" stroke="#1c1a17" strokeWidth="3" />
      <rect x="20" y="26" width="8" height="54" fill="#43d06a" />
      <rect x="3" y="2" width="64" height="24" rx="3" fill="#00a651" stroke="#1c1a17" strokeWidth="3" />
      <rect x="10" y="6" width="9" height="16" fill="#43d06a" />
    </svg>
  );
}
function MarioChar() {
  return (
    <svg width="46" height="58" viewBox="0 0 46 58" aria-hidden style={{ filter: "drop-shadow(0 3px 2px rgba(0,0,0,.25))" }}>
      {/* casquette */}
      <path d="M9 16C9 8 15 4 23 4s14 4 14 11l1 3H8z" fill="#e52521" stroke="#1c1a17" strokeWidth="1.6" />
      <circle cx="23" cy="11" r="4.4" fill="#fff" stroke="#1c1a17" strokeWidth="1.2" />
      <path d="M20.6 13.2V9h1.6l1.1 1.6L24.4 9H26v4.2" fill="none" stroke="#e52521" strokeWidth="1.3" strokeLinejoin="round" />
      {/* visage */}
      <rect x="12" y="17" width="22" height="15" rx="6" fill="#f7c9a3" stroke="#1c1a17" strokeWidth="1.4" />
      <path d="M11 31c-3 0-5-2-5-5" stroke="#5a3210" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M35 31c3 0 5-2 5-5" stroke="#5a3210" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="23" r="1.7" fill="#1c1a17" />
      <ellipse cx="27" cy="26" rx="3.4" ry="2.8" fill="#f0b48a" />
      {/* moustache */}
      <path d="M16 28q6 5 14 0q-3 4-7 4t-7-4z" fill="#5a3210" />
      {/* corps : salopette bleue + chemise rouge */}
      <path d="M13 33h20l3 16H10z" fill="#1f5fd8" stroke="#1c1a17" strokeWidth="1.5" />
      <path d="M13 33q4 6 10 6t10-6" fill="#e52521" />
      <rect x="17" y="33" width="3.4" height="10" fill="#1f5fd8" stroke="#1c1a17" strokeWidth="1" />
      <rect x="25.6" y="33" width="3.4" height="10" fill="#1f5fd8" stroke="#1c1a17" strokeWidth="1" />
      <circle cx="18.7" cy="41" r="1.6" fill="#fbd000" stroke="#1c1a17" strokeWidth=".8" />
      <circle cx="27.3" cy="41" r="1.6" fill="#fbd000" stroke="#1c1a17" strokeWidth=".8" />
      {/* gants */}
      <circle cx="9" cy="38" r="3.6" fill="#fff" stroke="#1c1a17" strokeWidth="1.3" />
      <circle cx="37" cy="38" r="3.6" fill="#fff" stroke="#1c1a17" strokeWidth="1.3" />
      {/* chaussures */}
      <ellipse cx="16" cy="51" rx="5" ry="3.4" fill="#5a3210" stroke="#1c1a17" strokeWidth="1.3" />
      <ellipse cx="30" cy="51" rx="5" ry="3.4" fill="#5a3210" stroke="#1c1a17" strokeWidth="1.3" />
    </svg>
  );
}
function Cloud() {
  return (
    <svg width="92" height="50" viewBox="0 0 92 50" aria-hidden style={{ opacity: 0.95 }}>
      <g fill="#fff" stroke="#cfe0ff" strokeWidth="2">
        <circle cx="26" cy="30" r="16" /><circle cx="46" cy="22" r="20" /><circle cx="66" cy="30" r="16" />
        <rect x="14" y="30" width="64" height="16" rx="8" stroke="none" />
      </g>
    </svg>
  );
}
