// FE科目B 模擬試験 第2回
// 問1〜16: メソッド構造・間接参照/リスト構造/実務処理のトレース中心(難易度は問1→16にかけて上昇)
// 問17〜20: 情報セキュリティ(長文シナリオ形式、問17が最難、問20にかけて易化)
export default {
  id: "set2",
  title: "模擬試験 第2回",
  questions: [
    // ============ 問1〜16: メソッド構造/間接参照/リスト構造/実務処理 ============
    {
      id: "s2q1",
      no: 1,
      section: "algo",
      categoryLabel: "メソッド構造(メソッドチェーン)",
      level: 1,
      lead: "メソッドチェーンにより addItem を連続して呼び出せるようにしたい。空欄 a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "クラス Cart は買い物かごを表す。addItem(price) は商品の価格を合計金額に加算するメソッドで、自分自身への参照(この問題では this と表す)を戻り値として返すことで、戻り値に対して続けて addItem を呼び出せるようにしたい。",
      ],
      code:
`クラス Cart
  整数型: total ← 0
  ○Cart: addItem(整数型: price)
    total ← total + price
    return a
  ○整数型: getTotal()
    return total

Cart: c ← Cart()
整数型: result ← c.addItem(300).addItem(450).addItem(120).getTotal()`,
      choices: ["this", "total", "price", "Cart()"],
      answer: 0,
      explanation:
        "addItem が this(自分自身への参照)を返すことで、戻り値に対してさらに .addItem() を呼び出せる(メソッドチェーン)。total や price を返すと、整数値に対して .addItem() を呼ぶことになりエラーとなる。",
    },
    {
      id: "s2q2",
      no: 2,
      section: "algo",
      categoryLabel: "間接参照(添字配列)",
      level: 1,
      lead: "次のプログラムを実行したとき出力される文字列を、出力される順に並べたものを選べ。",
      description: [
        "会員ごとのランク番号が配列 rankCode に格納されており、ランク番号に対応するランク名は配列 rankNames に格納されている。rankNames[rankCode[i]] のように、配列の値を別の配列の添字として使う間接参照によってランク名を求める。",
      ],
      code:
`文字列型の配列: rankNames ← {"ブロンズ", "シルバー", "ゴールド"}
整数型の配列: rankCode ← {2, 1, 3, 2}
整数型: i

for (i を 1 から rankCodeの要素数 まで 1 ずつ増やす)
  出力(rankNames[rankCode[i]])
endfor`,
      choices: [
        "シルバー, ブロンズ, ゴールド, シルバー",
        "ブロンズ, シルバー, ゴールド, シルバー",
        "ゴールド, ブロンズ, シルバー, ブロンズ",
        "シルバー, ゴールド, ブロンズ, シルバー",
      ],
      answer: 0,
      explanation:
        "i=1: rankCode[1]=2 → rankNames[2]=\"シルバー\"。i=2: rankCode[2]=1 → rankNames[1]=\"ブロンズ\"。i=3: rankCode[3]=3 → rankNames[3]=\"ゴールド\"。i=4: rankCode[4]=2 → \"シルバー\"。よって出力順は シルバー, ブロンズ, ゴールド, シルバー。",
    },
    {
      id: "s2q3",
      no: 3,
      section: "algo",
      categoryLabel: "実務処理(重複除去)",
      level: 1,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "問い合わせフォームから送信されたメールアドレスの一覧 emails には、同じアドレスが複数回含まれることがある。プログラムは、重複を取り除いたユニークなメールアドレスの一覧を uniqueEmails に作成する。",
      ],
      code:
`文字列型の配列: emails ← {"a@x.com", "b@x.com", "a@x.com", "c@x.com", "b@x.com"}
文字列型の配列: uniqueEmails ← {}
整数型: i, j
論理型: found

for (i を 1 から emailsの要素数 まで 1 ずつ増やす)
  found ← 偽
  for (j を 1 から uniqueEmailsの要素数 まで 1 ずつ増やす)
    if ( a )
      found ← 真
    endif
  endfor
  if (found が 偽)
    uniqueEmails の末尾に emails[i] を追加する
  endif
endfor`,
      choices: [
        "uniqueEmails[j] が emails[i] と等しい",
        "uniqueEmails[i] が emails[j] と等しい",
        "emails[j] が emails[i] と等しい",
        "uniqueEmails[j] が emails[j] と等しい",
      ],
      answer: 0,
      explanation:
        "既に登録済みのアドレス uniqueEmails[j] の中に、これから追加しようとしている emails[i] と同じものがないかを確認する必要がある。よって `uniqueEmails[j] が emails[i] と等しい` が正しい。",
    },
    {
      id: "s2q4",
      no: 4,
      section: "algo",
      categoryLabel: "メソッド構造(メソッドチェーン応用)",
      level: 2,
      lead: "次のプログラムを実行したとき、sql に格納される文字列を答えよ。",
      description: [
        "クラス QueryBuilder は検索条件を組み立てる。where(cond) は条件を配列 conditions の末尾に追加して自分自身(this)を返し、build() は conditions を \" AND \" で連結した文字列を返す。",
      ],
      code:
`クラス QueryBuilder
  文字列型の配列: conditions ← {}
  ○QueryBuilder: where(文字列型: cond)
    conditions の末尾に cond を追加する
    return this
  ○文字列型: build()
    文字列型: result ← ""
    整数型: i
    for (i を 1 から conditionsの要素数 まで 1 ずつ増やす)
      if (i が 1 と等しい)
        result ← conditions[i]
      else
        result ← result + " AND " + conditions[i]
      endif
    endfor
    return result

QueryBuilder: q ← QueryBuilder()
文字列型: sql ← q.where("age >= 20").where("status = '有効'").build()`,
      choices: [
        "age >= 20 AND status = '有効'",
        "status = '有効' AND age >= 20",
        "age >= 20",
        "age >= 20, status = '有効'",
      ],
      answer: 0,
      explanation:
        "where を2回呼び出すたびに条件が conditions の末尾に追加され、それぞれが this を返すのでメソッドチェーンが成立する。build() は追加順に \" AND \" で連結するので `age >= 20 AND status = '有効'` となる。",
    },
    {
      id: "s2q5",
      no: 5,
      section: "algo",
      categoryLabel: "間接参照(参照渡しと値渡し)",
      level: 2,
      lead: "次のプログラムを実行したとき出力される値を答えよ。",
      description: [
        "整数型の変数は値そのものが渡される(値渡し)のに対し、クラスのインスタンス(オブジェクト)は同じ実体への参照が渡される(参照渡し)。この違いによって、関数内での変更が呼び出し元に反映されるかどうかが変わる。",
      ],
      code:
`クラス Box
  整数型: value

○addOne(整数型: n)
  n ← n + 1

○addOneToBox(Box: b)
  b.value ← b.value + 1

整数型: x ← 5
Box: box ← Box()
box.value ← 5

addOne(x)
addOneToBox(box)

出力(xの文字列 + "," + box.valueの文字列)`,
      choices: ["5,6", "6,6", "5,5", "6,5"],
      answer: 0,
      explanation:
        "addOne(x) は x の値のコピーを引数 n として受け取るため、関数内で n を変更しても呼び出し元の x は変化せず x=5 のまま。一方 addOneToBox(box) は box への参照を引数 b として受け取るため、b.value を変更すると呼び出し元の box.value も変化し 6 になる。よって出力は \"5,6\"。",
    },
    {
      id: "s2q6",
      no: 6,
      section: "algo",
      categoryLabel: "実務処理(CSVパース)",
      level: 2,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "社員データがCSV形式の1行の文字列として渡される。関数 split(str, sep) は、文字列 str を区切り文字 sep で分割した文字列型の配列を返す。プログラムは、社員番号・氏名・部署名の順に格納された行を分解し、それぞれの変数に格納する。",
      ],
      code:
`文字列型: line ← "1001,山田太郎,営業部"
文字列型の配列: fields ← split(line, ",")
文字列型: empId ← fields[1]
文字列型: empName ← fields[ a ]
文字列型: dept ← fields[3]`,
      choices: ["2", "1", "3", "0"],
      answer: 0,
      explanation:
        "line を \",\" で分割すると fields は {\"1001\", \"山田太郎\", \"営業部\"} となる。氏名は2番目の要素なので `fields[2]` が正しい。",
    },
    {
      id: "s2q7",
      no: 7,
      section: "algo",
      categoryLabel: "リスト構造(単方向連結リストの削除)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "手続 deleteNext は、単方向リストにおいて、指定したノード prev の直後のノードをリストから取り除く。クラス Node は、値 val と次の要素への参照 next をもつ。",
      ],
      code:
`クラス Node
  整数型: val
  Node: next ← 未定義の値

○deleteNext(Node: prev)
  Node: target ← prev.next
  prev.next ← a`,
      choices: ["target.next", "target", "prev.next", "prev"],
      answer: 0,
      explanation:
        "prev の直後にあった target を読み飛ばして、target のさらに次のノード(target.next)に prev を直接つなぎ直す必要がある。よって `prev.next ← target.next` が正しい。target を代入してしまうと、削除したいノードがリストに残ってしまう。",
    },
    {
      id: "s2q8",
      no: 8,
      section: "algo",
      categoryLabel: "リスト構造(単方向連結リストのトレース)",
      level: 3,
      lead: "次のプログラムを実行したとき、result に格納される文字列を答えよ。",
      description: [
        "insertHead(n) は、新しいノードを単方向リストの先頭に挿入する手続である。挿入のたびに新しいノードの next を現在の head に向け、その後 head を新しいノードに更新する。",
      ],
      code:
`クラス Node
  文字列型: name
  Node: next ← 未定義の値

Node: head ← 未定義の値

○insertHead(文字列型: n)
  Node: newNode ← Node()
  newNode.name ← n
  newNode.next ← head
  head ← newNode

insertHead("佐藤")
insertHead("鈴木")
insertHead("高橋")

Node: cur ← head
文字列型: result ← ""
while (cur が 未定義の値 でない)
  result ← result + cur.name + " "
  cur ← cur.next
endwhile`,
      choices: ["高橋 鈴木 佐藤 ", "佐藤 鈴木 高橋 ", "鈴木 高橋 佐藤 ", "高橋 佐藤 鈴木 "],
      answer: 0,
      explanation:
        "insertHead は常に先頭に挿入するため、挿入した順とは逆順のリストになる。「佐藤」挿入後: 佐藤。「鈴木」挿入後: 鈴木→佐藤。「高橋」挿入後: 高橋→鈴木→佐藤。先頭から辿ると \"高橋 鈴木 佐藤 \" となる。",
    },
    {
      id: "s2q9",
      no: 9,
      section: "algo",
      categoryLabel: "実務処理(簡易キャッシュ)",
      level: 3,
      lead: "次のプログラムを実行したとき、最終的にcacheKeysに残っているキーを、先頭から順に並べたものを選べ。",
      description: [
        "簡易的なキャッシュの仕組みを、キュー(Queue)を用いて実装する。キャッシュは最大 capacity 件までキーを保持でき、上限に達した状態で新しいキーを追加する場合は、最も古い(先に追加された)キーから削除する。Queue クラスの size() は現在の要素数を返す。",
      ],
      code:
`Queue: cacheKeys ← Queue()
整数型: capacity ← 3

○put(文字列型: key)
  if (cacheKeys.size() が capacity 以上)
    cacheKeys.dequeue()
  endif
  cacheKeys.enqueue(key)

put("A")
put("B")
put("C")
put("D")
put("E")`,
      choices: ["C, D, E", "B, C, D", "A, B, C", "D, E, C"],
      answer: 0,
      explanation:
        "put(A): [A]。put(B): [A,B]。put(C): [A,B,C]。put(D): 上限3件に達しているのでAをdequeueして[B,C]、その後Dをenqueueして[B,C,D]。put(E): Bをdequeueして[C,D]、Eをenqueueして[C,D,E]。よって最終的に残るのは C, D, E。",
    },
    {
      id: "s2q10",
      no: 10,
      section: "algo",
      categoryLabel: "間接参照(添字配列によるランキング表示)",
      level: 3,
      lead: "次のプログラムを実行したとき出力される文字列を、出力される順に並べたものを選べ。",
      description: [
        "テストの得点上位者を表示する処理である。氏名は names、得点は score に、同じ添字で対応して格納されている。表示順は、元のデータを並べ替えず、表示したい順に元データの添字を並べた配列 order を用いた間接参照(names[order[i]])によって求める。",
      ],
      code:
`文字列型の配列: names ← {"田中", "鈴木", "佐藤", "伊藤"}
整数型の配列: score ← {70, 95, 88, 60}
整数型の配列: order ← {2, 3, 1, 4}
整数型: i

for (i を 1 から namesの要素数 まで 1 ずつ増やす)
  出力(names[order[i]] + ":" + score[order[i]]の文字列)
endfor`,
      choices: [
        "鈴木:95, 佐藤:88, 田中:70, 伊藤:60",
        "田中:70, 鈴木:95, 佐藤:88, 伊藤:60",
        "鈴木:95, 田中:70, 佐藤:88, 伊藤:60",
        "伊藤:60, 佐藤:88, 鈴木:95, 田中:70",
      ],
      answer: 0,
      explanation:
        "order[1]=2 → names[2]=\"鈴木\", score[2]=95。order[2]=3 → \"佐藤\":88。order[3]=1 → \"田中\":70。order[4]=4 → \"伊藤\":60。元の配列を並べ替えずに order 配列を介した間接参照で順序を制御している点がポイント。",
    },
    {
      id: "s2q11",
      no: 11,
      section: "algo",
      categoryLabel: "実務処理(ページネーション)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "検索結果一覧を1ページあたり pageSize 件ずつ表示するページネーション処理である。関数 getPageRange は、ページ番号 page(1始まり)と1ページあたりの件数 pageSize、全体件数 totalCount から、表示すべき範囲の開始位置 startIdx(1始まり)と終了位置 endIdx を求めて返す。",
      ],
      code:
`○整数型の配列: getPageRange(整数型: page, 整数型: pageSize, 整数型: totalCount)
  整数型: startIdx ← (page - 1) × pageSize + 1
  整数型: endIdx ← a
  if (endIdx が totalCount より大きい)
    endIdx ← totalCount
  endif
  return {startIdx, endIdx}`,
      choices: [
        "page × pageSize",
        "(page - 1) × pageSize",
        "page × pageSize - 1",
        "startIdx + pageSize",
      ],
      answer: 0,
      explanation:
        "1ページ目(page=1)はstartIdx=1、endIdx=pageSizeでなければならない。`page × pageSize`ならpage=1のときpageSizeとなり正しい。それ以外の選択肢はいずれもズレた値になる(例えば`startIdx + pageSize`はpage×pageSize + 1となり1件多くカウントしてしまう)。",
    },
    {
      id: "s2q12",
      no: 12,
      section: "algo",
      categoryLabel: "リスト構造(単方向連結リストの逆順化)",
      level: 4,
      lead: "次のプログラム中の a 、 b に入れる正しい答えの組合せを、解答群の中から選べ。",
      description: [
        "手続 reverseList は、単方向リストを逆順に並べ替える。3つの変数 prev(処理済みの先頭)、cur(処理中のノード)、nextNode(cur の元の次のノードを一時的に保持する)を使い、ノードの向きを1つずつ反転させていく。",
      ],
      code:
`手続 reverseList()
  Node: prev ← 未定義の値
  Node: cur ← head
  Node: nextNode

  while (cur が 未定義の値 でない)
    nextNode ← cur.next
    cur.next ← a
    prev ← cur
    cur ← b
  endwhile
  head ← prev`,
      choices: [
        "a: prev　b: nextNode",
        "a: nextNode　b: prev",
        "a: cur　b: nextNode",
        "a: prev　b: cur",
      ],
      answer: 0,
      explanation:
        "cur.next を書き換える前に、元の次のノードへの参照を nextNode に保存しておく(でなければリストの続きを辿れなくなる)。その上で、向きを反転させるため cur.next ← prev とし、prev と cur をそれぞれ1つ後ろへ進める(prev←cur、cur←nextNode)。よって a: prev、b: nextNode。",
    },
    {
      id: "s2q13",
      no: 13,
      section: "algo",
      categoryLabel: "メソッド構造・間接参照(オブジェクト参照の共有)",
      level: 4,
      lead: "次のプログラムを実行したとき出力される値を答えよ。",
      description: [
        "変数にオブジェクトを代入すると、実体がコピーされるのではなく同じ実体への参照が共有される。クラス Order は、applyDiscount(rate) で割引額を計算して自分自身(this)を返し、finalAmount() で割引後の金額を返す。",
      ],
      code:
`クラス Order
  整数型: amount
  整数型: discount ← 0

  ○Order: applyDiscount(整数型: rate)
    discount ← (amount × rate) ÷ 100 の商
    return this
  ○整数型: finalAmount()
    return amount - discount

Order: o1 ← Order()
o1.amount ← 2000
Order: o2 ← o1

o1.applyDiscount(10)
o2.amount ← 3000

出力(o1.finalAmount()の文字列 + "," + o2.finalAmount()の文字列)`,
      choices: ["2800,2800", "1800,2800", "1800,1800", "2800,3000"],
      answer: 0,
      explanation:
        "`Order: o2 ← o1` はオブジェクトのコピーではなく参照の共有であり、o1 と o2 は同一の実体を指す。o1.applyDiscount(10) により discount は (2000×10)÷100=200 となる(この値は共有実体に保存される)。続いて o2.amount ← 3000 は同じ実体の amount を3000に書き換える。したがって o1.finalAmount() も o2.finalAmount() も、共通の amount=3000, discount=200 に基づき 3000-200=2800 となり、出力は \"2800,2800\"。",
    },
    {
      id: "s2q14",
      no: 14,
      section: "algo",
      categoryLabel: "実務処理(バリデーション)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "会員登録フォームの入力チェック処理である。関数 validate は、ユーザー名の文字数(3文字以上10文字以下)、年齢(0以上150未満)、メールアドレス(\"@\"を含む)の順にチェックし、最初に見つかった違反内容を返す。全ての条件を満たす場合は \"OK\" を返す。",
      ],
      code:
`○文字列型: validate(文字列型: name, 整数型: age, 文字列型: email)
  if ((nameの文字数 が 3 より小さい) or (nameの文字数 が 10 より大きい))
    return "ユーザー名エラー"
  endif
  if ((age が 0 より小さい) or ( a ))
    return "年齢エラー"
  endif
  if (emailの中に "@" が含まれない)
    return "メールエラー"
  endif
  return "OK"`,
      choices: [
        "age が 150 以上",
        "age が 150 より大きい",
        "age が 150 以下",
        "age が 0 以上",
      ],
      answer: 0,
      explanation:
        "「0以上150未満」が正常な範囲なので、エラーとすべきは「0より小さい」または「150以上」の場合。よって `age が 150 以上` が正しい。「より大きい」にすると150ちょうどが誤って正常と判定されてしまう。",
    },
    {
      id: "s2q15",
      no: 15,
      section: "algo",
      categoryLabel: "実務処理(集計・グルーピング)",
      level: 5,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "ECサイトの売上明細(商品カテゴリ records と金額 amounts が同じ添字で対応する)を、カテゴリごとに合計する集計処理である。カテゴリ名の配列 catNames と、対応する合計金額の配列 catTotals を並行して管理し、既に登録済みのカテゴリであれば合計に加算し、未登録のカテゴリであれば新たに末尾へ追加する。",
      ],
      code:
`文字列型の配列: records ← {"食品", "日用品", "食品", "衣料", "日用品", "食品"}
整数型の配列: amounts ← {800, 300, 1200, 4500, 600, 950}
文字列型の配列: catNames ← {}
整数型の配列: catTotals ← {}
整数型: i, j
論理型: found

for (i を 1 から recordsの要素数 まで 1 ずつ増やす)
  found ← 偽
  for (j を 1 から catNamesの要素数 まで 1 ずつ増やす)
    if (catNames[j] が records[i] と等しい)
      catTotals[j] ← a
      found ← 真
    endif
  endfor
  if (found が 偽)
    catNames の末尾に records[i] を追加する
    catTotals の末尾に amounts[i] を追加する
  endif
endfor`,
      choices: [
        "catTotals[j] + amounts[i]",
        "catTotals[i] + amounts[j]",
        "catTotals[j] + amounts[j]",
        "amounts[i]",
      ],
      answer: 0,
      explanation:
        "内側ループの添字 j は catNames・catTotals 側の位置を指し、外側ループの添字 i は records・amounts 側の位置を指す。一致したカテゴリの現在の合計 catTotals[j] に、今回の売上 amounts[i] を加算するので `catTotals[j] + amounts[i]` が正しい。添字を取り違えると異なる配列同士を組み合わせてしまい正しく集計できない。",
    },
    {
      id: "s2q16",
      no: 16,
      section: "algo",
      categoryLabel: "リスト構造(双方向連結リスト)",
      level: 5,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "ブラウザの閲覧履歴を双方向連結リストで管理する。クラス Node は、値 url のほか、前の要素への参照 prev と次の要素への参照 next をもつ。手続 insertAfter(cur, newNode) は、ノード cur の直後に newNode を挿入する。cur の次にノードが存在する場合、そのノードの prev も newNode に向け直す必要がある。",
      ],
      code:
`クラス Node
  文字列型: url
  Node: prev ← 未定義の値
  Node: next ← 未定義の値

手続 insertAfter(Node: cur, Node: newNode)
  newNode.prev ← cur
  newNode.next ← cur.next
  if (cur.next が 未定義の値 でない)
    a
  endif
  cur.next ← newNode`,
      choices: [
        "cur.next.prev ← newNode",
        "newNode.next.prev ← newNode",
        "cur.prev ← newNode",
        "cur.next ← newNode.next",
      ],
      answer: 0,
      explanation:
        "この時点では cur.next はまだ元の(newNode挿入前の)次のノードを指しているので、そのノードの prev を newNode に向け直すには `cur.next.prev ← newNode` とする。これを行う前に最後の `cur.next ← newNode` を実行してしまうと、元の次のノードへの参照が失われて prev を書き換えられなくなる。",
    },

    // ============ 問17〜20: 情報セキュリティ ============
    {
      id: "s2q17",
      no: 17,
      section: "sec",
      categoryLabel: "セキュリティ(責任分担・複合)",
      level: 5,
      lead: "図1中の項番(一)〜(三)それぞれについて、再発防止の一次的な責任を負う主体の適切な組合せを、解答群の中から選べ。",
      scenario: [
        "クラウド型の勤怠管理サービスを提供するQ社は、顧客企業の勤怠データを保管するデータベースを、R社が提供するDBaaS(Database as a Service)上に構築している。Q社はアプリケーションの開発・運用を自社で行っており、認証基盤には外部のIDaaS(Identity as a Service)であるS社のサービスを利用し、顧客企業の従業員にシングルサインオン(SSO)を提供している。",
        "ある日、顧客企業の一つで、退職済み従業員のアカウントが悪用され、勤怠データが不正に閲覧される事件が発生した。Q社が調査した結果、次の3つの事実が判明した。",
      ],
      description: [
        "図1 判明した事実",
        "(一) 退職従業員のIDaaS上のアカウントは、顧客企業の管理者が無効化申請を行う運用だったが、当該従業員については申請が行われていなかった。",
        "(二) Q社のアプリケーションには、SSOトークンが失効した後も、ログイン済み端末に残っていた古いセッショントークンでAPIにアクセスできてしまう不具合があった。",
        "(三) DBaaSへの通信は暗号化されていたが、DBaaSのアクセス制御設定が、Q社のアプリケーションサーバ以外のIPアドレスからも接続可能な状態になっていた。",
      ],
      code: null,
      choices: [
        "(一)顧客企業　(二)Q社　(三)Q社",
        "(一)Q社　(二)S社　(三)R社",
        "(一)顧客企業　(二)S社　(三)R社",
        "(一)Q社　(二)Q社　(三)R社",
      ],
      answer: 0,
      explanation:
        "(一)退職者のアカウント無効化申請は、契約上顧客企業の管理者の役割であるため顧客企業の責任。(二)セッション失効の不具合はQ社が開発したアプリケーションのロジックの欠陥であり、認証基盤を提供するS社ではなくQ社の実装責任。(三)DBaaSのアクセス制御(接続元IPの制限など)は、通常テナントであるQ社自身が設定する項目であり、基盤そのもの(R社)の脆弱性ではない。したがって(一)顧客企業(二)Q社(三)Q社の組合せが正しい。",
    },
    {
      id: "s2q18",
      no: 18,
      section: "sec",
      categoryLabel: "セキュリティ(ビジネスメール詐欺)",
      level: 4,
      lead: "本文中の下線の対応を導入した目的として、最も適切なものを選べ。",
      scenario: [
        "従業員150名のT社経理部門では、取引先からの請求書に基づいて振込処理を行っている。ある日、経理担当者が、日頃取引のある仕入先U社の担当者名で「振込先口座を変更したので、今後はこの新しい口座に振り込んでほしい」という内容のメールを受信した。文面や署名は普段のU社とのやり取りとよく似ていたが、実際には送信元メールアドレスのドメインが、正規のU社のドメインと1文字だけ異なるものであった。経理担当者はこの違いに気づかず、指定された新しい口座に振込を実行してしまった。",
        "この事件を受け、T社は再発防止策として、一定額以上の振込先口座変更の依頼を受けた場合、メール以外の手段(あらかじめ登録されている電話番号への架電など)で必ず本人確認を行うという運用を新たに導入した。",
      ],
      description: [],
      code: null,
      choices: [
        "なりすましメールによる不正な口座変更に気づかず、誤った口座に振込んでしまうリスクを低減するため",
        "経理担当者が振込処理にかかる時間を短縮するため",
        "取引先とのメールのやり取りを暗号化し、通信の盗聴を防ぐため",
        "請求書の金額を自動計算し、入力ミスを防ぐため",
      ],
      answer: 0,
      explanation:
        "このシナリオの核心は、送信元ドメインが酷似したなりすましメールによって不正な口座変更依頼が行われ、気づかずに振込んでしまったことである。電話による本人確認は、メールだけでは真偽を判断しにくいなりすましのリスクに対処するための対策であり、目的は不正な口座への振込リスクの低減である。",
    },
    {
      id: "s2q19",
      no: 19,
      section: "sec",
      categoryLabel: "セキュリティ(テレワーク環境)",
      level: 3,
      lead: "この対策として、最も適切なものを選べ。",
      scenario: [
        "従業員60名のV社では、テレワークを推進しており、従業員は自宅やカフェなど社外の様々な場所からノートPCで社内システムにアクセスしている。情報システム部門は、外出先のカフェなどで提供されている暗号化されていない公衆Wi-Fiを利用して社内システムに接続している従業員が一部にいることを把握し、通信内容が第三者に盗聴されるリスクを懸念している。",
      ],
      description: [],
      code: null,
      choices: [
        "社内システムへの通信は必ずVPNを経由させ、経路全体を暗号化した上で接続させる",
        "公衆Wi-Fiの利用を制限せず、従業員それぞれの判断に委ねる",
        "ノートPCの画面の明るさを下げることで、周囲からの覗き見を防止する",
        "社内システムのパスワードの文字数を短くし、入力の手間を減らす",
      ],
      answer: 0,
      explanation:
        "暗号化されていない公衆Wi-Fiでは通信内容が盗聴される危険性がある。VPNを経由させて経路全体を暗号化することで、たとえ公衆Wi-Fi区間が暗号化されていなくても、盗聴による情報漏えいのリスクを大幅に低減できる。",
    },
    {
      id: "s2q20",
      no: 20,
      section: "sec",
      categoryLabel: "セキュリティ(認証の基礎知識)",
      level: 2,
      lead: "情報セキュリティにおける認証の考え方として、適切なものを選べ。",
      scenario: [
        "W社の情報システム部門では、新入社員向けに認証に関する基礎知識の研修資料を作成している。",
      ],
      description: [],
      code: null,
      choices: [
        "パスワードに加えてスマートフォンアプリのワンタイムコードを併用する多要素認証を導入することで、パスワード漏えい時の不正ログインのリスクを低減できる。",
        "覚えやすさを優先して、誕生日や電話番号など推測されやすい文字列をパスワードに設定することを推奨する。",
        "退職者のアカウントは、次回の一斉棚卸しのタイミングまでそのまま有効にしておいてよい。",
        "同一のパスワードを複数のシステムで使い回すことで、管理の手間を減らすことができ、セキュリティ上も望ましい。",
      ],
      answer: 0,
      explanation:
        "多要素認証(パスワード等の「知識」とワンタイムコード等の「所持」の組合せ)を導入すると、パスワードが漏えいしただけでは不正ログインが成立しにくくなり、セキュリティが向上する。他の選択肢は、推測されやすいパスワードの使用・退職者アカウントの放置・パスワードの使い回しなど、いずれもセキュリティを損なう不適切な内容である。",
    },
  ],
};
