// 説明モード: 問題を見て「なぜその解き方をするのか」を自分の言葉で説明する練習
// 選択式ではなく、ポイント表示 → 3段階の自己採点で進める。
import React, { useState } from "react";
import MathText from "./MathText.jsx";

const ASSESS = [
  { key: "good", label: "説明できた", color: "var(--success)", soft: "var(--success-soft)" },
  { key: "fuzzy", label: "あやふやだった", color: "var(--warn)", soft: "var(--warn-soft)" },
  { key: "no", label: "できなかった", color: "var(--error)", soft: "var(--error-soft)" },
];

export default function ExplainMode({ unit, onExit }) {
  // 確認テストの問題を題材にする(選択肢は見せず、問題文だけ)
  const questions = unit.test;
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [tally, setTally] = useState({ good: 0, fuzzy: 0, no: 0 });
  const [finished, setFinished] = useState(false);

  const q = questions[index];
  const total = questions.length;
  // 解法のポイント: 単元解説の各セクションのポイント + この問題の解説
  const hints = unit.lesson.map((s) => s.point).filter(Boolean);

  const assess = (key) => {
    const next = { ...tally, [key]: tally[key] + 1 };
    setTally(next);
    if (index + 1 >= total) {
      setFinished(true);
    } else {
      setIndex(index + 1);
      setRevealed(false);
    }
  };

  if (finished) {
    const good = tally.good;
    return (
      <div className="screen">
        <div className="card" style={{ padding: "40px 36px", textAlign: "center" }}>
          <span className="badge accent" style={{ marginBottom: 16 }}>説明の練習 おつかれさま</span>
          <h1 style={{ marginBottom: 18 }}>
            {good} / {total} 問を自分の言葉で説明できた
          </h1>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 26, flexWrap: "wrap" }}>
            {ASSESS.map((a) => (
              <span key={a.key} className="badge" style={{ background: a.soft, color: a.color }}>
                {a.label}: {tally[a.key]}
              </span>
            ))}
          </div>
          <p className="text-secondary" style={{ maxWidth: 500, margin: "0 auto 30px" }}>
            {good >= total * 0.7
              ? "「なぜ」を説明できるのは、本当に理解できている証拠。かなり強い。"
              : "説明に詰まったところが、今いちばん伸びるポイント。解説を読み直してもう一度挑戦してみよう。"}
          </p>
          <button className="btn btn-primary btn-lg" onClick={onExit}>
            もどる
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen" key={index}>
      <div className="top-bar">
        <button className="btn-ghost btn" onClick={onExit}>← 中断する</button>
        <span className="text-tertiary">{unit.title} — 説明の練習</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <div className="progress-track" style={{ flex: 1 }}>
          <div className="progress-fill" style={{ width: `${(index / total) * 100}%` }} />
        </div>
        <span className="text-tertiary" style={{ whiteSpace: "nowrap" }}>
          {index + 1} / {total}
        </span>
      </div>

      <div className="card" style={{ padding: "30px 28px" }}>
        <span className="badge accent" style={{ marginBottom: 14 }}>この問題を見て…</span>
        <div style={{ fontSize: "1.15rem", lineHeight: 2, marginBottom: 18 }}>
          <MathText text={q.q} block />
        </div>
        <div
          style={{
            background: "var(--accent-soft)",
            borderRadius: "var(--radius-sm)",
            padding: "14px 18px",
            marginBottom: 20,
          }}
        >
          <p style={{ fontWeight: 650 }}>
            なぜその解き方をするのか、声に出して(または自分の言葉で)説明してみよう。
          </p>
          <p className="text-secondary" style={{ fontSize: "0.92rem", marginTop: 4 }}>
            「まず◯◯して、次に◯◯する。なぜなら…」の形で言えたら合格。
          </p>
        </div>

        {!revealed ? (
          <div style={{ textAlign: "center" }}>
            <button className="btn btn-primary btn-lg" onClick={() => setRevealed(true)}>
              解法のポイントを見る(答え合わせ)
            </button>
          </div>
        ) : (
          <div className="feedback ok" style={{ marginTop: 0 }}>
            <div className="feedback-title">解法のポイント</div>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              {hints.map((h, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  <MathText text={h} />
                </li>
              ))}
            </ul>
            <div className="divider" />
            <p style={{ fontWeight: 650, marginBottom: 4 }}>この問題の答えと解説</p>
            {q.type === "choice" && (
              <p style={{ marginBottom: 6 }}>
                答え: <MathText text={q.choices[q.answer]} />
              </p>
            )}
            {q.type === "input" && (
              <p style={{ marginBottom: 6 }}>
                答え: <span className="math"><MathText text={"`" + q.answer.replace(/\*/g, "") + "`"} /></span>
              </p>
            )}
            {q.type === "graph" && (
              <p style={{ marginBottom: 6 }}>
                答え: 頂点 ({q.vertex[0]}, {q.vertex[1]})、{q.dir === 1 ? "下に凸" : "上に凸"}
              </p>
            )}
            <p className="text-secondary">
              <MathText text={q.exp} />
            </p>
          </div>
        )}
      </div>

      {revealed && (
        <div style={{ marginTop: 22 }}>
          <p className="text-secondary" style={{ textAlign: "center", marginBottom: 12 }}>
            自分の説明はどうだった?
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {ASSESS.map((a) => (
              <button
                key={a.key}
                className="btn btn-secondary"
                style={{ color: a.color }}
                onClick={() => assess(a.key)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
