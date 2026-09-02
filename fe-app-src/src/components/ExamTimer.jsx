// 100分カウントダウン。街の上に浮かぶ時計看板として表示する。
import React, { useEffect, useRef, useState } from "react";

export default function ExamTimer({ totalSec, onExpire }) {
  const [remaining, setRemaining] = useState(totalSec);
  const expiredRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const pad = (n) => String(n).padStart(2, "0");
  // 写真の看板時計に合わせて hh:mm:ss の3桁組で出す
  const label = `${pad(h)}:${pad(m)}:${pad(s)}`;

  let cls = "exam-timer";
  if (remaining <= 180) cls += " danger";
  else if (remaining <= 600) cls += " warn";

  return (
    <span className={cls} role="timer" aria-live="off">
      <span className="tag-en" aria-hidden="true">TIME</span>
      <span className="digits">{label}</span>
    </span>
  );
}
