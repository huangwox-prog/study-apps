// 口頭試問ドリルの問題データ(全228問)
//
// 1問のフィールド:
//   id / field(分野) / category(分類) / firstMove(第一手)
//   q(問題文) / a(解答) / solution(解説・2〜4行)
//   advanced(応用フラグ。場合分け問題・三角比の対称式・二重根号・整数部分と式の値に付く。
//            設定でオンオフする)
// 数式はすべて LaTeX。文字列中の $…$ が数式として組まれる。
import expressions from "./expressions.js";
import real from "./real.js";
import quadratic from "./quadratic.js";
import equations from "./equations.js";
import trig from "./trig.js";
import trigeq from "./trigeq.js";
import data from "./data.js";
import { FIELDS, validateProblems } from "./vocab.js";

// ファイルの分け方とは関係なく、FIELDS の並び(学習順)で出題する。
// sort は安定なので、同じ分野の中はファイルに書いた順のまま。
const FIELD_ORDER = Object.fromEntries(FIELDS.map((f, i) => [f.id, i]));

export const ORAL_PROBLEMS = [
  ...expressions,
  ...real,
  ...quadratic,
  ...equations,
  ...trig,
  ...trigeq,
  ...data,
].sort((a, b) => (FIELD_ORDER[a.field] ?? Infinity) - (FIELD_ORDER[b.field] ?? Infinity));

export const ADVANCED_COUNT = ORAL_PROBLEMS.filter((p) => p.advanced).length;

if (import.meta.env?.DEV) {
  const errors = validateProblems(ORAL_PROBLEMS);
  if (errors.length) {
    // 語彙外の分類・第一手や問題数のずれは、気づかないまま増えると
    // 「言い方を統一する」というドリルの目的が崩れるので開発中に必ず出す
    console.error("[口頭試問ドリル] 問題データの不整合:\n" + errors.join("\n"));
  }
}

export { FIELDS, FIELD_LABEL } from "./vocab.js";
