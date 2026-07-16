// 習熟度の計算と表示ヘルパー

// 確認テストの得点率(0-1)から習熟度%を算出
export function masteryFromTest(correct, total) {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

// 診断テストの合格判定(8割以上)
export const DIAG_PASS_RATIO = 0.8;
export function diagPassed(correct, total) {
  return total > 0 && correct / total >= DIAG_PASS_RATIO;
}

export function masteryLabel(m) {
  if (m >= 90) return "ばっちり";
  if (m >= 70) return "順調";
  if (m >= 40) return "あと少し";
  if (m > 0) return "これから";
  return "未着手";
}

export function overallProgress(unitsMeta, progressUnits) {
  if (unitsMeta.length === 0) return 0;
  const total = unitsMeta.reduce(
    (sum, u) => sum + (progressUnits[u.id]?.mastery ?? 0),
    0
  );
  return Math.round(total / unitsMeta.length);
}
