// ホーム画面: 学習時間のメーター表示(当日の目標達成率 + 直近7日間の合計)
import React, { useEffect, useState } from "react";
import { getDailySeconds, getWeeklySeconds, formatMinutes, DAILY_TARGET_MIN } from "../logic/studyTime.js";

const REFRESH_MS = 5000;
const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function StudyGauge() {
  const [dailySec, setDailySec] = useState(() => getDailySeconds());
  const [weeklySec, setWeeklySec] = useState(() => getWeeklySeconds());

  useEffect(() => {
    const tick = () => {
      setDailySec(getDailySeconds());
      setWeeklySec(getWeeklySeconds());
    };
    const interval = setInterval(tick, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  const targetSec = DAILY_TARGET_MIN * 60;
  const dailyRatio = Math.min(1, targetSec ? dailySec / targetSec : 0);
  const dashOffset = CIRCUMFERENCE * (1 - dailyRatio);
  const dailyPct = Math.round(dailyRatio * 100);

  const weeklyTargetSec = targetSec * 7;
  const weeklyRatio = Math.min(1, weeklyTargetSec ? weeklySec / weeklyTargetSec : 0);
  const weeklyPct = Math.round(weeklyRatio * 100);

  return (
    <div className="card study-gauge-card">
      <div className="study-gauge-row">
        <div className="study-gauge-ring-wrap">
          <svg viewBox="0 0 100 100" className="study-gauge-ring">
            <circle cx="50" cy="50" r={RADIUS} className="study-gauge-track" />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              className={`study-gauge-fill ${dailyRatio >= 1 ? "complete" : ""}`}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="study-gauge-center">
            <span className="study-gauge-pct">{dailyPct}%</span>
            <span className="study-gauge-label">本日</span>
          </div>
        </div>

        <div className="study-gauge-info">
          <div className="study-gauge-info-row">
            <span className="text-secondary" style={{ fontSize: "0.85rem" }}>
              本日の学習時間
            </span>
            <span style={{ fontWeight: 650 }}>
              {formatMinutes(dailySec)}
              <span className="text-tertiary" style={{ fontWeight: 500 }}>
                {" "}
                / 目標 {DAILY_TARGET_MIN}分
              </span>
            </span>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span className="text-secondary" style={{ fontSize: "0.85rem" }}>
                今週の合計(直近7日間)
              </span>
              <span className="text-secondary" style={{ fontSize: "0.85rem" }}>
                {formatMinutes(weeklySec)}({weeklyPct}%)
              </span>
            </div>
            <div className="progress-track">
              <div
                className={`progress-fill ${weeklyRatio >= 1 ? "complete" : ""}`}
                style={{ width: `${weeklyPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
