// 学習時間メーター。写真の円形ネオン看板に見立て、破線のリングが回る。
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
          <span className="study-gauge-orbit" aria-hidden="true" />
          <svg viewBox="0 0 100 100" className="study-gauge-ring" aria-hidden="true">
            <circle cx="50" cy="50" r={RADIUS} className="study-gauge-track" />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              className={`study-gauge-fill ${dailyRatio >= 1 ? "complete" : ""}`}
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={100 - dailyPct}
            />
          </svg>
          <div className="study-gauge-center">
            <span className="study-gauge-pct">{dailyPct}%</span>
            <span className="study-gauge-label">本日</span>
          </div>
        </div>

        <div className="study-gauge-info">
          <div className="study-gauge-info-row">
            <span className="tag-en" style={{ color: "var(--cyan)" }}>DAILY UPTIME</span>
            <span style={{ fontFamily: "var(--font-pixel)" }}>
              {formatMinutes(dailySec)}
              <span className="text-tertiary"> / 目標 {DAILY_TARGET_MIN}分</span>
            </span>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span className="tag-en" style={{ color: "var(--magenta)" }}>WEEKLY / 7 DAYS</span>
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
