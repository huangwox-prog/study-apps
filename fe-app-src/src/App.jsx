import React, { useState, useCallback } from "react";
import SetSelect from "./components/SetSelect.jsx";
import ExamRunner from "./components/ExamRunner.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import CityBackdrop from "./components/CityBackdrop.jsx";
import { ALL_SETS } from "./data/sets/index.js";
import { loadResults } from "./logic/storage.js";
import { useStudyTimeTracker } from "./logic/useStudyTimeTracker.js";

export default function App() {
  useStudyTimeTracker();
  const [view, setView] = useState({ screen: "home" });
  const [results, setResults] = useState(() => loadResults().results);

  const goHome = useCallback(() => {
    setResults(loadResults().results);
    setView({ screen: "home" });
    window.scrollTo({ top: 0 });
  }, []);

  let content = null;
  let shellClass = "app-shell";

  // ホームはプロダクトページとして全幅で組む(演習画面だけ従来の幅に収める)
  if (view.screen === "home") {
    return (
      <>
        <CityBackdrop />
        <ThemeToggle />
        <SetSelect
          sets={ALL_SETS}
          results={results}
          onSelect={(setId) => {
            setView({ screen: "exam", setId });
            window.scrollTo({ top: 0 });
          }}
        />
      </>
    );
  }

  if (view.screen === "exam") {
    const examSet = ALL_SETS.find((s) => s.id === view.setId);
    shellClass = "app-shell cat-algo";
    content = <ExamRunner key={view.setId} examSet={examSet} onExit={goHome} />;
  }

  return (
    <>
      <CityBackdrop />
      <ThemeToggle />
      <div className={shellClass}>{content}</div>
    </>
  );
}
