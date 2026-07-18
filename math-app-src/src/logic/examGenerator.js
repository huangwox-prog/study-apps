// 卒業模擬試験の生成
// 全単元の選択式問題プールから、単元バランスを保った50問を
// シード付き乱数で決定的に選ぶ(同じセットは常に同じ問題構成)。

// 数と式17問 / 二次関数19問 / 三角比14問 = 50問(単元数 ns7:qf8:tri6 の比に合わせて配分)
export const EXAM_COMPOSITION = { ns: 17, qf: 19, tri: 14 };
export const EXAM_SETS = [
  { id: "exam-1", title: "卒業模試 第1回", seed: 11 },
  { id: "exam-2", title: "卒業模試 第2回", seed: 23 },
  { id: "exam-3", title: "卒業模試 第3回", seed: 37 },
  { id: "exam-4", title: "卒業模試 第4回", seed: 53 },
  { id: "exam-5", title: "卒業模試 第5回", seed: 71 },
];

// mulberry32: シード付き乱数
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(arr, rand) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// units: 全単元データ配列(problems込み)。選択式のみをプールにする。
export function buildExamPool(units) {
  const pool = { ns: [], qf: [], tri: [] };
  for (const unit of units) {
    const all = [
      ...(unit.diagnostic || []),
      ...(unit.practice || []),
      ...(unit.test || []),
    ];
    for (const q of all) {
      if (q.type === "choice") {
        pool[unit.category].push({
          ...q,
          unitId: unit.id,
          unitTitle: unit.title,
          category: unit.category,
        });
      }
    }
  }
  return pool;
}

export function generateExam(examSet, units) {
  const pool = buildExamPool(units);
  const rand = mulberry32(examSet.seed);
  const questions = [];
  for (const cat of ["ns", "qf", "tri"]) {
    const shuffled = seededShuffle(pool[cat], rand);
    questions.push(...shuffled.slice(0, EXAM_COMPOSITION[cat]));
  }
  // カテゴリ順のまま出すと単調なので、全体を軽くシャッフル
  return seededShuffle(questions, rand);
}

// 採点: answers は index配列(未回答は null)
export function gradeExam(questions, answers) {
  let correct = 0;
  const byCategory = { ns: { correct: 0, total: 0 }, qf: { correct: 0, total: 0 }, tri: { correct: 0, total: 0 } };
  const byUnit = {};
  const detail = [];
  questions.forEach((q, i) => {
    const ok = answers[i] === q.answer;
    if (ok) correct++;
    byCategory[q.category].total++;
    if (ok) byCategory[q.category].correct++;
    if (!byUnit[q.unitId]) byUnit[q.unitId] = { title: q.unitTitle, correct: 0, total: 0 };
    byUnit[q.unitId].total++;
    if (ok) byUnit[q.unitId].correct++;
    detail.push({ index: i, ok, chosen: answers[i] });
  });
  return {
    score: correct * 2, // 1問2点
    correct,
    total: questions.length,
    byCategory,
    byUnit,
    detail,
  };
}
