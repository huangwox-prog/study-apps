// 採点ロジック
// answers: 問題番号(1-20)をキーとする { [no]: 選択したindex | null }
export function gradeExam(questions, answers) {
  let correct = 0;
  const byCategory = {
    algo: { correct: 0, total: 0 },
    sec: { correct: 0, total: 0 },
  };
  const detail = [];

  for (const q of questions) {
    const chosen = answers[q.no] ?? null;
    const ok = chosen === q.answer;
    if (ok) correct++;
    byCategory[q.section].total++;
    if (ok) byCategory[q.section].correct++;
    detail.push({ no: q.no, ok, chosen, question: q });
  }

  const total = questions.length;
  return {
    score: total ? Math.round((correct / total) * 100) : 0,
    correct,
    total,
    byCategory,
    detail,
  };
}

export function formatElapsed(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}分${s}秒`;
}
