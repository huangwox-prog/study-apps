// 数式入力パッド:電卓のようにボタンで式を組み立てる
// 内部ではトークン列(文字列)を保持し、表示はMathTextで整形する。
import React, { useMemo } from "react";
import MathText from "./MathText.jsx";

const KEYS = [
  ["7", "8", "9", "(", ")", "⌫"],
  ["4", "5", "6", "+", "-", "AC"],
  ["1", "2", "3", "×", "/", "√"],
  ["0", "x", "y", "a", "b", "²"],
];

// 入力文字列 → 表示用マークアップ(^2 を ² のsupに、sqrtを√に)
function toDisplayMarkup(src) {
  return src.replace(/\^2/g, "^2").replace(/\*/g, "×");
}

export default function MathPad({ value, onChange, disabled }) {
  const display = useMemo(() => toDisplayMarkup(value), [value]);

  const press = (key) => {
    if (disabled) return;
    if (key === "⌫") {
      // ^2 や sqrt( はまとめて消す
      if (value.endsWith("^2")) onChange(value.slice(0, -2));
      else if (value.endsWith("sqrt(")) onChange(value.slice(0, -5));
      else onChange(value.slice(0, -1));
      return;
    }
    if (key === "AC") {
      onChange("");
      return;
    }
    const append = {
      "×": "*",
      "²": "^2",
      "√": "sqrt(",
    }[key] ?? key;
    onChange(value + append);
  };

  return (
    <div>
      <div className={`mathpad-display ${value ? "active" : ""}`}>
        {value ? (
          <span className="math">
            <MathText text={"`" + display + "`"} />
          </span>
        ) : (
          <span className="text-tertiary" style={{ fontSize: "1rem" }}>
            下のボタンで式を作ろう
          </span>
        )}
        {!disabled && <span className="cursor" />}
      </div>
      <div className="mathpad-grid">
        {KEYS.flat().map((key) => (
          <button
            key={key}
            className={`pad-key ${
              ["+", "-", "×", "/", "(", ")", "√", "²"].includes(key)
                ? "pad-op"
                : ""
            } ${key === "AC" || key === "⌫" ? "pad-danger" : ""}`}
            onClick={() => press(key)}
            disabled={disabled}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
