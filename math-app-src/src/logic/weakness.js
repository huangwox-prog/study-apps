// 弱点分析のヘルパー(集計・復習セット生成)
export const MISTAKE_TYPES = {
  sign: "符号ミス",
  formula: "公式の取り違え",
  calc: "計算ミス",
  read: "問題文の読み違え",
  cond: "条件の見落とし",
  time: "時間切れ",
};

export const MISTAKE_TYPE_KEYS = Object.keys(MISTAKE_TYPES);

// state.mistakes からタイプ別に集計して件数降順で返す
// -> [{ type, label, count, qids: [...] }]
export function summarizeMistakes(state) {
  const byType = {};
  for (const [qid, m] of Object.entries(state.mistakes || {})) {
    if (!byType[m.type]) byType[m.type] = { count: 0, qids: [] };
    byType[m.type].count += m.count;
    byType[m.type].qids.push(qid);
  }
  return Object.entries(byType)
    .map(([type, v]) => ({ type, label: MISTAKE_TYPES[type] || type, ...v }))
    .sort((a, b) => b.count - a.count);
}

// 全単元からqidに対応する問題オブジェクトを集める(復習セット用)
export function questionsForQids(units, qids) {
  const wanted = new Set(qids);
  const found = [];
  for (const unit of units) {
    for (const qs of [unit.diagnostic, unit.practice, unit.test]) {
      for (const q of qs) {
        if (wanted.has(q.id)) found.push({ ...q, unitTitle: unit.title });
      }
    }
  }
  return found;
}
