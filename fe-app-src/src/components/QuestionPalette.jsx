// 問題番号ジャンプパレット: 1〜20を一覧表示し、未回答/回答済み/現在を色分け
import React from "react";

export default function QuestionPalette({ questions, current, answers, onJump }) {
  return (
    <div className="q-palette">
      {questions.map((q) => {
        const isCurrent = q.no === current;
        const isAnswered = answers[q.no] != null;
        let cls = "q-palette-btn";
        if (q.section === "sec") cls += " section-sec";
        if (isAnswered && !isCurrent) cls += " answered";
        if (isCurrent) cls += " current";
        return (
          <button
            key={q.no}
            className={cls}
            onClick={() => onJump(q.no)}
            aria-label={`第${q.no}問へ移動`}
          >
            {isAnswered && !isCurrent ? "✓" : q.no}
          </button>
        );
      })}
    </div>
  );
}
