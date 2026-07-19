// 単元確認テスト:記述式解答・タイマー・分野別正答率つきの確認テストランナー
import React, { useEffect, useRef, useState } from "react";
import MathText from "./MathText.jsx";
import { gradeCheckAnswer } from "../logic/checkGrading.js";
import { saveCheckTestResult } from "../logic/storage.js";

function formatTime(totalSec) {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default function CheckTest({ test, categoryLabels, onExit }) {
  const questions = test.questions;
  const total = questions.length;

  const [phase, setPhase] = useState("intro"); // intro | running | result
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null); // null | { correct, hint }
  const [entries, setEntries] = useState(() =>
    Array(total).fill(null).map(() => ({ submitted: false, correct: false }))
  );
  const [remaining, setRemaining] = useState(test.timeLimitSec);
  const [result, setResult] = useState(null);
  const finishedRef = useRef(false);

  // タイマー(受験中のみカウントダウン)
  useEffect(() => {
    if (phase !== "running") return;
    const timer = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // 時間切れで自動終了
  useEffect(() => {
    if (phase === "running" && remaining <= 0 && !finishedRef.current) {
      finishTest(entries);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, phase]);

  const start = () => {
    finishedRef.current = false;
    setEntries(Array(total).fill(null).map(() => ({ submitted: false, correct: false })));
    setRemaining(test.timeLimitSec);
    setIndex(0);
    setInput("");
    setFeedback(null);
    setResult(null);
    setPhase("running");
  };

  const submitAnswer = () => {
    const q = questions[index];
    const { correct } = gradeCheckAnswer(q, input);
    const nextEntries = entries.map((e, i) => (i === index ? { submitted: true, correct } : e));
    setEntries(nextEntries);
    setFeedback({ correct, hint: q.hint });
  };

  const goNext = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      setInput("");
      setFeedback(null);
    } else {
      finishTest(entries);
    }
  };

  function finishTest(finalEntries) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const elapsedSec = test.timeLimitSec - remaining;
    const byCategory = {};
    for (const key of Object.keys(categoryLabels)) byCategory[key] = { correct: 0, total: 0 };
    let correctCount = 0;
    questions.forEach((q, i) => {
      const e = finalEntries[i] || { submitted: false, correct: false };
      if (!byCategory[q.category]) byCategory[q.category] = { correct: 0, total: 0 };
      byCategory[q.category].total++;
      if (e.correct) {
        byCategory[q.category].correct++;
        correctCount++;
      }
    });
    const r = { correct: correctCount, total, byCategory, elapsedSec, date: new Date().toISOString() };
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
            全{total}問、制限時間は{Math.round(test.timeLimitSec / 60)}分。
            答えは数式や座標をそのまま入力してね(<MathText text="`x^2`" /> でも「x²」でもOK)。
            1問ずつ採点され、間違えたときは途中式のヒントが1つ表示されるよ。
          </p>
          <button className="btn btn-primary btn-lg" onClick={start}>
            テストをはじめる
          </button>
        </div>
      </div>
    );
  }

  // ---------- 受験画面 ----------
  if (phase === "running") {
    const q = questions[index];
    const low = remaining <= 60;
    return (
      <div className="screen" key={index}>
        <div className="top-bar">
          <button className="btn-ghost btn" onClick={onExit}>← 中断する</button>
          <span className={`badge ${low ? "" : "accent"}`} style={low ? { color: "var(--error)", borderColor: "color-mix(in srgb, var(--error) 30%, transparent)", background: "var(--error-soft)" } : undefined}>
            残り時間 {formatTime(remaining)}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <div className="progress-track" style={{ flex: 1 }}>
            <div className="progress-fill" style={{ width: `${(index / total) * 100}%` }} />
          </div>
          <span className="text-tertiary" style={{ whiteSpace: "nowrap" }}>
            {index + 1} / {total}
          </span>
        </div>

        <div className="card" style={{ padding: "28px" }}>
          <div style={{ marginBottom: 14 }}>
            <span className="badge accent">{categoryLabels[q.category]}</span>
          </div>
          <div style={{ fontSize: "1.12rem", lineHeight: 2, marginBottom: 20 }}>
            <MathText text={q.q} block />
          </div>

          <input
            type="text"
            className="text-input"
            value={input}
            disabled={!!feedback}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !feedback && input.trim()) submitAnswer();
            }}
            placeholder="ここに答えを入力"
            autoFocus
          />
          <p className="text-tertiary" style={{ marginTop: 8 }}>
            <MathText text={q.format} />
          </p>

          {feedback && (
            <div className={`feedback ${feedback.correct ? "ok" : "ng"}`}>
              <div className="feedback-title">
                {feedback.correct ? "○ 正解" : "△ おしい、ここで確認しておこう"}
              </div>
              {!feedback.correct && <MathText text={feedback.hint} block />}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
          {feedback ? (
            <button className="btn btn-primary btn-lg" onClick={goNext}>
              {index + 1 < total ? "次の問題へ →" : "結果を見る"}
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" disabled={!input.trim()} onClick={submitAnswer}>
              答え合わせ
            </button>
          )}
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
