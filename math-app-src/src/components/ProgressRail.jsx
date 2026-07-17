// 左サイドパネル: カテゴリ別進捗のミニマップ(広い画面のみ表示)
import React from "react";

const CATEGORY_LABELS = { ns: "数と式", qf: "二次関数", tri: "三角比" };

export default function ProgressRail({ units, progress, onOpenUnit }) {
  return (
    <div className="rail-inner">
      <p className="text-tertiary" style={{ fontWeight: 650, letterSpacing: "0.04em" }}>
        進捗マップ
      </p>
      {["ns", "qf", "tri"].map((cat) => {
        const catUnits = units.filter((u) => u.category === cat);
        const avg = Math.round(
          catUnits.reduce((s, u) => s + (progress.units[u.id]?.mastery ?? 0), 0) /
            catUnits.length
        );
        return (
          <div key={cat} className={`card cat-${cat}`} style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ display: "flex", alignItems: "center", fontWeight: 700, fontSize: "0.9rem" }}>
                <span className="cat-dot" style={{ width: 9, height: 9, borderRadius: 3 }} />
                {CATEGORY_LABELS[cat]}
              </span>
              <span className="text-tertiary" style={{ fontSize: "0.8rem" }}>{avg}%</span>
            </div>
            <div className="progress-track" style={{ marginBottom: 10 }}>
              <div className="progress-fill" style={{ width: `${avg}%` }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {catUnits.map((u, i) => {
                const m = progress.units[u.id]?.mastery ?? 0;
                return (
                  <button
                    key={u.id}
                    onClick={() => onOpenUnit(u.id)}
                    title={u.title}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "3px 4px", borderRadius: 6, cursor: "pointer",
                      transition: "background var(--dur-fast) var(--ease)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass-soft)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span
                      className="text-tertiary"
                      style={{ fontSize: "0.72rem", width: 12, flexShrink: 0, textAlign: "right" }}
                    >
                      {m >= 70 ? "✓" : i + 1}
                    </span>
                    <span
                      style={{
                        flex: 1, overflow: "hidden", textOverflow: "ellipsis",
                        whiteSpace: "nowrap", fontSize: "0.78rem", textAlign: "left",
                        color: m >= 70 ? "var(--success)" : "var(--text-secondary)",
                      }}
                    >
                      {u.title}
                    </span>
                    <span className="progress-track" style={{ width: 34, flexShrink: 0, height: 5 }}>
                      <span
                        className={`progress-fill ${m >= 70 ? "complete" : ""}`}
                        style={{ width: `${m}%`, display: "block", height: "100%" }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
