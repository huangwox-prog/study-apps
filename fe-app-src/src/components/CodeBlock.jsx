// 疑似言語プログラムの等幅フォント表示
import React from "react";

export default function CodeBlock({ code }) {
  if (!code) return null;
  return <pre className="code-block">{code}</pre>;
}
