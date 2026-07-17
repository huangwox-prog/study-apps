// 1つの単元の学習フロー全体を管理する
// 診断 → (合格なら選択) → 解説 → 演習 → 確認テスト → 習熟度記録
import React, { useState } from "react";
import Quiz from "./Quiz.jsx";
import Lesson from "./Lesson.jsx";
import MathText from "./MathText.jsx";
import { tallyResults } from "../logic/grading.js";
import { diagPassed, masteryFromTest } from "../logic/mastery.js";
import { updateUnitProgress } from "../logic/storage.js";

export default function UnitFlow({ unit, progress, onExit }) {
  // 初回は診断から。すでに履歴がある単元はメニューから。
  const hasHistory = !!progress;
  const [stage, setStage] = useState(hasHistory ? "menu" : "diag-intro");
  const [diagResult, setDiagResult] = useState(null);
  const [practiceResult, setPracticeResult] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const finishDiag = (results) => {
    const tally = tallyResults(results);
    setDiagResult(tally);
    if (diagPassed(tally.correct, tally.total)) {
      setStage("diag-passed");
    } else {
      setStage("diag-failed");
    }
  };

  const skipUnit = () => {
    updateUnitProgress(unit.id, {
      mastery: 100,
      status: "completed",
      skippedByDiag: true,
    });
    onExit();
  };

  const finishPractice = (results) => {
    setPracticeResult(tallyResults(results));
    setStage("practice-done");
  };

  const finishTest = (results) => {
    const tally = tallyResults(results);
    const mastery = masteryFromTest(tally.correct, tally.total);
    updateUnitProgress(unit.id, {
      mastery,
      status: "completed",
      bestTest: Math.max(mastery, progress?.bestTest ?? 0),
      skippedByDiag: false,
    });
    setTestResult({ ...tally, mastery, results });
    setStage("test-done");
  };

  // ---------- 画面 ----------
  if (stage === "menu") {
    return (
      <div className="screen">
        <div className="top-bar">
          <button className="btn-ghost btn" onClick={onExit}>← ホームへ</button>
          {progress?.mastery != null && (
            <span className="badge ok">習熟度 {progress.mastery}%</span>
          )}
        </div>
        <h1 style={{ marginBottom: 6 }}>{unit.title}</h1>
        <p className="text-secondary" style={{ marginBottom: 28 }}>
          {progress?.skippedByDiag
            ? "この単元は診断でスキップ済み。やっぱり演習したいときは、ここからいつでも取り組めるよ。"
            : "どこから取り組む?好きなところから何度でもやり直せるよ。"}
        </p>
        <div className="fade-stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            ["diag-intro", "診断テストを受ける", "5問で今の力をチェック(高得点ならスキップも選べる)"],
            ["lesson", "解き方の解説を読む", "基本の考え方をゆっくり確認"],
            ["practice", "演習をする", "超基礎から章末レベルまで段階的に"],
            ["test-intro", "確認テストを受ける", "習熟度%を測定して記録する"],
          ].map(([key, label, desc]) => (
            <button
              key={key}
              className="card card-hover"
              style={{ textAlign: "left", cursor: "pointer", width: "100%" }}
              onClick={() => setStage(key)}
            >
              <h3>{label}</h3>
              <p className="text-secondary" style={{ fontSize: "0.92rem", marginTop: 4 }}>{desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (stage === "diag-intro") {
    return (
      <div className="screen">
        <div className="top-bar">
          <button className="btn-ghost btn" onClick={hasHistory ? () => setStage("menu") : onExit}>← 戻る</button>
        </div>
        <div className="card" style={{ padding: "40px 36px", textAlign: "center" }}>
          <span className="badge accent" style={{ marginBottom: 16 }}>はじめの診断</span>
          <h1 style={{ marginBottom: 14 }}>{unit.title}</h1>
          <p className="text-secondary" style={{ maxWidth: 480, margin: "0 auto 8px" }}>
            まず {unit.diagnostic.length} 問だけ、今の力を確認させてね。
          </p>
          <p className="text-secondary" style={{ maxWidth: 480, margin: "0 auto 28px" }}>
            解けなくても大丈夫。そのあと基礎からゆっくり練習できるから、気楽にどうぞ。
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => setStage("diag")}>
            診断をはじめる
          </button>
          <div style={{ marginTop: 18 }}>
            <button className="btn btn-ghost" onClick={() => setStage("practice")}>
              診断をスキップして演習へ →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "diag") {
    return (
      <Quiz
        questions={unit.diagnostic}
        mode="test"
        title={`${unit.title} — 診断`}
        onFinish={finishDiag}
        onExit={hasHistory ? () => setStage("menu") : onExit}
      />
    );
  }

  if (stage === "diag-passed") {
    return (
      <div className="screen">
        <div className="card" style={{ padding: "40px 36px", textAlign: "center" }}>
          <span className="badge ok" style={{ marginBottom: 16 }}>
            診断 {diagResult.correct} / {diagResult.total} 正解
          </span>
          <h1 style={{ marginBottom: 14 }}>この単元、もう身についてるみたい</h1>
          <p className="text-secondary" style={{ maxWidth: 500, margin: "0 auto 30px" }}>
            この単元は習得済みとみなして次に進みますか?
            それとも念のため全問演習しますか?
            (スキップしても、あとからいつでも演習に戻れるよ)
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-lg" onClick={skipUnit}>
              習得済みにして次へ
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => setStage("lesson")}>
              念のため演習する
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "diag-failed") {
    return (
      <div className="screen">
        <div className="card" style={{ padding: "40px 36px", textAlign: "center" }}>
          <span className="badge" style={{ marginBottom: 16 }}>
            診断 {diagResult.correct} / {diagResult.total} 正解
          </span>
          <h1 style={{ marginBottom: 14 }}>ここから一緒に固めていこう</h1>
          <p className="text-secondary" style={{ maxWidth: 500, margin: "0 auto 30px" }}>
            大丈夫、いまはできなくて当たり前。
            まず解き方の説明を読んでから、超基礎の問題で少しずつ慣れていこう。
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => setStage("lesson")}>
            解説を読む →
          </button>
        </div>
      </div>
    );
  }

  if (stage === "lesson") {
    return (
      <Lesson
        unit={unit}
        onStart={() => setStage("practice")}
        onExit={hasHistory ? () => setStage("menu") : onExit}
      />
    );
  }

  if (stage === "practice") {
    return (
      <Quiz
        questions={unit.practice}
        mode="practice"
        title={`${unit.title} — 演習`}
        onFinish={finishPractice}
        onExit={hasHistory ? () => setStage("menu") : onExit}
      />
    );
  }

  if (stage === "practice-done") {
    const ratio = Math.round(practiceResult.ratio * 100);
    return (
      <div className="screen">
        <div className="card" style={{ padding: "40px 36px", textAlign: "center" }}>
          <span className="badge ok" style={{ marginBottom: 16 }}>演習おつかれさま</span>
          <h1 style={{ marginBottom: 10 }}>
            {practiceResult.correct} / {practiceResult.total} 問正解({ratio}%)
          </h1>
          <p className="text-secondary" style={{ maxWidth: 480, margin: "0 auto 30px" }}>
            {ratio >= 80
              ? "しっかり解けてる。このまま確認テストで習熟度を記録しよう。"
              : "間違えた問題の解説は読めた?不安なら演習をもう一周してもいいし、テストに進んでもOK。"}
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-lg" onClick={() => setStage("test-intro")}>
              確認テストへ →
            </button>
            <button className="btn btn-secondary" onClick={() => setStage("practice")}>
              演習をもう一周
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "test-intro") {
    return (
      <div className="screen">
        <div className="top-bar">
          <button className="btn-ghost btn" onClick={hasHistory ? () => setStage("menu") : onExit}>← 戻る</button>
        </div>
        <div className="card" style={{ padding: "40px 36px", textAlign: "center" }}>
          <span className="badge accent" style={{ marginBottom: 16 }}>確認テスト</span>
          <h1 style={{ marginBottom: 14 }}>{unit.title}</h1>
          <p className="text-secondary" style={{ maxWidth: 480, margin: "0 auto 28px" }}>
            全 {unit.test.length} 問。途中の答え合わせはなしで、最後にまとめて採点するよ。
            この結果がこの単元の習熟度として記録される。
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => setStage("test")}>
            テストをはじめる
          </button>
        </div>
      </div>
    );
  }

  if (stage === "test") {
    return (
      <Quiz
        questions={unit.test}
        mode="test"
        title={`${unit.title} — 確認テスト`}
        onFinish={finishTest}
        onExit={hasHistory ? () => setStage("menu") : onExit}
      />
    );
  }

  if (stage === "test-done") {
    const m = testResult.mastery;
    const wrongs = testResult.results.filter((r) => !r.correct);
    return (
      <div className="screen">
        <div className="card" style={{ padding: "40px 36px", textAlign: "center" }}>
          <span className={`badge ${m >= 70 ? "ok" : ""}`} style={{ marginBottom: 16 }}>
            確認テスト結果
          </span>
          <h1 style={{ marginBottom: 18 }}>習熟度 {m}%</h1>
          <div className="progress-track" style={{ maxWidth: 380, margin: "0 auto 22px" }}>
            <div
              className={`progress-fill ${m >= 70 ? "complete" : ""}`}
              style={{ width: `${m}%` }}
            />
          </div>
          <p className="text-secondary" style={{ maxWidth: 480, margin: "0 auto 30px" }}>
            {m >= 90
              ? "文句なし。この単元は完成と言っていい出来。"
              : m >= 70
              ? "合格ライン。テストで出ても戦える力がついてるよ。"
              : "記録した。焦らなくていいから、間違えた問題を見直してもう一度挑戦してみよう。"}
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-lg" onClick={onExit}>
              ホームへ戻る
            </button>
            {m < 70 && (
              <button className="btn btn-secondary" onClick={() => setStage("practice")}>
                演習からやり直す
              </button>
            )}
          </div>
        </div>

        {wrongs.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 12 }}>間違えた問題の解説</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {wrongs.map((r, i) => (
                <div className="card" key={i}>
                  <p style={{ fontWeight: 600, marginBottom: 8 }}>
                    <MathText text={r.question.q} />
                  </p>
                  <p className="text-secondary">
                    <MathText text={r.question.exp} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
