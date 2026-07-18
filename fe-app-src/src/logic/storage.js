// localStorage への受験結果保存
const KEY = "feapp.results.v1";

const defaultState = () => ({
  results: {}, // setId -> { best, attempts: [{score, correct, total, elapsedSec, byCategory, at}] }
});

export function loadResults() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function saveAttempt(setId, attempt) {
  const state = loadResults();
  const prev = state.results[setId] || { best: 0, attempts: [] };
  state.results[setId] = {
    best: Math.max(prev.best, attempt.score),
    attempts: [...prev.attempts, attempt].slice(-10), // 直近10回まで保持
  };
  saveState(state);
  return state;
}
