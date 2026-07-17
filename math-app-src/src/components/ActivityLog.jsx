// 右サイドパネル用: 直近の学習ログ(最終単元・連続学習日数)
import React from "react";

export default function ActivityLog({ log, units, onOpenUnit, compact = false }) {
  const lastUnit = log.lastUnitId ? units.find((u) => u.id === log.lastUnitId) : null;
  const streak = log.streak ?? 0;

  return (
    <div className="card" style={{ padding: compact ? "16px 18px" : "22px 26px" }}>
      <h3 style={{ marginBottom: 12, fontSize: compact ? "0.95rem" : undefined }}>学習ログ</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: lastUnit ? 12 : 0 }}>
        <span
          style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--accent-soft)", color: "var(--accent)",
            fontWeight: 700, fontSize: "1.1rem",
          }}
        >
          {streak || 0}
        </span>
        <span>
          <span style={{ fontWeight: 650, display: "block", fontSize: compact ? "0.85rem" : "0.95rem" }}>
            連続学習 {streak} 日
          </span>
          <span className="text-tertiary" style={{ fontSize: "0.78rem" }}>
            {streak > 0 ? "その調子!" : "今日から積み上げよう"}
          </span>
        </span>
      </div>
      {lastUnit && (
        <button
          onClick={() => onOpenUnit(lastUnit.id)}
          style={{
            display: "block", width: "100%", textAlign: "left",
            padding: "10px 12px", borderRadius: "var(--radius-sm)",
            background: "var(--glass-soft)", border: "1px solid var(--glass-border-soft)",
            cursor: "pointer",
          }}
        >
          <span className="text-tertiary" style={{ fontSize: "0.72rem", display: "block" }}>
            前回の続きから
          </span>
          <span style={{ fontWeight: 650, fontSize: compact ? "0.85rem" : "0.92rem" }}>
            {lastUnit.title}
          </span>
        </button>
      )}
    </div>
  );
}
