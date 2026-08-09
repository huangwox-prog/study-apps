// 口頭試問ドリル: 二次方程式 / 判別式と実数解の個数 / 二次不等式
import { CATEGORY, MOVE } from "./vocab.js";

const EQ = { field: "qeq", category: CATEGORY.Q_EQ, firstMove: MOVE.QEQ };
const DR = { field: "disc", category: CATEGORY.DOUBLE_ROOT, firstMove: MOVE.DISC_ZERO };
const T2 = { field: "disc", category: CATEGORY.TWO_ROOTS, firstMove: MOVE.DISC_POS };
const NR = { field: "disc", category: CATEGORY.REAL_ROOT_COUNT, firstMove: MOVE.DISC_SIGN };
const AT = { field: "disc", category: CATEGORY.ALWAYS_TRUE, firstMove: MOVE.DISC_NEG };
const IS = { field: "disc", category: CATEGORY.INTERSECTION, firstMove: MOVE.DISC_SIGN };
const QI = { field: "qineq", category: CATEGORY.Q_INEQ, firstMove: MOVE.FACTOR_THEN_SIGN };

export default [
  // ---------- 二次方程式(16) ----------
  {
    ...EQ,
    id: "qeq-01",
    q: "$x^2 - 5x + 6 = 0$ を解け。",
    a: "$x = 2,\\ 3$",
    solution: ["$(x - 2)(x - 3) = 0$", "$x = 2,\\ 3$"],
  },
  {
    ...EQ,
    id: "qeq-02",
    q: "$x^2 + 3x - 10 = 0$ を解け。",
    a: "$x = 2,\\ -5$",
    solution: ["$(x - 2)(x + 5) = 0$", "$x = 2,\\ -5$"],
  },
  {
    ...EQ,
    id: "qeq-03",
    q: "$x^2 - 7x = 0$ を解け。",
    a: "$x = 0,\\ 7$",
    solution: ["共通因数 $x$ をくくって $x(x - 7) = 0$", "$x = 0,\\ 7$"],
  },
  {
    ...EQ,
    id: "qeq-04",
    q: "$x^2 - 9 = 0$ を解け。",
    a: "$x = \\pm 3$",
    solution: ["$(x + 3)(x - 3) = 0$", "$x = \\pm 3$"],
  },
  {
    ...EQ,
    id: "qeq-05",
    q: "$2x^2 - 5x + 2 = 0$ を解け。",
    a: "$x = \\dfrac{1}{2},\\ 2$",
    solution: ["たすき掛けで $(2x - 1)(x - 2) = 0$", "$x = \\dfrac{1}{2},\\ 2$"],
  },
  {
    ...EQ,
    id: "qeq-06",
    q: "$3x^2 + 5x - 2 = 0$ を解け。",
    a: "$x = \\dfrac{1}{3},\\ -2$",
    solution: ["たすき掛けで $(3x - 1)(x + 2) = 0$", "$x = \\dfrac{1}{3},\\ -2$"],
  },
  {
    ...EQ,
    id: "qeq-07",
    q: "$x^2 - 4x + 1 = 0$ を解け。",
    a: "$x = 2 \\pm \\sqrt{3}$",
    solution: [
      "因数分解できないので解の公式($b$ が偶数なので $\\dfrac{D}{4}$ を使う)",
      "$x = 2 \\pm \\sqrt{4 - 1}$",
      "$x = 2 \\pm \\sqrt{3}$",
    ],
  },
  {
    ...EQ,
    id: "qeq-08",
    q: "$x^2 + 2x - 4 = 0$ を解け。",
    a: "$x = -1 \\pm \\sqrt{5}$",
    solution: ["$x = -1 \\pm \\sqrt{1 + 4}$", "$x = -1 \\pm \\sqrt{5}$"],
  },
  {
    ...EQ,
    id: "qeq-09",
    q: "$2x^2 - 5x + 1 = 0$ を解け。",
    a: "$x = \\dfrac{5 \\pm \\sqrt{17}}{4}$",
    solution: [
      "因数分解できないので解の公式",
      "$x = \\dfrac{5 \\pm \\sqrt{25 - 8}}{4}$",
      "$x = \\dfrac{5 \\pm \\sqrt{17}}{4}$",
    ],
  },
  {
    ...EQ,
    id: "qeq-10",
    q: "$3x^2 - 2x - 2 = 0$ を解け。",
    a: "$x = \\dfrac{1 \\pm \\sqrt{7}}{3}$",
    solution: [
      "$x = \\dfrac{2 \\pm \\sqrt{4 + 24}}{6}$",
      "$= \\dfrac{2 \\pm 2\\sqrt{7}}{6}$",
      "$= \\dfrac{1 \\pm \\sqrt{7}}{3}$",
    ],
  },
  {
    ...EQ,
    id: "qeq-11",
    q: "$x^2 - 6x + 9 = 0$ を解け。",
    a: "$x = 3$(重解)",
    solution: ["$(x - 3)^2 = 0$", "$x = 3$(重解)"],
  },
  {
    ...EQ,
    id: "qeq-12",
    q: "$4x^2 - 12x + 9 = 0$ を解け。",
    a: "$x = \\dfrac{3}{2}$(重解)",
    solution: ["$(2x - 3)^2 = 0$", "$x = \\dfrac{3}{2}$(重解)"],
  },
  {
    ...EQ,
    id: "qeq-13",
    q: "$x^2 + x - 1 = 0$ を解け。",
    a: "$x = \\dfrac{-1 \\pm \\sqrt{5}}{2}$",
    solution: [
      "因数分解できないので解の公式",
      "$x = \\dfrac{-1 \\pm \\sqrt{1 + 4}}{2} = \\dfrac{-1 \\pm \\sqrt{5}}{2}$",
    ],
  },
  {
    ...EQ,
    id: "qeq-14",
    q: "$(x - 1)(x + 3) = 5$ を解け。",
    a: "$x = -4,\\ 2$",
    solution: [
      "展開して右辺を $0$ に: $x^2 + 2x - 8 = 0$",
      "$(x + 4)(x - 2) = 0$",
      "$x = -4,\\ 2$",
    ],
  },
  {
    ...EQ,
    id: "qeq-15",
    q: "$x^2 = 3x + 18$ を解け。",
    a: "$x = 6,\\ -3$",
    solution: ["$x^2 - 3x - 18 = 0$", "$(x - 6)(x + 3) = 0$", "$x = 6,\\ -3$"],
  },
  {
    ...EQ,
    id: "qeq-16",
    q: "$3x^2 - 6x + 2 = 0$ を解け。",
    a: "$x = \\dfrac{3 \\pm \\sqrt{3}}{3}$",
    solution: [
      "$x = \\dfrac{6 \\pm \\sqrt{36 - 24}}{6}$",
      "$= \\dfrac{6 \\pm 2\\sqrt{3}}{6}$",
      "$= \\dfrac{3 \\pm \\sqrt{3}}{3}$",
    ],
  },

  // ---------- 判別式と実数解の個数(18) ----------
  {
    ...DR,
    id: "disc-01",
    q: "$x^2 + 8x + k = 0$ が重解を持つときの $k$ を求めよ。",
    a: "$k = 16$",
    solution: ["$D = 64 - 4k = 0$", "$k = 16$"],
  },
  {
    ...DR,
    id: "disc-02",
    q: "$x^2 - 2x + k = 0$ が重解を持つときの $k$ を求めよ。",
    a: "$k = 1$",
    solution: ["$\\dfrac{D}{4} = 1 - k = 0$", "$k = 1$"],
  },
  {
    ...DR,
    id: "disc-03",
    q: "$4x^2 + kx + 9 = 0$ が重解を持つときの $k$ を求めよ。",
    a: "$k = \\pm 12$",
    solution: ["$D = k^2 - 4\\cdot 4\\cdot 9 = k^2 - 144 = 0$", "$k^2 = 144$", "$k = \\pm 12$"],
  },
  {
    ...DR,
    id: "disc-04",
    q: "$x^2 + kx + k + 3 = 0$ が重解を持つときの $k$ を求めよ。",
    a: "$k = 6,\\ -2$",
    solution: [
      "$D = k^2 - 4(k + 3) = k^2 - 4k - 12 = 0$",
      "$(k - 6)(k + 2) = 0$",
      "$k = 6,\\ -2$",
    ],
  },
  {
    ...T2,
    id: "disc-05",
    q: "$x^2 - 3x + k = 0$ が異なる2つの実数解を持つときの $k$ の範囲を求めよ。",
    a: "$k < \\dfrac{9}{4}$",
    solution: ["$D = 9 - 4k > 0$", "$k < \\dfrac{9}{4}$"],
  },
  {
    ...T2,
    id: "disc-06",
    q: "$x^2 - 2(k + 1)x + k^2 = 0$ が異なる2つの実数解を持つときの $k$ の範囲を求めよ。",
    a: "$k > -\\dfrac{1}{2}$",
    solution: [
      "$\\dfrac{D}{4} = (k + 1)^2 - k^2 > 0$",
      "$2k + 1 > 0$",
      "$k > -\\dfrac{1}{2}$",
    ],
  },
  {
    ...T2,
    id: "disc-07",
    q: "$y = x^2 - 2x + k$ のグラフが $x$ 軸と異なる2点で交わるときの $k$ の範囲を求めよ。",
    a: "$k < 1$",
    solution: ["$\\dfrac{D}{4} = 1 - k > 0$", "$k < 1$"],
  },
  {
    ...NR,
    id: "disc-08",
    q: "$x^2 + 4x + k = 0$ が実数解を持たないときの $k$ の範囲を求めよ。",
    a: "$k > 4$",
    solution: ["実数解なし $\\iff D < 0$", "$\\dfrac{D}{4} = 4 - k < 0$", "$k > 4$"],
  },
  {
    ...NR,
    id: "disc-09",
    q: "$x^2 - 5x + k = 0$ の実数解の個数を $k$ の値で分類せよ。",
    a: "$k < \\dfrac{25}{4}$ のとき2個、$k = \\dfrac{25}{4}$ のとき1個、$k > \\dfrac{25}{4}$ のとき0個",
    solution: [
      "$D = 25 - 4k$",
      "$D > 0 \\iff k < \\dfrac{25}{4}$ で2個",
      "$D = 0 \\iff k = \\dfrac{25}{4}$ で1個(重解)",
      "$D < 0 \\iff k > \\dfrac{25}{4}$ で0個",
    ],
  },
  {
    ...NR,
    id: "disc-10",
    q: "$2x^2 + 3x + k = 0$ が実数解を持つときの $k$ の範囲を求めよ。",
    a: "$k \\leqq \\dfrac{9}{8}$",
    solution: ["実数解を持つ $\\iff D \\geqq 0$", "$D = 9 - 8k \\geqq 0$", "$k \\leqq \\dfrac{9}{8}$"],
  },
  {
    ...DR,
    id: "disc-11",
    q: "$y = x^2 - 4x + k$ のグラフが $x$ 軸と接するときの $k$ を求めよ。",
    a: "$k = 4$",
    solution: ["接する $\\iff$ 重解 $\\iff D = 0$", "$\\dfrac{D}{4} = 4 - k = 0$", "$k = 4$"],
  },
  {
    ...IS,
    id: "disc-12",
    q: "放物線 $y = x^2 - 2x + 3$ と直線 $y = x + 1$ の共有点の個数を求めよ。",
    a: "2個",
    solution: [
      "連立して $x^2 - 2x + 3 = x + 1$",
      "$x^2 - 3x + 2 = 0$、$D = 9 - 8 = 1 > 0$",
      "共有点は2個",
    ],
  },
  {
    ...IS,
    id: "disc-13",
    q: "放物線 $y = x^2 + x + 2$ と直線 $y = -x - 1$ の共有点の個数を求めよ。",
    a: "0個",
    solution: [
      "$x^2 + x + 2 = -x - 1$ より $x^2 + 2x + 3 = 0$",
      "$D = 4 - 12 = -8 < 0$",
      "共有点はない(0個)",
    ],
  },
  {
    ...IS,
    id: "disc-14",
    q: "放物線 $y = x^2 - 4x + 5$ と直線 $y = 2x - 4$ の共有点の個数を求めよ。",
    a: "1個(接する)",
    solution: [
      "$x^2 - 4x + 5 = 2x - 4$ より $x^2 - 6x + 9 = 0$",
      "$D = 36 - 36 = 0$",
      "共有点は1個(接する)",
    ],
  },
  {
    ...IS,
    id: "disc-15",
    q: "$y = -x^2 + 4x + k$ のグラフが $x$ 軸と共有点を持つときの $k$ の範囲を求めよ。",
    a: "$k \\geqq -4$",
    solution: [
      "共有点を持つ $\\iff D \\geqq 0$",
      "$D = 16 + 4k \\geqq 0$",
      "$k \\geqq -4$",
    ],
  },
  {
    ...AT,
    id: "disc-16",
    q: "すべての実数 $x$ について $x^2 + 4x + k > 0$ となる $k$ の範囲を求めよ。",
    a: "$k > 4$",
    solution: [
      "下に凸なので、$x$ 軸と交わらなければよい",
      "$\\dfrac{D}{4} = 4 - k < 0$",
      "$k > 4$",
    ],
  },
  {
    ...AT,
    id: "disc-17",
    q: "すべての実数 $x$ について $x^2 - 2kx + k + 2 > 0$ となる $k$ の範囲を求めよ。",
    a: "$-1 < k < 2$",
    solution: [
      "$\\dfrac{D}{4} = k^2 - (k + 2) < 0$",
      "$k^2 - k - 2 < 0$ より $(k - 2)(k + 1) < 0$",
      "$-1 < k < 2$",
    ],
  },
  {
    ...AT,
    id: "disc-18",
    q: "すべての実数 $x$ について $-x^2 + 2x + k < 0$ となる $k$ の範囲を求めよ。",
    a: "$k < -1$",
    solution: [
      "両辺に $-1$ を掛けて $x^2 - 2x - k > 0$ が常に成り立てばよい",
      "$\\dfrac{D}{4} = 1 + k < 0$",
      "$k < -1$",
    ],
  },

  // ---------- 二次不等式(16) ----------
  {
    ...QI,
    id: "qineq-01",
    q: "$x^2 - 7x + 12 < 0$ を解け。",
    a: "$3 < x < 4$",
    solution: ["$(x - 3)(x - 4) < 0$", "下に凸で $0$ より小さいのは解の間", "$3 < x < 4$"],
  },
  {
    ...QI,
    id: "qineq-02",
    q: "$x^2 - x - 6 > 0$ を解け。",
    a: "$x < -2$ または $x > 3$",
    solution: ["$(x - 3)(x + 2) > 0$", "$0$ より大きいのは解の外側", "$x < -2$ または $x > 3$"],
  },
  {
    ...QI,
    id: "qineq-03",
    q: "$x^2 + 3x - 4 \\leqq 0$ を解け。",
    a: "$-4 \\leqq x \\leqq 1$",
    solution: ["$(x + 4)(x - 1) \\leqq 0$", "$-4 \\leqq x \\leqq 1$"],
  },
  {
    ...QI,
    id: "qineq-04",
    q: "$x^2 - 9 > 0$ を解け。",
    a: "$x < -3$ または $x > 3$",
    solution: ["$(x + 3)(x - 3) > 0$", "$x < -3$ または $x > 3$"],
  },
  {
    ...QI,
    id: "qineq-05",
    q: "$x^2 - 4x \\leqq 0$ を解け。",
    a: "$0 \\leqq x \\leqq 4$",
    solution: ["共通因数 $x$ で $x(x - 4) \\leqq 0$", "$0 \\leqq x \\leqq 4$"],
  },
  {
    ...QI,
    id: "qineq-06",
    q: "$x^2 + 2x + 1 > 0$ を解け。",
    a: "$x \\neq -1$ であるすべての実数",
    solution: [
      "$(x + 1)^2 > 0$",
      "平方は $0$ 以上で、$0$ になるのは $x = -1$ のときだけ",
      "$x \\neq -1$ であるすべての実数",
    ],
  },
  {
    ...QI,
    id: "qineq-07",
    q: "$x^2 - 6x + 9 \\leqq 0$ を解け。",
    a: "$x = 3$",
    solution: [
      "$(x - 3)^2 \\leqq 0$",
      "平方が $0$ 以下になるのは $0$ のときだけ",
      "$x = 3$",
    ],
  },
  {
    ...QI,
    id: "qineq-08",
    q: "$2x^2 - 5x + 2 < 0$ を解け。",
    a: "$\\dfrac{1}{2} < x < 2$",
    solution: ["たすき掛けで $(2x - 1)(x - 2) < 0$", "$\\dfrac{1}{2} < x < 2$"],
  },
  {
    ...QI,
    id: "qineq-09",
    q: "$3x^2 + 5x - 2 \\geqq 0$ を解け。",
    a: "$x \\leqq -2$ または $x \\geqq \\dfrac{1}{3}$",
    solution: [
      "$(3x - 1)(x + 2) \\geqq 0$",
      "符号が変わるのは $x = -2,\\ \\dfrac{1}{3}$",
      "$x \\leqq -2$ または $x \\geqq \\dfrac{1}{3}$",
    ],
  },
  {
    ...QI,
    id: "qineq-10",
    q: "$-x^2 + 4x - 3 > 0$ を解け。",
    a: "$1 < x < 3$",
    solution: [
      "両辺に $-1$ を掛けて不等号を逆に: $x^2 - 4x + 3 < 0$",
      "$(x - 1)(x - 3) < 0$",
      "$1 < x < 3$",
    ],
  },
  {
    ...QI,
    id: "qineq-11",
    q: "$x^2 - 2x - 2 < 0$ を解け。",
    a: "$1 - \\sqrt{3} < x < 1 + \\sqrt{3}$",
    solution: [
      "因数分解できないので $x^2 - 2x - 2 = 0$ を解く",
      "$x = 1 \\pm \\sqrt{3}$",
      "下に凸なので解の間: $1 - \\sqrt{3} < x < 1 + \\sqrt{3}$",
    ],
  },
  {
    ...QI,
    id: "qineq-12",
    q: "$x^2 + x - 1 > 0$ を解け。",
    a: "$x < \\dfrac{-1 - \\sqrt{5}}{2}$ または $x > \\dfrac{-1 + \\sqrt{5}}{2}$",
    solution: [
      "$x^2 + x - 1 = 0$ の解は $x = \\dfrac{-1 \\pm \\sqrt{5}}{2}$",
      "$0$ より大きいのは解の外側",
      "$x < \\dfrac{-1 - \\sqrt{5}}{2}$ または $x > \\dfrac{-1 + \\sqrt{5}}{2}$",
    ],
  },
  {
    ...QI,
    id: "qineq-13",
    q: "$x^2 + 2x + 3 > 0$ を解け。",
    a: "すべての実数",
    solution: [
      "因数分解できない。$\\dfrac{D}{4} = 1 - 3 = -2 < 0$",
      "下に凸で $x$ 軸と交わらないから常に正",
      "解はすべての実数",
    ],
  },
  {
    ...QI,
    id: "qineq-14",
    q: "$x^2 - x + 1 < 0$ を解け。",
    a: "解なし",
    solution: [
      "$D = 1 - 4 = -3 < 0$",
      "下に凸で $x$ 軸と交わらないから常に正",
      "負になる $x$ はない(解なし)",
    ],
  },
  {
    ...QI,
    id: "qineq-15",
    q: "$x^2 \\geqq 4x$ を解け。",
    a: "$x \\leqq 0$ または $x \\geqq 4$",
    solution: [
      "右辺を移項して $x^2 - 4x \\geqq 0$",
      "$x(x - 4) \\geqq 0$",
      "$x \\leqq 0$ または $x \\geqq 4$",
    ],
  },
  {
    ...QI,
    id: "qineq-16",
    q: "$(x - 1)(x + 2) < 4$ を解け。",
    a: "$-3 < x < 2$",
    solution: [
      "展開して右辺を $0$ に: $x^2 + x - 6 < 0$",
      "$(x + 3)(x - 2) < 0$",
      "$-3 < x < 2$",
    ],
  },
];
