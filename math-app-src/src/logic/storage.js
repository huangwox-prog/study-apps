// localStorage への進捗保存
const KEY = "mathapp.progress.v1";

const defaultState = () => ({
  units: {}, // unitId -> { mastery: 0-100, status, bestTest, skippedByDiag }
  exams: {}, // examId -> { score, byCategory, date, answers }
  checkTests: {}, // testId -> { correct, total, byCategory, elapsedSec, best, date }
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

export function saveProgress(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
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

export function saveCheckTestResult(testId, result) {
  const state = loadProgress();
  const prev = state.checkTests?.[testId];
  if (!state.checkTests) state.checkTests = {};
  state.checkTests[testId] = {
    ...result,
    best: Math.max(result.correct, prev?.best ?? 0),
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
  const today = new Date().toISOString().slice(0, 10);
  if (log.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    log.streak = log.lastDate === yesterday ? (log.streak ?? 0) + 1 : 1;
    log.lastDate = today;
  }
  if (unitId) log.lastUnitId = unitId;
  state.log = log;
  saveProgress(state);
  return state;
}

export function resetAllProgress() {
  localStorage.removeItem(KEY);
}
