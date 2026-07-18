// FE科目B模擬試験の受験画面: intro(説明) → exam(受験) → result(採点結果)
import React, { useState, useMemo, useCallback } from "react";
import CodeBlock from "./CodeBlock.jsx";
import ExamTimer from "./ExamTimer.jsx";
import QuestionPalette from "./QuestionPalette.jsx";
import { gradeExam, formatElapsed } from "../logic/grading.js";
import { saveAttempt } from "../logic/storage.js";
import { shuffledChoiceOrder } from "../logic/shuffle.js";

const DURATION_SEC = 100 * 60; // 100分

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

  const finish = useCallback(
    (autoByTimeout) => {
      const elapsedSec = startedAt
        ? Math.round((Date.now() - startedAt) / 1000)
        : 0;
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
    },
    [answers, examSet.id, questions, startedAt]
  );

  if (phase === "intro") {
    return (
      <div className="screen">
        <div className="top-bar">
          <button className="btn-ghost btn" onClick={onExit}>← セット選択へ</button>
        </div>
        <div className="card" style={{ padding: "40px 36px", textAlign: "center" }}>
          <span className="badge accent" style={{ marginBottom: 16 }}>基本情報技術者試験 科目B</span>
          <h1 style={{ marginBottom: 14 }}>{examSet.title}</h1>
          <p className="text-secondary" style={{ maxWidth: 520, margin: "0 auto 8px" }}>
            全20問(アルゴリズム・プログラミング16問 + 情報セキュリティ4問)・制限時間100分の本番仕様模試です。
          </p>
          <p className="text-secondary" style={{ maxWidth: 520, margin: "0 auto 28px" }}>
            問題は自由に行き来できます。時間切れになると、その時点の回答状況で自動採点されます。
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              setStartedAt(Date.now());
              setPhase("exam");
            }}
          >
            試験をはじめる(100分)
          </button>
        </div>
      </div>
    );
  }

  if (phase === "exam") {
    return (
      <div className="screen" key={current}>
        <div className="top-bar">
          <button className="btn-ghost btn" onClick={onExit}>← 中断する</button>
          <ExamTimer totalSec={DURATION_SEC} onExpire={() => finish(true)} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span className="text-tertiary">回答済み {answeredCount} / {questions.length}</span>
          <span className={`badge ${q.section === "sec" ? "danger" : "accent"}`}>
            {q.section === "sec" ? "情報セキュリティ" : "アルゴリズム・プログラミング"}
          </span>
        </div>

        <QuestionPalette
          questions={questions}
          current={current}
          answers={answers}
          onJump={setCurrent}
        />

        <div className="card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="badge">第 {q.no} 問</span>
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

          <p style={{ fontWeight: 650, marginBottom: 14, fontSize: "1.05rem" }}>{q.lead}</p>

          <CodeBlock code={q.code} />

          <div className="choice-list" style={{ marginTop: q.code ? 20 : 0 }}>
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

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
          <button
            className="btn btn-secondary"
            disabled={current === 1}
            onClick={() => setCurrent((c) => c - 1)}
          >
            ← 前へ
          </button>
          {current < questions.length ? (
            <button className="btn btn-primary" onClick={() => setCurrent((c) => c + 1)}>
              次へ →
            </button>
          ) : (
            <button
              className="btn btn-primary btn-lg"
              onClick={() => finish(false)}
              disabled={answeredCount === 0}
            >
              採点する
            </button>
          )}
        </div>
        {answeredCount === questions.length && current < questions.length && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
            <button className="btn btn-primary btn-lg" onClick={() => finish(false)}>
              全問回答済み — 採点する
            </button>
          </div>
        )}
      </div>
    );
  }

  // ---------- 結果画面 ----------
  const wrongs = result.detail.filter((d) => !d.ok);
  const categoryLabel = { algo: "アルゴリズム・プログラミング", sec: "情報セキュリティ" };

  return (
    <div className="screen">
      <div className="card" style={{ padding: "40px 36px", textAlign: "center" }}>
        <span className="badge accent" style={{ marginBottom: 16 }}>{examSet.title} 結果</span>
        {result.autoByTimeout && (
          <p className="text-secondary" style={{ marginBottom: 10 }}>
            制限時間になったため、自動的に採点しました。
          </p>
        )}
        <h1 style={{ fontSize: "2.6rem", marginBottom: 8 }}>{result.score} 点</h1>
        <p className="text-secondary" style={{ marginBottom: 8 }}>
          {result.correct} / {result.total} 問正解
        </p>
        <p className="text-tertiary" style={{ marginBottom: 26 }}>
          所要時間: {formatElapsed(result.elapsedSec)}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 460, margin: "0 auto", textAlign: "left" }}>
          {Object.entries(result.byCategory).map(([sec, r]) => {
            const pct = r.total ? Math.round((r.correct / r.total) * 100) : 0;
            return (
              <div key={sec}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontWeight: 650, fontSize: "0.95rem" }}>{categoryLabel[sec]}</span>
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

        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 30, flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-lg" onClick={onExit}>
            セット選択へ戻る
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
            const wq = d.question;
            return (
              <div className={`card cat-${wq.section === "sec" ? "sec" : "algo"}`} key={d.no}>
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <span className="badge">第 {d.no} 問</span>
                  <span className="badge accent">{wq.categoryLabel}</span>
                </div>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>{wq.lead}</p>
                <p style={{ marginBottom: 6, fontSize: "0.95rem" }}>
                  正解: {wq.choices[wq.answer]}
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
