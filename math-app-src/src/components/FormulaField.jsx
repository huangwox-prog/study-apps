// ヒーローの背面に敷く「式の壁」。
// 公式・実際に数を入れた途中式・簡単な図を、大小をつけて画面の外まで
// はみ出すように敷き詰める。読み込み時に順に浮かび上がり、そのあとは
// 各要素が別々の周期で漂う。スクロールでは奥行きごとに違う速さで動き、
// 触れた式は起き上がって色を持つ。
import React from "react";
import { Tex } from "./Tex.jsx";

const A = (lines) => `\\begin{aligned}${lines.join(" \\\\ ")}\\end{aligned}`;

// 図版:数学Iで実際に描く図を、線だけの手つきで置く
const FIGURES = {
  // 直角三角形と三平方
  right: (
    <svg viewBox="0 0 120 96" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 84h92L12 16z" strokeLinejoin="round" />
      <path d="M12 72h12v12" strokeWidth="1.2" />
      <text x="58" y="94" fontSize="11" stroke="none" fill="currentColor">a</text>
      <text x="2" y="52" fontSize="11" stroke="none" fill="currentColor">b</text>
      <text x="62" y="44" fontSize="11" stroke="none" fill="currentColor">c</text>
    </svg>
  ),
  // 単位円と角
  circle: (
    <svg viewBox="0 0 110 110" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="55" cy="55" r="42" />
      <path d="M13 55h84M55 13v84" strokeWidth="0.9" opacity="0.5" />
      <path d="M55 55l36-22" />
      <path d="M70 55a17 17 0 00-5-12" strokeWidth="1.1" />
      <text x="72" y="50" fontSize="11" stroke="none" fill="currentColor">θ</text>
    </svg>
  ),
  // 放物線と頂点
  parabola: (
    <svg viewBox="0 0 130 100" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M8 88h114M65 8v84" strokeWidth="0.9" opacity="0.5" />
      <path d="M18 14Q65 128 112 14" />
      <circle cx="65" cy="71" r="3.4" fill="currentColor" stroke="none" />
      <path d="M65 71h47" strokeWidth="0.9" strokeDasharray="3 4" opacity="0.7" />
    </svg>
  ),
  // 三角形の面積(2辺と挟む角)
  triangle: (
    <svg viewBox="0 0 124 96" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M14 84L58 12l52 72z" strokeLinejoin="round" />
      <path d="M26 84a26 26 0 0112-22" strokeWidth="1.1" />
      <text x="30" y="76" fontSize="10" stroke="none" fill="currentColor">A</text>
      <text x="30" y="44" fontSize="11" stroke="none" fill="currentColor">c</text>
      <text x="90" y="44" fontSize="11" stroke="none" fill="currentColor">b</text>
    </svg>
  ),
};

// x, y は中心位置(%)。画面外にはみ出す配置(0未満・100超)も意図的に使う。
// size は基準サイズ倍率、tone は濃淡、depth はスクロール視差、
// tier は密度の段階(狭い画面では大きい tier から間引く)。
const ITEMS = [
  // ── 大きく、断ち落とす主役 ──
  { tex: "a^2 + b^2 = c^2", x: 50, y: 4, rot: 1, size: 1, tone: "ink", depth: 0.95, tier: 1 },
  { tex: "\\sqrt{12} = 2\\sqrt{3}", x: 6, y: 30, rot: 2, size: 1, tone: "arc1", depth: 0.8, tier: 1 },
  { tex: "S = \\frac{1}{2}bc\\sin A", x: 93, y: 47, rot: -2, size: 0.95, tone: "arc3", depth: 0.85, tier: 1 },
  { tex: "y = a(x-p)^2 + q", x: 12, y: 60, rot: 1, size: 0.82, tone: "arc2", depth: 0.95, tier: 1 },
  { tex: "\\sin^2\\theta + \\cos^2\\theta = 1", x: 86, y: 13, rot: 2, size: 0.7, tone: "arc3", depth: 0.9, tier: 1 },

  // ── 中くらい ──
  { tex: "(a+b)^2 = a^2 + 2ab + b^2", x: 20, y: 15, rot: -2, size: 0.6, tone: "arc1", depth: 0.9, tier: 1 },
  { tex: "a^2 = b^2 + c^2 - 2bc\\cos A", x: 80, y: 30, rot: -1, size: 0.58, tone: "arc3", depth: 0.9, tier: 1 },
  { tex: "a^2 - b^2 = (a+b)(a-b)", x: 17, y: 76, rot: -1, size: 0.6, tone: "arc1", depth: 0.8, tier: 2 },
  { tex: "x^2 + bx = \\left(x+\\frac{b}{2}\\right)^2 - \\frac{b^2}{4}", x: 42, y: 95, rot: -1, size: 0.55, tone: "ink", depth: 0.9, tier: 1 },
  { tex: "\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}", x: 90, y: 86, rot: -2, size: 0.6, tone: "ghost", depth: 0.5, tier: 2 },
  { tex: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = 2R", x: 8, y: 92, rot: 2, size: 0.5, tone: "ghost", depth: 0.5, tier: 2 },
  { tex: "|x-2| < 3 \\iff -1 < x < 5", x: 96, y: 66, rot: 1, size: 0.45, tone: "ghost", depth: 0.5, tier: 3 },

  // ── 小さい途中式(黒板の隅の計算) ──
  { tex: A(["x^2 - 5x + 6 &= 0", "(x-2)(x-3) &= 0", "x &= 2,\\ 3"]), x: 86, y: 74, rot: -1, size: 0.4, tone: "ink", depth: 0.8, tier: 1 },
  { tex: A(["x^2 - 4x + 1 &= (x-2)^2 - 3", "\\therefore\\ \\text{頂点}\\ &(2,\\,-3)"]), x: 15, y: 88, rot: 1, size: 0.36, tone: "ghost", depth: 0.5, tier: 2 },
  { tex: A(["3^2 + 4^2 &= 25 = 5^2", "\\therefore\\ c &= 5"]), x: 71, y: 96, rot: 1, size: 0.34, tone: "ghost", depth: 0.45, tier: 3 },
  { tex: A(["a^2 &= 3^2 + 4^2 - 2\\cdot3\\cdot4\\cos 60^\\circ", "&= 25 - 12 = 13"]), x: 26, y: 33, rot: -1, size: 0.3, tone: "ghost", depth: 0.4, tier: 3 },
  { tex: A(["S &= \\tfrac12\\cdot 6\\cdot 8\\cdot\\sin 30^\\circ", "&= 12"]), x: 74, y: 58, rot: 1, size: 0.3, tone: "ghost", depth: 0.4, tier: 3 },
  { tex: "D = b^2 - 4ac", x: 30, y: 90, rot: 2, size: 0.42, tone: "ghost", depth: 0.5, tier: 3 },
  { tex: "\\frac{3}{\\sqrt{2}} = \\frac{3\\sqrt{2}}{2}", x: 68, y: 8, rot: -2, size: 0.4, tone: "ghost", depth: 0.5, tier: 3 },
  { tex: "\\sin 60^\\circ = \\frac{\\sqrt3}{2}", x: 33, y: 6, rot: 1, size: 0.4, tone: "ghost", depth: 0.45, tier: 3 },
  { tex: "\\alpha+\\beta = -\\frac{b}{a},\\ \\alpha\\beta = \\frac{c}{a}", x: 62, y: 88, rot: 1, size: 0.36, tone: "ghost", depth: 0.45, tier: 3 },
  { tex: "(x+a)(x+b) = x^2 + (a+b)x + ab", x: 30, y: 24, rot: -1, size: 0.34, tone: "ghost", depth: 0.4, tier: 3 },

  // ── 図版 ──
  { fig: "right", x: 5, y: 44, rot: -3, size: 1.15, tone: "ghost", depth: 0.6, tier: 2 },
  { fig: "circle", x: 96, y: 88, rot: 2, size: 1.1, tone: "ghost", depth: 0.55, tier: 2 },
  { fig: "parabola", x: 62, y: 20, rot: -2, size: 1, tone: "ghost", depth: 0.5, tier: 3 },
  { fig: "triangle", x: 36, y: 84, rot: 3, size: 0.95, tone: "ghost", depth: 0.5, tier: 3 },

  // ── 中央の地(コピーの背後にうっすら) ──
  { tex: "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}", x: 50, y: 40, rot: -1, size: 1.05, tone: "faint", depth: 0.3, tier: 2 },
];

export default function FormulaField() {
  return (
    <div className="formula-wall" aria-hidden="true">
      {/* ブランドの弧を式の背後に残す */}
      <div className="wall-ring wall-ring-a" />
      <div className="wall-ring wall-ring-b" />

      {ITEMS.map((f, i) => (
        <span
          key={f.tex || `fig-${f.fig}-${i}`}
          // 狭い画面ではコピーに重なる中央帯の要素を落とす
          className={`ff-item ff-${f.tone} ff-tier${f.tier}${f.y > 26 && f.y < 80 && f.x > 12 && f.x < 88 ? " ff-mid" : ""}`}
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            "--depth": f.depth,
            "--delay": `${0.1 + i * 0.04}s`,
            "--float-dur": `${8 + (i % 6) * 1.5}s`,
          }}
        >
          <span className="ff-float">
            <span className="ff-rot" style={{ "--rot": `${f.rot}deg`, "--size": f.size }}>
              {f.fig ? <span className="ff-fig">{FIGURES[f.fig]}</span> : <Tex latex={f.tex} />}
            </span>
          </span>
        </span>
      ))}

      {/* コピーが載る中央だけ紙の地をかぶせて可読性を確保する */}
      <div className="formula-wall-veil" />
    </div>
  );
}
