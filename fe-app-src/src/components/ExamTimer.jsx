// 100分カウントダウンタイマー
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

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const label = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  let cls = "exam-timer";
  if (remaining <= 180) cls += " danger";
  else if (remaining <= 600) cls += " warn";

  return (
    <span className={cls}>
      <span aria-hidden="true">⏱</span> {label}
    </span>
  );
}
