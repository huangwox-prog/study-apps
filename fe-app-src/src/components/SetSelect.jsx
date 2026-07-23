// ホーム画面: 模試セットの選択
import React from "react";
import StudyGauge from "./StudyGauge.jsx";

function SetButton({ set, index, results, onSelect }) {
  const r = results[set.id];
  const algoCount = set.questions.filter((q) => q.section === "algo").length;
  const secCount = set.questions.filter((q) => q.section === "sec").length;
  const duration = set.durationMin ?? 100;
  const compLabel =
    algoCount > 0 && secCount > 0
      ? `アルゴリズム${algoCount}問+セキュリティ${secCount}問`
      : secCount > 0
      ? `情報セキュリティ${secCount}問`
      : `アルゴリズム${algoCount}問`;

  return (
    <button
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
          {index + 1}
        </span>
        <span style={{ flex: 1 }}>
          <span style={{ fontWeight: 650, fontSize: "1.05rem", display: "block" }}>{set.title}</span>
          <span className="text-tertiary" style={{ fontSize: "0.85rem" }}>
            全{set.questions.length}問・{duration}分・{compLabel}
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
}

export default function SetSelect({ sets, results, onSelect }) {
  const fullSets = sets.filter((s) => s.kind !== "security-drill");
  const drillSets = sets.filter((s) => s.kind === "security-drill");

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

      <StudyGauge />

      <div className="fade-stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {fullSets.map((set, i) => (
          <SetButton key={set.id} set={set} index={i} results={results} onSelect={onSelect} />
        ))}
      </div>

      {drillSets.length > 0 && (
        <div style={{ marginTop: 44 }}>
          <h2 style={{ marginBottom: 8 }}>セキュリティ特訓(高難度)</h2>
          <p className="text-secondary" style={{ marginBottom: 20 }}>
            1セット4問・制限時間25分。長文シナリオ形式の情報セキュリティ問題のみで構成された高難度演習です。
            本番仕様模擬試験のセキュリティ問題より難易度を高く設定しており、選択肢の見極めに時間がかかります。
          </p>
          <div className="fade-stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {drillSets.map((set, i) => (
              <SetButton key={set.id} set={set} index={i} results={results} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
