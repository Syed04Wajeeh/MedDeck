import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

/* ============================================================================
   MedDeck — a cozy MCAT study garden 🌸
   A single self-contained React component. Pink, floral, organized, and built
   to feel like a product you'd actually pay for.

   Study modes: Flashcards · Quiz · Match · Triage (spaced-repetition sort) ·
   Warm-Up (live Open Trivia DB fetch, graceful fallback).
   ============================================================================ */

/* ----------------------------------------------------------------------------
   1. THEME + GLOBAL STYLES
   Injected once via a <style> tag so the whole thing stays in one file.
---------------------------------------------------------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Quicksand:wght@400;500;600;700&display=swap');

:root{
  --blush:#fff5fa; --blush-2:#ffe9f3; --petal:#ffd7ea; --rose:#f48fb6;
  --rose-deep:#e85a9c; --plum:#5b4266; --plum-soft:#8a6f95; --ink:#4a3b52;
  --leaf:#5fb98a; --leaf-deep:#3f9a6c; --coral:#f4736b; --gold:#f2b64e;
  --card:#ffffff; --line:#ffd9ea; --shadow:26px 26px 60px rgba(232,90,156,.10);
  --on-bg:#4a3b52; --on-bg-soft:#8a6f95;
  /* text + surfaces (theme-aware) */
  --ink:#4a3b52; --plum:#5b4266; --plum-soft:#8a6f95;
  --card-2:#fff3f9; --muted:#fafafa; --track:#f2e6ee; --track2:#ffe6f2;
  --good-bg:#eafaf0; --good-ink:#3f9a6c; --bad-bg:#ffecea; --bad-ink:#c0433a;
}
.md-root.dark{
  --on-bg:#ffe3f1; --on-bg-soft:#d6b9d8;
  --shadow:0 24px 60px rgba(0,0,0,.45);
  --ink:#f2e7f2; --plum:#e6d3ea; --plum-soft:#b79ec6;
  --card:#372b46; --card-2:#40324f; --line:#54445f; --muted:#2f2440;
  --track:#241a30; --track2:#2a1f38;
  --good-bg:#1f3c2b; --good-ink:#87e6ac; --bad-bg:#43242a; --bad-ink:#ff9f97;
}
*{box-sizing:border-box;}
.md-root{
  font-family:'Quicksand',system-ui,sans-serif; color:var(--ink);
  background:
    radial-gradient(1200px 700px at 12% -8%, #fff 0%, rgba(255,255,255,0) 55%),
    radial-gradient(900px 600px at 108% 6%, var(--petal) 0%, rgba(255,215,234,0) 60%),
    linear-gradient(160deg,var(--blush) 0%, var(--blush-2) 60%, #ffe0ef 100%);
  min-height:100%; width:100%; padding:0; margin:0;
  -webkit-font-smoothing:antialiased; transition:background .5s ease;
}
/* Evening garden — twilight backdrop with a few stars; cards stay luminous */
.md-root.dark{
  background:
    radial-gradient(2px 2px at 20% 18%, rgba(255,255,255,.7), transparent),
    radial-gradient(2px 2px at 68% 12%, rgba(255,255,255,.55), transparent),
    radial-gradient(1.5px 1.5px at 82% 30%, rgba(255,255,255,.6), transparent),
    radial-gradient(1.5px 1.5px at 38% 40%, rgba(255,255,255,.45), transparent),
    radial-gradient(1200px 700px at 12% -8%, rgba(232,90,156,.18) 0%, transparent 55%),
    radial-gradient(900px 600px at 108% 6%, rgba(123,110,240,.22) 0%, transparent 60%),
    linear-gradient(165deg,#2a2036 0%, #3a2545 55%, #241a31 100%);
}
.md-serif{font-family:'Fraunces',Georgia,serif;}
.md-wrap{max-width:1060px;margin:0 auto;padding:22px 18px 90px;}

/* buttons */
.md-btn{font-family:inherit;cursor:pointer;border:none;border-radius:16px;
  font-weight:600;transition:transform .12s ease, box-shadow .2s ease, background .2s;}
.md-btn:active{transform:translateY(1px) scale(.99);}
.md-btn.primary{background:linear-gradient(135deg,var(--rose-deep),#ff86bd);color:#fff;
  padding:13px 22px;box-shadow:0 10px 22px rgba(232,90,156,.32);}
.md-btn.primary:hover{box-shadow:0 14px 30px rgba(232,90,156,.42);transform:translateY(-1px);}
.md-btn.ghost{background:var(--card);color:var(--plum);padding:11px 18px;border:2px solid var(--line);}
.md-btn.ghost:hover{border-color:var(--rose);background:var(--card-2);}
.md-btn.mini{padding:8px 14px;font-size:.85rem;border-radius:12px;}
.md-btn:disabled{opacity:.4;cursor:not-allowed;transform:none;}

.md-card{background:var(--card);border:1px solid var(--line);border-radius:26px;
  box-shadow:var(--shadow);}
.md-chip{display:inline-flex;align-items:center;gap:6px;font-size:.72rem;font-weight:700;
  letter-spacing:.04em;text-transform:uppercase;padding:5px 11px;border-radius:999px;}

.md-fadein{animation:mdFade .5s ease both;}
@keyframes mdFade{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
.md-pop{animation:mdPop .35s cubic-bezier(.2,1.3,.4,1) both;}
@keyframes mdPop{from{opacity:0;transform:scale(.9);}to{opacity:1;transform:none;}}
@keyframes mdSpin{to{transform:rotate(360deg);}}
@keyframes mdSway{0%,100%{transform:rotate(-4deg);}50%{transform:rotate(4deg);}}
@keyframes mdBloom{0%{transform:scale(0) rotate(-40deg);opacity:0;}
  60%{transform:scale(1.15) rotate(6deg);}100%{transform:scale(1) rotate(0);opacity:1;}}
@keyframes mdFall{0%{transform:translateY(-10vh) rotate(0);opacity:1;}
  100%{transform:translateY(110vh) rotate(540deg);opacity:0;}}

/* flashcard flip */
.md-flip{perspective:1800px;}
.md-flip-inner{position:relative;transform-style:preserve-3d;transition:transform .6s cubic-bezier(.4,.1,.2,1);}
.md-flip.flipped .md-flip-inner{transform:rotateY(180deg);}
.md-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;
  display:flex;flex-direction:column;}
.md-face.back{transform:rotateY(180deg);}

/* inputs / range */
.md-range{-webkit-appearance:none;appearance:none;height:8px;border-radius:8px;
  background:var(--petal);outline:none;}
.md-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;
  background:var(--rose-deep);cursor:pointer;box-shadow:0 3px 8px rgba(232,90,156,.5);border:3px solid #fff;}
.md-range::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:var(--rose-deep);
  cursor:pointer;border:3px solid #fff;}

.md-scroll::-webkit-scrollbar{width:10px;height:10px;}
.md-scroll::-webkit-scrollbar-thumb{background:var(--petal);border-radius:8px;}

@media (max-width:640px){
  .md-wrap{padding:16px 12px 90px;}
  .md-hide-sm{display:none !important;}
}
`;

/* palette helpers used inline */
const C = {
  blush:"#fff5fa", petal:"#ffd7ea", rose:"#f48fb6", roseDeep:"#e85a9c",
  plum:"var(--plum)", plumSoft:"var(--plum-soft)", ink:"var(--ink)", leaf:"#5fb98a",
  leafDeep:"var(--good-ink)", coral:"#f4736b", gold:"#f2b64e", card:"var(--card)", line:"var(--line)",
};

const SECTIONS = {
  BB: { key:"BB", label:"Bio / Biochem", short:"B/B", color:"#e85a9c", soft:"#ffe1ef", emoji:"🌸" },
  CP: { key:"CP", label:"Chem / Physics", short:"C/P", color:"#7b6ef0", soft:"#e9e6ff", emoji:"🌷" },
  PS: { key:"PS", label:"Psych / Soc", short:"P/S", color:"#3f9a6c", soft:"#dcf4e7", emoji:"🌿" },
  OC: { key:"OC", label:"Organic Chem", short:"OChem", color:"#c96a2b", soft:"#ffe7d1", emoji:"🍁" },
  DV: { key:"DV", label:"Development", short:"Dev", color:"#8a5cd6", soft:"#ece0ff", emoji:"🌻" },
};
const DIFFS = {
  foundation:{ label:"Foundation", color:"#5fb98a", emoji:"🌱" },
  medium:{ label:"Medium", color:"#f2b64e", emoji:"🌼" },
  hard:{ label:"Hard", color:"#f4736b", emoji:"🌹" },
};

/* ----------------------------------------------------------------------------
   2. LITTLE FLORAL SVGs (mascots / decoration)
---------------------------------------------------------------------------- */
function Flower({ size=26, color=C.rose, center=C.gold, sway=false, style }) {
  const petals=[0,72,144,216,288];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40"
      style={{ transformOrigin:"20px 20px", animation:sway?"mdSway 3s ease-in-out infinite":"none", ...style }}>
      {petals.map((a,i)=>(
        <ellipse key={i} cx="20" cy="9" rx="6.4" ry="9.2" fill={color}
          transform={`rotate(${a} 20 20)`} opacity="0.95"/>
      ))}
      <circle cx="20" cy="20" r="6" fill={center}/>
      <circle cx="20" cy="20" r="6" fill="none" stroke="#fff" strokeWidth="1.4" opacity=".5"/>
    </svg>
  );
}
function Sprout({ size=22, color=C.leaf }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <path d="M20 34 V18" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <path d="M20 22 C12 20 9 13 10 9 C16 9 21 14 20 22Z" fill={color} opacity=".9"/>
      <path d="M20 25 C28 22 31 16 30 12 C24 12 19 17 20 25Z" fill={color}/>
    </svg>
  );
}

/* ----------------------------------------------------------------------------
   3. SVG DIAGRAM LIBRARY  (referenced by questions via `dia:"key"`)
   Each returns an <svg>. Colors chosen to read on white cards.
---------------------------------------------------------------------------- */
const I = "#4a3b52", PINK="#e85a9c", BLU="#7b6ef0", GRN="#3f9a6c", ORG="#f2894e", GRY="#c9b7d3";
const ax = (x1,y1,x2,y2)=><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={I} strokeWidth="2" markerEnd="url(#mdArrow)"/>;

const DIA = {
  michaelis:()=>(
    <svg viewBox="0 0 260 170" width="100%" style={{maxWidth:340}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      {ax(30,140,240,140)}{ax(30,140,30,18)}
      <path d="M30 138 C90 138 100 55 230 45" fill="none" stroke={PINK} strokeWidth="3"/>
      <line x1="30" y1="45" x2="230" y2="45" stroke={GRY} strokeDasharray="5 5"/>
      <text x="150" y="40" fontSize="11" fill={I}>Vmax</text>
      <line x1="70" y1="140" x2="70" y2="92" stroke={BLU} strokeDasharray="4 4"/>
      <text x="60" y="155" fontSize="10" fill={BLU}>Km</text>
      <line x1="30" y1="92" x2="70" y2="92" stroke={BLU} strokeDasharray="4 4"/>
      <text x="12" y="96" fontSize="9" fill={BLU}>½V</text>
      <text x="120" y="165" fontSize="11" fill={I}>[S]</text>
      <text x="6" y="20" fontSize="11" fill={I}>V</text>
    </svg>
  ),
  inhibition:()=>(
    <svg viewBox="0 0 270 175" width="100%" style={{maxWidth:360}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      {ax(30,145,250,145)}{ax(30,145,30,18)}
      <path d="M30 143 C90 143 100 45 245 38" fill="none" stroke={GRN} strokeWidth="3"/>
      <text x="200" y="30" fontSize="10" fill={GRN}>no inhibitor</text>
      <path d="M30 143 C130 143 150 60 245 55" fill="none" stroke={PINK} strokeWidth="3" strokeDasharray="6 4"/>
      <text x="150" y="78" fontSize="10" fill={PINK}>competitive</text>
      <path d="M30 143 C95 143 105 78 245 72" fill="none" stroke={BLU} strokeWidth="3" strokeDasharray="2 4"/>
      <text x="120" y="112" fontSize="10" fill={BLU}>noncompetitive</text>
      <text x="120" y="170" fontSize="11" fill={I}>[S]</text><text x="6" y="20" fontSize="11" fill={I}>V</text>
    </svg>
  ),
  titration:()=>(
    <svg viewBox="0 0 260 180" width="100%" style={{maxWidth:340}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      {ax(30,155,245,155)}{ax(30,155,30,15)}
      <path d="M35 148 C70 143 78 130 92 118 C110 100 110 70 118 55 C128 38 150 30 220 26" fill="none" stroke={PINK} strokeWidth="3"/>
      <circle cx="92" cy="118" r="4" fill={GOLD_()}/><text x="98" y="120" fontSize="9" fill={I}>½ eq: pH=pKa</text>
      <circle cx="118" cy="55" r="4" fill={BLU}/><text x="124" y="52" fontSize="9" fill={BLU}>equiv. pt</text>
      <line x1="30" y1="118" x2="92" y2="118" stroke={GRY} strokeDasharray="4 4"/>
      <text x="118" y="175" fontSize="10" fill={I}>volume base added</text><text x="4" y="22" fontSize="11" fill={I}>pH</text>
    </svg>
  ),
  centralDogma:()=>(
    <svg viewBox="0 0 300 90" width="100%" style={{maxWidth:400}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      <rect x="8" y="30" width="70" height="34" rx="10" fill="#ffe1ef" stroke={PINK}/><text x="43" y="52" fontSize="13" textAnchor="middle" fill={I} fontWeight="700">DNA</text>
      <rect x="115" y="30" width="70" height="34" rx="10" fill="#e9e6ff" stroke={BLU}/><text x="150" y="52" fontSize="13" textAnchor="middle" fill={I} fontWeight="700">mRNA</text>
      <rect x="222" y="30" width="72" height="34" rx="10" fill="#dcf4e7" stroke={GRN}/><text x="258" y="52" fontSize="12" textAnchor="middle" fill={I} fontWeight="700">Protein</text>
      <line x1="80" y1="47" x2="112" y2="47" stroke={I} strokeWidth="2" markerEnd="url(#mdArrow)"/>
      <text x="96" y="40" fontSize="8.5" textAnchor="middle" fill={I}>transcr.</text>
      <line x1="187" y1="47" x2="219" y2="47" stroke={I} strokeWidth="2" markerEnd="url(#mdArrow)"/>
      <text x="203" y="40" fontSize="8.5" textAnchor="middle" fill={I}>transl.</text>
      <path d="M43 30 C43 10 78 10 78 26" fill="none" stroke={PINK} strokeWidth="2" markerEnd="url(#mdArrow)"/>
      <text x="62" y="10" fontSize="8" textAnchor="middle" fill={PINK}>replication</text>
    </svg>
  ),
  replicationFork:()=>(
    <svg viewBox="0 0 260 150" width="100%" style={{maxWidth:340}}>
      <defs><marker id="mdArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill={I}/></marker></defs>
      <path d="M20 75 L120 75" stroke={I} strokeWidth="3"/>
      <path d="M120 75 L235 40" stroke={PINK} strokeWidth="3"/>
      <path d="M120 75 L235 110" stroke={BLU} strokeWidth="3"/>
      <text x="150" y="34" fontSize="10" fill={PINK}>leading (5'→3' cont.)</text>
      <text x="150" y="128" fontSize="10" fill={BLU}>lagging (Okazaki)</text>
      <line x1="150" y1="97" x2="180" y2="90" stroke={BLU} strokeWidth="2" strokeDasharray="4 3"/>
      <line x1="185" y1="103" x2="215" y2="96" stroke={BLU} strokeWidth="2" strokeDasharray="4 3"/>
      <circle cx="120" cy="75" r="7" fill={GOLD_()}/><text x="86" y="70" fontSize="9" fill={I}>helicase</text>
    </svg>
  ),
  glycolysis:()=>(
    <svg viewBox="0 0 300 92" width="100%" style={{maxWidth:400}}>
      <defs><marker id="mdArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill={I}/></marker></defs>
      {["Glucose","G6P","F6P","F1,6BP","Pyruvate"].map((t,i)=>(
        <g key={i}><rect x={6+i*58} y="30" width="50" height="30" rx="8" fill="#ffe1ef" stroke={PINK}/>
        <text x={31+i*58} y="49" fontSize="9" textAnchor="middle" fill={I} fontWeight="600">{t}</text></g>
      ))}
      {[0,1,2,3].map(i=><line key={i} x1={56+i*58} y1="45" x2={62+i*58} y2="45" stroke={I} strokeWidth="2" markerEnd="url(#mdArrow)"/>)}
      <text x="152" y="22" fontSize="9" textAnchor="middle" fill={GRN} fontWeight="700">PFK-1 ★ rate-limiting</text>
      <line x1="152" y1="24" x2="152" y2="30" stroke={GRN}/>
      <text x="150" y="80" fontSize="9" textAnchor="middle" fill={I}>net: 2 ATP · 2 NADH</text>
    </svg>
  ),
  actionPotential:()=>(
    <svg viewBox="0 0 270 180" width="100%" style={{maxWidth:350}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      {ax(30,150,255,150)}{ax(30,168,30,12)}
      <line x1="30" y1="120" x2="250" y2="120" stroke={GRY} strokeDasharray="4 4"/><text x="228" y="134" fontSize="8" fill={GRY}>−70 rest</text>
      <line x1="30" y1="108" x2="250" y2="108" stroke={GRY} strokeDasharray="2 5"/><text x="228" y="105" fontSize="8" fill={GRY}>−55 thr.</text>
      <path d="M30 120 L70 118 L90 108 L110 28 L128 120 L138 162 L165 120 L255 120" fill="none" stroke={PINK} strokeWidth="3"/>
      <text x="100" y="24" fontSize="9" fill={PINK}>Na⁺ in</text>
      <text x="132" y="150" fontSize="9" fill={BLU}>K⁺ out</text>
      <text x="140" y="176" fontSize="8" fill={GRN}>hyperpol.</text>
      <text x="4" y="80" fontSize="9" fill={I} transform="rotate(-90 8 80)">mV</text>
    </svg>
  ),
  lens:()=>(
    <svg viewBox="0 0 280 150" width="100%" style={{maxWidth:360}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      <line x1="10" y1="75" x2="270" y2="75" stroke={GRY}/>
      <ellipse cx="140" cy="75" rx="12" ry="55" fill="#e9e6ff" stroke={BLU} strokeWidth="2"/>
      <circle cx="90" cy="75" r="3" fill={I}/><text x="82" y="70" fontSize="8" fill={I}>2F</text>
      <circle cx="115" cy="75" r="3" fill={I}/><text x="112" y="70" fontSize="8" fill={I}>F</text>
      <circle cx="165" cy="75" r="3" fill={I}/><circle cx="190" cy="75" r="3" fill={I}/>
      <line x1="70" y1="75" x2="70" y2="35" stroke={PINK} strokeWidth="3" markerEnd="url(#mdArrow)"/>
      <line x1="70" y1="35" x2="140" y2="35" stroke={GRN} strokeWidth="1.5"/>
      <line x1="140" y1="35" x2="215" y2="110" stroke={GRN} strokeWidth="1.5"/>
      <line x1="70" y1="35" x2="215" y2="110" stroke={GRN} strokeWidth="1.5"/>
      <line x1="215" y1="75" x2="215" y2="110" stroke={PINK} strokeWidth="3" markerEnd="url(#mdArrow)"/>
      <text x="200" y="126" fontSize="8" fill={PINK}>real, inverted</text>
    </svg>
  ),
  circuit:()=>(
    <svg viewBox="0 0 240 150" width="100%" style={{maxWidth:320}}>
      <rect x="20" y="20" width="200" height="110" rx="6" fill="none" stroke={I} strokeWidth="2"/>
      <line x1="18" y1="60" x2="18" y2="90" stroke="#fff" strokeWidth="6"/>
      <line x1="12" y1="66" x2="24" y2="66" stroke={I} strokeWidth="2"/><line x1="15" y1="84" x2="21" y2="84" stroke={I} strokeWidth="3"/>
      <text x="30" y="80" fontSize="10" fill={I}>V</text>
      <rect x="80" y="12" width="46" height="16" rx="3" fill="#ffe1ef" stroke={PINK}/><text x="103" y="24" fontSize="9" textAnchor="middle" fill={I}>R₁</text>
      <rect x="150" y="12" width="46" height="16" rx="3" fill="#ffe1ef" stroke={PINK}/><text x="173" y="24" fontSize="9" textAnchor="middle" fill={I}>R₂</text>
      <text x="120" y="148" fontSize="9" textAnchor="middle" fill={I}>series: R_eq = R₁ + R₂</text>
    </svg>
  ),
  inclinedPlane:()=>(
    <svg viewBox="0 0 250 150" width="100%" style={{maxWidth:330}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      <path d="M20 130 L220 130 L20 50 Z" fill="#ffe1ef" stroke={PINK} strokeWidth="2"/>
      <rect x="70" y="78" width="26" height="20" rx="3" fill={BLU} transform="rotate(-22 83 88)"/>
      <line x1="83" y1="88" x2="83" y2="128" stroke={GRN} strokeWidth="2.5" markerEnd="url(#mdArrow)"/><text x="87" y="120" fontSize="9" fill={GRN}>mg</text>
      <line x1="83" y1="88" x2="52" y2="76" stroke={ORG} strokeWidth="2.5" markerEnd="url(#mdArrow)"/><text x="30" y="72" fontSize="8" fill={ORG}>mg·sinθ</text>
      <path d="M40 130 A20 20 0 0 1 48 116" fill="none" stroke={I}/><text x="30" y="126" fontSize="10" fill={I}>θ</text>
    </svg>
  ),
  sn2:()=>(
    <svg viewBox="0 0 280 110" width="100%" style={{maxWidth:380}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      <text x="12" y="60" fontSize="12" fill={GRN} fontWeight="700">Nu⁻</text>
      <path d="M32 56 L70 56" stroke={GRN} strokeWidth="2" markerEnd="url(#mdArrow)"/>
      <circle cx="95" cy="56" r="14" fill="#e9e6ff" stroke={BLU} strokeWidth="2"/><text x="95" y="60" fontSize="10" textAnchor="middle" fill={I}>C</text>
      <text x="120" y="60" fontSize="11" fill={PINK}>LG</text>
      <path d="M112 56 L150 56" stroke={PINK} strokeWidth="2" markerEnd="url(#mdArrow)"/>
      <text x="200" y="30" fontSize="9" fill={I}>backside attack →</text>
      <text x="180" y="60" fontSize="10" fill={I}>inversion (Walden)</text>
      <path d="M175 70 C195 88 215 88 235 70" fill="none" stroke={BLU} strokeWidth="2"/>
      <text x="150" y="100" fontSize="9" fill={I}>rate = k[substrate][Nu]  · 2nd order</text>
    </svg>
  ),
  sn1:()=>(
    <svg viewBox="0 0 280 110" width="100%" style={{maxWidth:380}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      <circle cx="55" cy="52" r="14" fill="#e9e6ff" stroke={BLU} strokeWidth="2"/><text x="55" y="56" fontSize="10" textAnchor="middle" fill={I}>C–LG</text>
      <path d="M78 52 L120 52" stroke={I} strokeWidth="2" markerEnd="url(#mdArrow)"/><text x="86" y="44" fontSize="8" fill={I}>slow</text>
      <text x="150" y="56" fontSize="12" fill={ORG} fontWeight="700">C⁺</text>
      <text x="140" y="30" fontSize="9" fill={ORG}>3° carbocation (planar)</text>
      <path d="M172 52 L212 52" stroke={GRN} strokeWidth="2" markerEnd="url(#mdArrow)"/><text x="180" y="44" fontSize="8" fill={GRN}>fast Nu</text>
      <text x="222" y="56" fontSize="10" fill={I}>racemic</text>
      <text x="150" y="100" fontSize="9" textAnchor="middle" fill={I}>rate = k[substrate]  · 1st order</text>
    </svg>
  ),
  chirality:()=>(
    <svg viewBox="0 0 260 130" width="100%" style={{maxWidth:340}}>
      <line x1="130" y1="10" x2="130" y2="120" stroke={GRY} strokeDasharray="5 5"/>
      <text x="118" y="128" fontSize="9" fill={GRY}>mirror</text>
      {[[70,-1],[190,1]].map(([cx,d],k)=>(
        <g key={k}>
          <circle cx={cx} cy="60" r="16" fill="#ffe1ef" stroke={PINK} strokeWidth="2"/><text x={cx} y="64" fontSize="11" textAnchor="middle" fill={I}>C</text>
          <line x1={cx} y1="44" x2={cx} y2="22" stroke={I} strokeWidth="2"/><text x={cx} y="18" fontSize="9" textAnchor="middle" fill={I}>H</text>
          <line x1={cx} y1="76" x2={cx} y2="98" stroke={I} strokeWidth="2"/><text x={cx} y="112" fontSize="9" textAnchor="middle" fill={I}>OH</text>
          <line x1={cx} y1="60" x2={cx+d*26} y2="48" stroke={I} strokeWidth="2"/><text x={cx+d*34} y="48" fontSize="9" textAnchor="middle" fill={GRN}>NH₂</text>
          <line x1={cx} y1="60" x2={cx-d*26} y2="72" stroke={I} strokeWidth="2"/><text x={cx-d*32} y="76" fontSize="9" textAnchor="middle" fill={BLU}>R</text>
        </g>
      ))}
      <text x="70" y="12" fontSize="9" textAnchor="middle" fill={I}>(R)</text><text x="190" y="12" fontSize="9" textAnchor="middle" fill={I}>(S)</text>
    </svg>
  ),
  aminoAcid:()=>(
    <svg viewBox="0 0 250 120" width="100%" style={{maxWidth:320}}>
      <circle cx="120" cy="60" r="16" fill="#e9e6ff" stroke={BLU} strokeWidth="2"/><text x="120" y="64" fontSize="10" textAnchor="middle" fill={I}>Cα</text>
      <text x="120" y="24" fontSize="10" textAnchor="middle" fill={I}>H</text><line x1="120" y1="44" x2="120" y2="30" stroke={I} strokeWidth="2"/>
      <text x="120" y="108" fontSize="10" textAnchor="middle" fill={I}>R</text><line x1="120" y1="76" x2="120" y2="96" stroke={I} strokeWidth="2"/>
      <rect x="18" y="46" width="72" height="28" rx="8" fill="#dcf4e7" stroke={GRN}/><text x="54" y="64" fontSize="11" textAnchor="middle" fill={I}>NH₃⁺</text>
      <line x1="90" y1="60" x2="104" y2="60" stroke={I} strokeWidth="2"/>
      <rect x="150" y="46" width="82" height="28" rx="8" fill="#ffe1ef" stroke={PINK}/><text x="191" y="64" fontSize="11" textAnchor="middle" fill={I}>COO⁻</text>
      <line x1="136" y1="60" x2="150" y2="60" stroke={I} strokeWidth="2"/>
      <text x="125" y="118" fontSize="9" textAnchor="middle" fill={I}>zwitterion (net 0 at pI)</text>
    </svg>
  ),
  gibbs:()=>(
    <svg viewBox="0 0 260 150" width="100%" style={{maxWidth:340}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      {ax(30,120,245,120)}{ax(30,120,30,15)}
      <path d="M40 40 C90 40 90 100 130 100 C170 100 175 60 220 60" fill="none" stroke={PINK} strokeWidth="3"/>
      <line x1="40" y1="40" x2="40" y2="120" stroke={GRY} strokeDasharray="3 3"/><text x="24" y="38" fontSize="8" fill={I}>R</text>
      <line x1="220" y1="60" x2="220" y2="120" stroke={GRY} strokeDasharray="3 3"/><text x="216" y="56" fontSize="8" fill={I}>P</text>
      <line x1="55" y1="42" x2="55" y2="90" stroke={GRN} strokeWidth="2" markerEnd="url(#mdArrow)"/><text x="58" y="72" fontSize="8" fill={GRN}>Ea</text>
      <text x="30" y="140" fontSize="9" fill={I}>ΔG&lt;0 exergonic (P lower than R)</text>
      <text x="4" y="20" fontSize="9" fill={I}>G</text>
    </svg>
  ),
  galvanic:()=>(
    <svg viewBox="0 0 280 150" width="100%" style={{maxWidth:360}}>
      <defs><marker id="mdArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill={I}/></marker></defs>
      <rect x="20" y="70" width="70" height="60" fill="#e9e6ff" stroke={BLU}/><rect x="190" y="70" width="70" height="60" fill="#ffe1ef" stroke={PINK}/>
      <rect x="48" y="55" width="8" height="70" fill={GRY}/><rect x="224" y="55" width="8" height="70" fill={ORG}/>
      <path d="M52 55 L52 30 L228 30 L228 55" fill="none" stroke={I} strokeWidth="2"/>
      <path d="M110 40 L150 40" stroke={GRN} strokeWidth="2" markerEnd="url(#mdArrow)"/><text x="130" y="34" fontSize="8" textAnchor="middle" fill={GRN}>e⁻</text>
      <text x="52" y="145" fontSize="9" textAnchor="middle" fill={I}>anode (−) oxid.</text>
      <text x="228" y="145" fontSize="9" textAnchor="middle" fill={I}>cathode (+) red.</text>
      <path d="M90 100 L190 100" stroke={I} strokeDasharray="4 3"/><text x="140" y="96" fontSize="8" textAnchor="middle" fill={I}>salt bridge</text>
    </svg>
  ),
  yerkesDodson:()=>(
    <svg viewBox="0 0 260 160" width="100%" style={{maxWidth:340}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      {ax(30,135,245,135)}{ax(30,135,30,15)}
      <path d="M35 130 C90 130 100 30 138 30 C176 30 185 130 240 130" fill="none" stroke={PINK} strokeWidth="3"/>
      <line x1="138" y1="30" x2="138" y2="135" stroke={GRY} strokeDasharray="4 4"/>
      <text x="112" y="150" fontSize="9" fill={GRN}>optimal</text>
      <text x="70" y="150" fontSize="9" fill={I}>arousal →</text>
      <text x="4" y="80" fontSize="8" fill={I} transform="rotate(-90 8 80)">performance</text>
    </svg>
  ),
  memoryModel:()=>(
    <svg viewBox="0 0 300 90" width="100%" style={{maxWidth:400}}>
      <defs><marker id="mdArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill={I}/></marker></defs>
      {["Sensory","Short-term","Long-term"].map((t,i)=>(
        <g key={i}><rect x={10+i*100} y="30" width="80" height="34" rx="10" fill="#dcf4e7" stroke={GRN}/>
        <text x={50+i*100} y="51" fontSize="10" textAnchor="middle" fill={I} fontWeight="600">{t}</text></g>
      ))}
      <line x1="90" y1="47" x2="108" y2="47" stroke={I} strokeWidth="2" markerEnd="url(#mdArrow)"/><text x="99" y="40" fontSize="7.5" textAnchor="middle" fill={I}>attn.</text>
      <line x1="190" y1="47" x2="208" y2="47" stroke={I} strokeWidth="2" markerEnd="url(#mdArrow)"/><text x="199" y="40" fontSize="7.5" textAnchor="middle" fill={I}>rehearsal</text>
      <path d="M208 60 C199 78 141 78 132 62" fill="none" stroke={BLU} strokeWidth="1.6" markerEnd="url(#mdArrow)"/><text x="170" y="82" fontSize="7.5" textAnchor="middle" fill={BLU}>retrieval</text>
    </svg>
  ),
  conditioning:()=>(
    <svg viewBox="0 0 300 96" width="100%" style={{maxWidth:400}}>
      <defs><marker id="mdArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill={I}/></marker></defs>
      <text x="12" y="30" fontSize="9" fill={I}>NS (bell) + UCS (food)</text>
      <line x1="120" y1="26" x2="150" y2="26" stroke={I} strokeWidth="2" markerEnd="url(#mdArrow)"/>
      <text x="160" y="30" fontSize="9" fill={I}>UCR (salivate)</text>
      <text x="12" y="70" fontSize="9" fill={PINK} fontWeight="700">CS (bell)</text>
      <line x1="80" y1="66" x2="150" y2="66" stroke={PINK} strokeWidth="2" markerEnd="url(#mdArrow)"/>
      <text x="160" y="70" fontSize="9" fill={PINK} fontWeight="700">CR (salivate)</text>
      <text x="12" y="90" fontSize="8" fill={GRY}>after repeated pairing</text>
    </svg>
  ),
  gasLaw:()=>(
    <svg viewBox="0 0 250 150" width="100%" style={{maxWidth:330}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      {ax(30,130,240,130)}{ax(30,130,30,15)}
      <path d="M45 30 C80 30 90 118 235 122" fill="none" stroke={PINK} strokeWidth="3"/>
      <text x="140" y="60" fontSize="10" fill={PINK}>P ∝ 1/V  (Boyle)</text>
      <text x="120" y="148" fontSize="10" fill={I}>Volume</text>
      <text x="6" y="20" fontSize="10" fill={I}>P</text>
    </svg>
  ),
  fluidContinuity:()=>(
    <svg viewBox="0 0 270 130" width="100%" style={{maxWidth:350}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      <path d="M10 40 L140 40 L200 62 L260 62 L260 92 L200 92 L140 118 L10 118 Z" fill="#e9e6ff" stroke={BLU} strokeWidth="2"/>
      <text x="60" y="82" fontSize="10" fill={I}>A₁, v₁</text>
      <text x="215" y="82" fontSize="10" fill={PINK}>A₂↓ v₂↑</text>
      <line x1="55" y1="79" x2="95" y2="79" stroke={I} strokeWidth="2" markerEnd="url(#mdArrow)"/>
      <line x1="212" y1="77" x2="252" y2="77" stroke={PINK} strokeWidth="3" markerEnd="url(#mdArrow)"/>
      <text x="130" y="14" fontSize="10" textAnchor="middle" fill={I}>A₁v₁ = A₂v₂</text>
    </svg>
  ),
  feedback:()=>(
    <svg viewBox="0 0 260 130" width="100%" style={{maxWidth:340}}>
      <defs><marker id="mdArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill={I}/></marker>
      <marker id="mdBar" markerWidth="10" markerHeight="10" refX="1" refY="5" orient="auto"><line x1="1" y1="1" x2="1" y2="9" stroke={CORAL_()} strokeWidth="2"/></marker></defs>
      <rect x="14" y="50" width="54" height="30" rx="8" fill="#ffe1ef" stroke={PINK}/><text x="41" y="69" fontSize="9" textAnchor="middle" fill={I}>Stimulus</text>
      <rect x="104" y="50" width="54" height="30" rx="8" fill="#dcf4e7" stroke={GRN}/><text x="131" y="69" fontSize="9" textAnchor="middle" fill={I}>Response</text>
      <rect x="194" y="50" width="54" height="30" rx="8" fill="#e9e6ff" stroke={BLU}/><text x="221" y="69" fontSize="9" textAnchor="middle" fill={I}>Product</text>
      <line x1="68" y1="65" x2="102" y2="65" stroke={I} strokeWidth="2" markerEnd="url(#mdArrow)"/>
      <line x1="158" y1="65" x2="192" y2="65" stroke={I} strokeWidth="2" markerEnd="url(#mdArrow)"/>
      <path d="M221 50 C221 20 41 20 41 46" fill="none" stroke={CORAL_()} strokeWidth="2" markerEnd="url(#mdBar)"/>
      <text x="131" y="18" fontSize="9" textAnchor="middle" fill={CORAL_()}>− negative feedback</text>
    </svg>
  ),
  halfLife:()=>(
    <svg viewBox="0 0 260 150" width="100%" style={{maxWidth:340}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      {ax(30,130,245,130)}{ax(30,130,30,15)}
      <path d="M30 28 C70 28 80 110 130 116 C170 120 200 126 240 127" fill="none" stroke={PINK} strokeWidth="3"/>
      <line x1="30" y1="79" x2="90" y2="79" stroke={GRY} strokeDasharray="4 4"/><text x="4" y="82" fontSize="8" fill={I}>50%</text>
      <line x1="90" y1="79" x2="90" y2="130" stroke={GRY} strokeDasharray="4 4"/><text x="80" y="144" fontSize="8" fill={I}>t½</text>
      <line x1="30" y1="104" x2="150" y2="104" stroke={GRY} strokeDasharray="4 4"/><text x="4" y="107" fontSize="8" fill={I}>25%</text>
      <line x1="150" y1="104" x2="150" y2="130" stroke={GRY} strokeDasharray="4 4"/><text x="138" y="144" fontSize="8" fill={I}>2t½</text>
      <text x="6" y="20" fontSize="8" fill={I}>N</text>
    </svg>
  ),
  buffer:()=>(
    <svg viewBox="0 0 260 130" width="100%" style={{maxWidth:340}}>
      <text x="130" y="24" fontSize="11" textAnchor="middle" fill={I} fontWeight="700">Henderson–Hasselbalch</text>
      <text x="130" y="58" fontSize="15" textAnchor="middle" fill={PINK} fontWeight="700">pH = pKa + log([A⁻]/[HA])</text>
      <rect x="40" y="78" width="80" height="34" rx="8" fill="#ffe1ef" stroke={PINK}/><text x="80" y="100" fontSize="10" textAnchor="middle" fill={I}>HA (acid)</text>
      <rect x="140" y="78" width="80" height="34" rx="8" fill="#dcf4e7" stroke={GRN}/><text x="180" y="100" fontSize="10" textAnchor="middle" fill={I}>A⁻ (base)</text>
      <text x="130" y="126" fontSize="9" textAnchor="middle" fill={GRY}>max buffering when pH = pKa</text>
    </svg>
  ),
  hardyWeinberg:()=>(
    <svg viewBox="0 0 260 110" width="100%" style={{maxWidth:340}}>
      <text x="130" y="30" fontSize="14" textAnchor="middle" fill={PINK} fontWeight="700">p² + 2pq + q² = 1</text>
      <text x="130" y="52" fontSize="12" textAnchor="middle" fill={I}>p + q = 1</text>
      <rect x="26" y="66" width="66" height="30" rx="8" fill="#ffe1ef" stroke={PINK}/><text x="59" y="85" fontSize="9" textAnchor="middle" fill={I}>p² AA</text>
      <rect x="98" y="66" width="66" height="30" rx="8" fill="#fff3d6" stroke={GOLD_()}/><text x="131" y="85" fontSize="9" textAnchor="middle" fill={I}>2pq Aa</text>
      <rect x="170" y="66" width="66" height="30" rx="8" fill="#dcf4e7" stroke={GRN}/><text x="203" y="85" fontSize="9" textAnchor="middle" fill={I}>q² aa</text>
    </svg>
  ),
  weber:()=>(
    <svg viewBox="0 0 260 130" width="100%" style={{maxWidth:340}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      {ax(30,110,245,110)}{ax(30,110,30,12)}
      <line x1="30" y1="110" x2="235" y2="30" stroke={PINK} strokeWidth="3"/>
      <text x="120" y="52" fontSize="10" fill={PINK}>ΔI/I = k (constant)</text>
      <text x="90" y="126" fontSize="9" fill={I}>baseline intensity I</text>
      <text x="4" y="70" fontSize="8" fill={I} transform="rotate(-90 8 70)">JND (ΔI)</text>
    </svg>
  ),
  aldol:()=>(
    <svg viewBox="0 0 280 96" width="100%" style={{maxWidth:380}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      <text x="10" y="45" fontSize="10" fill={I}>enolate (α-C nucleophile)</text>
      <path d="M120 40 L155 40" stroke={GRN} strokeWidth="2" markerEnd="url(#mdArrow)"/>
      <text x="165" y="35" fontSize="10" fill={I}>attacks C=O</text>
      <text x="150" y="70" fontSize="10" fill={PINK} fontWeight="700">β-hydroxy carbonyl</text>
      <text x="150" y="88" fontSize="8.5" fill={GRY}>heat → α,β-unsaturated (condensation)</text>
    </svg>
  ),
  osmosis:()=>(
    <svg viewBox="0 0 240 130" width="100%" style={{maxWidth:320}}>
      <defs><marker id="mdArrow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={I}/></marker></defs>
      <rect x="20" y="30" width="200" height="80" rx="6" fill="#e9e6ff" stroke={BLU}/>
      <line x1="120" y1="30" x2="120" y2="110" stroke={PINK} strokeWidth="3" strokeDasharray="3 4"/>
      <text x="60" y="70" fontSize="9" textAnchor="middle" fill={I}>low solute</text>
      <text x="180" y="70" fontSize="9" textAnchor="middle" fill={I}>high solute</text>
      <line x1="95" y1="90" x2="145" y2="90" stroke={GRN} strokeWidth="2.5" markerEnd="url(#mdArrow)"/>
      <text x="120" y="124" fontSize="8.5" textAnchor="middle" fill={GRN}>water → hypertonic side</text>
    </svg>
  ),
};
function GOLD_(){return "#f2b64e";}
function CORAL_(){return "#f4736b";}

/* helper to render a diagram by key (safe if missing) */
function Diagram({ dkey }) {
  if (!dkey || !DIA[dkey]) return null;
  const El = DIA[dkey];
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:"6px 4px",
      background:"linear-gradient(180deg,#fff,#fff8fc)", borderRadius:18,
      border:"1px dashed "+C.line, margin:"4px 0 2px" }}>
      <El/>
    </div>
  );
}

/* ============================================================================
   4. CURATED MCAT QUESTION BANK  (~80 discrete, MCAT-style items)
   Schema: { id, section, topic, difficulty, q, choices[4], answer, exp[4],
             clinical, dia }
   exp[i] explains choice i (why right / why it's a trap).
   ============================================================================ */
const BANK = [
/* ---------------------- BIO / BIOCHEM (BB) ---------------------- */
{ id:"bb1", section:"BB", topic:"Enzyme kinetics", difficulty:"medium", dia:"michaelis",
  q:"An enzyme's Km increases while Vmax stays constant after adding a molecule. What type of inhibition is this?",
  choices:["Competitive","Noncompetitive","Uncompetitive","Irreversible"], answer:0,
  exp:[
    "Correct. A higher Km (lower apparent affinity) with unchanged Vmax is the signature of competitive inhibition — excess substrate can still outcompete the inhibitor and reach the same Vmax.",
    "Noncompetitive inhibition lowers Vmax and leaves Km unchanged, because the inhibitor binds an allosteric site regardless of substrate.",
    "Uncompetitive inhibition lowers BOTH Km and Vmax (inhibitor binds only the ES complex).",
    "Irreversible inhibition permanently disables enzyme (lowers effective Vmax) and is not described by a simple Km shift."],
  clinical:"Statins competitively inhibit HMG-CoA reductase; methotrexate competitively inhibits dihydrofolate reductase in chemotherapy." },

{ id:"bb2", section:"BB", topic:"Enzyme inhibition", difficulty:"hard", dia:"inhibition",
  q:"A drug binds an allosteric site and its inhibition CANNOT be overcome by adding more substrate. On a Michaelis–Menten plot, what happens?",
  choices:["Vmax decreases, Km unchanged","Vmax unchanged, Km increases","Both increase","Km decreases only"], answer:0,
  exp:[
    "Correct. Classic noncompetitive inhibition: the inhibitor binds enzyme or ES equally, so it removes functional enzyme. Vmax falls; substrate affinity (Km) is unchanged.",
    "That describes competitive inhibition, which CAN be overcome by more substrate — contradicting the stem.",
    "Both increasing fits no standard reversible inhibition pattern.",
    "A decrease in Km alone (increased affinity) describes uncompetitive effects on Km, not this scenario."],
  clinical:"Non-competitive inhibition underlies allosteric drugs like certain protease inhibitors that don't compete at the active site." },

{ id:"bb3", section:"BB", topic:"Cooperativity", difficulty:"medium", dia:"michaelis",
  q:"Hemoglobin's oxygen-binding curve is sigmoidal, while myoglobin's is hyperbolic. This difference is BEST explained by:",
  choices:["Cooperative binding across hemoglobin's subunits","Myoglobin having higher Vmax","Hemoglobin being an enzyme","Different oxygen concentrations in tissues"], answer:0,
  exp:[
    "Correct. Hemoglobin is a tetramer showing positive cooperativity — O2 binding to one subunit increases affinity of the others, producing the sigmoidal curve.",
    "Neither protein is an enzyme, so Vmax does not apply.",
    "Hemoglobin transports O2; it is not an enzyme catalyzing a reaction.",
    "The curve shape is intrinsic to the proteins, not a consequence of local O2 levels."],
  clinical:"The sigmoidal curve lets hemoglobin load O2 in the lungs and unload it efficiently in tissues; a right shift (Bohr effect) aids delivery during exercise." },

{ id:"bb4", section:"BB", topic:"Glycolysis", difficulty:"foundation", dia:"glycolysis",
  q:"What is the committed, rate-limiting step of glycolysis?",
  choices:["Phosphofructokinase-1 (F6P → F1,6BP)","Hexokinase (glucose → G6P)","Pyruvate kinase (PEP → pyruvate)","Aldolase cleavage"], answer:0,
  exp:[
    "Correct. PFK-1 catalyzes the committed, rate-limiting step and is the key regulatory valve, inhibited by ATP/citrate and activated by AMP/F2,6BP.",
    "Hexokinase is regulated but not the committed step; G6P can enter other pathways (glycogen, PPP).",
    "Pyruvate kinase catalyzes the final, irreversible step but is not rate-limiting.",
    "Aldolase splits F1,6BP into two trioses and is not a regulatory step."],
  clinical:"In poorly controlled diabetes, altered PFK-1 regulation contributes to disrupted glucose handling." },

{ id:"bb5", section:"BB", topic:"Metabolism", difficulty:"medium", dia:"glycolysis",
  q:"Net ATP yield from the glycolysis of one glucose molecule to two pyruvate (substrate-level only) is:",
  choices:["2 ATP","4 ATP","36 ATP","0 ATP"], answer:0,
  exp:[
    "Correct. Glycolysis invests 2 ATP and produces 4 ATP by substrate-level phosphorylation → net 2 ATP (plus 2 NADH).",
    "4 ATP is gross production before subtracting the 2 invested.",
    "~36 ATP is the total from complete aerobic oxidation including the ETC, not glycolysis alone.",
    "0 ATP ignores that glycolysis is net ATP-producing even anaerobically."],
  clinical:"Rapidly dividing tumor cells rely heavily on glycolysis for ATP even with oxygen present — the Warburg effect." },

{ id:"bb6", section:"BB", topic:"Metabolism", difficulty:"foundation", dia:null,
  q:"Where does the citric acid (Krebs) cycle occur in eukaryotic cells?",
  choices:["Mitochondrial matrix","Cytoplasm","Inner mitochondrial membrane","Nucleus"], answer:0,
  exp:[
    "Correct. Krebs cycle enzymes reside in the mitochondrial matrix (succinate dehydrogenase is the exception, embedded in the inner membrane).",
    "Glycolysis occurs in the cytoplasm, not the Krebs cycle.",
    "The inner membrane houses the electron transport chain, not the full cycle.",
    "The nucleus handles transcription, not central metabolism."],
  clinical:"Mitochondrial disorders impair the Krebs cycle/ETC and strike high-energy tissues like muscle and brain first." },

{ id:"bb7", section:"BB", topic:"Electron transport", difficulty:"hard", dia:null,
  q:"Cyanide blocks Complex IV of the electron transport chain. The immediate consequence is:",
  choices:["Proton gradient collapses and ATP synthesis halts","Glycolysis stops immediately","The Krebs cycle speeds up","Oxygen consumption increases"], answer:0,
  exp:[
    "Correct. Blocking Complex IV stops electron flow to O2, so proton pumping ceases, the gradient dissipates, and oxidative phosphorylation halts.",
    "Glycolysis continues (even accelerates anaerobically) since it doesn't require the ETC directly.",
    "With NADH unable to be reoxidized, the Krebs cycle actually slows, not speeds up.",
    "Oxygen consumption falls because O2 is the terminal electron acceptor that can no longer be used."],
  clinical:"Cyanide poisoning causes cellular hypoxia despite normal blood O2; treated with hydroxocobalamin or nitrites + thiosulfate." },

{ id:"bb8", section:"BB", topic:"DNA replication", difficulty:"medium", dia:"replicationFork",
  q:"On the lagging strand of DNA replication, synthesis occurs via:",
  choices:["Short Okazaki fragments joined by DNA ligase","One continuous 3'→5' strand","RNA polymerase only","Reverse transcription"], answer:0,
  exp:[
    "Correct. Because polymerase only builds 5'→3', the lagging strand is made in short Okazaki fragments (primed by RNA) later sealed by DNA ligase.",
    "DNA polymerase cannot synthesize 3'→5'; the leading strand is the continuous one.",
    "RNA polymerase lays primers, but DNA polymerase does the bulk synthesis.",
    "Reverse transcription (RNA→DNA) is used by retroviruses, not normal replication."],
  clinical:"Defects in DNA ligase I cause immunodeficiency and growth retardation from faulty fragment joining." },

{ id:"bb9", section:"BB", topic:"Central dogma", difficulty:"foundation", dia:"centralDogma",
  q:"During which process is the genetic code read in codons to build a polypeptide?",
  choices:["Translation","Transcription","Replication","Splicing"], answer:0,
  exp:[
    "Correct. Translation at the ribosome reads mRNA codons (3 nucleotides each) and adds the corresponding amino acids.",
    "Transcription makes mRNA from DNA — it copies bases, it doesn't read codons into protein.",
    "Replication duplicates DNA and does not produce protein.",
    "Splicing removes introns from pre-mRNA; it's a processing step, not codon reading."],
  clinical:"Aminoglycoside antibiotics cause bacterial ribosomes to misread codons, producing faulty proteins." },

{ id:"bb10", section:"BB", topic:"Mutations", difficulty:"medium", dia:null,
  q:"A single base substitution changes a codon from GAG (Glu) to GTG (Val) with no premature stop. This is a:",
  choices:["Missense mutation","Nonsense mutation","Silent mutation","Frameshift mutation"], answer:0,
  exp:[
    "Correct. A missense mutation swaps one amino acid for another (Glu→Val here), exactly the sickle-cell mutation.",
    "A nonsense mutation creates a premature stop codon; the stem says no stop appears.",
    "A silent mutation would leave the amino acid unchanged; here it changes.",
    "A frameshift results from insertions/deletions not divisible by three, shifting the reading frame — not a substitution."],
  clinical:"The GAG→GTG missense in β-globin causes sickle-cell anemia; Val makes hemoglobin polymerize when deoxygenated." },

{ id:"bb11", section:"BB", topic:"Transcription", difficulty:"medium", dia:"centralDogma",
  q:"In eukaryotic mRNA processing, the addition of a 5' cap and 3' poly-A tail primarily serves to:",
  choices:["Increase stability and enable nuclear export/translation","Add amino acids","Splice out exons","Terminate translation"], answer:0,
  exp:[
    "Correct. The 5' cap and poly-A tail protect mRNA from degradation, aid export from the nucleus, and promote ribosome binding for translation.",
    "Amino acids are added during translation, not mRNA processing.",
    "Splicing removes introns (not exons); it is a separate processing event.",
    "These modifications support, not terminate, translation."],
  clinical:"Shortened poly-A tails accelerate mRNA decay; this regulation is exploited by some antiviral and mRNA-vaccine designs." },

{ id:"bb12", section:"BB", topic:"Genetics", difficulty:"hard", dia:"hardyWeinberg",
  q:"In a Hardy–Weinberg population, a recessive disease affects 1 in 10,000. What fraction are carriers (heterozygous)?",
  choices:["About 1 in 50","About 1 in 100","About 1 in 10,000","About 1 in 2"], answer:0,
  exp:[
    "Correct. q² = 1/10,000 → q = 0.01, p ≈ 0.99. Carrier frequency 2pq ≈ 2(0.99)(0.01) ≈ 0.0198 ≈ 1 in 50.",
    "1 in 100 confuses carrier frequency (2pq) with the allele frequency q (0.01).",
    "1 in 10,000 is the affected (q²) frequency, not carriers.",
    "1 in 2 grossly overestimates; that's near p or the Aa maximum only when p=q=0.5."],
  clinical:"Carrier screening for cystic fibrosis and Tay-Sachs uses exactly this logic to counsel prospective parents." },

{ id:"bb13", section:"BB", topic:"Genetics", difficulty:"medium", dia:null,
  q:"A father is colorblind (X-linked recessive) and the mother is a non-carrier. What is expected in their children?",
  choices:["All daughters are carriers; all sons unaffected","All sons colorblind","All daughters colorblind","Half of all children affected"], answer:0,
  exp:[
    "Correct. Daughters receive the father's affected X (plus mother's normal X) → all carriers. Sons get the father's Y and mother's normal X → all unaffected.",
    "Sons inherit the father's Y, never his X, so they can't get his colorblindness allele.",
    "Daughters need two affected X's to be colorblind; the mother contributes a normal X, so they're carriers, not affected.",
    "The 'half affected' answer ignores the sex-linked inheritance pattern."],
  clinical:"Red-green colorblindness affects ~8% of males but far fewer females due to this X-linked pattern." },

{ id:"bb14", section:"BB", topic:"Cell signaling", difficulty:"hard", dia:null,
  q:"A hormone binds a G-protein coupled receptor and activates adenylate cyclase. The immediate second messenger is:",
  choices:["cAMP","Calcium influx through voltage-gated channels","IP3","The hormone itself"], answer:0,
  exp:[
    "Correct. Adenylate cyclase converts ATP to cyclic AMP (cAMP), which activates protein kinase A — the classic Gs pathway.",
    "Voltage-gated Ca²⁺ entry is triggered by membrane depolarization, not directly by adenylate cyclase.",
    "IP3 arises from the Gq/phospholipase C pathway, a different GPCR cascade.",
    "The hormone is the first messenger (ligand), by definition not the second messenger."],
  clinical:"Cholera toxin locks Gs on, causing runaway cAMP in gut cells and massive secretory diarrhea." },

{ id:"bb15", section:"BB", topic:"Membrane transport", difficulty:"medium", dia:"osmosis",
  q:"A red blood cell is placed in a hypertonic solution. What happens?",
  choices:["Water leaves the cell and it shrinks (crenates)","Water enters and the cell lyses","No net water movement","Solute rushes into the cell"], answer:0,
  exp:[
    "Correct. In a hypertonic environment the extracellular solute concentration is higher, so water leaves the cell by osmosis and it crenates (shrivels).",
    "Lysis happens in a HYPOtonic solution, where water enters.",
    "There is a concentration gradient, so net water movement does occur.",
    "Osmosis moves water, not solute; the membrane restricts solute movement."],
  clinical:"Hypertonic saline is used clinically to draw water out of swollen brain cells and reduce cerebral edema." },

{ id:"bb16", section:"BB", topic:"Cell biology", difficulty:"foundation", dia:null,
  q:"The Na⁺/K⁺-ATPase pump moves ions in which direction, and at what energetic cost?",
  choices:["3 Na⁺ out, 2 K⁺ in, using ATP","3 Na⁺ in, 2 K⁺ out, no ATP","2 Na⁺ out, 3 K⁺ in, using ATP","Equal ions both ways, passively"], answer:0,
  exp:[
    "Correct. The pump exports 3 Na⁺ and imports 2 K⁺ per ATP, both against their gradients — primary active transport.",
    "That reverses the true directions; the pump moves Na⁺ out and K⁺ in.",
    "The stoichiometry (3 Na⁺ : 2 K⁺) is fixed; 2:3 is incorrect.",
    "The pump is active (ATP-dependent) and moves unequal numbers of ions, creating charge separation."],
  clinical:"Cardiac glycosides (digoxin) inhibit this pump, raising intracellular Ca²⁺ to strengthen heart contraction." },

{ id:"bb17", section:"BB", topic:"Cell division", difficulty:"medium", dia:null,
  q:"Which event is UNIQUE to meiosis and not seen in mitosis?",
  choices:["Homologous chromosomes pairing and crossing over","DNA replication in S phase","Chromosome condensation","Spindle formation"], answer:0,
  exp:[
    "Correct. Synapsis of homologs and crossing over (meiosis I) generate genetic diversity and occur only in meiosis.",
    "S-phase DNA replication precedes both mitosis and meiosis.",
    "Chromosome condensation happens in both processes.",
    "Spindle fibers form in both mitosis and meiosis to separate chromosomes."],
  clinical:"Errors in meiotic homolog separation (nondisjunction) cause aneuploidies like trisomy 21 (Down syndrome)." },

{ id:"bb18", section:"BB", topic:"Biochemistry", difficulty:"hard", dia:"feedback",
  q:"The end product of a metabolic pathway inhibits the first committed enzyme. This regulation is called:",
  choices:["Feedback (end-product) inhibition","Feedforward activation","Competitive inhibition by substrate","Zymogen activation"], answer:0,
  exp:[
    "Correct. Feedback inhibition: accumulating product allosterically shuts off an upstream enzyme, preventing overproduction.",
    "Feedforward activation is the opposite — an early metabolite stimulates a downstream enzyme.",
    "The product isn't the substrate of the inhibited enzyme, so this isn't competitive substrate inhibition.",
    "Zymogen activation is proteolytic conversion of an inactive precursor, unrelated to product feedback."],
  clinical:"CTP feedback-inhibits aspartate transcarbamoylase in pyrimidine synthesis — a textbook allosteric example." },

{ id:"bb19", section:"BB", topic:"Protein structure", difficulty:"medium", dia:null,
  q:"Which level of protein structure is disrupted first when a protein is denatured by heat, losing function but keeping peptide bonds intact?",
  choices:["Tertiary/secondary (non-covalent) structure","Primary structure","Peptide backbone covalent bonds","The amino acid side-chain identity"], answer:0,
  exp:[
    "Correct. Denaturation breaks the non-covalent interactions (H-bonds, hydrophobic, ionic) holding secondary/tertiary structure, while peptide bonds (primary structure) stay intact.",
    "Primary structure (the covalent sequence) is preserved during denaturation.",
    "Peptide (covalent) bonds require hydrolysis to break, not simple heat denaturation.",
    "Side-chain chemical identity is part of primary sequence and is unchanged."],
  clinical:"Fever-range hyperthermia can denature enzymes; this is why very high fevers are dangerous to cellular function." },

{ id:"bb20", section:"BB", topic:"Biochemistry", difficulty:"foundation", dia:"gibbs",
  q:"Which molecule is the primary energy currency directly hydrolyzed to power most cellular work?",
  choices:["ATP","NADH","Glucose","FADH2"], answer:0,
  exp:[
    "Correct. ATP's terminal phosphoanhydride bond is hydrolyzed to ADP + Pi to drive most energy-requiring reactions.",
    "NADH is an electron carrier that feeds the ETC; it isn't hydrolyzed directly for work.",
    "Glucose stores energy but must be catabolized to make ATP first.",
    "FADH2, like NADH, is an electron carrier, not the direct energy currency."],
  clinical:"Ischemic tissue rapidly depletes ATP, causing pump failure, ion imbalance, and cell death within minutes." },

{ id:"bb21", section:"BB", topic:"PCR / lab", difficulty:"medium", dia:null,
  q:"In PCR, what is the purpose of the denaturation step at ~95°C?",
  choices:["Separate the double-stranded DNA into single strands","Anneal primers to template","Extend new strands with polymerase","Activate ligase"], answer:0,
  exp:[
    "Correct. High heat breaks the hydrogen bonds between strands, yielding single-stranded templates for primers.",
    "Annealing occurs at a lower temperature (~50–65°C) in the next step.",
    "Extension happens at ~72°C, the polymerase's optimum, after primers bind.",
    "PCR uses a heat-stable polymerase (Taq), not ligase, for strand synthesis."],
  clinical:"PCR underlies diagnostic tests for infections (e.g., detecting viral RNA/DNA) and genetic screening." },

{ id:"bb22", section:"BB", topic:"Metabolism", difficulty:"hard", dia:null,
  q:"During prolonged fasting, which process maintains blood glucose by synthesizing it from non-carbohydrate precursors?",
  choices:["Gluconeogenesis","Glycolysis","Glycogenolysis","Lipogenesis"], answer:0,
  exp:[
    "Correct. Gluconeogenesis builds glucose from lactate, glycerol, and amino acids, mainly in the liver, sustaining blood sugar during fasting.",
    "Glycolysis breaks glucose down — the opposite direction.",
    "Glycogenolysis releases stored glucose but liver glycogen is depleted within ~24 hours, so it can't sustain prolonged fasting.",
    "Lipogenesis synthesizes fat, storing energy rather than producing glucose."],
  clinical:"In diabetic ketoacidosis, unrestrained gluconeogenesis worsens hyperglycemia despite high blood sugar." },

{ id:"bb23", section:"BB", topic:"Enzymes", difficulty:"foundation", dia:"gibbs",
  q:"How does an enzyme increase the rate of a reaction?",
  choices:["Lowering the activation energy (Ea)","Changing the reaction's ΔG","Making an endergonic reaction exergonic","Increasing the temperature"], answer:0,
  exp:[
    "Correct. Enzymes stabilize the transition state, lowering activation energy so more collisions succeed — speeding both forward and reverse rates equally.",
    "Enzymes do not change ΔG (the thermodynamic difference between products and reactants).",
    "An enzyme cannot flip the spontaneity of a reaction; ΔG is fixed by the reactants and products.",
    "Enzymes work at physiological temperature; they don't heat the system."],
  clinical:"Loss-of-function enzyme mutations cause metabolic diseases like PKU (phenylalanine hydroxylase deficiency)." },

{ id:"bb24", section:"BB", topic:"Cell biology", difficulty:"medium", dia:null,
  q:"Which organelle is the primary site of protein glycosylation and packaging for secretion?",
  choices:["Golgi apparatus","Smooth ER","Lysosome","Peroxisome"], answer:0,
  exp:[
    "Correct. The Golgi modifies (glycosylates), sorts, and packages proteins from the rough ER into vesicles for secretion or delivery.",
    "The smooth ER handles lipid synthesis and detoxification, not protein packaging.",
    "Lysosomes degrade macromolecules; they receive Golgi products but don't package secretions.",
    "Peroxisomes break down fatty acids and detoxify peroxides."],
  clinical:"I-cell disease results from failed Golgi tagging of lysosomal enzymes, which are then mistakenly secreted." },

{ id:"bb25", section:"BB", topic:"Biochemistry", difficulty:"medium", dia:null,
  q:"A noncompetitive-type molecule binds an enzyme only after substrate binds (ES complex). This uncompetitive inhibition produces:",
  choices:["Decreased Km and decreased Vmax","Increased Km, unchanged Vmax","Unchanged Km, decreased Vmax","Increased both Km and Vmax"], answer:0,
  exp:[
    "Correct. Uncompetitive inhibitors bind only ES, pulling the equilibrium toward ES (apparent Km falls) while capping turnover (Vmax falls).",
    "Increased Km with unchanged Vmax is competitive inhibition.",
    "Unchanged Km with lower Vmax is classic noncompetitive inhibition.",
    "No standard reversible inhibitor raises both parameters."],
  clinical:"Lithium's action on inositol monophosphatase shows uncompetitive kinetics, part of its mood-stabilizing mechanism." },

{ id:"bb26", section:"BB", topic:"Genetics", difficulty:"foundation", dia:null,
  q:"In incomplete dominance, a cross of red (RR) and white (rr) flowers yields pink (Rr) offspring. This is because:",
  choices:["The heterozygote shows a blended, intermediate phenotype","Both alleles are fully expressed separately","The red allele is recessive","A new mutation occurred"], answer:0,
  exp:[
    "Correct. In incomplete dominance neither allele fully dominates, so the heterozygote is an intermediate blend (pink).",
    "Separate simultaneous expression of both alleles is codominance (e.g., AB blood type), which shows both phenotypes, not a blend.",
    "Neither allele is recessive here; they blend.",
    "No mutation is needed — the pink phenotype is the expected heterozygous result."],
  clinical:"Familial hypercholesterolemia shows a gene-dosage effect: heterozygotes have intermediate LDL, homozygotes far higher." },

/* ---------------------- CHEM / PHYSICS (CP) ---------------------- */
{ id:"cp1", section:"CP", topic:"Thermodynamics", difficulty:"medium", dia:"gibbs",
  q:"A reaction has ΔH = −40 kJ/mol and ΔS = +50 J/mol·K. At 298 K, the reaction is:",
  choices:["Spontaneous (ΔG < 0) at all temperatures","Nonspontaneous at all temperatures","Spontaneous only at high T","Spontaneous only at low T"], answer:0,
  exp:[
    "Correct. With ΔH negative and ΔS positive, ΔG = ΔH − TΔS is negative at every temperature — always spontaneous.",
    "It cannot be nonspontaneous at all T when both terms favor spontaneity.",
    "A high-T requirement applies when ΔH>0 and ΔS>0.",
    "A low-T requirement applies when ΔH<0 and ΔS<0."],
  clinical:"ATP hydrolysis (ΔG ≈ −30 kJ/mol) is spontaneous and drives coupled endergonic reactions in the body." },

{ id:"cp2", section:"CP", topic:"Acid-base", difficulty:"foundation", dia:null,
  q:"What is the pH of a 0.001 M HCl solution (a strong acid)?",
  choices:["3","1","11","2"], answer:0,
  exp:[
    "Correct. HCl fully dissociates, so [H⁺] = 0.001 = 10⁻³ M, and pH = −log(10⁻³) = 3.",
    "pH 1 would require [H⁺] = 0.1 M, 100× more concentrated.",
    "pH 11 is basic — wrong for an acid; that's the pOH value here.",
    "pH 2 corresponds to 0.01 M, 10× too concentrated."],
  clinical:"Stomach acid (~pH 1.5–2) is far more concentrated; antacids neutralize excess H⁺ to relieve reflux." },

{ id:"cp3", section:"CP", topic:"Buffers", difficulty:"hard", dia:"buffer",
  q:"A buffer contains equal concentrations of a weak acid (pKa 4.7) and its conjugate base. What is its pH, and where is buffering strongest?",
  choices:["pH 4.7; buffering is strongest here","pH 7.0; strongest at neutrality","pH 9.3; strongest at high pH","pH 4.7; but buffering is weakest here"], answer:0,
  exp:[
    "Correct. Henderson–Hasselbalch: pH = pKa + log(1) = pKa = 4.7. A buffer resists change best when pH = pKa (equal acid/base).",
    "pH 7.0 ignores the equation; equal [A⁻]/[HA] gives pH = pKa, not neutrality.",
    "pH 9.3 is roughly double the pKa — a miscalculation.",
    "The pH is right but buffering is STRONGEST (not weakest) when pH = pKa."],
  clinical:"Blood's bicarbonate buffer (pKa ~6.1) keeps plasma pH near 7.4; deviations cause acidosis or alkalosis." },

{ id:"cp4", section:"CP", topic:"Titration", difficulty:"hard", dia:"titration",
  q:"During titration of a weak acid with strong base, at the half-equivalence point:",
  choices:["pH equals the pKa of the acid","pH equals 7","All acid is neutralized","The solution is at its lowest pH"], answer:0,
  exp:[
    "Correct. At half-equivalence, [HA] = [A⁻], so pH = pKa — the flattest, best-buffered region of the curve.",
    "pH = 7 occurs at the equivalence point only for strong acid–strong base titrations, not weak acid.",
    "Complete neutralization happens at the equivalence point, not half-equivalence.",
    "The lowest pH is at the very start before base is added."],
  clinical:"Half-equivalence titration is how labs experimentally determine a drug's pKa, key to predicting absorption." },

{ id:"cp5", section:"CP", topic:"Electrochemistry", difficulty:"medium", dia:"galvanic",
  q:"In a galvanic (voltaic) cell, oxidation occurs at the ___ and electrons flow toward the ___.",
  choices:["anode; cathode","cathode; anode","anode; anode","cathode; cathode"], answer:0,
  exp:[
    "Correct. Oxidation always occurs at the anode; electrons travel through the external wire to the cathode (reduction). 'An Ox, Red Cat.'",
    "This reverses both — reduction, not oxidation, occurs at the cathode.",
    "Electrons leave the anode; they don't flow to the anode.",
    "Reduction (not oxidation) occurs at the cathode, so 'cathode; cathode' is wrong."],
  clinical:"Implantable pacemaker batteries are galvanic cells; electrode chemistry determines device lifespan." },

{ id:"cp6", section:"CP", topic:"Circuits", difficulty:"foundation", dia:"circuit",
  q:"Two resistors, 4 Ω and 6 Ω, are connected in series. The equivalent resistance is:",
  choices:["10 Ω","2.4 Ω","1.2 Ω","24 Ω"], answer:0,
  exp:[
    "Correct. Series resistances add directly: 4 + 6 = 10 Ω.",
    "2.4 Ω is the PARALLEL combination (product/sum), not series.",
    "1.2 Ω doesn't match either configuration.",
    "24 Ω would be the product, which isn't how resistors combine."],
  clinical:"Nerve axons can be modeled as resistor–capacitor networks; series resistance affects signal conduction speed." },

{ id:"cp7", section:"CP", topic:"Circuits", difficulty:"medium", dia:"circuit",
  q:"A 12 V battery drives 3 A through a resistor. What power is dissipated?",
  choices:["36 W","4 W","15 W","9 W"], answer:0,
  exp:[
    "Correct. P = IV = (3 A)(12 V) = 36 W.",
    "4 W would be V/I = 12/3, which is resistance (4 Ω), not power.",
    "15 W comes from adding V and I — dimensionally wrong.",
    "9 W ignores the correct P = IV relationship."],
  clinical:"Defibrillators deliver a controlled burst of electrical power (joules over milliseconds) to reset heart rhythm." },

{ id:"cp8", section:"CP", topic:"Fluids", difficulty:"hard", dia:"fluidContinuity",
  q:"Fluid flows through a pipe that narrows to half its cross-sectional area. By the continuity equation, the fluid's speed:",
  choices:["Doubles","Halves","Stays the same","Quadruples"], answer:0,
  exp:[
    "Correct. A₁v₁ = A₂v₂. If A halves, v must double to conserve volume flow rate.",
    "Speed halving would require the area to double, the opposite of the stem.",
    "Constant speed would violate continuity when area changes.",
    "Quadrupling would need the area cut to one-fourth, not one-half."],
  clinical:"Arterial stenosis narrows a vessel, raising blood velocity — detectable as a bruit or on Doppler ultrasound." },

{ id:"cp9", section:"CP", topic:"Fluids", difficulty:"medium", dia:null,
  q:"An object floats with 90% submerged in water. Its density is approximately:",
  choices:["0.9 g/cm³","1.1 g/cm³","0.1 g/cm³","9 g/cm³"], answer:0,
  exp:[
    "Correct. At flotation, fraction submerged = object density / fluid density. 0.90 × 1.0 g/cm³ = 0.9 g/cm³.",
    "A density above water's (1.0) would sink, not float.",
    "0.1 g/cm³ would float with only 10% submerged.",
    "9 g/cm³ is far denser than water and would sink immediately."],
  clinical:"Body-fat measurement by hydrostatic weighing uses this buoyancy principle to estimate density and composition." },

{ id:"cp10", section:"CP", topic:"Optics", difficulty:"medium", dia:"lens",
  q:"An object is placed beyond 2F of a converging lens. The image is:",
  choices:["Real, inverted, and reduced","Virtual, upright, enlarged","Real, upright, same size","Virtual, inverted, reduced"], answer:0,
  exp:[
    "Correct. For a converging lens with the object beyond 2F, the image forms between F and 2F on the far side: real, inverted, and smaller.",
    "Virtual upright enlarged images occur when the object is inside F (magnifying-glass regime).",
    "Real images from a single converging lens are always inverted, never upright.",
    "Virtual images from a converging lens are upright, not inverted."],
  clinical:"The eye's lens focuses a real, inverted image on the retina; the brain reinterprets it as upright." },

{ id:"cp11", section:"CP", topic:"Optics", difficulty:"foundation", dia:"lens",
  q:"Light passes from air into water (higher index of refraction). The light bends:",
  choices:["Toward the normal and slows down","Away from the normal and speeds up","Toward the normal and speeds up","Straight through, unchanged"], answer:0,
  exp:[
    "Correct. Entering a denser medium (higher n), light slows and bends toward the normal (Snell's law).",
    "Bending away from the normal happens going into a LESS dense medium.",
    "Light entering a denser medium slows; it doesn't speed up.",
    "Bending only vanishes at normal (0°) incidence; generally the ray refracts."],
  clinical:"Corneal refraction does most of the eye's light-bending; LASIK reshapes the cornea to correct focus." },

{ id:"cp12", section:"CP", topic:"Gas laws", difficulty:"foundation", dia:"gasLaw",
  q:"At constant temperature, if a gas's volume is halved, its pressure:",
  choices:["Doubles","Halves","Stays the same","Quadruples"], answer:0,
  exp:[
    "Correct. Boyle's law: P ∝ 1/V at constant T. Halving V doubles P.",
    "Pressure halving would require volume to double, not halve.",
    "Constant pressure would violate Boyle's law when volume changes.",
    "Quadrupling would need volume cut to a quarter."],
  clinical:"Boyle's law governs ventilation: the diaphragm expands the thorax, dropping intrapulmonary pressure so air flows in." },

{ id:"cp13", section:"CP", topic:"Force / mechanics", difficulty:"medium", dia:"inclinedPlane",
  q:"A block rests on a frictionless incline at angle θ. The component of gravity pulling it down the slope is:",
  choices:["mg·sinθ","mg·cosθ","mg·tanθ","mg"], answer:0,
  exp:[
    "Correct. Resolving gravity along the incline gives mg·sinθ (the driving force); the perpendicular component is mg·cosθ.",
    "mg·cosθ is the component pressing into the surface (sets the normal force), not down the slope.",
    "mg·tanθ isn't a direct gravity component; it appears in friction/equilibrium ratios.",
    "mg is the full weight, only fully down-slope when θ = 90°."],
  clinical:"Physical therapists use inclined surfaces to grade the load on recovering muscles by adjusting θ." },

{ id:"cp14", section:"CP", topic:"Nuclear", difficulty:"medium", dia:"halfLife",
  q:"A radioactive isotope has a half-life of 8 days. After 24 days, what fraction remains?",
  choices:["1/8","1/3","1/24","1/16"], answer:0,
  exp:[
    "Correct. 24 days = 3 half-lives. Each halves the amount: (1/2)³ = 1/8 remains.",
    "1/3 wrongly divides linearly by the number of periods instead of halving.",
    "1/24 treats decay as linear in days — decay is exponential.",
    "1/16 is 4 half-lives, but 24/8 = 3, not 4."],
  clinical:"Iodine-131 (t½ ≈ 8 days) is used to treat hyperthyroidism and thyroid cancer; dosing accounts for this decay." },

{ id:"cp15", section:"CP", topic:"Nuclear", difficulty:"hard", dia:null,
  q:"Beta-minus (β⁻) decay converts a neutron into a proton, emitting:",
  choices:["An electron and an antineutrino","A helium nucleus","A positron","A gamma photon only"], answer:0,
  exp:[
    "Correct. In β⁻ decay a neutron → proton + electron (β⁻ particle) + antineutrino; atomic number rises by one.",
    "A helium nucleus (2p, 2n) is emitted in ALPHA decay, not beta.",
    "A positron is emitted in β⁺ decay (proton → neutron), the opposite process.",
    "Gamma emission is pure energy release, not the particle change described."],
  clinical:"PET scans use β⁺ (positron) emitters like F-18; understanding decay type determines imaging technique and shielding." },

{ id:"cp16", section:"CP", topic:"Thermodynamics", difficulty:"hard", dia:"gasLaw",
  q:"An ideal gas expands isothermally and reversibly. Which statement is true?",
  choices:["ΔU = 0, so heat absorbed equals work done by the gas","Temperature rises","No heat is exchanged","Work done is zero"], answer:0,
  exp:[
    "Correct. For an ideal gas at constant T, internal energy U depends only on T, so ΔU = 0; by the first law, q = w (heat in equals work out).",
    "Isothermal means temperature is constant by definition, so it doesn't rise.",
    "An adiabatic process has no heat exchange; here heat IS exchanged to keep T constant.",
    "Expansion does positive work on the surroundings, so work is not zero."],
  clinical:"Gas exchange principles underlie hyperbaric chambers and the physics of scuba-related decompression injury." },

{ id:"cp17", section:"CP", topic:"Kinetics", difficulty:"medium", dia:null,
  q:"For the reaction with rate = k[A]²[B], what happens to the rate if [A] is doubled?",
  choices:["Rate quadruples","Rate doubles","Rate stays the same","Rate is halved"], answer:0,
  exp:[
    "Correct. Rate depends on [A]²; doubling A gives (2)² = 4× the rate.",
    "Doubling would occur only if A were first order.",
    "A change in [A] must change the rate given A appears in the rate law.",
    "Halving would require decreasing [A] or an inverse dependence."],
  clinical:"Reaction-order analysis governs drug metabolism kinetics — zero vs first order changes how dosing accumulates." },

{ id:"cp18", section:"CP", topic:"Equilibrium", difficulty:"medium", dia:"gibbs",
  q:"For an exothermic equilibrium, increasing the temperature will:",
  choices:["Shift equilibrium toward reactants (K decreases)","Shift toward products (K increases)","Not affect equilibrium","Stop the reaction"], answer:0,
  exp:[
    "Correct. Heat is a product in an exothermic reaction; adding heat (raising T) shifts equilibrium left (Le Chatelier), lowering K.",
    "Products would be favored if the reaction were endothermic.",
    "Temperature is the one variable that actually changes the value of K.",
    "Higher temperature speeds kinetics; it doesn't stop the reaction."],
  clinical:"Oxygen–hemoglobin binding is exothermic; higher temperature in active muscle shifts the curve to release more O2." },

{ id:"cp19", section:"CP", topic:"Sound / Doppler", difficulty:"medium", dia:null,
  q:"An ambulance siren sounds higher-pitched as it approaches you. This is because:",
  choices:["Sound waves are compressed, raising the perceived frequency","The siren's actual frequency increases","Sound travels faster toward you","The amplitude increases"], answer:0,
  exp:[
    "Correct. Doppler effect: an approaching source compresses wavefronts, so more arrive per second — higher perceived frequency.",
    "The source emits a constant frequency; only the perceived frequency changes.",
    "Sound speed depends on the medium, not the source's motion.",
    "Amplitude (loudness) rises with proximity but that's volume, not pitch."],
  clinical:"Doppler ultrasound measures blood-flow velocity and direction — essential for detecting clots and heart defects." },

{ id:"cp20", section:"CP", topic:"Work / energy", difficulty:"foundation", dia:null,
  q:"A 2 kg object is lifted 5 m at constant velocity (g ≈ 10 m/s²). The work done against gravity is:",
  choices:["100 J","10 J","20 J","50 J"], answer:0,
  exp:[
    "Correct. W = mgh = (2)(10)(5) = 100 J.",
    "10 J drops both the mass and height factors incorrectly.",
    "20 J is just mg (the weight), missing the height.",
    "50 J omits the factor of g or miscombines terms."],
  clinical:"Metabolic energy expenditure during exercise is quantified in joules/calories using this work relationship." },

/* ------ ORGANIC CHEMISTRY (within C/P) ------ */
{ id:"og1", section:"CP", topic:"Orgo · Substitution", difficulty:"hard", dia:"sn2",
  q:"A primary alkyl halide reacts with a strong, unhindered nucleophile in a polar aprotic solvent. The favored mechanism is:",
  choices:["SN2","SN1","E1","No reaction"], answer:0,
  exp:[
    "Correct. Primary substrate + strong nucleophile + polar aprotic solvent all favor a concerted SN2 (backside attack, inversion, 2nd-order).",
    "SN1 needs a stable (3°) carbocation and a polar protic solvent — not a primary substrate.",
    "E1 also requires carbocation formation and typically heat/weak base; primary substrates resist it.",
    "The reaction proceeds readily under these ideal SN2 conditions."],
  clinical:"Alkylating chemotherapy agents act via SN2-like attack on DNA nucleophiles, cross-linking strands." },

{ id:"og2", section:"CP", topic:"Orgo · Substitution", difficulty:"hard", dia:"sn1",
  q:"A tertiary alkyl halide is placed in warm ethanol (polar protic) with a weak nucleophile. The rate depends only on substrate concentration, indicating:",
  choices:["SN1 (unimolecular, rate-determining ionization)","SN2","E2","Zeroth order"], answer:0,
  exp:[
    "Correct. First-order kinetics (rate = k[substrate]) plus a 3° substrate and protic solvent point to SN1, whose slow step is carbocation formation.",
    "SN2 would be second order and is blocked by the crowded tertiary center.",
    "E2 is bimolecular (second order) and needs a strong base.",
    "The reaction is first order in substrate, not zeroth order."],
  clinical:"SN1 carbocation intermediates can rearrange; such rearrangements matter in drug-metabolism byproducts." },

{ id:"og3", section:"CP", topic:"Orgo · Elimination", difficulty:"hard", dia:null,
  q:"Which conditions most favor an E2 elimination over substitution?",
  choices:["Strong, bulky base with a secondary/tertiary substrate","Weak nucleophile, primary substrate","Polar protic solvent, low temperature","Strong small nucleophile, primary substrate"], answer:0,
  exp:[
    "Correct. A strong, bulky base (e.g., tert-butoxide) plus a hindered substrate and heat favors concerted E2 elimination over substitution.",
    "Weak nucleophile + primary substrate leans toward SN1/SN2 substitution, not E2.",
    "Cold polar protic conditions favor SN1/E1 pathways.",
    "A strong SMALL nucleophile on a primary substrate favors SN2 substitution."],
  clinical:"Understanding elimination vs substitution predicts which metabolite a liver enzyme will generate from a drug." },

{ id:"og4", section:"CP", topic:"Orgo · Stereochemistry", difficulty:"medium", dia:"chirality",
  q:"Two molecules are non-superimposable mirror images of each other. They are:",
  choices:["Enantiomers","Diastereomers","Structural isomers","Meso compounds"], answer:0,
  exp:[
    "Correct. Non-superimposable mirror images are enantiomers; they share identical physical properties except optical rotation and chiral interactions.",
    "Diastereomers are stereoisomers that are NOT mirror images (differ at some but not all stereocenters).",
    "Structural (constitutional) isomers differ in connectivity, not just 3D arrangement.",
    "A meso compound is achiral overall despite stereocenters — it is superimposable on its mirror image."],
  clinical:"Thalidomide's enantiomers differ drastically — one sedates, the other caused birth defects — showing chirality's clinical stakes." },

{ id:"og5", section:"CP", topic:"Orgo · Stereochemistry", difficulty:"hard", dia:"chirality",
  q:"A compound has two stereocenters but is optically inactive due to an internal mirror plane. It is a:",
  choices:["Meso compound","Pair of enantiomers","Racemic mixture","Diastereomer"], answer:0,
  exp:[
    "Correct. A meso compound contains stereocenters but an internal plane of symmetry makes it achiral and optically inactive.",
    "A single compound isn't a 'pair' of enantiomers; the stem describes one molecule.",
    "A racemic mixture is a 50:50 blend of two enantiomers — also inactive, but that's a mixture, not one symmetric molecule.",
    "A diastereomer is a relationship between molecules, not a description of internal symmetry."],
  clinical:"Tartaric acid's meso form vs its chiral forms is the classic example Pasteur used to found stereochemistry." },

{ id:"og6", section:"CP", topic:"Orgo · Carbonyls", difficulty:"medium", dia:"aldol",
  q:"Why is the carbonyl carbon (C=O) electrophilic and prone to nucleophilic attack?",
  choices:["Oxygen's electronegativity leaves the carbon partially positive","The carbon carries a full negative charge","Oxygen donates electrons to carbon","The bond is nonpolar"], answer:0,
  exp:[
    "Correct. Oxygen pulls electron density from carbon, giving the carbonyl carbon a partial positive charge (δ+) that nucleophiles attack.",
    "The carbonyl carbon is electron-poor (δ+), not negatively charged.",
    "Oxygen withdraws, not donates, electron density in a carbonyl.",
    "The C=O bond is strongly polar due to the electronegativity difference."],
  clinical:"Enzymes exploit carbonyl electrophilicity — proteases attack the peptide-bond carbonyl to cleave proteins." },

{ id:"og7", section:"CP", topic:"Orgo · Reactions", difficulty:"hard", dia:"aldol",
  q:"In an aldol condensation, the nucleophile that attacks the carbonyl is:",
  choices:["An enolate formed at the α-carbon","A hydroxide ion","A halide leaving group","The carbonyl oxygen"], answer:0,
  exp:[
    "Correct. Base removes an acidic α-hydrogen to form an enolate, whose α-carbon attacks another molecule's carbonyl, forming a β-hydroxy carbonyl.",
    "Hydroxide is the base/catalyst that generates the enolate, not the carbon nucleophile itself.",
    "No halide leaving group is involved in a classic aldol.",
    "The carbonyl oxygen is electrophilic-adjacent, not the attacking nucleophile."],
  clinical:"Aldolase in glycolysis performs the reverse (retro-aldol) cleavage of fructose-1,6-bisphosphate." },

{ id:"og8", section:"CP", topic:"Orgo · Amino acids", difficulty:"medium", dia:"aminoAcid",
  q:"At its isoelectric point (pI), a neutral amino acid exists predominantly as a:",
  choices:["Zwitterion with net charge zero","Fully protonated cation","Fully deprotonated anion","Nonpolar uncharged molecule"], answer:0,
  exp:[
    "Correct. At the pI the amino acid is a zwitterion: protonated amino group (NH₃⁺) and deprotonated carboxyl (COO⁻), net charge zero.",
    "The fully protonated cation dominates at low pH (below pI), not at the pI.",
    "The anion dominates at high pH (above pI).",
    "The molecule is charged (dipolar), not uncharged/nonpolar, at its pI."],
  clinical:"Proteins are least soluble at their pI (no net charge to repel neighbors) — used to precipitate proteins in the lab." },

{ id:"og9", section:"CP", topic:"Orgo · Lab techniques", difficulty:"medium", dia:null,
  q:"An IR spectrum shows a strong, sharp absorption near 1710 cm⁻¹. This most likely indicates a:",
  choices:["Carbonyl (C=O) group","Hydroxyl (O–H) group","Carbon-carbon single bond","Aromatic ring only"], answer:0,
  exp:[
    "Correct. A strong band around 1700–1750 cm⁻¹ is the hallmark of a C=O stretch (ketone/aldehyde/acid).",
    "O–H stretches appear as broad bands near 3200–3550 cm⁻¹, not a sharp 1710 signal.",
    "C–C single bonds are weak and appear in the low fingerprint region, not prominently at 1710.",
    "Aromatic C=C stretches appear near 1450–1600 cm⁻¹, lower than 1710."],
  clinical:"IR spectroscopy helps confirm drug functional groups in quality-control testing of pharmaceuticals." },

{ id:"og10", section:"CP", topic:"Orgo · Lab techniques", difficulty:"medium", dia:null,
  q:"Which technique separates compounds primarily by their differing boiling points?",
  choices:["Distillation","Thin-layer chromatography","Gel electrophoresis","Mass spectrometry"], answer:0,
  exp:[
    "Correct. Distillation exploits differences in boiling point — the more volatile component vaporizes and is collected first.",
    "TLC separates by polarity/affinity for the stationary phase, not boiling point.",
    "Gel electrophoresis separates charged molecules by size/charge in an electric field.",
    "Mass spectrometry sorts ions by mass-to-charge ratio, not boiling point."],
  clinical:"Fractional distillation purifies volatile anesthetics and other pharmaceutical solvents." },

{ id:"og11", section:"CP", topic:"Orgo · Lab techniques", difficulty:"hard", dia:null,
  q:"In ¹H NMR, the number of signals (peaks) tells you about:",
  choices:["The number of chemically distinct hydrogen environments","The molecular weight","The boiling point","The number of chiral centers"], answer:0,
  exp:[
    "Correct. Each set of chemically equivalent protons gives one signal, so peak count reveals the number of distinct H environments.",
    "Molecular weight is obtained from mass spectrometry, not NMR peak count.",
    "Boiling point isn't determined by NMR.",
    "Chiral-center count isn't read directly from the number of NMR signals."],
  clinical:"NMR-based metabolomics profiles patient biofluids to detect disease-specific metabolite patterns." },

{ id:"og12", section:"CP", topic:"Orgo · Stereochemistry", difficulty:"hard", dia:"chirality",
  q:"Assigning R/S configuration requires ranking substituents by:",
  choices:["Atomic number (Cahn–Ingold–Prelog priority)","Alphabetical name","Molecular weight of the whole group first","Bond length"], answer:0,
  exp:[
    "Correct. CIP rules rank the four groups by atomic number at the first point of difference; lowest priority points away, then trace 1→2→3.",
    "Alphabetical ordering is not how priority is assigned.",
    "You compare atom-by-atom outward, not the whole group's total mass up front.",
    "Bond length is irrelevant to CIP priority assignment."],
  clinical:"Drug receptors are chiral; the R vs S form of a drug like albuterol can differ in efficacy and side effects." },

/* ---------------------- PSYCH / SOC (PS) ---------------------- */
{ id:"ps1", section:"PS", topic:"Conditioning", difficulty:"foundation", dia:"conditioning",
  q:"In Pavlov's experiment, after conditioning, the bell alone makes the dog salivate. The bell is the:",
  choices:["Conditioned stimulus (CS)","Unconditioned stimulus (UCS)","Unconditioned response (UCR)","Neutral stimulus still"], answer:0,
  exp:[
    "Correct. Once a previously neutral stimulus (bell) reliably triggers a response after pairing with food, it is the conditioned stimulus.",
    "The unconditioned stimulus is the food, which naturally causes salivation without learning.",
    "The UCR is the reflexive salivation to food; it's a response, not the bell.",
    "The bell was neutral BEFORE conditioning; after learning it is 'conditioned,' not neutral."],
  clinical:"Classical conditioning explains taste aversions and is used in exposure therapy for phobias." },

{ id:"ps2", section:"PS", topic:"Operant conditioning", difficulty:"medium", dia:null,
  q:"A rat presses a lever and a shock is REMOVED. The lever-pressing increases. This is an example of:",
  choices:["Negative reinforcement","Positive reinforcement","Positive punishment","Negative punishment"], answer:0,
  exp:[
    "Correct. Removing an aversive stimulus (shock) to INCREASE a behavior is negative reinforcement ('negative' = removing, 'reinforcement' = behavior increases).",
    "Positive reinforcement ADDS a pleasant stimulus; here something is removed.",
    "Positive punishment adds something aversive to DECREASE behavior — but behavior increased here.",
    "Negative punishment removes a pleasant stimulus to decrease behavior; the shock isn't pleasant and behavior rose."],
  clinical:"Taking a painkiller relieves pain (removes an aversive state), negatively reinforcing continued use — a path to dependence." },

{ id:"ps3", section:"PS", topic:"Reinforcement schedules", difficulty:"hard", dia:null,
  q:"Which reinforcement schedule produces the highest, most resistant-to-extinction response rate?",
  choices:["Variable-ratio","Fixed-ratio","Fixed-interval","Variable-interval"], answer:0,
  exp:[
    "Correct. Variable-ratio schedules (reward after an unpredictable number of responses) yield the highest, steadiest rates and resist extinction — the gambling schedule.",
    "Fixed-ratio produces high rates but with a post-reward pause and less extinction resistance.",
    "Fixed-interval produces scalloped responding that dips right after reinforcement.",
    "Variable-interval gives steady but lower rates than variable-ratio."],
  clinical:"Slot machines use variable-ratio schedules precisely because they drive persistent, compulsive play — relevant to addiction." },

{ id:"ps4", section:"PS", topic:"Memory", difficulty:"medium", dia:"memoryModel",
  q:"According to the Atkinson–Shiffrin model, information moves from short-term to long-term memory primarily through:",
  choices:["Elaborative rehearsal","Sensory adaptation","Sensory memory decay","Retrograde amnesia"], answer:0,
  exp:[
    "Correct. Elaborative rehearsal — linking new information to existing knowledge — encodes material into durable long-term memory.",
    "Sensory adaptation is reduced responsiveness to constant stimuli, unrelated to memory transfer.",
    "Sensory memory decay is the rapid loss of unattended sensory input, the opposite of encoding.",
    "Retrograde amnesia is loss of old memories, not a mechanism for forming new ones."],
  clinical:"Deep, elaborative study (self-testing, linking concepts) beats rote repetition — the basis of effective MCAT prep itself." },

{ id:"ps5", section:"PS", topic:"Memory", difficulty:"medium", dia:"memoryModel",
  q:"On a word list, people best recall the first and last items. Better recall of the LAST items is the:",
  choices:["Recency effect (short-term memory)","Primacy effect (long-term memory)","Von Restorff effect","Tip-of-the-tongue phenomenon"], answer:0,
  exp:[
    "Correct. The recency effect is superior recall of final items, held fresh in short-term memory.",
    "The primacy effect refers to better recall of the FIRST items, encoded into long-term memory.",
    "The Von Restorff (isolation) effect is enhanced memory for a distinctive item, not position.",
    "Tip-of-the-tongue is failed retrieval of a known word, unrelated to serial position."],
  clinical:"Serial-position effects shape how clinicians structure patient education — key points go first and last." },

{ id:"ps6", section:"PS", topic:"Social psychology", difficulty:"hard", dia:null,
  q:"You assume a driver who cut you off is a rude person rather than considering they might have an emergency. This is the:",
  choices:["Fundamental attribution error","Self-serving bias","Just-world hypothesis","In-group bias"], answer:0,
  exp:[
    "Correct. The fundamental attribution error is over-attributing others' behavior to disposition (rudeness) while underweighting situational causes (an emergency).",
    "Self-serving bias is crediting our OWN successes to skill and failures to circumstances.",
    "The just-world hypothesis is believing people get what they deserve.",
    "In-group bias favors members of one's own group; it isn't about dispositional attribution."],
  clinical:"Clinicians who commit this error may blame patients for 'non-compliance' instead of examining access and social barriers." },

{ id:"ps7", section:"PS", topic:"Social psychology", difficulty:"medium", dia:null,
  q:"In Asch's line experiments, participants gave obviously wrong answers to match the group. This demonstrates:",
  choices:["Conformity (normative social influence)","Obedience to authority","Groupthink","Diffusion of responsibility"], answer:0,
  exp:[
    "Correct. Asch showed conformity — people match a group's judgment to fit in even against clear evidence (normative influence).",
    "Obedience (Milgram) involves following an authority figure's commands, not peer pressure.",
    "Groupthink is faulty group decision-making that suppresses dissent, a broader phenomenon than a single judgment.",
    "Diffusion of responsibility relates to bystander inaction, not matching group answers."],
  clinical:"Conformity pressures affect medical teams; safety culture encourages junior staff to speak up against a wrong consensus." },

{ id:"ps8", section:"PS", topic:"Social psychology", difficulty:"medium", dia:null,
  q:"A person collapses in a crowded plaza but no one helps, each assuming someone else will. This is:",
  choices:["The bystander effect (diffusion of responsibility)","Social facilitation","Deindividuation","Social loafing"], answer:0,
  exp:[
    "Correct. The bystander effect: the more witnesses present, the less likely any individual helps, due to diffusion of responsibility.",
    "Social facilitation is improved performance on easy tasks when observed — not failure to help.",
    "Deindividuation is loss of self-awareness in groups, often enabling impulsive acts.",
    "Social loafing is reduced individual effort in group tasks, related but specific to shared work output."],
  clinical:"Emergency training teaches you to point at one specific person to break the bystander effect and get help." },

{ id:"ps9", section:"PS", topic:"Personality", difficulty:"hard", dia:null,
  q:"The 'Big Five' model of personality includes which of the following traits?",
  choices:["Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism","Id, Ego, Superego","Oral, Anal, Phallic stages","Sensing, Intuition, Thinking, Feeling"], answer:0,
  exp:[
    "Correct. OCEAN — Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism — is the empirically supported Big Five (Five-Factor) model.",
    "Id/Ego/Superego are Freud's psychoanalytic structures, not the Big Five.",
    "Oral/anal/phallic are Freud's psychosexual stages.",
    "Sensing/Intuition/Thinking/Feeling are Myers–Briggs dimensions, which lack the Big Five's empirical support."],
  clinical:"High conscientiousness predicts better health behaviors and treatment adherence across many studies." },

{ id:"ps10", section:"PS", topic:"Personality", difficulty:"medium", dia:null,
  q:"In Freud's model, which structure operates on the 'reality principle,' mediating between desires and the external world?",
  choices:["Ego","Id","Superego","Unconscious"], answer:0,
  exp:[
    "Correct. The ego works on the reality principle, balancing the id's impulses against real-world constraints and the superego's morals.",
    "The id runs on the pleasure principle, demanding immediate gratification.",
    "The superego is the internalized moral conscience, not the reality mediator.",
    "The unconscious is a region of mind in Freud's topography, not one of the three structural agents."],
  clinical:"Freud's model is largely historical, but defense-mechanism concepts still inform how clinicians understand coping." },

{ id:"ps11", section:"PS", topic:"Neurotransmitters", difficulty:"hard", dia:null,
  q:"Which neurotransmitter is most associated with reward, motivation, and the pathology of Parkinson's disease?",
  choices:["Dopamine","Serotonin","GABA","Acetylcholine"], answer:0,
  exp:[
    "Correct. Dopamine drives reward/motivation pathways; loss of dopaminergic neurons in the substantia nigra causes Parkinson's motor symptoms.",
    "Serotonin regulates mood, sleep, and appetite and is the target of SSRIs, not Parkinson's.",
    "GABA is the main inhibitory neurotransmitter; its dysfunction relates to anxiety and seizures.",
    "Acetylcholine mediates muscle activation and memory; its loss is central to Alzheimer's, not Parkinson's motor deficits."],
  clinical:"L-DOPA replenishes dopamine to treat Parkinson's; dopamine dysregulation also underlies addiction and schizophrenia." },

{ id:"ps12", section:"PS", topic:"Neurotransmitters", difficulty:"medium", dia:null,
  q:"GABA is the brain's primary inhibitory neurotransmitter. Benzodiazepines enhance its effect, producing:",
  choices:["Sedation and reduced anxiety","Increased alertness and excitation","Muscle rigidity","Elevated heart rate"], answer:0,
  exp:[
    "Correct. By enhancing GABA-mediated chloride influx, benzodiazepines hyperpolarize neurons, causing sedation, anxiolysis, and muscle relaxation.",
    "GABA is inhibitory, so enhancing it reduces, not raises, excitation.",
    "Enhanced GABA relaxes muscles rather than causing rigidity.",
    "GABA enhancement calms sympathetic activity; it doesn't raise heart rate."],
  clinical:"Benzodiazepine overdose causes dangerous CNS depression, reversed by the GABA-A antagonist flumazenil." },

{ id:"ps13", section:"PS", topic:"Sleep", difficulty:"medium", dia:null,
  q:"Vivid dreaming, muscle atonia, and brain activity resembling wakefulness characterize which sleep stage?",
  choices:["REM sleep","Stage 1 (NREM)","Stage 3 slow-wave sleep","Stage 2 (NREM)"], answer:0,
  exp:[
    "Correct. REM sleep features vivid dreams, near-total skeletal muscle paralysis (atonia), and a wake-like, desynchronized EEG.",
    "Stage 1 is light transitional sleep with theta waves, not vivid dreaming.",
    "Stage 3 slow-wave (delta) sleep is deep, dreamless, restorative sleep, not REM.",
    "Stage 2 shows sleep spindles and K-complexes, not REM's characteristics."],
  clinical:"REM sleep behavior disorder — acting out dreams due to lost atonia — can be an early sign of Parkinson's disease." },

{ id:"ps14", section:"PS", topic:"Sensation & perception", difficulty:"hard", dia:"weber",
  q:"Weber's law states that the just-noticeable difference (JND) between two stimuli is:",
  choices:["A constant proportion of the original stimulus intensity","A fixed absolute amount regardless of intensity","Independent of the baseline stimulus","Determined only by the absolute threshold"], answer:0,
  exp:[
    "Correct. Weber's law: ΔI/I = constant. The JND is a constant FRACTION of the baseline, so stronger stimuli require larger absolute changes to be detected.",
    "A fixed absolute JND contradicts Weber's law; the increment scales with intensity.",
    "The JND clearly depends on the baseline intensity — that's the whole point.",
    "The absolute threshold is the minimum detectable stimulus, a different concept from the JND."],
  clinical:"Weber's law explains why adding one candle to a dim room is noticeable but not to a bright one — relevant to pain-scale perception." },

{ id:"ps15", section:"PS", topic:"Sensation & perception", difficulty:"medium", dia:null,
  q:"Signal detection theory explains that whether a faint stimulus is detected depends on both sensitivity and:",
  choices:["The observer's response criterion (bias)","Only the absolute threshold","The stimulus wavelength alone","Random neural firing exclusively"], answer:0,
  exp:[
    "Correct. Signal detection theory separates sensitivity (d′) from the response criterion — the observer's willingness to say 'yes,' shaped by expectations and rewards.",
    "A single fixed absolute threshold ignores the decision/criterion component the theory adds.",
    "Wavelength is a physical property, not the decision factor the theory highlights.",
    "Noise matters, but detection is not determined by random firing exclusively; the criterion is central."],
  clinical:"Radiologists' criterion shifts explain false positives vs misses — heavily studied to improve cancer screening accuracy." },

{ id:"ps16", section:"PS", topic:"Health disparities", difficulty:"hard", dia:null,
  q:"Research consistently shows a 'social gradient' in health, meaning:",
  choices:["Health improves stepwise with each rise in socioeconomic status","Only the very poorest have worse health","Income has no measurable effect on health","Health depends solely on genetics"], answer:0,
  exp:[
    "Correct. The social gradient (e.g., Whitehall studies) shows health improves at every step UP the socioeconomic ladder, not just at the bottom.",
    "It's not just the poorest — the gradient is continuous across all SES levels.",
    "Income robustly correlates with health outcomes; claiming no effect contradicts the evidence.",
    "Genetics matters but social determinants independently and powerfully shape population health."],
  clinical:"Addressing social determinants (housing, income, education) can improve outcomes more than clinical care alone." },

/* ---------------------- EXTRA MIX ---------------------- */
{ id:"bb27", section:"BB", topic:"Action potential", difficulty:"hard", dia:"actionPotential",
  q:"During the rising (depolarization) phase of a neuron's action potential, which ion movement is responsible?",
  choices:["Na⁺ rushing into the cell","K⁺ leaving the cell","Cl⁻ entering the cell","Ca²⁺ leaving the cell"], answer:0,
  exp:[
    "Correct. Voltage-gated Na⁺ channels open, and Na⁺ floods in down its gradient, rapidly depolarizing the membrane toward +30 mV.",
    "K⁺ efflux causes repolarization (the falling phase), not the rise.",
    "Cl⁻ influx is inhibitory/hyperpolarizing, not the source of the upswing.",
    "Ca²⁺ efflux isn't the depolarizing current in a typical neuronal action potential."],
  clinical:"Local anesthetics like lidocaine block voltage-gated Na⁺ channels, preventing the depolarization that signals pain." },

{ id:"bb28", section:"BB", topic:"Enzyme cofactors", difficulty:"medium", dia:null,
  q:"A tightly bound, often organic, non-protein molecule required for enzyme activity is called a:",
  choices:["Coenzyme/prosthetic group","Substrate","Allosteric inhibitor","Zymogen"], answer:0,
  exp:[
    "Correct. Coenzymes (often vitamin-derived) and prosthetic groups are non-protein helpers essential for catalysis (e.g., NAD⁺, FAD, heme).",
    "The substrate is the molecule transformed by the enzyme, not a permanent helper.",
    "An allosteric inhibitor decreases activity; a cofactor is required FOR activity.",
    "A zymogen is an inactive enzyme precursor, not a cofactor."],
  clinical:"Vitamin deficiencies (e.g., B-vitamins) impair coenzyme function, causing diseases like beriberi and pellagra." },

{ id:"cp21", section:"CP", topic:"Electrochemistry", difficulty:"hard", dia:"galvanic",
  q:"A galvanic cell has a positive standard cell potential (E°cell > 0). This means the redox reaction is:",
  choices:["Spontaneous (ΔG° < 0)","Nonspontaneous","At equilibrium","Endergonic"], answer:0,
  exp:[
    "Correct. ΔG° = −nFE°cell; a positive E°cell makes ΔG° negative — the reaction is spontaneous, as expected for a galvanic cell.",
    "Nonspontaneous reactions have negative E°cell (they define electrolytic cells).",
    "Equilibrium corresponds to E°cell = 0, not positive.",
    "Endergonic (ΔG > 0) contradicts a positive cell potential."],
  clinical:"Biological redox couples (e.g., the electron transport chain) release energy exactly by this spontaneous electron flow." },

{ id:"cp22", section:"CP", topic:"Thermochemistry", difficulty:"medium", dia:null,
  q:"Which process is endothermic?",
  choices:["Melting ice","Water freezing","Water vapor condensing","Combustion of methane"], answer:0,
  exp:[
    "Correct. Melting absorbs heat to break intermolecular forces — an endothermic phase change.",
    "Freezing releases heat (exothermic) as molecules lock into a lattice.",
    "Condensation releases the heat of vaporization — exothermic.",
    "Combustion is strongly exothermic, releasing large amounts of heat."],
  clinical:"Endothermic cold packs use ammonium nitrate dissolving to absorb heat and reduce swelling of injuries." },

{ id:"ps17", section:"PS", topic:"Development", difficulty:"medium", dia:null,
  q:"According to Piaget, a child who cannot yet understand that a squashed ball of clay has the same amount of material is in which stage?",
  choices:["Preoperational","Concrete operational","Formal operational","Sensorimotor"], answer:0,
  exp:[
    "Correct. Lacking conservation is a hallmark of the preoperational stage (~2–7 years), which also features egocentrism.",
    "Concrete operational children (~7–11) DO grasp conservation.",
    "Formal operational adolescents reason abstractly, well beyond conservation tasks.",
    "Sensorimotor infants (0–2) are focused on object permanence, not conservation of mass."],
  clinical:"Understanding cognitive stages helps pediatricians tailor how they explain illness and procedures to children." },

{ id:"ps18", section:"PS", topic:"Stress & health", difficulty:"hard", dia:"yerkesDodson",
  q:"In Selye's General Adaptation Syndrome, the stage of prolonged stress where the body's resources become depleted is:",
  choices:["Exhaustion","Alarm","Resistance","Appraisal"], answer:0,
  exp:[
    "Correct. The exhaustion stage follows prolonged stress; depleted resources raise vulnerability to illness and burnout.",
    "The alarm stage is the initial fight-or-flight activation.",
    "The resistance stage is the body's sustained coping effort before depletion.",
    "Appraisal is from Lazarus's cognitive model, not one of Selye's three GAS stages."],
  clinical:"Chronic stress and cortisol elevation in the exhaustion phase are linked to hypertension, immunosuppression, and depression." },

{ id:"bb29", section:"BB", topic:"Immunology", difficulty:"medium", dia:null,
  q:"Which cells produce antibodies in the adaptive immune response?",
  choices:["Plasma cells (differentiated B cells)","Cytotoxic T cells","Macrophages","Natural killer cells"], answer:0,
  exp:[
    "Correct. Activated B cells differentiate into plasma cells, which secrete large amounts of antigen-specific antibodies.",
    "Cytotoxic T cells kill infected cells directly; they don't secrete antibodies.",
    "Macrophages phagocytose pathogens and present antigen but don't make antibodies.",
    "NK cells are innate lymphocytes that kill stressed cells without antibody production."],
  clinical:"Vaccines work by generating memory B cells so plasma cells can rapidly produce antibodies upon real exposure." },

{ id:"cp23", section:"CP", topic:"Waves", difficulty:"foundation", dia:null,
  q:"A wave has a frequency of 500 Hz and travels at 340 m/s. Its wavelength is:",
  choices:["0.68 m","1.47 m","170 m","840 m"], answer:0,
  exp:[
    "Correct. λ = v/f = 340/500 = 0.68 m.",
    "1.47 m inverts the ratio (f/v).",
    "170 m comes from multiplying incorrectly (v/2 or similar error).",
    "840 m adds v and f, which is dimensionally invalid."],
  clinical:"Ultrasound imaging chooses frequency to trade resolution against penetration depth via this wave relationship." },

];

/* ----------------------------------------------------------------------------
   4b. EXPANSION BANK — high-yield memorization cards (fact-checked).
   Correct choice is authored first (answer:0); choices are shuffled at runtime
   so the answer isn't always "A".
---------------------------------------------------------------------------- */
const NEW_BANK = [
/* ---------- BIO / BIOCHEM ---------- */
{ id:"bb30", section:"BB", topic:"Amino acids", difficulty:"foundation", dia:null,
  q:"Which of the standard amino acids is achiral (has no stereocenter)?",
  choices:["Glycine","Alanine","Serine","Threonine"], answer:0,
  exp:["Correct. Glycine's side chain is a single H, so its α-carbon has two identical H's — no four different groups, no chirality.",
    "Alanine has a methyl side chain and is chiral (L-form in proteins).",
    "Serine's –CH2OH side chain makes it chiral.",
    "Threonine actually has TWO stereocenters, so it is definitely chiral."],
  clinical:"Glycine's small, flexible residue is essential at tight turns in collagen's triple helix (every third residue)." },
{ id:"bb31", section:"BB", topic:"Amino acids", difficulty:"medium", dia:null,
  q:"Which two amino acids contain sulfur in their side chains?",
  choices:["Cysteine and methionine","Serine and threonine","Aspartate and glutamate","Lysine and arginine"], answer:0,
  exp:["Correct. Cysteine (–SH thiol) and methionine (thioether) are the sulfur-containing amino acids.",
    "Serine and threonine carry hydroxyl (–OH) groups, not sulfur.",
    "Aspartate and glutamate are the acidic, carboxylate-bearing amino acids.",
    "Lysine and arginine are basic amino acids with nitrogen-rich side chains."],
  clinical:"Cysteine's thiol forms disulfide bridges that stabilize protein tertiary structure and give hair its shape." },
{ id:"bb32", section:"BB", topic:"Protein structure", difficulty:"medium", dia:null,
  q:"Covalent disulfide bridges that stabilize tertiary structure form between the side chains of which residue?",
  choices:["Cysteine","Methionine","Proline","Histidine"], answer:0,
  exp:["Correct. Two cysteine thiols (–SH) oxidize to form a covalent S–S disulfide bond.",
    "Methionine's sulfur is a thioether and cannot form disulfide bridges.",
    "Proline introduces kinks and disrupts helices; it forms no disulfides.",
    "Histidine's imidazole is important in catalysis/buffering, not disulfides."],
  clinical:"Reducing agents that break disulfides (e.g., in a perm) let hair keratin be reshaped, then re-oxidized." },
{ id:"bb33", section:"BB", topic:"Isoelectric point", difficulty:"medium", dia:null,
  q:"At its isoelectric point (pI), an amino acid or protein:",
  choices:["Carries no net charge and won't migrate in an electric field","Is maximally positively charged","Is most soluble in water","Has all groups fully protonated"], answer:0,
  exp:["Correct. At the pI the net charge is zero (it exists as a zwitterion), so it does not migrate toward either electrode.",
    "Maximal positive charge occurs at very low pH, well below the pI.",
    "Proteins are usually LEAST soluble at their pI and can precipitate.",
    "Full protonation happens at low pH, not at the pI."],
  clinical:"Isoelectric focusing separates proteins by pI and is a key step in 2-D gel electrophoresis." },
{ id:"bb34", section:"BB", topic:"Enzymes", difficulty:"foundation", dia:null,
  q:"An enzyme that transfers a phosphate group from ATP to a substrate is called a:",
  choices:["Kinase","Phosphatase","Polymerase","Isomerase"], answer:0,
  exp:["Correct. Kinases catalyze phosphorylation — transfer of a phosphate, typically from ATP.",
    "A phosphatase REMOVES phosphate groups (hydrolysis), the opposite reaction.",
    "Polymerases build nucleic acid (or other) polymers.",
    "Isomerases rearrange a molecule into an isomer without adding/removing atoms."],
  clinical:"Protein kinases drive most signal-transduction cascades; many cancer drugs are kinase inhibitors (e.g., imatinib)." },
{ id:"bb35", section:"BB", topic:"Endocrine", difficulty:"foundation", dia:null,
  q:"Insulin is secreted by which cells, and what does it do to blood glucose?",
  choices:["Pancreatic β-cells; lowers blood glucose","Pancreatic α-cells; raises blood glucose","Adrenal medulla; raises blood glucose","Thyroid follicular cells; lowers blood glucose"], answer:0,
  exp:["Correct. β-cells of the pancreatic islets release insulin, which promotes glucose uptake and lowers blood sugar.",
    "α-cells secrete glucagon, which RAISES blood glucose — the opposite of insulin.",
    "The adrenal medulla releases epinephrine, which raises glucose during stress.",
    "Thyroid follicular cells make thyroid hormone, not insulin."],
  clinical:"Type 1 diabetes is autoimmune destruction of β-cells; patients require exogenous insulin." },
{ id:"bb36", section:"BB", topic:"Endocrine", difficulty:"foundation", dia:null,
  q:"Glucagon, released when blood sugar is low, primarily acts to:",
  choices:["Raise blood glucose by promoting glycogenolysis and gluconeogenesis","Lower blood glucose by driving cellular uptake","Store glucose as glycogen","Increase insulin secretion directly"], answer:0,
  exp:["Correct. Glucagon (from pancreatic α-cells) mobilizes glucose — breaking down glycogen and making new glucose in the liver.",
    "Lowering glucose via uptake is insulin's job, not glucagon's.",
    "Glycogen storage (glycogenesis) is promoted by insulin, opposing glucagon.",
    "Glucagon and insulin are reciprocally regulated; glucagon doesn't stimulate insulin."],
  clinical:"Injectable glucagon rescues a patient from severe hypoglycemia by rapidly raising blood sugar." },
{ id:"bb37", section:"BB", topic:"Endocrine", difficulty:"medium", dia:null,
  q:"Steroid hormones (e.g., cortisol, estrogen) exert their effects by:",
  choices:["Crossing the membrane and binding intracellular receptors that alter transcription","Binding surface GPCRs to raise cAMP","Opening ligand-gated ion channels","Being stored in vesicles and released by exocytosis"], answer:0,
  exp:["Correct. Lipid-soluble steroids diffuse through the membrane and bind cytoplasmic/nuclear receptors that act as transcription factors.",
    "Surface-receptor/cAMP signaling is typical of peptide hormones, which cannot cross the membrane.",
    "Ligand-gated channels are a neurotransmitter mechanism, not steroid action.",
    "Steroids are synthesized on demand from cholesterol, not pre-stored in vesicles."],
  clinical:"Because steroids act via transcription, their effects have a slower onset but longer duration than peptide hormones." },
{ id:"bb38", section:"BB", topic:"Endocrine", difficulty:"medium", dia:null,
  q:"Parathyroid hormone (PTH) and calcitonin have opposing effects on blood calcium. PTH:",
  choices:["Raises blood calcium; calcitonin lowers it","Lowers blood calcium; calcitonin raises it","Has no effect on calcium; only on phosphate","Is secreted by the thyroid's follicular cells"], answer:0,
  exp:["Correct. PTH raises blood Ca²⁺ (bone resorption, renal reabsorption, activating vitamin D); calcitonin lowers it.",
    "This reverses their roles — PTH raises, calcitonin lowers.",
    "PTH strongly regulates calcium (and phosphate); it is not calcium-neutral.",
    "PTH comes from the parathyroid glands; calcitonin comes from thyroid C-cells."],
  clinical:"Hyperparathyroidism causes hypercalcemia — 'stones, bones, groans, and psychiatric moans.'" },
{ id:"bb39", section:"BB", topic:"Renal", difficulty:"medium", dia:null,
  q:"In the nephron, the majority of filtered water and solutes are reabsorbed in the:",
  choices:["Proximal convoluted tubule","Distal convoluted tubule","Collecting duct","Glomerulus"], answer:0,
  exp:["Correct. The PCT reabsorbs roughly two-thirds of filtered Na⁺, water, and nearly all glucose and amino acids.",
    "The DCT fine-tunes reabsorption (under aldosterone) but handles far less volume.",
    "The collecting duct adjusts final water content under ADH, not the bulk.",
    "The glomerulus filters plasma; it does not reabsorb."],
  clinical:"In diabetes, glucose exceeds the PCT's reabsorptive capacity and spills into urine (glucosuria)." },
{ id:"bb40", section:"BB", topic:"Renal", difficulty:"medium", dia:null,
  q:"Antidiuretic hormone (ADH/vasopressin) acts on the collecting duct to:",
  choices:["Insert aquaporins and increase water reabsorption","Increase sodium secretion","Decrease water reabsorption, producing dilute urine","Stimulate renin release"], answer:0,
  exp:["Correct. ADH inserts aquaporin-2 channels, increasing water reabsorption and concentrating the urine.",
    "ADH's action is on water, not primarily sodium secretion.",
    "That is the opposite — low ADH gives dilute urine; high ADH concentrates it.",
    "Renin release is triggered by low pressure/Na⁺ at the JGA, not by ADH."],
  clinical:"Diabetes insipidus (lack of ADH or renal resistance) causes copious dilute urine and intense thirst." },
{ id:"bb41", section:"BB", topic:"Renal", difficulty:"medium", dia:null,
  q:"Aldosterone, from the adrenal cortex, acts on the distal nephron to:",
  choices:["Increase Na⁺ reabsorption and K⁺ secretion","Increase K⁺ reabsorption and Na⁺ secretion","Increase water reabsorption via aquaporins","Decrease blood pressure"], answer:0,
  exp:["Correct. Aldosterone promotes Na⁺ (and water) reabsorption while secreting K⁺, raising blood volume/pressure.",
    "This reverses the ion directions — aldosterone keeps Na⁺, dumps K⁺.",
    "Aquaporin insertion is ADH's mechanism; aldosterone works via Na⁺ channels/pumps.",
    "By retaining salt and water, aldosterone RAISES blood pressure."],
  clinical:"The RAAS pathway (renin→angiotensin→aldosterone) is a major drug target for hypertension (ACE inhibitors)." },
{ id:"bb42", section:"BB", topic:"Respiration", difficulty:"foundation", dia:null,
  q:"During normal inhalation, the diaphragm:",
  choices:["Contracts and flattens, increasing thoracic volume","Relaxes and domes upward, increasing volume","Contracts, decreasing thoracic volume","Plays no role; only intercostals matter"], answer:0,
  exp:["Correct. Diaphragm contraction flattens it, expanding the thoracic cavity and dropping pressure so air flows in.",
    "Relaxation/doming happens during exhalation, decreasing volume.",
    "Contraction increases, not decreases, thoracic volume.",
    "The diaphragm is the primary muscle of quiet breathing."],
  clinical:"Phrenic nerve injury (C3–C5) paralyzes the diaphragm — 'C3,4,5 keep the diaphragm alive.'" },
{ id:"bb43", section:"BB", topic:"Blood", difficulty:"medium", dia:null,
  q:"Most carbon dioxide is transported in the blood as:",
  choices:["Bicarbonate ion (HCO3⁻) in plasma","Dissolved CO2 gas","Carbaminohemoglobin","Carbonic acid crystals"], answer:0,
  exp:["Correct. ~70% of CO2 travels as bicarbonate after carbonic anhydrase converts CO2 + H2O ⇌ H2CO3 ⇌ HCO3⁻ + H⁺.",
    "Only a small fraction (~7%) is dissolved as gas.",
    "About 20–23% binds hemoglobin as carbaminohemoglobin — significant but not the majority.",
    "Carbonic acid is a transient intermediate, not a storage/transport form."],
  clinical:"This bicarbonate buffer system is central to acid–base balance; hyperventilation lowers CO2 and raises blood pH." },
{ id:"bb44", section:"BB", topic:"Blood", difficulty:"foundation", dia:null,
  q:"The protein that polymerizes to form the structural mesh of a blood clot is:",
  choices:["Fibrin (from fibrinogen)","Albumin","Hemoglobin","Thrombin"], answer:0,
  exp:["Correct. Thrombin cleaves soluble fibrinogen into fibrin, which polymerizes into the clot's mesh.",
    "Albumin maintains oncotic pressure; it isn't part of the clot mesh.",
    "Hemoglobin carries oxygen inside RBCs; it doesn't form the clot.",
    "Thrombin is the enzyme that MAKES fibrin, not the mesh itself."],
  clinical:"Warfarin and heparin target the clotting cascade upstream of fibrin to prevent thrombosis." },
{ id:"bb45", section:"BB", topic:"Immunology", difficulty:"medium", dia:null,
  q:"Antibodies (immunoglobulins) are produced by:",
  choices:["Plasma cells derived from B lymphocytes","Cytotoxic T cells","Macrophages","Natural killer cells"], answer:0,
  exp:["Correct. Activated B cells differentiate into plasma cells that secrete antibodies (humoral immunity).",
    "Cytotoxic T cells kill infected cells directly; they don't secrete antibodies.",
    "Macrophages phagocytose and present antigen but don't make antibodies.",
    "NK cells kill stressed/infected cells via innate mechanisms, not antibodies."],
  clinical:"Vaccines work by generating memory B cells so antibody production is fast on re-exposure." },
{ id:"bb46", section:"BB", topic:"Immunology", difficulty:"foundation", dia:null,
  q:"Which pair belongs to the INNATE immune system?",
  choices:["Neutrophils and macrophages","B cells and antibodies","Memory T cells","Plasma cells"], answer:0,
  exp:["Correct. Neutrophils and macrophages are non-specific first responders — innate immunity.",
    "B cells and antibodies are hallmark ADAPTIVE (specific) immunity.",
    "Memory T cells provide adaptive, antigen-specific recall responses.",
    "Plasma cells are differentiated B cells of the adaptive system."],
  clinical:"Innate immunity acts within minutes to hours; adaptive immunity takes days but confers memory." },
{ id:"bb47", section:"BB", topic:"Digestion", difficulty:"foundation", dia:null,
  q:"Which enzyme begins protein digestion in the acidic environment of the stomach?",
  choices:["Pepsin","Amylase","Lipase","Trypsin"], answer:0,
  exp:["Correct. Pepsin (activated from pepsinogen by HCl) digests proteins optimally at the stomach's low pH.",
    "Amylase digests starch, and salivary amylase is inactivated by stomach acid.",
    "Lipase digests fats, mainly in the small intestine.",
    "Trypsin digests protein but works in the small intestine, not the stomach."],
  clinical:"H. pylori infection disrupts the mucosal barrier, letting acid/pepsin ulcerate the stomach lining." },
{ id:"bb48", section:"BB", topic:"Digestion", difficulty:"medium", dia:null,
  q:"Bile, produced by the liver and stored in the gallbladder, functions to:",
  choices:["Emulsify fats to increase surface area for lipase","Chemically digest proteins","Break the glycosidic bonds of starch","Neutralize all stomach acid enzymatically"], answer:0,
  exp:["Correct. Bile salts emulsify large fat globules into micelles, greatly increasing the area for lipase to act — a physical, not enzymatic, process.",
    "Bile contains no protease; it doesn't digest protein.",
    "Starch digestion is done by amylases, not bile.",
    "Bicarbonate (from the pancreas) neutralizes acid; bile is not an acid-neutralizing enzyme."],
  clinical:"Gallstones can block the bile duct, causing fat malabsorption and jaundice." },
{ id:"bb49", section:"BB", topic:"Cardiac physiology", difficulty:"foundation", dia:null,
  q:"The heart's natural pacemaker, which sets the baseline rhythm, is the:",
  choices:["Sinoatrial (SA) node","Atrioventricular (AV) node","Bundle of His","Purkinje fibers"], answer:0,
  exp:["Correct. The SA node in the right atrium spontaneously depolarizes fastest, setting heart rate.",
    "The AV node delays the signal between atria and ventricles; it's a backup pacemaker.",
    "The bundle of His conducts the impulse into the ventricular septum.",
    "Purkinje fibers rapidly spread the signal through ventricular walls."],
  clinical:"SA node dysfunction (sick sinus syndrome) may require an artificial pacemaker." },
{ id:"bb50", section:"BB", topic:"Cardiac physiology", difficulty:"hard", dia:null,
  q:"By the Frank–Starling mechanism, increasing venous return (preload) to the heart:",
  choices:["Stretches cardiac muscle and increases stroke volume","Decreases stroke volume by overloading","Has no effect on stroke volume","Only changes heart rate, not stroke volume"], answer:0,
  exp:["Correct. Greater end-diastolic stretch increases contractile force, so stroke volume rises to match venous return.",
    "Within the physiologic range, more filling raises (not lowers) output.",
    "Stroke volume is preload-dependent — this is the core of the mechanism.",
    "Frank–Starling concerns stroke volume/contractility, not heart rate."],
  clinical:"In heart failure the curve shifts down; the same preload generates less stroke volume." },
{ id:"bb51", section:"BB", topic:"Neurons", difficulty:"medium", dia:"actionPotential",
  q:"Myelin sheaths speed neural conduction primarily by enabling:",
  choices:["Saltatory conduction — the impulse jumps between nodes of Ranvier","Continuous depolarization of the entire axon","Faster neurotransmitter synthesis","A larger resting membrane potential"], answer:0,
  exp:["Correct. Myelin insulates the axon so the action potential regenerates only at the nodes of Ranvier, 'jumping' rapidly.",
    "Continuous conduction along the whole membrane is the SLOWER, unmyelinated mode.",
    "Myelin affects conduction speed, not transmitter synthesis rate.",
    "Myelin changes conduction, not the magnitude of the resting potential."],
  clinical:"Multiple sclerosis destroys CNS myelin, slowing/blocking conduction and causing varied neurologic deficits." },
{ id:"bb52", section:"BB", topic:"Synapse", difficulty:"medium", dia:null,
  q:"Neurotransmitter release at a chemical synapse is triggered when the action potential causes:",
  choices:["Ca²⁺ influx into the presynaptic terminal, driving vesicle fusion","K⁺ influx that hyperpolarizes the terminal","Cl⁻ efflux from the axon","Direct electrical coupling to the next cell"], answer:0,
  exp:["Correct. Depolarization opens voltage-gated Ca²⁺ channels; Ca²⁺ entry triggers synaptic vesicles to fuse and release transmitter.",
    "K⁺ movement repolarizes the membrane; it doesn't trigger release.",
    "Cl⁻ movements are inhibitory and not the release trigger.",
    "Direct electrical coupling describes gap junctions/electrical synapses, not chemical ones."],
  clinical:"Botulinum toxin blocks acetylcholine vesicle release, causing flaccid paralysis (and cosmetic 'Botox')." },
{ id:"bb53", section:"BB", topic:"Muscle", difficulty:"hard", dia:null,
  q:"In skeletal muscle contraction, Ca²⁺ released from the sarcoplasmic reticulum binds to:",
  choices:["Troponin, moving tropomyosin to expose actin's myosin-binding sites","Myosin heads directly, causing them to detach","Actin, permanently locking the filaments","The T-tubule to end contraction"], answer:0,
  exp:["Correct. Ca²⁺ binds troponin, shifting tropomyosin off the binding sites so myosin can form cross-bridges (sliding filament model).",
    "Myosin binds ATP to detach; Ca²⁺ acts on the thin filament, not myosin directly.",
    "Actin's sites are exposed, not permanently locked; contraction is cyclical.",
    "T-tubules carry the depolarization inward to trigger — not terminate — release."],
  clinical:"Rigor mortis occurs because ATP depletion after death prevents myosin from releasing actin." },
{ id:"bb54", section:"BB", topic:"Metabolism", difficulty:"foundation", dia:null,
  q:"Excess glucose is stored in liver and muscle as the branched polymer:",
  choices:["Glycogen","Starch","Cellulose","Triglyceride"], answer:0,
  exp:["Correct. Animals store glucose as glycogen, a highly branched polymer, via glycogenesis.",
    "Starch is the storage polysaccharide of plants, not animals.",
    "Cellulose is a structural plant polysaccharide humans can't digest.",
    "Triglycerides store energy as fat, but they aren't a glucose polymer."],
  clinical:"Glycogen storage diseases (e.g., von Gierke, Pompe) result from defective glycogen enzymes." },
{ id:"bb55", section:"BB", topic:"Genetics", difficulty:"medium", dia:null,
  q:"In a dihybrid cross between two heterozygotes (AaBb × AaBb), the classic phenotypic ratio is:",
  choices:["9:3:3:1","3:1","1:2:1","1:1:1:1"], answer:0,
  exp:["Correct. Two independently assorting traits give 9:3:3:1 in the F2 generation.",
    "3:1 is the monohybrid F2 phenotypic ratio.",
    "1:2:1 is the monohybrid GENOTYPIC ratio.",
    "1:1:1:1 is a testcross (dihybrid × fully recessive) result."],
  clinical:"Deviations from 9:3:3:1 hint at linkage, epistasis, or lethal allele combinations." },
{ id:"bb56", section:"BB", topic:"Biochemistry", difficulty:"medium", dia:null,
  q:"A competitive inhibitor's effect can be overcome by:",
  choices:["Increasing substrate concentration","Adding more inhibitor","Lowering temperature only","It cannot be overcome"], answer:0,
  exp:["Correct. Competitive inhibitors compete for the active site, so excess substrate outcompetes them — Vmax is unchanged, apparent Km rises.",
    "More inhibitor worsens the block, not overcomes it.",
    "Temperature isn't the mechanism of competitive relief.",
    "Competitive inhibition is specifically the reversible type overcome by substrate."],
  clinical:"Ethanol competitively displaces methanol from alcohol dehydrogenase — a treatment for methanol poisoning." },
{ id:"bb57", section:"BB", topic:"Cell biology", difficulty:"foundation", dia:null,
  q:"Which organelle is the primary site of ATP production via oxidative phosphorylation?",
  choices:["Mitochondrion","Ribosome","Smooth endoplasmic reticulum","Lysosome"], answer:0,
  exp:["Correct. The mitochondrion houses the electron transport chain and ATP synthase on its inner membrane.",
    "Ribosomes synthesize proteins; they don't generate ATP.",
    "Smooth ER handles lipid synthesis and detoxification.",
    "Lysosomes degrade cellular waste with hydrolytic enzymes."],
  clinical:"Mitochondrial DNA is maternally inherited, so mitochondrial diseases pass from mother to all children." },
{ id:"bb58", section:"BB", topic:"Biochemistry", difficulty:"medium", dia:null,
  q:"Which vitamin-derived coenzyme is the major carrier of electrons that feeds the electron transport chain?",
  choices:["NAD⁺/NADH (from niacin, B3)","Vitamin C (ascorbate)","Biotin (B7)","Vitamin K"], answer:0,
  exp:["Correct. NAD⁺ is reduced to NADH in glycolysis and the Krebs cycle, then donates electrons at Complex I.",
    "Vitamin C is an antioxidant and cofactor for collagen hydroxylation, not an ETC carrier.",
    "Biotin is a carboxylation cofactor (e.g., pyruvate carboxylase).",
    "Vitamin K is needed for clotting-factor synthesis."],
  clinical:"Niacin (B3) deficiency causes pellagra: the '3 D's' — dermatitis, diarrhea, dementia." },
{ id:"bb59", section:"BB", topic:"Molecular biology", difficulty:"medium", dia:null,
  q:"During PCR, the step that separates the double-stranded DNA template is:",
  choices:["Denaturation (~95 °C)","Annealing (~55 °C)","Extension (~72 °C)","Ligation"], answer:0,
  exp:["Correct. High heat (~95 °C) denatures the DNA into single strands so primers can bind.",
    "Annealing at ~55 °C lets primers hybridize to the single strands.",
    "Extension at ~72 °C is when Taq polymerase synthesizes new strands.",
    "Ligation joins DNA fragments and isn't a PCR thermal step."],
  clinical:"PCR amplifies pathogen DNA/RNA for diagnostics, including qPCR viral-load testing." },
{ id:"bb60", section:"BB", topic:"Cell biology", difficulty:"foundation", dia:null,
  q:"A key structural difference between prokaryotic and eukaryotic cells is that prokaryotes lack:",
  choices:["A membrane-bound nucleus and membrane-bound organelles","Ribosomes","A cell membrane","DNA"], answer:0,
  exp:["Correct. Prokaryotes have no nucleus or membrane-bound organelles; their DNA sits in the nucleoid region.",
    "Prokaryotes DO have ribosomes (70S), just smaller than eukaryotic 80S.",
    "All cells have a plasma membrane.",
    "All cells contain DNA as genetic material."],
  clinical:"Antibiotics like aminoglycosides target the bacterial 70S ribosome, sparing human 80S ribosomes." },
{ id:"bb61", section:"BB", topic:"Endocrine", difficulty:"medium", dia:null,
  q:"Thyroid hormone (T3/T4) has which primary systemic effect?",
  choices:["Increases basal metabolic rate","Lowers blood calcium","Directly raises blood glucose as a second messenger","Triggers milk letdown"], answer:0,
  exp:["Correct. Thyroid hormone raises basal metabolic rate, heat production, and O2 consumption in most tissues.",
    "Calcitonin (from the thyroid's C-cells) lowers calcium — a different hormone.",
    "Thyroid hormone is a modified amino acid acting on nuclear receptors, not a glucose second messenger.",
    "Milk letdown is oxytocin's role."],
  clinical:"Hyperthyroidism (Graves') causes weight loss, heat intolerance, and tachycardia; hypothyroidism the reverse." },

/* ---------- CHEM / PHYSICS ---------- */
{ id:"cp24", section:"CP", topic:"Kinematics", difficulty:"foundation", dia:null,
  q:"An object dropped from rest falls for 3 s. Using g ≈ 10 m/s², its speed just before landing is:",
  choices:["30 m/s","10 m/s","300 m/s","3 m/s"], answer:0,
  exp:["Correct. v = gt = 10 × 3 = 30 m/s (starting from rest).",
    "10 m/s is the speed after only 1 s.",
    "300 m/s multiplies incorrectly (off by 10×).",
    "3 m/s confuses time with velocity."],
  clinical:"Ignoring air resistance, all masses accelerate at g — the basis of free-fall problems." },
{ id:"cp25", section:"CP", topic:"Newton's laws", difficulty:"foundation", dia:null,
  q:"A net force of 20 N acts on a 4 kg mass. Its acceleration is:",
  choices:["5 m/s²","80 m/s²","0.2 m/s²","24 m/s²"], answer:0,
  exp:["Correct. a = F/m = 20/4 = 5 m/s² (Newton's 2nd law).",
    "80 comes from multiplying F × m instead of dividing.",
    "0.2 inverts the ratio (m/F).",
    "24 adds the numbers, which is dimensionally invalid."],
  clinical:"F = ma underlies everything from vehicle crash forces to how muscles accelerate limbs." },
{ id:"cp26", section:"CP", topic:"Work & energy", difficulty:"medium", dia:null,
  q:"How much work does the centripetal force do on an object in uniform circular motion?",
  choices:["Zero — the force is perpendicular to the velocity","Positive and equal to the kinetic energy","Negative, slowing the object","It depends on the radius"], answer:0,
  exp:["Correct. Work = Fd·cosθ; the centripetal force is always perpendicular (θ = 90°, cos = 0), so it does zero work.",
    "No work is done, so it can't equal the kinetic energy.",
    "Speed is constant in uniform circular motion, so the force neither speeds up nor slows the object.",
    "Because the work is zero regardless, radius is irrelevant here."],
  clinical:"A satellite in circular orbit keeps constant speed because gravity does no net work on it." },
{ id:"cp27", section:"CP", topic:"Kinetic energy", difficulty:"medium", dia:null,
  q:"If a car's speed doubles, its kinetic energy:",
  choices:["Quadruples (×4)","Doubles (×2)","Stays the same","Halves"], answer:0,
  exp:["Correct. KE = ½mv²; since KE ∝ v², doubling v multiplies KE by 2² = 4.",
    "Doubling would be true only if KE were linear in v, which it isn't.",
    "KE clearly changes with speed.",
    "Halving is the opposite of the v² dependence."],
  clinical:"Braking distance rises with the square of speed — a core road-safety consequence of KE ∝ v²." },
{ id:"cp28", section:"CP", topic:"Circuits", difficulty:"foundation", dia:"circuit",
  q:"A 12 V battery drives current through a single 4 Ω resistor. The current is:",
  choices:["3 A","48 A","0.33 A","16 A"], answer:0,
  exp:["Correct. Ohm's law: I = V/R = 12/4 = 3 A.",
    "48 A multiplies V × R instead of dividing.",
    "0.33 A inverts the ratio (R/V).",
    "16 A adds the numbers, which is invalid."],
  clinical:"Ohm's law governs defibrillator and ECG circuit design and tissue-current safety limits." },
{ id:"cp29", section:"CP", topic:"Circuits", difficulty:"medium", dia:null,
  q:"Two identical 6 Ω resistors are connected in parallel. The equivalent resistance is:",
  choices:["3 Ω","12 Ω","6 Ω","36 Ω"], answer:0,
  exp:["Correct. For equal resistors in parallel, R_eq = R/n = 6/2 = 3 Ω (always less than the smallest).",
    "12 Ω would be the SERIES sum.",
    "6 Ω would require a single resistor, not two in parallel.",
    "36 Ω multiplies the resistances, which parallel rules don't do."],
  clinical:"Parallel wiring keeps household outlets at the same voltage even as more devices draw current." },
{ id:"cp30", section:"CP", topic:"Gas laws", difficulty:"foundation", dia:null,
  q:"At constant temperature, if the volume of an ideal gas is halved, its pressure:",
  choices:["Doubles","Halves","Is unchanged","Quadruples"], answer:0,
  exp:["Correct. Boyle's law: at constant T, P ∝ 1/V, so halving V doubles P.",
    "Halving pressure would require increasing volume, not decreasing it.",
    "Pressure changes with volume at fixed T.",
    "Quadrupling would need V reduced to one-fourth."],
  clinical:"Boyle's law explains how the lungs draw air in as the thoracic cavity (volume) expands." },
{ id:"cp31", section:"CP", topic:"Gas laws", difficulty:"medium", dia:null,
  q:"For a fixed amount of ideal gas at constant pressure, doubling the absolute temperature (K) will:",
  choices:["Double the volume","Halve the volume","Leave volume unchanged","Double the pressure instead"], answer:0,
  exp:["Correct. Charles's law: at constant P, V ∝ T (in kelvin), so doubling T doubles V.",
    "That's the inverse relationship, which applies to pressure, not this case.",
    "Volume depends on T at constant P.",
    "Pressure is held constant here, so it doesn't change."],
  clinical:"A hot-air balloon rises because heating expands the air (Charles's law), lowering its density." },
{ id:"cp32", section:"CP", topic:"Acids & bases", difficulty:"foundation", dia:null,
  q:"A solution has [H⁺] = 1 × 10⁻³ M. Its pH is:",
  choices:["3","11","−3","10⁻³"], answer:0,
  exp:["Correct. pH = −log[H⁺] = −log(10⁻³) = 3.",
    "11 would be the pOH, not the pH.",
    "pH is the negative log, giving +3, not −3.",
    "10⁻³ is the concentration itself, not its pH."],
  clinical:"Blood pH is tightly held near 7.4; a drop to 7.0 (acidosis) is life-threatening." },
{ id:"cp33", section:"CP", topic:"Acids & bases", difficulty:"medium", dia:"titration",
  q:"At the half-equivalence point of a weak-acid titration, the pH equals:",
  choices:["The pKa of the acid","The equivalence-point pH","7 always","The pKb of the acid"], answer:0,
  exp:["Correct. At half-equivalence [HA] = [A⁻], so Henderson–Hasselbalch gives pH = pKa (buffer region midpoint).",
    "The equivalence point is where all acid is neutralized — a different, higher pH for a weak acid.",
    "pH = 7 only for strong-acid/strong-base equivalence, not the half-equivalence of a weak acid.",
    "pKb refers to the conjugate base's behavior, not this relationship."],
  clinical:"This principle lets you read a drug's pKa directly off its titration curve." },
{ id:"cp34", section:"CP", topic:"Acids & bases", difficulty:"medium", dia:null,
  q:"An effective buffer is best made from:",
  choices:["A weak acid and its conjugate base in comparable amounts","A strong acid and a strong base","Pure water","A strong acid alone"], answer:0,
  exp:["Correct. A weak acid/conjugate base pair resists pH change by neutralizing added acid or base.",
    "Strong acid + strong base simply neutralize to salt and water — no buffering capacity.",
    "Pure water has essentially no buffering ability.",
    "A strong acid alone cannot buffer; it just lowers pH."],
  clinical:"The bicarbonate buffer (H2CO3/HCO3⁻) keeps blood pH stable despite metabolic acid production." },
{ id:"cp35", section:"CP", topic:"Electrochemistry", difficulty:"medium", dia:null,
  q:"In any electrochemical cell (galvanic or electrolytic), oxidation always occurs at the:",
  choices:["Anode","Cathode","Salt bridge","Neither electrode"], answer:0,
  exp:["Correct. By definition, oxidation happens at the anode and reduction at the cathode ('An Ox, Red Cat').",
    "The cathode is where reduction occurs.",
    "The salt bridge maintains charge balance; no half-reaction occurs there.",
    "One electrode is always the oxidation site — the anode."],
  clinical:"Corrosion (rusting) is electrochemical oxidation of iron at anodic surface regions." },
{ id:"cp36", section:"CP", topic:"Redox", difficulty:"foundation", dia:null,
  q:"In a redox reaction, the species that is oxidized:",
  choices:["Loses electrons and acts as the reducing agent","Gains electrons and acts as the oxidizing agent","Neither gains nor loses electrons","Always gains oxygen only"], answer:0,
  exp:["Correct. 'OIL RIG': Oxidation Is Loss of electrons; the oxidized species donates them, so it is the reducing agent.",
    "Gaining electrons is reduction; the oxidizing agent is the one reduced.",
    "Redox is defined by electron transfer, so change must occur.",
    "Oxidation is generalized to electron loss, not just gaining oxygen."],
  clinical:"Cellular respiration is a controlled redox cascade transferring electrons from glucose to O2." },
{ id:"cp37", section:"CP", topic:"Periodic trends", difficulty:"foundation", dia:null,
  q:"Electronegativity generally increases:",
  choices:["Up a group and left-to-right across a period (toward fluorine)","Down a group and right-to-left","Only down a group","Only to the left"], answer:0,
  exp:["Correct. Electronegativity rises toward the top-right of the table; fluorine is the most electronegative element.",
    "That direction describes decreasing electronegativity.",
    "Down a group it decreases, not increases.",
    "Toward the left (metals) electronegativity is lower."],
  clinical:"Electronegativity differences determine bond polarity, shaping how drugs interact with receptors." },
{ id:"cp38", section:"CP", topic:"Periodic trends", difficulty:"medium", dia:null,
  q:"Moving left-to-right across a period, atomic radius generally:",
  choices:["Decreases, due to increasing effective nuclear charge","Increases, due to added shells","Stays constant","Decreases only for metals"], answer:0,
  exp:["Correct. Across a period, protons are added to the same shell, pulling electrons in tighter — radius shrinks.",
    "New shells are added down a GROUP, not across a period.",
    "Radius clearly trends downward across a period.",
    "The contraction applies across the whole period, not only metals."],
  clinical:"Ionic size trends govern how ions fit selective channels like the K⁺ channel's filter." },
{ id:"cp39", section:"CP", topic:"Intermolecular forces", difficulty:"medium", dia:null,
  q:"Which intermolecular force is the strongest, giving water its unusually high boiling point?",
  choices:["Hydrogen bonding","London dispersion forces","Ordinary dipole–dipole (non-H)","Ion–induced dipole"], answer:0,
  exp:["Correct. Hydrogen bonds (H bonded to N, O, or F) are the strongest intermolecular force and dominate in water.",
    "London dispersion forces are the weakest, present in all molecules.",
    "Regular dipole–dipole forces are weaker than hydrogen bonds.",
    "Ion–induced dipole forces are situational and generally weaker than H-bonding here."],
  clinical:"Hydrogen bonding holds the DNA double helix together and defines protein secondary structure." },
{ id:"cp40", section:"CP", topic:"Thermodynamics", difficulty:"medium", dia:null,
  q:"For a spontaneous reaction at constant temperature and pressure, the Gibbs free energy change (ΔG) is:",
  choices:["Negative (ΔG < 0)","Positive (ΔG > 0)","Exactly zero","Always equal to ΔH"], answer:0,
  exp:["Correct. ΔG < 0 defines a thermodynamically spontaneous (exergonic) process.",
    "ΔG > 0 is nonspontaneous and requires energy input.",
    "ΔG = 0 means the system is at equilibrium.",
    "ΔG = ΔH − TΔS; it equals ΔH only if TΔS is zero."],
  clinical:"ATP hydrolysis has a large negative ΔG, and cells couple it to drive unfavorable reactions." },
{ id:"cp41", section:"CP", topic:"Thermochemistry", difficulty:"foundation", dia:null,
  q:"An exothermic reaction has an enthalpy change (ΔH) that is:",
  choices:["Negative — heat is released to the surroundings","Positive — heat is absorbed","Zero","Undefined"], answer:0,
  exp:["Correct. Exothermic reactions release heat, so the products are lower in enthalpy (ΔH < 0).",
    "Positive ΔH describes an endothermic reaction that absorbs heat.",
    "A zero ΔH means no net heat change.",
    "ΔH is well defined for chemical reactions."],
  clinical:"Instant cold packs use an ENDOthermic dissolution; hand warmers use EXOthermic reactions." },
{ id:"cp42", section:"CP", topic:"Thermochemistry", difficulty:"medium", dia:null,
  q:"How much heat is needed to raise 200 g of water by 10 °C? (c = 4.18 J/g·°C)",
  choices:["≈ 8,360 J","≈ 836 J","≈ 83,600 J","≈ 418 J"], answer:0,
  exp:["Correct. q = mcΔT = 200 × 4.18 × 10 ≈ 8,360 J.",
    "836 J omits a factor of 10 (used ΔT = 1).",
    "83,600 J overshoots by 10×.",
    "418 J uses only 10 g or a single degree, not the full values."],
  clinical:"Water's high specific heat lets the body buffer temperature swings and sweat-cool efficiently." },
{ id:"cp43", section:"CP", topic:"Entropy", difficulty:"medium", dia:null,
  q:"According to the second law of thermodynamics, which phase of a given substance has the highest entropy?",
  choices:["Gas","Liquid","Solid","All phases are equal"], answer:0,
  exp:["Correct. Gases have the most positional/molecular disorder, hence the highest entropy.",
    "Liquids are more ordered than gases (intermediate entropy).",
    "Solids have the lowest entropy — highly ordered lattices.",
    "Entropy differs markedly among phases."],
  clinical:"Protein folding decreases the protein's entropy but is driven by the entropy gain of released water." },
{ id:"cp44", section:"CP", topic:"Optics", difficulty:"medium", dia:"lens",
  q:"A real object is placed beyond 2F of a converging (convex) lens. The image formed is:",
  choices:["Real, inverted, and reduced","Virtual, upright, and enlarged","Real, upright, and the same size","Virtual, inverted, and reduced"], answer:0,
  exp:["Correct. Beyond 2F, a converging lens forms a real, inverted, diminished image between F and 2F on the far side.",
    "Virtual, upright, enlarged images occur when the object is INSIDE the focal length.",
    "Real images from a single converging lens are inverted, not upright.",
    "Virtual images from a converging lens are upright, not inverted."],
  clinical:"The eye's lens forms a real, inverted image on the retina; the brain reinterprets it upright." },
{ id:"cp45", section:"CP", topic:"Optics", difficulty:"medium", dia:null,
  q:"When light passes from air into a denser medium like glass, it:",
  choices:["Slows down and bends toward the normal","Speeds up and bends away from the normal","Slows down and bends away from the normal","Travels at the same speed, unbent"], answer:0,
  exp:["Correct. In a denser medium (higher n) light slows (n = c/v) and refracts toward the normal.",
    "Light entering a denser medium slows; it doesn't speed up.",
    "Bending is toward, not away from, the normal when entering a denser medium.",
    "Speed changes with the refractive index, causing refraction."],
  clinical:"Refractive-index mismatches let corrective lenses refocus light onto the retina in myopia/hyperopia." },
{ id:"cp46", section:"CP", topic:"Waves", difficulty:"medium", dia:null,
  q:"As a sound source moves toward a stationary observer, the observer hears a frequency that is:",
  choices:["Higher than emitted (waves compressed)","Lower than emitted","Unchanged","Zero"], answer:0,
  exp:["Correct. The Doppler effect: an approaching source compresses wavefronts, raising the observed frequency (pitch).",
    "A lower frequency is heard as the source moves AWAY.",
    "Relative motion changes the observed frequency.",
    "The wave still arrives; frequency shifts, it doesn't vanish."],
  clinical:"Doppler ultrasound measures blood-flow velocity and direction from frequency shifts." },
{ id:"cp47", section:"CP", topic:"Organic chemistry", difficulty:"foundation", dia:null,
  q:"A molecule containing a –COOH group is classified as a(n):",
  choices:["Carboxylic acid","Aldehyde","Ketone","Ester"], answer:0,
  exp:["Correct. The –COOH (carboxyl) group defines a carboxylic acid.",
    "An aldehyde has a terminal –CHO group.",
    "A ketone has a C=O flanked by two carbons.",
    "An ester (–COO–R) forms when a carboxylic acid reacts with an alcohol."],
  clinical:"Fatty acids and amino acids both carry carboxyl groups central to their chemistry." },
{ id:"cp48", section:"CP", topic:"Organic chemistry", difficulty:"hard", dia:"sn2",
  q:"An SN2 reaction is favored by:",
  choices:["A primary substrate, strong nucleophile, and aprotic solvent","A tertiary substrate and protic solvent","A weak nucleophile and bulky substrate","A carbocation intermediate"], answer:0,
  exp:["Correct. SN2 is a one-step backside attack; it needs steric access (primary), a strong nucleophile, and a polar aprotic solvent.",
    "Tertiary substrates and protic solvents favor SN1, not SN2.",
    "A weak nucleophile and steric bulk disfavor the concerted SN2 attack.",
    "SN2 has no carbocation intermediate — that's the SN1 mechanism."],
  clinical:"SN2 inversion of configuration (Walden inversion) matters in stereospecific drug synthesis." },
{ id:"cp49", section:"CP", topic:"Stereochemistry", difficulty:"medium", dia:"chirality",
  q:"Two molecules that are non-superimposable mirror images of each other are:",
  choices:["Enantiomers","Diastereomers","Structural (constitutional) isomers","Conformational isomers"], answer:0,
  exp:["Correct. Enantiomers are non-superimposable mirror images with opposite configuration at every stereocenter.",
    "Diastereomers are stereoisomers that are NOT mirror images.",
    "Constitutional isomers differ in connectivity, not just 3-D arrangement.",
    "Conformers interconvert by bond rotation and aren't distinct isomers."],
  clinical:"Thalidomide's two enantiomers differ drastically — one sedative, one teratogenic." },
{ id:"cp50", section:"CP", topic:"Spectroscopy", difficulty:"hard", dia:null,
  q:"In IR spectroscopy, a strong absorption near ~1700 cm⁻¹ most characteristically indicates a:",
  choices:["Carbonyl (C=O) group","Carbon–carbon single bond","Free ion in solution","Aromatic ring only"], answer:0,
  exp:["Correct. The C=O stretch produces a strong, diagnostic band around 1700 cm⁻¹.",
    "C–C single-bond stretches are weak and appear at lower frequencies.",
    "IR detects covalent-bond vibrations, not free ions per se.",
    "Aromatic C=C stretches appear near 1600 cm⁻¹ and are weaker/different from a carbonyl."],
  clinical:"A broad O–H (~3300 cm⁻¹) plus a C=O band signals a carboxylic acid — useful in metabolite ID." },
{ id:"cp51", section:"CP", topic:"Fluids", difficulty:"medium", dia:null,
  q:"By the continuity equation for an incompressible fluid, when a pipe narrows, the fluid's velocity:",
  choices:["Increases (A·v is constant)","Decreases","Stays the same","Drops to zero"], answer:0,
  exp:["Correct. A₁v₁ = A₂v₂, so a smaller cross-section forces a higher velocity.",
    "Velocity rises, not falls, in the constriction.",
    "Velocity must change to conserve volumetric flow.",
    "Flow continues; it speeds up rather than stopping."],
  clinical:"Arterial narrowing (stenosis) speeds blood flow locally, audible as a bruit." },
{ id:"cp52", section:"CP", topic:"Nuclear", difficulty:"medium", dia:null,
  q:"After one half-life, the amount of a radioactive isotope remaining is:",
  choices:["One-half of the original","One-quarter","Zero","Unchanged"], answer:0,
  exp:["Correct. By definition, a half-life is the time for half the sample to decay, leaving 50%.",
    "One-quarter remains after TWO half-lives.",
    "The isotope isn't fully gone after a single half-life.",
    "Radioactive decay steadily reduces the amount."],
  clinical:"Half-life sets dosing intervals for radiotracers and the timing of radioactive-decay dating." },
{ id:"cp53", section:"CP", topic:"Solutions", difficulty:"foundation", dia:null,
  q:"Adding a nonvolatile solute to a solvent will:",
  choices:["Raise the boiling point and lower the freezing point","Lower the boiling point and raise the freezing point","Raise both boiling and freezing points","Have no effect on either"], answer:0,
  exp:["Correct. Colligative effects: solute raises boiling point (elevation) and lowers freezing point (depression).",
    "This reverses both colligative trends.",
    "Freezing point is depressed, not raised.",
    "Colligative properties depend on solute particle number, so effects do occur."],
  clinical:"Road salt depresses water's freezing point; IV fluid osmolarity reflects the same colligative logic." },

/* ---------- PSYCH / SOC ---------- */
{ id:"ps19", section:"PS", topic:"Development", difficulty:"foundation", dia:null,
  q:"In Piaget's theory, object permanence — knowing objects exist when out of sight — develops during the:",
  choices:["Sensorimotor stage (0–2 years)","Preoperational stage (2–7)","Concrete operational stage (7–11)","Formal operational stage (11+)"], answer:0,
  exp:["Correct. Object permanence is the hallmark achievement of the sensorimotor stage.",
    "The preoperational stage features symbolic thought and egocentrism, after object permanence.",
    "Concrete operational adds conservation and logical operations on concrete objects.",
    "Formal operational brings abstract and hypothetical reasoning."],
  clinical:"Peek-a-boo delights infants precisely because object permanence is still developing." },
{ id:"ps20", section:"PS", topic:"Development", difficulty:"medium", dia:null,
  q:"A child who understands that pouring water into a taller glass doesn't change its amount has achieved:",
  choices:["Conservation (concrete operational stage)","Object permanence","Formal operational reasoning","Theory of mind"], answer:0,
  exp:["Correct. Conservation — invariance of quantity despite shape change — emerges in the concrete operational stage.",
    "Object permanence is an earlier sensorimotor milestone.",
    "Formal operational reasoning concerns abstract/hypothetical thought, not conservation.",
    "Theory of mind is understanding others' mental states — a different concept."],
  clinical:"Conservation tasks are classic clinical markers of a child's cognitive stage." },
{ id:"ps21", section:"PS", topic:"Development", difficulty:"medium", dia:null,
  q:"According to Erikson, the central psychosocial conflict of adolescence is:",
  choices:["Identity vs. role confusion","Trust vs. mistrust","Intimacy vs. isolation","Integrity vs. despair"], answer:0,
  exp:["Correct. Adolescents work to form a coherent identity; failure yields role confusion.",
    "Trust vs. mistrust is the infancy stage.",
    "Intimacy vs. isolation is the young-adulthood stage.",
    "Integrity vs. despair is the late-adulthood stage."],
  clinical:"Erikson's framework guides how clinicians view age-appropriate psychosocial struggles." },
{ id:"ps22", section:"PS", topic:"Psychoanalytic theory", difficulty:"medium", dia:null,
  q:"In Freud's structural model, the component that operates on the 'pleasure principle,' seeking immediate gratification, is the:",
  choices:["Id","Ego","Superego","Preconscious"], answer:0,
  exp:["Correct. The id is the primitive, unconscious drive system governed by the pleasure principle.",
    "The ego mediates via the reality principle, balancing id and superego.",
    "The superego embodies morality and the internalized ideal.",
    "The preconscious is a level of awareness, not a structural component."],
  clinical:"Freud's model, though not empirically testable, still shapes psychodynamic therapy vocabulary." },
{ id:"ps23", section:"PS", topic:"Learning", difficulty:"foundation", dia:null,
  q:"In Pavlov's classic experiment, after conditioning, the bell (previously neutral) becomes the:",
  choices:["Conditioned stimulus (CS)","Unconditioned stimulus (UCS)","Unconditioned response (UCR)","Conditioned response (CR)"], answer:0,
  exp:["Correct. The bell, once neutral, becomes the conditioned stimulus that elicits salivation after pairing.",
    "The UCS is the food, which naturally causes salivation.",
    "The UCR is the reflexive salivation to food.",
    "The CR is the learned salivation to the bell — a response, not the stimulus."],
  clinical:"Classical conditioning explains taste aversions and some phobia acquisition." },
{ id:"ps24", section:"PS", topic:"Learning", difficulty:"hard", dia:null,
  q:"Negative reinforcement (in operant conditioning) works by:",
  choices:["Removing an aversive stimulus to INCREASE a behavior","Adding an aversive stimulus to decrease a behavior","Removing a pleasant stimulus to decrease behavior","Adding a reward to increase behavior"], answer:0,
  exp:["Correct. Negative reinforcement takes away something unpleasant, which strengthens the preceding behavior.",
    "Adding an aversive stimulus to reduce behavior is positive PUNISHMENT.",
    "Removing a pleasant stimulus to reduce behavior is negative punishment.",
    "Adding a reward is positive reinforcement."],
  clinical:"Taking a painkiller (removing pain) negatively reinforces future pill-taking behavior." },
{ id:"ps25", section:"PS", topic:"Learning", difficulty:"hard", dia:null,
  q:"Which reinforcement schedule produces the highest, most extinction-resistant response rate?",
  choices:["Variable-ratio","Fixed-ratio","Fixed-interval","Variable-interval"], answer:0,
  exp:["Correct. Variable-ratio schedules (unpredictable number of responses per reward) drive rapid, persistent responding.",
    "Fixed-ratio produces high rates but a brief post-reinforcement pause.",
    "Fixed-interval yields a scalloped pattern of responding near the reward time.",
    "Variable-interval gives steady but generally lower response rates."],
  clinical:"Slot machines use variable-ratio reinforcement, which underlies their addictive pull." },
{ id:"ps26", section:"PS", topic:"Memory", difficulty:"medium", dia:null,
  q:"According to Miller, the capacity of short-term (working) memory is approximately:",
  choices:["7 ± 2 items, expandable by chunking","3 items maximum","Unlimited","1 item at a time"], answer:0,
  exp:["Correct. Miller's 'magic number' is about 7 ± 2 items, and chunking groups items to expand effective capacity.",
    "Capacity is larger than 3 for most people (though newer estimates are ~4 chunks).",
    "Short-term memory is sharply limited, not unlimited.",
    "We can hold several items simultaneously, not just one."],
  clinical:"Phone numbers are grouped (chunked) into segments to fit working-memory limits." },
{ id:"ps27", section:"PS", topic:"Memory", difficulty:"medium", dia:null,
  q:"Riding a bike or typing without thinking relies on which type of long-term memory?",
  choices:["Implicit (procedural) memory","Explicit episodic memory","Explicit semantic memory","Sensory memory"], answer:0,
  exp:["Correct. Procedural (implicit) memory stores skills and habits performed without conscious recall.",
    "Episodic memory is conscious recall of specific personal events.",
    "Semantic memory is conscious general knowledge and facts.",
    "Sensory memory is a brief, pre-attentive buffer, not skill storage."],
  clinical:"Amnesiac patients (e.g., H.M.) could learn new motor skills despite losing explicit memory." },
{ id:"ps28", section:"PS", topic:"Neurotransmitters", difficulty:"medium", dia:null,
  q:"Degeneration of dopamine-producing neurons in the substantia nigra characterizes:",
  choices:["Parkinson's disease","Alzheimer's disease","Major depressive disorder","Myasthenia gravis"], answer:0,
  exp:["Correct. Parkinson's involves loss of nigrostriatal dopamine neurons, causing tremor, rigidity, and bradykinesia.",
    "Alzheimer's is most linked to acetylcholine loss and amyloid/tau pathology.",
    "Depression is more associated with serotonin/norepinephrine dysregulation.",
    "Myasthenia gravis is an autoimmune attack on acetylcholine receptors at the neuromuscular junction."],
  clinical:"Levodopa boosts dopamine synthesis to relieve Parkinsonian motor symptoms." },
{ id:"ps29", section:"PS", topic:"Neurotransmitters", difficulty:"medium", dia:null,
  q:"Which neurotransmitter is most implicated in mood regulation and is the target of SSRIs?",
  choices:["Serotonin","Dopamine","Acetylcholine","Glutamate"], answer:0,
  exp:["Correct. Low serotonin activity is linked to depression; SSRIs block its reuptake to raise synaptic levels.",
    "Dopamine relates to reward and movement more than mood in this context.",
    "Acetylcholine is central to muscle activation and memory.",
    "Glutamate is the main excitatory transmitter, not the SSRI target."],
  clinical:"SSRIs (e.g., fluoxetine) are first-line pharmacotherapy for depression and anxiety." },
{ id:"ps30", section:"PS", topic:"Neuroanatomy", difficulty:"medium", dia:null,
  q:"The brain structure most critical for forming NEW long-term (explicit) memories is the:",
  choices:["Hippocampus","Amygdala","Cerebellum","Hypothalamus"], answer:0,
  exp:["Correct. The hippocampus consolidates new declarative memories for long-term storage.",
    "The amygdala processes fear and emotional salience of memories.",
    "The cerebellum coordinates movement and some procedural learning.",
    "The hypothalamus governs homeostasis, hunger, and hormones."],
  clinical:"Bilateral hippocampal damage (patient H.M.) caused profound anterograde amnesia." },
{ id:"ps31", section:"PS", topic:"Neuroanatomy", difficulty:"medium", dia:null,
  q:"Damage to Broca's area typically produces:",
  choices:["Nonfluent aphasia — effortful, halting speech with intact comprehension","Fluent speech with poor comprehension","Complete deafness","Loss of all memory"], answer:0,
  exp:["Correct. Broca's (frontal) aphasia impairs speech production while comprehension is relatively preserved.",
    "Fluent speech with poor comprehension is Wernicke's aphasia (temporal lobe).",
    "Broca's area governs language production, not hearing.",
    "Language areas are distinct from the memory systems."],
  clinical:"Broca's patients are often frustratingly aware of their speech difficulty, unlike Wernicke's patients." },
{ id:"ps32", section:"PS", topic:"Emotion", difficulty:"hard", dia:null,
  q:"The Schachter–Singer (two-factor) theory of emotion holds that emotion arises from:",
  choices:["Physiological arousal plus a cognitive label for that arousal","Physiological arousal alone, before any thought","Cognitive appraisal with no bodily component","Simultaneous but independent arousal and emotion"], answer:0,
  exp:["Correct. Two-factor theory: we experience arousal, then cognitively interpret its cause to label the emotion.",
    "Arousal-first-then-emotion without labeling describes James–Lange.",
    "Pure cognitive appraisal ignoring the body is closer to Lazarus's view.",
    "Simultaneous, independent arousal and emotion describe Cannon–Bard."],
  clinical:"Misattributed arousal (e.g., the shaky-bridge study) shows how labeling shapes felt emotion." },
{ id:"ps33", section:"PS", topic:"Social psychology", difficulty:"medium", dia:null,
  q:"Overattributing another person's behavior to their character while underweighting the situation is the:",
  choices:["Fundamental attribution error","Self-serving bias","Just-world hypothesis","Halo effect"], answer:0,
  exp:["Correct. The fundamental attribution error favors dispositional over situational explanations for others' behavior.",
    "Self-serving bias is crediting oneself for success and blaming the situation for failure.",
    "The just-world hypothesis is the belief that people get what they deserve.",
    "The halo effect is letting one positive trait color overall judgment."],
  clinical:"Awareness of this bias improves clinical empathy by prompting consideration of patients' circumstances." },
{ id:"ps34", section:"PS", topic:"Social psychology", difficulty:"medium", dia:null,
  q:"The discomfort felt when one's behavior conflicts with one's attitudes — often resolved by changing the attitude — is:",
  choices:["Cognitive dissonance","Groupthink","Social facilitation","Deindividuation"], answer:0,
  exp:["Correct. Cognitive dissonance is the tension from inconsistent cognitions, motivating attitude change.",
    "Groupthink is faulty group decision-making that suppresses dissent.",
    "Social facilitation is improved performance on easy tasks when observed.",
    "Deindividuation is loss of self-awareness in groups."],
  clinical:"Festinger's classic study: underpaid participants changed their attitude to reduce dissonance." },
{ id:"ps35", section:"PS", topic:"Social psychology", difficulty:"medium", dia:null,
  q:"Milgram's famous experiments primarily demonstrated the power of:",
  choices:["Obedience to authority","Conformity to peer groups","Bystander apathy","Cognitive dissonance"], answer:0,
  exp:["Correct. Milgram showed ordinary people would deliver apparently dangerous shocks when instructed by an authority.",
    "Conformity to peers was Asch's line-judgment paradigm, not Milgram's.",
    "Bystander apathy (diffusion of responsibility) traces to the Latané & Darley work.",
    "Cognitive dissonance is Festinger's domain."],
  clinical:"Milgram's findings reshaped research ethics and informed-consent requirements." },
{ id:"ps36", section:"PS", topic:"Sociology", difficulty:"medium", dia:null,
  q:"Émile Durkheim, a founder of sociology, is best associated with the concept of:",
  choices:["Anomie (normlessness) and social solidarity","Class conflict and surplus value","The Protestant work ethic","The looking-glass self"], answer:0,
  exp:["Correct. Durkheim studied social cohesion, the division of labor, and anomie in his analysis of suicide.",
    "Class conflict and surplus value are Karl Marx's ideas.",
    "The Protestant work ethic is Max Weber's thesis.",
    "The looking-glass self is Charles Cooley's symbolic-interactionist concept."],
  clinical:"Durkheim's work grounds public-health views of social integration as protective against suicide." },
{ id:"ps37", section:"PS", topic:"Sociology", difficulty:"medium", dia:null,
  q:"Which sociological paradigm focuses on small-scale, face-to-face symbols and meanings in everyday interaction?",
  choices:["Symbolic interactionism","Functionalism","Conflict theory","Structural determinism"], answer:0,
  exp:["Correct. Symbolic interactionism is a micro-level perspective on shared symbols and meaning-making.",
    "Functionalism is a macro view of how institutions maintain social stability.",
    "Conflict theory is a macro view emphasizing power and inequality.",
    "'Structural determinism' is not one of the three major paradigms."],
  clinical:"An interactionist lens illuminates how doctor–patient communication shapes health behavior." },
{ id:"ps38", section:"PS", topic:"Sensation", difficulty:"medium", dia:null,
  q:"Weber's law states that the just-noticeable difference (JND) between two stimuli is:",
  choices:["A constant proportion of the original stimulus intensity","A fixed absolute amount regardless of intensity","Independent of the stimulus","Always exactly 10 units"], answer:0,
  exp:["Correct. The JND is a constant fraction (Weber fraction) of the baseline stimulus, not a fixed absolute value.",
    "A fixed absolute difference contradicts Weber's proportional law.",
    "The JND depends directly on the original stimulus magnitude.",
    "There is no universal fixed JND value across all senses."],
  clinical:"Weber's law explains why a small price rise is noticed on cheap items but not on expensive ones." },
{ id:"ps39", section:"PS", topic:"Sensation", difficulty:"foundation", dia:null,
  q:"In the retina, the photoreceptors responsible for color vision and high acuity in bright light are the:",
  choices:["Cones","Rods","Bipolar cells","Ganglion cells"], answer:0,
  exp:["Correct. Cones detect color and provide sharp vision in daylight; they cluster in the fovea.",
    "Rods handle dim-light and peripheral vision but not color.",
    "Bipolar cells relay signals; they aren't photoreceptors.",
    "Ganglion cells form the optic nerve output; they aren't the light detectors."],
  clinical:"Color blindness usually results from missing or defective cone photopigments (often X-linked)." },
{ id:"ps40", section:"PS", topic:"Stress", difficulty:"medium", dia:"yerkesDodson",
  q:"Selye's General Adaptation Syndrome describes the body's response to prolonged stress in the order:",
  choices:["Alarm → resistance → exhaustion","Resistance → alarm → exhaustion","Exhaustion → alarm → resistance","Alarm → exhaustion → recovery"], answer:0,
  exp:["Correct. GAS proceeds alarm (fight-or-flight), resistance (sustained coping), then exhaustion (depleted reserves).",
    "Alarm comes first, not resistance.",
    "Exhaustion is the final, not initial, stage.",
    "Exhaustion follows resistance; recovery isn't one of Selye's three defined stages."],
  clinical:"Chronic stress reaching the exhaustion stage raises risk for hypertension, immunosuppression, and illness." },
];
BANK.push(...NEW_BANK);

/* ---------------------------------------------------------------------------- 
   4d. HIGH-YIELD BATCH 2 — weak-topic reinforcement (fact-checked). 
---------------------------------------------------------------------------- */
const NEW_BANK2 = [
/* BIO/BIOCHEM */
{ id:"bb62", section:"BB", topic:"Enzyme classes", difficulty:"medium", dia:null,
  q:"An enzyme classified as an oxidoreductase catalyzes reactions involving:",
  choices:["Transfer of electrons (oxidation–reduction)","Transfer of a phosphate group","Hydrolysis of a bond","Rearrangement into an isomer"], answer:0,
  exp:["Correct. Oxidoreductases (e.g., dehydrogenases, oxidases) catalyze electron-transfer redox reactions.","Phosphate transfer from ATP is a kinase (transferase) function.","Hydrolysis defines hydrolases.","Isomerization defines isomerases."],
  clinical:"Lactate dehydrogenase, an oxidoreductase, is a clinical marker of tissue damage." },
{ id:"bb63", section:"BB", topic:"Enzyme kinetics", difficulty:"hard", dia:"michaelis",
  q:"On a Lineweaver–Burk (double-reciprocal) plot, the y-intercept equals:",
  choices:["1/Vmax","−1/Km","Km/Vmax","Vmax"], answer:0,
  exp:["Correct. The double-reciprocal plot gives y-intercept 1/Vmax and x-intercept −1/Km.","−1/Km is the x-intercept, not the y-intercept.","Km/Vmax is the slope of the line.","Vmax itself is not read directly; its reciprocal is the y-intercept."],
  clinical:"Lineweaver–Burk plots let you distinguish competitive (same y-intercept) from noncompetitive (same x-intercept) inhibition." },
{ id:"bb64", section:"BB", topic:"Gluconeogenesis", difficulty:"medium", dia:null,
  q:"Gluconeogenesis, the synthesis of glucose from non-carbohydrate precursors, occurs primarily in the:",
  choices:["Liver","Skeletal muscle","Adipose tissue","Red blood cells"], answer:0,
  exp:["Correct. The liver (and to a lesser extent the kidney) performs gluconeogenesis to maintain blood glucose during fasting.","Skeletal muscle lacks glucose-6-phosphatase and cannot release free glucose.","Adipose tissue stores fat and does not make glucose.","RBCs rely entirely on glycolysis and cannot do gluconeogenesis."],
  clinical:"During prolonged fasting, hepatic gluconeogenesis keeps the brain and RBCs supplied with glucose." },
{ id:"bb65", section:"BB", topic:"Fatty acid oxidation", difficulty:"medium", dia:null,
  q:"Beta-oxidation of fatty acids occurs in the mitochondrial matrix and directly produces:",
  choices:["Acetyl-CoA, NADH, and FADH2","Glucose and lactate","Only ATP by substrate-level phosphorylation","Ketone bodies in muscle"], answer:0,
  exp:["Correct. Each round of β-oxidation shortens the chain by two carbons, yielding acetyl-CoA plus NADH and FADH2.","β-oxidation degrades fat; it does not synthesize glucose.","Its energy comes mainly from feeding NADH/FADH2 to the ETC, not direct substrate-level ATP.","Ketone bodies are made in the liver, not muscle."],
  clinical:"Carnitine shuttle defects block fatty-acid entry into mitochondria, causing hypoketotic hypoglycemia." },
{ id:"bb66", section:"BB", topic:"Ketone bodies", difficulty:"medium", dia:null,
  q:"Ketone bodies are synthesized primarily in the liver during prolonged fasting from:",
  choices:["Excess acetyl-CoA","Glucose directly","Amino acid side chains only","Free fatty acids without processing"], answer:0,
  exp:["Correct. When acetyl-CoA accumulates faster than the Krebs cycle can use it, the liver condenses it into ketone bodies.","Glucose is scarce during fasting; ketogenesis is an alternative fuel pathway.","Ketogenic amino acids contribute acetyl-CoA, but the direct precursor is acetyl-CoA itself.","Fatty acids must first be β-oxidized to acetyl-CoA before ketogenesis."],
  clinical:"In diabetic ketoacidosis, unchecked ketogenesis dangerously lowers blood pH." },
{ id:"bb67", section:"BB", topic:"Urea cycle", difficulty:"hard", dia:null,
  q:"The primary physiological purpose of the urea cycle is to:",
  choices:["Convert toxic ammonia into excretable urea","Generate ATP for the liver","Synthesize new amino acids","Store nitrogen for later use"], answer:0,
  exp:["Correct. The liver's urea cycle detoxifies ammonia (from amino acid breakdown) into urea for renal excretion.","The urea cycle consumes ATP; it is not a net energy producer.","It disposes of nitrogen rather than building amino acids.","Its role is elimination, not storage, of nitrogen."],
  clinical:"Urea cycle enzyme deficiencies cause hyperammonemia with neurologic toxicity." },
{ id:"bb68", section:"BB", topic:"Pentose phosphate pathway", difficulty:"hard", dia:null,
  q:"The pentose phosphate pathway is a key source of which two products?",
  choices:["NADPH and ribose-5-phosphate","ATP and NADH","FADH2 and pyruvate","Urea and glucose"], answer:0,
  exp:["Correct. The PPP generates NADPH (for biosynthesis/antioxidant defense) and ribose-5-phosphate (for nucleotides).","The PPP does not directly make ATP or NADH.","FADH2 and pyruvate come from other pathways.","Urea and glucose are unrelated to the PPP's outputs."],
  clinical:"G6PD deficiency limits NADPH, leaving red cells vulnerable to oxidative hemolysis." },
{ id:"bb69", section:"BB", topic:"Electron transport chain", difficulty:"medium", dia:null,
  q:"In the electron transport chain, NADH donates its electrons at:",
  choices:["Complex I","Complex II","Complex IV","ATP synthase"], answer:0,
  exp:["Correct. NADH enters at Complex I (NADH dehydrogenase); FADH2 enters at Complex II.","Complex II is where FADH2 (via succinate) donates electrons.","Complex IV passes electrons to O2, the terminal acceptor.","ATP synthase uses the proton gradient to make ATP; it is not an electron entry point."],
  clinical:"Rotenone blocks Complex I, halting NADH-driven electron flow and ATP synthesis." },
{ id:"bb70", section:"BB", topic:"Enzyme regulation", difficulty:"medium", dia:"feedback",
  q:"Allosteric regulation of an enzyme involves a molecule binding:",
  choices:["A site other than the active site, changing enzyme conformation","Covalently to the substrate","The active site as a permanent inhibitor","Only when the enzyme is denatured"], answer:0,
  exp:["Correct. Allosteric effectors bind a regulatory site, shifting the enzyme between more- and less-active conformations.","Allosteric regulation is non-covalent and does not modify the substrate.","Binding the active site describes competitive inhibition, not allostery.","Allosteric control operates on folded, functional enzymes."],
  clinical:"ATP allosterically inhibits phosphofructokinase-1, matching glycolysis to energy demand." },
{ id:"bb71", section:"BB", topic:"Zymogens", difficulty:"medium", dia:null,
  q:"A zymogen (proenzyme) such as trypsinogen is activated by:",
  choices:["Proteolytic cleavage of part of the polypeptide","Phosphorylation by a kinase","Binding of a coenzyme","A drop in temperature"], answer:0,
  exp:["Correct. Zymogens are activated irreversibly when a specific peptide segment is cleaved off (trypsinogen → trypsin).","Phosphorylation regulates many enzymes but is not how zymogens are activated.","Coenzyme binding assists catalysis but does not convert a zymogen.","Temperature changes denature, not specifically activate, zymogens."],
  clinical:"Premature trypsinogen activation within the pancreas causes autodigestion — acute pancreatitis." },
{ id:"bb72", section:"BB", topic:"Vitamins", difficulty:"foundation", dia:null,
  q:"Which set lists the fat-soluble vitamins?",
  choices:["A, D, E, K","B1, B2, B6, B12","C and folate","Niacin and biotin"], answer:0,
  exp:["Correct. Vitamins A, D, E, and K are fat-soluble and stored in body fat/liver.","The B vitamins are water-soluble.","Vitamin C and folate are water-soluble.","Niacin (B3) and biotin (B7) are water-soluble B vitamins."],
  clinical:"Fat-soluble vitamins can accumulate to toxic levels (e.g., vitamin A toxicity), unlike most water-soluble ones." },
{ id:"bb73", section:"BB", topic:"Fermentation", difficulty:"medium", dia:null,
  q:"The primary purpose of lactic acid fermentation in human muscle is to:",
  choices:["Regenerate NAD⁺ so glycolysis can continue","Produce large amounts of ATP directly","Synthesize glucose from lactate","Consume oxygen faster"], answer:0,
  exp:["Correct. Reducing pyruvate to lactate reoxidizes NADH to NAD⁺, allowing glycolysis (and its 2 ATP) to keep running anaerobically.","Fermentation itself yields no ATP beyond glycolysis's net 2.","Making glucose from lactate is gluconeogenesis (the Cori cycle), which occurs in the liver.","Fermentation is anaerobic and does not consume oxygen."],
  clinical:"Lactate builds up during intense exercise and is later recycled to glucose in the liver (Cori cycle)." },
/* CHEM/PHYSICS */
{ id:"cp54", section:"CP", topic:"Torque", difficulty:"medium", dia:null,
  q:"The torque produced by a force about a pivot is greatest when the force is applied:",
  choices:["Perpendicular to the lever arm","Parallel to the lever arm","At the pivot point","In line with the axis of rotation"], answer:0,
  exp:["Correct. τ = rF sinθ is maximal at θ = 90° (perpendicular).","A parallel force (θ = 0°) produces zero torque.","Force at the pivot has r = 0 and thus no torque.","A force along the axis produces no rotational effect."],
  clinical:"Doorknobs are placed far from the hinge so a perpendicular push maximizes torque." },
{ id:"cp55", section:"CP", topic:"Impulse & momentum", difficulty:"medium", dia:null,
  q:"The impulse delivered to an object equals its change in:",
  choices:["Momentum","Kinetic energy","Velocity, regardless of mass","Acceleration"], answer:0,
  exp:["Correct. Impulse = FΔt = Δp, the change in momentum.","Work, not impulse, relates to change in kinetic energy.","Impulse changes momentum (mass × velocity), not velocity alone.","Impulse is not defined as a change in acceleration."],
  clinical:"Airbags extend collision time, lowering the force for the same impulse and reducing injury." },
{ id:"cp56", section:"CP", topic:"Buoyancy", difficulty:"medium", dia:null,
  q:"By Archimedes' principle, the buoyant force on a submerged object equals the:",
  choices:["Weight of the fluid it displaces","Weight of the object itself","Object's volume times gravity","Pressure at the surface"], answer:0,
  exp:["Correct. Buoyant force = weight of displaced fluid = ρ_fluid · V_displaced · g.","The object's own weight determines whether it sinks or floats, not the buoyant force itself.","Volume × gravity omits the fluid's density.","Surface pressure is unrelated to the buoyant force."],
  clinical:"Body-fat percentage can be estimated by hydrostatic (underwater) weighing using buoyancy." },
{ id:"cp57", section:"CP", topic:"Fluid pressure", difficulty:"foundation", dia:null,
  q:"The gauge pressure in a static fluid at depth h is given by P = ρgh, which means pressure:",
  choices:["Increases linearly with depth","Depends on the container's shape","Decreases with fluid density","Is the same at all depths"], answer:0,
  exp:["Correct. Pressure rises in direct proportion to depth (and to fluid density).","Static pressure depends on depth, not container shape (hydrostatic paradox).","Denser fluids produce greater pressure at a given depth.","Pressure clearly varies with depth."],
  clinical:"Blood pressure is higher in the feet than the head when standing, by the same ρgh relationship." },
{ id:"cp58", section:"CP", topic:"Bernoulli", difficulty:"hard", dia:null,
  q:"By Bernoulli's principle, where an ideal fluid flows faster, its pressure is:",
  choices:["Lower","Higher","Unchanged","Zero"], answer:0,
  exp:["Correct. Faster flow corresponds to lower pressure (energy is conserved among pressure, kinetic, and potential terms).","Higher pressure accompanies slower, not faster, flow.","Pressure changes as speed changes along a streamline.","Pressure decreases but does not reach zero."],
  clinical:"Arterial plaques narrow vessels, speeding flow and lowering local pressure, which can collapse the vessel." },
{ id:"cp59", section:"CP", topic:"Simple harmonic motion", difficulty:"medium", dia:null,
  q:"For a simple pendulum swinging at small angles, the period depends on:",
  choices:["Length and gravitational acceleration","The mass of the bob","The amplitude of the swing","The bob's material"], answer:0,
  exp:["Correct. T = 2π√(L/g); period depends only on length and g at small angles.","Mass cancels out of the pendulum period.","At small amplitudes the period is independent of amplitude (isochronism).","Material is irrelevant; only length and g matter."],
  clinical:"Pendulum clocks run slightly differently at high altitude because g changes with location." },
{ id:"cp60", section:"CP", topic:"Optics", difficulty:"medium", dia:null,
  q:"The power of a lens in diopters is defined as:",
  choices:["The reciprocal of the focal length in meters","The focal length in centimeters","The magnification produced","The lens diameter"], answer:0,
  exp:["Correct. Power (D) = 1/f (meters); a converging lens has positive power, a diverging lens negative.","Diopters use meters, and power is the reciprocal of focal length, not focal length itself.","Magnification is a separate quantity from lens power.","Diameter (aperture) does not define power."],
  clinical:"Eyeglass prescriptions are written in diopters; a stronger lens has a shorter focal length." },
{ id:"cp61", section:"CP", topic:"Electrostatics", difficulty:"medium", dia:null,
  q:"By Coulomb's law, if the distance between two charges is doubled, the electrostatic force becomes:",
  choices:["One-quarter as large","Half as large","Twice as large","Four times as large"], answer:0,
  exp:["Correct. Force ∝ 1/r²; doubling r multiplies the force by 1/2² = 1/4.","Halving would occur only if force were ∝ 1/r.","The force decreases, not increases, with distance.","Four times larger would require the charges to move closer by half."],
  clinical:"The inverse-square law also governs radiation dose, which drops sharply with distance from a source." },
{ id:"cp62", section:"CP", topic:"Capacitors", difficulty:"hard", dia:null,
  q:"The energy stored in a charged capacitor is given by:",
  choices:["½CV²","CV","C/V","½C²V"], answer:0,
  exp:["Correct. U = ½CV² (equivalently ½QV or Q²/2C).","CV gives the charge Q, not the stored energy.","C/V is dimensionally not an energy.","½C²V is not a valid energy expression."],
  clinical:"A defibrillator stores energy in a capacitor and releases it as a controlled shock to the heart." },
{ id:"cp63", section:"CP", topic:"Chemical equilibrium", difficulty:"medium", dia:null,
  q:"By Le Chatelier's principle, adding more reactant to a system at equilibrium will shift it:",
  choices:["Toward the products","Toward the reactants","Not at all","Toward whichever side has fewer moles"], answer:0,
  exp:["Correct. The system consumes the added reactant, shifting the equilibrium toward products.","Shifting toward reactants would worsen the imposed stress.","A concentration change does perturb the equilibrium position.","Mole count matters for pressure changes on gases, not for adding a reactant."],
  clinical:"In the blood, rising CO2 shifts the bicarbonate equilibrium, lowering pH (respiratory acidosis)." },
{ id:"cp64", section:"CP", topic:"Kinetics", difficulty:"medium", dia:null,
  q:"A catalyst increases reaction rate by:",
  choices:["Lowering the activation energy","Raising the equilibrium constant","Increasing the enthalpy of reaction","Being consumed in the reaction"], answer:0,
  exp:["Correct. A catalyst provides a lower-energy pathway, speeding both forward and reverse rates without being used up.","A catalyst does not change the equilibrium constant or final position.","It leaves ΔH (and ΔG) of the reaction unchanged.","Catalysts are regenerated, not consumed."],
  clinical:"Enzymes are biological catalysts that lower activation energy so metabolism runs at body temperature." },
{ id:"cp65", section:"CP", topic:"Molecular geometry", difficulty:"medium", dia:null,
  q:"By VSEPR theory, a central atom with four bonding pairs and no lone pairs has which geometry?",
  choices:["Tetrahedral (~109.5°)","Trigonal planar (120°)","Bent (~104.5°)","Linear (180°)"], answer:0,
  exp:["Correct. Four electron domains with no lone pairs arrange tetrahedrally at ~109.5° (e.g., CH4).","Trigonal planar corresponds to three bonding domains.","Bent geometry arises when lone pairs compress the angle (e.g., water).","Linear geometry corresponds to two electron domains."],
  clinical:"The tetrahedral geometry of carbon underlies the 3-D shape of nearly every biomolecule." },
/* PSYCH/SOC */
{ id:"ps41", section:"PS", topic:"Heuristics", difficulty:"medium", dia:null,
  q:"Judging an event as more likely because vivid examples come easily to mind reflects the:",
  choices:["Availability heuristic","Representativeness heuristic","Anchoring bias","Confirmation bias"], answer:0,
  exp:["Correct. The availability heuristic estimates probability by how easily instances are recalled.","Representativeness judges likelihood by resemblance to a prototype, not ease of recall.","Anchoring is over-reliance on an initial reference value.","Confirmation bias is seeking evidence that supports existing beliefs."],
  clinical:"People overestimate rare, dramatic risks (plane crashes) because such events are highly memorable." },
{ id:"ps42", section:"PS", topic:"Heuristics", difficulty:"hard", dia:null,
  q:"Assuming a quiet, bookish person is 'probably a librarian' while ignoring how few librarians exist reflects the:",
  choices:["Representativeness heuristic (base-rate neglect)","Availability heuristic","Framing effect","Self-serving bias"], answer:0,
  exp:["Correct. Representativeness judges category membership by fit to a stereotype, neglecting base rates.","The availability heuristic is about ease of recall, not stereotype fit.","Framing concerns how options are worded.","Self-serving bias attributes one's own successes internally and failures externally."],
  clinical:"Base-rate neglect can distort clinical judgment when a rare diagnosis 'fits the picture.'" },
{ id:"ps43", section:"PS", topic:"Attitudes & persuasion", difficulty:"hard", dia:null,
  q:"In the elaboration likelihood model, persuasion via the 'central route' depends on:",
  choices:["Careful evaluation of the argument's content","Superficial cues like attractiveness","Repetition without thought","The mood of the audience only"], answer:0,
  exp:["Correct. The central route persuades through thoughtful scrutiny of strong arguments, producing durable attitude change.","Attractiveness and other surface cues characterize the peripheral route.","Mere repetition is a peripheral cue.","Relying only on mood reflects peripheral, not central, processing."],
  clinical:"Health campaigns aiming for lasting behavior change target central-route processing with substantive evidence." },
{ id:"ps44", section:"PS", topic:"Memory", difficulty:"medium", dia:null,
  q:"When newly learned information makes it harder to recall previously learned material, this is:",
  choices:["Retroactive interference","Proactive interference","Source amnesia","The spacing effect"], answer:0,
  exp:["Correct. Retroactive interference: new learning disrupts old memories.","Proactive interference is the reverse — old memories disrupt new learning.","Source amnesia is forgetting where information was learned.","The spacing effect is improved retention from distributed practice."],
  clinical:"Studying similar subjects back-to-back can cause interference; spacing and varying topics reduces it." },
{ id:"ps45", section:"PS", topic:"Memory retrieval", difficulty:"medium", dia:null,
  q:"Which retrieval situation is typically easiest, because the answer is present to be identified?",
  choices:["Recognition","Free recall","Cued recall of a list","Relearning"], answer:0,
  exp:["Correct. Recognition (e.g., multiple choice) only requires identifying the correct item among options.","Free recall, with no cues, is the most demanding.","Cued recall is easier than free recall but harder than recognition.","Relearning measures savings over time, not immediate ease."],
  clinical:"A witness may fail free recall yet succeed at recognizing a face in a lineup." },
{ id:"ps46", section:"PS", topic:"Sensation", difficulty:"foundation", dia:null,
  q:"The absolute threshold of a sensory system is the:",
  choices:["Minimum stimulus intensity detectable 50% of the time","Smallest detectable difference between two stimuli","Point at which a receptor stops responding","Maximum stimulus a receptor can register"], answer:0,
  exp:["Correct. Absolute threshold is the least intensity detected 50% of the time.","The smallest detectable difference is the just-noticeable difference (difference threshold).","Reduced response to a constant stimulus is sensory adaptation.","Sensory systems don't have a defined single 'maximum' threshold like this."],
  clinical:"Hearing tests find a patient's absolute threshold across frequencies to build an audiogram." },
{ id:"ps47", section:"PS", topic:"Social psychology", difficulty:"medium", dia:null,
  q:"The tendency to view members of one's own group as varied individuals but out-group members as 'all alike' is:",
  choices:["Out-group homogeneity bias","The just-world hypothesis","Social loafing","Deindividuation"], answer:0,
  exp:["Correct. Out-group homogeneity bias is perceiving less diversity among out-group than in-group members.","The just-world hypothesis is believing people get what they deserve.","Social loafing is reduced individual effort in groups.","Deindividuation is loss of self-awareness in a crowd."],
  clinical:"This bias contributes to stereotyping and can distort cross-cultural clinical interactions." },
{ id:"ps48", section:"PS", topic:"Socialization", difficulty:"foundation", dia:null,
  q:"Which is considered a primary agent of socialization in early childhood?",
  choices:["The family","The workplace","Mass political institutions","Professional associations"], answer:0,
  exp:["Correct. The family is the earliest and most influential agent of socialization for young children.","The workplace is a later, secondary agent.","Large political institutions socialize indirectly and later in life.","Professional associations affect adults in specific careers."],
  clinical:"Early family socialization strongly shapes lifelong health behaviors and beliefs." },
{ id:"ps49", section:"PS", topic:"Development", difficulty:"medium", dia:null,
  q:"Vygotsky's 'zone of proximal development' refers to tasks a learner can accomplish:",
  choices:["With guidance but not yet independently","Only in complete isolation","That are already fully mastered","That are permanently beyond reach"], answer:0,
  exp:["Correct. The ZPD is the gap between what a learner can do alone and what they can do with skilled help (scaffolding).","Vygotsky emphasized social interaction, not isolation.","Already-mastered tasks fall below the ZPD.","Permanently unreachable tasks lie above the ZPD."],
  clinical:"Effective teaching and rehabilitation pitch challenges within the learner's zone of proximal development." },
{ id:"ps50", section:"PS", topic:"Sleep", difficulty:"hard", dia:null,
  q:"Which EEG feature is characteristic of deep, slow-wave (N3) sleep?",
  choices:["High-amplitude delta waves","Sleep spindles and K-complexes","Low-amplitude beta waves","Alpha waves"], answer:0,
  exp:["Correct. Stage N3 (slow-wave sleep) is marked by large, slow delta waves.","Sleep spindles and K-complexes define stage N2.","Beta waves appear during alert wakefulness and REM.","Alpha waves occur in relaxed wakefulness with eyes closed."],
  clinical:"Slow-wave sleep is when growth hormone peaks and physical restoration is greatest." },
{ id:"ps51", section:"PS", topic:"Intelligence", difficulty:"medium", dia:null,
  q:"Crystallized intelligence, as distinguished from fluid intelligence, refers to:",
  choices:["Accumulated knowledge and skills from experience","The ability to solve novel problems quickly","Raw processing speed independent of learning","Sensory acuity"], answer:0,
  exp:["Correct. Crystallized intelligence is acquired knowledge/vocabulary that tends to grow with age.","Solving novel problems is fluid intelligence.","Processing speed is a component of fluid ability, which declines earlier.","Sensory acuity is perception, not an intelligence construct."],
  clinical:"In healthy aging, crystallized intelligence is preserved while fluid intelligence declines gradually." },
{ id:"ps52", section:"PS", topic:"Sociology", difficulty:"medium", dia:null,
  q:"A social system in which a person's status is fixed at birth with essentially no mobility is called a:",
  choices:["Caste system","Class system","Meritocracy","Achieved-status society"], answer:0,
  exp:["Correct. Caste systems assign rigid, ascribed status at birth with little or no mobility.","Class systems allow some social mobility based on a mix of ascribed and achieved factors.","A meritocracy rewards individual achievement and ability.","Achieved status is earned, the opposite of a caste's ascribed status."],
  clinical:"Rigid stratification limits access to healthcare and education, driving health disparities." },
];
BANK.push(...NEW_BANK2);

/* ----------------------------------------------------------------------------
   4e. ORGANIC CHEM (OC) + DEVELOPMENT (DV) — with baby-mode ELI5 explanations.
   Every card carries a `baby` field so FlashcardMode / QuizMode can render
   an "Explain like I'm 5" block right under the clinical anchor.
---------------------------------------------------------------------------- */
const NEW_BANK3 = [
/* ============================ ORGANIC CHEM (OC) ============================ */
{ id:"oc1", section:"OC", topic:"SN2", difficulty:"foundation", dia:null,
  q:"Which substrate reacts FASTEST in an SN2 reaction with hydroxide?",
  choices:["1-bromobutane (primary)","2-bromobutane (secondary)","2-bromo-2-methylpropane (tertiary)","Neopentyl bromide"], answer:0,
  exp:[
    "Correct. SN2 is a one-step backside attack. Less steric bulk around the carbon = faster. Primary alkyl halides are ideal.",
    "Secondary substrates react but slower; steric hindrance grows.",
    "Tertiary substrates essentially don't do SN2 — no room for backside attack. They favor SN1/E1.",
    "Neopentyl is primary but has a bulky t-butyl neighbor blocking the backside — famously slow at SN2."],
  clinical:"Drug design: alkylating chemotherapy agents (e.g., cyclophosphamide metabolites) use SN2-like backside attack on DNA guanine N7.",
  baby:"SN2 is like sneaking up behind someone and pushing them out of a chair from the back. If the person has huge shoulder pads (bulky groups), you can't get behind them. So the smallest, least-crowded carbon wins." },

{ id:"oc2", section:"OC", topic:"SN1", difficulty:"medium", dia:null,
  q:"An SN1 reaction on (R)-3-bromo-3-methylhexane produces:",
  choices:["A racemic mixture of R and S alcohols","Only the R alcohol (retention)","Only the S alcohol (inversion)","No product forms"], answer:0,
  exp:[
    "Correct. SN1 goes through a planar carbocation intermediate. The nucleophile can attack from either face, so you get roughly 50/50 R and S — racemization.",
    "Retention would require the stereocenter to be preserved, which the flat carbocation destroys.",
    "Pure inversion is SN2's signature (Walden inversion), not SN1.",
    "Tertiary substrates readily form stable carbocations — SN1 proceeds well."],
  clinical:"Racemization matters in pharmacology because enantiomers can have wildly different effects (e.g., (S)-thalidomide's teratogenicity vs (R)-thalidomide's sedative action).",
  baby:"SN1 flattens the carbon into a pancake for a moment, then the water can flip a coin and attack from top or bottom. Half the time you get one hand, half the time the other. That's racemization." },

{ id:"oc3", section:"OC", topic:"SN1 vs SN2", difficulty:"medium", dia:null,
  q:"Which solvent BEST accelerates an SN2 reaction?",
  choices:["DMSO (polar aprotic)","Water (polar protic)","Methanol (polar protic)","Ethanol (polar protic)"], answer:0,
  exp:[
    "Correct. Polar aprotic solvents (DMSO, DMF, acetone, acetonitrile) solvate cations but leave the nucleophile 'naked' and reactive — great for SN2.",
    "Water H-bonds to the nucleophile, caging it and slowing SN2. But it stabilizes carbocations, so it favors SN1.",
    "Methanol is protic — same problem as water.",
    "Ethanol is protic — favors SN1/E1 over SN2."],
  clinical:"Reaction conditions in drug synthesis are chosen carefully; the wrong solvent switches the mechanism and the stereochemistry of the product.",
  baby:"Protic solvents (with H-O or H-N) hug the nucleophile like a blanket and won't let it attack. Aprotic solvents leave the nucleophile mad and ready to fight — perfect for SN2." },

{ id:"oc4", section:"OC", topic:"E2 elimination", difficulty:"medium", dia:null,
  q:"E2 elimination of 2-bromobutane with strong base produces mainly:",
  choices:["2-butene (more substituted, Zaitsev)","1-butene (less substituted, Hofmann)","Butane","Butanol"], answer:0,
  exp:[
    "Correct. Zaitsev's rule: the more substituted alkene (more R groups on C=C) is more stable and is the major product with small bases.",
    "The less substituted (Hofmann) product dominates only with bulky bases like tert-butoxide.",
    "Butane would require reduction, not elimination.",
    "Butanol would be substitution (SN1/SN2), not elimination."],
  clinical:"Understanding stereochemistry-driven elimination underlies enzymatic dehydration steps like fumarase in the Krebs cycle.",
  baby:"When making a double bond, the plant that's bigger and more supported (more branches around it) is stronger and wins. That's Zaitsev — bigger alkene, more stable." },

{ id:"oc5", section:"OC", topic:"E2 stereochemistry", difficulty:"hard", dia:null,
  q:"E2 requires the H being removed and the leaving group to be:",
  choices:["Anti-periplanar (180° dihedral)","Syn-periplanar (0° dihedral)","Gauche (60°)","Perpendicular"], answer:0,
  exp:[
    "Correct. E2 is concerted — H and LG leave together in the same step, and the geometry that lets orbitals overlap for the forming π bond is anti-periplanar.",
    "Syn-periplanar E2 is possible but energetically unfavorable due to eclipsing strain in the transition state.",
    "Gauche does not give proper orbital alignment for the π bond.",
    "Perpendicular is not a defined torsion angle for this."],
  clinical:"Ring systems (cyclohexanes) can lock into geometries that prevent anti-periplanar arrangement — some reactions won't proceed until a chair flip.",
  baby:"Imagine ripping off two pieces of tape from opposite sides at the same time. If they're on the same side, they get tangled. If they're straight across (anti), they slide off clean." },

{ id:"oc6", section:"OC", topic:"E1", difficulty:"medium", dia:null,
  q:"E1 and SN1 both go through a carbocation. What favors E1 over SN1?",
  choices:["Higher temperature","Lower temperature","Polar protic solvent","Tertiary substrate"], answer:0,
  exp:[
    "Correct. Heat drives elimination (increases entropy — more gas-phase-like products). E1 dominates at higher temperatures.",
    "Low temperatures favor substitution products.",
    "Polar protic solvents favor both E1 and SN1 equally by stabilizing the carbocation.",
    "Tertiary substrates form both E1 and SN1; that alone doesn't pick between them."],
  clinical:"Thermodynamic vs kinetic control principles apply broadly in medicinal chemistry synthesis.",
  baby:"Heat gives molecules the energy to throw things away (like a proton and electrons to make a double bond) instead of just swapping partners. Hot = kick stuff out = elimination." },

{ id:"oc7", section:"OC", topic:"Alkene hydrogenation", difficulty:"foundation", dia:null,
  q:"Alkene + H2 with a Pd/C or Pt catalyst gives:",
  choices:["Alkane (syn addition of H's)","Alkyne (dehydrogenation)","Alcohol","Alkyl halide"], answer:0,
  exp:[
    "Correct. Catalytic hydrogenation adds H–H across the C=C. Both H's add to the SAME face (syn) because they come off the metal surface together.",
    "Alkyne would require removing H's, opposite direction.",
    "No oxygen source, so no alcohol.",
    "No halide source, so no alkyl halide."],
  clinical:"Partial hydrogenation of vegetable oils creates trans fats (bad); food industry now uses full hydrogenation or interesterification.",
  baby:"You lay the alkene flat on a metal pan and stick two hydrogens onto the top face. Both H's arrive from above, same side — that's syn addition." },

{ id:"oc8", section:"OC", topic:"Halogenation (anti addition)", difficulty:"medium", dia:null,
  q:"Alkene + Br2 (in CCl4) gives:",
  choices:["Vicinal dibromide with anti (trans) stereochemistry","Vicinal dibromide with syn (cis) stereochemistry","Allylic bromide (single Br)","Alkyl monobromide with H replacement"], answer:0,
  exp:[
    "Correct. Br2 forms a bromonium ion (3-membered ring); the second Br⁻ attacks from the opposite face, giving anti addition.",
    "Syn addition happens in hydrogenation and OsO4, not halogenation.",
    "Allylic bromination (single Br at the allylic C) requires NBS + light or heat, not Br2/CCl4.",
    "Br2 adds across the double bond; it doesn't replace an H at this step."],
  clinical:"Bromine water is a classic organic chem test: decolorization confirms an alkene or alkyne is present.",
  baby:"Two bromines want the double bond. The first Br grabs one face and blocks the other. The second Br has no choice — it comes from the other side. That's anti." },

{ id:"oc9", section:"OC", topic:"Markovnikov addition", difficulty:"foundation", dia:null,
  q:"Propene + HBr (no peroxide) gives predominantly:",
  choices:["2-bromopropane","1-bromopropane","Propanol","Propane"], answer:0,
  exp:[
    "Correct. Markovnikov's rule: H adds to the C with more H's, halide to the C with fewer H's — because the more substituted carbocation intermediate is more stable.",
    "1-bromopropane forms via the less stable primary carbocation; it's the minor product.",
    "No water present, so no alcohol.",
    "Would require full reduction, not addition of HBr."],
  clinical:"'Markovnikov selectivity' shapes how the body metabolizes many hydration reactions in fatty acid biosynthesis.",
  baby:"'The rich get richer.' The carbon with more H's already gets the new H. The Br goes to the carbon that had fewer H's, because that's where the carbocation feels most safe (more neighbors = more support)." },

{ id:"oc10", section:"OC", topic:"Anti-Markovnikov (peroxide)", difficulty:"medium", dia:null,
  q:"Propene + HBr WITH peroxides (ROOR, hv) gives predominantly:",
  choices:["1-bromopropane","2-bromopropane","Propane","Propanol"], answer:0,
  exp:[
    "Correct. Peroxides initiate a radical chain: Br• adds to give the more stable radical (secondary), placing H on the more substituted C. Net: Br ends up on the terminal C — 'anti-Markovnikov.'",
    "That would be the regular Markovnikov product (no peroxides).",
    "Would require reduction, not radical addition.",
    "No water source for an alcohol."],
  clinical:"Radical chemistry underlies lipid peroxidation in atherosclerosis and vitamin E's role as a chain-breaking antioxidant.",
  baby:"Peroxides flip the rule. Now the reaction goes through a RADICAL instead of a carbocation, and the radical likes the middle carbon best. So the Br ends up on the OUTSIDE this time." },

{ id:"oc11", section:"OC", topic:"Hydroboration-oxidation", difficulty:"medium", dia:null,
  q:"1-methylcyclohexene treated with BH3 then H2O2/OH⁻ gives:",
  choices:["trans-2-methylcyclohexanol (anti-Markovnikov, syn addition)","1-methylcyclohexanol (Markovnikov)","cis-2-methylcyclohexanol","2-methylcyclohexanone"], answer:0,
  exp:[
    "Correct. Hydroboration is syn (both add to same face) AND anti-Markovnikov (OH on less substituted C). Boron is bulky and steric factors push it to less crowded C.",
    "Would be the Markovnikov product from acid-catalyzed hydration.",
    "Syn addition is correct but the OH ends up trans to the methyl due to the geometry of BH addition.",
    "Hydroboration-oxidation makes alcohols, not ketones."],
  clinical:"Precise regio- and stereo-selective hydration is central to steroid and prostaglandin drug synthesis.",
  baby:"Boron is chunky and wants to sit on the less crowded carbon. Later, an OH takes its place on that same spot. So you get the anti-Markovnikov alcohol, and both new pieces are on the same face (syn)." },

{ id:"oc12", section:"OC", topic:"Ozonolysis", difficulty:"medium", dia:null,
  q:"Ozonolysis (O3, then Zn or DMS) of 2-methyl-2-butene gives:",
  choices:["Acetone + acetaldehyde","Acetic acid + propanoic acid","Two molecules of acetone","2-butanol"], answer:0,
  exp:[
    "Correct. Ozonolysis with reductive workup (Zn or DMS) cleaves the C=C, replacing each C with =O. The internal alkene C(CH3)=CH gives (CH3)2C=O (acetone) and CH3CHO (acetaldehyde).",
    "That would require oxidative workup (H2O2), which converts aldehydes further to carboxylic acids.",
    "Ozonolysis products depend on the alkene's substitution; here the two carbons of the C=C carry different substituents.",
    "Ozonolysis is a cleavage reaction, not a hydration."],
  clinical:"Ozonolysis-based degradation was historically used to determine the structure of unknown alkenes, a foundation for modern spectroscopic identification.",
  baby:"Ozone is molecular scissors. Wherever there's a C=C, it cuts it in half and puts an =O on each end. If Zn cleans up, aldehydes stay; if H2O2 cleans up, they get pushed all the way to acids." },

{ id:"oc13", section:"OC", topic:"Alcohol oxidation", difficulty:"medium", dia:null,
  q:"Oxidation of a PRIMARY alcohol with PCC (pyridinium chlorochromate) in dry CH2Cl2 gives:",
  choices:["Aldehyde (stops at the aldehyde)","Carboxylic acid (goes all the way)","Ketone","Ester"], answer:0,
  exp:[
    "Correct. PCC is a mild oxidant. It converts 1° alcohols to aldehydes and stops there because there's no water present to over-oxidize.",
    "Stronger oxidants (K2Cr2O7, KMnO4, Jones = CrO3/H2SO4) push all the way to the carboxylic acid.",
    "Ketones come from oxidation of SECONDARY alcohols, not primary.",
    "Esters need a carboxylic acid + alcohol under acid catalysis (Fischer esterification), a different reaction."],
  clinical:"Alcohol dehydrogenase in the liver converts ethanol → acetaldehyde (toxic hangover chemical) → acetate; PCC is the lab version that stops at the aldehyde.",
  baby:"PCC is a 'polite' oxidizer: it takes the alcohol up one step to aldehyde and quits. Strong oxidizers keep pushing until it becomes a full carboxylic acid." },

{ id:"oc14", section:"OC", topic:"Alcohol oxidation", difficulty:"foundation", dia:null,
  q:"Oxidation of a SECONDARY alcohol (like 2-butanol) gives:",
  choices:["Ketone","Aldehyde","Carboxylic acid","No reaction"], answer:0,
  exp:[
    "Correct. 2° alcohols oxidize to ketones (only one H on the C-OH to lose). Ketones can't easily oxidize further under standard conditions.",
    "Aldehydes come from 1° alcohols (two H's on the C-OH).",
    "Would require breaking a C–C bond, which standard oxidation doesn't do.",
    "2° alcohols definitely oxidize."],
  clinical:"Isopropanol (rubbing alcohol) is metabolized to acetone — this is how the sweet, fruity acetone breath of DKA also appears with isopropanol ingestion.",
  baby:"A secondary alcohol has one H sitting next to the OH. Oxidation swaps that H and the OH for a =O, making a ketone. Simple." },

{ id:"oc15", section:"OC", topic:"Nucleophilic addition", difficulty:"foundation", dia:null,
  q:"The carbonyl carbon (C=O) in an aldehyde is:",
  choices:["Electrophilic (partial positive)","Nucleophilic (partial negative)","Neutral","Aromatic"], answer:0,
  exp:[
    "Correct. Oxygen pulls electrons via induction and via the π bond, leaving the carbonyl C partially positive (δ+) — a prime target for nucleophiles.",
    "The oxygen is nucleophilic (has lone pairs, δ–), but the CARBON is electrophilic.",
    "The C=O bond is highly polarized, not neutral.",
    "Aromaticity requires a specific ring system with 4n+2 π electrons; a carbonyl alone is not aromatic."],
  clinical:"Nucleophilic addition to carbonyls underlies enzyme mechanisms like serine proteases (Ser-OH attacks peptide C=O).",
  baby:"Oxygen is greedy — it hoards electrons and leaves the carbon lonely and slightly positive. Nucleophiles (electron donors) love that lonely carbon and come running to donate." },

{ id:"oc16", section:"OC", topic:"Acetal formation", difficulty:"medium", dia:null,
  q:"An aldehyde + 2 equivalents of alcohol with acid catalyst gives:",
  choices:["Acetal (two OR groups on the same C, water lost)","Hemiacetal (one OR, one OH)","Ester","Ether"], answer:0,
  exp:[
    "Correct. First alcohol adds → hemiacetal (OR + OH on same C). Under acid, water leaves and a second alcohol adds → acetal (two OR groups). Acetals need acid to form and to be hydrolyzed back.",
    "Hemiacetal is the intermediate; equilibrium usually pushes to acetal with 2 equiv of alcohol.",
    "Esters form from carboxylic acids + alcohols, not aldehydes.",
    "Ethers involve two carbons bridged by one oxygen; acetal has TWO OR groups on one carbon."],
  clinical:"Acetals are common in carbohydrate chemistry — glycosidic linkages between sugars in disaccharides (sucrose, lactose) are acetal bonds.",
  baby:"An aldehyde is like a magnet for two alcohol friends. First one alcohol clicks on (hemiacetal). Then water leaves and a second alcohol clicks on the same spot (acetal). Two friends, one carbon." },

{ id:"oc17", section:"OC", topic:"Imine formation", difficulty:"medium", dia:null,
  q:"An aldehyde or ketone + PRIMARY amine (R-NH2) with mild acid gives:",
  choices:["Imine (C=N-R, water lost)","Enamine","Amide","Nitrile"], answer:0,
  exp:[
    "Correct. Primary amines attack C=O, lose water, and form an imine (Schiff base). Optimal pH ~4–5 balances amine nucleophilicity and acid catalysis.",
    "Enamines form from SECONDARY amines (no N-H left after attack, so a C=C shifts out instead of a C=N).",
    "Amides come from carboxylic acid derivatives + amines, not aldehydes/ketones.",
    "Nitriles have a triple bond (C≡N), require different chemistry."],
  clinical:"Schiff bases are how enzymes like transaminases and rhodopsin (retinal binds lysine) mechanically hold substrates.",
  baby:"A primary amine (–NH2) meets a carbonyl (C=O), they hug, one water gets squeezed out, and now the N replaces the O in the double bond: C=N. That's an imine." },

{ id:"oc18", section:"OC", topic:"Aldol condensation", difficulty:"hard", dia:null,
  q:"In a base-catalyzed aldol reaction, the nucleophile is:",
  choices:["An enolate ion (deprotonated α-carbon)","The carbonyl oxygen","The α-carbon of a non-enolizable ketone","A hydroxide-activated water"], answer:0,
  exp:[
    "Correct. Base removes the α-H (pKa ~20) to make an enolate. The enolate's α-carbon has a nucleophilic lone pair (resonance-stabilized) and attacks another carbonyl.",
    "Carbonyl O is nucleophilic too but doesn't do the C–C bond formation in aldol.",
    "Non-enolizable ketones (no α-H) can serve as electrophile only.",
    "Hydroxide is the base but not the reacting nucleophile."],
  clinical:"Aldolase in glycolysis catalyzes an aldol-type C–C bond cleavage (F1,6BP → DHAP + G3P) using enamine chemistry.",
  baby:"Base rips an H off the carbon NEXT to the C=O. That carbon now has extra electrons and becomes an angry nucleophile that punches another C=O to build a bigger molecule with a new C–C bond." },

{ id:"oc19", section:"OC", topic:"Keto-enol tautomerization", difficulty:"medium", dia:null,
  q:"Which statement about keto–enol tautomerization is TRUE?",
  choices:["The keto form is usually more stable for simple ketones","The enol form is usually more stable","They differ by breaking a C–C bond","They are resonance structures, not tautomers"], answer:0,
  exp:[
    "Correct. For simple ketones/aldehydes, the keto form dominates by >99% because C=O is stronger than C=C and C–H > O–H bond enthalpies overall.",
    "Enols dominate only in special cases (β-diketones, phenol, vitamin C).",
    "Tautomers differ by H position only, not by breaking C–C bonds.",
    "Tautomers are DIFFERENT compounds in equilibrium; resonance structures are one molecule with delocalized electrons."],
  clinical:"Enol tautomers are the mutagenic form of DNA bases — rare enol tautomers can mispair (e.g., enol thymine pairs with guanine), a source of spontaneous mutations.",
  baby:"A ketone and its 'enol twin' are two real, separate molecules that flip back and forth by moving one hydrogen. The ketone version (C=O, big and stable) wins the popularity contest almost always." },

{ id:"oc20", section:"OC", topic:"Grignard reagent", difficulty:"medium", dia:null,
  q:"Grignard reagent (CH3MgBr) + formaldehyde (H2CO) after workup gives:",
  choices:["A primary alcohol (ethanol)","A secondary alcohol","A tertiary alcohol","A carboxylic acid"], answer:0,
  exp:[
    "Correct. Grignard + formaldehyde adds R and H to the C=O, giving a 1° alcohol. R–CH2–OH pattern.",
    "Grignard + aldehyde (other than formaldehyde) → 2° alcohol.",
    "Grignard + ketone → 3° alcohol.",
    "Grignard adds C, not oxidizes."],
  clinical:"Grignard chemistry lets chemists build complex carbon frameworks for drug synthesis one C–C bond at a time.",
  baby:"A Grignard is a carbon with a metal — it's basically a carbon-shaped hammer. Smash it onto the carbonyl carbon, then add water. Whatever pattern you get depends on how many R groups the starting carbonyl had." },

{ id:"oc21", section:"OC", topic:"Grignard + ester", difficulty:"hard", dia:null,
  q:"Grignard reagent (2 equiv) + ester (RCOOR') gives after workup:",
  choices:["A tertiary alcohol","A primary alcohol","A secondary alcohol","A carboxylic acid"], answer:0,
  exp:[
    "Correct. First Grignard adds → tetrahedral intermediate → collapses back to ketone (OR' leaves). Second Grignard adds to the ketone → 3° alcohol. That's why esters give 3° alcohols with 2 equiv Grignard.",
    "Primary alcohols come from formaldehyde + Grignard.",
    "Secondary comes from aldehyde + Grignard.",
    "Grignard adds carbon groups; can't stop at acid without special conditions."],
  clinical:"Predicting Grignard product patterns is a foundational exercise for retrosynthesis in medicinal chemistry.",
  baby:"An ester takes TWO Grignard punches. The first one kicks out the OR group and makes a ketone. The second one adds again to that ketone. Two additions = three R groups + one OH = tertiary alcohol." },

{ id:"oc22", section:"OC", topic:"Reduction (LiAlH4 vs NaBH4)", difficulty:"medium", dia:null,
  q:"Which statement about carbonyl reduction is CORRECT?",
  choices:["LiAlH4 reduces carboxylic acids and esters; NaBH4 does NOT","NaBH4 is stronger than LiAlH4","NaBH4 reduces amides","LiAlH4 is safe in water"], answer:0,
  exp:[
    "Correct. LiAlH4 is a powerful hydride source that reduces acids, esters, amides, and nitriles. NaBH4 is milder and generally only reduces aldehydes and ketones.",
    "LiAlH4 >> NaBH4 in reducing power.",
    "Amides need LiAlH4; NaBH4 leaves them alone.",
    "LiAlH4 reacts violently with water (releases H2 gas) — must be used in dry ether/THF."],
  clinical:"Selective reduction is critical in synthesizing chiral drug intermediates without disturbing other functional groups.",
  baby:"LiAlH4 is the sledgehammer — reduces everything, including esters and acids. NaBH4 is the polite tap — only reduces aldehydes and ketones. Pick your weapon based on what you want left standing." },

{ id:"oc23", section:"OC", topic:"Fischer esterification", difficulty:"foundation", dia:null,
  q:"Carboxylic acid + alcohol + H⁺ (heat) gives:",
  choices:["Ester + water","Amide + water","Ether + CO2","Anhydride"], answer:0,
  exp:[
    "Correct. Fischer esterification: acid-catalyzed, reversible, driven by removing water (Le Chatelier) or using excess alcohol.",
    "Amide formation requires an amine, not an alcohol.",
    "Ether formation is a different pathway (dehydration of alcohol + alcohol).",
    "Anhydrides come from two carboxylic acids losing water — usually requires a stronger dehydrating agent."],
  clinical:"Ester bonds are ubiquitous in physiology (triglycerides, aspirin, many drugs). Understanding hydrolysis vs formation predicts drug half-life.",
  baby:"Sour thing (acid) + alcohol + a splash of strong acid + heat = fruity smell (ester) and a drop of water. It's how bananas and pineapples get their smell." },

{ id:"oc24", section:"OC", topic:"Saponification", difficulty:"medium", dia:null,
  q:"Saponification is:",
  choices:["Base hydrolysis of an ester to a carboxylate + alcohol","Acid hydrolysis of an ester","Formation of an ester from acid + alcohol","Reduction of an ester to an alcohol"], answer:0,
  exp:[
    "Correct. Saponification uses OH⁻ to hydrolyze an ester. It's irreversible under those conditions because the carboxylate is deprotonated and can't be attacked back by the alcohol.",
    "Acid hydrolysis of an ester is possible but is reversible (opposite of Fischer esterification).",
    "That's Fischer esterification, the opposite direction.",
    "Reduction to alcohol requires LiAlH4, not base."],
  clinical:"Literally how soap is made: triglycerides + NaOH → glycerol + fatty acid salts (soap). Applied clinically in interpreting lipase-based fat digestion.",
  baby:"'Saponification' comes from the Latin for soap. Base (NaOH) chops the ester bond and you can't put it back together — the pieces float away as a salt (soap) and alcohol." },

{ id:"oc25", section:"OC", topic:"Amide hydrolysis", difficulty:"medium", dia:null,
  q:"Amides are among the MOST stable carboxylic acid derivatives. Why?",
  choices:["N lone pair strongly resonance-donates into the C=O","N is more electronegative than O","Amides have no dipole","Amides lack any π system"], answer:0,
  exp:[
    "Correct. The nitrogen lone pair delocalizes into the carbonyl, giving the C–N bond partial double-bond character and reducing the C=O electrophilicity — protecting amides from nucleophiles.",
    "N is LESS electronegative than O.",
    "Amides have a strong dipole.",
    "Amides have a resonance π system across N–C=O; that's exactly why they're stable."],
  clinical:"Peptide bonds are amides — their stability is why proteins hold together for years without hydrolyzing spontaneously; enzymes (proteases) are needed to break them.",
  baby:"Nitrogen shares its extra electrons with the carbonyl, making the whole group extra sturdy. That's why amide bonds (like in proteins) don't just fall apart on their own." },

{ id:"oc26", section:"OC", topic:"Decarboxylation", difficulty:"medium", dia:null,
  q:"β-ketoacids (like acetoacetic acid) readily lose CO2 when heated because:",
  choices:["A stable 6-membered cyclic transition state and enol product form","β-ketoacids are aromatic","The CO2 has extra electrons","Water catalyzes the loss"], answer:0,
  exp:[
    "Correct. β-ketoacids decarboxylate through a 6-membered transition state where the acid H moves to the ketone O, forming an enol that tautomerizes to the more stable ketone. Very favorable.",
    "β-ketoacids are not aromatic.",
    "CO2 is stable and neutral; not why it leaves.",
    "Water isn't required; the mechanism is intramolecular."],
  clinical:"Acetoacetic acid decarboxylation makes acetone in DKA (diabetic ketoacidosis) — the fruity 'ketone breath.'",
  baby:"When the acid is exactly TWO carbons away from a ketone (β-position), it can fold up into a nice ring and pop off CO2 easily. That's why ketosis smells like nail polish remover — acetone leaks from the lungs." },

{ id:"oc27", section:"OC", topic:"EAS (aromatic substitution)", difficulty:"medium", dia:null,
  q:"In electrophilic aromatic substitution (EAS), an ACTIVATING group like -OCH3 directs the electrophile to:",
  choices:["Ortho and para positions","Meta position","Ipso position","Randomly (no preference)"], answer:0,
  exp:[
    "Correct. Activating groups (donate electrons: -OR, -NR2, -OH, alkyl) stabilize the sigma complex when the electrophile attaches ortho or para (resonance places + charge next to the donor).",
    "Meta is where DEACTIVATORS (-NO2, -CN, -COR) direct — they destabilize the ortho/para arenium ion.",
    "Ipso substitution is rare and only for specific groups.",
    "Directors have strong preferences, not random."],
  clinical:"Understanding EAS directors is core to synthesizing aromatic drug scaffolds like NSAIDs (aspirin, ibuprofen) and beta-blockers.",
  baby:"If a group on the ring is a giver (donates electrons), it makes the neighboring spots (ortho, para) rich and inviting for the next electrophile. Takers (like NO2) do the opposite — they push the electrophile to the far side (meta)." },

{ id:"oc28", section:"OC", topic:"EAS directors", difficulty:"medium", dia:null,
  q:"Which is a META-directing DEACTIVATOR?",
  choices:["-NO2","-OCH3","-NH2","-CH3"], answer:0,
  exp:[
    "Correct. -NO2 withdraws electrons strongly (inductively AND by resonance). It deactivates the ring and directs meta.",
    "-OCH3 is a strong activator, ortho/para director.",
    "-NH2 is a strong activator, ortho/para director.",
    "-CH3 is a weak activator (hyperconjugation), ortho/para director."],
  clinical:"Nitro groups on aromatic drugs (metronidazole) also confer redox-active properties useful against anaerobes.",
  baby:"Anything with a =O or ≡N pulling electrons OFF the ring is a meta director. Anything with a lone pair (or an alkyl) donating INTO the ring is an ortho/para director. That's basically the whole rule." },

{ id:"oc29", section:"OC", topic:"Friedel-Crafts", difficulty:"medium", dia:null,
  q:"Friedel-Crafts alkylation of benzene uses:",
  choices:["Alkyl halide + AlCl3 (Lewis acid)","Alkyl halide + HCl","Alcohol + NaOH","Acyl chloride + base"], answer:0,
  exp:[
    "Correct. AlCl3 ionizes the alkyl halide to form a carbocation (or a strong C–Cl polarized complex) that acts as the electrophile in EAS.",
    "HCl doesn't generate the needed carbocation.",
    "NaOH is a base, wrong role here.",
    "Acyl chloride + AlCl3 is Friedel-Crafts ACYLATION (gives ketone) — different reaction."],
  clinical:"Friedel-Crafts steps appear in the synthesis of many drugs, dyes, and fragrances.",
  baby:"AlCl3 rips a Cl off an alkyl halide to make a carbocation. The benzene ring attacks that carbocation with its π electrons. Result: an alkyl group is welded onto the ring." },

{ id:"oc30", section:"OC", topic:"Chirality", difficulty:"foundation", dia:null,
  q:"A carbon is a stereocenter (chiral center) when:",
  choices:["It has 4 different substituents","It's sp2 hybridized","It's in a ring","It has a double bond"], answer:0,
  exp:[
    "Correct. A tetrahedral C bonded to 4 different groups is a stereocenter — it and its mirror image cannot be superimposed.",
    "sp2 carbons are trigonal planar and generally not stereocenters (though they can be part of E/Z geometry).",
    "Being in a ring doesn't automatically make a C chiral.",
    "Double bonds create E/Z isomerism, distinct from a chiral center."],
  clinical:"Chirality drives drug specificity: many drugs act only in one enantiomeric form (e.g., (S)-ibuprofen is the active analgesic).",
  baby:"A chiral carbon has four different friends and looks different in the mirror (like your left vs right hand). Same molecular formula, different 3D shape." },

{ id:"oc31", section:"OC", topic:"Stereoisomers", difficulty:"medium", dia:null,
  q:"Enantiomers vs diastereomers — which is TRUE?",
  choices:["Enantiomers are mirror images; diastereomers are not","Both are mirror images","Diastereomers have the same physical properties","Enantiomers have different melting points"], answer:0,
  exp:[
    "Correct. Enantiomers are non-superimposable mirror images (differ at ALL stereocenters). Diastereomers differ at some stereocenters but not others — NOT mirror images.",
    "Only enantiomers are mirror images; diastereomers are not.",
    "Diastereomers have DIFFERENT physical properties (mp, bp, solubility) — that's what lets you separate them.",
    "Enantiomers have IDENTICAL physical properties (except optical rotation and reactivity with other chiral things)."],
  clinical:"Separating enantiomers requires chiral chromatography or resolution with a chiral acid/base — expensive but essential in modern drug manufacture.",
  baby:"Enantiomers = full mirror twins (left vs right hand). Diastereomers = related cousins that look kinda different (like your hand vs your foot). Twins are hard to tell apart with normal tests; cousins are easy." },

{ id:"oc32", section:"OC", topic:"IR spectroscopy", difficulty:"medium", dia:null,
  q:"A strong, broad IR absorption around 3200–3550 cm⁻¹ indicates:",
  choices:["O–H stretch (alcohol/phenol)","C=O stretch (carbonyl)","C≡N stretch (nitrile)","C=C stretch (alkene)"], answer:0,
  exp:[
    "Correct. Alcohol/phenol O–H stretches are broad (hydrogen bonding) and centered around 3200–3550 cm⁻¹. Carboxylic acid O–H is even broader (2500–3300, 'shoulder').",
    "C=O is a very sharp, strong peak near 1700 cm⁻¹.",
    "C≡N is sharp near 2250 cm⁻¹.",
    "C=C is a weak-moderate peak near 1650 cm⁻¹."],
  clinical:"IR fingerprinting is used in pharmaceutical QC to confirm drug identity and detect counterfeits.",
  baby:"'Big fat mountain around 3300' = OH. 'Skinny tall spike around 1700' = C=O. 'Skinny spike around 2250' = C≡N. Learn those three peaks and you can spot most functional groups on the MCAT." },

{ id:"oc33", section:"OC", topic:"NMR spectroscopy", difficulty:"medium", dia:null,
  q:"On a ¹H NMR spectrum, a peak at δ ~9-10 ppm most likely represents:",
  choices:["Aldehyde H (RCHO)","Alkyl H","Vinyl H","OH of an alcohol"], answer:0,
  exp:[
    "Correct. Aldehyde protons are heavily deshielded (right next to C=O) and appear at δ 9-10 ppm — a distinctive downfield signal.",
    "Alkyl H's appear at δ 0.5–2 ppm.",
    "Vinyl H's (on C=C) are at δ 5-7 ppm.",
    "OH signals are variable (1-5 ppm typically), broad, and can be exchanged out with D2O."],
  clinical:"NMR is the primary tool for confirming drug structure after synthesis in pharmaceutical R&D.",
  baby:"NMR shift = how hard the electron 'cloud' is being pulled off a hydrogen. Aldehyde H is right next to a hungry C=O, so its electrons are ripped away → it shows up way to the left (downfield, 9-10 ppm)." },

{ id:"oc34", section:"OC", topic:"Amino acid chemistry", difficulty:"foundation", dia:null,
  q:"At its isoelectric point (pI), an amino acid exists predominantly as:",
  choices:["A zwitterion (NH3⁺ and COO⁻, net neutral)","Fully protonated (NH3⁺, COOH)","Fully deprotonated (NH2, COO⁻)","Neutral with no charges"], answer:0,
  exp:[
    "Correct. At pI, the amino group is protonated (+) and the carboxyl is deprotonated (−). Zero NET charge but the molecule carries both charges — a zwitterion.",
    "That form dominates at very low pH (below both pKa's).",
    "That form dominates at very high pH (above both pKa's).",
    "A truly uncharged amino acid form is essentially never present in aqueous solution."],
  clinical:"Isoelectric focusing (an electrophoresis method) separates proteins by their pI — used in clinical labs and proteomics research.",
  baby:"At pI, the amino acid is like a battery with both a + end and a − end — net zero charge but not neutral inside. That balance point is where the molecule doesn't move in an electric field." },

{ id:"oc35", section:"OC", topic:"Peptide bonds", difficulty:"medium", dia:null,
  q:"The peptide bond in proteins has partial double-bond character. This means:",
  choices:["It is planar and rotation is restricted","It rotates freely like a single bond","It is broken easily by water","It has two lone pairs on nitrogen"], answer:0,
  exp:[
    "Correct. Nitrogen's lone pair delocalizes into the C=O, giving the C–N bond partial double-bond character. Rotation is restricted; the 6 atoms of the peptide unit lie in a plane.",
    "Rotation is restricted — that's the point.",
    "Peptide bonds are quite stable; enzyme catalysis is needed for hydrolysis at biological rates.",
    "The lone pair is delocalized, not localized as two lone pairs."],
  clinical:"Peptide bond planarity dictates protein secondary structure (α-helix, β-sheet) via the φ and ψ dihedrals — the Ramachandran plot.",
  baby:"The peptide bond is stuck flat like a pancake — no spinning. This makes protein backbones fold into predictable shapes (helices and sheets) instead of wiggling every which way." },

/* ============================ DEVELOPMENT (DV) ============================ */
{ id:"dv1", section:"DV", topic:"Freud psychosexual overview", difficulty:"foundation", dia:null,
  q:"Freud's psychosexual theory proposes that personality develops through 5 stages centered on:",
  choices:["Zones of libidinal (bodily) pleasure","Cognitive schema acquisition","Moral reasoning","Social crises"], answer:0,
  exp:[
    "Correct. Freud's 5 stages (oral, anal, phallic, latency, genital) each focus on a different erogenous zone. Fixation at any stage supposedly shapes adult personality.",
    "That's Piaget's cognitive theory.",
    "That's Kohlberg's moral development.",
    "That's Erikson's psychosocial theory."],
  clinical:"Freud's theory is largely historical for MCAT purposes but the vocabulary (id/ego/superego, defense mechanisms, fixation) still appears.",
  baby:"Freud thought babies and kids get pleasure from different body parts as they grow up — mouth first, then bathroom stuff, then genitals. If you got 'stuck' at any stage, it would mess up your grown-up personality." },

{ id:"dv2", section:"DV", topic:"Freud: Oral stage", difficulty:"foundation", dia:null,
  q:"Freud's ORAL stage occurs at:",
  choices:["0-1 year (mouth = pleasure)","1-3 years","3-6 years","6-12 years"], answer:0,
  exp:[
    "Correct. Oral stage: 0-1 yr. Sucking, biting, chewing. Fixation → smoking, overeating, nail-biting, or dependency in adulthood.",
    "That's the anal stage.",
    "That's the phallic stage.",
    "That's the latency period."],
  clinical:"Freudian oral fixations are speculative, but pediatricians do note oral stimulation as key soothing behavior in infancy.",
  baby:"Ages 0-1: baby explores the world with their mouth. Everything goes in. If this stage doesn't go well, Freud said you might grow up to chew pens or smoke." },

{ id:"dv3", section:"DV", topic:"Freud: Anal stage", difficulty:"foundation", dia:null,
  q:"Freud's ANAL stage (1-3 years) centers on:",
  choices:["Toilet training and control","Feeding and sucking","Awareness of genitals","Same-sex peer relationships"], answer:0,
  exp:[
    "Correct. Anal stage: 1-3 yr. Toilet training. Fixation → 'anal-retentive' (compulsive, orderly) or 'anal-expulsive' (messy, careless).",
    "That's oral.",
    "That's phallic.",
    "That's latency."],
  clinical:"Modern pediatric development frames toilet training with behavioral/reinforcement principles rather than Freudian drives.",
  baby:"Ages 1-3: potty training. The kid is learning to control what comes out and when. Freud thought if this went badly, you'd grow up either super neat or super messy." },

{ id:"dv4", section:"DV", topic:"Freud: Phallic stage", difficulty:"medium", dia:null,
  q:"Freud's PHALLIC stage (3-6 years) is associated with:",
  choices:["Oedipus/Electra complex","Genital maturity","Toilet training","Peer identification"], answer:0,
  exp:[
    "Correct. Phallic: 3-6 yr. Child unconsciously desires opposite-sex parent (Oedipus for boys, Electra for girls) and identifies with same-sex parent to resolve it.",
    "Genital stage is the LAST stage (puberty onward).",
    "Anal stage is toilet training.",
    "Peer identification is more latency."],
  clinical:"Not clinically actionable, but recognizing 'Oedipus/Electra' vocab as PHALLIC on questions is high-yield.",
  baby:"Ages 3-6: kid notices they have (or don't have) a penis. Freud said they secretly want the opposite-sex parent and get jealous of the same-sex parent, then learn to be like the same-sex parent instead." },

{ id:"dv5", section:"DV", topic:"Freud: Latency", difficulty:"foundation", dia:null,
  q:"Freud's LATENCY period (6-12 years) is characterized by:",
  choices:["Dormant sexual urges, focus on same-sex peers/school","Intense sexual awakening","Oedipus complex","Toilet training"], answer:0,
  exp:[
    "Correct. Latency: 6-12 yr. Libido is 'quiet'; child focuses on school, hobbies, same-sex friendships. Not a psychosexual conflict stage.",
    "Sexual awakening is genital stage (puberty).",
    "Oedipus is phallic.",
    "Toilet training is anal."],
  clinical:"Latency roughly overlaps with Piaget's concrete operational stage — kids at this age are cognitively concrete but socially expanding.",
  baby:"Ages 6-12: sexual stuff goes on pause. Kids just want to hang out with same-sex friends, learn to read, play sports. It's a chill period before puberty." },

{ id:"dv6", section:"DV", topic:"Freud: Genital", difficulty:"foundation", dia:null,
  q:"Freud's GENITAL stage begins at:",
  choices:["Puberty (~12) and continues through adulthood","Birth","Age 3","Age 6"], answer:0,
  exp:[
    "Correct. Genital: puberty onward. Mature sexual interests emerge. Healthy resolution of earlier stages = capacity for mature intimate relationships.",
    "Birth is oral.",
    "Age 3 is phallic.",
    "Age 6 is latency."],
  clinical:"Puberty-driven hormonal changes (Tanner staging) are the modern clinical framework for adolescent sexual development.",
  baby:"Ages 12+: puberty hits. Sexual feelings come back but now aimed at other people. If everything went well before, adult relationships work out. If not, Freud said you'd have issues." },

{ id:"dv7", section:"DV", topic:"Erikson overview", difficulty:"foundation", dia:null,
  q:"Erikson's psychosocial theory frames development as:",
  choices:["8 stages, each with a specific social conflict/virtue to resolve","5 psychosexual stages","4 cognitive stages","6 moral reasoning stages"], answer:0,
  exp:[
    "Correct. Erikson's 8 stages span the whole lifespan. Each stage presents a conflict (e.g., trust vs mistrust) that, if resolved, yields a virtue (e.g., hope).",
    "That's Freud.",
    "That's Piaget.",
    "That's Kohlberg."],
  clinical:"Erikson's framework is widely used in modern developmental medicine, pediatric psychiatry, and geriatric care.",
  baby:"Erikson said life has 8 chapters. In each one, you face a big question. Answer it well and you gain a superpower (a 'virtue'). Fail and it haunts you." },

{ id:"dv8", section:"DV", topic:"Erikson: Trust vs Mistrust", difficulty:"foundation", dia:null,
  q:"Erikson's FIRST stage, TRUST vs MISTRUST, occurs at:",
  choices:["0-1 year; virtue = hope","1-3 years","3-6 years","6-12 years"], answer:0,
  exp:[
    "Correct. 0-1 yr. If caregivers meet infant's needs reliably, the child develops trust in the world. Virtue: hope. Failure: anxiety, insecurity.",
    "That's autonomy vs shame.",
    "That's initiative vs guilt.",
    "That's industry vs inferiority."],
  clinical:"Attachment theory (Bowlby, Ainsworth) is the modern extension — 'secure' attachment ≈ successful trust resolution.",
  baby:"Ages 0-1: Baby learns 'do the big people show up when I cry?' If yes → the world feels safe (trust). If no → the world feels scary (mistrust). Virtue earned = HOPE." },

{ id:"dv9", section:"DV", topic:"Erikson: Autonomy vs Shame/Doubt", difficulty:"foundation", dia:null,
  q:"Erikson's AUTONOMY vs SHAME/DOUBT stage occurs at:",
  choices:["1-3 years; virtue = will","0-1 year","3-6 years","6-12 years"], answer:0,
  exp:[
    "Correct. 1-3 yr. Toddler asserts independence ('I do it!'). Support → autonomy and will. Overcontrol → shame and self-doubt.",
    "That's trust vs mistrust.",
    "That's initiative vs guilt.",
    "That's industry vs inferiority."],
  clinical:"Corresponds to Freud's anal stage — same age range, both frame it around control (Freud: toilet control; Erikson: self-control).",
  baby:"Ages 1-3: Toddler wants to do everything alone — 'I do it MYSELF!' If allowed, they learn WILLPOWER. If shut down constantly, they feel ashamed of trying." },

{ id:"dv10", section:"DV", topic:"Erikson: Initiative vs Guilt", difficulty:"foundation", dia:null,
  q:"Erikson's INITIATIVE vs GUILT stage occurs at:",
  choices:["3-6 years; virtue = purpose","1-3 years","6-12 years","12-20 years"], answer:0,
  exp:[
    "Correct. 3-6 yr. Preschooler starts making plans, initiating play/tasks. Encouragement → purpose. Criticism → guilt about wanting things.",
    "That's autonomy vs shame.",
    "That's industry vs inferiority.",
    "That's identity vs role confusion."],
  clinical:"This is the age of imaginative play and 'why?' questions. Preschool programs are structured to encourage initiative.",
  baby:"Ages 3-6: Kid starts having their OWN ideas ('let's build a fort!'). If adults cheer them on → they feel PURPOSE. If shamed → they feel guilty for wanting to do stuff." },

{ id:"dv11", section:"DV", topic:"Erikson: Industry vs Inferiority", difficulty:"foundation", dia:null,
  q:"Erikson's INDUSTRY vs INFERIORITY stage occurs at:",
  choices:["6-12 years; virtue = competence","3-6 years","12-20 years","20-40 years"], answer:0,
  exp:[
    "Correct. 6-12 yr. School-age kid compares self to peers, tries to master skills. Success → competence. Failure → inferiority.",
    "That's initiative vs guilt.",
    "That's identity vs role confusion.",
    "That's intimacy vs isolation."],
  clinical:"Corresponds to Freud's latency stage and Piaget's concrete operational stage — school is the central developmental setting.",
  baby:"Ages 6-12: Kid learns skills (reading, math, sports) and constantly compares to classmates. Winning at things = COMPETENCE. Always losing = feeling inferior." },

{ id:"dv12", section:"DV", topic:"Erikson: Identity vs Role Confusion", difficulty:"foundation", dia:null,
  q:"Erikson's IDENTITY vs ROLE CONFUSION stage occurs at:",
  choices:["12-20 years (adolescence); virtue = fidelity","6-12 years","20-40 years","40-65 years"], answer:0,
  exp:[
    "Correct. 12-20 yr. Adolescent explores identities ('who am I?'). Successful = coherent sense of self and fidelity to values. Failure = role confusion.",
    "That's industry vs inferiority.",
    "That's intimacy vs isolation.",
    "That's generativity vs stagnation."],
  clinical:"Marcia elaborated 4 identity statuses (achievement, moratorium, foreclosure, diffusion) built on Erikson's stage.",
  baby:"Ages 12-20: Teen asks 'WHO am I?' They try on different personalities and beliefs. Landing on a stable identity = FIDELITY (loyal to who you are). Never figuring it out = role confusion." },

{ id:"dv13", section:"DV", topic:"Erikson: Intimacy vs Isolation", difficulty:"foundation", dia:null,
  q:"Erikson's INTIMACY vs ISOLATION stage occurs at:",
  choices:["20-40 years (young adulthood); virtue = love","12-20 years","40-65 years","65+ years"], answer:0,
  exp:[
    "Correct. 20-40 yr. Adult forms deep intimate relationships. Success → love. Failure → isolation, loneliness.",
    "That's identity vs role confusion.",
    "That's generativity vs stagnation.",
    "That's integrity vs despair."],
  clinical:"Requires successful identity formation first — you can't fully be intimate without knowing who you are. Sequenced stages.",
  baby:"Ages 20-40: 'Now that I know who I am, can I share myself with someone else?' Success = deep LOVE. Failure = feeling alone." },

{ id:"dv14", section:"DV", topic:"Erikson: Generativity vs Stagnation", difficulty:"foundation", dia:null,
  q:"Erikson's GENERATIVITY vs STAGNATION stage occurs at:",
  choices:["40-65 years (middle adulthood); virtue = care","20-40 years","12-20 years","65+ years"], answer:0,
  exp:[
    "Correct. 40-65 yr. Adult contributes to next generation (raising kids, mentoring, meaningful work). Success → care. Failure → stagnation, self-absorption.",
    "That's intimacy vs isolation.",
    "That's identity vs role confusion.",
    "That's integrity vs despair."],
  clinical:"'Midlife crisis' is often reframed as unresolved generativity — feeling one hasn't contributed meaningfully.",
  baby:"Ages 40-65: 'Am I making the world better for the next generation?' Kids, mentoring, meaningful work = CARE. Feeling stuck and useless = stagnation." },

{ id:"dv15", section:"DV", topic:"Erikson: Integrity vs Despair", difficulty:"foundation", dia:null,
  q:"Erikson's LAST stage, INTEGRITY vs DESPAIR, occurs at:",
  choices:["65+ years; virtue = wisdom","40-65 years","20-40 years","12-20 years"], answer:0,
  exp:[
    "Correct. 65+. Elder reflects on life. Feeling of meaningful, well-lived life → integrity and wisdom. Regrets, unfinished business → despair.",
    "That's generativity vs stagnation.",
    "That's intimacy vs isolation.",
    "That's identity vs role confusion."],
  clinical:"'Life review therapy' in geriatric psychiatry directly targets this stage's core task.",
  baby:"Ages 65+: 'Looking back, was my life good?' If yes → deep peace and WISDOM. If not → regret and despair." },

{ id:"dv16", section:"DV", topic:"Piaget overview", difficulty:"foundation", dia:null,
  q:"Piaget's theory of cognitive development has how many stages?",
  choices:["4","5","6","8"], answer:0,
  exp:[
    "Correct. Piaget: 4 stages (sensorimotor, preoperational, concrete operational, formal operational). Each stage adds new mental capabilities.",
    "Freud has 5 psychosexual.",
    "Kohlberg has 6 moral.",
    "Erikson has 8 psychosocial."],
  clinical:"Piaget's stages are used clinically to gauge developmental delay — a school-age child stuck in preoperational thinking is a red flag.",
  baby:"Piaget said kids' brains grow through 4 big upgrades. Each stage unlocks a new ability, like getting a new level in a video game." },

{ id:"dv17", section:"DV", topic:"Piaget: Sensorimotor", difficulty:"foundation", dia:null,
  q:"Piaget's SENSORIMOTOR stage (0-2 years) is defined by:",
  choices:["Object permanence acquisition and learning by senses/motion","Symbolic thought","Conservation","Abstract reasoning"], answer:0,
  exp:[
    "Correct. 0-2 yr. Infant learns through senses and motor actions. Key milestone: object permanence (~8 months) — knowing objects exist when hidden.",
    "Symbolic thought is preoperational.",
    "Conservation is concrete operational.",
    "Abstract reasoning is formal operational."],
  clinical:"Testing object permanence with peek-a-boo is a pediatric developmental screen.",
  baby:"Ages 0-2: Baby learns by touching, tasting, moving. The big breakthrough: realizing that when Mom leaves the room, she still EXISTS (object permanence). Before that, out of sight = gone forever." },

{ id:"dv18", section:"DV", topic:"Piaget: Preoperational", difficulty:"medium", dia:null,
  q:"Piaget's PREOPERATIONAL stage (2-7 years) is characterized by:",
  choices:["Symbolic/pretend play, egocentrism, no conservation","Object permanence","Conservation of number and volume","Hypothetical reasoning"], answer:0,
  exp:[
    "Correct. 2-7 yr. Kids use words and symbols but are egocentric (can't take another's view), lack conservation (think tall glass has more water than wide one), and don't understand reversibility.",
    "Object permanence was already achieved in sensorimotor.",
    "Conservation comes in the NEXT stage (concrete operational).",
    "Hypothetical reasoning is formal operational."],
  clinical:"Egocentrism explains why young children believe you can 'see' what they see over the phone.",
  baby:"Ages 2-7: Kid can talk and pretend but thinks EVERYONE sees the world their way (egocentric). Tall skinny glass looks like 'more' water than short wide glass because they can't hold multiple ideas at once yet." },

{ id:"dv19", section:"DV", topic:"Piaget: Concrete operational", difficulty:"medium", dia:null,
  q:"Piaget's CONCRETE OPERATIONAL stage (7-11 years) unlocks:",
  choices:["Conservation, reversibility, logic about concrete things","Object permanence","Abstract, hypothetical reasoning","Pretend play"], answer:0,
  exp:[
    "Correct. 7-11 yr. Child can now conserve (amount doesn't change with shape), reverse mental operations, classify. Logic works — but only about tangible objects.",
    "Object permanence is sensorimotor.",
    "Abstract, hypothetical reasoning is the NEXT stage (formal operational).",
    "Pretend play emerged in preoperational."],
  clinical:"This maps onto the age when kids can meaningfully learn multi-step arithmetic and follow structured rules in games.",
  baby:"Ages 7-11: Now the kid GETS IT. Water is the same amount whether it's in a tall or short glass. They can do math with real objects, follow rules in a game. But abstract 'what if' thinking is still hard." },

{ id:"dv20", section:"DV", topic:"Piaget: Formal operational", difficulty:"medium", dia:null,
  q:"Piaget's FORMAL OPERATIONAL stage (11+ years) is defined by:",
  choices:["Abstract, hypothetical, and deductive reasoning","Concrete logic only","Egocentric symbolic play","Sensorimotor exploration"], answer:0,
  exp:[
    "Correct. 11+ yr. Adolescents can reason about abstractions, hypotheticals ('what if X?'), and use systematic problem-solving.",
    "Concrete-only reasoning is the previous stage.",
    "Egocentric symbolic play is preoperational.",
    "Sensorimotor is the FIRST stage."],
  clinical:"Not everyone fully reaches formal operational thinking in all domains — many adults reason concretely in unfamiliar areas.",
  baby:"Ages 11+: Now you can think about things that DON'T exist. 'What if humans could fly?' 'What if this variable was zero?' You can do algebra, philosophy, and science experiments in your head." },

{ id:"dv21", section:"DV", topic:"Kohlberg overview", difficulty:"foundation", dia:null,
  q:"Kohlberg's theory of moral development has:",
  choices:["3 levels, 6 stages","3 levels, 3 stages","4 levels, 8 stages","5 levels, 5 stages"], answer:0,
  exp:[
    "Correct. Kohlberg: 3 levels (preconventional, conventional, postconventional), each with 2 stages, for 6 total.",
    "Only 3 stages would be 1 per level.",
    "Wrong count.",
    "Wrong count."],
  clinical:"Kohlberg's 'Heinz dilemma' (steal drug to save wife?) is the classic vignette used to diagnose which stage someone reasons at.",
  baby:"Kohlberg said people grow through 3 BIG chapters of moral thinking (preconventional, conventional, postconventional), and each chapter has 2 stages. So 6 stages total." },

{ id:"dv22", section:"DV", topic:"Kohlberg: Stage 1", difficulty:"foundation", dia:null,
  q:"Kohlberg's Stage 1 (preconventional) morality is based on:",
  choices:["Obedience and avoiding punishment","Personal benefit / making a deal","Social approval / being nice","Universal ethical principles"], answer:0,
  exp:[
    "Correct. Stage 1: 'What's right? Whatever doesn't get me punished.' Common in young children.",
    "Stage 2 is instrumental exchange ('you scratch my back, I'll scratch yours').",
    "Stage 3 is 'good boy/nice girl' orientation.",
    "Stage 6 is universal ethical principles (rare, highest)."],
  clinical:"Stage 1 reasoning matches Piaget's preoperational thinking — no perspective-taking, just consequences.",
  baby:"Stage 1: 'Bad = get in trouble. Good = don't get spanked.' The morality of a scared 4-year-old." },

{ id:"dv23", section:"DV", topic:"Kohlberg: Stage 2", difficulty:"foundation", dia:null,
  q:"Kohlberg's Stage 2 (preconventional) morality is based on:",
  choices:["Self-interest, instrumental exchange ('what's in it for me?')","Obedience","Law and order","Universal principles"], answer:0,
  exp:[
    "Correct. Stage 2: 'I'll do the right thing IF I get something back.' Fairness = equal exchange.",
    "That's Stage 1.",
    "That's Stage 4.",
    "That's Stage 6."],
  clinical:"Stage 2 thinking underlies transactional reasoning in bargaining and simple contracts.",
  baby:"Stage 2: 'I'll share my toy IF you share yours.' Everything is a trade. Good = I get something back." },

{ id:"dv24", section:"DV", topic:"Kohlberg: Stage 3", difficulty:"medium", dia:null,
  q:"Kohlberg's Stage 3 (conventional) morality is based on:",
  choices:["'Good boy/nice girl' — seeking approval, being nice","Personal exchange","Law and order","Social contract"], answer:0,
  exp:[
    "Correct. Stage 3: 'Right = what the people I care about approve of.' Being seen as good and helpful matters most.",
    "That's Stage 2.",
    "That's Stage 4.",
    "That's Stage 5."],
  clinical:"Common in adolescents; explains conformity to peer group norms as a moral driver, not just social pressure.",
  baby:"Stage 3: 'I do the right thing so people LIKE me and think I'm a good person.' Popular teen ethics." },

{ id:"dv25", section:"DV", topic:"Kohlberg: Stage 4", difficulty:"medium", dia:null,
  q:"Kohlberg's Stage 4 (conventional) morality is based on:",
  choices:["Law and order, maintaining social order","Approval of loved ones","Universal ethics","Self-interest"], answer:0,
  exp:[
    "Correct. Stage 4: 'Right = following the rules and laws that keep society running.' Duty to authority and institutions.",
    "That's Stage 3.",
    "That's Stage 6.",
    "That's Stage 2."],
  clinical:"Most adults reason at Stage 4 most of the time. Underlies civic obligations like paying taxes and voting.",
  baby:"Stage 4: 'It's wrong because it's ILLEGAL and society needs rules.' The morality of most adults most of the time." },

{ id:"dv26", section:"DV", topic:"Kohlberg: Stage 5", difficulty:"medium", dia:null,
  q:"Kohlberg's Stage 5 (postconventional) morality is based on:",
  choices:["Social contract — laws are agreed-upon and can be changed if unjust","Rigid obedience to law","Personal profit","Punishment avoidance"], answer:0,
  exp:[
    "Correct. Stage 5: Laws exist because society agrees to them, but they're not absolute — unjust laws should be changed. Rights and welfare of individuals matter.",
    "That's Stage 4 (rigid).",
    "That's Stage 2.",
    "That's Stage 1."],
  clinical:"Underlies civil disobedience — MLK's letter from Birmingham jail argues from Stage 5 reasoning.",
  baby:"Stage 5: 'Laws exist to help people. If a law hurts people, we should CHANGE it.' The morality of a thoughtful adult reformer." },

{ id:"dv27", section:"DV", topic:"Kohlberg: Stage 6", difficulty:"hard", dia:null,
  q:"Kohlberg's Stage 6 (postconventional) morality is based on:",
  choices:["Universal ethical principles that transcend laws","Following the majority","Avoiding conflict","Reward maximization"], answer:0,
  exp:[
    "Correct. Stage 6 (rare): Morality guided by universal principles (justice, human dignity) that supersede any specific law. Kohlberg said very few reach this — figures like Gandhi or MLK exemplify it.",
    "Majority-following would be Stage 3 or 4.",
    "Conflict avoidance is not principled morality.",
    "Reward-maximizing is Stage 2."],
  clinical:"Feminist critics (Gilligan) argued Kohlberg's Stage 6 privileges male 'justice-based' reasoning over 'care-based' moral reasoning.",
  baby:"Stage 6: You obey your own inner sense of 'what's truly right' even if the whole world disagrees. Almost nobody actually operates here all the time — think Gandhi, MLK." },

{ id:"dv28", section:"DV", topic:"Comparison at age 6", difficulty:"medium", dia:null,
  q:"A typical 6-year-old is in which stage of each theorist's system?",
  choices:["Phallic → Latency (Freud), Initiative vs Guilt → Industry (Erikson), Preoperational → Concrete Op (Piaget), Preconventional (Kohlberg)","Anal, Autonomy, Sensorimotor, Postconventional","Genital, Intimacy, Formal Op, Conventional","Oral, Trust, Sensorimotor, Preconventional"], answer:0,
  exp:[
    "Correct. Age 6 sits at the transition point across all four theorists — leaving early childhood, entering school age.",
    "All those are wrong ages/stages.",
    "Those are adult stages.",
    "Those are infant stages."],
  clinical:"Transition years (5-7) are when developmental screening in pediatrics is especially important — many milestones cluster here.",
  baby:"Six years old is a transition zone. Freud says the sexual stuff just went quiet (latency). Erikson says school achievement is starting to matter (industry). Piaget says logic about real objects is clicking in (concrete op). Kohlberg says they still think mostly about punishment and reward (preconventional)." },
];
BANK.push(...NEW_BANK3);


/* ----------------------------------------------------------------------------
   4c. CARS — Critical Analysis & Reasoning Skills.
   ORIGINAL passages (not from AAMC — AAMC content is copyrighted). Written in
   AAMC style; every answer is defensible from the text alone. Each question is
   tagged by the AAMC skill it exercises: Comprehension, Within the Text,
   Beyond the Text.
---------------------------------------------------------------------------- */
const CARS_PASSAGES = [
{ id:"cars1", title:"On the Aura of the Original", genre:"Philosophy of Art",
  text:[
    "When we stand before a painting we believe to be an original, we often report feeling something a reproduction cannot provide. Critics have long called this quality the work's 'aura' — a sense that this particular object, and no copy, bears the trace of the artist's hand and the accumulated history of its own existence. The aura is not a property we can measure. A perfect forgery, indistinguishable to the eye, is said to lack it entirely.",
    "This poses an awkward problem. If two objects are visually identical, and if the value we place on art is supposedly a response to what we see, then our preference for the original seems to rest on information that has nothing to do with the visible work at all. We are moved, it appears, not by the picture but by a story about the picture — who made it, when, and whether it is 'the' one.",
    "Some take this as evidence that our reverence for originals is a kind of superstition, a fetish for provenance dressed up as aesthetic judgment. Others draw the opposite conclusion: that a work of art was never merely a visual surface to begin with, and that its history is not extraneous to its meaning but part of what the work is. On this second view, to strip away the object's past is not to reveal the 'pure' artwork but to destroy something essential to it.",
    "The forger, notably, depends on the very reverence he seeks to exploit. His deception works only because collectors care about origins; a culture indifferent to authorship would render his craft pointless. In this sense the forger is not the enemy of the aura but its most devoted, if perverse, believer.",
  ],
  questions:[
    { skill:"Comprehension", q:"The author's primary purpose in the passage is to:", answer:2,
      choices:["argue that forgeries are aesthetically superior to originals","establish objective criteria for measuring a work's aura","examine why originals are valued over identical copies","prove that aesthetic judgment is purely a superstition"],
      exp:"The passage is organized around the puzzle of why we prefer originals to visually identical copies, presenting competing interpretations rather than settling on one. It never claims forgeries are superior, offers no measurement criteria (aura can't be measured), and presents 'superstition' as only one side." },
    { skill:"Within the Text", q:"A 'perfect forgery' is significant to the discussion because it:", answer:1,
      choices:["proves that provenance can be scientifically detected","separates what we can see from what we value","demonstrates that all art is ultimately worthless","shows the artist's hand is visible to the trained eye"],
      exp:"The forgery is 'indistinguishable to the eye' yet 'lacks [aura] entirely,' which isolates the visible object from the historical information we value. It exposes that gap, not detectability or worthlessness." },
    { skill:"Within the Text", q:"Which statement would the author most likely AGREE with?", answer:3,
      choices:["The value of a painting can be fully determined by visual inspection.","Reproductions and originals should command identical prices.","A work's history is always irrelevant to its meaning.","Our response to art may depend on more than what we see."],
      exp:"The passage builds to the claim that we respond to 'a story about the picture' as well as its surface, treating the view that history is 'part of what the work is' sympathetically. The others overstate positions the author questions." },
    { skill:"Within the Text", q:"The claim that the forger is the aura's 'most devoted believer' functions to:", answer:0,
      choices:["highlight that the forger's success depends on the value of origins","condemn collectors for enabling fraud","prove that forgery is a legitimate art form","suggest that forgers should be legally protected"],
      exp:"Forgery 'works only because collectors care about origins,' so the forger relies on the very reverence for provenance. It is an ironic point about dependence, not moral condemnation or endorsement." },
    { skill:"Beyond the Text", q:"Suppose a museum reveals a beloved 'original' is a copy, and visitors' admiration immediately drops. This best supports the passage's suggestion that:", answer:2,
      choices:["visual properties alone govern aesthetic response","forgeries are usually easy to detect","our judgments respond to information beyond the visible work","museums should stop displaying reproductions"],
      exp:"If admiration falls though nothing visible changed, the response tracks non-visible information (original status) — the passage's claim that we react to 'a story about the picture.' It contradicts the 'visual alone' view." },
  ]},
{ id:"cars2", title:"The Reach of Our Obligations", genre:"Moral Philosophy",
  text:[
    "Do we owe more to those near us than to strangers on the other side of the world? Common morality answers yes without hesitation: we feed our own children before donating to distant famine relief, and few regard this as a failing. Yet a persistent line of ethical argument insists that mere distance carries no moral weight. Suffering is suffering, this argument runs, whether it occurs next door or across an ocean; the accident of where a person is born cannot change the strength of their claim on us.",
    "The cosmopolitan who presses this view need not deny that we have special relationships. A parent's duty to a child is real. The cosmopolitan claim is narrower: that such duties, however genuine, cannot license indifference to those outside the circle. Partiality may permit us to do somewhat more for our own; it does not permit us to do nothing for others.",
    "Critics respond that a morality without borders is a morality no one can live by. Human sympathy, they observe, is naturally local; it is kindled by faces we know and dimmed by abstraction. A theory that demands we weigh every stranger equally with our own family asks for a kind of impartiality that would, if truly adopted, dissolve the very relationships that make us capable of care in the first place.",
    "The cosmopolitan is not obviously defeated by this. That our sympathies are local by default may be a fact about human psychology, but it is not clearly a fact about what we ought to do. Many moral achievements — the extension of rights to those once excluded — required precisely the effort to care beyond the range of instinct. To say we cannot easily care for distant strangers may describe a limit to overcome, not a boundary to respect.",
  ],
  questions:[
    { skill:"Comprehension", q:"The central issue of the passage is whether:", answer:1,
      choices:["parents genuinely love their own children","physical or social distance lessens our moral obligations","famine relief is more urgent than local charity","human beings are capable of any altruism at all"],
      exp:"The passage centers on whether nearness increases what we owe versus the cosmopolitan claim that 'distance carries no moral weight.' Parental love and altruism are granted, not disputed; no famine-vs-charity ranking is argued." },
    { skill:"Comprehension", q:"The passage indicates that the cosmopolitan position:", answer:3,
      choices:["denies that special relationships exist","requires treating strangers better than family","holds that we have no duties to our children","allows partiality but forbids indifference to outsiders"],
      exp:"Paragraph 2: the cosmopolitan 'need not deny... special relationships' and partiality 'does not permit us to do nothing for others.' The other options are exactly the overstatements the passage rejects." },
    { skill:"Within the Text", q:"The critics' main objection to cosmopolitanism is that it:", answer:0,
      choices:["demands an impartiality that would undermine our capacity to care","underestimates how much suffering exists abroad","is too permissive toward favoring one's own","has never been defended by serious philosophers"],
      exp:"Paragraph 3 argues that requiring us to weigh every stranger equally 'would... dissolve the very relationships that make us capable of care.' The critique is about impartiality corroding care." },
    { skill:"Within the Text", q:"How does the author respond to the critics in the final paragraph?", answer:2,
      choices:["by conceding that cosmopolitanism is impossible to practice","by denying that human sympathy is naturally local","by distinguishing what we tend to do from what we ought to do","by abandoning the cosmopolitan view entirely"],
      exp:"The author grants sympathy is 'local by default' (psychology) but argues this 'is not clearly a fact about what we ought to do' — separating descriptive from normative, without conceding impossibility." },
    { skill:"Beyond the Text", q:"The reference to 'the extension of rights to those once excluded' is meant to suggest that:", answer:1,
      choices:["moral progress is impossible without instinctive sympathy","caring beyond instinct is achievable and has occurred before","historical societies were more cosmopolitan than ours","rights should be restricted to those we personally know"],
      exp:"The example supports the claim that natural limits can be overcome — such achievements 'required... the effort to care beyond the range of instinct.' It is offered as precedent that caring beyond instinct is possible." },
  ]},
{ id:"cars3", title:"When Knowledge Was Rearranged", genre:"History of Media",
  text:[
    "It is tempting to describe the printing press as a machine that simply made books cheaper. But its deeper consequence was organizational rather than economic. Before print, a scholar's authority rested heavily on access — on which manuscripts a person had seen, and where. Knowledge was bound to particular places: a monastery, a court, a library whose holdings might exist nowhere else. To learn was, in part, to travel.",
    "Print loosened this bond between knowledge and location. When identical copies of a text could sit in a hundred cities at once, the question 'where is this book?' lost much of its force. What mattered instead was whether a claim could be checked — and increasingly it could be, by anyone with a copy. Scholars separated by great distances could now argue over the same page, citing it by number, confident they were looking at the same words.",
    "This standardization had a subtle effect on error. In a manuscript culture, mistakes multiplied privately; each copyist introduced his own, and no two texts fully agreed. Print did not eliminate error, but it made error public and therefore correctable. A flaw reproduced in a thousand copies could be spotted, announced, and fixed in the next edition. Reliability became less a matter of a single trusted scribe and more a matter of collective scrutiny.",
    "None of this was the press's intention, for a machine intends nothing. The printers wanted to sell books. Yet in pursuing that ordinary aim they altered the conditions under which knowledge could be produced and trusted — a reminder that the most far-reaching effects of a technology are often the ones no one set out to create.",
  ],
  questions:[
    { skill:"Comprehension", q:"The author argues that the printing press's most important effect was:", answer:2,
      choices:["reducing the price of books for ordinary readers","eliminating errors from written texts","changing how knowledge was organized and verified","increasing the authority of individual scribes"],
      exp:"The thesis: the 'deeper consequence was organizational rather than economic.' The passage downplays price, denies error was eliminated, and says scribal authority declined." },
    { skill:"Comprehension", q:"Before print, a scholar's authority depended heavily on:", answer:0,
      choices:["access to particular manuscripts in particular places","the ability to print identical copies","citing texts by page number","collective scrutiny of public errors"],
      exp:"Paragraph 1: authority 'rested heavily on access — on which manuscripts a person had seen, and where.' The others describe the later print era." },
    { skill:"Within the Text", q:"Print made errors 'correctable' primarily because it made them:", answer:3,
      choices:["rarer than in manuscript culture","invisible to ordinary readers","the responsibility of a single scribe","public and identical across many copies"],
      exp:"Paragraph 3: print 'made error public and therefore correctable'; an identically reproduced flaw 'could be spotted, announced, and fixed.' The passage denies errors became rarer or a single scribe's job." },
    { skill:"Within the Text", q:"The remark that 'a machine intends nothing' primarily serves to:", answer:1,
      choices:["criticize printers for their greed","emphasize that major effects can be unintended","argue that technology should be regulated","claim the press had no real influence"],
      exp:"Far-reaching effects 'are often the ones no one set out to create'; printers merely 'wanted to sell books.' It underscores unintended consequences, not greed or regulation." },
    { skill:"Beyond the Text", q:"Which finding, if true, would most WEAKEN the author's central claim?", answer:2,
      choices:["Early printed books contained many typographical errors.","Printers were motivated primarily by profit.","Scholarly verification methods were unchanged for centuries after print spread.","Manuscripts remained in use alongside printed books for decades."],
      exp:"The core claim is that print reorganized how knowledge was verified. Evidence that verification did NOT change undercuts it directly. Persistent typos, profit motives, and lingering manuscripts are all consistent with the passage." },
  ]},
{ id:"cars4", title:"The Uses of Longing", genre:"Cultural Criticism",
  text:[
    "Nostalgia has a poor reputation among serious thinkers. It is dismissed as sentimental, a soft-focus falsification of the past that edits out hardship and lingers on warmth. The nostalgic, we are told, does not remember history so much as launder it, exchanging the uncomfortable truth of what was for the comfortable fiction of what feels good to recall.",
    "There is justice in the complaint. Nostalgia does distort; every longing for a golden age quietly deletes that age's cruelties. But to condemn nostalgia solely as bad history is to misunderstand what it is for. Nostalgia is not primarily a claim about the past at all. It is a statement about the present — specifically, about something the present is felt to lack.",
    "Read this way, a wave of collective nostalgia becomes a piece of social evidence. When a society begins to yearn intensely for an earlier era, it is rarely reporting a discovery about that era; it is confessing a dissatisfaction with this one. The particular past chosen tells us what the present is missing — stability, perhaps, or community, or a sense that effort was rewarded. The historian may be right that the golden age never existed. The point is that people feel its absence now.",
    "This does not make nostalgia harmless. A longing misread as history can be exploited, sold as a promise to restore a past that was never real. But the remedy is not to dismiss the longing as mere error. It is to ask what genuine need the fantasy has been recruited to express — and whether that need might be met in some less illusory way.",
  ],
  questions:[
    { skill:"Comprehension", q:"The author's main argument is that nostalgia is best understood as:", answer:1,
      choices:["an accurate and valuable record of the past","an expression of what the present is felt to lack","a harmless sentimental habit with no real effects","a reliable method for studying history"],
      exp:"The passage pivots from nostalgia as 'bad history' to the claim that it 'is not primarily a claim about the past at all' but 'a statement about the present.' It denies it is accurate history or harmless." },
    { skill:"Within the Text", q:"The author concedes which point to critics of nostalgia?", answer:0,
      choices:["that nostalgia distorts the past by omitting its hardships","that nostalgia is entirely without social value","that nostalgia accurately preserves historical detail","that nostalgia is always politically dangerous"],
      exp:"Paragraph 2 grants 'Nostalgia does distort' — the critics' laundering point. The author then resists the further claims that it lacks value or is always dangerous." },
    { skill:"Within the Text", q:"The phrase 'confessing a dissatisfaction with this one' implies that collective nostalgia:", answer:2,
      choices:["proves the earlier era was genuinely superior","has no bearing on present social conditions","reveals unmet needs in the present","should be encouraged as a civic virtue"],
      exp:"The 'confession' framing treats nostalgia as evidence of present dissatisfaction — 'what the present is missing.' It does not validate the past (which 'never existed') or recommend nostalgia as a virtue." },
    { skill:"Within the Text", q:"The discussion of how nostalgia can be 'exploited' functions to:", answer:3,
      choices:["retract the author's earlier argument","prove that all nostalgia is a political trick","argue that longing should simply be ignored","qualify the argument by noting a real danger"],
      exp:"'This does not make nostalgia harmless' acknowledges a genuine risk while insisting 'the remedy is not to dismiss the longing.' It qualifies rather than retracts, and rejects ignoring it." },
    { skill:"Beyond the Text", q:"The author would most likely recommend responding to a surge of public nostalgia by:", answer:1,
      choices:["correcting people's factual errors about the past","identifying the present need the nostalgia expresses","restoring the earlier era being longed for","ignoring it as harmless sentiment"],
      exp:"The close urges us 'to ask what genuine need the fantasy has been recruited to express' and how it 'might be met in some less illusory way.' Fact-checking, literal restoration, or dismissal are all argued against." },
  ]},
];


/* ============================================================================
   5. MATCH-GAME TERM ↔ DEFINITION PAIRS  (concise, memory-friendly)
   ============================================================================ */
const MATCH_PAIRS = [
  { section:"BB", term:"Km", def:"[S] at half of Vmax; inverse of affinity" },
  { section:"BB", term:"PFK-1", def:"Rate-limiting enzyme of glycolysis" },
  { section:"BB", term:"Okazaki fragments", def:"Short DNA pieces on the lagging strand" },
  { section:"BB", term:"Missense mutation", def:"Base swap changing one amino acid" },
  { section:"BB", term:"Krebs cycle", def:"Occurs in the mitochondrial matrix" },
  { section:"BB", term:"Na⁺/K⁺-ATPase", def:"3 Na⁺ out, 2 K⁺ in, per ATP" },
  { section:"BB", term:"Cooperativity", def:"Sigmoidal binding across subunits" },
  { section:"BB", term:"Feedback inhibition", def:"End product shuts off first enzyme" },
  { section:"CP", term:"Boyle's law", def:"P ∝ 1/V at constant temperature" },
  { section:"CP", term:"SN2", def:"Backside attack, inversion, 2nd order" },
  { section:"CP", term:"SN1", def:"Carbocation intermediate, 1st order" },
  { section:"CP", term:"Enantiomers", def:"Non-superimposable mirror images" },
  { section:"CP", term:"Anode", def:"Electrode where oxidation occurs" },
  { section:"CP", term:"ΔG < 0", def:"Spontaneous / exergonic reaction" },
  { section:"CP", term:"Zwitterion", def:"Amino acid form at its pI, net charge 0" },
  { section:"CP", term:"Continuity equation", def:"A₁v₁ = A₂v₂ for fluid flow" },
  { section:"CP", term:"Carbonyl carbon", def:"Electrophilic C in C=O" },
  { section:"CP", term:"Half-equivalence pt", def:"pH equals the pKa" },
  { section:"PS", term:"Variable-ratio", def:"Schedule most resistant to extinction" },
  { section:"PS", term:"Recency effect", def:"Better recall of last-listed items" },
  { section:"PS", term:"Dopamine", def:"Reward NT; low in Parkinson's" },
  { section:"PS", term:"Bystander effect", def:"Less help as witnesses increase" },
  { section:"PS", term:"REM sleep", def:"Vivid dreams + muscle atonia" },
  { section:"PS", term:"Weber's law", def:"JND is a constant fraction of stimulus" },
  { section:"PS", term:"Ego", def:"Freud's reality-principle mediator" },
  { section:"PS", term:"Conformity", def:"Matching the group (Asch)" },
  /* ---------------- ORGANIC CHEM ---------------- */
  { section:"OC", term:"SN2", def:"Backside attack, inversion, 2nd order" },
  { section:"OC", term:"SN1", def:"Carbocation, racemization, 1st order" },
  { section:"OC", term:"E2", def:"Anti-periplanar concerted elimination" },
  { section:"OC", term:"Zaitsev", def:"More substituted alkene wins" },
  { section:"OC", term:"Markovnikov", def:"H to C with more H's already" },
  { section:"OC", term:"Anti-Markovnikov", def:"Radical HBr with peroxides" },
  { section:"OC", term:"Hydroboration-oxidation", def:"Anti-Markov, syn addition of OH" },
  { section:"OC", term:"Ozonolysis", def:"Cleaves C=C into two carbonyls" },
  { section:"OC", term:"PCC", def:"Mild oxidant, 1° alcohol → aldehyde" },
  { section:"OC", term:"Fischer esterification", def:"Acid + alcohol → ester + H2O" },
  { section:"OC", term:"Saponification", def:"Base hydrolysis of ester → salt" },
  { section:"OC", term:"Grignard", def:"C nucleophile that hits carbonyls" },
  { section:"OC", term:"LiAlH4", def:"Strong hydride: reduces acids/esters" },
  { section:"OC", term:"NaBH4", def:"Mild hydride: aldehydes & ketones only" },
  { section:"OC", term:"Aldol", def:"Enolate attacks another carbonyl" },
  { section:"OC", term:"Imine", def:"C=N from carbonyl + 1° amine" },
  { section:"OC", term:"Acetal", def:"Two OR groups on same C (from R-OH ×2)" },
  { section:"OC", term:"Decarboxylation", def:"β-ketoacids lose CO2 with heat" },
  { section:"OC", term:"EAS ortho/para", def:"Electron donors direct here" },
  { section:"OC", term:"EAS meta", def:"Electron withdrawers (NO2, CN) direct here" },
  { section:"OC", term:"Enantiomers", def:"Non-superimposable mirror images" },
  { section:"OC", term:"Diastereomers", def:"Stereoisomers, NOT mirror images" },
  { section:"OC", term:"Zwitterion", def:"Amino acid net-neutral form at pI" },
  /* ---------------- DEVELOPMENT ---------------- */
  { section:"DV", term:"Trust vs Mistrust", def:"Erikson 0-1 · virtue: hope" },
  { section:"DV", term:"Autonomy vs Shame", def:"Erikson 1-3 · virtue: will" },
  { section:"DV", term:"Initiative vs Guilt", def:"Erikson 3-6 · virtue: purpose" },
  { section:"DV", term:"Industry vs Inferiority", def:"Erikson 6-12 · virtue: competence" },
  { section:"DV", term:"Identity vs Role Confusion", def:"Erikson 12-20 · virtue: fidelity" },
  { section:"DV", term:"Intimacy vs Isolation", def:"Erikson 20-40 · virtue: love" },
  { section:"DV", term:"Generativity vs Stagnation", def:"Erikson 40-65 · virtue: care" },
  { section:"DV", term:"Integrity vs Despair", def:"Erikson 65+ · virtue: wisdom" },
  { section:"DV", term:"Oral stage", def:"Freud 0-1 · mouth pleasure" },
  { section:"DV", term:"Anal stage", def:"Freud 1-3 · toilet training" },
  { section:"DV", term:"Phallic stage", def:"Freud 3-6 · Oedipus/Electra" },
  { section:"DV", term:"Latency", def:"Freud 6-12 · dormant libido" },
  { section:"DV", term:"Genital stage", def:"Freud 12+ · mature sexuality" },
  { section:"DV", term:"Sensorimotor", def:"Piaget 0-2 · object permanence" },
  { section:"DV", term:"Preoperational", def:"Piaget 2-7 · egocentric, no conservation" },
  { section:"DV", term:"Concrete operational", def:"Piaget 7-11 · conservation, logic" },
  { section:"DV", term:"Formal operational", def:"Piaget 11+ · abstract reasoning" },
  { section:"DV", term:"Preconventional", def:"Kohlberg: punishment / self-interest" },
  { section:"DV", term:"Conventional", def:"Kohlberg: approval / law and order" },
  { section:"DV", term:"Postconventional", def:"Kohlberg: social contract / universal ethics" },
];

/* ============================================================================
   6. HELPERS
   ============================================================================ */
function decodeHTML(s){
  if (typeof s !== "string") return s;
  const map={ "&quot;":'"', "&#039;":"'", "&amp;":"&", "&lt;":"<", "&gt;":">",
    "&deg;":"°", "&rsquo;":"'", "&ldquo;":'"', "&rdquo;":'"', "&hellip;":"…", "&eacute;":"é" };
  return s.replace(/&[#a-z0-9]+;/gi, m => map[m] || m);
}
function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function useKey(handler){
  const ref=useRef(handler); ref.current=handler;
  useEffect(()=>{
    const fn=e=>ref.current(e);
    window.addEventListener("keydown",fn);
    return ()=>window.removeEventListener("keydown",fn);
  },[]);
}

/* ----------------------------------------------------------------------------
   6b. PERSISTENCE + SPACED-REPETITION (SM-2) + STREAK ENGINE
   All state lives in localStorage under a single versioned key.
---------------------------------------------------------------------------- */
const LS_KEY="liyadeck.v1";

/* Local YYYY-MM-DD (avoids UTC off-by-one) */
function todayStr(d=new Date()){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function addDays(str,n){
  const [y,m,d]=str.split("-").map(Number);
  const dt=new Date(y,m-1,d); dt.setDate(dt.getDate()+n);
  return todayStr(dt);
}
function daysBetween(a,b){ // b - a, in whole days
  const [ay,am,ad]=a.split("-").map(Number), [by,bm,bd]=b.split("-").map(Number);
  return Math.round((Date.UTC(by,bm-1,bd)-Date.UTC(ay,am-1,ad))/86400000);
}

/* SM-2 scheduler. quality 0..5. Returns the next review record. */
function sm2(prev, quality){
  let ease = prev?.ease ?? 2.5;
  let interval = prev?.interval ?? 0;
  let reps = prev?.reps ?? 0;
  let lapses = prev?.lapses ?? 0;
  if(quality < 3){
    reps = 0; interval = 1; lapses += 1;
  } else {
    reps += 1;
    if(reps===1) interval = 1;
    else if(reps===2) interval = 3;
    else interval = Math.round(interval * ease);
  }
  ease = Math.max(1.3, ease + (0.1 - (5-quality)*(0.08+(5-quality)*0.02)));
  const today = todayStr();
  return {
    ease:+ease.toFixed(2), interval, reps, lapses,
    due: addDays(today, interval), last: today,
  };
}
/* Confidence-button (0 knew, 1 shaky, 2 no-idea) → SM-2 quality */
const GRADE_Q=[5,3,1];

/* Load / save the whole app state blob */
function loadState(){
  try{ return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
  catch{ return {}; }
}
function saveState(patch){
  try{
    const cur=loadState();
    const next={...cur,...patch};
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    return next;
  }catch{ return null; }
}

/* A persistent piece of state backed by the shared blob (Sets stored as arrays) */
function usePersistent(key, initial, {isSet=false}={}){
  const [val,setVal]=useState(()=>{
    const s=loadState();
    if(!(key in s)) return initial;
    return isSet ? new Set(s[key]) : s[key];
  });
  const set=useCallback((updater)=>{
    setVal(prev=>{
      const next = typeof updater==="function" ? updater(prev) : updater;
      saveState({[key]: isSet ? [...next] : next});
      return next;
    });
  },[key,isSet]);
  return [val,set];
}

/* Given all cards + srs map + limits, compute today's review queue */
function buildDueDeck(cards, srs, dailyNew=15){
  const today=todayStr();
  const review=[], fresh=[];
  for(const c of cards){
    const rec=srs[c.id];
    if(rec){ if(rec.due<=today) review.push(c); }
    else fresh.push(c);
  }
  return { review, fresh: fresh.slice(0,dailyNew), all:[...review, ...shuffle(fresh).slice(0,dailyNew)] };
}

/* Randomize choice order so the answer isn't always "A". Keeps exp aligned. */
function shuffleChoices(card){
  if(!Array.isArray(card.choices)) return card;
  const perm=shuffle(card.choices.map((_,i)=>i));
  return {
    ...card,
    choices: perm.map(i=>card.choices[i]),
    exp: Array.isArray(card.exp)? perm.map(i=>card.exp[i]) : card.exp,
    answer: perm.indexOf(card.answer),
  };
}

/* Confetti of falling petals for celebrations */
function PetalRain({ count=26 }){
  const petals=useMemo(()=>Array.from({length:count},(_,i)=>({
    left:Math.random()*100, delay:Math.random()*1.2, dur:2.4+Math.random()*2,
    size:10+Math.random()*14, color:[C.rose,C.roseDeep,C.petal,C.gold,C.leaf][i%5],
  })),[count]);
  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:5}}>
      {petals.map((p,i)=>(
        <div key={i} style={{position:"absolute",top:0,left:p.left+"%",
          animation:`mdFall ${p.dur}s linear ${p.delay}s infinite`}}>
          <Flower size={p.size} color={p.color}/>
        </div>
      ))}
    </div>
  );
}

/* Shared chips */
function SectionChip({ s, small }){
  const info=SECTIONS[s]||{};
  return <span className="md-chip" style={{background:info.soft,color:info.color,
    fontSize:small?".62rem":".72rem"}}>{info.emoji} {info.short}</span>;
}
function DiffChip({ d }){
  const info=DIFFS[d]||{};
  return <span className="md-chip" style={{background:"var(--card)",border:`1.5px solid ${info.color}`,
    color:info.color}}>{info.emoji} {info.label}</span>;
}

/* A growing-vine progress bar: filled track + a bloom at the leading tip */
function VineProgress({ done, total }){
  const pct = total ? Math.min(100,(done/total)*100) : 0;
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,width:"100%"}}>
      <div style={{flex:1,height:12,background:"var(--track2)",borderRadius:99,position:"relative",overflow:"visible"}}>
        <div style={{position:"absolute",inset:0,width:pct+"%",borderRadius:99,
          background:"linear-gradient(90deg,#8fd6b0,#5fb98a 60%,#3f9a6c)",
          transition:"width .5s cubic-bezier(.4,1,.3,1)"}}/>
        <div style={{position:"absolute",top:"50%",left:pct+"%",transform:"translate(-55%,-50%)",
          transition:"left .5s cubic-bezier(.4,1,.3,1)"}}>
          <Flower size={22} sway color={C.roseDeep} center="#fff6d8"/>
        </div>
      </div>
      <span style={{fontSize:".8rem",fontWeight:700,color:"var(--on-bg-soft)",minWidth:44,textAlign:"right"}}>{done}/{total}</span>
    </div>
  );
}

function TopBar({ title, subtitle, onExit, right }){
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,flexWrap:"wrap"}}>
      <button className="md-btn ghost mini" onClick={onExit}>← Garden</button>
      <div style={{flex:1,minWidth:120}}>
        <div className="md-serif" style={{fontSize:"1.25rem",fontWeight:600,lineHeight:1.1,color:"var(--on-bg)"}}>{title}</div>
        {subtitle && <div style={{fontSize:".78rem",color:"var(--on-bg-soft)"}}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

/* Star / bookmark toggle */
function StarBtn({ on, onClick }){
  return (
    <button onClick={onClick} title="Save to Weak Spots"
      className="md-btn" style={{background:on?"#fff3d6":"var(--card)",border:`2px solid ${on?C.gold:C.line}`,
      color:on?"#c78a12":C.plumSoft,padding:"8px 12px",borderRadius:12,fontWeight:700,fontSize:".85rem"}}>
      {on?"★ Saved":"☆ Save"}
    </button>
  );
}

/* ============================================================================
   7a. FLASHCARD MODE
   ============================================================================ */
function FlashcardMode({ deck, onExit, onBloom, starred, toggleStar }){
  const [i,setI]=useState(0);
  const [flipped,setFlipped]=useState(false);
  const [seen,setSeen]=useState(()=>new Set());
  const q=deck[i];

  const go=useCallback((d)=>{
    setFlipped(false);
    setTimeout(()=>setI(v=>Math.max(0,Math.min(deck.length-1,v+d))),120);
  },[deck.length]);

  const flip=useCallback(()=>{
    setFlipped(f=>{
      if(!f && q && !seen.has(q.id)){ setSeen(s=>new Set(s).add(q.id)); onBloom&&onBloom(1); }
      return !f;
    });
  },[q,seen,onBloom]);

  useKey(e=>{
    if(e.code==="Space"){ e.preventDefault(); flip(); }
    else if(e.key==="ArrowRight") go(1);
    else if(e.key==="ArrowLeft") go(-1);
    else if(e.key.toLowerCase()==="s" && q) toggleStar(q.id);
  });

  if(!q) return null;
  return (
    <div className="md-fadein">
      <TopBar title="Flashcards" subtitle="Space to flip · ← → to navigate · S to save" onExit={onExit}
        right={<StarBtn on={starred.has(q.id)} onClick={()=>toggleStar(q.id)}/>}/>
      <div style={{marginBottom:14}}><VineProgress done={i+1} total={deck.length}/></div>

      <div className={"md-flip"+(flipped?" flipped":"")} style={{height:"min(70vh,540px)"}}>
        <div className="md-flip-inner" style={{height:"100%"}}>
          {/* FRONT */}
          <div className="md-face md-card" style={{padding:"22px 22px",cursor:"pointer",overflow:"auto"}} onClick={flip}>
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
              <SectionChip s={q.section}/><DiffChip d={q.difficulty}/>
              <span className="md-chip" style={{background:"var(--card)",color:C.plumSoft,border:"1px solid "+C.line}}>{q.topic}</span>
            </div>
            <div className="md-serif" style={{fontSize:"1.32rem",lineHeight:1.4,color:C.ink,fontWeight:500}}>{q.q}</div>
            {q.dia && <div style={{marginTop:16}}><Diagram dkey={q.dia}/></div>}
            <div style={{marginTop:"auto",paddingTop:18,textAlign:"center",color:C.rose,fontWeight:600,fontSize:".85rem"}}>
              🌸 tap to reveal the answer
            </div>
          </div>
          {/* BACK */}
          <div className="md-face back md-card" style={{padding:"22px 22px",cursor:"pointer",overflow:"auto",
            background:"linear-gradient(180deg,var(--card),var(--card-2))"}} onClick={flip}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <Flower size={22} color={C.leaf} center={C.gold}/>
              <span style={{fontWeight:700,color:C.leafDeep,fontSize:".8rem",letterSpacing:".04em",textTransform:"uppercase"}}>Answer</span>
            </div>
            <div style={{fontWeight:700,fontSize:"1.08rem",color:C.leafDeep,marginBottom:10}}>
              {q.choices[q.answer]}
            </div>
            <div style={{fontSize:".95rem",lineHeight:1.55,color:C.ink,marginBottom:12}}>
              {q.exp[q.answer]}
            </div>
            <div style={{background:"var(--card-2)",border:"1px solid "+C.line,borderRadius:14,padding:"12px 14px"}}>
              <div style={{fontSize:".7rem",fontWeight:700,color:C.roseDeep,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>🩺 Clinical anchor</div>
              <div style={{fontSize:".9rem",lineHeight:1.5,color:C.plum}}>{q.clinical}</div>
            </div>
            {q.baby && (
              <div style={{marginTop:10,background:"var(--card-2)",border:"1.5px dashed "+C.rose,borderRadius:14,padding:"12px 14px"}}>
                <div style={{fontSize:".7rem",fontWeight:700,color:C.roseDeep,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>🧸 Explain like I'm 5 · Claude's take</div>
                <div style={{fontSize:".92rem",lineHeight:1.55,color:C.ink,fontStyle:"italic"}}>{q.baby}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",gap:10,marginTop:16}}>
        <button className="md-btn ghost" onClick={()=>go(-1)} disabled={i===0}>← Previous</button>
        <button className="md-btn primary" onClick={flip}>{flipped?"Show question":"Flip card"}</button>
        <button className="md-btn ghost" onClick={()=>go(1)} disabled={i===deck.length-1}>Next →</button>
      </div>
    </div>
  );
}

/* ============================================================================
   7b. QUIZ MODE
   ============================================================================ */
function QuizMode({ deck, onExit, onBloom, onWeak, onGrade, starred, toggleStar }){
  const [i,setI]=useState(0);
  const [picked,setPicked]=useState(null);
  const [log,setLog]=useState([]);           // {section,difficulty,correct}
  const [done,setDone]=useState(false);
  const q=deck[i];

  function choose(idx){
    if(picked!==null) return;
    setPicked(idx);
    const correct = idx===q.answer;
    if(correct) onBloom&&onBloom(1); else onWeak&&onWeak(q.id);
    onGrade&&onGrade(q, correct?4:1);
    setLog(l=>[...l,{section:q.section,difficulty:q.difficulty,correct}]);
  }
  function next(){
    if(i+1>=deck.length){ setDone(true); return; }
    setPicked(null); setI(i+1);
  }
  useKey(e=>{
    if(done) return;
    if(picked===null && ["1","2","3","4"].includes(e.key)) choose(Number(e.key)-1);
    else if(picked!==null && (e.key==="Enter"||e.code==="Space")){ e.preventDefault(); next(); }
  });

  if(done) return <ResultsScreen log={log} deck={deck} onExit={onExit}/>;
  if(!q) return null;
  const score=log.filter(l=>l.correct).length;

  return (
    <div className="md-fadein">
      <TopBar title="Quiz" subtitle={`Score ${score}/${log.length}`} onExit={onExit}
        right={<StarBtn on={starred.has(q.id)} onClick={()=>toggleStar(q.id)}/>}/>
      <div style={{marginBottom:14}}><VineProgress done={i+(picked!==null?1:0)} total={deck.length}/></div>

      <div className="md-card md-pop" style={{padding:"22px"}}>
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <SectionChip s={q.section}/><DiffChip d={q.difficulty}/>
          <span className="md-chip" style={{background:"var(--card)",color:C.plumSoft,border:"1px solid "+C.line}}>{q.topic}</span>
        </div>
        <div className="md-serif" style={{fontSize:"1.24rem",lineHeight:1.4,marginBottom:12}}>{q.q}</div>
        {q.dia && <Diagram dkey={q.dia}/>}

        <div style={{display:"grid",gap:10,marginTop:14}}>
          {q.choices.map((c,idx)=>{
            const isCorrect=idx===q.answer, isPicked=idx===picked;
            let bg="var(--card)",bd=C.line,col=C.ink,badge=String.fromCharCode(65+idx);
            if(picked!==null){
              if(isCorrect){ bg="var(--good-bg)"; bd=C.leaf; col=C.leafDeep; }
              else if(isPicked){ bg="var(--bad-bg)"; bd=C.coral; col="var(--bad-ink)"; }
              else { bg="var(--muted)"; }
            }
            return (
              <button key={idx} onClick={()=>choose(idx)} disabled={picked!==null}
                className="md-btn" style={{textAlign:"left",background:bg,border:`2px solid ${bd}`,
                color:col,padding:"13px 15px",borderRadius:16,display:"flex",gap:12,alignItems:"flex-start",
                cursor:picked!==null?"default":"pointer",fontWeight:500,fontSize:".98rem",lineHeight:1.4}}>
                <span style={{fontWeight:800,minWidth:20,color:picked!==null&&isCorrect?C.leafDeep:(isPicked?C.coral:C.rose)}}>{picked!==null&&isCorrect?"✓":(isPicked&&!isCorrect?"✗":badge)}</span>
                <span style={{flex:1}}>{c}</span>
              </button>
            );
          })}
        </div>

        {picked!==null && (
          <div className="md-fadein" style={{marginTop:16}}>
            <div style={{fontWeight:800,color:picked===q.answer?C.leafDeep:C.coral,fontSize:"1.05rem",marginBottom:10}}>
              {picked===q.answer?"🌷 Correct — a petal blooms!":"🥀 Not quite — saved to Weak Spots"}
            </div>
            <div style={{display:"grid",gap:8}}>
              {q.choices.map((c,idx)=>(
                <div key={idx} style={{fontSize:".88rem",lineHeight:1.5,padding:"9px 12px",borderRadius:12,
                  background:idx===q.answer?"var(--good-bg)":"var(--card-2)",border:"1px solid "+(idx===q.answer?"#c8ecd5":C.line)}}>
                  <b style={{color:idx===q.answer?C.leafDeep:C.plum}}>{String.fromCharCode(65+idx)}. </b>
                  <span style={{color:C.ink}}>{q.exp[idx]}</span>
                </div>
              ))}
            </div>
            <div style={{background:"var(--card-2)",border:"1px solid "+C.line,borderRadius:14,padding:"12px 14px",marginTop:12}}>
              <div style={{fontSize:".7rem",fontWeight:700,color:C.roseDeep,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>🩺 Clinical anchor</div>
              <div style={{fontSize:".9rem",lineHeight:1.5,color:C.plum}}>{q.clinical}</div>
            </div>
            {q.baby && (
              <div style={{marginTop:10,background:"var(--card-2)",border:"1.5px dashed "+C.rose,borderRadius:14,padding:"12px 14px"}}>
                <div style={{fontSize:".7rem",fontWeight:700,color:C.roseDeep,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>🧸 Explain like I'm 5 · Claude's take</div>
                <div style={{fontSize:".92rem",lineHeight:1.55,color:C.ink,fontStyle:"italic"}}>{q.baby}</div>
              </div>
            )}
            <div style={{textAlign:"right",marginTop:14}}>
              <button className="md-btn primary" onClick={next}>{i+1>=deck.length?"See bouquet →":"Next question →"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Results / bouquet breakdown */
function ResultsScreen({ log, deck, onExit }){
  const total=log.length, correct=log.filter(l=>l.correct).length;
  const pct=total?Math.round(correct/total*100):0;
  const bySection={}, byDiff={};
  log.forEach(l=>{
    (bySection[l.section]=bySection[l.section]||{c:0,t:0}); bySection[l.section].t++; if(l.correct)bySection[l.section].c++;
    (byDiff[l.difficulty]=byDiff[l.difficulty]||{c:0,t:0}); byDiff[l.difficulty].t++; if(l.correct)byDiff[l.difficulty].c++;
  });
  const msg = pct>=85?"Your garden is in full bloom! 🌸":pct>=60?"Lovely growth — a few buds to tend. 🌱":"Every gardener starts with seeds. Keep tending. 🌧️";
  return (
    <div className="md-fadein" style={{position:"relative"}}>
      {pct>=60 && <PetalRain count={pct>=85?34:20}/>}
      <TopBar title="Session bouquet" onExit={onExit}/>
      <div className="md-card md-pop" style={{padding:"26px",textAlign:"center",position:"relative",zIndex:6}}>
        <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:8}}>
          {Array.from({length:5}).map((_,k)=><Flower key={k} size={30} sway
            color={k<Math.round(pct/20)?C.roseDeep:"#f0d6e2"} center={k<Math.round(pct/20)?C.gold:"#fff"}/>)}
        </div>
        <div className="md-serif" style={{fontSize:"2.6rem",fontWeight:600,color:C.roseDeep}}>{pct}%</div>
        <div style={{color:C.plum,fontWeight:600,marginBottom:4}}>{correct} of {total} correct</div>
        <div style={{color:C.plumSoft,marginBottom:20}}>{msg}</div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,textAlign:"left",maxWidth:560,margin:"0 auto"}}>
          <div>
            <div style={{fontWeight:700,color:C.plum,marginBottom:8,fontSize:".9rem"}}>By section</div>
            {Object.keys(bySection).map(s=>{
              const {c,t}=bySection[s]; const p=Math.round(c/t*100);
              return <BreakdownRow key={s} label={SECTIONS[s].short} color={SECTIONS[s].color} c={c} t={t} p={p}/>;
            })}
          </div>
          <div>
            <div style={{fontWeight:700,color:C.plum,marginBottom:8,fontSize:".9rem"}}>By difficulty</div>
            {Object.keys(byDiff).map(d=>{
              const {c,t}=byDiff[d]; const p=Math.round(c/t*100);
              return <BreakdownRow key={d} label={DIFFS[d].label} color={DIFFS[d].color} c={c} t={t} p={p}/>;
            })}
          </div>
        </div>
        <button className="md-btn primary" style={{marginTop:22}} onClick={onExit}>Back to Garden 🌿</button>
      </div>
    </div>
  );
}
function BreakdownRow({ label, color, c, t, p }){
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:".82rem",marginBottom:4}}>
        <span style={{fontWeight:600,color:C.ink}}>{label}</span><span style={{color:C.plumSoft}}>{c}/{t}</span>
      </div>
      <div style={{height:8,background:"var(--track)",borderRadius:99,overflow:"hidden"}}>
        <div style={{width:p+"%",height:"100%",background:color,borderRadius:99,transition:"width .6s"}}/>
      </div>
    </div>
  );
}

/* ============================================================================
   7c. MATCH GAME  — term ↔ definition tiles, timer, win screen
   ============================================================================ */
function MatchMode({ sections, onExit, onBloom }){
  const N=6;
  const [round,setRound]=useState(0); // reshuffle key
  const pairs=useMemo(()=>{
    const pool=MATCH_PAIRS.filter(p=>sections.length===0||sections.includes(p.section));
    return shuffle(pool.length>=N?pool:MATCH_PAIRS).slice(0,N);
  },[sections,round]);
  const terms=useMemo(()=>shuffle(pairs.map((p,idx)=>({...p,idx}))),[pairs]);
  const defs=useMemo(()=>shuffle(pairs.map((p,idx)=>({...p,idx}))),[pairs]);

  const [selTerm,setSelTerm]=useState(null);
  const [selDef,setSelDef]=useState(null);
  const [matched,setMatched]=useState(()=>new Set());
  const [wrong,setWrong]=useState(null);
  const [t,setT]=useState(0);
  const [running,setRunning]=useState(true);

  useEffect(()=>{ if(!running) return; const id=setInterval(()=>setT(v=>v+1),1000); return ()=>clearInterval(id); },[running]);
  useEffect(()=>{ // reset on new round
    setSelTerm(null);setSelDef(null);setMatched(new Set());setWrong(null);setT(0);setRunning(true);
  },[round]);

  const won = matched.size===pairs.length && pairs.length>0;
  useEffect(()=>{ if(won){ setRunning(false); onBloom&&onBloom(pairs.length); } },[won]);

  function tryMatch(termIdx,defIdx){
    if(termIdx===defIdx){
      setMatched(m=>new Set(m).add(termIdx)); setSelTerm(null); setSelDef(null);
    } else {
      setWrong({termIdx,defIdx}); setTimeout(()=>{ setWrong(null); setSelTerm(null); setSelDef(null); },550);
    }
  }
  function pickTerm(idx){ if(matched.has(idx))return; setSelTerm(idx); if(selDef!==null) tryMatch(idx,selDef); }
  function pickDef(idx){ if(matched.has(idx))return; setSelDef(idx); if(selTerm!==null) tryMatch(selTerm,idx); }

  const mm=String(Math.floor(t/60)).padStart(2,"0"), ss=String(t%60).padStart(2,"0");

  return (
    <div className="md-fadein" style={{position:"relative"}}>
      {won && <PetalRain count={30}/>}
      <TopBar title="Match Garden" subtitle="Pair each term with its definition"
        onExit={onExit}
        right={<span className="md-chip" style={{background:"var(--card)",border:"1px solid "+C.line,color:C.plum,fontSize:".85rem"}}>⏱ {mm}:{ss}</span>}/>

      {won ? (
        <div className="md-card md-pop" style={{padding:"30px",textAlign:"center",position:"relative",zIndex:6}}>
          <div style={{display:"flex",justifyContent:"center",gap:2,marginBottom:8}}>
            {pairs.map((_,k)=><Flower key={k} size={30} sway color={[C.rose,C.roseDeep,C.leaf,C.gold][k%4]} center="#fff"/>)}
          </div>
          <div className="md-serif" style={{fontSize:"1.7rem",color:C.roseDeep,fontWeight:600}}>Full bloom! 🌷</div>
          <div style={{color:C.plum,margin:"6px 0 18px"}}>All {pairs.length} pairs matched in <b>{mm}:{ss}</b></div>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="md-btn primary" onClick={()=>setRound(r=>r+1)}>Plant a new round 🌱</button>
            <button className="md-btn ghost" onClick={onExit}>Back to Garden</button>
          </div>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{display:"grid",gap:10}}>
            <div style={{fontSize:".72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:C.roseDeep}}>Terms</div>
            {terms.map(tm=>{
              const m=matched.has(tm.idx), sel=selTerm===tm.idx, bad=wrong&&wrong.termIdx===tm.idx;
              return <Tile key={"t"+tm.idx} text={tm.term} matched={m} selected={sel} bad={bad}
                onClick={()=>pickTerm(tm.idx)} bold/>;
            })}
          </div>
          <div style={{display:"grid",gap:10}}>
            <div style={{fontSize:".72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:C.leafDeep}}>Definitions</div>
            {defs.map(df=>{
              const m=matched.has(df.idx), sel=selDef===df.idx, bad=wrong&&wrong.defIdx===df.idx;
              return <Tile key={"d"+df.idx} text={df.def} matched={m} selected={sel} bad={bad}
                onClick={()=>pickDef(df.idx)}/>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
function Tile({ text, matched, selected, bad, onClick, bold }){
  let bg="var(--card)",bd=C.line,col=C.ink,op=1;
  if(matched){ bg="var(--good-bg)"; bd="#bfe9cf"; col=C.leafDeep; op=.55; }
  else if(bad){ bg="var(--bad-bg)"; bd=C.coral; col="var(--bad-ink)"; }
  else if(selected){ bg="var(--card-2)"; bd=C.roseDeep; col=C.roseDeep; }
  return (
    <button onClick={onClick} disabled={matched} className="md-btn"
      style={{textAlign:"left",background:bg,border:`2px solid ${bd}`,color:col,opacity:op,
      padding:"13px 14px",borderRadius:16,fontWeight:bold?700:500,fontSize:".9rem",lineHeight:1.35,
      minHeight:56,display:"flex",alignItems:"center",gap:8,transition:"all .2s",
      cursor:matched?"default":"pointer"}}>
      {matched && <span>🌸</span>}<span>{text}</span>
    </button>
  );
}

/* ============================================================================
   7d. TRIAGE MODE — confidence-sort spaced repetition
   Rate 'Knew it / Shaky / No idea' → answer reveals → Shaky/No-idea recycle
   until rated 'Knew it'. Feeds Weak Spots.
   ============================================================================ */
function TriageMode({ deck, onExit, onBloom, onWeak, onGrade }){
  const [queue,setQueue]=useState(()=>deck.map(q=>q.id));
  const [phase,setPhase]=useState("rate"); // rate → reveal
  const [rating,setRating]=useState(null);
  const [mastered,setMastered]=useState(()=>new Set());
  const [rounds,setRounds]=useState(0);
  const byId=useMemo(()=>Object.fromEntries(deck.map(q=>[q.id,q])),[deck]);
  const q = queue.length? byId[queue[0]] : null;

  function rate(level){ // 0 knew, 1 shaky, 2 noidea
    setRating(level); setPhase("reveal");
    if(level===0){ setMastered(m=>new Set(m).add(q.id)); onBloom&&onBloom(1); }
    else onWeak&&onWeak(q.id);
    onGrade&&onGrade(q, GRADE_Q[level]);
  }
  function advance(){
    setPhase("rate"); setRating(null);
    setQueue(prev=>{
      const [head,...rest]=prev;
      if(rating===0) return rest;               // mastered → drop
      setRounds(r=>r+1);
      return [...rest,head];                     // recycle to back
    });
  }
  useKey(e=>{
    if(phase==="rate"){ if(e.key==="1")rate(0); else if(e.key==="2")rate(1); else if(e.key==="3")rate(2); }
    else if(e.key==="Enter"||e.code==="Space"){ e.preventDefault(); advance(); }
  });

  if(!q){
    return (
      <div className="md-fadein" style={{position:"relative"}}>
        <PetalRain count={30}/>
        <TopBar title="Triage" onExit={onExit}/>
        <div className="md-card md-pop" style={{padding:"32px",textAlign:"center",position:"relative",zIndex:6}}>
          <Flower size={48} sway color={C.roseDeep} center={C.gold}/>
          <div className="md-serif" style={{fontSize:"1.6rem",color:C.roseDeep,fontWeight:600,marginTop:10}}>Every card mastered 🌼</div>
          <div style={{color:C.plum,margin:"6px 0 18px"}}>You cycled through until each one felt solid. That's real retention.</div>
          <button className="md-btn primary" onClick={onExit}>Back to Garden 🌿</button>
        </div>
      </div>
    );
  }
  const RATINGS=[
    {lvl:0,label:"Knew it",emoji:"🌸",col:C.leafDeep,bg:"var(--good-bg)",bd:"#bfe9cf"},
    {lvl:1,label:"Shaky",emoji:"🌱",col:"#c78a12",bg:"#fff6e2",bd:"#f2d98a"},
    {lvl:2,label:"No idea",emoji:"🌧️",col:C.coral,bg:"var(--bad-bg)",bd:"#f6b6b0"},
  ];
  return (
    <div className="md-fadein">
      <TopBar title="Triage" subtitle={`${mastered.size} mastered · ${queue.length} in the bed`} onExit={onExit}/>
      <div style={{marginBottom:14}}><VineProgress done={mastered.size} total={mastered.size+queue.length}/></div>

      <div className="md-card md-pop" style={{padding:"22px"}}>
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <SectionChip s={q.section}/><DiffChip d={q.difficulty}/>
          <span className="md-chip" style={{background:"var(--card)",color:C.plumSoft,border:"1px solid "+C.line}}>{q.topic}</span>
        </div>
        <div className="md-serif" style={{fontSize:"1.26rem",lineHeight:1.4,marginBottom:12}}>{q.q}</div>
        {q.dia && <Diagram dkey={q.dia}/>}

        {phase==="rate" ? (
          <>
            <div style={{textAlign:"center",color:C.plumSoft,fontSize:".85rem",margin:"16px 0 10px"}}>
              How confident are you? (rate before revealing — keys 1·2·3)
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {RATINGS.map(r=>(
                <button key={r.lvl} className="md-btn" onClick={()=>rate(r.lvl)}
                  style={{background:r.bg,border:`2px solid ${r.bd}`,color:r.col,padding:"16px 8px",
                  borderRadius:16,fontWeight:700,display:"flex",flexDirection:"column",gap:4,alignItems:"center"}}>
                  <span style={{fontSize:"1.5rem"}}>{r.emoji}</span>{r.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="md-fadein" style={{marginTop:12}}>
            <div style={{fontWeight:800,color:C.leafDeep,fontSize:"1.02rem",marginBottom:8}}>
              ✓ {q.choices[q.answer]}
            </div>
            <div style={{fontSize:".93rem",lineHeight:1.55,color:C.ink,marginBottom:12}}>{q.exp[q.answer]}</div>
            <div style={{background:"var(--card-2)",border:"1px solid "+C.line,borderRadius:14,padding:"12px 14px",marginBottom:14}}>
              <div style={{fontSize:".7rem",fontWeight:700,color:C.roseDeep,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>🩺 Clinical anchor</div>
              <div style={{fontSize:".9rem",lineHeight:1.5,color:C.plum}}>{q.clinical}</div>
            </div>
            <div style={{textAlign:"center",fontSize:".82rem",color:C.plumSoft,marginBottom:10}}>
              {rating===0?"Nice — this bloom leaves the bed. 🌸":"This one recycles until it's second nature. 🌱"}
            </div>
            <div style={{textAlign:"right"}}>
              <button className="md-btn primary" onClick={advance}>Continue →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   7f. DAILY 5 — five low-stakes cards from your own bank (replaces trivia)
   ============================================================================ */
function DailyFive({ deck, onExit, onBloom, onGrade, starred, toggleStar }){
  const [i,setI]=useState(0);
  const [picked,setPicked]=useState(null);
  const [score,setScore]=useState(0);
  const q=deck[i];

  function choose(idx){
    if(picked!==null||!q) return;
    setPicked(idx);
    const correct=idx===q.answer;
    if(correct){ setScore(s=>s+1); onBloom&&onBloom(1); }
    onGrade&&onGrade(q, correct?4:1);
  }
  function next(){ setPicked(null); setI(v=>v+1); }
  useKey(e=>{
    if(picked===null && ["1","2","3","4"].includes(e.key)) choose(Number(e.key)-1);
    else if(picked!==null && (e.key==="Enter"||e.code==="Space")){ e.preventDefault(); next(); }
  });

  if(!q && i===0){
    return (
      <div className="md-fadein">
        <TopBar title="Daily 5" onExit={onExit}/>
        <div className="md-card" style={{padding:"36px",textAlign:"center"}}>
          <Flower size={40} sway color={C.rose} center={C.gold}/>
          <div style={{color:C.plum,marginTop:12,fontWeight:600}}>No cards available yet — pick a section on the garden screen. 🌱</div>
        </div>
      </div>
    );
  }
  if(i>=deck.length){
    return (
      <div className="md-fadein" style={{position:"relative"}}>
        {score>=3 && <PetalRain count={18}/>}
        <TopBar title="Daily 5" onExit={onExit}/>
        <div className="md-card md-pop" style={{padding:"30px",textAlign:"center",position:"relative",zIndex:6}}>
          <Flower size={44} sway color={C.roseDeep} center={C.gold}/>
          <div className="md-serif" style={{fontSize:"1.5rem",color:C.roseDeep,fontWeight:600,marginTop:8}}>Warmed up!</div>
          <div style={{color:C.plum,margin:"6px 0 16px"}}>{score}/{deck.length} — and every one counted toward your review. 🌸</div>
          <button className="md-btn primary" onClick={onExit}>Back to Garden</button>
        </div>
      </div>
    );
  }
  return (
    <div className="md-fadein">
      <TopBar title="Daily 5" subtitle={`A gentle warm-up · ${i+1} of ${deck.length}`} onExit={onExit}
        right={<StarBtn on={starred.has(q.id)} onClick={()=>toggleStar(q.id)}/>}/>
      <div style={{marginBottom:14}}><VineProgress done={i} total={deck.length}/></div>
      <div className="md-card md-pop" style={{padding:"22px"}}>
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <SectionChip s={q.section}/><span className="md-chip" style={{background:"var(--card)",color:C.plumSoft,border:"1px solid "+C.line}}>{q.topic}</span>
        </div>
        <div className="md-serif" style={{fontSize:"1.2rem",lineHeight:1.4,marginBottom:16}}>{q.q}</div>
        {q.dia && <Diagram dkey={q.dia}/>}
        <div style={{display:"grid",gap:10,marginTop:8}}>
          {q.choices.map((c,idx)=>{
            const isC=idx===q.answer, isP=idx===picked; let bg="var(--card)",bd=C.line,col=C.ink;
            if(picked!==null){ if(isC){bg="var(--good-bg)";bd=C.leaf;col=C.leafDeep;} else if(isP){bg="var(--bad-bg)";bd=C.coral;col="var(--bad-ink)";} else bg="var(--muted)"; }
            return <button key={idx} className="md-btn" onClick={()=>choose(idx)} disabled={picked!==null}
              style={{textAlign:"left",background:bg,border:`2px solid ${bd}`,color:col,padding:"12px 15px",
              borderRadius:14,fontWeight:500,cursor:picked!==null?"default":"pointer"}}>{c}</button>;
          })}
        </div>
        {picked!==null && (
          <div className="md-fadein" style={{marginTop:14}}>
            <div style={{fontSize:".9rem",lineHeight:1.55,color:C.ink,background:"var(--card-2)",border:"1px solid "+C.line,borderRadius:12,padding:"11px 13px"}}>{q.exp[q.answer]}</div>
            <div style={{textAlign:"right",marginTop:14}}>
              <button className="md-btn primary" onClick={next}>{i+1>=deck.length?"Finish →":"Next →"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   7g. CARD CREATOR — author your own cards into the SRS queue
   ============================================================================ */
function CardCreator({ onExit, onSave, custom, onDelete }){
  const [section,setSection]=useState("BB");
  const [difficulty,setDifficulty]=useState("medium");
  const [topic,setTopic]=useState("");
  const [q,setQ]=useState("");
  const [choices,setChoices]=useState(["","","",""]);
  const [answer,setAnswer]=useState(0);
  const [exp,setExp]=useState("");
  const [clinical,setClinical]=useState("");
  const [flash,setFlash]=useState(false);

  const valid = q.trim() && choices.filter(c=>c.trim()).length>=2 && choices[answer]?.trim();
  const input={width:"100%",padding:"11px 13px",borderRadius:12,border:"2px solid "+C.line,
    fontFamily:"inherit",fontSize:".95rem",color:C.ink,background:"var(--card)",outline:"none"};
  const lbl={fontSize:".72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:C.plumSoft,marginBottom:6,display:"block"};

  function save(){
    if(!valid) return;
    const cleanChoices=choices.map(c=>c.trim()).filter(Boolean);
    const ans=Math.min(answer,cleanChoices.length-1);
    const card={
      id:"u_"+Date.now().toString(36),
      section, difficulty, topic:topic.trim()||"My cards", dia:null,
      q:q.trim(), choices:cleanChoices, answer:ans,
      exp:cleanChoices.map((_,i)=>i===ans?(exp.trim()||"This is the correct answer."):"Not the best choice here."),
      clinical:clinical.trim()||"Your own card — review it until it blooms. 🌸",
    };
    onSave(card);
    setTopic("");setQ("");setChoices(["","","",""]);setAnswer(0);setExp("");setClinical("");
    setFlash(true); setTimeout(()=>setFlash(false),1600);
  }

  return (
    <div className="md-fadein">
      <TopBar title="Plant a card" subtitle="Add your own question — it flows into your spaced-repetition queue" onExit={onExit}/>
      <div className="md-card" style={{padding:"22px"}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
          <div style={{flex:1,minWidth:150}}>
            <label style={lbl}>Section</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {Object.values(SECTIONS).map(s=>(
                <Toggle key={s.key} active={section===s.key} color={s.color} soft={s.soft} onClick={()=>setSection(s.key)}>{s.emoji} {s.short}</Toggle>
              ))}
            </div>
          </div>
          <div style={{flex:1,minWidth:150}}>
            <label style={lbl}>Difficulty</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {Object.entries(DIFFS).map(([k,d])=>(
                <Toggle key={k} active={difficulty===k} color={d.color} soft={d.color+"22"} onClick={()=>setDifficulty(k)}>{d.emoji} {d.label}</Toggle>
              ))}
            </div>
          </div>
        </div>

        <div style={{marginBottom:14}}>
          <label style={lbl}>Topic (optional)</label>
          <input style={input} value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Amino acids"/>
        </div>
        <div style={{marginBottom:14}}>
          <label style={lbl}>Question</label>
          <textarea style={{...input,minHeight:70,resize:"vertical"}} value={q} onChange={e=>setQ(e.target.value)} placeholder="What do you want to remember?"/>
        </div>

        <label style={lbl}>Answer choices — tap the ✓ to mark the correct one</label>
        <div style={{display:"grid",gap:8,marginBottom:14}}>
          {choices.map((c,idx)=>(
            <div key={idx} style={{display:"flex",gap:8,alignItems:"center"}}>
              <button className="md-btn" onClick={()=>setAnswer(idx)} title="Mark correct"
                style={{width:38,height:38,borderRadius:10,flexShrink:0,border:`2px solid ${answer===idx?C.leaf:C.line}`,
                background:answer===idx?"var(--good-bg)":"var(--card)",color:answer===idx?C.leafDeep:C.plumSoft,fontWeight:800}}>
                {answer===idx?"✓":String.fromCharCode(65+idx)}
              </button>
              <input style={input} value={c} placeholder={`Choice ${String.fromCharCode(65+idx)}`}
                onChange={e=>setChoices(cs=>cs.map((x,j)=>j===idx?e.target.value:x))}/>
            </div>
          ))}
        </div>
        <div style={{marginBottom:14}}>
          <label style={lbl}>Explanation (optional)</label>
          <textarea style={{...input,minHeight:56,resize:"vertical"}} value={exp} onChange={e=>setExp(e.target.value)} placeholder="Why is that the answer?"/>
        </div>
        <div style={{marginBottom:16}}>
          <label style={lbl}>🩺 Clinical anchor (optional)</label>
          <input style={input} value={clinical} onChange={e=>setClinical(e.target.value)} placeholder="A real-world hook to make it stick"/>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <button className="md-btn primary" onClick={save} disabled={!valid}>🌱 Plant this card</button>
          {flash && <span className="md-fadein" style={{color:C.leafDeep,fontWeight:700}}>Planted! 🌸</span>}
          {!valid && <span style={{fontSize:".8rem",color:C.plumSoft}}>Need a question, a correct choice, and at least 2 options.</span>}
        </div>
      </div>

      {custom.length>0 && (
        <div className="md-card" style={{padding:"18px",marginTop:16}}>
          <div style={{fontWeight:800,color:C.plum,marginBottom:10}}>🪴 Your cards ({custom.length})</div>
          <div style={{display:"grid",gap:8}}>
            {custom.map(c=>(
              <div key={c.id} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 12px",
                border:"1px solid "+C.line,borderRadius:12,background:"var(--card)"}}>
                <SectionChip s={c.section} small/>
                <span style={{flex:1,fontSize:".9rem",color:C.ink,lineHeight:1.35}}>{c.q}</span>
                <button className="md-btn mini ghost" onClick={()=>onDelete(c.id)} style={{color:C.coral,borderColor:"#f6c9c4"}}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   7h. CARS MODE — read a passage, answer AAMC-style reasoning questions
   ============================================================================ */
const CARS_SKILL_COLORS={
  "Comprehension":{c:"#7b6ef0",s:"#e9e6ff"},
  "Within the Text":{c:"#e85a9c",s:"#ffe1ef"},
  "Beyond the Text":{c:"#3f9a6c",s:"#dcf4e7"},
};
function CarsMode({ passages, onExit, onRecord }){
  const [pIdx,setPIdx]=useState(()=>Math.floor(Math.random()*passages.length));
  const [qi,setQi]=useState(0);
  const [picked,setPicked]=useState(null);
  const [score,setScore]=useState(0);
  const [answered,setAnswered]=useState(0);
  const p=passages[pIdx];
  const q=p?.questions[qi];

  function choose(idx){
    if(picked!==null||!q) return;
    setPicked(idx);
    const correct=idx===q.answer;
    if(correct) setScore(s=>s+1);
    setAnswered(a=>a+1);
    onRecord && onRecord(correct);
  }
  function next(){ setPicked(null); setQi(v=>v+1); }
  function newPassage(){
    let n=pIdx; if(passages.length>1){ while(n===pIdx) n=Math.floor(Math.random()*passages.length); }
    setPIdx(n); setQi(0); setPicked(null); setScore(0);
  }
  useKey(e=>{
    if(picked===null && ["1","2","3","4"].includes(e.key)) choose(Number(e.key)-1);
    else if(picked!==null && (e.key==="Enter"||e.code==="Space")){ e.preventDefault(); if(qi+1<p.questions.length) next(); }
  });

  if(!p) return null;
  const done = qi>=p.questions.length;

  return (
    <div className="md-fadein">
      <TopBar title="CARS" subtitle="Critical Analysis & Reasoning · answers come from the passage only" onExit={onExit}
        right={<span className="md-chip" style={{background:"var(--card-2)",border:"1px solid "+C.line,color:C.plum}}>{p.genre}</span>}/>

      {/* Passage */}
      <div className="md-card md-scroll" style={{padding:"20px 22px",marginBottom:14,maxHeight:"42vh",overflow:"auto"}}>
        <div className="md-serif" style={{fontSize:"1.15rem",fontWeight:600,color:C.roseDeep,marginBottom:10}}>{p.title}</div>
        {p.text.map((para,idx)=>(
          <p key={idx} style={{fontSize:".96rem",lineHeight:1.62,color:C.ink,margin:"0 0 12px"}}>{para}</p>
        ))}
      </div>

      {done ? (
        <div className="md-card md-pop" style={{padding:"26px",textAlign:"center",position:"relative"}}>
          {score>=Math.ceil(p.questions.length*0.6) && <PetalRain count={18}/>}
          <div style={{position:"relative",zIndex:6}}>
            <Flower size={42} sway color={C.roseDeep} center={C.gold}/>
            <div className="md-serif" style={{fontSize:"1.5rem",color:C.roseDeep,fontWeight:600,marginTop:8}}>Passage complete</div>
            <div style={{color:C.plum,margin:"6px 0 18px"}}>{score}/{p.questions.length} correct — CARS is a muscle; the reasoning sharpens with reps. 🌸</div>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              {passages.length>1 && <button className="md-btn primary" onClick={newPassage}>Another passage 🌿</button>}
              <button className="md-btn ghost" onClick={onExit}>Back to Garden</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="md-card md-pop" style={{padding:"22px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            <span className="md-chip" style={{background:(CARS_SKILL_COLORS[q.skill]||{}).s,color:(CARS_SKILL_COLORS[q.skill]||{}).c}}>{q.skill}</span>
            <span style={{fontSize:".78rem",color:C.plumSoft,fontWeight:700}}>Q{qi+1} / {p.questions.length}</span>
          </div>
          <div className="md-serif" style={{fontSize:"1.14rem",lineHeight:1.45,marginBottom:14,color:C.ink}}>{q.q}</div>
          <div style={{display:"grid",gap:10}}>
            {q.choices.map((c,idx)=>{
              const isC=idx===q.answer, isP=idx===picked; let bg="var(--card)",bd=C.line,col=C.ink;
              if(picked!==null){ if(isC){bg="var(--good-bg)";bd=C.leaf;col=C.leafDeep;} else if(isP){bg="var(--bad-bg)";bd=C.coral;col="var(--bad-ink)";} else bg="var(--muted)"; }
              return (
                <button key={idx} onClick={()=>choose(idx)} disabled={picked!==null} className="md-btn"
                  style={{textAlign:"left",background:bg,border:`2px solid ${bd}`,color:col,padding:"12px 15px",
                  borderRadius:14,display:"flex",gap:11,alignItems:"flex-start",fontWeight:500,fontSize:".96rem",
                  lineHeight:1.4,cursor:picked!==null?"default":"pointer"}}>
                  <span style={{fontWeight:800,minWidth:18,color:picked!==null&&isC?C.leafDeep:(isP?"var(--bad-ink)":C.rose)}}>
                    {picked!==null&&isC?"✓":(isP&&!isC?"✗":String.fromCharCode(65+idx))}</span>
                  <span style={{flex:1}}>{c}</span>
                </button>
              );
            })}
          </div>
          {picked!==null && (
            <div className="md-fadein" style={{marginTop:14}}>
              <div style={{fontWeight:800,color:picked===q.answer?C.leafDeep:C.coral,marginBottom:8}}>
                {picked===q.answer?"🌷 Correct":"🥀 Not quite"}
              </div>
              <div style={{fontSize:".93rem",lineHeight:1.6,color:C.ink,background:"var(--card-2)",border:"1px solid "+C.line,borderRadius:12,padding:"12px 14px"}}>{q.exp}</div>
              <div style={{textAlign:"right",marginTop:14}}>
                {qi+1<p.questions.length
                  ? <button className="md-btn primary" onClick={next}>Next question →</button>
                  : <button className="md-btn primary" onClick={()=>setQi(v=>v+1)}>See results →</button>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   8. HOME / GARDEN DASHBOARD
   ============================================================================ */

/* A progress ring toward the daily goal */
function GoalRing({ done, goal, size=118 }){
  const r=(size-16)/2, c=2*Math.PI*r;
  const pct=goal?Math.min(1,done/goal):0;
  const met=done>=goal && goal>0;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ffe1ef" strokeWidth="10"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={met?C.leaf:C.roseDeep} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c*(1-pct)}
          style={{transition:"stroke-dashoffset .7s cubic-bezier(.3,1,.3,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div className="md-serif" style={{fontSize:"1.6rem",fontWeight:600,color:met?C.leafDeep:C.roseDeep,lineHeight:1}}>{done}</div>
        <div style={{fontSize:".64rem",color:C.plumSoft,fontWeight:700,textTransform:"uppercase",letterSpacing:".04em"}}>of {goal} today</div>
      </div>
    </div>
  );
}

/* The living garden: flowers grow with the streak, wilt if a day is missed */
function GardenBed({ streak, stale, dark }){
  const n=Math.max(3,Math.min(16, 3+streak));
  const flowers=useMemo(()=>Array.from({length:n},(_,i)=>({
    color:[C.roseDeep,C.rose,"#ff9ec7",C.gold,"#c78ae0"][i%5],
    center:["#fff6d8",C.gold,"#fff"][i%3],
    size:22+((i*7)%18), bob:(i%5)*0.3,
  })),[n]);
  return (
    <div style={{position:"relative",height:120,borderRadius:18,overflow:"hidden",
      background: dark
        ? "linear-gradient(180deg,rgba(255,255,255,.04),rgba(0,0,0,.10)), linear-gradient(180deg,#3a2d47,#2c2138)"
        : "linear-gradient(180deg,#fff9fc,#fff0f7)",
      border:"1px solid var(--line)",boxShadow:"inset 0 -18px 24px -18px rgba(63,154,108,.4)"}}>
      {/* sun / moon */}
      <div style={{position:"absolute",top:12,right:16,fontSize:"1.4rem",opacity:.9}}>{dark?"🌙":"☀️"}</div>
      {/* soil */}
      <div style={{position:"absolute",left:0,right:0,bottom:0,height:26,
        background: dark?"linear-gradient(180deg,#5a4a3a,#3f3327)":"linear-gradient(180deg,#e7c9a8,#c99e73)"}}/>
      {/* flowers */}
      <div style={{position:"absolute",left:0,right:0,bottom:18,display:"flex",alignItems:"flex-end",
        justifyContent:"space-evenly",padding:"0 10px",opacity:stale?.55:1,filter:stale?"grayscale(.4)":"none",transition:"opacity .4s"}}>
        {flowers.map((f,i)=>(
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",
            transform:stale?`rotate(${i%2?8:-8}deg)`:"none",transition:"transform .5s"}}>
            <div style={{animation:`mdSway ${3+f.bob}s ease-in-out infinite`,transformOrigin:"bottom center"}}>
              <Flower size={f.size} color={f.color} center={f.center}/>
            </div>
            <div style={{width:2.5,height:14+((i*5)%16),background:C.leafDeep,borderRadius:2}}/>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThemeToggle({ dark, onToggle }){
  return (
    <button className="md-btn" onClick={onToggle} title="Toggle evening garden"
      style={{background:dark?"#3a2d47":"#fff",border:`2px solid ${dark?"#5c4a6e":C.line}`,
      color:dark?"#ffd9ef":C.plumSoft,padding:"9px 14px",borderRadius:14,fontWeight:700,fontSize:".85rem"}}>
      {dark?"🌙 Evening":"☀️ Daylight"}
    </button>
  );
}

function StatsPanel({ perf, srs, streak, allCards }){
  const mastered=Object.values(srs).filter(r=>r.interval>=21).length;
  const learning=Object.values(srs).filter(r=>r.interval<21).length;
  const seen=Object.keys(srs).length;
  const fresh=Math.max(0,allCards.length-seen);
  const totalRev=Object.values(streak.history||{}).reduce((a,b)=>a+b,0);
  return (
    <div className="md-card" style={{padding:"20px",marginBottom:18}}>
      <div style={{fontWeight:800,color:C.plum,marginBottom:14,fontSize:".95rem"}}>📊 How your garden is growing</div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
        <StatPod big={mastered} label="mastered" emoji="🌸"/>
        <StatPod big={learning} label="learning" emoji="🌱"/>
        <StatPod big={fresh} label="unplanted" emoji="🌰"/>
        <StatPod big={totalRev} label="reviews" emoji="🔁"/>
      </div>
      <div style={{fontSize:".72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:C.plumSoft,marginBottom:10}}>Accuracy by section</div>
      <div style={{display:"grid",gap:10}}>
        {Object.values(SECTIONS).map(s=>{
          const p=perf[s.key]||{c:0,t:0};
          const pct=p.t?Math.round(p.c/p.t*100):0;
          return (
            <div key={s.key}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:".82rem",marginBottom:4}}>
                <span style={{fontWeight:600,color:C.ink}}>{s.emoji} {s.label}</span>
                <span style={{color:C.plumSoft}}>{p.t?`${pct}% · ${p.c}/${p.t}`:"—"}</span>
              </div>
              <div style={{height:9,background:"var(--track)",borderRadius:99,overflow:"hidden"}}>
                <div style={{width:pct+"%",height:"100%",background:s.color,borderRadius:99,transition:"width .6s"}}/>
              </div>
            </div>
          );
        })}
      </div>
      {perf.CARS && perf.CARS.t>0 && (
        <div style={{marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:".82rem",marginBottom:4}}>
            <span style={{fontWeight:600,color:C.ink}}>📖 CARS</span>
            <span style={{color:C.plumSoft}}>{Math.round(perf.CARS.c/perf.CARS.t*100)}% · {perf.CARS.c}/{perf.CARS.t}</span>
          </div>
          <div style={{height:9,background:"var(--track)",borderRadius:99,overflow:"hidden"}}>
            <div style={{width:Math.round(perf.CARS.c/perf.CARS.t*100)+"%",height:"100%",background:"#7b6ef0",borderRadius:99,transition:"width .6s"}}/>
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:16,marginTop:16,fontSize:".82rem",color:C.plum,fontWeight:600}}>
        <span>🔥 Current streak: <b style={{color:C.roseDeep}}>{streak.current||0}</b> days</span>
        <span>🏆 Longest: <b style={{color:C.roseDeep}}>{streak.longest||0}</b></span>
      </div>
    </div>
  );
}

function Toggle({ active, color, soft, onClick, children }){
  return (
    <button onClick={onClick} className="md-btn"
      style={{background:active?soft:"var(--card)",border:`2px solid ${active?color:C.line}`,
      color:active?color:C.plumSoft,padding:"9px 15px",borderRadius:14,fontWeight:700,fontSize:".85rem"}}>
      {children}
    </button>
  );
}
function ModeCard({ emoji, title, desc, accent, onClick, badge, disabled }){
  return (
    <button onClick={onClick} disabled={disabled} className="md-btn md-card"
      style={{textAlign:"left",padding:"18px",borderRadius:22,border:"1px solid "+C.line,
      background:"linear-gradient(160deg,var(--card), "+accent+"22)",display:"flex",flexDirection:"column",gap:6,
      position:"relative",opacity:disabled?.5:1,cursor:disabled?"not-allowed":"pointer",minHeight:132}}>
      {badge!=null && badge>0 && (
        <span style={{position:"absolute",top:12,right:12,background:C.gold,color:"#fff",fontWeight:800,
          fontSize:".72rem",padding:"3px 9px",borderRadius:99}}>{badge}</span>)}
      <div style={{fontSize:"1.9rem",lineHeight:1}}>{emoji}</div>
      <div className="md-serif" style={{fontSize:"1.18rem",fontWeight:600,color:C.ink}}>{title}</div>
      <div style={{fontSize:".82rem",color:C.plumSoft,lineHeight:1.4}}>{desc}</div>
    </button>
  );
}
function StatPod({ big, label, emoji }){
  return (
    <div style={{background:"var(--card)",border:"1px solid "+C.line,borderRadius:18,padding:"12px 16px",
      display:"flex",flexDirection:"column",alignItems:"center",minWidth:96,flex:1}}>
      <div style={{fontSize:"1.4rem"}}>{emoji}</div>
      <div className="md-serif" style={{fontSize:"1.5rem",fontWeight:600,color:C.roseDeep,lineHeight:1.1}}>{big}</div>
      <div style={{fontSize:".7rem",color:C.plumSoft,fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"}}>{label}</div>
    </div>
  );
}

function Home({ sections,setSections, diffs,setDiffs, length,setLength, garden, weakCount, avail, launch,
  allCards, srs, perf, streak, dueCount, todayCount, examDate,setExamDate, dailyGoal,setDailyGoal,
  dark, toggleTheme, openCreator, customCount }){
  function toggleIn(arr,setArr,val){ setArr(arr.includes(val)?arr.filter(x=>x!==val):[...arr,val]); }
  const lengths=[10,25,50,0]; // 0 = full
  const today=todayStr();
  const daysLeft = examDate ? daysBetween(today, examDate) : null;
  const stale = streak.last && daysBetween(streak.last, today) >= 2;
  return (
    <div className="md-fadein">
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{position:"relative"}}>
          <Flower size={52} sway color={C.roseDeep} center={C.gold}/>
        </div>
        <div style={{flex:1,minWidth:180}}>
          <h1 className="md-serif" style={{margin:0,fontSize:"2.5rem",fontWeight:600,color:"var(--on-bg)",letterSpacing:"-.01em"}}>
            Liya<span style={{color:C.roseDeep}}>Deck</span>
          </h1>
          <div style={{color:"var(--on-bg-soft)",fontWeight:600,marginTop:-2}}>tend your knowledge garden 🌸 · a high-yield MCAT study space</div>
        </div>
        <ThemeToggle dark={dark} onToggle={toggleTheme}/>
      </div>

      {/* Living garden + daily focus */}
      <div className="md-card" style={{padding:"18px",marginBottom:18}}>
        <GardenBed streak={streak.current||0} stale={stale} dark={dark}/>
        <div style={{display:"flex",gap:18,alignItems:"center",flexWrap:"wrap",marginTop:16}}>
          <GoalRing done={todayCount} goal={dailyGoal}/>
          <div style={{flex:1,minWidth:200}}>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:10}}>
              <div style={{background:"var(--card-2)",border:"1px solid "+C.line,borderRadius:14,padding:"8px 14px"}}>
                <div style={{fontSize:".68rem",color:C.plumSoft,fontWeight:700,textTransform:"uppercase",letterSpacing:".04em"}}>🔥 Streak</div>
                <div className="md-serif" style={{fontSize:"1.4rem",color:C.roseDeep,fontWeight:600,lineHeight:1}}>{streak.current||0} <span style={{fontSize:".8rem",color:C.plumSoft}}>days</span></div>
              </div>
              <div style={{background:"var(--card-2)",border:"1px solid "+C.line,borderRadius:14,padding:"8px 14px"}}>
                <div style={{fontSize:".68rem",color:C.plumSoft,fontWeight:700,textTransform:"uppercase",letterSpacing:".04em"}}>🗓️ Exam in</div>
                <div className="md-serif" style={{fontSize:"1.4rem",color:C.roseDeep,fontWeight:600,lineHeight:1}}>
                  {daysLeft!=null ? (daysLeft>=0?`${daysLeft}`:"—") : "—"} <span style={{fontSize:".8rem",color:C.plumSoft}}>{daysLeft!=null&&daysLeft>=0?"days":"set date"}</span>
                </div>
              </div>
            </div>
            <button className="md-btn primary" disabled={dueCount===0}
              onClick={()=>launch("review")} style={{width:"100%"}}>
              {dueCount>0 ? `🌿 Review ${dueCount} due today` : "🌼 All caught up — nothing due!"}
            </button>
            {stale && <div style={{fontSize:".78rem",color:C.coral,fontWeight:600,marginTop:8}}>Your garden is wilting a little — a quick review will revive it. 💧</div>}
          </div>
        </div>
        {/* settings row */}
        <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:16,paddingTop:14,borderTop:"1px dashed "+C.line}}>
          <label style={{fontSize:".8rem",color:C.plum,fontWeight:600,display:"flex",flexDirection:"column",gap:4}}>
            Exam date
            <input type="date" value={examDate||""} onChange={e=>setExamDate(e.target.value||null)}
              style={{padding:"7px 10px",borderRadius:10,border:"2px solid "+C.line,fontFamily:"inherit",color:C.ink}}/>
          </label>
          <label style={{fontSize:".8rem",color:C.plum,fontWeight:600,display:"flex",flexDirection:"column",gap:4}}>
            Daily goal (cards)
            <input type="number" min="5" max="200" value={dailyGoal} onChange={e=>setDailyGoal(Math.max(1,Number(e.target.value)||1))}
              style={{width:110,padding:"7px 10px",borderRadius:10,border:"2px solid "+C.line,fontFamily:"inherit",color:C.ink}}/>
          </label>
        </div>
      </div>

      {/* Stats */}
      <StatsPanel perf={perf} srs={srs} streak={streak} allCards={allCards}/>

      {/* Filters */}
      <div className="md-card" style={{padding:"20px",marginBottom:18}}>
        <div style={{fontWeight:800,color:C.plum,marginBottom:10,fontSize:".95rem"}}>🌷 Plant your session</div>

        <div style={{marginBottom:14}}>
          <div style={{fontSize:".72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:C.plumSoft,marginBottom:8}}>Sections</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {Object.values(SECTIONS).map(s=>(
              <Toggle key={s.key} active={sections.includes(s.key)} color={s.color} soft={s.soft}
                onClick={()=>toggleIn(sections,setSections,s.key)}>{s.emoji} {s.label}</Toggle>
            ))}
          </div>
        </div>

        <div style={{marginBottom:14}}>
          <div style={{fontSize:".72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:C.plumSoft,marginBottom:8}}>Difficulty</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {Object.entries(DIFFS).map(([k,d])=>(
              <Toggle key={k} active={diffs.includes(k)} color={d.color} soft={d.color+"22"}
                onClick={()=>toggleIn(diffs,setDiffs,k)}>{d.emoji} {d.label}</Toggle>
            ))}
          </div>
        </div>

        <div>
          <div style={{fontSize:".72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:C.plumSoft,marginBottom:8}}>Session length</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {lengths.map(n=>(
              <Toggle key={n} active={length===n} color={C.roseDeep} soft={C.petal}
                onClick={()=>setLength(n)}>{n===0?"Full bank":n+" cards"}</Toggle>
            ))}
          </div>
          {avail===0 && <div style={{color:C.coral,fontSize:".8rem",marginTop:10,fontWeight:600}}>No cards match — pick at least one section and difficulty. 🌱</div>}
        </div>
      </div>

      {/* Modes */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>
        <ModeCard emoji="🪷" title="Flashcards" accent={C.rose} disabled={avail===0}
          desc="Flip through cards. Question & diagram front, full answer + clinical anchor back."
          onClick={()=>launch("flash",false)}/>
        <ModeCard emoji="✍️" title="Quiz" accent="#7b6ef0" disabled={avail===0}
          desc="4-option MCQ, instant feedback on all choices, end-of-session bouquet breakdown."
          onClick={()=>launch("quiz",false)}/>
        <ModeCard emoji="🃏" title="Match Garden" accent={C.leaf}
          desc="Pair terms with definitions against the clock. Beat your bloom time."
          onClick={()=>launch("match",false)}/>
        <ModeCard emoji="🌱" title="Triage" accent={C.gold} disabled={avail===0}
          desc="Rate your confidence, then reveal. Shaky cards recycle until they're second nature."
          onClick={()=>launch("triage",false)}/>
        <ModeCard emoji="🥀" title="Weak Spots" accent={C.coral} badge={weakCount} disabled={weakCount===0}
          desc="Revive your wilting bed — the cards you missed or saved, waiting to bloom again."
          onClick={()=>launch("weak")}/>
        <ModeCard emoji="☕" title="Daily 5" accent="#9ac6ff"
          desc="Five quick, low-stakes cards from your own bank — a gentle warm-up that still counts toward review."
          onClick={()=>launch("daily5")}/>
        <ModeCard emoji="📖" title="CARS" accent="#7b6ef0"
          desc="Read a passage, then answer AAMC-style questions — comprehension, within the text, and beyond the text."
          onClick={()=>launch("cars")}/>
        <ModeCard emoji="🪴" title="Create a card" accent={C.leafDeep} badge={customCount}
          desc="Write your own question — anything a practice test burned you on — straight into your review queue."
          onClick={openCreator}/>
      </div>

      <div style={{textAlign:"center",color:"var(--on-bg-soft)",fontSize:".78rem",marginTop:26,lineHeight:1.6}}>
        🌸 LiyaDeck · {allCards.length} cards across B/B, C/P & P/S · spaced repetition · built to help you grow ·<br/>
        <span style={{opacity:.8}}>Study tool for exam prep — always corroborate with official AAMC materials.</span>
      </div>
    </div>
  );
}

/* ============================================================================
   9. MAIN APP
   ============================================================================ */

/* ============================================================================
   9. MAIN APP
   ============================================================================ */
export default function MedDeck(){
  const [view,setView]=useState("home"); // home | flash | quiz | match | triage | daily5 | create | cars
  const [sections,setSections]=usePersistent("sections",["BB","CP","PS"]);
  const [diffs,setDiffs]=usePersistent("diffs",["foundation","medium","hard"]);
  const [length,setLength]=usePersistent("length",25);
  const [garden,setGarden]=usePersistent("garden",0);
  const [weak,setWeak]=usePersistent("weak",new Set(),{isSet:true});
  const [starred,setStarred]=usePersistent("starred",new Set(),{isSet:true});
  const [srs,setSrs]=usePersistent("srs",{});
  const [perf,setPerf]=usePersistent("perf",{});
  const [streak,setStreak]=usePersistent("streak",{current:0,longest:0,last:null,history:{}});
  const [custom,setCustom]=usePersistent("custom",[]);
  const [examDate,setExamDate]=usePersistent("examDate",null);
  const [dailyGoal,setDailyGoal]=usePersistent("dailyGoal",30);
  const [theme,setTheme]=usePersistent("theme","light");
  const [deck,setDeck]=useState([]);
  const dark = theme==="dark";

  useEffect(()=>{
    if(document.getElementById("md-style")) return;
    const el=document.createElement("style"); el.id="md-style"; el.textContent=CSS;
    document.head.appendChild(el);
  },[]);

  const allCards = useMemo(()=>[...BANK, ...custom],[custom]);
  const filtered = useMemo(()=>allCards.filter(q=>
    sections.includes(q.section) && diffs.includes(q.difficulty)),[allCards,sections,diffs]);
  const dueDeck = useMemo(()=>buildDueDeck(allCards, srs, 15),[allCards,srs]);
  const dueCount = dueDeck.all.length;
  const todayCount = (streak.history && streak.history[todayStr()]) || 0;

  const bloom=useCallback(n=>setGarden(g=>g+n),[setGarden]);
  const addWeak=useCallback(id=>setWeak(w=>new Set(w).add(id)),[setWeak]);
  const toggleStar=useCallback(id=>setStarred(s=>{
    const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n;
  }),[setStarred]);
  const toggleStarAndWeak=useCallback(id=>{
    toggleStar(id);
    setWeak(w=>new Set(w).add(id));
  },[toggleStar,setWeak]);

  const recordStudyDay=useCallback(()=>{
    setStreak(prev=>{
      const t=todayStr();
      const hist={...(prev.history||{})}; hist[t]=(hist[t]||0)+1;
      let current=prev.current||0, last=prev.last||null;
      if(last!==t){ current = (last && daysBetween(last,t)===1) ? current+1 : 1; last=t; }
      else if(current===0){ current=1; }
      return {current, longest:Math.max(prev.longest||0,current), last, history:hist};
    });
  },[setStreak]);

  const grade=useCallback((card,quality)=>{
    setSrs(prev=>({...prev, [card.id]: sm2(prev[card.id], quality)}));
    setPerf(prev=>{ const s=card.section; const cur=prev[s]||{c:0,t:0};
      return {...prev,[s]:{c:cur.c+(quality>=3?1:0), t:cur.t+1}}; });
    recordStudyDay();
    if(quality<3) addWeak(card.id);
  },[setSrs,setPerf,recordStudyDay,addWeak]);

  const recordCars=useCallback((correct)=>{
    setPerf(prev=>{ const cur=prev.CARS||{c:0,t:0};
      return {...prev, CARS:{c:cur.c+(correct?1:0), t:cur.t+1}}; });
    recordStudyDay();
    if(correct) bloom(1);
  },[setPerf,recordStudyDay,bloom]);

  const saveCustom=useCallback(card=>setCustom(cs=>[...cs,card]),[setCustom]);
  const deleteCustom=useCallback(id=>{
    setCustom(cs=>cs.filter(c=>c.id!==id));
    setSrs(prev=>{ const n={...prev}; delete n[id]; return n; });
    setWeak(w=>{ const n=new Set(w); n.delete(id); return n; });
    setStarred(s=>{ const n=new Set(s); n.delete(id); return n; });
  },[setCustom,setSrs,setWeak,setStarred]);

  function launch(mode){
    if(mode==="match"||mode==="cars"){ setView(mode); return; }
    let pool, target=mode, cap=(length&&length>0)?length:0;
    if(mode==="review"){ pool=dueDeck.all; target="triage"; cap=0; }
    else if(mode==="daily5"){ pool=dueDeck.all.length?dueDeck.all:filtered; target="daily5"; cap=5; }
    else if(mode==="weak"){ const ids=new Set([...weak,...starred]); pool=allCards.filter(q=>ids.has(q.id)); target="quiz"; cap=0; }
    else pool=filtered;
    let d=shuffle(pool).map(shuffleChoices);
    if(cap>0) d=d.slice(0,cap);
    if(d.length===0) return;
    setDeck(d); setView(target);
  }
  const exit=()=>setView("home");
  const toggleTheme=()=>setTheme(t=>t==="dark"?"light":"dark");
  const weakCount=new Set([...weak,...starred]).size;

  return (
    <div className={"md-root"+(dark?" dark":"")}>
      <div className="md-wrap md-scroll">
        {view==="home" && (
          <Home sections={sections} setSections={setSections} diffs={diffs} setDiffs={setDiffs}
            length={length} setLength={setLength} garden={garden} weakCount={weakCount}
            avail={filtered.length} launch={launch} allCards={allCards}
            srs={srs} perf={perf} streak={streak} dueCount={dueCount} todayCount={todayCount}
            examDate={examDate} setExamDate={setExamDate} dailyGoal={dailyGoal} setDailyGoal={setDailyGoal}
            dark={dark} toggleTheme={toggleTheme} openCreator={()=>setView("create")} customCount={custom.length}/>
        )}
        {view==="flash" && (
          <FlashcardMode deck={deck} onExit={exit} onBloom={bloom} starred={starred} toggleStar={toggleStarAndWeak}/>
        )}
        {view==="quiz" && (
          <QuizMode deck={deck} onExit={exit} onBloom={bloom} onWeak={addWeak} onGrade={grade} starred={starred} toggleStar={toggleStarAndWeak}/>
        )}
        {view==="match" && (
          <MatchMode sections={sections} onExit={exit} onBloom={bloom}/>
        )}
        {view==="triage" && (
          <TriageMode deck={deck} onExit={exit} onBloom={bloom} onWeak={addWeak} onGrade={grade}/>
        )}
        {view==="daily5" && (
          <DailyFive deck={deck} onExit={exit} onBloom={bloom} onGrade={grade} starred={starred} toggleStar={toggleStarAndWeak}/>
        )}
        {view==="cars" && (
          <CarsMode passages={CARS_PASSAGES} onExit={exit} onRecord={recordCars}/>
        )}
        {view==="create" && (
          <CardCreator onExit={exit} onSave={saveCustom} custom={custom} onDelete={deleteCustom}/>
        )}
      </div>
    </div>
  );
}
