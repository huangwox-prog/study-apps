import React, { useState, useCallback } from "react";
import Dashboard from "./components/Dashboard.jsx";
import UnitFlow from "./components/UnitFlow.jsx";
import MockExam from "./components/MockExam.jsx";
import { ALL_UNITS } from "./data/units.js";
import { EXAM_SETS } from "./logic/examGenerator.js";
import { loadProgress } from "./logic/storage.js";

export default function App() {
  const [view, setView] = useState({ screen: "home" });
  const [progress, setProgress] = useState(loadProgress);

  const goHome = useCallback(() => {
    setProgress(loadProgress());
    setView({ screen: "home" });
  }, []);

  let content = null;
  let shellClass = "app-shell";
  if (view.screen === "home") {
    content = (
      <Dashboard
        units={ALL_UNITS}
        progress={progress}
        onOpenUnit={(unitId) => setView({ screen: "unit", unitId })}
        onOpenExam={(examId) => setView({ screen: "exam", examId })}
      />
    );
  } else if (view.screen === "unit") {
    const unit = ALL_UNITS.find((u) => u.id === view.unitId);
    // 単元画面はカテゴリカラーのアクセントで統一する
    shellClass = `app-shell cat-${unit.category}`;
    content = (
      <UnitFlow
        key={view.unitId}
        unit={unit}
        progress={progress.units[view.unitId]}
        onExit={goHome}
      />
    );
  } else if (view.screen === "exam") {
    const examSet = EXAM_SETS.find((e) => e.id === view.examId);
    content = (
      <MockExam key={view.examId} examSet={examSet} units={ALL_UNITS} onExit={goHome} />
    );
  }

  return <div className={shellClass}>{content}</div>;
}
