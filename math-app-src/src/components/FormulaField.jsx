// ヒーローの背面に敷く「式の壁」。
// 数学I で使う公式を黒板の落書きのように角度も大きさもばらばらに散らし、
// 読み込み時に順に浮かび上がらせる。そのあとは各式が別々の周期で漂い、
// スクロールでは奥行きごとに違う速さで動く。触れた式だけが起き上がる。
import React from "react";
import { Tex } from "./Tex.jsx";

// x, y は中心位置(%)。rot は傾き、size は基準サイズ倍率。
// tone: ink / arc1・arc2・arc3(分野色) / ghost(奥の下地)。
// depth はスクロール視差の強さ。tier は密度の段階で、狭い画面ほど間引く。
const FORMULAS = [
  // ── 数と式 ──
  { tex: "(a+b)^2 = a^2 + 2ab + b^2", x: 22, y: 9, rot: -5, size: 1.1, tone: "arc1", depth: 0.9, tier: 1 },
  { tex: "a^2 - b^2 = (a+b)(a-b)", x: 72, y: 6, rot: 4, size: 1.05, tone: "ink", depth: 0.85, tier: 1 },
  { tex: "(x+a)(x+b) = x^2 + (a+b)x + ab", x: 47, y: 14, rot: -2, size: 0.95, tone: "ghost", depth: 0.5, tier: 2 },
  { tex: "a^2 + b^2 = (a+b)^2 - 2ab", x: 88, y: 20, rot: 7, size: 0.92, tone: "ghost", depth: 0.45, tier: 3 },
  { tex: "\\frac{1}{\\sqrt{a}} = \\frac{\\sqrt{a}}{a}", x: 8, y: 22, rot: 6, size: 0.95, tone: "ghost", depth: 0.5, tier: 2 },
  { tex: "\\sqrt{a^2} = |a|", x: 92, y: 44, rot: -6, size: 0.95, tone: "arc1", depth: 0.7, tier: 2 },
  { tex: "|x| < a \\iff -a < x < a", x: 12, y: 47, rot: -4, size: 0.98, tone: "ghost", depth: 0.55, tier: 2 },
  { tex: "n(A\\cup B) = n(A) + n(B) - n(A\\cap B)", x: 78, y: 88, rot: -3, size: 0.9, tone: "ghost", depth: 0.4, tier: 3 },

  // ── 二次関数 ──
  { tex: "y = a(x-p)^2 + q", x: 16, y: 68, rot: -6, size: 1.15, tone: "arc2", depth: 0.95, tier: 1 },
  { tex: "x^2 + bx = \\left(x+\\frac{b}{2}\\right)^2 - \\frac{b^2}{4}", x: 74, y: 33, rot: 3, size: 1.12, tone: "ink", depth: 1, tier: 1 },
  { tex: "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}", x: 27, y: 84, rot: 4, size: 1.18, tone: "ink", depth: 1, tier: 1 },
  { tex: "D = b^2 - 4ac", x: 60, y: 74, rot: -5, size: 1.05, tone: "arc2", depth: 0.8, tier: 1 },
  { tex: "\\alpha+\\beta = -\\frac{b}{a},\\ \\alpha\\beta = \\frac{c}{a}", x: 86, y: 62, rot: 5, size: 0.92, tone: "ghost", depth: 0.45, tier: 3 },
  { tex: "\\left(-\\frac{b}{2a},\\ -\\frac{b^2-4ac}{4a}\\right)", x: 45, y: 94, rot: 2, size: 0.9, tone: "ghost", depth: 0.4, tier: 3 },

  // ── 三角比 ──
  { tex: "\\sin^2\\theta + \\cos^2\\theta = 1", x: 84, y: 12, rot: -7, size: 1.05, tone: "arc3", depth: 0.85, tier: 1 },
  { tex: "\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}", x: 6, y: 84, rot: 8, size: 0.95, tone: "ghost", depth: 0.5, tier: 2 },
  { tex: "a^2 = b^2 + c^2 - 2bc\\cos A", x: 70, y: 52, rot: 4, size: 1.08, tone: "arc3", depth: 0.9, tier: 1 },
  { tex: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R", x: 26, y: 33, rot: -3, size: 1, tone: "ghost", depth: 0.55, tier: 2 },
  { tex: "S = \\frac{1}{2}bc\\sin A", x: 90, y: 76, rot: -6, size: 1.02, tone: "arc3", depth: 0.7, tier: 2 },
  { tex: "\\sin(90^\\circ-\\theta) = \\cos\\theta", x: 10, y: 58, rot: 5, size: 0.92, tone: "ghost", depth: 0.45, tier: 3 },
];

export default function FormulaField() {
  return (
    <div className="formula-wall" aria-hidden="true">
      {/* ブランドの弧を式の背後に残す */}
      <div className="wall-ring wall-ring-a" />
      <div className="wall-ring wall-ring-b" />

      {FORMULAS.map((f, i) => (
        <span
          key={f.tex}
          // 狭い画面ではコピーに重なる中央帯の式を落とす
          className={`ff-item ff-${f.tone} ff-tier${f.tier}${f.y > 26 && f.y < 80 ? " ff-mid" : ""}`}
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            "--depth": f.depth,
            "--delay": `${0.15 + i * 0.055}s`,
            "--float-dur": `${8 + (i % 6) * 1.5}s`,
          }}
        >
          <span className="ff-float">
            <span className="ff-rot" style={{ "--rot": `${f.rot}deg`, "--size": f.size }}>
              <Tex latex={f.tex} />
            </span>
          </span>
        </span>
      ))}

      {/* コピーが載る中央だけ紙の地をかぶせて可読性を確保する */}
      <div className="formula-wall-veil" />
    </div>
  );
}
