// FE科目B模擬試験の受験画面: intro(説明) → exam(受験) → result(採点結果)
// 意匠は「電脳演習区」に入区 → 演習 → 判定 の流れとして構成する。
import React, { useState, useCallback } from "react";
import CodeBlock from "./CodeBlock.jsx";
import ExamTimer from "./ExamTimer.jsx";
import QuestionPalette from "./QuestionPalette.jsx";
import { gradeExam, formatElapsed } from "../logic/grading.js";
import { saveAttempt } from "../logic/storage.js";
import { shuffledChoiceOrder } from "../logic/shuffle.js";
import { useScrollReveal } from "../logic/useScrollReveal.js";

export default function ExamRunner({ examSet, onExit }) {
  const [phase, setPhase] = useState("intro"); // intro | exam | result
  const [current, setCurrent] = useState(1);
  const [answers, setAnswers] = useState({}); // { [no]: choiceIndex }
  const [result, setResult] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const questions = examSet.questions;
  const q = questions.find((qq) => qq.no === current);
  const answeredCount = Object.keys(answers).length;
  const durationMin = examSet.durationMin ?? 100;
  const DURATION_SEC = durationMin * 60;
  const algoCount = questions.filter((qq) => qq.section === "algo").length;
  const secCount = questions.filter((qq) => qq.section === "sec").length;
  const introSummary =
    algoCount > 0 && secCount > 0
      ? `全${questions.length}問(アルゴリズム・プログラミング${algoCount}問 + 情報セキュリティ${secCount}問)・制限時間${durationMin}分の本番仕様模試です。`
      : secCount > 0
      ? `全${questions.length}問(情報セキュリティのみ)・制限時間${durationMin}分の高難度演習です。`
      : `全${questions.length}問・制限時間${durationMin}分の演習です。`;

  useScrollReveal([phase, current, reviewOpen]);

  const finish = useCallback(
    (autoByTimeout) => {
      const elapsedSec = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
      const r = gradeExam(questions, answers);
      const attempt = {
        score: r.score,
        correct: r.correct,
        total: r.total,
        byCategory: r.byCategory,
        elapsedSec: Math.min(elapsedSec, DURATION_SEC),
        at: new Date().toISOString(),
        autoByTimeout: !!autoByTimeout,
      };
      saveAttempt(examSet.id, attempt);
      setResult({ ...r, elapsedSec: attempt.elapsedSec, autoByTimeout });
      setPhase("result");
      window.scrollTo({ top: 0 });
    },
    [answers, examSet.id, questions, startedAt, DURATION_SEC]
  );

  // ---------- 入区画面 ----------
  if (phase === "intro") {
    return (
      <div className="screen">
        <div className="top-bar">
          <button className="btn btn-ghost" onClick={onExit}>◄ セット選択へ</button>
          <span className="tag-en" style={{ color: "var(--magenta)" }}>standby</span>
        </div>
        <div className="card" style={{ padding: "44px 34px", textAlign: "center" }}>
          <span className="sign-rig" aria-hidden="true"><i /><i /></span>
          <p style={{ fontFamily: "var(--font-pixel)", letterSpacing: "0.2em", fontSize: "0.9rem", color: "var(--cyan)", marginBottom: 14 }}>
            基本情報技術者試験 <span className="tag-en">kamoku B</span>
          </p>
          <h1 className="glitch neon-cyan" data-text={examSet.title} style={{ marginBottom: 16 }}>
            {examSet.title}
          </h1>
          <p className="text-secondary" style={{ maxWidth: 540, margin: "0 auto 8px" }}>{introSummary}</p>
          <p className="text-secondary" style={{ maxWidth: 540, margin: "0 auto 30px" }}>
            問題は自由に行き来できます。時間切れになると、その時点の回答状況で自動採点されます。
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              setStartedAt(Date.now());
              setPhase("exam");
            }}
          >
            <span>▶ 試験をはじめる({durationMin}分)</span>
          </button>
        </div>
      </div>
    );
  }

  // ---------- 受験画面 ----------
  if (phase === "exam") {
    return (
      <div className={`screen ${q.section === "sec" ? "cat-sec" : "cat-algo"}`} key={current}>
        <div className="top-bar">
          <button className="btn btn-ghost" onClick={onExit}>◄ 中断する</button>
          <ExamTimer totalSec={DURATION_SEC} onExpire={() => finish(true)} />
        </div>

        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 12, gap: 10, flexWrap: "wrap",
          }}
        >
          <span className="tag-en" style={{ color: "var(--text-tertiary)" }}>
            answered {answeredCount} / {questions.length}
          </span>
          <span className={`badge ${q.section === "sec" ? "danger" : "accent"}`}>
            {q.section === "sec" ? "情報セキュリティ" : "アルゴリズム・プログラミング"}
          </span>
        </div>

        <QuestionPalette questions={questions} current={current} answers={answers} onJump={setCurrent} />

        <div className="card" style={{ padding: "28px 26px" }}>
          <span className="sign-rig" aria-hidden="true"><i /><i /></span>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
            <span className="badge accent">第 {q.no} 問</span>
            <span className="badge">{q.categoryLabel}</span>
          </div>

          {q.scenario && (
            <div className="scenario-box">
              {q.scenario.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          {q.description?.length > 0 && (
            <div style={{ marginBottom: 14, lineHeight: 1.9 }}>
              {q.description.map((p, i) => (
                <p key={i} style={{ marginBottom: 6 }}>{p}</p>
              ))}
            </div>
          )}

          <p style={{ fontFamily: "var(--font-pixel)", marginBottom: 16, fontSize: "1.08rem", lineHeight: 1.7 }}>
            {q.lead}
          </p>

          <CodeBlock code={q.code} />

          <div className="choice-list" style={{ marginTop: q.code ? 20 : 4 }}>
            {shuffledChoiceOrder(q).map((orig, i) => (
              <button
                key={orig}
                className={`choice ${answers[q.no] === orig ? "selected" : ""}`}
                onClick={() => setAnswers((a) => ({ ...a, [q.no]: orig }))}
              >
                <span className="choice-key">{"アイウエ"[i]}</span>
                <span>{q.choices[orig]}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
          <button className="btn btn-secondary" disabled={current === 1} onClick={() => setCurrent((c) => c - 1)}>
            <span>◄ 前へ</span>
          </button>
          {current < questions.length ? (
            <button className="btn btn-primary" onClick={() => setCurrent((c) => c + 1)}>
              <span>次へ ►</span>
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={() => finish(false)} disabled={answeredCount === 0}>
              <span>採点する</span>
            </button>
          )}
        </div>
        {answeredCount === questions.length && current < questions.length && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
            <button className="btn btn-primary btn-lg" onClick={() => finish(false)}>
              <span>全問回答済み — 採点する</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ---------- 判定画面 ----------
  const wrongs = result.detail.filter((d) => !d.ok);
  const categoryLabel = { algo: "アルゴリズム・プログラミング", sec: "情報セキュリティ" };
  const passed = result.score >= 60;

  return (
    <div className={`screen ${passed ? "cat-algo" : "cat-sec"}`}>
      <div className="card" style={{ padding: "44px 32px", textAlign: "center" }}>
        <span className="sign-rig" aria-hidden="true"><i /><i /></span>
        <p style={{ fontFamily: "var(--font-pixel)", letterSpacing: "0.2em", fontSize: "0.9rem", color: "var(--magenta)", marginBottom: 12 }}>
          <span className="tag-en">result</span> 判定
        </p>
        <h2 style={{ marginBottom: 18 }}>{examSet.title}</h2>
        {result.autoByTimeout && (
          <p className="text-secondary" style={{ marginBottom: 12 }}>
            制限時間になったため、自動的に採点しました。
          </p>
        )}
        <div className="score-big" style={{ color: passed ? "var(--cyan)" : "var(--magenta)" }}>
          {result.score}
        </div>
        <p className="text-secondary" style={{ marginBottom: 4 }}>
          {result.correct} / {result.total} 問正解
        </p>
        <p style={{ fontFamily: "var(--font-pixel)", color: "var(--text-tertiary)", fontSize: "0.9rem", marginBottom: 28 }}>
          <span className="tag-en">elapsed</span> {formatElapsed(result.elapsedSec)}
        </p>

        <div
          style={{
            display: "flex", flexDirection: "column", gap: 16,
            maxWidth: 480, margin: "0 auto", textAlign: "left",
          }}
        >
          {Object.entries(result.byCategory)
            .filter(([, r]) => r.total > 0)
            .map(([sec, r]) => {
              const pct = r.total ? Math.round((r.correct / r.total) * 100) : 0;
              return (
                <div key={sec} className={sec === "sec" ? "cat-sec" : "cat-algo"}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-pixel)", fontSize: "0.95rem" }}>
                      {categoryLabel[sec]}
                    </span>
                    <span className="text-secondary" style={{ fontSize: "0.9rem" }}>
                      {r.correct}/{r.total}({pct}%)
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${pct >= 80 ? "complete" : pct < 40 ? "danger" : ""}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 34, flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-lg" onClick={onExit}>
            <span>◄ セット選択へ戻る</span>
          </button>
          {wrongs.length > 0 && (
            <button className="btn btn-secondary" onClick={() => setReviewOpen(!reviewOpen)}>
              <span>{reviewOpen ? "解説を閉じる" : `間違えた ${wrongs.length} 問の解説`}</span>
            </button>
          )}
        </div>
      </div>

      {reviewOpen && (
        <div className="fade-stagger" style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 12 }}>
          {wrongs.map((d) => {
            const wq = d.question;
            return (
              <div className={`card reveal cat-${wq.section === "sec" ? "sec" : "algo"}`} key={d.no}>
                <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                  <span className="badge accent">第 {d.no} 問</span>
                  <span className="badge">{wq.categoryLabel}</span>
                </div>
                <p style={{ fontFamily: "var(--font-pixel)", marginBottom: 10, lineHeight: 1.7 }}>{wq.lead}</p>
                <p style={{ marginBottom: 8, fontSize: "0.95rem" }}>
                  <span className="neon-cyan">正解:</span> {wq.choices[wq.answer]}
                  {d.chosen != null && (
                    <span className="text-tertiary">(あなたの回答: {wq.choices[d.chosen]})</span>
                  )}
                  {d.chosen == null && <span className="text-tertiary">(未回答)</span>}
                </p>
                <p className="text-secondary" style={{ fontSize: "0.95rem" }}>{wq.explanation}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
