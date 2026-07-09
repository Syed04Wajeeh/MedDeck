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
}
*{box-sizing:border-box;}
.md-root{
  font-family:'Quicksand',system-ui,sans-serif; color:var(--ink);
  background:
    radial-gradient(1200px 700px at 12% -8%, #fff 0%, rgba(255,255,255,0) 55%),
    radial-gradient(900px 600px at 108% 6%, var(--petal) 0%, rgba(255,215,234,0) 60%),
    linear-gradient(160deg,var(--blush) 0%, var(--blush-2) 60%, #ffe0ef 100%);
  min-height:100%; width:100%; padding:0; margin:0;
  -webkit-font-smoothing:antialiased;
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
.md-btn.ghost{background:#fff;color:var(--plum);padding:11px 18px;border:2px solid var(--line);}
.md-btn.ghost:hover{border-color:var(--rose);background:var(--blush);}
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
  plum:"#5b4266", plumSoft:"#8a6f95", ink:"#4a3b52", leaf:"#5fb98a",
  leafDeep:"#3f9a6c", coral:"#f4736b", gold:"#f2b64e", card:"#fff", line:"#ffd9ea",
};

const SECTIONS = {
  BB: { key:"BB", label:"Bio / Biochem", short:"B/B", color:"#e85a9c", soft:"#ffe1ef", emoji:"🌸" },
  CP: { key:"CP", label:"Chem / Physics", short:"C/P", color:"#7b6ef0", soft:"#e9e6ff", emoji:"🌷" },
  PS: { key:"PS", label:"Psych / Soc", short:"P/S", color:"#3f9a6c", soft:"#dcf4e7", emoji:"🌿" },
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
  return <span className="md-chip" style={{background:"#fff",border:`1.5px solid ${info.color}`,
    color:info.color}}>{info.emoji} {info.label}</span>;
}

/* A growing-vine progress bar: filled track + a bloom at the leading tip */
function VineProgress({ done, total }){
  const pct = total ? Math.min(100,(done/total)*100) : 0;
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,width:"100%"}}>
      <div style={{flex:1,height:12,background:"#ffe6f2",borderRadius:99,position:"relative",overflow:"visible"}}>
        <div style={{position:"absolute",inset:0,width:pct+"%",borderRadius:99,
          background:"linear-gradient(90deg,#8fd6b0,#5fb98a 60%,#3f9a6c)",
          transition:"width .5s cubic-bezier(.4,1,.3,1)"}}/>
        <div style={{position:"absolute",top:"50%",left:pct+"%",transform:"translate(-55%,-50%)",
          transition:"left .5s cubic-bezier(.4,1,.3,1)"}}>
          <Flower size={22} sway color={C.roseDeep} center="#fff6d8"/>
        </div>
      </div>
      <span style={{fontSize:".8rem",fontWeight:700,color:C.plumSoft,minWidth:44,textAlign:"right"}}>{done}/{total}</span>
    </div>
  );
}

function TopBar({ title, subtitle, onExit, right }){
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,flexWrap:"wrap"}}>
      <button className="md-btn ghost mini" onClick={onExit}>← Garden</button>
      <div style={{flex:1,minWidth:120}}>
        <div className="md-serif" style={{fontSize:"1.25rem",fontWeight:600,lineHeight:1.1}}>{title}</div>
        {subtitle && <div style={{fontSize:".78rem",color:C.plumSoft}}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

/* Star / bookmark toggle */
function StarBtn({ on, onClick }){
  return (
    <button onClick={onClick} title="Save to Weak Spots"
      className="md-btn" style={{background:on?"#fff3d6":"#fff",border:`2px solid ${on?C.gold:C.line}`,
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
              <span className="md-chip" style={{background:"#fff",color:C.plumSoft,border:"1px solid "+C.line}}>{q.topic}</span>
            </div>
            <div className="md-serif" style={{fontSize:"1.32rem",lineHeight:1.4,color:C.ink,fontWeight:500}}>{q.q}</div>
            {q.dia && <div style={{marginTop:16}}><Diagram dkey={q.dia}/></div>}
            <div style={{marginTop:"auto",paddingTop:18,textAlign:"center",color:C.rose,fontWeight:600,fontSize:".85rem"}}>
              🌸 tap to reveal the answer
            </div>
          </div>
          {/* BACK */}
          <div className="md-face back md-card" style={{padding:"22px 22px",cursor:"pointer",overflow:"auto",
            background:"linear-gradient(180deg,#fff,#fff7fb)"}} onClick={flip}>
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
            <div style={{background:"#fff3f9",border:"1px solid "+C.line,borderRadius:14,padding:"12px 14px"}}>
              <div style={{fontSize:".7rem",fontWeight:700,color:C.roseDeep,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>🩺 Clinical anchor</div>
              <div style={{fontSize:".9rem",lineHeight:1.5,color:C.plum}}>{q.clinical}</div>
            </div>
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
function QuizMode({ deck, onExit, onBloom, onWeak, starred, toggleStar }){
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
          <span className="md-chip" style={{background:"#fff",color:C.plumSoft,border:"1px solid "+C.line}}>{q.topic}</span>
        </div>
        <div className="md-serif" style={{fontSize:"1.24rem",lineHeight:1.4,marginBottom:12}}>{q.q}</div>
        {q.dia && <Diagram dkey={q.dia}/>}

        <div style={{display:"grid",gap:10,marginTop:14}}>
          {q.choices.map((c,idx)=>{
            const isCorrect=idx===q.answer, isPicked=idx===picked;
            let bg="#fff",bd=C.line,col=C.ink,badge=String.fromCharCode(65+idx);
            if(picked!==null){
              if(isCorrect){ bg="#e9f9ef"; bd=C.leaf; col=C.leafDeep; }
              else if(isPicked){ bg="#ffecea"; bd=C.coral; col="#c0433a"; }
              else { bg="#fafafa"; }
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
                  background:idx===q.answer?"#eefaf2":"#fff6f9",border:"1px solid "+(idx===q.answer?"#c8ecd5":C.line)}}>
                  <b style={{color:idx===q.answer?C.leafDeep:C.plum}}>{String.fromCharCode(65+idx)}. </b>
                  <span style={{color:C.ink}}>{q.exp[idx]}</span>
                </div>
              ))}
            </div>
            <div style={{background:"#fff3f9",border:"1px solid "+C.line,borderRadius:14,padding:"12px 14px",marginTop:12}}>
              <div style={{fontSize:".7rem",fontWeight:700,color:C.roseDeep,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>🩺 Clinical anchor</div>
              <div style={{fontSize:".9rem",lineHeight:1.5,color:C.plum}}>{q.clinical}</div>
            </div>
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
      <div style={{height:8,background:"#f2e6ee",borderRadius:99,overflow:"hidden"}}>
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
        right={<span className="md-chip" style={{background:"#fff",border:"1px solid "+C.line,color:C.plum,fontSize:".85rem"}}>⏱ {mm}:{ss}</span>}/>

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
  let bg="#fff",bd=C.line,col=C.ink,op=1;
  if(matched){ bg="#eefaf2"; bd="#bfe9cf"; col=C.leafDeep; op=.55; }
  else if(bad){ bg="#ffecea"; bd=C.coral; col="#c0433a"; }
  else if(selected){ bg="#fff0f7"; bd=C.roseDeep; col=C.roseDeep; }
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
function TriageMode({ deck, onExit, onBloom, onWeak }){
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
    {lvl:0,label:"Knew it",emoji:"🌸",col:C.leafDeep,bg:"#eefaf2",bd:"#bfe9cf"},
    {lvl:1,label:"Shaky",emoji:"🌱",col:"#c78a12",bg:"#fff6e2",bd:"#f2d98a"},
    {lvl:2,label:"No idea",emoji:"🌧️",col:C.coral,bg:"#ffecea",bd:"#f6b6b0"},
  ];
  return (
    <div className="md-fadein">
      <TopBar title="Triage" subtitle={`${mastered.size} mastered · ${queue.length} in the bed`} onExit={onExit}/>
      <div style={{marginBottom:14}}><VineProgress done={mastered.size} total={mastered.size+queue.length}/></div>

      <div className="md-card md-pop" style={{padding:"22px"}}>
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <SectionChip s={q.section}/><DiffChip d={q.difficulty}/>
          <span className="md-chip" style={{background:"#fff",color:C.plumSoft,border:"1px solid "+C.line}}>{q.topic}</span>
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
            <div style={{background:"#fff3f9",border:"1px solid "+C.line,borderRadius:14,padding:"12px 14px",marginBottom:14}}>
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
   7e. WARM-UP MODE — live Open Trivia DB fetch (quarantined), graceful fallback
   ============================================================================ */
const WARMUP_FALLBACK=[
  { q:"Which element has the chemical symbol 'Fe'?", correct:"Iron", incorrect:["Fluorine","Francium","Lead"] },
  { q:"What is the powerhouse organelle of the cell?", correct:"Mitochondrion", incorrect:["Ribosome","Golgi apparatus","Nucleolus"] },
  { q:"What gas do plants primarily absorb for photosynthesis?", correct:"Carbon dioxide", incorrect:["Oxygen","Nitrogen","Hydrogen"] },
  { q:"How many chambers does the human heart have?", correct:"Four", incorrect:["Two","Three","Five"] },
  { q:"What is the pH of pure water at 25°C?", correct:"7", incorrect:["0","14","1"] },
  { q:"Which vitamin is produced when skin is exposed to sunlight?", correct:"Vitamin D", incorrect:["Vitamin C","Vitamin A","Vitamin K"] },
  { q:"What is the most abundant gas in Earth's atmosphere?", correct:"Nitrogen", incorrect:["Oxygen","Carbon dioxide","Argon"] },
  { q:"What type of blood cell fights infection?", correct:"White blood cell", incorrect:["Red blood cell","Platelet","Plasma cell only"] },
];
function WarmUpMode({ onExit, onBloom }){
  const [state,setState]=useState("loading"); // loading | live | fallback
  const [items,setItems]=useState([]);
  const [i,setI]=useState(0);
  const [picked,setPicked]=useState(null);
  const [score,setScore]=useState(0);
  const [order,setOrder]=useState([]);

  useEffect(()=>{
    let cancel=false;
    (async()=>{
      try{
        const r=await fetch("https://opentdb.com/api.php?amount=10&category=17&type=multiple");
        const j=await r.json();
        if(cancel) return;
        if(j.response_code===0 && j.results?.length){
          setItems(j.results.map(x=>({ q:decodeHTML(x.question), correct:decodeHTML(x.correct_answer),
            incorrect:x.incorrect_answers.map(decodeHTML) })));
          setState("live");
        } else throw new Error("empty");
      }catch(e){ if(!cancel){ setItems(WARMUP_FALLBACK); setState("fallback"); } }
    })();
    return ()=>{ cancel=true; };
  },[]);

  const it=items[i];
  useEffect(()=>{ if(it) setOrder(shuffle([it.correct,...it.incorrect])); },[i,items]);

  function choose(ans){
    if(picked!==null) return;
    setPicked(ans);
    if(ans===it.correct){ setScore(s=>s+1); onBloom&&onBloom(1); }
  }
  function next(){ setPicked(null); setI(v=>v+1); }

  if(state==="loading"){
    return (
      <div className="md-fadein">
        <TopBar title="Warm-Up Trivia" onExit={onExit}/>
        <div className="md-card" style={{padding:"48px",textAlign:"center"}}>
          <div style={{display:"inline-block",animation:"mdSpin 1.1s linear infinite"}}><Flower size={40} color={C.rose} center={C.gold}/></div>
          <div style={{color:C.plumSoft,marginTop:14}}>Picking fresh trivia from the Open Trivia DB…</div>
        </div>
      </div>
    );
  }
  if(i>=items.length){
    return (
      <div className="md-fadein" style={{position:"relative"}}>
        {score>items.length/2 && <PetalRain count={18}/>}
        <TopBar title="Warm-Up Trivia" onExit={onExit}/>
        <div className="md-card md-pop" style={{padding:"30px",textAlign:"center",position:"relative",zIndex:6}}>
          <Flower size={44} sway color={C.roseDeep} center={C.gold}/>
          <div className="md-serif" style={{fontSize:"1.5rem",color:C.roseDeep,fontWeight:600,marginTop:8}}>Warmed up!</div>
          <div style={{color:C.plum,margin:"6px 0 16px"}}>{score}/{items.length} — now go tackle the real MCAT bank 🌸</div>
          <button className="md-btn primary" onClick={onExit}>Back to Garden</button>
        </div>
      </div>
    );
  }
  return (
    <div className="md-fadein">
      <TopBar title="Warm-Up Trivia" subtitle="Low-stakes brain-warmer · not scored as MCAT" onExit={onExit}
        right={<span className="md-chip" style={{background:state==="live"?"#eefaf2":"#fff6e2",
          color:state==="live"?C.leafDeep:"#c78a12",border:"1px solid "+C.line}}>
          {state==="live"?"● live from OpenTDB":"● offline fallback"}</span>}/>
      <div style={{marginBottom:14}}><VineProgress done={i} total={items.length}/></div>
      <div className="md-card md-pop" style={{padding:"22px"}}>
        <div className="md-serif" style={{fontSize:"1.2rem",lineHeight:1.4,marginBottom:16}}>{it.q}</div>
        <div style={{display:"grid",gap:10}}>
          {order.map((a,idx)=>{
            const isC=a===it.correct, isP=a===picked; let bg="#fff",bd=C.line,col=C.ink;
            if(picked!==null){ if(isC){bg="#eefaf2";bd=C.leaf;col=C.leafDeep;} else if(isP){bg="#ffecea";bd=C.coral;col="#c0433a";} else bg="#fafafa"; }
            return <button key={idx} className="md-btn" onClick={()=>choose(a)} disabled={picked!==null}
              style={{textAlign:"left",background:bg,border:`2px solid ${bd}`,color:col,padding:"12px 15px",
              borderRadius:14,fontWeight:500,cursor:picked!==null?"default":"pointer"}}>{a}</button>;
          })}
        </div>
        {picked!==null && (
          <div style={{textAlign:"right",marginTop:16}}>
            <button className="md-btn primary" onClick={next}>{i+1>=items.length?"Finish →":"Next →"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   8. HOME / GARDEN DASHBOARD
   ============================================================================ */
function Toggle({ active, color, soft, onClick, children }){
  return (
    <button onClick={onClick} className="md-btn"
      style={{background:active?soft:"#fff",border:`2px solid ${active?color:C.line}`,
      color:active?color:C.plumSoft,padding:"9px 15px",borderRadius:14,fontWeight:700,fontSize:".85rem"}}>
      {children}
    </button>
  );
}
function ModeCard({ emoji, title, desc, accent, onClick, badge, disabled }){
  return (
    <button onClick={onClick} disabled={disabled} className="md-btn md-card"
      style={{textAlign:"left",padding:"18px",borderRadius:22,border:"1px solid "+C.line,
      background:"linear-gradient(160deg,#fff, "+accent+"22)",display:"flex",flexDirection:"column",gap:6,
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
    <div style={{background:"#fff",border:"1px solid "+C.line,borderRadius:18,padding:"12px 16px",
      display:"flex",flexDirection:"column",alignItems:"center",minWidth:96,flex:1}}>
      <div style={{fontSize:"1.4rem"}}>{emoji}</div>
      <div className="md-serif" style={{fontSize:"1.5rem",fontWeight:600,color:C.roseDeep,lineHeight:1.1}}>{big}</div>
      <div style={{fontSize:".7rem",color:C.plumSoft,fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"}}>{label}</div>
    </div>
  );
}

function Home({ sections,setSections, diffs,setDiffs, length,setLength, garden, weakCount, avail, launch }){
  function toggleIn(arr,setArr,val){ setArr(arr.includes(val)?arr.filter(x=>x!==val):[...arr,val]); }
  const lengths=[10,25,50,0]; // 0 = full
  return (
    <div className="md-fadein">
      {/* Hero */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:6,flexWrap:"wrap"}}>
        <div style={{position:"relative"}}>
          <Flower size={52} sway color={C.roseDeep} center={C.gold}/>
        </div>
        <div style={{flex:1,minWidth:200}}>
          <h1 className="md-serif" style={{margin:0,fontSize:"2.5rem",fontWeight:600,color:C.ink,letterSpacing:"-.01em"}}>
            Med<span style={{color:C.roseDeep}}>Deck</span>
          </h1>
          <div style={{color:C.plumSoft,fontWeight:600,marginTop:-2}}>tend your knowledge garden 🌸 · a high-yield MCAT study space</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"flex",gap:12,margin:"18px 0",flexWrap:"wrap"}}>
        <StatPod big={garden} label="petals bloomed" emoji="🌸"/>
        <StatPod big={BANK.length} label="curated cards" emoji="📚"/>
        <StatPod big={avail} label="in your mix" emoji="🌿"/>
        <StatPod big={weakCount} label="weak spots" emoji="🥀"/>
      </div>

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
          onClick={()=>launch("quiz",true)}/>
        <ModeCard emoji="☕" title="Warm-Up" accent="#9ac6ff"
          desc="Light science trivia, live from the Open Trivia DB. A gentle brain-warmer before the real work."
          onClick={()=>launch("warmup",false)}/>
      </div>

      <div style={{textAlign:"center",color:C.plumSoft,fontSize:".78rem",marginTop:26,lineHeight:1.6}}>
        🌸 iyaDeck · {BANK.length} curated MCAT questions across B/B, C/P & P/S · built to help you grow ·<br/>
        <span style={{opacity:.8}}>Study tool for exam prep — always corroborate with official AAMC materials.</span>
      </div>
    </div>
  );
}

/* ============================================================================
   9. MAIN APP
   ============================================================================ */
export default function MedDeck(){
  const [view,setView]=useState("home"); // home | flash | quiz | match | triage | warmup
  const [sections,setSections]=useState(["BB","CP","PS"]);
  const [diffs,setDiffs]=useState(["foundation","medium","hard"]);
  const [length,setLength]=useState(25);
  const [garden,setGarden]=useState(0);
  const [weak,setWeak]=useState(()=>new Set());
  const [starred,setStarred]=useState(()=>new Set());
  const [deck,setDeck]=useState([]);

  // inject styles once
  useEffect(()=>{
    if(document.getElementById("md-style")) return;
    const el=document.createElement("style"); el.id="md-style"; el.textContent=CSS;
    document.head.appendChild(el);
  },[]);

  const filtered = useMemo(()=>BANK.filter(q=>
    sections.includes(q.section) && diffs.includes(q.difficulty)),[sections,diffs]);

  const bloom=useCallback(n=>setGarden(g=>g+n),[]);
  const addWeak=useCallback(id=>setWeak(w=>new Set(w).add(id)),[]);
  const toggleStar=useCallback(id=>setStarred(s=>{
    const n=new Set(s); n.has(id)?n.delete(id):n.add(id);
    return n;
  }),[]);
  // starring also seeds weak-spots deck
  const toggleStarAndWeak=useCallback(id=>{
    toggleStar(id);
    setWeak(w=>{ const n=new Set(w); n.add(id); return n; });
  },[toggleStar]);

  function launch(mode, useWeak){
    if(mode==="match"||mode==="warmup"){ setView(mode); return; }
    let pool;
    if(useWeak){
      const ids=new Set([...weak,...starred]);
      pool=BANK.filter(q=>ids.has(q.id));
    } else pool=filtered;
    let d=shuffle(pool);
    if(length && length>0) d=d.slice(0,length);
    if(d.length===0) return;
    setDeck(d); setView(mode);
  }
  const exit=()=>setView("home");
  const weakCount=new Set([...weak,...starred]).size;

  return (
    <div className="md-root">
      <div className="md-wrap md-scroll">
        {view==="home" && (
          <Home sections={sections} setSections={setSections} diffs={diffs} setDiffs={setDiffs}
            length={length} setLength={setLength} garden={garden} weakCount={weakCount}
            avail={filtered.length} launch={launch}/>
        )}
        {view==="flash" && (
          <FlashcardMode deck={deck} onExit={exit} onBloom={bloom} starred={starred} toggleStar={toggleStarAndWeak}/>
        )}
        {view==="quiz" && (
          <QuizMode deck={deck} onExit={exit} onBloom={bloom} onWeak={addWeak} starred={starred} toggleStar={toggleStarAndWeak}/>
        )}
        {view==="match" && (
          <MatchMode sections={sections} onExit={exit} onBloom={bloom}/>
        )}
        {view==="triage" && (
          <TriageMode deck={deck} onExit={exit} onBloom={bloom} onWeak={addWeak}/>
        )}
        {view==="warmup" && (
          <WarmUpMode onExit={exit} onBloom={bloom}/>
        )}
      </div>
    </div>
  );
}
