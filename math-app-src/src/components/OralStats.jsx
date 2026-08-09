// 口頭試問ドリルの分野別正答率(正答率の低い順)
// 正解 / 計算間違い / 方針間違い の内訳も並べる。方針間違いが多い分野が本当の弱点。
import React, { useState } from "react";
import { FIELDS } from "../data/oral/index.js";
import { loadOralStats, resetOralStats, summarizeOral } from "../logic/oralStorage.js";

export default function OralStats({ onStart }) {
  const [stats, setStats] = useState(loadOralStats);
  const [confirmReset, setConfirmReset] = useState(false);
  const { rows, total } = summarizeOral(stats, FIELDS);

  const doReset = () => {
    setStats(resetOralStats());
    setConfirmReset(false);
  };

  return (
    <div className="card oral-stats">
      <div className="oral-stats-head">
        <h3>分野別の正答率</h3>
        {total.rate === null ? (
          <span className="badge">未着手</span>
        ) : (
          <span className="badge accent">
            全体 {total.rate}%({total.correct}/{total.answered})
          </span>
        )}
      </div>

      <ul className="oral-stats-list">
        {rows.map((r) => (
          <li key={r.id} className="oral-stat-row">
            <span className="oral-stat-name">{r.label}</span>
            {r.rate === null ? (
              <span className="oral-stat-empty text-tertiary">未着手</span>
            ) : (
              <>
                <span className="oral-stat-bar">
                  <span
                    className="oral-stat-bar-fill"
                    style={{ width: `${r.rate}%` }}
                  />
                </span>
                <span className="oral-stat-rate">{r.rate}%</span>
                <span className="oral-stat-breakdown text-tertiary">
                  {r.answered}問 / 正解 {r.correct}・計算 {r.calc}・
                  <span className={r.plan > 0 ? "oral-stat-plan" : ""}>方針 {r.plan}</span>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="oral-stats-foot">
        {onStart && (
          <button className="btn btn-secondary" onClick={onStart}>
            ドリルを始める
          </button>
        )}
        {confirmReset ? (
          <span className="oral-reset-confirm">
            <span className="text-secondary">記録を全部消す?</span>
            <button className="btn btn-secondary oral-reset-yes" onClick={doReset}>
              消す
            </button>
            <button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
              やめる
            </button>
          </span>
        ) : (
          <button className="btn btn-ghost" onClick={() => setConfirmReset(true)}>
            記録をリセット
          </button>
        )}
      </div>
    </div>
  );
}
