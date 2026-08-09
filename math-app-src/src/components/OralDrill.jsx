// 口頭試問対策の分類ドリル
//
// 解かないドリルではなく、実際に解いて答えを出すアプリ。1画面1問。
// 答えを見る前は分類も第一手も見せない(先に自分で言えるようにするため)。
// 採点は自己申告。正解 / 計算間違い / 方針間違い を分けて記録する。
import React, { useCallback, useMemo, useState } from "react";
import TexText from "./Tex.jsx";
import OralStats from "./OralStats.jsx";
import { ORAL_PROBLEMS, FIELDS, FIELD_LABEL } from "../data/oral/index.js";
import { RESULT_KINDS, recordOralResult, undoOralResult } from "../logic/oralStorage.js";

const COUNT_OPTIONS = [
  { id: 10, label: "10問" },
  { id: 20, label: "20問" },
  { id: "all", label: "全問" },
];

const STUCK_STEPS = [
  "問題文を声に出して読み直し、与えられているものと求めるものを言い直す。",
  "分からなさを具体的に言う。",
  "具体的な数字を入れるか、グラフを描く(宣言してから手を動かす)。",
  "それでも動かなければヒントを求める。黙るのが一番まずい。",
];

function shuffled(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function OralDrill({ onExit }) {
  const [phase, setPhase] = useState("setup");
  const [selected, setSelected] = useState(() => new Set(FIELDS.map((f) => f.id)));
  const [includeAdvanced, setIncludeAdvanced] = useState(true);
  const [order, setOrder] = useState("sequential");
  const [count, setCount] = useState(10);

  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  // 1タップで次に進まず、いったん確認表示を挟む(押し間違いの取り消し用)
  const [pending, setPending] = useState(null);
  const [tally, setTally] = useState({ correct: 0, calc: 0, plan: 0 });

  const pool = useMemo(
    () =>
      ORAL_PROBLEMS.filter(
        (p) => selected.has(p.field) && (includeAdvanced || !p.advanced)
      ),
    [selected, includeAdvanced]
  );

  const toggleField = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const start = () => {
    const base = order === "shuffle" ? shuffled(pool) : pool;
    const n = count === "all" ? base.length : Math.min(count, base.length);
    setQueue(base.slice(0, n));
    setIndex(0);
    setRevealed(false);
    setPending(null);
    setTally({ correct: 0, calc: 0, plan: 0 });
    setPhase("run");
  };

  const problem = queue[index];

  const grade = useCallback(
    (kind) => {
      if (!problem || pending) return;
      recordOralResult(problem.field, kind);
      setTally((t) => ({ ...t, [kind]: t[kind] + 1 }));
      setPending(kind);
    },
    [problem, pending]
  );

  const undo = useCallback(() => {
    if (!problem || !pending) return;
    undoOralResult(problem.field, pending);
    setTally((t) => ({ ...t, [pending]: Math.max(0, t[pending] - 1) }));
    setPending(null);
  }, [problem, pending]);

  const next = useCallback(() => {
    setPending(null);
    setRevealed(false);
    if (index + 1 >= queue.length) setPhase("done");
    else setIndex((i) => i + 1);
  }, [index, queue.length]);

  // ---------- 設定画面 ----------
  if (phase === "setup") {
    const advancedInPool = ORAL_PROBLEMS.filter(
      (p) => p.advanced && selected.has(p.field)
    ).length;
    return (
      <div className="screen">
        <div className="top-bar">
          <button className="btn btn-ghost" onClick={onExit}>
            ← ホーム
          </button>
          <span className="badge">{pool.length}問が対象</span>
        </div>

        <h1 style={{ marginBottom: 6 }}>口頭試問ドリル</h1>
        <p className="text-secondary" style={{ marginBottom: 26 }}>
          「これは何の問題か」「最初の一手は何か」を先に言ってから解く練習。
        </p>

        <section className="card" style={{ marginBottom: 18 }}>
          <div className="oral-setup-head">
            <h3>出題する分野</h3>
            <span className="oral-setup-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setSelected(new Set(FIELDS.map((f) => f.id)))}
              >
                全選択
              </button>
              <button className="btn btn-ghost" onClick={() => setSelected(new Set())}>
                全解除
              </button>
            </span>
          </div>
          <div className="oral-field-grid">
            {FIELDS.map((f) => (
              <label key={f.id} className="oral-check">
                <input
                  type="checkbox"
                  checked={selected.has(f.id)}
                  onChange={() => toggleField(f.id)}
                />
                <span className="oral-check-label">{f.label}</span>
                <span className="text-tertiary oral-check-count">{f.count}</span>
              </label>
            ))}
          </div>

          <div className="divider" />

          <label className="oral-check oral-check-wide">
            <input
              type="checkbox"
              checked={includeAdvanced}
              onChange={() => setIncludeAdvanced((v) => !v)}
            />
            <span className="oral-check-label">
              応用問題(場合分け・三角比の対称式)も出す
            </span>
            <span className="text-tertiary oral-check-count">{advancedInPool}</span>
          </label>
        </section>

        <section className="card" style={{ marginBottom: 18 }}>
          <h3 style={{ marginBottom: 12 }}>出題順</h3>
          <div className="oral-segment">
            {[
              { id: "sequential", label: "順番" },
              { id: "shuffle", label: "シャッフル" },
            ].map((o) => (
              <button
                key={o.id}
                className={`oral-segment-btn ${order === o.id ? "on" : ""}`}
                onClick={() => setOrder(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>

          <h3 style={{ margin: "18px 0 12px" }}>問題数</h3>
          <div className="oral-segment">
            {COUNT_OPTIONS.map((c) => (
              <button
                key={c.id}
                className={`oral-segment-btn ${count === c.id ? "on" : ""}`}
                onClick={() => setCount(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: "100%", marginBottom: 26 }}
          onClick={start}
          disabled={pool.length === 0}
        >
          {pool.length === 0
            ? "分野を1つ以上選んでください"
            : `始める(${count === "all" ? pool.length : Math.min(count, pool.length)}問)`}
        </button>

        <OralStats />
        <StuckPanel />
      </div>
    );
  }

  // ---------- 終了画面 ----------
  if (phase === "done") {
    const answered = tally.correct + tally.calc + tally.plan;
    const rate = answered === 0 ? 0 : Math.round((tally.correct / answered) * 100);
    return (
      <div className="screen">
        <div className="top-bar">
          <button className="btn btn-ghost" onClick={onExit}>
            ← ホーム
          </button>
        </div>
        <h1 style={{ marginBottom: 18 }}>おつかれさま</h1>
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="oral-done-rate">{rate}%</div>
          <p className="text-secondary" style={{ marginBottom: 14 }}>
            {answered}問中 {tally.correct}問 正解
          </p>
          <ul className="oral-done-list">
            <li>
              <span>正解</span>
              <strong>{tally.correct}</strong>
            </li>
            <li>
              <span>計算間違い</span>
              <strong>{tally.calc}</strong>
            </li>
            <li>
              <span>方針間違い</span>
              <strong className={tally.plan > 0 ? "oral-stat-plan" : ""}>{tally.plan}</strong>
            </li>
          </ul>
          {tally.plan > 0 && (
            <p className="text-secondary" style={{ marginTop: 14 }}>
              方針間違いが {tally.plan} 問。第一手を口に出す練習をもう一周しよう。
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 26 }}>
          <button className="btn btn-primary" onClick={() => setPhase("setup")}>
            もう一度
          </button>
          <button className="btn btn-secondary" onClick={onExit}>
            ホームへ
          </button>
        </div>
        <OralStats />
      </div>
    );
  }

  // ---------- 出題画面 ----------
  const pendingLabel = RESULT_KINDS.find((k) => k.id === pending)?.label;

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="btn btn-ghost" onClick={() => setPhase("setup")}>
          ← 設定に戻る
        </button>
        <span className="badge">
          {index + 1} / {queue.length}
        </span>
      </div>

      <div className="progress-track" style={{ marginBottom: 22 }}>
        <div
          className="progress-fill"
          style={{ width: `${((index + (revealed ? 1 : 0)) / queue.length) * 100}%` }}
        />
      </div>

      {/* 口頭試問対策なので、ここが本体 */}
      <p className="oral-mantra">
        これは何の問題か、最初の一手は何か、を声に出してから解く
      </p>

      <div className="card oral-question">
        <span className="badge">{FIELD_LABEL[problem.field]}</span>
        <TexText as="div" className="oral-question-text" text={problem.q} />
      </div>

      {!revealed ? (
        <button
          className="btn btn-primary btn-lg oral-reveal"
          onClick={() => setRevealed(true)}
        >
          答えを見る
        </button>
      ) : (
        <>
          <div className="card oral-answer">
            <div className="oral-answer-block">
              <span className="oral-answer-label">分類</span>
              <TexText as="div" className="oral-answer-body" text={problem.category} />
            </div>
            <div className="oral-answer-block">
              <span className="oral-answer-label">第一手</span>
              <TexText as="div" className="oral-answer-body" text={problem.firstMove} />
            </div>
            <div className="oral-answer-block">
              <span className="oral-answer-label">解答</span>
              <TexText as="div" className="oral-answer-body oral-answer-main" text={problem.a} />
            </div>
            <div className="oral-answer-block">
              <span className="oral-answer-label">解説</span>
              <div className="oral-answer-body">
                {problem.solution.map((line, i) => (
                  <TexText key={i} as="div" className="oral-solution-line" text={line} />
                ))}
              </div>
            </div>
          </div>

          {pending ? (
            <div className="oral-recorded">
              <span className="oral-recorded-text">
                「{pendingLabel}」で記録しました
              </span>
              <div className="oral-recorded-actions">
                <button className="btn btn-ghost" onClick={undo}>
                  取り消す
                </button>
                <button className="btn btn-primary" onClick={next}>
                  {index + 1 >= queue.length ? "結果を見る" : "次の問題へ"}
                </button>
              </div>
            </div>
          ) : (
            <div className="oral-grade">
              <p className="text-secondary oral-grade-hint">
                自己採点。方針が合っていて計算だけ落としたのか、第一手から違ったのかを分ける。
              </p>
              {RESULT_KINDS.map((k) => (
                <button
                  key={k.id}
                  className={`oral-grade-btn tone-${k.tone}`}
                  onClick={() => grade(k.id)}
                >
                  {k.label}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <StuckPanel />
    </div>
  );
}

// 画面下の開閉パネル: 詰まったときの手順
function StuckPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="oral-stuck">
      <button
        className="oral-stuck-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>詰まったときの手順</span>
        <span className={`oral-stuck-caret ${open ? "open" : ""}`}>⌄</span>
      </button>
      {open && (
        <ol className="oral-stuck-list">
          {STUCK_STEPS.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
