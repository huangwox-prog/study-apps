// ホーム画面:全単元の進捗一覧と模擬試験への入口
import React from "react";
import { masteryLabel, overallProgress } from "../logic/mastery.js";
import { EXAM_SETS } from "../logic/examGenerator.js";
import { summarizeMistakes } from "../logic/weakness.js";
import WeakSpots from "./WeakSpots.jsx";

const CATEGORY_LABELS = {
  ns: "数と式",
  qf: "二次関数",
  tri: "三角比",
};

export default function Dashboard({ units, progress, onOpenUnit, onOpenExam, onOpenReview }) {
  const overall = overallProgress(units, progress.units);
  const completedCount = units.filter(
    (u) => (progress.units[u.id]?.mastery ?? 0) >= 70
  ).length;

  const categories = ["ns", "qf", "tri"];

  return (
    <div className="screen">
      <header style={{ marginBottom: 34 }}>
        <p className="text-tertiary" style={{ marginBottom: 4 }}>数学I トレーナー</p>
        <h1 style={{ marginBottom: 20 }}>今日も少しずつ進めよう</h1>
        <div className="card" style={{ padding: "22px 26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={{ fontWeight: 650 }}>全体の進捗</span>
            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{overall}%</span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${overall >= 100 ? "complete" : ""}`}
              style={{ width: `${overall}%` }}
            />
          </div>
          <p className="text-tertiary" style={{ marginTop: 10 }}>
            習熟度70%以上の単元: {completedCount} / {units.length}
          </p>
        </div>
      </header>

      {/* サイドパネルが隠れる狭い画面でだけ表示(広い画面では右レールに表示される) */}
      <div className="mobile-only" style={{ marginBottom: 32 }}>
        <WeakSpots summary={summarizeMistakes(progress)} onOpenReview={onOpenReview} />
      </div>

      {categories.map((cat) => {
        const catUnits = units.filter((u) => u.category === cat);
        return (
          <section key={cat} className={`cat-${cat}`} style={{ marginBottom: 32 }}>
            <h2 style={{ marginBottom: 14, display: "flex", alignItems: "center" }}>
              <span className="cat-dot" />
              {CATEGORY_LABELS[cat]}
            </h2>
            <div className="fade-stagger" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {catUnits.map((unit, i) => {
                const p = progress.units[unit.id];
                const mastery = p?.mastery ?? 0;
                const started = p != null;
                return (
                  <button
                    key={unit.id}
                    className="card card-hover"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 18,
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      padding: "18px 22px",
                    }}
                    onClick={() => onOpenUnit(unit.id)}
                  >
                    <span
                      style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: "0.9rem",
                        background: mastery >= 70 ? "var(--success-soft)" : "var(--accent-soft)",
                        color: mastery >= 70 ? "var(--success)" : "var(--accent)",
                        transition: "background var(--dur) var(--ease)",
                      }}
                    >
                      {mastery >= 70 ? "✓" : i + 1}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 650, display: "block" }}>{unit.title}</span>
                      <span className="text-tertiary" style={{ fontSize: "0.85rem" }}>
                        {p?.skippedByDiag
                          ? "診断でスキップ済み(いつでも演習できる)"
                          : started
                          ? masteryLabel(mastery)
                          : unit.subtitle}
                      </span>
                    </span>
                    <span style={{ width: 110, flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="progress-track" style={{ flex: 1 }}>
                        <span
                          className={`progress-fill ${mastery >= 70 ? "complete" : ""}`}
                          style={{ width: `${mastery}%`, display: "block" }}
                        />
                      </span>
                      <span className="text-tertiary" style={{ fontSize: "0.82rem", width: 38, textAlign: "right" }}>
                        {mastery}%
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      <section>
        <h2 style={{ marginBottom: 6 }}>卒業模擬試験</h2>
        <p className="text-secondary" style={{ marginBottom: 14 }}>
          全範囲から50問・100点満点。単元の学習が進んだら腕試ししよう。
        </p>
        <div className="fade-stagger" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {EXAM_SETS.map((set) => {
            const result = progress.exams[set.id];
            return (
              <button
                key={set.id}
                className="card card-hover"
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  width: "100%", textAlign: "left", cursor: "pointer",
                  padding: "18px 22px",
                }}
                onClick={() => onOpenExam(set.id)}
              >
                <span style={{ flex: 1, fontWeight: 650 }}>{set.title}</span>
                {result ? (
                  <span className={`badge ${result.best >= 80 ? "ok" : ""}`}>
                    ベスト {result.best} 点
                  </span>
                ) : (
                  <span className="badge">未受験</span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
