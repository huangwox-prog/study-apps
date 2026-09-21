// 口頭試問ドリル: 三角比の方程式(0° ≦ θ ≦ 180°)
import { CATEGORY, MOVE } from "./vocab.js";

const TE = { field: "trieq", category: CATEGORY.TRI_EQ, firstMove: MOVE.TRI_UNIT_CIRCLE };

export default [
  // ---------- 三角比の方程式(6) ----------
  {
    ...TE,
    id: "trieq-01",
    q: "$0^\\circ \\leqq \\theta \\leqq 180^\\circ$ のとき、$\\sin\\theta = \\dfrac{1}{2}$ を満たす $\\theta$ を求めよ。",
    a: "$\\theta = 30^\\circ,\\ 150^\\circ$",
    solution: [
      "半円上で $y$ 座標が $\\dfrac{1}{2}$ の点は左右に2つある",
      "右の点は $30^\\circ$、左の点は $180^\\circ - 30^\\circ = 150^\\circ$",
      "$\\theta = 30^\\circ,\\ 150^\\circ$",
    ],
  },
  {
    ...TE,
    id: "trieq-02",
    q: "$0^\\circ \\leqq \\theta \\leqq 180^\\circ$ のとき、$\\sin\\theta = \\dfrac{\\sqrt{3}}{2}$ を満たす $\\theta$ を求めよ。",
    a: "$\\theta = 60^\\circ,\\ 120^\\circ$",
    solution: [
      "半円上で $y$ 座標が $\\dfrac{\\sqrt{3}}{2}$ の点は2つ",
      "右は $60^\\circ$、左は $180^\\circ - 60^\\circ = 120^\\circ$",
      "$\\theta = 60^\\circ,\\ 120^\\circ$",
    ],
  },
  {
    ...TE,
    id: "trieq-03",
    q: "$0^\\circ \\leqq \\theta \\leqq 180^\\circ$ のとき、$\\cos\\theta = -\\dfrac{1}{\\sqrt{2}}$ を満たす $\\theta$ を求めよ。",
    a: "$\\theta = 135^\\circ$",
    solution: [
      "半円上で $x$ 座標が $-\\dfrac{1}{\\sqrt{2}}$ の点は1つ(左側)",
      "$\\cos 45^\\circ = \\dfrac{1}{\\sqrt{2}}$ なので、その点は $180^\\circ - 45^\\circ$",
      "$\\theta = 135^\\circ$",
    ],
  },
  {
    ...TE,
    id: "trieq-04",
    q: "$0^\\circ \\leqq \\theta \\leqq 180^\\circ$ のとき、$2\\cos\\theta + \\sqrt{3} = 0$ を満たす $\\theta$ を求めよ。",
    a: "$\\theta = 150^\\circ$",
    solution: [
      "$\\cos\\theta = -\\dfrac{\\sqrt{3}}{2}$",
      "半円上で $x$ 座標が $-\\dfrac{\\sqrt{3}}{2}$ の点は $180^\\circ - 30^\\circ$",
      "$\\theta = 150^\\circ$",
    ],
  },
  {
    ...TE,
    id: "trieq-05",
    q: "$0^\\circ \\leqq \\theta \\leqq 180^\\circ$ のとき、$\\tan\\theta = \\sqrt{3}$ を満たす $\\theta$ を求めよ。",
    a: "$\\theta = 60^\\circ$",
    solution: [
      "直線 $x = 1$ 上の点 $(1,\\ \\sqrt{3})$ と原点を結ぶ",
      "その直線と半円の交点の角は $60^\\circ$",
      "$\\theta = 60^\\circ$",
    ],
  },
  {
    ...TE,
    id: "trieq-06",
    q: "$0^\\circ \\leqq \\theta \\leqq 180^\\circ$ のとき、$\\tan\\theta = -1$ を満たす $\\theta$ を求めよ。",
    a: "$\\theta = 135^\\circ$",
    solution: [
      "直線 $x = 1$ 上の点 $(1,\\ -1)$ と原点を結ぶ直線を、左上に延ばす",
      "半円との交点は $180^\\circ - 45^\\circ$",
      "$\\theta = 135^\\circ$",
    ],
  },
];
