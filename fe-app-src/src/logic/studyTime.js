// 学習時間トラッキング(localStorageに日付ごとの合計秒数を保存)
const KEY = "feapp.studytime.v1";

// 1日あたりの目標学習時間(分)。後から変更しやすいよう定数化している。
export const DAILY_TARGET_MIN = 60;

function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // 保存に失敗しても学習自体には影響させない
  }
}

export function addElapsedSeconds(sec) {
  if (!sec || sec <= 0) return;
  const data = load();
  const key = dateKey();
  data[key] = (data[key] || 0) + Math.round(sec);
  save(data);
}

export function getDailySeconds(date = new Date()) {
  const data = load();
  return data[dateKey(date)] || 0;
}

export function getWeeklySeconds() {
  const data = load();
  const now = new Date();
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    total += data[dateKey(d)] || 0;
  }
  return total;
}

export function formatMinutes(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}秒`;
  return `${m}分${s}秒`;
}
