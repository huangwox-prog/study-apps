// 背景の都市。ピクセルアートの夜景を SVG のビル群として再構成する。
//   ・ビルは 4px グリッドに吸着させ、窓は 3px の正方形の格子で描く
//   ・遠景 / 中景 / 近景 の3層を別速度でスクロール追従させて奥行きを出す
//   ・上に走査線(.crt)と掃引線を重ねて CRT の質感にする
import React, { useEffect, useMemo, useRef } from "react";

// 同じ街並みが毎回出るように、決定的な擬似乱数を使う
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const GRID = 4; // ピクセル単位。すべての寸法をこの倍数に丸める
const snap = (v) => Math.round(v / GRID) * GRID;

// 1層ぶんのビル群を生成する
function buildSkyline({ seed, width, height, minH, maxH, litRatio }) {
  const rng = makeRng(seed);
  const buildings = [];
  let x = 0;
  while (x < width) {
    const w = snap(28 + rng() * 64);
    const h = snap(minH + rng() * (maxH - minH));
    const b = { x, y: height - h, w, h, windows: [], top: null };

    // 屋上の設備 / アンテナ(写真のビル頭部の出っ張り)
    const r = rng();
    if (r > 0.72) b.top = { type: "spire", x: x + snap(w / 2), h: snap(14 + rng() * 34) };
    else if (r > 0.45) b.top = { type: "cap", x: x + GRID * 2, w: w - GRID * 4, h: GRID * 2 };

    // 窓の光。等間隔の格子から一部だけを点灯させる
    for (let wy = b.y + GRID * 3; wy < height - GRID * 2; wy += GRID * 3) {
      for (let wx = x + GRID * 2; wx < x + w - GRID * 2; wx += GRID * 3) {
        if (rng() < litRatio) {
          b.windows.push({ x: wx, y: wy, hot: rng() < 0.18 });
        }
      }
    }
    buildings.push(b);
    x += w + snap(rng() * 12);
  }
  return buildings;
}

function SkylineLayer({ className, seed, height, minH, maxH, litRatio, face, faceLow, windowColor, hotColor, gradId }) {
  const width = 1600;
  const buildings = useMemo(
    () => buildSkyline({ seed, width, height, minH, maxH, litRatio }),
    [seed, height, minH, maxH, litRatio]
  );

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMax slice"
      style={{ height }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* ビル面は上が青紫、下がマゼンタ。写真のビルの発色をそのまま縦グラデに */}
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={face} />
          <stop offset="100%" stopColor={faceLow} />
        </linearGradient>
      </defs>
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={`url(#${gradId})`} />
          {b.top?.type === "cap" && (
            <rect x={b.top.x} y={b.y - b.top.h} width={b.top.w} height={b.top.h} fill={face} />
          )}
          {b.top?.type === "spire" && (
            <>
              <rect x={b.top.x} y={b.y - b.top.h} width={GRID / 2} height={b.top.h} fill={windowColor} opacity="0.7" />
              <rect
                x={b.top.x - GRID / 2}
                y={b.y - b.top.h - GRID}
                width={GRID * 1.5}
                height={GRID * 1.5}
                fill={hotColor}
                className="city-beacon"
                style={{ animationDelay: `${(i % 7) * 0.31}s` }}
              />
            </>
          )}
          {b.windows.map((w, j) => (
            <rect
              key={j}
              x={w.x}
              y={w.y}
              width={GRID - 1}
              height={GRID - 1}
              fill={w.hot ? hotColor : windowColor}
              opacity={w.hot ? 0.95 : 0.6}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

export default function CityBackdrop() {
  const ref = useRef(null);

  // スクロール量を 0〜1 に正規化して CSS 変数 --sy に流す(視差の駆動源)
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
        const sy = Math.min(1, window.scrollY / max);
        document.documentElement.style.setProperty("--sy", sy.toFixed(4));
        // 固定ナビの下端を光らせる判定もここでまとめて行う
        document.documentElement.classList.toggle("is-scrolled", window.scrollY > 12);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="city" ref={ref} aria-hidden="true">
        <div className="city-sky" />
        <div className="city-rain" />
        <SkylineLayer
          className="city-layer city-layer--far"
          gradId="cityFar"
          seed={20260903}
          height={168}
          minH={64}
          maxH={160}
          litRatio={0.22}
          face="#1b1250"
          faceLow="#2a1560"
          windowColor="#22e7f5"
          hotColor="#ff2d95"
        />
        <SkylineLayer
          className="city-layer city-layer--mid"
          gradId="cityMid"
          seed={777001}
          height={128}
          minH={52}
          maxH={124}
          litRatio={0.3}
          face="#241a63"
          faceLow="#5c1f79"
          windowColor="#7ff4ff"
          hotColor="#ffc23d"
        />
        <SkylineLayer
          className="city-layer city-layer--near"
          gradId="cityNear"
          seed={31415}
          height={92}
          minH={34}
          maxH={88}
          litRatio={0.34}
          face="#120b33"
          faceLow="#8a1f66"
          windowColor="#ff6ec7"
          hotColor="#22e7f5"
        />
        <div className="city-scrim" />
        <div className="city-horizon" />
      </div>
      <div className="crt" aria-hidden="true" />
      <div className="crt-sweep" aria-hidden="true" />
      <div className="vsign" aria-hidden="true">電脳演習区</div>
    </>
  );
}
