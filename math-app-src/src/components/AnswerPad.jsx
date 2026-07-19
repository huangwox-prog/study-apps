// 確認テスト用の電卓風入力パッド
// キーボード入力の代わりに、ボタンで数式・座標・場合分けの解答を組み立てる。
import React from "react";

// バックスペースでまとめて消す複数文字トークン(長いものから判定)
const MULTI_TOKENS = ["sqrt(", "^2", "のとき", "最小値", "最大値"];

const KEYS = [
  ["7", "8", "9", "(", ")", "⌫"],
  ["4", "5", "6", "+", "-", "AC"],
  ["1", "2", "3", "×", "/", "²"],
  ["0", "x", "y", "t", "a", ","],
  ["=", ";", "、", "のとき", "最小値", "最大値"],
];

const OP_KEYS = ["+", "-", "×", "/", "(", ")", "²", "=", ",", ";", "、"];
const WORD_KEYS = ["のとき", "最小値", "最大値"];

export default function AnswerPad({ value, onChange, disabled }) {
  const backspace = () => {
    for (const token of MULTI_TOKENS) {
      if (value.endsWith(token)) {
        onChange(value.slice(0, -token.length));
        return;
      }
    }
    onChange(value.slice(0, -1));
  };

  const press = (key) => {
    if (disabled) return;
    if (key === "⌫") return backspace();
    if (key === "AC") return onChange("");
    const append = { "×": "*", "²": "^2", "√": "sqrt(" }[key] ?? key;
    onChange(value + append);
  };

  return (
    <div>
      <div className={`mathpad-display ${value ? "active" : ""}`}>
        {value ? (
          <span className="math">{value}</span>
        ) : (
          <span className="text-tertiary" style={{ fontSize: "1rem" }}>
            下のボタンで答えを作ろう
          </span>
        )}
        {!disabled && <span className="cursor" />}
      </div>
      <div className="mathpad-grid">
        {KEYS.flat().map((key, i) => (
          <button
            key={key + i}
            className={`pad-key ${OP_KEYS.includes(key) ? "pad-op" : ""} ${
              key === "AC" || key === "⌫" ? "pad-danger" : ""
            } ${WORD_KEYS.includes(key) ? "pad-word" : ""}`}
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
