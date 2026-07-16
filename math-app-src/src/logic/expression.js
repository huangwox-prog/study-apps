// 数式パーサーと同値判定エンジン
// 学生の入力(例 "(x+2)(x+3)")と模範解答を、複数のランダム代入点で
// 数値評価して比較する。因数分解/展開の「形」チェックもここで行う。

const VARS = ["x", "y", "a", "b", "c", "m", "n", "t"];

// ---------- トークナイザ ----------
export function tokenize(src) {
  const tokens = [];
  let i = 0;
  const s = src.replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
  while (i < s.length) {
    const ch = s[i];
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      tokens.push({ t: "num", v: parseFloat(s.slice(i, j)) });
      i = j;
    } else if (VARS.includes(ch)) {
      tokens.push({ t: "var", v: ch });
      i++;
    } else if (ch === "√") {
      tokens.push({ t: "sqrt" });
      i++;
    } else if (s.startsWith("sqrt", i)) {
      tokens.push({ t: "sqrt" });
      i += 4;
    } else if ("+-*/^()".includes(ch)) {
      tokens.push({ t: ch });
      i++;
    } else if (ch === "²") {
      tokens.push({ t: "^" }, { t: "num", v: 2 });
      i++;
    } else if (ch === "³") {
      tokens.push({ t: "^" }, { t: "num", v: 3 });
      i++;
    } else {
      throw new Error(`不明な文字: ${ch}`);
    }
  }
  return tokens;
}

// ---------- パーサー(再帰下降・暗黙の乗算対応) ----------
// expr    := term (('+'|'-') term)*
// term    := unary (('*'|'/') unary | 暗黙乗算 unary)*
// unary   := '-' unary | power
// power   := atom ('^' unary)?
// atom    := num | var | '(' expr ')' | sqrt atom
export function parse(src) {
  const tokens = tokenize(src);
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function parseExpr() {
    let node = parseTerm();
    while (peek() && (peek().t === "+" || peek().t === "-")) {
      const op = next().t;
      const right = parseTerm();
      node = { t: op === "+" ? "add" : "sub", l: node, r: right };
    }
    return node;
  }

  function startsFactor(tok) {
    return tok && (tok.t === "num" || tok.t === "var" || tok.t === "(" || tok.t === "sqrt");
  }

  function parseTerm() {
    let node = parseUnary();
    while (peek()) {
      if (peek().t === "*" || peek().t === "/") {
        const op = next().t;
        const right = parseUnary();
        node = { t: op === "*" ? "mul" : "div", l: node, r: right };
      } else if (startsFactor(peek())) {
        // 暗黙の乗算: 2x, x(x+1), (x+1)(x+2), 2√3
        const right = parseUnary();
        node = { t: "mul", l: node, r: right, implicit: true };
      } else break;
    }
    return node;
  }

  function parseUnary() {
    if (peek() && peek().t === "-") {
      next();
      return { t: "neg", v: parseUnary() };
    }
    if (peek() && peek().t === "+") {
      next();
      return parseUnary();
    }
    return parsePower();
  }

  function parsePower() {
    let base = parseAtom();
    if (peek() && peek().t === "^") {
      next();
      const exp = parseUnary();
      base = { t: "pow", l: base, r: exp };
    }
    return base;
  }

  function parseAtom() {
    const tok = peek();
    if (!tok) throw new Error("式が途中で終わっています");
    if (tok.t === "num") { next(); return { t: "num", v: tok.v }; }
    if (tok.t === "var") { next(); return { t: "var", v: tok.v }; }
    if (tok.t === "sqrt") {
      next();
      let arg;
      if (peek() && peek().t === "(") {
        next();
        arg = parseExpr();
        if (!peek() || peek().t !== ")") throw new Error("カッコが閉じていません");
        next();
      } else {
        // √3, √x のような単項
        const t2 = peek();
        if (!t2 || (t2.t !== "num" && t2.t !== "var")) throw new Error("√の中身がありません");
        next();
        arg = t2.t === "num" ? { t: "num", v: t2.v } : { t: "var", v: t2.v };
      }
      return { t: "sqrt", v: arg };
    }
    if (tok.t === "(") {
      next();
      const inner = parseExpr();
      if (!peek() || peek().t !== ")") throw new Error("カッコが閉じていません");
      next();
      return { t: "paren", v: inner };
    }
    throw new Error("式の形が正しくありません");
  }

  const ast = parseExpr();
  if (pos < tokens.length) throw new Error("式の形が正しくありません");
  return ast;
}

// ---------- 数値評価 ----------
export function evalAst(node, env) {
  switch (node.t) {
    case "num": return node.v;
    case "var": {
      if (!(node.v in env)) throw new Error(`未対応の文字: ${node.v}`);
      return env[node.v];
    }
    case "add": return evalAst(node.l, env) + evalAst(node.r, env);
    case "sub": return evalAst(node.l, env) - evalAst(node.r, env);
    case "mul": return evalAst(node.l, env) * evalAst(node.r, env);
    case "div": return evalAst(node.l, env) / evalAst(node.r, env);
    case "pow": return Math.pow(evalAst(node.l, env), evalAst(node.r, env));
    case "neg": return -evalAst(node.v, env);
    case "sqrt": return Math.sqrt(evalAst(node.v, env));
    case "paren": return evalAst(node.v, env);
    default: throw new Error("不明なノード");
  }
}

function collectVars(node, set = new Set()) {
  if (!node || typeof node !== "object") return set;
  if (node.t === "var") set.add(node.v);
  for (const key of ["l", "r", "v"]) {
    if (node[key] && typeof node[key] === "object") collectVars(node[key], set);
  }
  return set;
}

// ---------- 同値判定 ----------
// 複数のランダム代入点で両式を評価して一致すれば同値とみなす。
// √を含む式でも定義域内(正の値)で比較できるよう、正の乱数を使う。
export function isEquivalent(studentSrc, answerSrc, samples = 10) {
  let sAst, aAst;
  try {
    sAst = parse(studentSrc);
    aAst = parse(answerSrc);
  } catch {
    return false;
  }
  const vars = new Set([...collectVars(sAst), ...collectVars(aAst)]);
  // 学生の式に模範解答にない文字があれば不正解
  const ansVars = collectVars(aAst);
  for (const v of collectVars(sAst)) {
    if (!ansVars.has(v)) return false;
  }
  let seed = 987654321;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = 0; i < samples; i++) {
    const env = {};
    for (const v of vars) env[v] = 0.5 + rand() * 3.5; // 0.5〜4.0 の正の値
    let sv, av;
    try {
      sv = evalAst(sAst, env);
      av = evalAst(aAst, env);
    } catch {
      return false;
    }
    if (!isFinite(sv) || !isFinite(av)) return false;
    const scale = Math.max(1, Math.abs(av));
    if (Math.abs(sv - av) > 1e-6 * scale) return false;
  }
  return true;
}

// ---------- 形のチェック ----------
function stripNegParen(node) {
  while (node && (node.t === "neg" || node.t === "paren")) {
    node = node.t === "neg" ? node.v : node.v;
  }
  return node;
}

// 因数分解の形か?(トップレベルが和・差になっていない=積や累乗の形)
export function isFactoredForm(src) {
  let ast;
  try {
    ast = parse(src);
  } catch {
    return false;
  }
  const top = stripNegParen(ast);
  if (top.t === "add" || top.t === "sub") return false;
  // 少なくとも1組のカッコ(または累乗)があること
  if (!/[()²³^]/.test(src)) return false;
  return true;
}

// 展開済みの形か?(カッコを含まない)
export function isExpandedForm(src) {
  return !/[()]/.test(src) && !src.includes("sqrt");
}

// ---------- 判定つき採点 ----------
// mode: "factor"(因数分解)| "expand"(展開)| "free"(形は問わない)
export function gradeExpression(studentSrc, answerSrc, mode = "free") {
  if (!studentSrc || !studentSrc.trim()) {
    return { correct: false, reason: "empty" };
  }
  let equivalent;
  try {
    equivalent = isEquivalent(studentSrc, answerSrc);
  } catch {
    return { correct: false, reason: "parse" };
  }
  if (!equivalent) return { correct: false, reason: "value" };

  if (mode === "factor" && !isFactoredForm(studentSrc)) {
    return { correct: false, reason: "not-factored" };
  }
  if (mode === "expand" && !isExpandedForm(studentSrc)) {
    return { correct: false, reason: "not-expanded" };
  }
  return { correct: true };
}

export const REASON_MESSAGES = {
  empty: "式を入力してから「答え合わせ」を押してね。",
  parse: "式の形が読み取れませんでした。カッコの閉じ忘れなどがないか確認してみよう。",
  value: "",
  "not-factored": "値としては合っているけれど、まだ因数分解の形(積の形)になっていないよ。",
  "not-expanded": "値としては合っているけれど、カッコを開いて展開した形で答えよう。",
};
