import React, { useState, useCallback, useMemo } from "react";
import Dashboard from "./components/Dashboard.jsx";
import UnitFlow from "./components/UnitFlow.jsx";
import MockExam from "./components/MockExam.jsx";
import ReviewMode from "./components/ReviewMode.jsx";
import ProgressRail from "./components/ProgressRail.jsx";
import WeakSpots from "./components/WeakSpots.jsx";
import ActivityLog from "./components/ActivityLog.jsx";
import { ALL_UNITS } from "./data/units.js";
import { EXAM_SETS } from "./logic/examGenerator.js";
import { loadProgress, recordActivity } from "./logic/storage.js";
import { summarizeMistakes, MISTAKE_TYPES } from "./logic/weakness.js";

export default function App() {
  const [view, setView] = useState({ screen: "home" });
  const [progress, setProgress] = useState(loadProgress);

  const goHome = useCallback(() => {
    setProgress(loadProgress());
    setView({ screen: "home" });
  }, []);

  const openUnit = useCallback((unitId) => {
    recordActivity(unitId);
    setProgress(loadProgress());
    setView({ screen: "unit", unitId });
  }, []);

  const mistakeSummary = useMemo(() => summarizeMistakes(progress), [progress]);

  let content = null;
  let shellClass = "app-shell";
  let showSidebars = true;

  if (view.screen === "home") {
    content = (
      <Dashboard
        units={ALL_UNITS}
        progress={progress}
        onOpenUnit={openUnit}
        onOpenExam={(examId) => setView({ screen: "exam", examId })}
        onOpenReview={(type) => setView({ screen: "review", mistakeType: type })}
      />
    );
  } else if (view.screen === "unit") {
    const unit = ALL_UNITS.find((u) => u.id === view.unitId);
    // 単元画面はカテゴリカラーのアクセントで統一する
    shellClass = `app-shell cat-${unit.category}`;
    showSidebars = false;
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
    showSidebars = false;
    content = (
      <MockExam key={view.examId} examSet={examSet} units={ALL_UNITS} onExit={goHome} />
    );
  } else if (view.screen === "review") {
    const entry = mistakeSummary.find((w) => w.type === view.mistakeType);
    showSidebars = false;
    content = (
      <ReviewMode
        key={view.mistakeType}
        label={MISTAKE_TYPES[view.mistakeType] || view.mistakeType}
        qids={entry?.qids ?? []}
        units={ALL_UNITS}
        onExit={goHome}
      />
    );
  }

  if (!showSidebars) {
    return <div className={shellClass}>{content}</div>;
  }

  return (
    <div className="layout-3col">
      <aside className="rail rail-left">
        <ProgressRail units={ALL_UNITS} progress={progress} onOpenUnit={openUnit} />
      </aside>
      <div className={shellClass} style={{ padding: "32px 0 80px" }}>
        {content}
      </div>
      <aside className="rail rail-right">
        <div className="rail-inner">
          <WeakSpots
            summary={mistakeSummary}
            onOpenReview={(type) => setView({ screen: "review", mistakeType: type })}
            compact
          />
          <ActivityLog
            log={progress.log || {}}
            units={ALL_UNITS}
            onOpenUnit={openUnit}
            compact
          />
        </div>
      </aside>
    </div>
  );
}
