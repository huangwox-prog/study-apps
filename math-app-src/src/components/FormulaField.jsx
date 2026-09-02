// ヒーローの背面に敷く「式の壁」。
// 公式だけでなく、実際に数を入れて解いた途中式も混ぜ、黒板のように
// びっしり書き散らす。読み込み時に順に浮かび上がり、そのあとは各式が
// 別々の周期で漂う。スクロールでは奥行きごとに違う速さで動き、触れた式は
// 起き上がって色を持つ。
import React from "react";
import { Tex } from "./Tex.jsx";

// x, y は中心位置(%)。rot は傾き(黒板の手書きらしさの範囲に抑える)。
// size は基準サイズ倍率、tone は濃淡、depth はスクロール視差の強さ。
// tier は密度の段階で、画面が狭いほど大きい tier から間引く。
const A = (lines) => `\\begin{aligned}${lines.join(" \\\\ ")}\\end{aligned}`;

const FORMULAS = [
  // 中央はコピーが載るので、式は左右の帯と上下の縁に寄せて敷き詰める。
  // 中央に置くのは、地として沈める faint の式だけ。

  // ── 左の帯 ──
  { tex: "(a+b)^2 = a^2 + 2ab + b^2", x: 15, y: 7, rot: -2, size: 1.2, tone: "arc1", depth: 0.9, tier: 1 },
  { tex: A(["(x+3)^2 &= x^2 + 6x + 9", "(x-4)(x+4) &= x^2 - 16"]), x: 13, y: 19, rot: 1, size: 1, tone: "ghost", depth: 0.5, tier: 2 },
  { tex: "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}", x: 14, y: 32, rot: -1, size: 1.32, tone: "ink", depth: 1, tier: 1 },
  { tex: "\\sqrt{12} = 2\\sqrt{3}", x: 9, y: 44, rot: 2, size: 1.15, tone: "arc1", depth: 0.7, tier: 2 },
  { tex: "|x-2| < 3 \\iff -1 < x < 5", x: 15, y: 54, rot: 1, size: 1, tone: "ghost", depth: 0.5, tier: 3 },
  { tex: "y = a(x-p)^2 + q", x: 12, y: 66, rot: 1, size: 1.3, tone: "arc2", depth: 0.95, tier: 1 },
  { tex: A(["a^2 &= 3^2 + 4^2 - 2\\cdot3\\cdot4\\cos 60^\\circ", "&= 25 - 12 = 13"]), x: 17, y: 79, rot: -1, size: 1, tone: "ghost", depth: 0.45, tier: 2 },
  { tex: "a^2 - b^2 = (a+b)(a-b)", x: 14, y: 92, rot: 1, size: 1.18, tone: "arc1", depth: 0.8, tier: 2 },

  // ── 右の帯 ──
  { tex: "\\sin^2\\theta + \\cos^2\\theta = 1", x: 85, y: 8, rot: 2, size: 1.2, tone: "arc3", depth: 0.9, tier: 1 },
  { tex: "\\frac{3}{\\sqrt{2}} = \\frac{3\\sqrt{2}}{2}", x: 91, y: 20, rot: -2, size: 1.1, tone: "ghost", depth: 0.5, tier: 3 },
  { tex: "a^2 = b^2 + c^2 - 2bc\\cos A", x: 84, y: 31, rot: 1, size: 1.22, tone: "arc3", depth: 0.9, tier: 1 },
  { tex: A(["3^2 + 4^2 &= 25 = 5^2", "\\therefore\\ c &= 5"]), x: 88, y: 43, rot: -1, size: 1, tone: "ghost", depth: 0.5, tier: 2 },
  { tex: "\\sin 60^\\circ = \\frac{\\sqrt3}{2},\\ \\cos 60^\\circ = \\frac{1}{2}", x: 84, y: 55, rot: 1, size: 1, tone: "ghost", depth: 0.45, tier: 3 },
  { tex: "S = \\frac{1}{2}bc\\sin A", x: 88, y: 67, rot: 2, size: 1.28, tone: "arc3", depth: 0.85, tier: 1 },
  { tex: A(["x^2 - 5x + 6 &= 0", "(x-2)(x-3) &= 0", "x &= 2,\\ 3"]), x: 87, y: 80, rot: -1, size: 1, tone: "ink", depth: 0.8, tier: 1 },
  { tex: "\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}", x: 90, y: 93, rot: -2, size: 1.12, tone: "ghost", depth: 0.5, tier: 2 },

  // ── 上下の縁 ──
  { tex: "a^2 + b^2 = c^2", x: 50, y: 3, rot: 1, size: 1.35, tone: "ink", depth: 0.95, tier: 1 },
  { tex: "x^2 + bx = \\left(x+\\frac{b}{2}\\right)^2 - \\frac{b^2}{4}", x: 50, y: 97, rot: -1, size: 1.2, tone: "ink", depth: 0.9, tier: 1 },
  { tex: "\\alpha+\\beta = -\\frac{b}{a},\\quad \\alpha\\beta = \\frac{c}{a}", x: 68, y: 92, rot: 2, size: 1, tone: "ghost", depth: 0.45, tier: 3 },
  { tex: "D = b^2 - 4ac", x: 32, y: 92, rot: -2, size: 1.1, tone: "ghost", depth: 0.5, tier: 3 },

  // ── 中央の地(コピーの背後で、うっすら見える程度) ──
  { tex: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = 2R", x: 42, y: 22, rot: 1, size: 1.05, tone: "faint", depth: 0.35, tier: 2 },
  { tex: A(["x^2 - 4x + 1 &= (x-2)^2 - 3", "\\therefore\\ &(2,\\,-3)"]), x: 60, y: 66, rot: -1, size: 1.05, tone: "faint", depth: 0.35, tier: 2 },
  { tex: A(["S &= \\tfrac12 \\cdot 6 \\cdot 8 \\cdot \\sin 30^\\circ", "&= 12"]), x: 38, y: 78, rot: 1, size: 1, tone: "faint", depth: 0.3, tier: 3 },
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
            "--delay": `${0.12 + i * 0.05}s`,
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
