// localStorage への進捗保存
const KEY = "mathapp.progress.v1";

const defaultState = () => ({
  units: {}, // unitId -> { mastery: 0-100, status, bestTest, skippedByDiag }
  exams: {}, // examId -> { score, byCategory, date, answers }
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

export function resetAllProgress() {
  localStorage.removeItem(KEY);
}
