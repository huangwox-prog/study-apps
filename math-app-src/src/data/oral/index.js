// 口頭試問ドリルの問題データ(全164問)
//
// 1問のフィールド:
//   id / field(分野) / category(分類) / firstMove(第一手)
//   q(問題文) / a(解答) / solution(解説・2〜4行)
//   advanced(応用フラグ。場合分け問題と三角比の対称式に付く。設定でオンオフする)
// 数式はすべて LaTeX。文字列中の $…$ が数式として組まれる。
import expressions from "./expressions.js";
import quadratic from "./quadratic.js";
import equations from "./equations.js";
import trig from "./trig.js";
import { validateProblems } from "./vocab.js";

export const ORAL_PROBLEMS = [...expressions, ...quadratic, ...equations, ...trig];

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
