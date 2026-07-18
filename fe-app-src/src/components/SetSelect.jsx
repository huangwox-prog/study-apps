// ホーム画面: 模試セットの選択
import React from "react";

export default function SetSelect({ sets, results, onSelect }) {
  return (
    <div className="screen">
      <header style={{ marginBottom: 34 }}>
        <p className="text-tertiary" style={{ marginBottom: 4 }}>基本情報技術者試験 科目B</p>
        <h1 style={{ marginBottom: 10 }}>本番仕様 模擬試験</h1>
        <p className="text-secondary">
          1セット20問・制限時間100分。アルゴリズム・プログラミング16問(問1〜16は易→難)と、
          情報セキュリティ4問(問17〜20は難→易、長文シナリオ形式)で構成されています。
        </p>
      </header>

      <div className="fade-stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sets.map((set, i) => {
          const r = results[set.id];
          return (
            <button
              key={set.id}
              className="card card-hover"
              style={{ textAlign: "left", cursor: "pointer", width: "100%", padding: "22px 26px" }}
              onClick={() => onSelect(set.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span
                  style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "1rem",
                    background: "var(--accent-soft)", color: "var(--accent)",
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ flex: 1 }}>
                  <span style={{ fontWeight: 650, fontSize: "1.05rem", display: "block" }}>{set.title}</span>
                  <span className="text-tertiary" style={{ fontSize: "0.85rem" }}>
                    全20問・100分・アルゴリズム16問+セキュリティ4問
                  </span>
                </span>
                {r ? (
                  <span className={`badge ${r.best >= 80 ? "ok" : ""}`}>
                    ベスト {r.best} 点({r.attempts.length}回受験)
                  </span>
                ) : (
                  <span className="badge">未受験</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
