// 卒業模擬試験:50問・100点満点・前後の問題に自由に移動できる
import React, { useMemo, useState } from "react";
import MathText from "./MathText.jsx";
import { generateExam, gradeExam } from "../logic/examGenerator.js";
import { saveExamResult } from "../logic/storage.js";
import { shuffledChoiceOrder } from "../logic/shuffle.js";

const CATEGORY_LABELS = { ns: "数と式", qf: "二次関数", tri: "三角比" };

export default function MockExam({ examSet, units, onExit }) {
  const questions = useMemo(() => generateExam(examSet, units), [examSet, units]);
  const [answers, setAnswers] = useState(() => Array(questions.length).fill(null));
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("intro"); // intro | exam | result
  const [result, setResult] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const q = questions[index];
  const answeredCount = answers.filter((a) => a !== null).length;

  const submit = () => {
    const r = gradeExam(questions, answers);
    saveExamResult(examSet.id, {
      score: r.score,
      byCategory: r.byCategory,
      date: new Date().toISOString(),
    });
    setResult(r);
    setPhase("result");
  };

  if (phase === "intro") {
    return (
      <div className="screen">
        <div className="top-bar">
          <button className="btn-ghost btn" onClick={onExit}>← ホームへ</button>
        </div>
        <div className="card" style={{ padding: "40px 36px", textAlign: "center" }}>
          <span className="badge accent" style={{ marginBottom: 16 }}>卒業模擬試験</span>
          <h1 style={{ marginBottom: 14 }}>{examSet.title}</h1>
          <p className="text-secondary" style={{ maxWidth: 500, margin: "0 auto 8px" }}>
            全50問・1問2点・100点満点。数と式/二次関数/三角比の全範囲から出題。
          </p>
          <p className="text-secondary" style={{ maxWidth: 500, margin: "0 auto 28px" }}>
            問題は自由に行き来できるから、わかるところから解いてOK。
            全部答えたら「採点する」を押してね。
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => setPhase("exam")}>
            試験をはじめる
          </button>
        </div>
      </div>
    );
  }

  if (phase === "exam") {
    return (
      <div className="screen" key={index}>
        <div className="top-bar">
          <button className="btn-ghost btn" onClick={onExit}>← 中断する</button>
          <span className="text-tertiary">
            {examSet.title} ・ 回答済み {answeredCount} / {questions.length}
          </span>
        </div>

        {/* 問題番号パレット */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 22 }}>
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              style={{
                width: 30, height: 30, borderRadius: 7,
                fontSize: "0.75rem", fontWeight: 650,
                background:
                  i === index
                    ? "var(--accent)"
                    : answers[i] !== null
                    ? "var(--accent-soft)"
                    : "var(--surface-2)",
                color:
                  i === index
                    ? "var(--accent-text)"
                    : answers[i] !== null
                    ? "var(--accent)"
                    : "var(--text-tertiary)",
                transition: "all var(--dur-fast) var(--ease)",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="badge">{`第 ${index + 1} 問`}</span>
            <span className="badge accent">{CATEGORY_LABELS[q.category]}</span>
          </div>
          <div style={{ fontSize: "1.12rem", lineHeight: 2, marginBottom: 20 }}>
            <MathText text={q.q} block />
          </div>
          <div className="choice-list">
            {shuffledChoiceOrder(q).map((orig, i) => (
              <button
                key={orig}
                className={`choice ${answers[index] === orig ? "selected" : ""}`}
                onClick={() => {
                  const next = [...answers];
                  next[index] = orig;
                  setAnswers(next);
                }}
              >
                <span className="choice-key">{"ABCD"[i]}</span>
                <MathText text={q.choices[orig]} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
          <button
            className="btn btn-secondary"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            ← 前へ
          </button>
          {index + 1 < questions.length ? (
            <button className="btn btn-primary" onClick={() => setIndex(index + 1)}>
              次へ →
            </button>
          ) : (
            <button
              className="btn btn-primary btn-lg"
              onClick={submit}
              disabled={answeredCount === 0}
            >
              採点する
            </button>
          )}
        </div>
        {answeredCount === questions.length && index + 1 < questions.length && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
            <button className="btn btn-primary btn-lg" onClick={submit}>
              全問回答済み — 採点する
            </button>
          </div>
        )}
      </div>
    );
  }

  // 結果画面
  const wrongs = result.detail.filter((d) => !d.ok);
  return (
    <div className="screen">
      <div className="card" style={{ padding: "40px 36px", textAlign: "center" }}>
        <span className="badge accent" style={{ marginBottom: 16 }}>{examSet.title} 結果</span>
        <h1 style={{ fontSize: "2.6rem", marginBottom: 8 }}>{result.score} 点</h1>
        <p className="text-secondary" style={{ marginBottom: 26 }}>
          {result.correct} / {result.total} 問正解 ・ 100点満点
          {result.score >= 80
            ? " — 目標の80点ライン到達。すばらしい。"
            : result.score >= 60
            ? " — あと一歩。単元別の正答率で弱点を確認しよう。"
            : " — 記録した。弱い単元に戻ってじっくり固めよう。"}
        </p>

        {/* 分野別正答率 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 460, margin: "0 auto", textAlign: "left" }}>
          {Object.entries(result.byCategory).map(([cat, r]) => {
            const pct = r.total ? Math.round((r.correct / r.total) * 100) : 0;
            return (
              <div key={cat}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontWeight: 650, fontSize: "0.95rem" }}>{CATEGORY_LABELS[cat]}</span>
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

        {/* 単元別正答率 */}
        <div className="divider" style={{ margin: "28px 0 18px" }} />
        <h3 style={{ marginBottom: 12 }}>単元別の正答率</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 460, margin: "0 auto", textAlign: "left" }}>
          {Object.values(result.byUnit)
            .sort((a, b) => a.correct / a.total - b.correct / b.total)
            .map((u, i) => {
              const pct = Math.round((u.correct / u.total) * 100);
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.92rem" }}>
                  <span>{u.title}</span>
                  <span
                    style={{
                      fontWeight: 650,
                      color: pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--warn)" : "var(--error)",
                    }}
                  >
                    {u.correct}/{u.total}
                  </span>
                </div>
              );
            })}
        </div>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 30, flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-lg" onClick={onExit}>
            ホームへ戻る
          </button>
          {wrongs.length > 0 && (
            <button className="btn btn-secondary" onClick={() => setReviewOpen(!reviewOpen)}>
              {reviewOpen ? "解説を閉じる" : `間違えた ${wrongs.length} 問の解説`}
            </button>
          )}
        </div>
      </div>

      {reviewOpen && (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          {wrongs.map((d) => {
            const wq = questions[d.index];
            return (
              <div className="card" key={d.index}>
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <span className="badge">第 {d.index + 1} 問</span>
                  <span className="badge accent">{wq.unitTitle}</span>
                </div>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>
                  <MathText text={wq.q} />
                </p>
                <p style={{ marginBottom: 6, fontSize: "0.95rem" }}>
                  正解: <MathText text={wq.choices[wq.answer]} />
                  {d.chosen !== null && (
                    <span className="text-tertiary">
                      (あなたの回答: <MathText text={wq.choices[d.chosen]} />)
                    </span>
                  )}
                </p>
                <p className="text-secondary" style={{ fontSize: "0.95rem" }}>
                  <MathText text={wq.exp} />
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
