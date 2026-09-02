import React, { useState, useCallback, useMemo } from "react";
import Dashboard from "./components/Dashboard.jsx";
import UnitFlow from "./components/UnitFlow.jsx";
import MockExam from "./components/MockExam.jsx";
import OralDrill from "./components/OralDrill.jsx";
import ReviewMode from "./components/ReviewMode.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import { ArcMark } from "./components/Motif.jsx";
import { ALL_UNITS } from "./data/units.js";
import { EXAM_SETS } from "./logic/examGenerator.js";
import { loadProgress, recordActivity } from "./logic/storage.js";
import { summarizeMistakes, MISTAKE_TYPES } from "./logic/weakness.js";
import { useScrollDriver } from "./logic/motion.js";

export default function App() {
  const [view, setView] = useState({ screen: "home" });
  // スクロール量を CSS 変数に流し、背景の弧とヒーローの図形を回す
  useScrollDriver();
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

  // ホームは全幅のプロダクトページ。左右レールの内容はページ内の「状況」節に統合した。
  if (view.screen === "home") {
    return (
      <>
        <ThemeToggle />
        <Dashboard
          units={ALL_UNITS}
          progress={progress}
          mistakeSummary={mistakeSummary}
          onOpenUnit={openUnit}
          onOpenExam={(examId) => setView({ screen: "exam", examId })}
          onOpenOral={() => setView({ screen: "oral" })}
          onOpenReview={(type) => setView({ screen: "review", mistakeType: type })}
        />
      </>
    );
  }

  if (view.screen === "unit") {
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
  } else if (view.screen === "oral") {
    content = <OralDrill onExit={goHome} />;
  } else if (view.screen === "review") {
    const entry = mistakeSummary.find((w) => w.type === view.mistakeType);
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

  // 単元・模試・ドリルの各画面にも、細いブランド帯で同じ世界観を通す
  return (
    <>
      <ThemeToggle />
      <div className="inner-brand">
        <button className="brand-lockup" onClick={goHome} title="ホームへ">
          <ArcMark size={20} />
          ARCA
          <span className="brand-lockup-sub">数学I</span>
        </button>
      </div>
      <div className={shellClass}>{content}</div>
    </>
  );
}
