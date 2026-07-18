import React, { useState, useCallback } from "react";
import SetSelect from "./components/SetSelect.jsx";
import ExamRunner from "./components/ExamRunner.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import { ALL_SETS } from "./data/sets/index.js";
import { loadResults } from "./logic/storage.js";

export default function App() {
  const [view, setView] = useState({ screen: "home" });
  const [results, setResults] = useState(() => loadResults().results);

  const goHome = useCallback(() => {
    setResults(loadResults().results);
    setView({ screen: "home" });
  }, []);

  let content = null;
  let shellClass = "app-shell";

  if (view.screen === "home") {
    content = (
      <SetSelect
        sets={ALL_SETS}
        results={results}
        onSelect={(setId) => setView({ screen: "exam", setId })}
      />
    );
  } else if (view.screen === "exam") {
    const examSet = ALL_SETS.find((s) => s.id === view.setId);
    shellClass = "app-shell cat-algo";
    content = <ExamRunner key={view.setId} examSet={examSet} onExit={goHome} />;
  }

  return (
    <>
      <ThemeToggle />
      <div className={shellClass}>{content}</div>
    </>
  );
}
