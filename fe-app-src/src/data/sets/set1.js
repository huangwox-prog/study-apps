// FE科目B 模擬試験 第1回
// 問1〜16: アルゴリズム・プログラミング(難易度は問1→16にかけて上昇)
// 問17〜20: 情報セキュリティ(長文シナリオ形式、問17が最難、問20にかけて易化)
export default {
  id: "set1",
  title: "模擬試験 第1回",
  questions: [
    // ============ 問1〜16: アルゴリズム・プログラミング ============
    {
      id: "s1q1",
      no: 1,
      section: "algo",
      categoryLabel: "プログラムの基本要素",
      level: 1,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "ある駐輪場の1回の利用料金は、利用時間が2時間以内は無料、2時間を超え6時間以内は100円、6時間を超える場合は300円である。関数 fee は、利用時間(分)を表す0以上の整数を引数として受け取り、利用料金を返す。",
      ],
      code:
`○整数型: fee(整数型: minutes)
  整数型: ret
  if (minutes が 120 以下)
    ret ← 0
  elseif ( a )
    ret ← 100
  else
    ret ← 300
  endif
  return ret`,
      choices: [
        "minutes が 360 以下",
        "minutes が 360 より小さい",
        "(minutes が 120 より大きい) and (minutes が 360 以下)",
        "(minutes が 120 以上) and (minutes が 360 より小さい)",
      ],
      answer: 0,
      explanation:
        "最初のifで「120以下」が既に処理済みなので、elseifの条件は「120より大きい」ことが前提になっている(and条件は不要)。あとは「360以下」であれば100円になるので、`minutes が 360 以下`が正しい。",
    },
    {
      id: "s1q2",
      no: 2,
      section: "algo",
      categoryLabel: "配列",
      level: 1,
      lead: "次のプログラムを実行したとき、変数 total に格納される値を答えよ。",
      description: [
        "整数型の配列 scores に格納された値のうち、60以上のものだけを合計するプログラムである。",
      ],
      code:
`整数型の配列: scores ← {45, 72, 88, 59, 63, 91}
整数型: total ← 0
整数型: i

for (i を 1 から scoresの要素数 まで 1 ずつ増やす)
  if (scores[i] が 60 以上)
    total ← total + scores[i]
  endif
endfor`,
      choices: ["314", "323", "368", "418"],
      answer: 0,
      explanation:
        "60以上の値は 72, 88, 63, 91 の4つ。合計すると 72+88=160、160+63=223、223+91=314。正しい答えは314である。",
    },
    {
      id: "s1q3",
      no: 3,
      section: "algo",
      categoryLabel: "実務処理(フィルタリング)",
      level: 1,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "在庫管理システムにおいて、在庫数が10個未満の商品名だけを抽出するプログラムである。商品名は文字列型の配列 names に、対応する在庫数は整数型の配列 stocks に、同じ添字で格納されている。",
      ],
      code:
`文字列型の配列: names ← {"ノート", "消しゴム", "定規", "はさみ", "のり"}
整数型の配列: stocks ← {25, 8, 3, 14, 9}
文字列型の配列: lowStock ← {}
整数型: i

for (i を 1 から namesの要素数 まで 1 ずつ増やす)
  if ( a )
    lowStock の末尾に names[i] を追加する
  endif
endfor`,
      choices: [
        "stocks[i] が 10 より小さい",
        "names[i] が 10 より小さい",
        "stocks[i] が 10 以下",
        "stocks[i] の要素数 が 10 より小さい",
      ],
      answer: 0,
      explanation:
        "「10個未満」なので `stocks[i] が 10 より小さい` が正しい条件。「以下」だと10個も含まれてしまうので誤り。",
    },
    {
      id: "s1q4",
      no: 4,
      section: "algo",
      categoryLabel: "文字列処理",
      level: 2,
      lead: "次のプログラムを関数 countVowel(\"programming\") として呼び出したときの戻り値を答えよ。",
      description: [
        "関数 countVowel は、引数で与えられた文字列の中に母音(a, i, u, e, o)が何文字含まれるかを数えて返す。",
      ],
      code:
`○整数型: countVowel(文字列型: str)
  文字列型: vowels ← "aiueo"
  整数型: cnt ← 0
  整数型: i, j

  for (i を 1 から strの文字数 まで 1 ずつ増やす)
    for (j を 1 から vowelsの文字数 まで 1 ずつ増やす)
      if (strのi文字目 が vowelsのj文字目 と等しい)
        cnt ← cnt + 1
      endif
    endfor
  endfor
  return cnt`,
      choices: ["2", "3", "4", "5"],
      answer: 1,
      explanation:
        "\"programming\" の母音は o, a, i の3文字(p-r-o-g-r-a-m-m-i-n-g)。よって戻り値は3。",
    },
    {
      id: "s1q5",
      no: 5,
      section: "algo",
      categoryLabel: "トレース(変数の変化)",
      level: 2,
      lead: "次のプログラムを実行したとき、ループが終了した直後の x の値を答えよ。",
      description: [
        "変数 x, y の値がループのたびに変化していく処理である。",
      ],
      code:
`整数型: x ← 3
整数型: y ← 8
整数型: i, tmp

for (i を 1 から 2 まで 1 ずつ増やす)
  tmp ← x
  x ← y mod x
  y ← tmp + y
endfor`,
      choices: ["1", "2", "3", "13"],
      answer: 0,
      explanation:
        "順に追う: 初期 x=3, y=8。①回目: tmp=3, x=8 mod 3=2, y=3+8=11(x=2, y=11になる)。②回目: tmp=2, x=11 mod 2=1, y=2+11=13(x=1, y=13になる)。ループは2回で終了するので、最終的な x の値は1。",
    },
    {
      id: "s1q6",
      no: 6,
      section: "algo",
      categoryLabel: "配列(多次元配列)",
      level: 2,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "二次元配列 table には、3店舗(行)×4か月(列)の売上高が格納されている。プログラムは、店舗ごとの合計売上高を配列 storeTotal に格納する。",
      ],
      code:
`整数型の二次元配列: table ← {{120, 150, 130, 160},
                             {90, 110, 100, 95},
                             {200, 210, 190, 220}}
整数型の配列: storeTotal ← {0, 0, 0}
整数型: i, j

for (i を 1 から tableの行数 まで 1 ずつ増やす)
  for (j を 1 から tableの列数 まで 1 ずつ増やす)
    storeTotal[i] ← a
  endfor
endfor`,
      choices: [
        "storeTotal[i] + table[i, j]",
        "storeTotal[j] + table[i, j]",
        "table[i, j] + table[i, j-1]",
        "storeTotal[i] + table[j, i]",
      ],
      answer: 0,
      explanation:
        "店舗(行)ごとの合計なので、外側ループの添字 i を使って `storeTotal[i]` に加算していく。よって `storeTotal[i] + table[i, j]` が正しい。",
    },
    {
      id: "s1q7",
      no: 7,
      section: "algo",
      categoryLabel: "スタック",
      level: 2,
      lead: "次のプログラムを実行したとき、最後に出力される値の並びを答えよ。",
      description: [
        "クラス Stack はスタック構造を提供する。push(値) はスタックの先頭に値を積み、pop() は先頭の値を取り除いて返す。",
      ],
      code:
`Stack: st ← Stack()
st.push(1)
st.push(2)
st.push(3)
出力(st.pop())
st.push(4)
出力(st.pop())
出力(st.pop())
st.push(5)
出力(st.pop())
出力(st.pop())`,
      choices: [
        "3, 4, 2, 5, 1",
        "3, 4, 2, 1, 5",
        "1, 2, 3, 4, 5",
        "3, 2, 4, 5, 1",
      ],
      answer: 0,
      explanation:
        "スタックは後入れ先出し(LIFO)。push(1,2,3)後、中身は[1,2,3](3が先頭)。pop→3。push(4)で中身[1,2,4]。pop→4。pop→2。push(5)で中身[1,5]。pop→5。pop→1。よって出力順は 3,4,2,5,1。",
    },
    {
      id: "s1q8",
      no: 8,
      section: "algo",
      categoryLabel: "キュー",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "クラス Queue はキュー構造を提供する。enqueue(値) は末尾に値を追加し、dequeue() は先頭の値を取り除いて返す。isEmpty() はキューが空なら真を返す。次のプログラムは、キューに格納された整数のうち偶数だけを別のキューに移し替える。",
      ],
      code:
`Queue: src, dst
: v

dst ← Queue()
while (src.isEmpty() が 偽)
  v ← src.dequeue()
  if ( a )
    dst.enqueue(v)
  endif
endwhile`,
      choices: [
        "(v mod 2) が 0 と等しい",
        "(v mod 2) が 1 と等しい",
        "(v ÷ 2) が 0 と等しい",
        "v が 偶数の要素数 より小さい",
      ],
      answer: 0,
      explanation:
        "偶数の判定は「2で割った余りが0」。よって `(v mod 2) が 0 と等しい` が正しい。",
    },
    {
      id: "s1q9",
      no: 9,
      section: "algo",
      categoryLabel: "探索",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "関数 findFirst は、配列 data の中から target と一致する最初の要素の添字を線形探索で返す。見つからない場合は 0 を返す。",
      ],
      code:
`○整数型: findFirst(整数型の配列: data, 整数型: target)
  整数型: i
  for (i を 1 から dataの要素数 まで 1 ずつ増やす)
    if (data[i] が target と等しい)
      return a
    endif
  endfor
  return 0`,
      choices: ["i", "target", "data[i]", "dataの要素数"],
      answer: 0,
      explanation:
        "一致した要素の添字を返すので、ループ変数 `i` をそのまま返せばよい。",
    },
    {
      id: "s1q10",
      no: 10,
      section: "algo",
      categoryLabel: "整列",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "次のプログラムは、選択ソートによって配列 data を昇順に並べ替える。minIdx には、探索範囲内で最小値をもつ要素の添字を格納する。",
      ],
      code:
`整数型の配列: data ← {5, 2, 8, 1, 9}
整数型: i, j, minIdx, tmp

for (i を 1 から (dataの要素数 - 1) まで 1 ずつ増やす)
  minIdx ← i
  for (j を (i + 1) から dataの要素数 まで 1 ずつ増やす)
    if (data[j] が a )
      minIdx ← j
    endif
  endfor
  tmp ← data[i]
  data[i] ← data[minIdx]
  data[minIdx] ← tmp
endfor`,
      choices: [
        "data[minIdx] より小さい",
        "data[minIdx] より大きい",
        "data[i] より小さい",
        "data[i] より大きい",
      ],
      answer: 0,
      explanation:
        "選択ソートは、現時点で見つかっている最小値(data[minIdx])より小さい値が見つかるたびに minIdx を更新する。よって `data[minIdx] より小さい` が正しい。",
    },
    {
      id: "s1q11",
      no: 11,
      section: "algo",
      categoryLabel: "オブジェクト指向",
      level: 3,
      lead: "次のプログラムを実行したとき、出力される値を答えよ。",
      description: [
        "クラス Counter は、内部にカウント値を保持し、increment で加算、reset で0に戻す。add(n) は n だけまとめて加算する。",
      ],
      code:
`クラス Counter
  整数型: count ← 0
  ○increment()
    count ← count + 1
  ○add(整数型: n)
    count ← count + n
  ○reset()
    count ← 0
  ○整数型: value()
    return count

Counter: c1 ← Counter()
c1.increment()
c1.increment()
c1.add(5)
c1.increment()
Counter: c2 ← Counter()
c2.add(10)
c1.reset()
c1.add(3)
出力(c1.value() + c2.value())`,
      choices: ["13", "10", "3", "23"],
      answer: 0,
      explanation:
        "c1: increment×2で2、add(5)で7、increment で8、reset で0、add(3)で3。c2: add(10)で10。c1.value()+c2.value() = 3+10 = 13。",
    },
    {
      id: "s1q12",
      no: 12,
      section: "algo",
      categoryLabel: "リスト構造",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "手続 insertAfter は、単方向リストにおいて、指定したノード target の直後に新しいノード newNode を挿入する。クラス Node は、値 val と次の要素への参照 next をもつ。",
      ],
      code:
`クラス Node
  整数型: val
  Node: next ← 未定義の値

○insertAfter(Node: target, Node: newNode)
  newNode.next ← a
  target.next ← newNode`,
      choices: [
        "target.next",
        "target",
        "newNode",
        "newNode.next",
      ],
      answer: 0,
      explanation:
        "先に newNode.next を target の(元の)次の要素に繋いでおかないと、target.next を書き換えた瞬間に元のリンク先を見失ってしまう。よって `target.next` を先に newNode.next に代入するのが正しい順序。",
    },
    {
      id: "s1q13",
      no: 13,
      section: "algo",
      categoryLabel: "再帰",
      level: 4,
      lead: "次のプログラムを mystery(\"abcd\") として呼び出したときの戻り値を答えよ。",
      description: [
        "関数 mystery は、引数の文字列に対して再帰的な処理を行う。文字列の先頭1文字を取り出す操作を left(str)、先頭1文字を除いた残りを rest(str) と表す。",
      ],
      code:
`○文字列型: mystery(文字列型: str)
  if (strの文字数 が 1 以下)
    return str
  endif
  return mystery(rest(str)) + left(str)`,
      choices: ["dcba", "abcd", "dabc", "bcda"],
      answer: 0,
      explanation:
        "mystery(\"abcd\") = mystery(\"bcd\")+\"a\" = (mystery(\"cd\")+\"b\")+\"a\" = ((mystery(\"d\")+\"c\")+\"b\")+\"a\" = ((\"d\"+\"c\")+\"b\")+\"a\" = \"dcba\"。再帰的に「残り」を先に処理してから先頭文字を末尾に付け足すため、文字列全体が反転する。",
    },
    {
      id: "s1q14",
      no: 14,
      section: "algo",
      categoryLabel: "探索(二分探索)",
      level: 4,
      lead: "次のプログラム中の a 、 b に入れる正しい答えの組合せを、解答群の中から選べ。ここで、配列 data は昇順に整列済みとする。",
      description: [
        "関数 binSearch は、二分探索によって配列 data の中から target の位置を返す。見つからない場合は 0 を返す。",
      ],
      code:
`○整数型: binSearch(整数型の配列: data, 整数型: target)
  整数型: low ← 1
  整数型: high ← dataの要素数
  整数型: mid

  while (low が high 以下)
    mid ← (low + high) ÷ 2 の商
    if (data[mid] が target と等しい)
      return mid
    elseif (data[mid] が target より小さい)
      low ← a
    else
      high ← b
    endif
  endwhile
  return 0`,
      choices: [
        "a: mid + 1　b: mid - 1",
        "a: mid　b: mid",
        "a: mid - 1　b: mid + 1",
        "a: mid + 1　b: mid",
      ],
      answer: 0,
      explanation:
        "targetがdata[mid]より大きい場合は探索範囲を右半分に絞るので low←mid+1、targetがdata[mid]より小さい場合は左半分に絞るので high←mid-1。よって a: mid+1、b: mid-1。",
    },
    {
      id: "s1q15",
      no: 15,
      section: "algo",
      categoryLabel: "思考力(パズル)",
      level: 5,
      lead: "3つのスイッチ A, B, C は、それぞれ押すたびに自分自身と隣接するスイッチのON/OFFを反転させる。Aを押すとAとBが反転し、Bを押すとA,B,Cが反転し、Cを押すとBとCが反転する。全て OFF の状態から、A→B→A の順に押したとき、最終的なA, B, Cの状態の組合せとして正しいものを選べ。",
      description: [
        "初期状態:A=OFF, B=OFF, C=OFF。「反転」とは OFF→ON、ON→OFFに切り替えることである。",
      ],
      code: null,
      choices: [
        "A=ON, B=ON, C=ON",
        "A=OFF, B=ON, C=ON",
        "A=ON, B=OFF, C=OFF",
        "A=OFF, B=OFF, C=ON",
      ],
      answer: 0,
      explanation:
        "初期:A=OFF,B=OFF,C=OFF。①Aを押す→A,Bが反転:A=ON,B=ON,C=OFF。②Bを押す→A,B,Cが反転:A=OFF,B=OFF,C=ON。③Aを押す→A,Bが反転:A=ON,B=ON,C=ON。よって最終状態はA=ON,B=ON,C=ONとなる。3回の操作を1つずつ丁寧に紙に書き出して追跡することが解答の鍵になる。",
    },
    {
      id: "s1q16",
      no: 16,
      section: "algo",
      categoryLabel: "木構造・再帰",
      level: 5,
      lead: "次のプログラムを sumTree(1) として呼び出したときの戻り値を答えよ。",
      description: [
        "配列 tree は二分木を表す。tree[n] はノード n の子ノード番号の配列であり、子がない場合は空配列 {} である。各ノードの値は nodeVal[n] に格納されている。関数 sumTree はノード n を根とする部分木の値の合計を再帰的に求める。",
      ],
      code:
`整数型の配列の配列: tree ← {{2, 3}, {4, 5}, {}, {}, {6}, {}}
整数型の配列: nodeVal ← {10, 5, 8, 2, 6, 3}

○整数型: sumTree(整数型: n)
  整数型: total ← nodeVal[n]
  整数型: i
  for (i を 1 から tree[n]の要素数 まで 1 ずつ増やす)
    total ← total + sumTree(tree[n][i])
  endfor
  return total`,
      choices: ["34", "31", "28", "37"],
      answer: 0,
      explanation:
        "木構造: 1の子は2,3。2の子は4,5。5の子は6。3,4,6は葉。値: 1→10,2→5,3→8,4→2,5→6,6→3。sumTree(6)=3。sumTree(5)=6+sumTree(6)=6+3=9。sumTree(4)=2。sumTree(3)=8。sumTree(2)=5+sumTree(4)+sumTree(5)=5+2+9=16。sumTree(1)=10+sumTree(2)+sumTree(3)=10+16+8=34。",
    },

    // ============ 問17〜20: 情報セキュリティ ============
    {
      id: "s1q17",
      no: 17,
      section: "sec",
      categoryLabel: "セキュリティ(責任分担)",
      level: 5,
      lead: "図1中の項番(一)〜(三)それぞれについて、対処する責任を負う組織の適切な組合せを、解答群の中から選べ。",
      scenario: [
        "食品小売業のF社では、会員制の通販サイト(以下、Fサイトという)を運営し、会員向けに食品の定期購入サービスを提供している。Fサイトは、あらかじめ会員登録した利用者の氏名、住所、決済情報などの会員情報を管理しており、G社が提供するIaaS上に構築された仮想サーバでアプリケーションを稼働させている。仮想サーバのOS及びミドルウェアの管理は、G社との契約に基づきF社が行う。",
        "F社は、Fサイトの開発・保守をH社に委託しており、F社とH社との委託契約では、Webアプリケーションプログラムの実装及び脆弱性対策はH社が実施することになっている。",
        "先日、F社は外部のセキュリティ専門機関に依頼してFサイトの脆弱性診断を実施した。診断の結果、次の指摘事項が報告された。",
      ],
      description: [
        "図1 指摘事項",
        "(一) 仮想サーバのOSに、修正プログラムが未適用のまま放置されている既知の脆弱性が存在し、悪用されるおそれがある。",
        "(二) Webアプリケーションプログラムの入力チェックが不十分であり、悪意のある入力によってデータベースの内容を不正に取得されるおそれがある(SQLインジェクションの脆弱性)。",
        "(三) IaaS基盤そのものを構成するハイパーバイザに脆弱性が存在し、他のテナントから攻撃を受けるおそれがある。",
      ],
      code: null,
      choices: [
        "(一)F社　(二)H社　(三)G社",
        "(一)F社　(二)G社　(三)H社",
        "(一)G社　(二)F社　(三)H社",
        "(一)H社　(二)F社　(三)G社",
      ],
      answer: 0,
      explanation:
        "(一)OS・ミドルウェアの管理はF社の契約範囲(IaaSではOSより上をユーザーが管理する)なのでF社。(二)Webアプリの実装・脆弱性対策はH社に委託されているのでH社。(三)ハイパーバイザなどIaaS基盤そのものの管理はクラウド事業者G社の責任範囲。したがって(一)F社(二)H社(三)G社の組合せが正しい。",
    },
    {
      id: "s1q18",
      no: 18,
      section: "sec",
      categoryLabel: "セキュリティ(組織対策)",
      level: 4,
      lead: "本文中の下線の運用を導入する目的として、最も適切なものを選べ。",
      scenario: [
        "従業員数80名のK社では、営業担当者に貸与しているノートPCを社外に持ち出し、客先や自宅からVPN経由で社内システムに接続させている。",
        "最近、他社で、退職者が在職中に使用していたアカウントが退職後も有効なままになっており、そのアカウントを使って社内システムに不正アクセスされる事件が発生した。この事件を受け、K社の情報システム部門は、自社の運用を点検した。",
        "点検の結果、退職者のアカウント削除は各所属部門の管理者が申請する運用になっているが、申請が遅れるケースが度々あることが判明した。そこで情報システム部門は、人事システムの退職者情報と、社内システムのアカウント一覧を毎週自動で突き合わせ、退職済みなのに有効なままのアカウントを自動的に検知して情報システム部門に通知する仕組みを新たに導入することにした。",
      ],
      description: [],
      code: null,
      choices: [
        "退職者による社内システムへの不正アクセスのリスクを低減するため",
        "在職中の従業員のアカウント作成にかかる時間を短縮するため",
        "VPN経由の通信を暗号化し、盗聴のリスクを下げるため",
        "ノートPCの紛失時に、遠隔からデータを消去できるようにするため",
      ],
      answer: 0,
      explanation:
        "シナリオの核心は「退職者アカウントの削除申請が遅れ、退職済みでも有効なままのアカウントが残ってしまう」ことによるリスク。自動検知・通知の仕組みは、この放置されたアカウントを早期に発見し、不正アクセスのリスクを低減することが目的である。",
    },
    {
      id: "s1q19",
      no: 19,
      section: "sec",
      categoryLabel: "セキュリティ(インシデント対応)",
      level: 3,
      lead: "本文中の空欄に入れる、最も適切な対応を選べ。",
      scenario: [
        "従業員120名のL社では、社内のファイルサーバへのアクセスログを分析するため、EDR(Endpoint Detection and Response)を全従業員のPCに導入している。",
        "ある日、情報システム部門の担当者が、深夜3時ごろに営業部の従業員Mさんのアカウントで、通常は業務時間内にしかアクセスしないはずの機密フォルダへの大量アクセスがあったという異常アラートをEDRのコンソールで検知した。Mさんに確認したところ、「その時間は寝ており、PCも操作していない」との回答であった。",
        "情報システム部門は、Mさんのアカウントが何らかの方法で第三者に窃取され、不正利用された可能性が高いと判断した。",
      ],
      description: [
        "この時点で情報システム部門が最初に取るべき対応として、最も適切なものを選べ。",
      ],
      code: null,
      choices: [
        "Mさんのアカウントを一時的に無効化し、該当PCをネットワークから隔離する",
        "全従業員に対して、パスワードの定期変更を呼びかけるメールを送信する",
        "機密フォルダに保存されているファイルを全て削除し、証拠を保全する",
        "特に対応せず、次回の定例会議で報告事項として共有する",
      ],
      answer: 0,
      explanation:
        "不正利用の疑いが強い場合、被害の拡大を防ぐために、まず該当アカウントの無効化と該当端末のネットワーク隔離という初動対応(封じ込め)を行うのが定石。ファイルの削除は証拠保全に反するため誤り。",
    },
    {
      id: "s1q20",
      no: 20,
      section: "sec",
      categoryLabel: "セキュリティ(基礎知識)",
      level: 2,
      lead: "情報セキュリティ対策とその目的の組合せのうち、適切なものを選べ。",
      scenario: [
        "N社の総務部門では、社内のセキュリティ意識向上のため、基本的な対策とその目的について新入社員向けの研修資料を作成している。",
      ],
      description: [],
      code: null,
      choices: [
        "重要なデータを定期的にバックアップし、原本とは別の場所に保管することで、ランサムウェア被害からの復旧を容易にする。",
        "全従業員が同じパスワードを共有して使い回すことで、パスワード管理の手間を減らし、セキュリティを向上させる。",
        "OSやソフトウェアの修正プログラム(セキュリティパッチ)の適用を、動作確認の手間を避けるため無期限に先送りする。",
        "重要な情報を含む電子メールは、宛先を確認せずに至急送信することを最優先する。",
      ],
      answer: 0,
      explanation:
        "バックアップを原本と別の場所に保管する(3-2-1ルールなど)ことは、ランサムウェア被害時の復旧手段として基本かつ有効な対策。他の選択肢は、パスワードの使い回し・パッチ適用の先送り・宛先確認の省略など、いずれもセキュリティを損なう不適切な内容。",
    },
  ],
};
