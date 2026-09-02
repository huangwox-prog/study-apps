// 街の電源スイッチ。夜(既定)と白昼を切り替える。保存はしない。
import React, { useEffect, useState } from "react";
import { applyTheme } from "../logic/theme.js";

export default function ThemeToggle() {
  const [current, setCurrent] = useState("dark");

  useEffect(() => {
    applyTheme(current);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", current === "dark" ? "#07031a" : "#d9dcef");
  }, [current]);

  const toggle = () => setCurrent((c) => (c === "dark" ? "light" : "dark"));
  const label = current === "dark" ? "白昼モードに切り替え" : "夜間モードに切り替え";

  return (
    <button className="theme-toggle" onClick={toggle} aria-label={label} title={label}>
      <span className="theme-toggle-icon">{current === "dark" ? "◐" : "◑"}</span>
    </button>
  );
}
