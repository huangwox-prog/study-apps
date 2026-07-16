// 採点ロジック(選択式・数式入力・グラフ)
import { gradeExpression, REASON_MESSAGES } from "./expression.js";

// 1問を採点する。answerInput の形式は問題タイプによって異なる:
//  choice: 選択肢 index / input: 式文字列 / graph: {vertex:[x,y], dir:1|-1}
export function gradeQuestion(question, answerInput) {
  switch (question.type) {
    case "choice": {
      const correct = answerInput === question.answer;
      return { correct, message: "" };
    }
    case "input": {
      const result = gradeExpression(
        answerInput,
        question.answer,
        question.mode || "free"
      );
      return {
        correct: result.correct,
        message: result.correct ? "" : REASON_MESSAGES[result.reason] || "",
      };
    }
    case "graph": {
      const { vertex, dir } = answerInput || {};
      const correct =
        Array.isArray(vertex) &&
        vertex[0] === question.vertex[0] &&
        vertex[1] === question.vertex[1] &&
        dir === question.dir;
      return { correct, message: "" };
    }
    default:
      return { correct: false, message: "" };
  }
}

// 複数問の結果集計
export function tallyResults(results) {
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  return { total, correct, ratio: total ? correct / total : 0 };
}
