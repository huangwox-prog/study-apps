// スクロールで要素を「点灯」させる。IntersectionObserver で .is-in を付けるだけ。
// 対象は .reveal を持つ要素。画面に一度入ったら外さない(戻るたびに光ると煩い)。
//
// 隠す指定(opacity:0)は html.has-reveal の下でのみ効かせる。監視できない環境
// —— IO 非対応、モーション低減、ビューポートが取れない埋め込みなど —— では
// このクラスを付けないので、内容が消えたまま残ることがない。
import { useEffect } from "react";

function canObserve() {
  if (typeof IntersectionObserver === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (!window.innerHeight) return false;
  return true;
}

export function useScrollReveal(deps = []) {
  useEffect(() => {
    const root = document.documentElement;

    if (!canObserve()) {
      root.classList.remove("has-reveal");
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
      return;
    }
    root.classList.add("has-reveal");

    const targets = document.querySelectorAll(".reveal:not(.is-in)");
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
