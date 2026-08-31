// 選択肢の「実質的に同じ答え」を見つけるための同値判定ヘルパー。
// 表示文字列ではなく、数式として数値評価した結果で比べる。
//   例) -x+9y と 9y-x / 2/4 と 1/2 / 0.5 と frac(1,2) / sqrt(48) と 4sqrt(3)
// 数式として読めない選択肢(日本語まじり)は、不等号・カンマで区切って
// 読める部分だけ数値化し、残りは文字列として比べる。
import { parse, evalAst } from "../src/logic/expression.js";

export const stripTicks = (s) => String(s).replace(/`/g, "");

// 全角→半角、記号ゆれの吸収
export function normalizeText(s) {
  return stripTicks(s)
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[×・∗＊]/g, "*")
    .replace(/[÷]/g, "/")
    .replace(/[−–—ー]/g, "-")
    .replace(/[（]/g, "(").replace(/[）]/g, ")")
    .replace(/[＝]/g, "=")
    .replace(/[，]/g, ",")
    .replace(/\left|\right/g, "")
    .replace(/\s+/g, "");
}


// frac(a,b) -> ((a)/(b)) に展開する(トップレベルのカンマで分割)
export function expandFrac(src) {
  let s = src;
  for (let guard = 0; guard < 20; guard++) {
    const i = s.lastIndexOf("frac(");
    if (i < 0) break;
    let depth = 0, comma = -1, end = -1;
    for (let j = i + 4; j < s.length; j++) {
      const ch = s[j];
      if (ch === "(") depth++;
      else if (ch === ")") { depth--; if (depth === 0) { end = j; break; } }
      else if (ch === "," && depth === 1) comma = j;
    }
    if (end < 0 || comma < 0) break;
    const a = s.slice(i + 5, comma), b = s.slice(comma + 1, end);
    s = s.slice(0, i) + `((${a})/(${b}))` + s.slice(end + 1);
  }
  return s;
}

// |A| -> sqrt((A)^2)
export function expandAbs(src) {
  let s = src;
  for (let guard = 0; guard < 10 && s.includes("|"); guard++) {
    const t = s.replace(/\|([^|]+)\|/g, "sqrt(($1)^2)");
    if (t === s) break;
    s = t;
  }
  return s;
}

// 数値シグネチャ: 決定的なサンプル点で評価した結果の列
const SAMPLES = 8;
function sampler() {
  let seed = 20240917;
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}
export function signature(src) {
  let ast;
  try {
    ast = parse(src);
  } catch {
    return null;
  }
  const vars = [];
  (function walk(n) {
    if (!n || typeof n !== "object") return;
    if (n.t === "var" && !vars.includes(n.v)) vars.push(n.v);
    for (const k of ["l", "r", "v"]) if (n[k] && typeof n[k] === "object") walk(n[k]);
  })(ast);
  const rand = sampler();
  const out = [];
  for (let i = 0; i < SAMPLES; i++) {
    const env = {};
    for (const v of ["x", "y", "a", "b", "c", "m", "n", "t"]) env[v] = 0.37 + rand() * 3.1;
    let val;
    try {
      val = evalAst(ast, env);
    } catch {
      return null;
    }
    if (!isFinite(val)) return null;
    out.push(val.toPrecision(9));
  }
  // 変数を含まない式は値そのもの、含む式は評価列
  return (vars.length ? "f:" : "c:") + out.join("|");
}

export function evalConst(src) {
  try {
    const v = evalAst(parse(src), {});
    return isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

const CMP = ["<=", ">=", "≦", "≧", "<", ">", "=", "≠"];
const FLIP = { "<": ">", ">": "<", "<=": ">=", ">=": "<=", "≦": "≧", "≧": "≦", "=": "=", "≠": "≠" };
const CMPNORM = { "≦": "<=", "≧": ">=" };

// 選択肢の正準形。数式部分は数値シグネチャに置き換え、
// 不等号の向き・項の順序・約分などの表記ゆれを吸収する。
export function canonical(raw) {
  let s = expandAbs(expandFrac(normalizeText(raw)));
  // ±A は「A, -A」の解の組として扱う
  s = s.replace(/±([0-9a-z.]+|\([^()]*\))/g, "$1,-$1");
  // 「かつ」「または」「,」で分割される複合条件
  const parts = s.split(/(かつ|または|,)/);
  if (parts.length > 1) {
    const chunks = [];
    let sep = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) chunks.push(canonical(parts[i]));
      else sep.push(parts[i] === "," ? "," : parts[i]);
    }
    // 座標 (a, b) のような組は順序が意味を持つので並べ替えない
    const ordered = /^\(.*\)$/.test(s);
    if (ordered) return chunks.join("&") + "#" + sep.join("");
    // 解の集合や「かつ/または」は順序を問わないので並べ替えて比較
    return chunks.slice().sort().join("&") + "#" + sep.slice().sort().join("");
  }
  for (const op of CMP) {
    const idx = s.indexOf(op);
    if (idx > 0 && idx < s.length - op.length) {
      let l = s.slice(0, idx);
      let r = s.slice(idx + op.length);
      let o = CMPNORM[op] || op;
      // 常に「短い側(変数側)を左」に寄せて向きをそろえる
      if (l > r) {
        [l, r] = [r, l];
        o = CMPNORM[FLIP[op]] || FLIP[op];
      }
      return `${canonical(l)}${o}${canonical(r)}`;
    }
  }
  const sig = signature(s);
  if (sig) return sig;
  return "s:" + s;
}
