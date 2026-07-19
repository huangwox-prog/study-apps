// 手動テーマ切り替え(ライト/ダーク)
// 前回選択の保存・OS設定への自動追従は行わない。常にライトモードから開始し、
// トグルボタンを押した場合のみ、その場でダークモードに切り替わる。

// documentのルート要素にdata-theme属性を反映する
export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}
