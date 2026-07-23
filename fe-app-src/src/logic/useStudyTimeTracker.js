// アプリを開いてから閉じる(またはタブを離れる)までの時間を計測し、
// 学習時間として定期的にlocalStorageへ記録するフック。
import { useEffect, useRef } from "react";
import { addElapsedSeconds } from "./studyTime.js";

const FLUSH_INTERVAL_MS = 20000;

export function useStudyTimeTracker() {
  const lastRef = useRef(Date.now());

  useEffect(() => {
    const flush = () => {
      const now = Date.now();
      const elapsedSec = (now - lastRef.current) / 1000;
      lastRef.current = now;
      addElapsedSeconds(elapsedSec);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        flush();
      } else {
        lastRef.current = Date.now();
      }
    };

    const interval = setInterval(flush, FLUSH_INTERVAL_MS);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      flush();
      clearInterval(interval);
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);
}
