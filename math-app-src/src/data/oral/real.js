// 口頭試問ドリル: 実数の分類と循環小数 / 絶対値の値と方程式 / 根号の計算 /
//                 分母の有理化 / 二重根号(応用) / 整数部分・小数部分と式の値(応用)
import { CATEGORY, MOVE } from "./vocab.js";

const RC = { field: "realnum", category: CATEGORY.REAL_CLASSIFY, firstMove: MOVE.REAL_FRACTION };
const RD = {
  field: "realnum",
  category: CATEGORY.REPEATING_DECIMAL,
  firstMove: MOVE.REPEAT_SHIFT,
};
const AV = { field: "absval", category: CATEGORY.ABS_VALUE, firstMove: MOVE.ABS_SIGN };
const AE = { field: "absval", category: CATEGORY.ABS_EQ, firstMove: MOVE.ABS_EQ };
const SQ = { field: "sqrt", category: CATEGORY.SQRT_CALC, firstMove: MOVE.SQRT_SIMPLIFY };
const RA = {
  field: "rationalize",
  category: CATEGORY.RATIONALIZE,
  firstMove: MOVE.RATIONALIZE,
};
const DR = {
  field: "dblroot",
  category: CATEGORY.DOUBLE_RADICAL,
  firstMove: MOVE.DOUBLE_RADICAL,
  advanced: true,
};
const IP = {
  field: "intpart",
  category: CATEGORY.INT_FRAC_PART,
  firstMove: MOVE.INT_PART,
  advanced: true,
};
const SV = {
  field: "intpart",
  category: CATEGORY.SYM_VALUE,
  firstMove: MOVE.SYM_BASIC,
  advanced: true,
};

export default [
  // ---------- 実数の分類と循環小数(4) ----------
  {
    ...RC,
    id: "realnum-01",
    q: "$-3,\\ 0.25,\\ \\sqrt{9},\\ \\sqrt{7},\\ \\pi,\\ \\dfrac{2}{3}$ のうち、無理数をすべて答えよ。",
    a: "$\\sqrt{7},\\ \\pi$",
    solution: [
      "$-3 = \\dfrac{-3}{1}$、$0.25 = \\dfrac{1}{4}$、$\\sqrt{9} = 3$ はどれも分数で表せる",
      "$\\sqrt{7}$ と $\\pi$ は分数で表せない",
      "無理数は $\\sqrt{7},\\ \\pi$",
    ],
  },
  {
    ...RC,
    id: "realnum-02",
    q: "$-\\dfrac{5}{2},\\ \\sqrt{2} + 1,\\ 0.\\dot{3},\\ \\sqrt{0.04},\\ \\dfrac{\\pi}{2}$ のうち、有理数をすべて答えよ。",
    a: "$-\\dfrac{5}{2},\\ 0.\\dot{3},\\ \\sqrt{0.04}$",
    solution: [
      "$0.\\dot{3} = \\dfrac{1}{3}$、$\\sqrt{0.04} = 0.2 = \\dfrac{1}{5}$ は分数で表せる",
      "$\\sqrt{2} + 1$ と $\\dfrac{\\pi}{2}$ は無理数",
      "有理数は $-\\dfrac{5}{2},\\ 0.\\dot{3},\\ \\sqrt{0.04}$",
    ],
  },
  {
    ...RD,
    id: "realnum-03",
    q: "循環小数 $0.\\dot{3}$ を分数で表せ。",
    a: "$\\dfrac{1}{3}$",
    solution: [
      "$x = 0.333\\cdots$ とおくと $10x = 3.333\\cdots$",
      "引くと $9x = 3$",
      "$x = \\dfrac{3}{9} = \\dfrac{1}{3}$",
    ],
  },
  {
    ...RD,
    id: "realnum-04",
    q: "循環小数 $0.\\dot{1}\\dot{2}$ を分数で表せ。",
    a: "$\\dfrac{4}{33}$",
    solution: [
      "$x = 0.1212\\cdots$ とおく。循環は2桁なので $100x = 12.1212\\cdots$",
      "引くと $99x = 12$",
      "$x = \\dfrac{12}{99} = \\dfrac{4}{33}$",
    ],
  },

  // ---------- 絶対値の値と方程式(6) ----------
  {
    ...AV,
    id: "absval-01",
    q: "$|-5|$ の値を求めよ。",
    a: "$5$",
    solution: ["中身 $-5$ は負", "$-1$ をかけて $|-5| = 5$"],
  },
  {
    ...AV,
    id: "absval-02",
    q: "$|\\sqrt{3} - 2|$ の値を求めよ。",
    a: "$2 - \\sqrt{3}$",
    solution: [
      "$\\sqrt{3} = 1.73\\cdots < 2$ なので中身は負",
      "$-1$ をかけてはずす: $-(\\sqrt{3} - 2)$",
      "$= 2 - \\sqrt{3}$",
    ],
  },
  {
    ...AV,
    id: "absval-03",
    q: "$|3 - \\pi|$ の値を求めよ。",
    a: "$\\pi - 3$",
    solution: [
      "$\\pi = 3.14\\cdots > 3$ なので中身は負",
      "$|3 - \\pi| = -(3 - \\pi) = \\pi - 3$",
    ],
  },
  {
    ...AV,
    id: "absval-04",
    q: "$|1 - \\sqrt{2}| + |\\sqrt{2} - 2|$ の値を求めよ。",
    a: "$1$",
    solution: [
      "$\\sqrt{2} = 1.41\\cdots$ なので、中身はどちらも負",
      "$= (\\sqrt{2} - 1) + (2 - \\sqrt{2})$",
      "$= 1$",
    ],
  },
  {
    ...AE,
    id: "absval-05",
    q: "方程式 $|x - 2| = 3$ を解け。",
    a: "$x = 5,\\ -1$",
    solution: ["$x - 2 = \\pm 3$", "$x = 2 + 3 = 5$ または $x = 2 - 3 = -1$"],
  },
  {
    ...AE,
    id: "absval-06",
    q: "方程式 $|2x + 1| = 5$ を解け。",
    a: "$x = 2,\\ -3$",
    solution: [
      "$2x + 1 = \\pm 5$",
      "$2x + 1 = 5$ より $x = 2$",
      "$2x + 1 = -5$ より $x = -3$",
    ],
  },

  // ---------- 根号の計算(8) ----------
  {
    ...SQ,
    id: "sqrt-01",
    q: "$\\sqrt{12} + \\sqrt{27}$ を計算せよ。",
    a: "$5\\sqrt{3}$",
    solution: [
      "$\\sqrt{12} = 2\\sqrt{3}$、$\\sqrt{27} = 3\\sqrt{3}$",
      "$2\\sqrt{3} + 3\\sqrt{3} = 5\\sqrt{3}$",
    ],
  },
  {
    ...SQ,
    id: "sqrt-02",
    q: "$\\sqrt{50} - \\sqrt{18} + \\sqrt{8}$ を計算せよ。",
    a: "$4\\sqrt{2}$",
    solution: [
      "$\\sqrt{50} = 5\\sqrt{2}$、$\\sqrt{18} = 3\\sqrt{2}$、$\\sqrt{8} = 2\\sqrt{2}$",
      "$5\\sqrt{2} - 3\\sqrt{2} + 2\\sqrt{2} = 4\\sqrt{2}$",
    ],
  },
  {
    ...SQ,
    id: "sqrt-03",
    q: "$\\sqrt{8} \\times \\sqrt{6}$ を計算せよ。",
    a: "$4\\sqrt{3}$",
    solution: [
      "$\\sqrt{8} = 2\\sqrt{2}$ なので $2\\sqrt{2} \\times \\sqrt{6} = 2\\sqrt{12}$",
      "$\\sqrt{12} = 2\\sqrt{3}$",
      "$= 4\\sqrt{3}$",
    ],
  },
  {
    ...SQ,
    id: "sqrt-04",
    q: "$\\sqrt{24} \\div \\sqrt{3}$ を計算せよ。",
    a: "$2\\sqrt{2}$",
    solution: ["$= \\sqrt{\\dfrac{24}{3}} = \\sqrt{8}$", "$= 2\\sqrt{2}$"],
  },
  {
    ...SQ,
    id: "sqrt-05",
    q: "$(\\sqrt{3} + \\sqrt{2})^2$ を計算せよ。",
    a: "$5 + 2\\sqrt{6}$",
    solution: [
      "$(a + b)^2 = a^2 + 2ab + b^2$ で展開",
      "$= 3 + 2\\sqrt{6} + 2$",
      "$= 5 + 2\\sqrt{6}$",
    ],
  },
  {
    ...SQ,
    id: "sqrt-06",
    q: "$(\\sqrt{5} + \\sqrt{2})(\\sqrt{5} - \\sqrt{2})$ を計算せよ。",
    a: "$3$",
    solution: ["$(a + b)(a - b) = a^2 - b^2$", "$= 5 - 2 = 3$"],
  },
  {
    ...SQ,
    id: "sqrt-07",
    q: "$(2\\sqrt{3} - 1)^2$ を計算せよ。",
    a: "$13 - 4\\sqrt{3}$",
    solution: [
      "$= (2\\sqrt{3})^2 - 2\\cdot 2\\sqrt{3}\\cdot 1 + 1$",
      "$= 12 - 4\\sqrt{3} + 1$",
      "$= 13 - 4\\sqrt{3}$",
    ],
  },
  {
    ...SQ,
    id: "sqrt-08",
    q: "$(\\sqrt{6} + \\sqrt{2})(\\sqrt{3} - 1)$ を計算せよ。",
    a: "$2\\sqrt{2}$",
    solution: [
      "$= \\sqrt{18} - \\sqrt{6} + \\sqrt{6} - \\sqrt{2}$",
      "$\\sqrt{18} = 3\\sqrt{2}$",
      "$= 3\\sqrt{2} - \\sqrt{2} = 2\\sqrt{2}$",
    ],
  },

  // ---------- 分母の有理化(6) ----------
  {
    ...RA,
    id: "rationalize-01",
    q: "$\\dfrac{1}{\\sqrt{3}}$ の分母を有理化せよ。",
    a: "$\\dfrac{\\sqrt{3}}{3}$",
    solution: [
      "分母と分子に $\\sqrt{3}$ をかける",
      "$= \\dfrac{\\sqrt{3}}{3}$",
    ],
  },
  {
    ...RA,
    id: "rationalize-02",
    q: "$\\dfrac{6}{\\sqrt{2}}$ の分母を有理化せよ。",
    a: "$3\\sqrt{2}$",
    solution: [
      "分母と分子に $\\sqrt{2}$ をかける: $\\dfrac{6\\sqrt{2}}{2}$",
      "$= 3\\sqrt{2}$",
    ],
  },
  {
    ...RA,
    id: "rationalize-03",
    q: "$\\dfrac{3}{2\\sqrt{6}}$ の分母を有理化せよ。",
    a: "$\\dfrac{\\sqrt{6}}{4}$",
    solution: [
      "分母と分子に $\\sqrt{6}$ をかける: $\\dfrac{3\\sqrt{6}}{12}$",
      "$= \\dfrac{\\sqrt{6}}{4}$",
    ],
  },
  {
    ...RA,
    id: "rationalize-04",
    q: "$\\dfrac{1}{\\sqrt{3} - \\sqrt{2}}$ の分母を有理化せよ。",
    a: "$\\sqrt{3} + \\sqrt{2}$",
    solution: [
      "分母と分子に $\\sqrt{3} + \\sqrt{2}$ をかける",
      "分母は $(\\sqrt{3})^2 - (\\sqrt{2})^2 = 1$",
      "$= \\sqrt{3} + \\sqrt{2}$",
    ],
  },
  {
    ...RA,
    id: "rationalize-05",
    q: "$\\dfrac{2}{\\sqrt{5} + \\sqrt{3}}$ の分母を有理化せよ。",
    a: "$\\sqrt{5} - \\sqrt{3}$",
    solution: [
      "分母と分子に $\\sqrt{5} - \\sqrt{3}$ をかける",
      "分母は $5 - 3 = 2$ なので $\\dfrac{2(\\sqrt{5} - \\sqrt{3})}{2}$",
      "$= \\sqrt{5} - \\sqrt{3}$",
    ],
  },
  {
    ...RA,
    id: "rationalize-06",
    q: "$\\dfrac{\\sqrt{5} - 1}{\\sqrt{5} + 1}$ の分母を有理化せよ。",
    a: "$\\dfrac{3 - \\sqrt{5}}{2}$",
    solution: [
      "分母と分子に $\\sqrt{5} - 1$ をかける。分母は $5 - 1 = 4$",
      "分子は $(\\sqrt{5} - 1)^2 = 6 - 2\\sqrt{5}$",
      "$\\dfrac{6 - 2\\sqrt{5}}{4} = \\dfrac{3 - \\sqrt{5}}{2}$",
    ],
  },

  // ---------- 二重根号(4、応用) ----------
  {
    ...DR,
    id: "dblroot-01",
    q: "$\\sqrt{5 + 2\\sqrt{6}}$ を簡単にせよ。",
    a: "$\\sqrt{3} + \\sqrt{2}$",
    solution: [
      "たして $5$、かけて $6$ になる2数は $3$ と $2$",
      "$5 + 2\\sqrt{6} = (\\sqrt{3} + \\sqrt{2})^2$",
      "$= \\sqrt{3} + \\sqrt{2}$",
    ],
  },
  {
    ...DR,
    id: "dblroot-02",
    q: "$\\sqrt{7 - 2\\sqrt{10}}$ を簡単にせよ。",
    a: "$\\sqrt{5} - \\sqrt{2}$",
    solution: [
      "たして $7$、かけて $10$ になる2数は $5$ と $2$",
      "$7 - 2\\sqrt{10} = (\\sqrt{5} - \\sqrt{2})^2$",
      "$\\sqrt{5} > \\sqrt{2}$ なので $= \\sqrt{5} - \\sqrt{2}$",
    ],
  },
  {
    ...DR,
    id: "dblroot-03",
    q: "$\\sqrt{4 - \\sqrt{12}}$ を簡単にせよ。",
    a: "$\\sqrt{3} - 1$",
    solution: [
      "$\\sqrt{12} = 2\\sqrt{3}$ と前を $2$ にする: $\\sqrt{4 - 2\\sqrt{3}}$",
      "たして $4$、かけて $3$ になる2数は $3$ と $1$",
      "大きい方から引いて $= \\sqrt{3} - 1$",
    ],
  },
  {
    ...DR,
    id: "dblroot-04",
    q: "$\\sqrt{2 + \\sqrt{3}}$ を簡単にせよ。",
    a: "$\\dfrac{\\sqrt{6} + \\sqrt{2}}{2}$",
    solution: [
      "前を $2$ にするため中を $2$ 倍して $2$ で割る: $\\sqrt{\\dfrac{4 + 2\\sqrt{3}}{2}}$",
      "$4 + 2\\sqrt{3} = (\\sqrt{3} + 1)^2$ なので $= \\dfrac{\\sqrt{3} + 1}{\\sqrt{2}}$",
      "有理化して $\\dfrac{\\sqrt{6} + \\sqrt{2}}{2}$",
    ],
  },

  // ---------- 整数部分・小数部分と式の値(6、応用) ----------
  {
    ...IP,
    id: "intpart-01",
    q: "$\\dfrac{1}{\\sqrt{2} - 1}$ の整数部分を $a$、小数部分を $b$ とする。$a$ と $b$ を求めよ。",
    a: "$a = 2,\\ b = \\sqrt{2} - 1$",
    solution: [
      "有理化すると $\\sqrt{2} + 1$",
      "$1 < \\sqrt{2} < 2$ より $2 < \\sqrt{2} + 1 < 3$ なので $a = 2$",
      "$b = (\\sqrt{2} + 1) - 2 = \\sqrt{2} - 1$",
    ],
  },
  {
    ...IP,
    id: "intpart-02",
    q: "$\\sqrt{7}$ の小数部分を $b$ とするとき、$b^2 + 4b$ の値を求めよ。",
    a: "$3$",
    solution: [
      "$4 < 7 < 9$ より $2 < \\sqrt{7} < 3$。整数部分は $2$ で $b = \\sqrt{7} - 2$",
      "$b^2 + 4b = (b + 2)^2 - 4$",
      "$= (\\sqrt{7})^2 - 4 = 3$",
    ],
  },
  {
    ...IP,
    id: "intpart-03",
    q: "$\\dfrac{2}{3 - \\sqrt{5}}$ の整数部分を $a$、小数部分を $b$ とする。$a$ と $b$ を求めよ。",
    a: "$a = 2,\\ b = \\dfrac{\\sqrt{5} - 1}{2}$",
    solution: [
      "有理化すると $\\dfrac{2(3 + \\sqrt{5})}{9 - 5} = \\dfrac{3 + \\sqrt{5}}{2}$",
      "$2 < \\sqrt{5} < 3$ より $\\dfrac{5}{2} < \\dfrac{3 + \\sqrt{5}}{2} < 3$ なので $a = 2$",
      "$b = \\dfrac{3 + \\sqrt{5}}{2} - 2 = \\dfrac{\\sqrt{5} - 1}{2}$",
    ],
  },
  {
    ...SV,
    id: "intpart-04",
    q: "$x = \\sqrt{3} + \\sqrt{2},\\ y = \\sqrt{3} - \\sqrt{2}$ のとき、$x + y$ と $xy$ の値を求めよ。",
    a: "$x + y = 2\\sqrt{3},\\ xy = 1$",
    solution: [
      "$x + y = 2\\sqrt{3}$",
      "$xy = (\\sqrt{3})^2 - (\\sqrt{2})^2 = 1$",
    ],
  },
  {
    ...SV,
    id: "intpart-05",
    q: "$x = \\sqrt{3} + \\sqrt{2},\\ y = \\sqrt{3} - \\sqrt{2}$ のとき、$x^2 + y^2$ の値を求めよ。",
    a: "$10$",
    solution: [
      "$x + y = 2\\sqrt{3},\\ xy = 1$",
      "$x^2 + y^2 = (x + y)^2 - 2xy$",
      "$= 12 - 2 = 10$",
    ],
  },
  {
    ...SV,
    id: "intpart-06",
    q: "$x = \\sqrt{5} + \\sqrt{3},\\ y = \\sqrt{5} - \\sqrt{3}$ のとき、$x^2 - xy + y^2$ の値を求めよ。",
    a: "$14$",
    solution: [
      "$x + y = 2\\sqrt{5},\\ xy = 5 - 3 = 2$",
      "$x^2 - xy + y^2 = (x + y)^2 - 3xy$",
      "$= 20 - 6 = 14$",
    ],
  },
];
