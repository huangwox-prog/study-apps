// 問題演習ランナー(演習モード=即時フィードバック / テストモード=最後に採点)
// 問題番号パレットで任意の問題にジャンプできる。
import React, { useState } from "react";
import MathText from "./MathText.jsx";
import MathPad from "./MathPad.jsx";
import GraphPlotter from "./GraphPlotter.jsx";
import { gradeQuestion } from "../logic/grading.js";
import { shuffledChoiceOrder } from "../logic/shuffle.js";

const PRAISE = [
  "正解。いい調子。",
  "正解。確実に力がついてる。",
  "その通り。よく見えてる。",
  "正解。この感覚を覚えておこう。",
];
const ENCOURAGE = "おしい。ここで確認しておこう。";

const LEVEL_LABELS = { 1: "基礎", 2: "標準", 3: "章末レベル" };

const emptyAnswer = (q) =>
  q.type === "graph" ? { vertex: null, dir: 1 } : q.type === "input" ? "" : null;

const isAnswered = (q, answer) => {
  if (q.type === "choice") return answer !== null;
  if (q.type === "input") return typeof answer === "string" && answer.trim().length > 0;
  if (q.type === "graph") return answer?.vertex != null;
  return false;
};

export default function Quiz({
  questions,
  mode = "practice", // "practice" | "test"
  title,
  onFinish,
  onExit,
}) {
  const [index, setIndex] = useState(0);
  // 問題ごとの回答と採点結果を保持(ジャンプしても状態が消えない)
  const [entries, setEntries] = useState(() =>
    questions.map((q) => ({ answer: emptyAnswer(q), feedback: null }))
  );

  const q = questions[index];
  const entry = entries[index];
  const isPractice = mode === "practice";
  const total = questions.length;

  const setAnswer = (answer) => {
    setEntries((es) => es.map((e, i) => (i === index ? { ...e, answer } : e)));
  };

  const answered = (i) =>
    isPractice ? entries[i].feedback !== null : isAnswered(questions[i], entries[i].answer);
  const answeredCount = entries.reduce((n, _, i) => n + (answered(i) ? 1 : 0), 0);
  const allDone = answeredCount === total;

  const buildResults = (es) =>
    questions.map((question, i) => {
      const fb = es[i].feedback ?? gradeQuestion(question, es[i].answer);
      return { qid: question.id, correct: fb.correct, chosen: es[i].answer, question };
    });

  // 演習モード: この問題を採点してフィードバック表示
  const submitCurrent = () => {
    const result = gradeQuestion(q, entry.answer);
    setEntries((es) =>
      es.map((e, i) => (i === index ? { ...e, feedback: result } : e))
    );
  };

  // テストモード: 全問まとめて採点して終了
  const finishTest = () => {
    onFinish(buildResults(entries));
  };

  // 次の未回答問題へ(なければ次へ、末尾なら留まる)
  const goNext = () => {
    for (let step = 1; step <= total; step++) {
      const i = (index + step) % total;
      if (!answered(i)) {
        setIndex(i);
        return;
      }
    }
    if (index + 1 < total) setIndex(index + 1);
  };

  const praise = PRAISE[index % PRAISE.length];
  const feedback = isPractice ? entry.feedback : null;

  const canSubmit = isAnswered(q, entry.answer);

  return (
    <div className="screen" key={index}>
      <div className="top-bar">
        <button className="btn-ghost btn" onClick={onExit}>← 中断する</button>
        <span className="text-tertiary">{title}</span>
      </div>

      {/* 進捗 */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <div className="progress-track" style={{ flex: 1 }}>
          <div
            className="progress-fill"
            style={{ width: `${(answeredCount / total) * 100}%` }}
          />
        </div>
        <span className="text-tertiary" style={{ whiteSpace: "nowrap" }}>
          {index + 1} / {total}
        </span>
      </div>

      {/* 問題番号パレット: タップでジャンプ。未回答/回答済み/現在を色分け */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 22 }}>
        {questions.map((_, i) => {
          const isCurrent = i === index;
          const isDone = answered(i);
          return (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`第${i + 1}問へ移動`}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                fontSize: "0.75rem",
                fontWeight: 650,
                border: isCurrent ? "none" : "1px solid var(--glass-border-soft)",
                background: isCurrent
                  ? "var(--accent)"
                  : isDone
                  ? "var(--accent-soft)"
                  : "var(--glass-soft)",
                color: isCurrent
                  ? "var(--accent-text)"
                  : isDone
                  ? "var(--accent)"
                  : "var(--text-tertiary)",
                transition: "all var(--dur-fast) var(--ease)",
              }}
            >
              {isDone && !isCurrent ? "✓" : i + 1}
            </button>
          );
        })}
      </div>

      <div className="card" style={{ padding: "30px 28px" }}>
        {q.level && isPractice && (
          <span className="badge accent" style={{ marginBottom: 14 }}>
            {LEVEL_LABELS[q.level] || ""}
          </span>
        )}
        <div style={{ fontSize: "1.15rem", lineHeight: 2, marginBottom: 22 }}>
          <MathText text={q.q} block />
        </div>

        {q.type === "choice" && (
          <div className="choice-list">
            {shuffledChoiceOrder(q).map((orig, i) => {
              let cls = "choice";
              if (feedback) {
                if (orig === q.answer) cls += " correct";
                else if (orig === entry.answer) cls += " wrong";
              } else if (orig === entry.answer) {
                cls += " selected";
              }
              return (
                <button
                  key={orig}
                  className={cls}
                  disabled={!!feedback}
                  onClick={() => setAnswer(orig)}
                >
                  <span className="choice-key">{"ABCD"[i]}</span>
                  <MathText text={q.choices[orig]} />
                </button>
              );
            })}
          </div>
        )}

        {q.type === "input" && (
          <MathPad value={entry.answer} onChange={setAnswer} disabled={!!feedback} />
        )}

        {q.type === "graph" && (
          <GraphPlotter
            value={entry.answer}
            onChange={setAnswer}
            disabled={!!feedback}
            showTarget={feedback && !feedback.correct ? { vertex: q.vertex, dir: q.dir } : null}
          />
        )}

        {/* フィードバック(演習モードのみ) */}
        {feedback && (
          <div className={`feedback ${feedback.correct ? "ok" : "ng"}`}>
            <div className="feedback-title">
              {feedback.correct ? "○ " + praise : "△ " + ENCOURAGE}
            </div>
            {!feedback.correct && (
              <>
                {feedback.message && (
                  <p style={{ marginBottom: 8 }}>{feedback.message}</p>
                )}
                {q.type === "input" && (
                  <p style={{ marginBottom: 8 }}>
                    答えの例:{" "}
                    <span className="math">
                      <MathText text={"`" + q.answer.replace(/\*/g, "") + "`"} />
                    </span>
                  </p>
                )}
                <MathText text={q.exp} block />
              </>
            )}
            {feedback.correct && q.expOk && (
              <MathText text={q.expOk} block />
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 22 }}>
        <button
          className="btn btn-secondary"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          ← 前へ
        </button>
        <div style={{ display: "flex", gap: 12 }}>
          {isPractice ? (
            feedback ? (
              allDone ? (
                <button className="btn btn-primary btn-lg" onClick={() => onFinish(buildResults(entries))}>
                  結果を見る
                </button>
              ) : (
                <button className="btn btn-primary btn-lg" onClick={goNext}>
                  次の問題へ →
                </button>
              )
            ) : (
              <button className="btn btn-primary btn-lg" disabled={!canSubmit} onClick={submitCurrent}>
                答え合わせ
              </button>
            )
          ) : allDone ? (
            <button className="btn btn-primary btn-lg" onClick={finishTest}>
              採点する
            </button>
          ) : (
            <button className="btn btn-primary" onClick={goNext}>
              {canSubmit ? "回答して次へ →" : "あとで解く(次へ)→"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
