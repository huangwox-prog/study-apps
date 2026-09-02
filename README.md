# study-apps

生成AI(Claude)と対話しながら自作している、自分専用の学習アプリ集です。

**→ [アプリ目次ページ](https://huangwox-prog.github.io/study-apps/)**(学習用。このページはソースコードの保管場所です)

## 収録アプリ

| アプリ | 説明 | リンク |
|---|---|---|
| ★ 数学Ⅰ 総合学習アプリ | 数と式・二次関数・三角比を統合。グラフ描画・模試生成・習熟度管理つき | [開く](https://huangwox-prog.github.io/study-apps/math-app/) |
| ★ 基本情報技術者試験 科目B 模擬試験 | 本番仕様の模擬試験(全13セット)。アルゴリズム・セキュリティを幅広く収録 | [開く](https://huangwox-prog.github.io/study-apps/fe-app/) |
| 二次関数 実戦攻略 | 平方完成・最大最小など二次関数の実戦演習 | [開く](https://huangwox-prog.github.io/study-apps/nijikansu-jissen.html) |
| 数Ⅰ特訓帳 | 数と式・集合と命題 全31テーマ93問。復習機能つき | [開く](https://huangwox-prog.github.io/study-apps/sugaku1-tokkun.html) |
| 有理化道場 | ルートの有理化を基礎から段階的に練習 | [開く](https://huangwox-prog.github.io/study-apps/yurika-dojo.html) |
| 一次不等式特訓 | 負の数で割る際の不等号の向きを重点練習 | [開く](https://huangwox-prog.github.io/study-apps/ichiji-futoshiki.html) |
| 絶対値特訓 | 絶対値を含む方程式・不等式の場合分け練習 | [開く](https://huangwox-prog.github.io/study-apps/zettaichi.html) |
| ポモドーロタイマー | 作業25分・休憩5分/15分。集中セッションを自動記録 | [開く](https://huangwox-prog.github.io/study-apps/pomodoro/) |

目次ページでは、力を入れている2アプリ(数学Ⅰ・FE科目B)だけを紹介しています。上の表にある単発アプリは目次からは辿れませんが、リンクから直接開けます。

## 技術スタック

- React + Vite(★の2アプリ。ソースは `math-app-src/`・`fe-app-src/`)
- Vanilla HTML / CSS / JavaScript(その他の単発アプリ)
- GitHub Pages でホスティング

## 制作について

単元・出題形式・採点方法を自分で決めて生成AIに指示し、実際に解いて検証・修正を繰り返して仕上げています。
