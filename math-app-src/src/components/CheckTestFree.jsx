// 単元確認テスト(自由行き来版): 係数を個別欄に入力し、問題番号パレットから
// 好きな順番・タイミングで移動できる確認テストランナー
import React, { useEffect, useState } from "react";
import MathText from "./MathText.jsx";
import NumberPad from "./NumberPad.jsx";
import { gradeFieldAnswer } from "../logic/checkGrading.js";
import { saveCheckTestResult } from "../logic/storage.js";

function formatTime(totalSec) {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function emptyEntry() {
  return { values: {}, submitted: false, correct: false, fieldResults: {} };
}

export default function CheckTestFree({ test, categoryLabels, onExit }) {
  const questions = test.questions;
  const total = questions.length;

  const [phase, setPhase] = useState("intro"); // intro | running | result
  const [index, setIndex] = useState(0);
  const [entries, setEntries] = useState(() => Array(total).fill(null).map(emptyEntry));
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (phase !== "running") return;
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const start = () => {
    setEntries(Array(total).fill(null).map(emptyEntry));
    setElapsed(0);
    setIndex(0);
    setResult(null);
    setPhase("running");
  };

  const q = questions[index];
  const entry = entries[index];

  const setFieldValue = (key, val) => {
    setEntries((es) =>
      es.map((e, i) => (i === index ? { ...e, values: { ...e.values, [key]: val } } : e))
    );
  };

  const canSubmit = q.fields.every((f) => (entry.values[f.key] ?? "").trim() !== "");

  const submitCurrent = () => {
    const { correct, fieldResults } = gradeFieldAnswer(q, entry.values);
    setEntries((es) =>
      es.map((e, i) => (i === index ? { ...e, submitted: true, correct, fieldResults } : e))
    );
  };

  const answeredCount = entries.filter((e) => e.submitted).length;

  function finish() {
    const byCategory = {};
    for (const key of Object.keys(categoryLabels)) byCategory[key] = { correct: 0, total: 0 };
    let correctCount = 0;
    questions.forEach((qq, i) => {
      const e = entries[i];
      if (!byCategory[qq.category]) byCategory[qq.category] = { correct: 0, total: 0 };
      byCategory[qq.category].total++;
      if (e.submitted && e.correct) {
        byCategory[qq.category].correct++;
        correctCount++;
      }
    });
    const r = { correct: correctCount, total, byCategory, elapsedSec: elapsed, date: new Date().toISOString() };
    saveCheckTestResult(test.id, r);
    setResult(r);
    setPhase("result");
  }

  // ---------- 導入画面 ----------
  if (phase === "intro") {
    return (
      <div className="screen" key="intro">
        <div className="top-bar">
          <button className="btn-ghost btn" onClick={onExit}>← ホームへ</button>
        </div>
        <div className="card" style={{ padding: "40px 36px", textAlign: "center" }}>
          <span className="badge accent" style={{ marginBottom: 16 }}>単元確認テスト</span>
          <h1 style={{ marginBottom: 14 }}>{test.title}</h1>
          <p className="text-secondary" style={{ maxWidth: 520, margin: "0 auto 8px" }}>
            {test.subtitle}
          </p>
          <p className="text-secondary" style={{ maxWidth: 520, margin: "0 auto 28px" }}>
            全{total}問。制限時間はなし(経過時間だけ記録されるよ)。
            答えは `y=…` のような式ではなく、係数(a, p, qなど)を1つずつ数値で入力してね。
            下の番号パレットから好きな問題に自由にジャンプできる。
          </p>
          <button className="btn btn-primary btn-lg" onClick={start}>
            テストをはじめる
          </button>
        </div>
      </div>
    );
  }

  // ---------- 受験画面(自由行き来) ----------
  if (phase === "running") {
    return (
      <div className="screen" key="running">
        <div className="top-bar">
          <button className="btn-ghost btn" onClick={onExit}>← 中断する</button>
          <span className="badge accent">経過時間 {formatTime(elapsed)}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div className="progress-track" style={{ flex: 1 }}>
            <div className="progress-fill" style={{ width: `${(answeredCount / total) * 100}%` }} />
          </div>
          <span className="text-tertiary" style={{ whiteSpace: "nowrap" }}>
            解答済み {answeredCount} / {total}
          </span>
        </div>

        {/* 問題番号パレット: どこからでも直接ジャンプできる */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 22 }}>
          {questions.map((_, i) => {
            const e = entries[i];
            const isCurrent = i === index;
            let bg = "var(--glass-soft)";
            let color = "var(--text-tertiary)";
            let border = "1px solid var(--glass-border-soft)";
            if (e.submitted) {
              bg = e.correct ? "var(--success-soft)" : "var(--error-soft)";
              color = e.correct ? "var(--success)" : "var(--error)";
              border = `1px solid ${e.correct ? "var(--success)" : "var(--error)"}`;
            }
            if (isCurrent) {
              bg = "var(--accent)";
              color = "var(--accent-text)";
              border = "none";
            }
            return (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`第${i + 1}問へ移動`}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  fontSize: "0.72rem", fontWeight: 650,
                  background: bg, color, border,
                  transition: "all var(--dur-fast) var(--ease)",
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className="card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="badge">{`第 ${index + 1} 問`}</span>
            <span className="badge accent">{categoryLabels[q.category]}</span>
          </div>
          <div style={{ fontSize: "1.12rem", lineHeight: 2, marginBottom: 20 }}>
            <MathText text={q.q} block />
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {q.fields.map((f) => (
              <div key={f.key} style={{ flex: "1 1 110px", minWidth: 100 }}>
                <NumberPad
                  value={entry.values[f.key] ?? ""}
                  onChange={(v) => setFieldValue(f.key, v)}
                  label={f.label}
                  status={entry.submitted ? (entry.fieldResults[f.key] ? "ok" : "wrong") : undefined}
                />
              </div>
            ))}
          </div>

          {entry.submitted && (
            <div className={`feedback ${entry.correct ? "ok" : "ng"}`}>
              <div className="feedback-title">
                {entry.correct ? "○ 正解" : "△ おしい、ここで確認しておこう"}
              </div>
              {!entry.correct && <MathText text={q.hint} block />}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-secondary" disabled={index === 0} onClick={() => setIndex(index - 1)}>
              ← 前へ
            </button>
            <button className="btn btn-secondary" disabled={index === total - 1} onClick={() => setIndex(index + 1)}>
              次へ →
            </button>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-primary" disabled={!canSubmit} onClick={submitCurrent}>
              {entry.submitted ? "再採点する" : "答え合わせ"}
            </button>
            <button className="btn btn-secondary" onClick={finish}>
              結果を見る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- 結果画面 ----------
  const entries2 = Object.entries(result.byCategory);
  const weakest = entries2
    .map(([cat, r]) => ({ cat, pct: r.total ? (r.correct / r.total) * 100 : 100 }))
    .sort((a, b) => a.pct - b.pct)[0];
  const overallPct = result.total ? Math.round((result.correct / result.total) * 100) : 0;

  return (
    <div className="screen" key="result">
      <div className="card" style={{ padding: "40px 36px", textAlign: "center" }}>
        <span className="badge accent" style={{ marginBottom: 16 }}>{test.title} 結果</span>
        <h1 style={{ fontSize: "2.4rem", marginBottom: 8 }}>
          {result.correct} / {result.total} 問正解
        </h1>
        <p className="text-secondary" style={{ marginBottom: 6 }}>
          正答率 {overallPct}% ・ かかった時間 {formatTime(result.elapsedSec)}
        </p>
        {weakest && weakest.pct < 100 && (
          <p className="text-secondary" style={{ marginBottom: 26 }}>
            苦手分野: <strong style={{ color: "var(--error)" }}>{categoryLabels[weakest.cat]}</strong>
            から復習してみよう。
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 460, margin: "0 auto", textAlign: "left" }}>
          {entries2.map(([cat, r]) => {
            const pct = r.total ? Math.round((r.correct / r.total) * 100) : 0;
            return (
              <div key={cat}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontWeight: 650, fontSize: "0.95rem" }}>
                    {categoryLabels[cat]}
                    {weakest?.cat === cat && weakest.pct < 100 && (
                      <span className="badge" style={{ marginLeft: 8, color: "var(--error)", borderColor: "color-mix(in srgb, var(--error) 30%, transparent)", background: "var(--error-soft)" }}>
                        苦手
                      </span>
                    )}
                  </span>
                  <span className="text-secondary" style={{ fontSize: "0.9rem" }}>
                    {r.correct}/{r.total}({pct}%)
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${pct >= 80 ? "complete" : ""}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 30, flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-lg" onClick={onExit}>
            ホームへ戻る
          </button>
          <button className="btn btn-secondary" onClick={start}>
            もう一度挑戦する
          </button>
        </div>
      </div>
    </div>
  );
}
