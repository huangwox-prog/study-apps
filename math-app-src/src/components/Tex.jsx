// KaTeX による数式レンダリング
// 分数と根号が重なる式は Unicode では潰れて読めないため、口頭試問ドリルの
// 問題文・解答・解説はすべてこのコンポーネント経由で組む。
//
// データ側の書式: 日本語まじりの文字列の中で、数式部分を $…$ で囲む。
//   例: "$0 \\leqq x \\leqq 3$ における $y = x^2 - 2x$ の最大値を求めよ。"
// $$…$$ で囲むとディスプレイ数式(中央寄せ・大きめ)になる。
import React, { useMemo } from "react";
import katex from "katex";

// KaTeX の CSS はここで1回だけ読み込む(読み込み忘れると記号がずれる)
import "katex/dist/katex.min.css";

function render(latex, displayMode) {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
      // 全角文字を \text{} なしでもそのまま流せるようにする
      trust: false,
      output: "html",
    });
  } catch {
    // renderToString は throwOnError:false でもパース以外の理由で落ちうるので保険
    return null;
  }
}

// 単一の LaTeX 式を描画する
export function Tex({ latex, block = false, className = "" }) {
  const html = useMemo(() => render(String(latex ?? ""), block), [latex, block]);
  if (html == null) {
    return <span className={className}>{String(latex ?? "")}</span>;
  }
  const Tag = block ? "div" : "span";
  return (
    <Tag
      className={`tex ${block ? "tex-block" : ""} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// $…$ / $$…$$ を含む日本語まじりテキストを描画する
export default function TexText({ text, className = "", as: Tag = "span" }) {
  const nodes = useMemo(() => {
    const src = String(text ?? "");
    const out = [];
    let i = 0;
    let key = 0;
    while (i < src.length) {
      const start = src.indexOf("$", i);
      if (start < 0) {
        out.push(src.slice(i));
        break;
      }
      if (start > i) out.push(src.slice(i, start));
      const display = src.startsWith("$$", start);
      const delim = display ? "$$" : "$";
      const end = src.indexOf(delim, start + delim.length);
      if (end < 0) {
        // 閉じ忘れはそのまま素のテキストとして出す
        out.push(src.slice(start));
        break;
      }
      const latex = src.slice(start + delim.length, end);
      out.push(<Tex key={`t${key++}`} latex={latex} block={display} />);
      i = end + delim.length;
    }
    return out;
  }, [text]);

  return (
    <Tag className={className}>
      {nodes.map((n, idx) =>
        typeof n === "string" ? <React.Fragment key={`s${idx}`}>{n}</React.Fragment> : n
      )}
    </Tag>
  );
}
