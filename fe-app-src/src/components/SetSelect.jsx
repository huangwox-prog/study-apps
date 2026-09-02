// ホーム画面: 模試セットの選択。街の入口の看板群として構成する。
import React from "react";
import StudyGauge from "./StudyGauge.jsx";
import { useScrollReveal } from "../logic/useScrollReveal.js";

const TICKER_ITEMS = [
  "SYSTEM ONLINE",
  "科目B — ALGORITHM x SECURITY",
  "100 MIN / 20 Q",
  "NEON DRILL 電脳演習区",
  "STAY SHARP",
  "見極めろ、選べ、進め",
];

function Ticker() {
  const line = TICKER_ITEMS.join("  ///  ");
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        <span>{line}&nbsp;&nbsp;///&nbsp;&nbsp;</span>
        <span>{line}&nbsp;&nbsp;///&nbsp;&nbsp;</span>
      </div>
    </div>
  );
}

function SetButton({ set, index, results, onSelect }) {
  const r = results[set.id];
  const algoCount = set.questions.filter((q) => q.section === "algo").length;
  const secCount = set.questions.filter((q) => q.section === "sec").length;
  const duration = set.durationMin ?? 100;
  const compLabel =
    algoCount > 0 && secCount > 0
      ? `アルゴリズム${algoCount}問+セキュリティ${secCount}問`
      : secCount > 0
      ? `情報セキュリティ${secCount}問`
      : `アルゴリズム${algoCount}問`;

  return (
    <button
      className={`card card-hover reveal ${secCount > 0 && algoCount === 0 ? "cat-sec" : "cat-algo"}`}
      style={{ textAlign: "left", padding: "20px 24px" }}
      onClick={() => onSelect(set.id)}
    >
      <div className="set-row">
        <span className="set-no">{String(index + 1).padStart(2, "0")}</span>
        <span className="set-row-body">
          <span
            className="glitch"
            data-text={set.title}
            style={{ fontFamily: "var(--font-pixel)", fontSize: "1.1rem", display: "block", letterSpacing: "0.03em" }}
          >
            {set.title}
          </span>
          <span className="text-tertiary" style={{ fontSize: "0.85rem" }}>
            全{set.questions.length}問・{duration}分・{compLabel}
          </span>
        </span>
        {r ? (
          <span className={`badge ${r.best >= 80 ? "ok" : "accent"}`}>
            <span>BEST {r.best} / {r.attempts.length}回</span>
          </span>
        ) : (
          <span className="badge"><span>未受験</span></span>
        )}
      </div>
    </button>
  );
}

export default function SetSelect({ sets, results, onSelect }) {
  const fullSets = sets.filter((s) => s.kind !== "security-drill");
  const drillSets = sets.filter((s) => s.kind === "security-drill");

  useScrollReveal([sets, results]);

  return (
    <div className="screen">
      <Ticker />

      <header style={{ marginBottom: 30 }}>
        <div className="brand">
          <span className="brand-mark">FE</span>
          <span>
            <span className="brand-name neon-cyan flicker">NEON DRILL</span>
            <span className="brand-sub">電脳演習区</span>
          </span>
        </div>
        <p style={{ fontFamily: "var(--font-pixel)", letterSpacing: "0.22em", fontSize: "0.9rem", color: "var(--magenta)", marginBottom: 6 }}>
          基本情報技術者試験 <span className="tag-en">kamoku B</span>
        </p>
        <h1 className="glitch neon-magenta" data-text="本番仕様 模擬試験" style={{ marginBottom: 12 }}>
          本番仕様 模擬試験
        </h1>
        <p className="text-secondary">
          1セット20問・制限時間100分。アルゴリズム・プログラミング16問(問1〜16は易→難)と、
          情報セキュリティ4問(問17〜20は難→易、長文シナリオ形式)で構成されています。
        </p>
      </header>

      <div className="reveal">
        <StudyGauge />
      </div>

      <div className="divider" />

      <div className="fade-stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {fullSets.map((set, i) => (
          <SetButton key={set.id} set={set} index={i} results={results} onSelect={onSelect} />
        ))}
      </div>

      {drillSets.length > 0 && (
        <div style={{ marginTop: 52 }} className="cat-sec">
          <div className="divider" />
          <h2 className="glitch neon-magenta" data-text="セキュリティ特訓(高難度)" style={{ marginBottom: 8 }}>
            セキュリティ特訓(高難度)
          </h2>
          <p className="text-secondary" style={{ marginBottom: 20 }}>
            1セット4問・制限時間25分。長文シナリオ形式の情報セキュリティ問題のみで構成された高難度演習です。
            本番仕様模擬試験のセキュリティ問題より難易度を高く設定しており、選択肢の見極めに時間がかかります。
          </p>
          <div className="fade-stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {drillSets.map((set, i) => (
              <SetButton key={set.id} set={set} index={i} results={results} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
