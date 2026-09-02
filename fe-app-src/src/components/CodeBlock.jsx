// 疑似言語プログラムの表示。端末の画面に見立てて走査線を敷く。
import React from "react";

export default function CodeBlock({ code }) {
  if (!code) return null;
  return <pre className="code-block">{code}</pre>;
}
