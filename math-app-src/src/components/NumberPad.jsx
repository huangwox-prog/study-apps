// 座標(頂点のx座標・y座標など)を1つの数値だけ入力するための、電卓風の小さいパッド
import React from "react";

const KEYS = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  ["AC", "0", "⌫"],
  ["-"],
];

export default function NumberPad({ value, onChange, disabled, label, status }) {
  const press = (key) => {
    if (disabled) return;
    if (key === "⌫") return onChange(value.slice(0, -1));
    if (key === "AC") return onChange("");
    onChange(value + key);
  };

  const statusStyle =
    status === "ok"
      ? { borderColor: "var(--success)", boxShadow: "0 0 0 1px var(--success)" }
      : status === "wrong"
      ? { borderColor: "var(--error)", boxShadow: "0 0 0 1px var(--error)" }
      : undefined;

  return (
    <div>
      {label && (
        <div className="text-tertiary" style={{ marginBottom: 6, fontSize: "0.85rem", fontWeight: 650 }}>
          {label}
        </div>
      )}
      <div
        className={`mathpad-display ${value ? "active" : ""}`}
        style={{ minHeight: 48, fontSize: "1.3rem", justifyContent: "center", ...statusStyle }}
      >
        {value ? (
          <span className="math">{value}</span>
        ) : (
          <span className="text-tertiary" style={{ fontSize: "0.9rem" }}>数値</span>
        )}
        {!disabled && <span className="cursor" />}
      </div>
      <div className="mathpad-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {KEYS.flat().map((key, i) => (
          <button
            key={key + i}
            className={`pad-key ${key === "-" ? "pad-op" : ""} ${key === "AC" || key === "⌫" ? "pad-danger" : ""}`}
            style={key === "-" ? { gridColumn: "span 3" } : undefined}
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
