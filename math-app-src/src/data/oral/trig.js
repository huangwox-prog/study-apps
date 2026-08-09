// 口頭試問ドリル: 三角比 / 特別角と 90°−θ / 対称式(応用)
import { CATEGORY, MOVE } from "./vocab.js";

const ID = { field: "tri", category: CATEGORY.TRI_IDENTITY, firstMove: MOVE.TRI_IDENTITY };
const OB = { field: "tri", category: CATEGORY.TRI_OBTUSE, firstMove: MOVE.TRI_OBTUSE };
const FG = { field: "tri", category: CATEGORY.TRI_FIGURE, firstMove: MOVE.TRI_FIGURE };
const SP = {
  field: "trispecial",
  category: CATEGORY.TRI_SPECIAL,
  firstMove: MOVE.TRI_SPECIAL,
};
const CO = {
  field: "trispecial",
  category: CATEGORY.TRI_COMPLEMENT,
  firstMove: MOVE.TRI_COMPLEMENT,
};
const SY = {
  field: "trisym",
  category: CATEGORY.TRI_SYMMETRIC,
  firstMove: MOVE.TRI_SQUARE,
  advanced: true,
};

export default [
  // ---------- 三角比(12) ----------
  {
    ...ID,
    id: "tri-01",
    q: "$\\theta$ が鋭角で $\\sin\\theta = \\dfrac{3}{5}$ のとき $\\cos\\theta$ を求めよ。",
    a: "$\\cos\\theta = \\dfrac{4}{5}$",
    solution: [
      "$\\cos^2\\theta = 1 - \\dfrac{9}{25} = \\dfrac{16}{25}$",
      "鋭角なので $\\cos\\theta > 0$",
      "$\\cos\\theta = \\dfrac{4}{5}$",
    ],
  },
  {
    ...ID,
    id: "tri-02",
    q: "$\\theta$ が鋭角で $\\cos\\theta = \\dfrac{1}{3}$ のとき $\\sin\\theta$ を求めよ。",
    a: "$\\sin\\theta = \\dfrac{2\\sqrt{2}}{3}$",
    solution: [
      "$\\sin^2\\theta = 1 - \\dfrac{1}{9} = \\dfrac{8}{9}$",
      "鋭角なので $\\sin\\theta > 0$",
      "$\\sin\\theta = \\dfrac{2\\sqrt{2}}{3}$",
    ],
  },
  {
    ...ID,
    id: "tri-03",
    q: "$\\theta$ が鋭角で $\\tan\\theta = 3$ のとき $\\cos\\theta$ を求めよ。",
    a: "$\\cos\\theta = \\dfrac{\\sqrt{10}}{10}$",
    solution: [
      "$1 + \\tan^2\\theta = \\dfrac{1}{\\cos^2\\theta}$ より $\\dfrac{1}{\\cos^2\\theta} = 10$",
      "$\\cos^2\\theta = \\dfrac{1}{10}$、鋭角なので正",
      "$\\cos\\theta = \\dfrac{1}{\\sqrt{10}} = \\dfrac{\\sqrt{10}}{10}$",
    ],
  },
  {
    ...ID,
    id: "tri-04",
    q: "$\\theta$ が鈍角で $\\cos\\theta = -\\dfrac{3}{5}$ のとき $\\tan\\theta$ を求めよ。",
    a: "$\\tan\\theta = -\\dfrac{4}{3}$",
    solution: [
      "$\\sin^2\\theta = 1 - \\dfrac{9}{25} = \\dfrac{16}{25}$、鈍角でも $\\sin\\theta > 0$ なので $\\dfrac{4}{5}$",
      "$\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$",
      "$\\tan\\theta = \\dfrac{4/5}{-3/5} = -\\dfrac{4}{3}$",
    ],
  },
  {
    ...OB,
    id: "tri-05",
    q: "$\\theta$ が鈍角で $\\sin\\theta = \\dfrac{1}{2}$ のとき $\\cos\\theta$ を求めよ。",
    a: "$\\cos\\theta = -\\dfrac{\\sqrt{3}}{2}$",
    solution: [
      "$\\sin\\theta = \\dfrac{1}{2}$ で鈍角なので $\\theta = 150^\\circ$",
      "$\\cos 150^\\circ = -\\cos 30^\\circ$",
      "$\\cos\\theta = -\\dfrac{\\sqrt{3}}{2}$",
    ],
  },
  {
    ...OB,
    id: "tri-06",
    q: "$\\sin 120^\\circ$ の値を求めよ。",
    a: "$\\dfrac{\\sqrt{3}}{2}$",
    solution: [
      "$120^\\circ = 180^\\circ - 60^\\circ$",
      "$\\sin(180^\\circ - \\theta) = \\sin\\theta$ で符号はそのまま",
      "$= \\sin 60^\\circ = \\dfrac{\\sqrt{3}}{2}$",
    ],
  },
  {
    ...OB,
    id: "tri-07",
    q: "$\\cos 150^\\circ$ の値を求めよ。",
    a: "$-\\dfrac{\\sqrt{3}}{2}$",
    solution: [
      "$150^\\circ = 180^\\circ - 30^\\circ$",
      "$\\cos(180^\\circ - \\theta) = -\\cos\\theta$ で符号が反転",
      "$= -\\cos 30^\\circ = -\\dfrac{\\sqrt{3}}{2}$",
    ],
  },
  {
    ...OB,
    id: "tri-08",
    q: "$\\tan 150^\\circ$ の値を求めよ。",
    a: "$-\\dfrac{\\sqrt{3}}{3}$",
    solution: [
      "$\\tan(180^\\circ - \\theta) = -\\tan\\theta$",
      "$= -\\tan 30^\\circ = -\\dfrac{1}{\\sqrt{3}}$",
      "$= -\\dfrac{\\sqrt{3}}{3}$",
    ],
  },
  {
    ...OB,
    id: "tri-09",
    q: "$\\sin 135^\\circ + \\cos 135^\\circ$ の値を求めよ。",
    a: "$0$",
    solution: [
      "$\\sin 135^\\circ = \\sin 45^\\circ = \\dfrac{\\sqrt{2}}{2}$",
      "$\\cos 135^\\circ = -\\cos 45^\\circ = -\\dfrac{\\sqrt{2}}{2}$",
      "足すと $0$",
    ],
  },
  {
    ...FG,
    id: "tri-10",
    q: "$\\angle C = 90^\\circ$ の直角三角形 $ABC$ で $AB = 5$、$BC = 3$ のとき $\\sin A$ を求めよ。",
    a: "$\\sin A = \\dfrac{3}{5}$",
    solution: [
      "図を描くと $AB$ が斜辺、$BC$ が $\\angle A$ の対辺",
      "$\\sin A = \\dfrac{\\text{対辺}}{\\text{斜辺}} = \\dfrac{BC}{AB}$",
      "$= \\dfrac{3}{5}$",
    ],
  },
  {
    ...FG,
    id: "tri-11",
    q: "$\\angle B = 90^\\circ$ の直角三角形 $ABC$ で $AB = 2$、$BC = 2\\sqrt{3}$ のとき $\\angle A$ の大きさを求めよ。",
    a: "$\\angle A = 60^\\circ$",
    solution: [
      "図を描くと $BC$ が $\\angle A$ の対辺、$AB$ が隣辺",
      "$\\tan A = \\dfrac{BC}{AB} = \\dfrac{2\\sqrt{3}}{2} = \\sqrt{3}$",
      "$\\angle A = 60^\\circ$",
    ],
  },
  {
    ...FG,
    id: "tri-12",
    q: "木から $20\\,\\mathrm{m}$ 離れた地点から木の先端を見上げる角が $30^\\circ$ であった。目の高さより上の部分の木の高さを求めよ。",
    a: "$\\dfrac{20\\sqrt{3}}{3}\\,\\mathrm{m}$",
    solution: [
      "図を描くと、水平距離 $20$、角 $30^\\circ$ の直角三角形",
      "$\\tan 30^\\circ = \\dfrac{h}{20}$",
      "$h = 20\\tan 30^\\circ = \\dfrac{20}{\\sqrt{3}} = \\dfrac{20\\sqrt{3}}{3}$",
    ],
  },

  // ---------- 三角比の特別角と 90° − θ(6) ----------
  {
    ...SP,
    id: "trispecial-01",
    q: "$\\sin 30^\\circ + \\cos 60^\\circ$ の値を求めよ。",
    a: "$1$",
    solution: [
      "$\\sin 30^\\circ = \\dfrac{1}{2}$、$\\cos 60^\\circ = \\dfrac{1}{2}$",
      "$\\dfrac{1}{2} + \\dfrac{1}{2} = 1$",
    ],
  },
  {
    ...SP,
    id: "trispecial-02",
    q: "$\\tan 60^\\circ \\times \\tan 30^\\circ$ の値を求めよ。",
    a: "$1$",
    solution: [
      "$\\tan 60^\\circ = \\sqrt{3}$、$\\tan 30^\\circ = \\dfrac{\\sqrt{3}}{3}$",
      "$\\sqrt{3} \\times \\dfrac{\\sqrt{3}}{3} = \\dfrac{3}{3} = 1$",
    ],
  },
  {
    ...SP,
    id: "trispecial-03",
    q: "$\\cos 30^\\circ - \\sin 45^\\circ$ の値を求めよ。",
    a: "$\\dfrac{\\sqrt{3} - \\sqrt{2}}{2}$",
    solution: [
      "$\\cos 30^\\circ = \\dfrac{\\sqrt{3}}{2}$、$\\sin 45^\\circ = \\dfrac{\\sqrt{2}}{2}$",
      "$\\dfrac{\\sqrt{3}}{2} - \\dfrac{\\sqrt{2}}{2} = \\dfrac{\\sqrt{3} - \\sqrt{2}}{2}$",
    ],
  },
  {
    ...CO,
    id: "trispecial-04",
    q: "$\\sin 70^\\circ$ を $45^\\circ$ 以下の角の $\\cos$ で表せ。",
    a: "$\\cos 20^\\circ$",
    solution: [
      "$\\sin(90^\\circ - \\theta) = \\cos\\theta$",
      "$70^\\circ = 90^\\circ - 20^\\circ$",
      "$\\sin 70^\\circ = \\cos 20^\\circ$",
    ],
  },
  {
    ...CO,
    id: "trispecial-05",
    q: "$\\cos 65^\\circ$ を $45^\\circ$ 以下の角の $\\sin$ で表せ。",
    a: "$\\sin 25^\\circ$",
    solution: [
      "$\\cos(90^\\circ - \\theta) = \\sin\\theta$",
      "$65^\\circ = 90^\\circ - 25^\\circ$",
      "$\\cos 65^\\circ = \\sin 25^\\circ$",
    ],
  },
  {
    ...CO,
    id: "trispecial-06",
    q: "$\\tan 40^\\circ \\times \\tan 50^\\circ$ の値を求めよ。",
    a: "$1$",
    solution: [
      "$50^\\circ = 90^\\circ - 40^\\circ$",
      "$\\tan(90^\\circ - \\theta) = \\dfrac{1}{\\tan\\theta}$ なので $\\tan 50^\\circ = \\dfrac{1}{\\tan 40^\\circ}$",
      "積は $1$",
    ],
  },

  // ---------- 三角比の対称式(4、応用) ----------
  {
    ...SY,
    id: "trisym-01",
    q: "$\\sin\\theta + \\cos\\theta = \\dfrac{1}{2}$ のとき $\\sin\\theta\\cos\\theta$ の値を求めよ。",
    a: "$-\\dfrac{3}{8}$",
    solution: [
      "両辺を2乗: $\\sin^2\\theta + 2\\sin\\theta\\cos\\theta + \\cos^2\\theta = \\dfrac{1}{4}$",
      "$1 + 2\\sin\\theta\\cos\\theta = \\dfrac{1}{4}$",
      "$\\sin\\theta\\cos\\theta = -\\dfrac{3}{8}$",
    ],
  },
  {
    ...SY,
    id: "trisym-02",
    q: "$\\sin\\theta + \\cos\\theta = \\dfrac{1}{3}$ のとき $\\sin\\theta\\cos\\theta$ の値を求めよ。",
    a: "$-\\dfrac{4}{9}$",
    solution: [
      "両辺を2乗して $1 + 2\\sin\\theta\\cos\\theta = \\dfrac{1}{9}$",
      "$2\\sin\\theta\\cos\\theta = -\\dfrac{8}{9}$",
      "$\\sin\\theta\\cos\\theta = -\\dfrac{4}{9}$",
    ],
  },
  {
    ...SY,
    id: "trisym-03",
    q: "$0^\\circ \\leqq \\theta \\leqq 180^\\circ$ で $\\sin\\theta + \\cos\\theta = \\dfrac{1}{2}$ のとき $\\sin\\theta - \\cos\\theta$ の値を求めよ。",
    a: "$\\dfrac{\\sqrt{7}}{2}$",
    solution: [
      "2乗すると $\\sin\\theta\\cos\\theta = -\\dfrac{3}{8}$",
      "$(\\sin\\theta - \\cos\\theta)^2 = 1 - 2\\sin\\theta\\cos\\theta = \\dfrac{7}{4}$",
      "積が負なので $\\theta$ は鈍角。$\\sin\\theta > 0 > \\cos\\theta$ より差は正",
      "$\\sin\\theta - \\cos\\theta = \\dfrac{\\sqrt{7}}{2}$",
    ],
  },
  {
    ...SY,
    id: "trisym-04",
    q: "$0^\\circ \\leqq \\theta \\leqq 180^\\circ$ で $\\sin\\theta\\cos\\theta = \\dfrac{1}{4}$ のとき $\\sin\\theta + \\cos\\theta$ の値を求めよ。",
    a: "$\\dfrac{\\sqrt{6}}{2}$",
    solution: [
      "$(\\sin\\theta + \\cos\\theta)^2 = 1 + 2\\sin\\theta\\cos\\theta = \\dfrac{3}{2}$",
      "積が正なので $\\theta$ は鋭角。$\\sin\\theta > 0,\\ \\cos\\theta > 0$ より和は正",
      "$\\sin\\theta + \\cos\\theta = \\sqrt{\\dfrac{3}{2}} = \\dfrac{\\sqrt{6}}{2}$",
    ],
  },
];
