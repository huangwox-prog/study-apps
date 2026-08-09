// 口頭試問ドリルの分野・分類・第一手の語彙定義
//
// 分類(CATEGORY)と第一手(FIRST_MOVE)は「ここにある語だけ」を使う。
// 問題を足すときも語彙は増やさない。増やすと口に出す言い方がぶれて、
// 「これは何の問題か」を即答する訓練にならなくなる。

// ---------- 分野(出題フィルタの単位) ----------
export const FIELDS = [
  { id: "expand", label: "展開", count: 12 },
  { id: "factor", label: "因数分解", count: 18 },
  { id: "linineq", label: "一次不等式・連立", count: 10 },
  { id: "absineq", label: "絶対値を含む一次不等式", count: 4 },
  { id: "qgraph", label: "二次関数のグラフと平行移動・対称移動", count: 12 },
  { id: "qdecide", label: "二次関数の決定", count: 18 },
  { id: "qmaxmin", label: "定義域つき最大最小", count: 18 },
  { id: "qeq", label: "二次方程式", count: 16 },
  { id: "disc", label: "判別式と実数解の個数", count: 18 },
  { id: "qineq", label: "二次不等式", count: 16 },
  { id: "tri", label: "三角比", count: 12 },
  { id: "trispecial", label: "三角比の特別角と 90° − θ", count: 6 },
  { id: "trisym", label: "三角比の対称式", count: 4 },
];

export const FIELD_LABEL = Object.fromEntries(FIELDS.map((f) => [f.id, f.label]));

// ---------- 分類 ----------
export const CATEGORY = {
  EXPAND: "展開",
  FACTOR: "因数分解",
  FACTOR_BY_ROOT: "解を使った因数分解",
  LIN_INEQ: "一次不等式",
  SIM_INEQ: "連立不等式",
  ABS_INEQ: "絶対値を含む一次不等式",
  Q_VERTEX: "二次関数の頂点",
  Q_TRANSLATE: "二次関数のグラフ(平行移動・対称移動)",
  Q_MAXMIN_DOMAIN: "定義域つき二次関数の最大最小",
  Q_DECIDE_VERTEX: "二次関数の決定(頂点+1点)",
  Q_DECIDE_AXIS: "二次関数の決定(軸+2点)",
  Q_DECIDE_3PT: "二次関数の決定(3点)",
  Q_EQ: "二次方程式",
  DOUBLE_ROOT: "重解の条件",
  REAL_ROOT_COUNT: "実数解の個数",
  INTERSECTION: "共有点の個数",
  ALWAYS_TRUE: "常に成り立つ条件",
  TWO_ROOTS: "異なる2つの解の条件",
  Q_INEQ: "二次不等式",
  TRI_IDENTITY: "三角比の相互関係",
  TRI_OBTUSE: "三角比の鈍角",
  TRI_SPECIAL: "三角比の特別角",
  TRI_COMPLEMENT: "三角比の 90° − θ",
  TRI_FIGURE: "三角比の図形",
  TRI_SYMMETRIC: "三角比の対称式",
};

// ---------- 第一手 ----------
export const MOVE = {
  EXPAND: "公式を使って展開する",
  FACTOR: "共通因数を探してから、公式かたすき掛け",
  FACTOR_BY_ROOT: "$= 0$ とおいて解の公式で解き、$a(x - \\alpha)(x - \\beta)$ に戻す",
  TRANSPOSE: "移項する。負の数で割るとき不等号が逆になる",
  NUMBER_LINE: "それぞれ解いてから数直線で共通範囲を見る",
  ABS_OFF:
    "絶対値をはずす。$|A| < c$ なら $-c < A < c$、$|A| > c$ なら $A < -c$ または $c < A$",
  COMPLETE_SQUARE: "平方完成する",
  COMPLETE_THEN_MOVE: "平方完成して頂点を出し、頂点を動かす",
  COMPLETE_THEN_AXIS: "平方完成して軸を出し、軸が範囲内かを判定する",
  DECIDE_VERTEX: "$y = a(x - p)^2 + q$ に頂点を入れ、残る $a$ を通る点で決める",
  DECIDE_AXIS: "$y = a(x - p)^2 + q$ に軸の $p$ を入れ、2点を代入して連立",
  DECIDE_3PT: "$y = ax^2 + bx + c$ に3点を代入して連立",
  QEQ: "因数分解を試して、無理なら解の公式",
  DISC_ZERO: "判別式 $= 0$",
  DISC_NEG: "判別式 $< 0$",
  DISC_POS: "判別式 $> 0$",
  DISC_SIGN: "判別式の符号で場合分けする",
  FACTOR_THEN_SIGN: "左辺を因数分解して符号がどこで変わるか調べる",
  TRI_IDENTITY: "$\\sin^2\\theta + \\cos^2\\theta = 1$、$1 + \\tan^2\\theta = \\dfrac{1}{\\cos^2\\theta}$ を使う",
  TRI_OBTUSE: "$180^\\circ - \\theta$ の変換。符号の変化に注意する",
  TRI_SPECIAL: "特別角の三角比の値を思い出す",
  TRI_COMPLEMENT: "$90^\\circ - \\theta$ の変換。$\\sin$ と $\\cos$ が入れ替わる",
  TRI_FIGURE: "図を描く",
  TRI_SQUARE: "両辺を2乗して $\\sin^2\\theta + \\cos^2\\theta = 1$ を使う",
};

const CATEGORY_SET = new Set(Object.values(CATEGORY));
const MOVE_SET = new Set(Object.values(MOVE));

// 語彙の外れ値と分野ごとの問題数を開発時に検出する
export function validateProblems(problems) {
  const errors = [];
  const seen = new Set();
  const byField = {};
  for (const p of problems) {
    if (seen.has(p.id)) errors.push(`id重複: ${p.id}`);
    seen.add(p.id);
    if (!FIELD_LABEL[p.field]) errors.push(`${p.id}: 未知の分野 ${p.field}`);
    if (!CATEGORY_SET.has(p.category)) errors.push(`${p.id}: 語彙外の分類「${p.category}」`);
    if (!MOVE_SET.has(p.firstMove)) errors.push(`${p.id}: 語彙外の第一手「${p.firstMove}」`);
    if (!Array.isArray(p.solution) || p.solution.length < 2 || p.solution.length > 4) {
      errors.push(`${p.id}: 解説は2〜4行にする(現在 ${p.solution?.length}行)`);
    }
    byField[p.field] = (byField[p.field] ?? 0) + 1;
  }
  for (const f of FIELDS) {
    if ((byField[f.id] ?? 0) !== f.count) {
      errors.push(`${f.label}: ${f.count}問のはずが ${byField[f.id] ?? 0}問`);
    }
  }
  return errors;
}
