// 選択肢の表示順シャッフル
// 問題データでは answer が正解の index を指す。表示時に順番を混ぜ、
// 「表示順 → 元のindex」の対応表を持って採点時に元に戻す。

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// order[表示位置] = 元のindex。同じ問題は常に同じ並びになる(復習時も安定)。
export function shuffledChoiceOrder(question) {
  const n = question.choices.length;
  const order = Array.from({ length: n }, (_, i) => i);
  const rand = mulberry32(hashString(question.id));
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
