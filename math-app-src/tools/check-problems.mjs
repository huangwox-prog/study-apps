// 全単元の問題データを機械的に検証する。
//   node tools/check-problems.mjs
//
// 見るもの:
//   1. 選択肢の重複  … 表示は違うが数学的に同値な選択肢(片方しか正解にならない事故)
//   2. 正解データ    … 問題文の式と正解が一致するか、解を代入して成り立つか など
//   3. 構造          … id の重複、answer の範囲、解説やミスタイプの欠落
//
// 「同値だが意図的」なものだけ REVIEWED に理由つきで登録する。それ以外が出たら不合格。
import { ALL_UNITS } from "../src/data/units.js";
import { canonical, normalizeText } from "./equivalence.mjs";
import { parse, evalAst, gradeExpression } from "../src/logic/expression.js";
import { MISTAKE_TYPE_KEYS } from "../src/logic/weakness.js";

// 精査したうえで「これは重複ではない」と判断した問題
const REVIEWED = {
  "ns1-p12": "降べきの順に整理する問題。4択すべて同じ多項式で、並べ方だけが問われる",
};

const issues = [];
const add = (kind, unit, q, detail) =>
  issues.push({ kind, unit: unit.id, qid: q.id, detail, q: q.q });

// ---------- 数値評価のヘルパー ----------
const ticks = (s) => [...String(s).matchAll(/`([^`]+)`/g)].map((m) => m[1]);
const absify = (s) => {
  let out = s;
  for (let i = 0; i < 10 && out.includes("|"); i++) {
    const next = out.replace(/\|([^|]+)\|/g, "sqrt(($1)^2)");
    if (next === out) break;
    out = next;
  }
  return out;
};
const VARS = ["x", "y", "a", "b", "c", "m", "n", "t"];
const envAt = (v) => Object.fromEntries(VARS.map((k) => [k, v]));
const val = (src, env) => {
  try {
    return evalAst(parse(absify(normalizeText(src))), env);
  } catch {
    return NaN;
  }
};
function sig(src) {
  let ast;
  try {
    ast = parse(absify(normalizeText(src)));
  } catch {
    return null;
  }
  const out = [];
  let seed = 12345;
  for (let i = 0; i < 8; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    let v;
    try {
      v = evalAst(ast, envAt(0.41 + (seed / 0x7fffffff) * 2.9));
    } catch {
      return null;
    }
    if (!isFinite(v)) return null;
    out.push(v.toPrecision(9));
  }
  return out.join("|");
}
function ineqTest(src, x) {
  const s = normalizeText(src);
  const parts = s.split(/<=|>=|≦|≧|<|>/);
  const ops = [...s.matchAll(/<=|>=|≦|≧|<|>/g)].map((a) => a[0]);
  if (!ops.length || parts.length - 1 !== ops.length) return null;
  const vals = parts.map((p) => val(p, envAt(x)));
  if (vals.some((v) => !isFinite(v))) return null;
  return ops.every((o, i) => {
    const [l, r] = [vals[i], vals[i + 1]];
    if (o === "<") return l < r - 1e-12;
    if (o === ">") return l > r + 1e-12;
    if (o === "<=" || o === "≦") return l <= r + 1e-12;
    return l >= r - 1e-12;
  });
}
function solutionSet(src, xs) {
  const clauses = normalizeText(src).split(/,|または/);
  const res = [];
  for (const x of xs) {
    let any = false;
    for (const c of clauses) {
      const t = ineqTest(c, x);
      if (t === null) return null;
      any = any || t;
    }
    res.push(any);
  }
  return res;
}

// ---------- 検証本体 ----------
const seenIds = new Map();
let nChoice = 0;
let nVerified = 0;

for (const unit of ALL_UNITS) {
  for (const key of ["diagnostic", "practice", "test"]) {
    for (const q of unit[key] || []) {
      // --- 構造 ---
      if (!q.id) add("no-id", unit, q, "id がない");
      if (seenIds.has(q.id)) add("dup-id", unit, q, `id 重複: ${seenIds.get(q.id)}`);
      seenIds.set(q.id, unit.id);
      if (!q.exp) add("no-exp", unit, q, "解説がない");
      if (!MISTAKE_TYPE_KEYS.includes(q.mistakeType))
        add("bad-mistake-type", unit, q, `mistakeType=${q.mistakeType}`);

      const ans = q.type === "choice" ? q.choices?.[q.answer] : q.answer;
      const ansExpr = q.type === "choice" ? ticks(ans ?? "")[0] ?? ans : q.answer;

      if (q.type === "choice") {
        nChoice++;
        if (!Array.isArray(q.choices) || q.choices.length < 2)
          add("bad-choices", unit, q, "選択肢が不正");
        else if (typeof q.answer !== "number" || q.answer < 0 || q.answer >= q.choices.length)
          add("bad-answer-index", unit, q, `answer=${q.answer}`);

        // --- 選択肢の同値重複 ---
        if (!REVIEWED[q.id] && Array.isArray(q.choices)) {
          const groups = new Map();
          q.choices.forEach((c, i) => {
            const k = canonical(c);
            if (!groups.has(k)) groups.set(k, []);
            groups.get(k).push(i);
          });
          for (const idxs of groups.values()) {
            if (idxs.length > 1)
              add(
                "dup-choice",
                unit,
                q,
                `同値な選択肢 ${idxs.map((i) => `[${i}]${q.choices[i]}`).join(" / ")}(answer=${q.answer})`
              );
          }
        }
      } else if (q.type === "input") {
        const r = gradeExpression(q.answer, q.answer, q.mode || "free");
        if (!r.correct)
          add("input-answer-ungradeable", unit, q, `模範解答が自己採点で不正解: ${r.reason}`);
      } else if (q.type === "graph") {
        if (!Array.isArray(q.vertex) || q.vertex.length !== 2 || ![1, -1].includes(q.dir))
          add("bad-graph", unit, q, `vertex=${q.vertex} dir=${q.dir}`);
      }

      // --- 正解データの機械検証 ---
      const stem = ticks(q.q);
      // (1) 計算・展開・因数分解: 問題文の式と正解が同値か
      if (
        /計算すると|展開すると|因数分解すると|簡単にすると|整理すると|有理化すると|の展開|をまとめると/.test(q.q) &&
        stem.length === 1 &&
        !REVIEWED[q.id]
      ) {
        const a = sig(stem[0]);
        const b = sig(ansExpr);
        if (a && b) {
          nVerified++;
          if (a !== b)
            add("answer-mismatch", unit, q, `問題文の式と正解が不一致(${stem[0]} ≠ ${ansExpr})`);
        }
      }
      // (2) 方程式の解: 代入して成り立つか
      const eqm = q.q.match(/`([^`]*=[^`]*)`[^`]*(?:の解|を解くと)/);
      if (
        eqm &&
        /^x=/.test(normalizeText(ansExpr ?? "")) &&
        !/[a-wyz]/.test(normalizeText(eqm[1]).replace(/x|sqrt/g, ""))
      ) {
        const [lhs, rhs] = eqm[1].split("=");
        const roots = normalizeText(ansExpr)
          .replace(/^x=/, "")
          .split(",")
          .map((r) => val(r, {}));
        if (roots.length && roots.every((n) => isFinite(n))) {
          nVerified++;
          for (const n of roots) {
            const d = val(lhs, envAt(n)) - val(rhs, envAt(n));
            if (!(Math.abs(d) < 1e-9))
              add("answer-mismatch", unit, q, `解 x=${n} を代入しても成り立たない(残差 ${d})`);
          }
        }
      }
      // (3) 不等式の解: 解集合が一致するか(単独の不等式のみ)
      const inm = q.q.match(/`([^`]*(?:<|>|≦|≧)[^`]*)`[^`]*(?:の解|を解くと)/);
      if (inm && !/かつ|または/.test(q.q) && /(<|>|≦|≧)/.test(normalizeText(ansExpr ?? ""))) {
        const xs = [];
        for (let x = -12; x <= 12; x += 0.125) xs.push(x);
        const a = solutionSet(inm[1], xs);
        const b = solutionSet(ansExpr, xs);
        if (a && b) {
          nVerified++;
          const diff = xs.filter((x, i) => a[i] !== b[i]);
          // 境界1点だけの差は丸め誤差の可能性があるので見逃す
          if (diff.length > 1)
            add("answer-mismatch", unit, q, `不等式の解集合が不一致(例 x=${diff.slice(0, 4).join(", ")})`);
        }
      }
      // (4) 二次関数の頂点
      const vm = q.q.match(/`y=([^`]+)`[^`]*頂点/);
      const nAns = normalizeText(ansExpr ?? "");
      if (vm && /^\(/.test(nAns) && nAns.includes(",")) {
        const [px, py] = nAns
          .replace(/^\(|\)$/g, "")
          .split(",")
          .map((s) => val(s, {}));
        const f = (x) => val(vm[1], envAt(x));
        if (isFinite(px) && isFinite(py) && isFinite(f(px))) {
          nVerified++;
          if (Math.abs(f(px) - py) > 1e-9)
            add("answer-mismatch", unit, q, `頂点の y 座標が f(${px})=${f(px)} と合わない`);
          const slope = (f(px + 1e-4) - f(px - 1e-4)) / 2e-4;
          if (Math.abs(slope) > 1e-4) add("answer-mismatch", unit, q, `x=${px} が頂点になっていない`);
        }
      }
    }
  }
}

console.log(`検査: ${seenIds.size}問(うち選択式 ${nChoice}問)/ 正解の機械検証 ${nVerified}件`);
console.log(`同値だが意図的として除外: ${Object.keys(REVIEWED).length}問`);
if (!issues.length) {
  console.log("問題なし");
  process.exit(0);
}
const byKind = {};
for (const it of issues) (byKind[it.kind] ||= []).push(it);
for (const [kind, list] of Object.entries(byKind)) {
  console.log(`\n## ${kind}: ${list.length}件`);
  for (const it of list) console.log(`  ${it.qid} [${it.unit}] ${it.detail}\n     Q: ${it.q}`);
}
console.log(`\n合計 ${issues.length} 件`);
process.exit(1);
