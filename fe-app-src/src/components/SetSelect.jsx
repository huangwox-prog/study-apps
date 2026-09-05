// ホーム画面 = 電脳演習区の入口。
// 数学Iアプリと同じ骨格(固定ナビ → ヒーロー → 節 → カード → フッター)で組み、
// 見た目だけをネオンの意匠に置き換えている。各節はスクロールで点灯する。
import React, { useEffect, useMemo, useRef, useState } from "react";
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

// 画面に入ったら 0 から伸びるカウンタ。数字が「立ち上がる」ことで電源が入った感を出す。
function useCountUp(target, duration = 900) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined" || !ref.current) {
      setValue(target);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || done.current) return;
          done.current = true;
          const start = performance.now();
          const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            setValue(Math.round(target * eased));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        });
      },
      { threshold: 0.4 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [target, duration]);

  return [value, ref];
}

function Stat({ value, label, suffix = "" }) {
  const [shown, ref] = useCountUp(value);
  return (
    <span className="fe-stat" ref={ref}>
      <span className="fe-stat-value digits">
        {shown}
        {suffix}
      </span>
      <span className="fe-stat-label tag-en">{label}</span>
    </span>
  );
}

function SetCard({ set, index, results, onSelect }) {
  const r = results[set.id];
  const algoCount = set.questions.filter((q) => q.section === "algo").length;
  const secCount = set.questions.filter((q) => q.section === "sec").length;
  const duration = set.durationMin ?? 100;
  const isSec = secCount > 0 && algoCount === 0;
  const best = r?.best ?? 0;

  return (
    <button
      className={`card card-hover fe-set reveal ${isSec ? "cat-sec" : "cat-algo"}`}
      style={{ "--reveal-delay": `${Math.min(index, 6) * 0.05}s` }}
      onClick={() => onSelect(set.id)}
    >
      <span className="fe-set-head">
        <span className="fe-set-no digits">{String(index + 1).padStart(2, "0")}</span>
        <span className="fe-set-title glitch" data-text={set.title}>
          {set.title}
        </span>
        {r ? (
          <span className={`badge ${best >= 80 ? "ok" : "accent"}`}>
            <span>BEST {best}</span>
          </span>
        ) : (
          <span className="badge">
            <span>未受験</span>
          </span>
        )}
      </span>

      <span className="fe-set-chips">
        {algoCount > 0 && <span className="fe-chip">アルゴリズム {algoCount}問</span>}
        {secCount > 0 && <span className="fe-chip fe-chip-sec">セキュリティ {secCount}問</span>}
        <span className="fe-chip fe-chip-quiet">{duration}分</span>
      </span>

      <span className="fe-set-foot">
        <span className="fe-set-bar">
          <span className="progress-track">
            <span
              className={`progress-fill ${best >= 80 ? "complete" : ""}`}
              style={{ width: `${best}%`, display: "block", height: "100%" }}
            />
          </span>
          <span className="fe-set-meta text-tertiary">
            {r ? `${r.attempts.length}回受験 / BEST ${best}点` : "記録なし"}
          </span>
        </span>
        <span className="fe-set-go tag-en">START ▶</span>
      </span>
    </button>
  );
}

export default function SetSelect({ sets, results, onSelect }) {
  const fullSets = useMemo(() => sets.filter((s) => s.kind !== "security-drill"), [sets]);
  const drillSets = useMemo(() => sets.filter((s) => s.kind === "security-drill"), [sets]);
  const totalQuestions = useMemo(
    () => sets.reduce((sum, s) => sum + s.questions.length, 0),
    [sets]
  );
  // まだ手をつけていない最初のセット。ヒーローの主導線にする。
  const nextSet = useMemo(
    () => fullSets.find((s) => !results[s.id]) ?? fullSets[0],
    [fullSets, results]
  );
  const attempted = useMemo(
    () => sets.filter((s) => results[s.id]).length,
    [sets, results]
  );

  useScrollReveal([sets, results]);

  return (
    <div className="fe-page">
      {/* ---------- 固定ナビ ---------- */}
      <nav className="fe-nav">
        <span className="brand">
          <span className="brand-mark">FE</span>
          <span>
            <span className="brand-name neon-cyan">NEON DRILL</span>
            <span className="brand-sub">電脳演習区</span>
          </span>
        </span>
        <div className="fe-nav-links">
          <a className="fe-nav-link" href="#mock">模擬試験</a>
          <a className="fe-nav-link" href="#drill">特訓</a>
          <a className="fe-nav-link" href="#log">記録</a>
          <button className="btn btn-primary fe-nav-cta" onClick={() => onSelect(nextSet.id)}>
            <span>開始</span>
          </button>
        </div>
      </nav>

      {/* ---------- ヒーロー ---------- */}
      <header className="fe-hero">
        <Ticker />
        <div className="fe-hero-copy">
          <p className="tag-en fe-kicker">基本情報技術者試験 / KAMOKU B</p>
          <h1 className="fe-display glitch neon-magenta" data-text="本番の100分を、何度でも。">
            本番の100分を、<br />何度でも。
          </h1>
          <p className="text-secondary fe-lede">
            1セット20問・制限時間100分。アルゴリズム16問(易→難)と情報セキュリティ4問
            (長文シナリオ)の本番仕様を{fullSets.length}セット、加えて高難度のセキュリティ特訓を
            {drillSets.length}セット収録しています。
          </p>
          <div className="fe-hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => onSelect(nextSet.id)}>
              <span>{results[nextSet.id] ? "もう一度 " : ""}{nextSet.title} を開く</span>
            </button>
            <a className="btn btn-secondary btn-lg" href="#mock"><span>セットを選ぶ</span></a>
          </div>
        </div>

        <div className="fe-stats">
          <Stat value={sets.length} label="SETS" />
          <Stat value={totalQuestions} label="QUESTIONS" />
          <Stat value={100} label="MIN / SET" />
          <Stat value={attempted} label="CLEARED" />
        </div>

        <p className="fe-scroll tag-en">SCROLL</p>
      </header>

      {/* ---------- 本番仕様模擬試験 ---------- */}
      <section className="fe-band" id="mock">
        <div className="fe-band-inner">
          <div className="fe-section-head reveal">
            <p className="tag-en fe-kicker">MOCK EXAM / 本番仕様</p>
            <h2 className="glitch neon-cyan" data-text="本番仕様 模擬試験">本番仕様 模擬試験</h2>
            <p className="text-secondary fe-lede">
              問1〜16はアルゴリズム(易→難)、問17〜20は情報セキュリティ(難→易)。
              本番と同じ順序・同じ時間で通しで解く{fullSets.length}セット。
            </p>
          </div>
          <div className="fe-grid">
            {fullSets.map((set, i) => (
              <SetCard key={set.id} set={set} index={i} results={results} onSelect={onSelect} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- セキュリティ特訓 ---------- */}
      {drillSets.length > 0 && (
        <section className="fe-band cat-sec" id="drill">
          <div className="fe-band-inner">
            <div className="fe-section-head reveal">
              <p className="tag-en fe-kicker">DRILL / 高難度</p>
              <h2 className="glitch neon-magenta" data-text="セキュリティ特訓">セキュリティ特訓</h2>
              <p className="text-secondary fe-lede">
                1セット4問・制限時間25分。長文シナリオの情報セキュリティだけを集めた高難度演習。
                本番より選択肢の見極めに時間がかかるように作ってあります。
              </p>
            </div>
            <div className="fe-grid">
              {drillSets.map((set, i) => (
                <SetCard key={set.id} set={set} index={i} results={results} onSelect={onSelect} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- 学習記録 ---------- */}
      <section className="fe-band" id="log">
        <div className="fe-band-inner">
          <div className="fe-section-head reveal">
            <p className="tag-en fe-kicker">UPTIME / 学習記録</p>
            <h2 className="glitch neon-cyan" data-text="今日どれだけ回したか">今日どれだけ回したか</h2>
            <p className="text-secondary fe-lede">
              このアプリを開いている時間を自動で記録します。1日の目標と、直近7日の積み上げ。
            </p>
          </div>
          <div className="reveal">
            <StudyGauge />
          </div>
        </div>
      </section>

      {/* ---------- フッター ---------- */}
      <footer className="fe-foot">
        <div className="fe-foot-inner">
          <span className="brand-mark">FE</span>
          <span className="tag-en">NEON DRILL / 電脳演習区</span>
          <p className="text-tertiary">
            IPA公式サンプル問題の傾向を分析して自作した演習アプリです。公式の問題文そのものではありません。
          </p>
          <p className="text-tertiary">受験の記録は、この端末のブラウザにのみ保存されます。</p>
        </div>
      </footer>
    </div>
  );
}
