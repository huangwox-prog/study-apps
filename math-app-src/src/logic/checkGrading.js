// 単元確認テスト専用の採点ロジック
// 記述式の解答(数式・座標・場合分け)を、表記ゆれを吸収したうえで採点する。
import { isEquivalent } from "./expression.js";

// 全角英数記号(！-～)を半角に変換
const FULLWIDTH_RE = /[！-～]/g;

export function normalizeAnswer(raw) {
  let s = String(raw ?? "");
  s = s.replace(FULLWIDTH_RE, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));
  s = s.replace(/[　\s]/g, ""); // 全角/半角スペースを除去
  s = s.replace(/[−―‐‑–—ー]/g, "-"); // 各種マイナス記号を統一
  s = s.replace(/×/g, "*").replace(/÷/g, "/");
  s = s.replace(/²/g, "^2").replace(/³/g, "^3");
  s = s.replace(/、/g, ",").replace(/。/g, "");
  return s.toLowerCase();
}

function stripYPrefix(s) {
  return s.startsWith("y=") ? s.slice(2) : s;
}

function extractNumbers(s) {
  const matches = s.match(/-?\d+\.\d+|-?\d+/g) || [];
  return matches.map(Number);
}

// 1問を採点する。question.answerType: "expr" | "nums" | "piecewise" | "vertex"
export function gradeCheckAnswer(question, rawInput) {
  // vertex: rawInputは { x, y } の2つの数値欄
  if (question.answerType === "vertex") {
    const { x, y } = rawInput || {};
    const nx = extractNumbers(normalizeAnswer(x))[0];
    const ny = extractNumbers(normalizeAnswer(y))[0];
    if (nx === undefined || ny === undefined) return { correct: false };
    const [ex, ey] = question.answer;
    return { correct: Math.abs(nx - ex) < 1e-6 && Math.abs(ny - ey) < 1e-6 };
  }

  const s = normalizeAnswer(rawInput);
  if (!s) return { correct: false };

  if (question.answerType === "expr") {
    const student = stripYPrefix(s);
    try {
      return { correct: isEquivalent(student, question.answer) };
    } catch {
      return { correct: false };
    }
  }

  if (question.answerType === "nums") {
    const nums = extractNumbers(s);
    const expected = question.answer;
    if (nums.length !== expected.length) return { correct: false };
    const ok = nums.every((n, i) => Math.abs(n - expected[i]) < 1e-6);
    return { correct: ok };
  }

  if (question.answerType === "piecewise") {
    const parts = s.split(";").map((p) => p.trim()).filter(Boolean);
    const expected = question.answer;
    if (parts.length !== expected.length) return { correct: false };
    for (let i = 0; i < parts.length; i++) {
      let ok;
      try {
        ok = isEquivalent(parts[i], expected[i]);
      } catch {
        ok = false;
      }
      if (!ok) return { correct: false };
    }
    return { correct: true };
  }

  return { correct: false };
}
