// ARCA のブランドモチーフ「アーク(弧)」。
// 放物線・単位円・根号という数学Iの3分野を、ひとつの弧の家族として描き分ける。
import React from "react";

/** ロゴマーク:入れ子の弧が A を描く */
export function ArcMark({ size = 26, className = "" }) {
  return (
    <svg
      className={`arc-mark ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 27C4 14.3 9.4 5 16 5s12 9.3 12 22" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path className="arc-mark-inner" d="M10.5 27c0-8.2 2.5-13.5 5.5-13.5s5.5 5.3 5.5 13.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

/** ヒーローの主役図形。スクロール量(--scroll)で回り、ホバーで跳ねる。 */
export function HeroFigure() {
  return (
    <div className="hero-figure" aria-hidden="true">
      <div className="hero-figure-ring hero-figure-ring-a" />
      <div className="hero-figure-ring hero-figure-ring-b" />
      <div className="hero-figure-ring hero-figure-ring-c" />
      <svg className="hero-figure-svg" viewBox="0 0 420 420" fill="none">
        <defs>
          <linearGradient id="arcaGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--arc-1)" />
            <stop offset="52%" stopColor="var(--arc-2)" />
            <stop offset="100%" stopColor="var(--arc-3)" />
          </linearGradient>
        </defs>
        {/* 座標軸 */}
        <path className="hero-axis" d="M40 300h340M210 60v330" stroke="currentColor" strokeWidth="1" />
        {/* 放物線:読み込み時に描かれる */}
        <path
          className="hero-parabola"
          d="M60 92Q210 508 360 92"
          stroke="url(#arcaGrad)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* 単位円:ゆっくり回る */}
        <g className="hero-circle">
          <circle cx="210" cy="300" r="86" stroke="currentColor" strokeWidth="1.4" strokeDasharray="5 9" opacity="0.5" />
          <line className="hero-radius" x1="210" y1="300" x2="296" y2="300" stroke="var(--arc-3)" strokeWidth="3" strokeLinecap="round" />
          <circle className="hero-dot-orbit" cx="296" cy="300" r="7" fill="var(--arc-3)" />
        </g>
        {/* 頂点で跳ねる点 */}
        <circle className="hero-dot-vertex" cx="210" cy="300" r="9" fill="var(--arc-2)" />
      </svg>
    </div>
  );
}

/** 分野ごとのグリフ。カード左に置き、ホバーで回転/跳ねる。 */
export function CategoryGlyph({ category, size = 44 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    fill: "none",
    "aria-hidden": true,
    className: `cat-glyph cat-glyph-${category}`,
  };
  if (category === "ns") {
    // 根号:数と式
    return (
      <svg {...common}>
        <path d="M6 27l6 12L22 9h20" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle className="glyph-dot" cx="36" cy="30" r="4.5" fill="currentColor" />
      </svg>
    );
  }
  if (category === "tri") {
    // 単位円と角:三角比
    return (
      <svg {...common}>
        <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="2.6" opacity="0.5" />
        <path className="glyph-sweep" d="M24 24l15-6" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M24 24h17" stroke="currentColor" strokeWidth="2" opacity="0.45" />
        <circle className="glyph-dot" cx="39" cy="18" r="4" fill="currentColor" />
      </svg>
    );
  }
  // 放物線:二次関数
  return (
    <svg {...common}>
      <path d="M8 10c0 0 6 28 16 28s16-28 16-28" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      <circle className="glyph-dot" cx="24" cy="38" r="4.5" fill="currentColor" />
    </svg>
  );
}

/** 弧で描く進捗リング。画面に入ると弧が伸びる。 */
export function ProgressArc({ value = 0, size = 190, label, caption }) {
  const r = 78;
  const circ = 2 * Math.PI * r;
  // 上部を開けた 270 度のアーク(=ブランドの弧)
  const sweep = circ * 0.75;
  return (
    <div className="progress-arc" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <linearGradient id="arcaRing" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--arc-1)" />
            <stop offset="50%" stopColor="var(--arc-2)" />
            <stop offset="100%" stopColor="var(--arc-3)" />
          </linearGradient>
        </defs>
        <circle
          className="progress-arc-track"
          cx="100" cy="100" r={r}
          strokeDasharray={`${sweep} ${circ}`}
        />
        <circle
          className="progress-arc-fill"
          cx="100" cy="100" r={r}
          stroke="url(#arcaRing)"
          strokeDasharray={`${(sweep * value) / 100} ${circ}`}
        />
      </svg>
      <div className="progress-arc-label">
        <span className="progress-arc-value">{label}</span>
        {caption && <span className="progress-arc-caption">{caption}</span>}
      </div>
    </div>
  );
}
