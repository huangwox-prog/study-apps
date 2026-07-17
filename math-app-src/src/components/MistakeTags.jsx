// 間違えた問題に付けるミスタイプのタグチップ
// 初期値は問題データの mistakeType。タップで付け替えると保存される。
import React, { useState } from "react";
import { MISTAKE_TYPES, MISTAKE_TYPE_KEYS } from "../logic/weakness.js";
import { retagMistake } from "../logic/storage.js";

export default function MistakeTags({ qid, initialType }) {
  const [selected, setSelected] = useState(initialType);

  const pick = (type) => {
    setSelected(type);
    retagMistake(qid, type);
  };

  return (
    <div style={{ marginTop: 10 }}>
      <span className="text-tertiary" style={{ display: "block", marginBottom: 6 }}>
        ミスの種類(タップで変更できるよ)
      </span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {MISTAKE_TYPE_KEYS.map((type) => (
          <button
            key={type}
            className="badge"
            onClick={() => pick(type)}
            style={{
              cursor: "pointer",
              ...(selected === type
                ? {
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    border: "1px solid var(--accent)",
                  }
                : {}),
            }}
          >
            {MISTAKE_TYPES[type]}
          </button>
        ))}
      </div>
    </div>
  );
}
