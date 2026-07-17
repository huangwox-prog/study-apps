// 弱点トップ3カード: ミスタイプ別の集計を表示し、タップで復習セットへ
import React from "react";

export default function WeakSpots({ summary, onOpenReview, compact = false }) {
  const top3 = summary.slice(0, 3);

  if (top3.length === 0) {
    return (
      <div className="card" style={{ padding: compact ? "16px 18px" : "22px 26px" }}>
        <h3 style={{ marginBottom: 6, fontSize: compact ? "0.95rem" : undefined }}>弱点トップ3</h3>
        <p className="text-tertiary">
          確認テストや模試で間違えた問題がここに集まるよ。まだ弱点なし!
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: compact ? "16px 18px" : "22px 26px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <h3 style={{ fontSize: compact ? "0.95rem" : undefined }}>弱点トップ3</h3>
        <span className="text-tertiary" style={{ fontSize: "0.78rem" }}>タップで復習</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {top3.map((w, i) => (
          <button
            key={w.type}
            onClick={() => onOpenReview(w.type)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              textAlign: "left",
              padding: compact ? "8px 10px" : "12px 14px",
              borderRadius: "var(--radius-sm)",
              background: "var(--glass-soft)",
              border: "1px solid var(--glass-border-soft)",
              cursor: "pointer",
              transition: "border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.boxShadow = "0 0 0 1px var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--glass-border-soft)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <span
              style={{
                width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", fontWeight: 700,
                background: i === 0 ? "var(--error-soft)" : i === 1 ? "var(--warn-soft)" : "var(--accent-soft)",
                color: i === 0 ? "var(--error)" : i === 1 ? "var(--warn)" : "var(--accent)",
              }}
            >
              {i + 1}
            </span>
            <span style={{ flex: 1, fontWeight: 650, fontSize: compact ? "0.88rem" : "0.95rem" }}>
              {w.label}
            </span>
            <span className="text-tertiary" style={{ fontSize: "0.8rem" }}>
              {w.qids.length}問
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
