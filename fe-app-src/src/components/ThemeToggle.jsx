// ライト/ダークモードの手動切り替えボタン。全画面で常に右上に表示する。
import React, { useEffect, useState } from "react";
import { getStoredTheme, setStoredTheme, applyTheme, effectiveTheme } from "../logic/theme.js";

export default function ThemeToggle() {
  const [stored, setStored] = useState(() => getStoredTheme());
  const current = effectiveTheme(stored);

  useEffect(() => {
    applyTheme(stored);
  }, [stored]);

  const toggle = () => {
    const next = current === "dark" ? "light" : "dark";
    setStoredTheme(next);
    setStored(next);
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={current === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      title={current === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"}
    >
      <span className="theme-toggle-icon">{current === "dark" ? "🌙" : "☀️"}</span>
    </button>
  );
}
