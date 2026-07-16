// 単元の解き方解説画面
import React from "react";
import MathText from "./MathText.jsx";

export default function Lesson({ unit, onStart, onExit }) {
  return (
    <div className="screen">
      <div className="top-bar">
        <button className="btn-ghost btn" onClick={onExit}>← ホームへ</button>
        <span className="badge accent">解き方の解説</span>
      </div>

      <h1 style={{ marginBottom: 6 }}>{unit.title}</h1>
      <p className="text-secondary" style={{ marginBottom: 30 }}>
        まずは解き方をゆっくり確認しよう。読み終わったら下のボタンから問題へ。
      </p>

      <div className="fade-stagger" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {unit.lesson.map((section, i) => (
          <div className="card" key={i} style={{ padding: "26px 28px" }}>
            <h3 style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "var(--accent-soft)", color: "var(--accent)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.85rem", fontWeight: 700, flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              {section.h}
            </h3>
            {section.body.map((line, j) => (
              <p key={j} style={{ marginBottom: 10 }}>
                <MathText text={line} />
              </p>
            ))}
            {section.point && (
              <div
                style={{
                  background: "var(--accent-soft)",
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 18px",
                  marginTop: 10,
                }}
              >
                <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: "0.9rem" }}>
                  ポイント
                </span>
                <p style={{ marginTop: 4 }}>
                  <MathText text={section.point} />
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 34 }}>
        <button className="btn btn-primary btn-lg" onClick={onStart}>
          問題をはじめる →
        </button>
      </div>
    </div>
  );
}
