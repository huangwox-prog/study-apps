// 口頭試問ドリル: 展開 / 因数分解 / 一次不等式・連立 / 絶対値を含む一次不等式
import { CATEGORY, MOVE } from "./vocab.js";

const EX = { field: "expand", category: CATEGORY.EXPAND, firstMove: MOVE.EXPAND };
const FA = { field: "factor", category: CATEGORY.FACTOR, firstMove: MOVE.FACTOR };
const FR = {
  field: "factor",
  category: CATEGORY.FACTOR_BY_ROOT,
  firstMove: MOVE.FACTOR_BY_ROOT,
};
const LI = { field: "linineq", category: CATEGORY.LIN_INEQ, firstMove: MOVE.TRANSPOSE };
const SI = { field: "linineq", category: CATEGORY.SIM_INEQ, firstMove: MOVE.NUMBER_LINE };
const AB = { field: "absineq", category: CATEGORY.ABS_INEQ, firstMove: MOVE.ABS_OFF };

export default [
  // ---------- 展開(12) ----------
  {
    ...EX,
    id: "expand-01",
    q: "$(x + 3)(x + 5)$ を展開せよ。",
    a: "$x^2 + 8x + 15$",
    solution: [
      "$(x + a)(x + b) = x^2 + (a + b)x + ab$",
      "$a + b = 8,\\ ab = 15$",
      "$= x^2 + 8x + 15$",
    ],
  },
  {
    ...EX,
    id: "expand-02",
    q: "$(x - 4)(x + 7)$ を展開せよ。",
    a: "$x^2 + 3x - 28$",
    solution: ["$(-4) + 7 = 3,\\ (-4)\\cdot 7 = -28$", "$= x^2 + 3x - 28$"],
  },
  {
    ...EX,
    id: "expand-03",
    q: "$(2x + 1)(3x - 2)$ を展開せよ。",
    a: "$6x^2 - x - 2$",
    solution: [
      "$= 6x^2 - 4x + 3x - 2$",
      "$= 6x^2 - x - 2$",
    ],
  },
  {
    ...EX,
    id: "expand-04",
    q: "$(x + 5)^2$ を展開せよ。",
    a: "$x^2 + 10x + 25$",
    solution: ["$(a + b)^2 = a^2 + 2ab + b^2$", "$= x^2 + 2\\cdot 5\\cdot x + 25 = x^2 + 10x + 25$"],
  },
  {
    ...EX,
    id: "expand-05",
    q: "$(3x - 2)^2$ を展開せよ。",
    a: "$9x^2 - 12x + 4$",
    solution: [
      "$(a - b)^2 = a^2 - 2ab + b^2$",
      "$= (3x)^2 - 2\\cdot 3x\\cdot 2 + 2^2$",
      "$= 9x^2 - 12x + 4$",
    ],
  },
  {
    ...EX,
    id: "expand-06",
    q: "$(x + 6)(x - 6)$ を展開せよ。",
    a: "$x^2 - 36$",
    solution: ["$(a + b)(a - b) = a^2 - b^2$", "$= x^2 - 36$"],
  },
  {
    ...EX,
    id: "expand-07",
    q: "$(2x + 3)(2x - 3)$ を展開せよ。",
    a: "$4x^2 - 9$",
    solution: ["$(a + b)(a - b) = a^2 - b^2$", "$= (2x)^2 - 3^2 = 4x^2 - 9$"],
  },
  {
    ...EX,
    id: "expand-08",
    q: "$(2x + y)^2$ を展開せよ。",
    a: "$4x^2 + 4xy + y^2$",
    solution: [
      "$= (2x)^2 + 2\\cdot 2x\\cdot y + y^2$",
      "$= 4x^2 + 4xy + y^2$",
    ],
  },
  {
    ...EX,
    id: "expand-09",
    q: "$(3a - 4b)(3a + 4b)$ を展開せよ。",
    a: "$9a^2 - 16b^2$",
    solution: ["$= (3a)^2 - (4b)^2$", "$= 9a^2 - 16b^2$"],
  },
  {
    ...EX,
    id: "expand-10",
    q: "$(a + 2b)(a - 5b)$ を展開せよ。",
    a: "$a^2 - 3ab - 10b^2$",
    solution: [
      "$= a^2 - 5ab + 2ab - 10b^2$",
      "$= a^2 - 3ab - 10b^2$",
    ],
  },
  {
    ...EX,
    id: "expand-11",
    q: "$(4x - 1)(x + 3)$ を展開せよ。",
    a: "$4x^2 + 11x - 3$",
    solution: ["$= 4x^2 + 12x - x - 3$", "$= 4x^2 + 11x - 3$"],
  },
  {
    ...EX,
    id: "expand-12",
    q: "$(x - 3)(x + 4) - (x - 1)^2$ を展開して整理せよ。",
    a: "$3x - 13$",
    solution: [
      "$(x - 3)(x + 4) = x^2 + x - 12$",
      "$(x - 1)^2 = x^2 - 2x + 1$",
      "$= (x^2 + x - 12) - (x^2 - 2x + 1) = 3x - 13$",
    ],
  },

  // ---------- 因数分解(18) ----------
  {
    ...FA,
    id: "factor-01",
    q: "$x^2 + 7x + 12$ を因数分解せよ。",
    a: "$(x + 3)(x + 4)$",
    solution: ["たして $7$、かけて $12$ になる2数は $3$ と $4$", "$= (x + 3)(x + 4)$"],
  },
  {
    ...FA,
    id: "factor-02",
    q: "$x^2 - 9x + 20$ を因数分解せよ。",
    a: "$(x - 4)(x - 5)$",
    solution: ["たして $-9$、かけて $20$ になる2数は $-4$ と $-5$", "$= (x - 4)(x - 5)$"],
  },
  {
    ...FA,
    id: "factor-03",
    q: "$x^2 + 2x - 15$ を因数分解せよ。",
    a: "$(x + 5)(x - 3)$",
    solution: ["たして $2$、かけて $-15$ になる2数は $5$ と $-3$", "$= (x + 5)(x - 3)$"],
  },
  {
    ...FA,
    id: "factor-04",
    q: "$x^2 - x - 42$ を因数分解せよ。",
    a: "$(x - 7)(x + 6)$",
    solution: ["たして $-1$、かけて $-42$ になる2数は $-7$ と $6$", "$= (x - 7)(x + 6)$"],
  },
  {
    ...FA,
    id: "factor-05",
    q: "$x^2 - 16$ を因数分解せよ。",
    a: "$(x + 4)(x - 4)$",
    solution: ["$a^2 - b^2 = (a + b)(a - b)$", "$= (x + 4)(x - 4)$"],
  },
  {
    ...FA,
    id: "factor-06",
    q: "$9x^2 - 25$ を因数分解せよ。",
    a: "$(3x + 5)(3x - 5)$",
    solution: ["$= (3x)^2 - 5^2$", "$= (3x + 5)(3x - 5)$"],
  },
  {
    ...FA,
    id: "factor-07",
    q: "$x^2 + 10x + 25$ を因数分解せよ。",
    a: "$(x + 5)^2$",
    solution: ["$25 = 5^2$、$10x = 2\\cdot 5\\cdot x$ なので平方の形", "$= (x + 5)^2$"],
  },
  {
    ...FA,
    id: "factor-08",
    q: "$4x^2 - 12x + 9$ を因数分解せよ。",
    a: "$(2x - 3)^2$",
    solution: [
      "$4x^2 = (2x)^2,\\ 9 = 3^2,\\ -12x = -2\\cdot 2x\\cdot 3$",
      "$= (2x - 3)^2$",
    ],
  },
  {
    ...FA,
    id: "factor-09",
    q: "$3x^2 + 9x$ を因数分解せよ。",
    a: "$3x(x + 3)$",
    solution: ["共通因数は $3x$", "$= 3x(x + 3)$"],
  },
  {
    ...FA,
    id: "factor-10",
    q: "$2x^2 - 8$ を因数分解せよ。",
    a: "$2(x + 2)(x - 2)$",
    solution: ["共通因数 $2$ をくくる: $= 2(x^2 - 4)$", "$= 2(x + 2)(x - 2)$"],
  },
  {
    ...FA,
    id: "factor-11",
    q: "$3x^2 - 6x - 24$ を因数分解せよ。",
    a: "$3(x - 4)(x + 2)$",
    solution: [
      "共通因数 $3$ をくくる: $= 3(x^2 - 2x - 8)$",
      "たして $-2$、かけて $-8$ は $-4$ と $2$",
      "$= 3(x - 4)(x + 2)$",
    ],
  },
  {
    ...FA,
    id: "factor-12",
    q: "$2x^2 + 7x + 3$ を因数分解せよ。",
    a: "$(2x + 1)(x + 3)$",
    solution: [
      "たすき掛け: $2$ と $1$、$1$ と $3$",
      "$2\\cdot 3 + 1\\cdot 1 = 7$ で一致",
      "$= (2x + 1)(x + 3)$",
    ],
  },
  {
    ...FA,
    id: "factor-13",
    q: "$3x^2 - 5x - 2$ を因数分解せよ。",
    a: "$(3x + 1)(x - 2)$",
    solution: [
      "たすき掛け: $3$ と $1$、$1$ と $-2$",
      "$3\\cdot(-2) + 1\\cdot 1 = -5$ で一致",
      "$= (3x + 1)(x - 2)$",
    ],
  },
  {
    ...FA,
    id: "factor-14",
    q: "$6x^2 + x - 2$ を因数分解せよ。",
    a: "$(3x + 2)(2x - 1)$",
    solution: [
      "たすき掛け: $3$ と $2$、$2$ と $-1$",
      "$3\\cdot(-1) + 2\\cdot 2 = 1$ で一致",
      "$= (3x + 2)(2x - 1)$",
    ],
  },
  {
    ...FA,
    id: "factor-15",
    q: "$4x^2 - 4x - 3$ を因数分解せよ。",
    a: "$(2x - 3)(2x + 1)$",
    solution: [
      "たすき掛け: $2$ と $2$、$-3$ と $1$",
      "$2\\cdot 1 + 2\\cdot(-3) = -4$ で一致",
      "$= (2x - 3)(2x + 1)$",
    ],
  },
  {
    ...FA,
    id: "factor-16",
    q: "$x^2 - 5xy + 6y^2$ を因数分解せよ。",
    a: "$(x - 2y)(x - 3y)$",
    solution: [
      "$x$ の2次式とみて、たして $-5y$、かけて $6y^2$",
      "その2数は $-2y$ と $-3y$",
      "$= (x - 2y)(x - 3y)$",
    ],
  },
  {
    ...FR,
    id: "factor-17",
    q: "$x^2 - 6x + 7$ を因数分解せよ。",
    a: "$(x - 3 - \\sqrt{2})(x - 3 + \\sqrt{2})$",
    solution: [
      "$x^2 - 6x + 7 = 0$ とおくと $x = 3 \\pm \\sqrt{9 - 7} = 3 \\pm \\sqrt{2}$",
      "$a(x - \\alpha)(x - \\beta)$ に戻す($a = 1$)",
      "$= (x - 3 - \\sqrt{2})(x - 3 + \\sqrt{2})$",
    ],
  },
  {
    ...FR,
    id: "factor-18",
    q: "$x^2 - 2x - 1$ を因数分解せよ。",
    a: "$(x - 1 - \\sqrt{2})(x - 1 + \\sqrt{2})$",
    solution: [
      "$x^2 - 2x - 1 = 0$ とおくと $x = 1 \\pm \\sqrt{1 + 1} = 1 \\pm \\sqrt{2}$",
      "$= (x - 1 - \\sqrt{2})(x - 1 + \\sqrt{2})$",
    ],
  },

  // ---------- 一次不等式・連立(10) ----------
  {
    ...LI,
    id: "linineq-01",
    q: "$3x - 5 < 7$ を解け。",
    a: "$x < 4$",
    solution: ["$3x < 12$", "$x < 4$"],
  },
  {
    ...LI,
    id: "linineq-02",
    q: "$-2x + 3 > 9$ を解け。",
    a: "$x < -3$",
    solution: [
      "$-2x > 6$",
      "負の数 $-2$ で割るので不等号が逆になる",
      "$x < -3$",
    ],
  },
  {
    ...LI,
    id: "linineq-03",
    q: "$5x + 2 \\leqq 2x - 7$ を解け。",
    a: "$x \\leqq -3$",
    solution: ["$5x - 2x \\leqq -7 - 2$", "$3x \\leqq -9$", "$x \\leqq -3$"],
  },
  {
    ...LI,
    id: "linineq-04",
    q: "$4(x - 1) > 2x + 6$ を解け。",
    a: "$x > 5$",
    solution: ["$4x - 4 > 2x + 6$", "$2x > 10$", "$x > 5$"],
  },
  {
    ...LI,
    id: "linineq-05",
    q: "$\\dfrac{x + 1}{2} \\leqq \\dfrac{2x - 3}{3}$ を解け。",
    a: "$x \\geqq 9$",
    solution: [
      "両辺を $6$ 倍: $3(x + 1) \\leqq 2(2x - 3)$",
      "$3x + 3 \\leqq 4x - 6$",
      "$-x \\leqq -9$ より $x \\geqq 9$",
    ],
  },
  {
    ...LI,
    id: "linineq-06",
    q: "$1 - 3x \\geqq x + 9$ を解け。",
    a: "$x \\leqq -2$",
    solution: [
      "$-3x - x \\geqq 9 - 1$",
      "$-4x \\geqq 8$",
      "負の数で割るので不等号が逆になり $x \\leqq -2$",
    ],
  },
  {
    ...SI,
    id: "linineq-07",
    q: "連立不等式 $\\begin{cases} 2x + 1 > 5 \\\\ x - 3 \\leqq 2 \\end{cases}$ を解け。",
    a: "$2 < x \\leqq 5$",
    solution: [
      "上: $2x > 4$ より $x > 2$",
      "下: $x \\leqq 5$",
      "数直線で重なる範囲は $2 < x \\leqq 5$",
    ],
  },
  {
    ...SI,
    id: "linineq-08",
    q: "連立不等式 $\\begin{cases} 3x - 2 \\leqq x + 6 \\\\ 5x + 1 > 2x - 8 \\end{cases}$ を解け。",
    a: "$-3 < x \\leqq 4$",
    solution: [
      "上: $2x \\leqq 8$ より $x \\leqq 4$",
      "下: $3x > -9$ より $x > -3$",
      "共通範囲は $-3 < x \\leqq 4$",
    ],
  },
  {
    ...SI,
    id: "linineq-09",
    q: "連立不等式 $\\begin{cases} x + 4 < 3x \\\\ 2x - 1 \\leqq x + 6 \\end{cases}$ を解け。",
    a: "$2 < x \\leqq 7$",
    solution: [
      "上: $4 < 2x$ より $x > 2$",
      "下: $x \\leqq 7$",
      "共通範囲は $2 < x \\leqq 7$",
    ],
  },
  {
    ...SI,
    id: "linineq-10",
    q: "$-1 < 2x + 3 \\leqq 9$ を解け。",
    a: "$-2 < x \\leqq 3$",
    solution: [
      "各辺から $3$ を引く: $-4 < 2x \\leqq 6$",
      "各辺を $2$ で割る",
      "$-2 < x \\leqq 3$",
    ],
  },

  // ---------- 絶対値を含む一次不等式(4) ----------
  {
    ...AB,
    id: "absineq-01",
    q: "$|x - 2| < 5$ を解け。",
    a: "$-3 < x < 7$",
    solution: ["$-5 < x - 2 < 5$", "各辺に $2$ を足して $-3 < x < 7$"],
  },
  {
    ...AB,
    id: "absineq-02",
    q: "$|2x + 1| \\leqq 7$ を解け。",
    a: "$-4 \\leqq x \\leqq 3$",
    solution: [
      "$-7 \\leqq 2x + 1 \\leqq 7$",
      "$-8 \\leqq 2x \\leqq 6$",
      "$-4 \\leqq x \\leqq 3$",
    ],
  },
  {
    ...AB,
    id: "absineq-03",
    q: "$|x + 3| > 4$ を解け。",
    a: "$x < -7$ または $x > 1$",
    solution: [
      "$x + 3 < -4$ または $x + 3 > 4$",
      "$x < -7$ または $x > 1$",
    ],
  },
  {
    ...AB,
    id: "absineq-04",
    q: "$|3x - 2| \\geqq 5$ を解け。",
    a: "$x \\leqq -1$ または $x \\geqq \\dfrac{7}{3}$",
    solution: [
      "$3x - 2 \\leqq -5$ または $3x - 2 \\geqq 5$",
      "$3x \\leqq -3$ または $3x \\geqq 7$",
      "$x \\leqq -1$ または $x \\geqq \\dfrac{7}{3}$",
    ],
  },
];
