// 問題演習ランナー(演習モード=即時フィードバック / テストモード=最後に採点)
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

export default function Quiz({
  questions,
  mode = "practice", // "practice" | "test"
  title,
  onFinish,
  onExit,
}) {
  const [index, setIndex] = useState(0);
  const [choiceSel, setChoiceSel] = useState(null);
  const [inputVal, setInputVal] = useState("");
  const [graphVal, setGraphVal] = useState({ vertex: null, dir: 1 });
  const [feedback, setFeedback] = useState(null); // {correct, message}
  const [results, setResults] = useState([]);

  const q = questions[index];
  const isPractice = mode === "practice";
  const total = questions.length;

  const currentAnswer = () => {
    if (q.type === "choice") return choiceSel;
    if (q.type === "input") return inputVal;
    if (q.type === "graph") return graphVal;
    return null;
  };

  const canSubmit = () => {
    if (q.type === "choice") return choiceSel !== null;
    if (q.type === "input") return inputVal.trim().length > 0;
    if (q.type === "graph") return graphVal.vertex !== null;
    return false;
  };

  const submit = () => {
    const answer = currentAnswer();
    const result = gradeQuestion(q, answer);
    const record = { qid: q.id, correct: result.correct, chosen: answer, question: q };
    if (isPractice) {
      setFeedback({
        correct: result.correct,
        message: result.message,
      });
      setResults((r) => [...r, record]);
    } else {
      advance([...results, record]);
    }
  };

  const advance = (newResults) => {
    const rs = newResults ?? results;
    if (index + 1 >= total) {
      onFinish(rs);
      return;
    }
    setIndex(index + 1);
    setChoiceSel(null);
    setInputVal("");
    setGraphVal({ vertex: null, dir: 1 });
    setFeedback(null);
    if (newResults) setResults(rs);
  };

  const praise = PRAISE[index % PRAISE.length];

  return (
    <div className="screen" key={index}>
      <div className="top-bar">
        <button className="btn-ghost btn" onClick={onExit}>← 中断する</button>
        <span className="text-tertiary">{title}</span>
      </div>

      {/* 進捗 */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
        <div className="progress-track" style={{ flex: 1 }}>
          <div
            className="progress-fill"
            style={{ width: `${((index + (feedback ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
        <span className="text-tertiary" style={{ whiteSpace: "nowrap" }}>
          {index + 1} / {total}
        </span>
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
                else if (orig === choiceSel) cls += " wrong";
              } else if (orig === choiceSel) {
                cls += " selected";
              }
              return (
                <button
                  key={orig}
                  className={cls}
                  disabled={!!feedback}
                  onClick={() => setChoiceSel(orig)}
                >
                  <span className="choice-key">{"ABCD"[i]}</span>
                  <MathText text={q.choices[orig]} />
                </button>
              );
            })}
          </div>
        )}

        {q.type === "input" && (
          <MathPad value={inputVal} onChange={setInputVal} disabled={!!feedback} />
        )}

        {q.type === "graph" && (
          <GraphPlotter
            value={graphVal}
            onChange={setGraphVal}
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

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
        {feedback ? (
          <button className="btn btn-primary btn-lg" onClick={() => advance()}>
            {index + 1 >= total ? "結果を見る" : "次の問題へ →"}
          </button>
        ) : (
          <button
            className="btn btn-primary btn-lg"
            disabled={!canSubmit()}
            onClick={submit}
          >
            {isPractice ? "答え合わせ" : index + 1 >= total ? "回答して終了" : "回答して次へ"}
          </button>
        )}
      </div>
    </div>
  );
}
