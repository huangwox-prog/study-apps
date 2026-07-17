// 弱点復習セット: 特定のミスタイプの問題だけを集めて解き直す
import React, { useMemo, useState } from "react";
import Quiz from "./Quiz.jsx";
import { questionsForQids } from "../logic/weakness.js";
import { clearMistake } from "../logic/storage.js";

export default function ReviewMode({ label, qids, units, onExit }) {
  const questions = useMemo(() => questionsForQids(units, qids), [units, qids]);
  const [phase, setPhase] = useState("intro"); // intro | quiz | done
  const [tally, setTally] = useState(null);

  const finish = (results) => {
    // 解き直して正解できた問題は弱点リストから卒業
    for (const r of results) {
      if (r.correct) clearMistake(r.qid);
    }
    const correct = results.filter((r) => r.correct).length;
    setTally({ correct, total: results.length });
    setPhase("done");
  };

  if (phase === "quiz") {
    return (
      <Quiz
        questions={questions}
        mode="practice"
        title={`弱点復習 — ${label}`}
        onFinish={finish}
        onExit={onExit}
      />
    );
  }

  if (phase === "done") {
    return (
      <div className="screen">
        <div className="card" style={{ padding: "40px 36px", textAlign: "center" }}>
          <span className="badge ok" style={{ marginBottom: 16 }}>弱点復習おつかれさま</span>
          <h1 style={{ marginBottom: 14 }}>
            {tally.correct} / {tally.total} 問クリア
          </h1>
          <p className="text-secondary" style={{ maxWidth: 500, margin: "0 auto 30px" }}>
            正解できた問題は弱点リストから外れたよ。
            {tally.correct < tally.total && "残った問題は、また時間をおいて挑戦しよう。"}
          </p>
          <button className="btn btn-primary btn-lg" onClick={onExit}>
            ホームへ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="btn-ghost btn" onClick={onExit}>← ホームへ</button>
      </div>
      <div className="card" style={{ padding: "40px 36px", textAlign: "center" }}>
        <span className="badge accent" style={{ marginBottom: 16 }}>弱点復習</span>
        <h1 style={{ marginBottom: 14 }}>「{label}」の問題を解き直す</h1>
        <p className="text-secondary" style={{ maxWidth: 500, margin: "0 auto 28px" }}>
          これまでに「{label}」で間違えた {questions.length} 問を集めたよ。
          正解できた問題は弱点リストから消えていく。
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => setPhase("quiz")}>
          復習をはじめる
        </button>
      </div>
    </div>
  );
}
