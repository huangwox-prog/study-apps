// ARCA デザインシステムのモーション基盤
// スクロール連動の演出はここに集約する(各コンポーネントは薄いフックだけ使う)
import { useEffect, useRef, useState } from "react";

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * data-reveal 属性を持つ要素を監視し、画面に入ったら is-in を付ける。
 * ページ全体で1つだけ動かす想定(App でマウント時に呼ぶ)。
 */
export function useRevealObserver(deps = []) {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll("[data-reveal]:not(.is-in)"));
    if (targets.length === 0) return;
    if (reduced() || typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * ページ全体のスクロール量(0〜1)を CSS 変数 --scroll に流し込む。
 * 背景のアーク回転・パララックスはこの1変数だけで動く。
 */
export function useScrollDriver() {
  useEffect(() => {
    if (reduced()) return;
    const root = document.documentElement;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = Math.max(1, root.scrollHeight - window.innerHeight);
      const y = window.scrollY || 0;
      root.style.setProperty("--scroll", String(Math.min(1, y / max)));
      root.style.setProperty("--scroll-px", `${y}`);
      root.classList.toggle("is-scrolled", y > 12);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}

/**
 * 画面に入ったら 0 から target まで数字が伸びるカウンタ。
 * 戻り値の ref を数字を表示する要素に付ける。
 */
export function useCountUp(target, duration = 1100) {
  const ref = useRef(null);
  const [value, setValue] = useState(reduced() ? target : 0);
  const done = useRef(false);

  useEffect(() => {
    if (reduced()) {
      setValue(target);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setValue(target);
      return;
    }
    const run = () => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        // easeOutExpo: 一気に立ち上がってゆっくり着地する
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setValue(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !done.current) {
            done.current = true;
            run();
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return [value, ref];
}

/**
 * マウス位置に合わせてカードをわずかに傾ける(離すと跳ねて戻る)。
 * ポインタが粗いデバイスでは何もしない。
 */
export function useTilt(strength = 6) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--tilt-x", `${(-py * strength).toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${(px * strength).toFixed(2)}deg`);
      el.style.setProperty("--glow-x", `${((px + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--glow-y", `${((py + 0.5) * 100).toFixed(1)}%`);
    };
    const onLeave = () => {
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);
  return ref;
}
