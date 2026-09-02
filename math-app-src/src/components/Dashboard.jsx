// ホーム画面 = ARCA のプロダクトページ。
// 上から「ヒーロー → 口頭試問ドリル → 進捗 → 29単元 → 模擬試験」と、
// スクロールで一つずつ見せていく構成。各節はスクロールで現れ、弧が回る。
import React, { useState } from "react";
import { masteryLabel, overallProgress } from "../logic/mastery.js";
import { EXAM_SETS } from "../logic/examGenerator.js";
import { getGreeting } from "../data/greetings.js";
import { useRevealObserver, useCountUp } from "../logic/motion.js";
import { ArcMark, CategoryGlyph, ProgressArc } from "./Motif.jsx";
import FormulaField from "./FormulaField.jsx";
import WeakSpots from "./WeakSpots.jsx";
import ActivityLog from "./ActivityLog.jsx";
import ProgressRail from "./ProgressRail.jsx";
import OralStats from "./OralStats.jsx";

const CATEGORY_LABELS = { ns: "数と式", qf: "二次関数", tri: "三角比" };
// 分野名を主役にし、その下に「この先どこへ続くか」を一言で添える
const CATEGORY_COPY = {
  ns: "すべての計算は、ここから始まる。",
  qf: "微分積分は、ここから始まる。",
  tri: "三角関数は、ここから始まる。",
};
const CATEGORY_LEDE = {
  ns: "展開・因数分解から不等式・集合と命題まで。計算の土台を、手が覚えるまで。",
  qf: "平方完成・最大最小・グラフと解の配置。二次関数の全景を、頂点から見渡す。",
  tri: "定義・相互関係から正弦定理・余弦定理まで。角と辺を、ひとつの円で結ぶ。",
};

export default function Dashboard({ units, progress, mistakeSummary, onOpenUnit, onOpenExam, onOpenOral, onOpenReview }) {
  // アクセス(マウント)のたびに1回だけ選び直す。レンダーごとに変わるとチラつくので固定化する。
  const [greeting] = useState(() => getGreeting());
  const overall = overallProgress(units, progress.units);
  const completedCount = units.filter((u) => (progress.units[u.id]?.mastery ?? 0) >= 70).length;
  const categories = ["ns", "qf", "tri"];

  // 画面に入った節・カードを順に立ち上げる
  useRevealObserver([units, progress]);
  const [overallShown, overallRef] = useCountUp(overall);
  const [doneShown, doneRef] = useCountUp(completedCount, 900);

  return (
    <div className="page">
      {/* ---------- ブランドナビ ---------- */}
      <nav className="brand-nav">
        <span className="brand-lockup">
          <ArcMark />
          ARCA
          <span className="brand-lockup-sub">数学I</span>
        </span>
        <div className="brand-nav-links">
          <a className="brand-nav-link" href="#drill">口頭試問</a>
          <a className="brand-nav-link" href="#progress">進捗</a>
          <a className="brand-nav-link" href="#units">単元</a>
          <a className="brand-nav-link" href="#exam">模擬試験</a>
          <button className="btn btn-primary is-cta" style={{ padding: "7px 18px", fontSize: "0.84rem" }} onClick={onOpenOral}>
            はじめる
          </button>
        </div>
      </nav>

      {/* ---------- ヒーロー ---------- */}
      <header className="hero">
        <FormulaField onPick={() => document.getElementById("units")?.scrollIntoView({ behavior: "smooth" })} />
        <div className="hero-stage">
        <div className="hero-copy">
          <p className="kicker">ARCA 数学I ／ {greeting}</p>
          <h1 className="display">
            数学I。<br />
            <span className="aurora-text nowrap">ぜんぶ、動き出す。</span>
          </h1>
          <p className="lede">
            数と式・二次関数・三角比。{units.length}単元の演習と164問の口頭試問ドリル、
            そして卒業模擬試験までを、ひとつの弧の上に。
          </p>
          <div className="hero-actions">
            <button className="btn btn-aurora btn-lg" onClick={onOpenOral}>ドリルを始める</button>
            <a className="link-arrow" href="#units">単元を見る</a>
          </div>
        </div>

        </div>

        <div className="hero-meta">
          <span className="hero-meta-item">
            <span className="hero-meta-value">164</span>
            <span className="hero-meta-label">口頭試問</span>
          </span>
          <span className="hero-meta-item">
            <span className="hero-meta-value">{units.length}</span>
            <span className="hero-meta-label">単元</span>
          </span>
          <span className="hero-meta-item">
            <span className="hero-meta-value">3</span>
            <span className="hero-meta-label">分野</span>
          </span>
        </div>

        <p className="hero-scroll-hint">SCROLL</p>
      </header>

      <div className="arc-divider" />

      {/* ---------- 口頭試問ドリル(墨の帯) ---------- */}
      <section className="band" id="drill">
        <div className="band-inner band-ink" style={{ padding: "clamp(38px, 6vw, 76px)" }} data-reveal="scale">
          <div className="section-head band-center">
            <p className="kicker">ORAL DRILL</p>
            <h2 className="display-2">言えたら、<span className="aurora-text nowrap">解けている。</span></h2>
            <p className="lede">
              「これは何の問題か」「最初の一手は何か」を声に出す、分野別164問の分類ドリル。
              手を動かす前の3秒を鍛える。
            </p>
          </div>

          <div className="feature-grid" data-reveal>
            <button className="card card-hover feature-card drill-card" onClick={onOpenOral}>
              <span className="badge accent">164問</span>
              <h3 style={{ margin: "14px 0 6px" }}>ドリルを始める</h3>
              <p className="text-secondary" style={{ fontSize: "0.92rem" }}>
                分野・出題順・問題数を選んで開始。詰まったら手順に戻れる。
              </p>
              <ul className="arc-list">
                <li>分野を選ぶ — 14分野から、今日やる範囲だけ</li>
                <li>声に出す — 何の問題か、最初の一手は何か</li>
                <li>自己採点 — 言えた/惜しい/言えないの3段階で記録</li>
              </ul>
              <span className="link-arrow">選んで始める</span>
            </button>
            <OralStats onStart={onOpenOral} />
          </div>
        </div>
      </section>

      {/* ---------- 進捗 ---------- */}
      <section className="band" id="progress">
        <div className="band-inner">
          <div className="section-head band-center" data-reveal>
            <p className="kicker">PROGRESS</p>
            <h2 className="display-2">積み上がりが、ひと目で。</h2>
            <p className="lede">
              単元ごとの習熟度を弧で束ねる。伸びた分だけ、弧が閉じていく。
            </p>
          </div>

          <div
            className="card feature-card"
            data-reveal="scale"
            style={{
              display: "flex",
              gap: "clamp(24px, 5vw, 56px)",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <div ref={overallRef}>
              <ProgressArc
                value={overall}
                label={`${overallShown}%`}
                caption="習熟度の平均"
              />
            </div>
            <div style={{ flex: "1 1 260px", minWidth: 240 }}>
              <p className="kicker" style={{ marginBottom: 8 }}>OVERVIEW</p>
              <p style={{ fontSize: "1.05rem", marginBottom: 18 }}>
                習熟度70%以上の単元は
                <span ref={doneRef} style={{ fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-0.03em", padding: "0 6px" }}>
                  {doneShown}
                </span>
                / {units.length}。
              </p>
              {categories.map((cat) => {
                const catUnits = units.filter((u) => u.category === cat);
                const avg = Math.round(
                  catUnits.reduce((s, u) => s + (progress.units[u.id]?.mastery ?? 0), 0) / catUnits.length
                );
                return (
                  <div key={cat} className={`cat-${cat}`} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ display: "flex", alignItems: "center", fontWeight: 700, fontSize: "0.92rem" }}>
                        <span className="cat-dot" />
                        {CATEGORY_LABELS[cat]}
                      </span>
                      <span className="text-tertiary">{avg}%</span>
                    </div>
                    <div className="progress-track">
                      <div className={`progress-fill ${avg >= 70 ? "complete" : ""}`} style={{ width: `${avg}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 旧レール(進捗マップ・弱点・学習ログ)はページ内の「状況」としてここに統合 */}
          <div className="status-grid" data-reveal>
            <ProgressRail units={units} progress={progress} onOpenUnit={onOpenUnit} />
            <div className="status-col-split">
              <WeakSpots summary={mistakeSummary} onOpenReview={onOpenReview} />
              <ActivityLog log={progress.log || {}} units={units} onOpenUnit={onOpenUnit} />
            </div>
          </div>
        </div>
      </section>

      <div className="arc-divider" />

      {/* ---------- 単元 ---------- */}
      <section className="band" id="units">
        <div className="band-inner">
          <div className="section-head band-center" data-reveal>
            <p className="kicker">CHAPTERS</p>
            <h2 className="display-2">{units.length}単元。ぜんぶ、順番に。</h2>
            <p className="lede">
              診断 → 解説 → 演習 → 確認テスト。ひとつの単元は、いつも同じ弧を描いて閉じる。
            </p>
          </div>

          {categories.map((cat) => {
            const catUnits = units.filter((u) => u.category === cat);
            return (
              <section key={cat} className={`cat-${cat}`} style={{ marginBottom: "clamp(38px, 6vw, 72px)" }}>
                <div
                  data-reveal="left"
                  style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18, flexWrap: "wrap" }}
                >
                  <CategoryGlyph category={cat} size={46} />
                  <div>
                    <h3 className="cat-title">{CATEGORY_LABELS[cat]}</h3>
                    <p className="cat-tagline">{CATEGORY_COPY[cat]}</p>
                  </div>
                </div>
                <p className="text-secondary" data-reveal style={{ marginBottom: 18, maxWidth: "52ch" }}>
                  {CATEGORY_LEDE[cat]}
                </p>

                <div className="unit-list">
                  {catUnits.map((unit, i) => {
                    const p = progress.units[unit.id];
                    const mastery = p?.mastery ?? 0;
                    const started = p != null;
                    return (
                      <button
                        key={unit.id}
                        className="card card-hover unit-card"
                        data-reveal
                        style={{ "--reveal-delay": `${Math.min(i, 6) * 0.045}s` }}
                        onClick={() => onOpenUnit(unit.id)}
                      >
                        <span
                          className="unit-card-badge"
                          style={{
                            background: mastery >= 70 ? "var(--success-soft)" : "var(--accent-soft)",
                            color: mastery >= 70 ? "var(--success)" : "var(--accent)",
                          }}
                        >
                          {mastery >= 70 ? "✓" : i + 1}
                        </span>
                        <span className="unit-card-text">
                          <span className="unit-card-title">
                            {unit.title}
                            {unit.isNew && <span className="badge-new">NEW</span>}
                          </span>
                          <span className="text-tertiary unit-card-sub">
                            {p?.skippedByDiag
                              ? "診断でスキップ済み(いつでも演習できる)"
                              : started
                              ? masteryLabel(mastery)
                              : unit.subtitle}
                          </span>
                        </span>
                        <span className="unit-card-progress">
                          <span className="progress-track" style={{ flex: 1 }}>
                            <span
                              className={`progress-fill ${mastery >= 70 ? "complete" : ""}`}
                              style={{ width: `${mastery}%`, display: "block" }}
                            />
                          </span>
                          <span className="text-tertiary unit-card-percent">{mastery}%</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      {/* ---------- 模擬試験 ---------- */}
      <section className="band" id="exam">
        <div className="band-inner band-ink" style={{ padding: "clamp(38px, 6vw, 76px)" }} data-reveal="scale">
          <div className="section-head band-center">
            <p className="kicker">FINAL EXAM</p>
            <h2 className="display-2">50問100点。<span className="aurora-text nowrap">腕試し。</span></h2>
            <p className="lede">
              全範囲から出題する卒業模擬試験。単元の弧が閉じたら、最後にもう一度ぜんぶを一本の線でつなぐ。
            </p>
          </div>
          <div className="feature-grid">
            {EXAM_SETS.map((set, i) => {
              const result = progress.exams[set.id];
              return (
                <button
                  key={set.id}
                  className="card card-hover unit-card"
                  data-reveal
                  style={{ "--reveal-delay": `${i * 0.05}s` }}
                  onClick={() => onOpenExam(set.id)}
                >
                  <span className="unit-card-text">
                    <span className="unit-card-title">{set.title}</span>
                    <span className="text-tertiary unit-card-sub">全範囲から50問・100点</span>
                  </span>
                  {result ? (
                    <span className={`badge ${result.best >= 80 ? "ok" : ""}`}>ベスト {result.best} 点</span>
                  ) : (
                    <span className="badge">未受験</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- フッター ---------- */}
      <footer className="brand-foot">
        <div className="brand-foot-inner">
          <div className="brand-foot-row">
            <ArcMark size={18} />
            <span style={{ fontWeight: 700, letterSpacing: "0.14em" }}>ARCA</span>
            <span>数学I トレーナー</span>
          </div>
          <p>
            ARCA は、この学習アプリのために作った架空のブランドです。実在の企業・製品とは関係ありません。
          </p>
          <p>
            進捗と口頭試問の記録は、この端末のブラウザにのみ保存されます。
          </p>
        </div>
      </footer>
    </div>
  );
}
