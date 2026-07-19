// ライト/ダークモードの手動切り替えボタン。全画面で常に右上に表示する。
// 常にライトモードから開始し、押した場合のみその場でダークモードに切り替わる(保存しない)。
import React, { useEffect, useState } from "react";
import { applyTheme } from "../logic/theme.js";

export default function ThemeToggle() {
  const [current, setCurrent] = useState("light");

  useEffect(() => {
    applyTheme(current);
  }, [current]);

  const toggle = () => {
    setCurrent((c) => (c === "dark" ? "light" : "dark"));
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
