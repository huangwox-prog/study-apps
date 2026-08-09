// 口頭試問ドリルの自己採点記録
//
// 既存の進捗(mathapp.progress.v1)とは分けて持つ。役割が違うし、
// ドリルの記録だけをリセットできるようにするため。
// localStorage が使えない環境(プライベートモード等)でも落ちないよう、
// 読み書きはすべて try/catch で包む。
const KEY = "mathapp.oral.v1";

// 自己採点の3区分。方針間違いが多い分野が本当の弱点。
export const RESULT_KINDS = [
  { id: "correct", label: "正解", tone: "ok" },
  { id: "calc", label: "計算間違い", tone: "warn" },
  { id: "plan", label: "方針間違い", tone: "ng" },
];

const emptyTally = () => ({ correct: 0, calc: 0, plan: 0 });

const defaultState = () => ({
  fields: {}, // fieldId -> { correct, calc, plan }
  updatedAt: null,
});

export function loadOralStats() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed, fields: parsed?.fields ?? {} };
  } catch {
    return defaultState();
  }
}

function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 保存できなくても学習は続けられる。画面上の集計はメモリ上の値で動く。
  }
  return state;
}

// kind: "correct" | "calc" | "plan"
export function recordOralResult(fieldId, kind) {
  const state = loadOralStats();
  const tally = { ...emptyTally(), ...(state.fields[fieldId] || {}) };
  if (kind in tally) tally[kind] += 1;
  state.fields[fieldId] = tally;
  state.updatedAt = new Date().toISOString();
  return save(state);
}

// 直前の自己採点を取り消す(押し間違いの救済)
export function undoOralResult(fieldId, kind) {
  const state = loadOralStats();
  const tally = { ...emptyTally(), ...(state.fields[fieldId] || {}) };
  if (kind in tally) tally[kind] = Math.max(0, tally[kind] - 1);
  state.fields[fieldId] = tally;
  state.updatedAt = new Date().toISOString();
  return save(state);
}

export function resetOralStats() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 消せなくても既定値で動く
  }
  return defaultState();
}

// 分野ごとの正答率を、低い順に並べて返す。
// 未着手(解答数0)の分野は rate を null にして末尾へ回す。
export function summarizeOral(stats, fields) {
  const rows = fields.map((f) => {
    const t = { ...emptyTally(), ...(stats.fields?.[f.id] || {}) };
    const answered = t.correct + t.calc + t.plan;
    return {
      id: f.id,
      label: f.label,
      ...t,
      answered,
      rate: answered === 0 ? null : Math.round((t.correct / answered) * 100),
    };
  });

  rows.sort((a, b) => {
    if (a.rate === null && b.rate === null) return 0;
    if (a.rate === null) return 1;
    if (b.rate === null) return -1;
    return a.rate - b.rate;
  });

  const total = rows.reduce(
    (acc, r) => ({
      correct: acc.correct + r.correct,
      calc: acc.calc + r.calc,
      plan: acc.plan + r.plan,
      answered: acc.answered + r.answered,
    }),
    { correct: 0, calc: 0, plan: 0, answered: 0 }
  );

  return {
    rows,
    total: {
      ...total,
      rate: total.answered === 0 ? null : Math.round((total.correct / total.answered) * 100),
    },
  };
}
