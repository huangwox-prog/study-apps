// 軽量な数式レンダリング
// 文字列中のバッククォート `…` 内を数式として整形する。
// 数式マークアップ: x^2 / x^{10} / sqrt(...) / frac(分子,分母)
import React from "react";

let keyCounter = 0;
const k = () => `m${keyCounter++}`;

// 対応するカッコを探す(開きカッコの次の位置から)
function findClose(s, start) {
  let depth = 1;
  for (let i = start; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

// frac(a,b) の区切りカンマを探す(ネスト対応)
function splitTopComma(s) {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") depth--;
    else if (s[i] === "," && depth === 0) return i;
  }
  return -1;
}

function renderMath(src) {
  const out = [];
  let i = 0;
  let buf = "";
  const flush = () => {
    if (buf) {
      out.push(<span key={k()}>{buf}</span>);
      buf = "";
    }
  };
  while (i < src.length) {
    if (src.startsWith("sqrt(", i)) {
      flush();
      const close = findClose(src, i + 5);
      const inner = src.slice(i + 5, close < 0 ? src.length : close);
      out.push(
        <span className="sqrt" key={k()}>
          {"√"}
          <span className="radicand">{renderMath(inner)}</span>
        </span>
      );
      i = close < 0 ? src.length : close + 1;
    } else if (src.startsWith("frac(", i)) {
      flush();
      const close = findClose(src, i + 5);
      const inner = src.slice(i + 5, close < 0 ? src.length : close);
      const comma = splitTopComma(inner);
      const num = comma < 0 ? inner : inner.slice(0, comma);
      const den = comma < 0 ? "" : inner.slice(comma + 1);
      out.push(
        <span className="frac" key={k()}>
          <span className="num">{renderMath(num)}</span>
          <span className="den">{renderMath(den)}</span>
        </span>
      );
      i = close < 0 ? src.length : close + 1;
    } else if (src[i] === "^") {
      flush();
      let exp;
      if (src[i + 1] === "{") {
        const end = src.indexOf("}", i + 2);
        exp = src.slice(i + 2, end < 0 ? src.length : end);
        i = end < 0 ? src.length : end + 1;
      } else {
        // ^ の直後の連続する数字/文字/マイナスを指数とする
        let j = i + 1;
        if (src[j] === "-") j++;
        while (j < src.length && /[0-9a-zA-Z]/.test(src[j])) j++;
        exp = src.slice(i + 1, j);
        i = j;
      }
      out.push(<sup key={k()}>{renderMath(exp)}</sup>);
    } else {
      buf += src[i];
      i++;
    }
  }
  flush();
  return out;
}

// text: バッククォート区切りの混在テキスト
export default function MathText({ text, block = false }) {
  if (text == null) return null;
  const parts = String(text).split("`");
  const nodes = parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <span className="math" key={idx}>
        {renderMath(part)}
      </span>
    ) : (
      <React.Fragment key={idx}>{part}</React.Fragment>
    )
  );
  return block ? <div>{nodes}</div> : <span>{nodes}</span>;
}
