// localStorage への進捗保存
const KEY = "mathapp.progress.v1";

const defaultState = () => ({
  units: {}, // unitId -> { mastery: 0-100, status, bestTest, skippedByDiag }
  exams: {}, // examId -> { score, byCategory, date, answers }
  mistakes: {}, // qid -> { type, unitId, count } 間違えた問題のミスタイプ記録
  log: {}, // { lastUnitId, lastDate: "YYYY-MM-DD", streak } 学習ログ
});

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

// localStorage が使えない環境(プライベートモード・容量超過など)でも
// 画面が落ちないように、書き込みは失敗しても握りつぶす。
export function saveProgress(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 保存できなくても、その場の学習はメモリ上の状態で続けられる
  }
  return state;
}

// 端末のローカル日付(YYYY-MM-DD)。toISOString だとUTC基準になり、
// 日本時間の朝9時で日付が変わってしまうのでこちらを使う。
function localDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function updateUnitProgress(unitId, patch) {
  const state = loadProgress();
  state.units[unitId] = { ...(state.units[unitId] || {}), ...patch };
  saveProgress(state);
  return state;
}

export function saveExamResult(examId, result) {
  const state = loadProgress();
  const prev = state.exams[examId];
  // ベストスコアを保持しつつ最新結果を保存
  state.exams[examId] = {
    ...result,
    best: Math.max(result.score, prev?.best ?? 0),
  };
  saveProgress(state);
  return state;
}

// ---------- 弱点分析 ----------
// 確認テスト・模試で間違えた問題のミスタイプを集計して保存する
// entries: [{ qid, unitId, type }]
export function recordMistakes(entries) {
  const state = loadProgress();
  if (!state.mistakes) state.mistakes = {};
  for (const { qid, unitId, type } of entries) {
    const prev = state.mistakes[qid];
    state.mistakes[qid] = {
      type: type || prev?.type || "calc",
      unitId,
      count: (prev?.count ?? 0) + 1,
    };
  }
  saveProgress(state);
  return state;
}

// 学習者がミスタイプのタグを付け替えたとき
export function retagMistake(qid, type) {
  const state = loadProgress();
  if (!state.mistakes?.[qid]) return state;
  state.mistakes[qid] = { ...state.mistakes[qid], type };
  saveProgress(state);
  return state;
}

// 復習で正解できた問題は弱点リストから外す
export function clearMistake(qid) {
  const state = loadProgress();
  if (state.mistakes?.[qid]) {
    delete state.mistakes[qid];
    saveProgress(state);
  }
  return state;
}

// ---------- 学習ログ(最終学習単元・連続学習日数) ----------
export function recordActivity(unitId) {
  const state = loadProgress();
  const log = state.log || {};
  const today = localDate();
  if (log.lastDate !== today) {
    const yesterday = localDate(new Date(Date.now() - 86400000));
    log.streak = log.lastDate === yesterday ? (log.streak ?? 0) + 1 : 1;
    log.lastDate = today;
  }
  if (unitId) log.lastUnitId = unitId;
  state.log = log;
  saveProgress(state);
  return state;
}

export function resetAllProgress() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 消せなくても既定値で動く
  }
}
