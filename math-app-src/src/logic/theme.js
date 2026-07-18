// 手動テーマ切り替え(ライト/ダーク)の永続化
// 進捗データ(mathapp.progress.v1)とは別キーで管理する。
const KEY = "mathapp.theme";

// 保存済みの選択("light" | "dark")。未選択ならnull(OS設定に従う)。
export function getStoredTheme() {
  const v = localStorage.getItem(KEY);
  return v === "light" || v === "dark" ? v : null;
}

export function setStoredTheme(theme) {
  if (theme === null) {
    localStorage.removeItem(KEY);
  } else {
    localStorage.setItem(KEY, theme);
  }
}

// documentのルート要素にdata-theme属性を反映する
export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === null) {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// 現在の実効テーマ("light" | "dark"): 保存済みの選択があればそれ、なければOS設定
export function effectiveTheme(stored) {
  return stored ?? (systemPrefersDark() ? "dark" : "light");
}
