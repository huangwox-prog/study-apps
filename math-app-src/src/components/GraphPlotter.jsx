// 放物線の作図コンポーネント
// グリッドをクリック(またはボタン)で頂点を指定し、凸の向きを選んで
// 放物線を描く。graph タイプの問題の回答UIとして使う。
import React from "react";

const RANGE = 6; // -6〜6
const SIZE = 340;
const scale = SIZE / (RANGE * 2);

function toSvg(x, y) {
  return [(x + RANGE) * scale, (RANGE - y) * scale];
}

export default function GraphPlotter({ value, onChange, disabled, showTarget }) {
  const vertex = value?.vertex ?? null;
  const dir = value?.dir ?? 1;

  const handleClick = (e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * SIZE;
    const py = ((e.clientY - rect.top) / rect.height) * SIZE;
    const x = Math.round(px / scale - RANGE);
    const y = Math.round(RANGE - py / scale);
    if (Math.abs(x) <= RANGE && Math.abs(y) <= RANGE) {
      onChange({ vertex: [x, y], dir });
    }
  };

  const buildPath = (vx, vy, a) => {
    const points = [];
    for (let x = -RANGE; x <= RANGE; x += 0.1) {
      const y = a * (x - vx) * (x - vx) + vy;
      if (y >= -RANGE - 4 && y <= RANGE + 4) {
        const [sx, sy] = toSvg(x, y);
        points.push(`${points.length === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`);
      }
    }
    return points.join(" ");
  };

  const gridLines = [];
  for (let i = -RANGE; i <= RANGE; i++) {
    const [sx] = toSvg(i, 0);
    const [, sy] = toSvg(0, i);
    gridLines.push(
      <line key={`v${i}`} x1={sx} y1={0} x2={sx} y2={SIZE}
        stroke="var(--border)" strokeWidth={i === 0 ? 0 : 1} />,
      <line key={`h${i}`} x1={0} y1={sy} x2={SIZE} y2={sy}
        stroke="var(--border)" strokeWidth={i === 0 ? 0 : 1} />
    );
  }
  const [ox] = toSvg(0, 0);

  return (
    <div>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        onClick={handleClick}
        style={{
          width: "100%",
          maxWidth: 420,
          display: "block",
          margin: "0 auto",
          background: "var(--surface)",
          border: "1.5px solid var(--border-strong)",
          borderRadius: "var(--radius)",
          cursor: disabled ? "default" : "crosshair",
          touchAction: "manipulation",
        }}
      >
        {gridLines}
        {/* 軸 */}
        <line x1={ox} y1={0} x2={ox} y2={SIZE} stroke="var(--text-tertiary)" strokeWidth={1.5} />
        <line x1={0} y1={ox} x2={SIZE} y2={ox} stroke="var(--text-tertiary)" strokeWidth={1.5} />
        <text x={ox + 6} y={14} fontSize={13} fill="var(--text-tertiary)">y</text>
        <text x={SIZE - 14} y={ox - 8} fontSize={13} fill="var(--text-tertiary)">x</text>
        <text x={ox - 14} y={ox + 16} fontSize={12} fill="var(--text-tertiary)">O</text>

        {/* 正解の放物線(答え合わせ後に表示) */}
        {showTarget && (
          <path
            d={buildPath(showTarget.vertex[0], showTarget.vertex[1], showTarget.dir)}
            fill="none"
            stroke="var(--success)"
            strokeWidth={2.5}
            strokeDasharray="6 5"
            opacity={0.85}
          />
        )}

        {/* 学生の放物線 */}
        {vertex && (
          <>
            <path
              d={buildPath(vertex[0], vertex[1], dir)}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={3}
              strokeLinecap="round"
              style={{ transition: "d 0.3s var(--ease)" }}
            />
            <circle
              cx={toSvg(vertex[0], vertex[1])[0]}
              cy={toSvg(vertex[0], vertex[1])[1]}
              r={6}
              fill="var(--accent)"
              stroke="var(--surface)"
              strokeWidth={2}
            />
          </>
        )}
      </svg>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
        <span className="text-secondary" style={{ alignSelf: "center", fontSize: "0.92rem" }}>
          グリッドをタップして頂点を指定 →
        </span>
        <button
          className={`btn ${dir === 1 ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "8px 18px", fontSize: "0.92rem" }}
          onClick={() => !disabled && onChange({ vertex, dir: 1 })}
          disabled={disabled}
        >
          下に凸 ∪
        </button>
        <button
          className={`btn ${dir === -1 ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "8px 18px", fontSize: "0.92rem" }}
          onClick={() => !disabled && onChange({ vertex, dir: -1 })}
          disabled={disabled}
        >
          上に凸 ∩
        </button>
      </div>
      {vertex && (
        <p style={{ textAlign: "center", marginTop: 8 }} className="text-secondary">
          頂点 ({vertex[0]}, {vertex[1]})
        </p>
      )}
    </div>
  );
}
