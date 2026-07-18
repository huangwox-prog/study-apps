// FE科目B 模擬試験 第5回
// 問1〜16: 汎用アルゴリズム(トレース・穴埋め)+ 連結リスト・再帰・二分探索・整列・間接参照(A[B[i]]型)・文字列探索
//          (難易度は問1→16にかけて上昇、単純な値のトレースより構造理解を優先)
// 問17〜20: 情報セキュリティ(長文シナリオ形式、問17が最難、問20にかけて易化)
export default {
  id: "set5",
  title: "模擬試験 第5回",
  questions: [
    // ============ 問1〜16: アルゴリズム・プログラミング ============
    {
      id: "s5q1",
      no: 1,
      section: "algo",
      categoryLabel: "プログラムの基本要素",
      level: 1,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "オンラインストアの割引率は、購入金額が5000円以上の場合は10%、3000円以上5000円未満の場合は5%、3000円未満の場合は0%である。関数 discountRate は、購入金額を表す0以上の整数を引数として受け取り、割引率(%)を返す。",
      ],
      code:
`○整数型: discountRate(整数型: amount)
  整数型: ret
  if (amount が 5000 以上)
    ret ← 10
  elseif ( a )
    ret ← 5
  else
    ret ← 0
  endif
  return ret`,
      choices: [
        "amount が 3000 以上",
        "amount が 3000 より大きい",
        "(amount が 3000 以上) and (amount が 5000 未満)",
        "amount が 5000 未満",
      ],
      answer: 0,
      explanation:
        "最初のifで「5000以上」が既に処理済みなので、elseifに到達した時点で amount は5000未満であることが確定している。よって `amount が 3000 以上` だけで条件は十分。",
    },
    {
      id: "s5q2",
      no: 2,
      section: "algo",
      categoryLabel: "配列",
      level: 1,
      lead: "次のプログラムを実行したあと、配列 data の内容を答えよ。",
      description: [
        "配列 data の2番目の要素と3番目の要素を入れ替えるプログラムである。",
      ],
      code:
`整数型の配列: data ← {10, 25, 8, 40, 15}
整数型: i ← 2
整数型: tmp ← data[i]
data[i] ← data[i+1]
data[i+1] ← tmp`,
      choices: [
        "{10, 8, 25, 40, 15}",
        "{10, 25, 8, 40, 15}",
        "{25, 10, 8, 40, 15}",
        "{10, 8, 40, 25, 15}",
      ],
      answer: 0,
      explanation:
        "i=2なので、data[2](=25)とdata[3](=8)を入れ替える。tmp←25、data[2]←data[3]=8、data[3]←tmp=25となり、{10, 8, 25, 40, 15}になる。",
    },
    {
      id: "s5q3",
      no: 3,
      section: "algo",
      categoryLabel: "文字列探索",
      level: 1,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "関数 endsWith は、文字列 str が suffix で終わっているかどうかを判定する。offset は、str の中で suffix と比較を始める位置の直前を表す。",
      ],
      code:
`○論理型: endsWith(文字列型: str, 文字列型: suffix)
  整数型: i, offset
  if (strの文字数 が suffixの文字数 より小さい)
    return 偽
  endif
  offset ← strの文字数 - suffixの文字数
  for (i を 1 から suffixの文字数 まで 1 ずつ増やす)
    if ( a )
      return 偽
    endif
  endfor
  return 真`,
      choices: [
        "strの(offset + i)文字目 が suffixのi文字目 と等しくない",
        "strのi文字目 が suffixのi文字目 と等しくない",
        "strの(offset + i)文字目 が suffixのoffset文字目 と等しくない",
        "strのoffset文字目 が suffixのi文字目 と等しくない",
      ],
      answer: 0,
      explanation:
        "str の末尾 suffixの文字数 分の範囲は、str の (offset+1)文字目 から始まる。suffix の i文字目 に対応する str 側の位置は (offset+i)文字目 なので、この2つを1文字ずつ比較し、一致しない箇所があれば偽を返す。",
    },
    {
      id: "s5q4",
      no: 4,
      section: "algo",
      categoryLabel: "間接参照(添字配列)",
      level: 2,
      lead: "次のプログラムを実行したとき出力される文字列を、出力される順に並べたものを選べ。",
      description: [
        "物流システムにおいて、商品ごとの保管倉庫コードが配列 warehouseCode に格納されており、倉庫コードに対応する倉庫名は配列 warehouseNames に格納されている。",
      ],
      code:
`整数型の配列: warehouseCode ← {2, 1, 3, 1, 2}
文字列型の配列: warehouseNames ← {"東京倉庫", "大阪倉庫", "福岡倉庫"}
整数型: i

for (i を 1 から warehouseCodeの要素数 まで 1 ずつ増やす)
  出力(warehouseNames[warehouseCode[i]])
endfor`,
      choices: [
        "大阪倉庫, 東京倉庫, 福岡倉庫, 東京倉庫, 大阪倉庫",
        "東京倉庫, 大阪倉庫, 福岡倉庫, 大阪倉庫, 東京倉庫",
        "大阪倉庫, 福岡倉庫, 東京倉庫, 大阪倉庫, 東京倉庫",
        "福岡倉庫, 東京倉庫, 大阪倉庫, 東京倉庫, 福岡倉庫",
      ],
      answer: 0,
      explanation:
        "warehouseCode[1]=2 → warehouseNames[2]=\"大阪倉庫\"。[2]=1 → \"東京倉庫\"。[3]=3 → \"福岡倉庫\"。[4]=1 → \"東京倉庫\"。[5]=2 → \"大阪倉庫\"。よって「大阪倉庫, 東京倉庫, 福岡倉庫, 東京倉庫, 大阪倉庫」の順になる。",
    },
    {
      id: "s5q5",
      no: 5,
      section: "algo",
      categoryLabel: "整列(バブルソートの交換回数)",
      level: 2,
      lead: "次のプログラムを実行したとき、最終的な swapCount の値を答えよ。",
      description: [
        "次のプログラムは、バブルソートによって配列 data を昇順に整列しながら、要素を交換した回数を swapCount に記録する。",
      ],
      code:
`整数型の配列: data ← {3, 1, 4, 1, 5}
整数型: i, j, tmp
整数型: swapCount ← 0

for (i を 1 から (dataの要素数 - 1) まで 1 ずつ増やす)
  for (j を 1 から (dataの要素数 - i) まで 1 ずつ増やす)
    if (data[j] が data[j+1] より大きい)
      tmp ← data[j]
      data[j] ← data[j+1]
      data[j+1] ← tmp
      swapCount ← swapCount + 1
    endif
  endfor
endfor`,
      choices: ["3", "2", "4", "5"],
      answer: 0,
      explanation:
        "1回目のパス(i=1): {3,1,4,1,5}→j=1で3と1を交換{1,3,4,1,5}(1回)→j=3で4と1を交換{1,3,1,4,5}(2回)。2回目のパス(i=2): j=2で3と1を交換{1,1,3,4,5}(3回)。3回目・4回目のパスでは交換は発生しない。よって swapCount は最終的に3になる。",
    },
    {
      id: "s5q6",
      no: 6,
      section: "algo",
      categoryLabel: "探索(計算量の比較)",
      level: 2,
      lead: "配列の要素数が n から 2n に増えたとき、最悪の場合の比較回数の変化について、最も適切な説明を選べ。",
      description: [],
      code: null,
      choices: [
        "線形探索は比較回数がおよそ2倍になるが、二分探索は比較回数がわずかに1回程度しか増えない",
        "線形探索も二分探索も、比較回数はどちらもおよそ2倍になる",
        "線形探索の比較回数は変化しないが、二分探索の比較回数はおよそ2倍になる",
        "線形探索も二分探索も、要素数が増えても比較回数は変化しない",
      ],
      answer: 0,
      explanation:
        "線形探索の最悪計算量はO(n)であり、要素数が2倍になれば比較回数もおよそ2倍になる。一方、二分探索の最悪計算量はO(log n)であり、log(2n)=log n + log 2 なので、要素数が2倍になっても比較回数は1回程度しか増えない。これが二分探索の大きな利点である。",
    },
    {
      id: "s5q7",
      no: 7,
      section: "algo",
      categoryLabel: "リスト構造(単方向連結リストのフィルタ削除)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "手続 removeValue は、単方向リストの中から値が target と等しいノードをすべて削除する(先頭ノードが該当する場合は別処理で既に除去済みとする)。cur は削除対象の直前のノードを指す。",
      ],
      code:
`手続 removeValue(整数型: target)
  while ((head が 未定義の値 でない) and (head.val が target と等しい))
    head ← head.next
  endwhile
  Node: cur ← head
  while ((cur が 未定義の値 でない) and (cur.next が 未定義の値 でない))
    if (cur.next.val が target と等しい)
      a
    else
      cur ← cur.next
    endif
  endwhile`,
      choices: [
        "cur.next ← cur.next.next",
        "cur ← cur.next.next",
        "cur.next ← cur.next",
        "cur ← cur.next",
      ],
      answer: 0,
      explanation:
        "cur.next(次のノード)が削除対象の場合、cur.next を そのさらに次のノード(cur.next.next)につなぎ直すことで、対象ノードを読み飛ばして削除する。このとき cur 自身は進めないでおく。これは、削除後の新たな cur.next も削除対象である可能性があり、同じ cur のまま次の判定を続ける必要があるためである。",
    },
    {
      id: "s5q8",
      no: 8,
      section: "algo",
      categoryLabel: "再帰(回文判定)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "関数 isPalindrome は、文字列が回文(前から読んでも後ろから読んでも同じ文字列)かどうかを再帰的に判定する。文字列の先頭1文字を first(str)、末尾1文字を last(str)、先頭と末尾を除いた残りを middle(str) と表す。",
      ],
      code:
`○論理型: isPalindrome(文字列型: str)
  if (strの文字数 が 1 以下)
    return 真
  endif
  if (first(str) が last(str) と等しくない)
    return 偽
  endif
  return a`,
      choices: [
        "isPalindrome(middle(str))",
        "isPalindrome(str)",
        "isPalindrome(first(str))",
        "not isPalindrome(middle(str))",
      ],
      answer: 0,
      explanation:
        "先頭と末尾の文字が一致することを確認したら、両端を除いた残りの部分(middle(str))についても同様に回文かどうかを再帰的に確認すればよい。よって `isPalindrome(middle(str))` が正しい。",
    },
    {
      id: "s5q9",
      no: 9,
      section: "algo",
      categoryLabel: "文字列探索(共通接頭辞)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "関数 commonPrefixLen は、2つの文字列 s1, s2 に共通する先頭部分の文字数を返す。",
      ],
      code:
`○整数型: commonPrefixLen(文字列型: s1, 文字列型: s2)
  整数型: i, minLen
  if (s1の文字数 が s2の文字数 より小さい)
    minLen ← s1の文字数
  else
    minLen ← s2の文字数
  endif
  for (i を 1 から minLen まで 1 ずつ増やす)
    if ( a )
      return i - 1
    endif
  endfor
  return minLen`,
      choices: [
        "s1のi文字目 が s2のi文字目 と等しくない",
        "s1のi文字目 が s2のi文字目 と等しい",
        "s1のi文字目 が minLen と等しくない",
        "s1のminLen文字目 が s2のi文字目 と等しくない",
      ],
      answer: 0,
      explanation:
        "s1とs2を先頭から1文字ずつ比較し、一致しない文字が最初に現れた位置iの1つ手前(i-1)までが共通する先頭部分となる。よって、一致しなくなった時点で `i - 1` を返せばよい。最後まで一致すればループを抜けてminLenを返す。",
    },
    {
      id: "s5q10",
      no: 10,
      section: "algo",
      categoryLabel: "間接参照(重複判定の高速化)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "整数値の重複を除去する処理である。値の範囲があらかじめ小さい(1〜10)とわかっている場合、値そのものを添字として使う配列 seen を用いることで、重複判定を高速に行える。seen の各要素は初期値が偽であり、既に登録済みの値については真にしておく。",
      ],
      code:
`整数型の配列: nums ← {3, 7, 3, 5, 7, 9}
論理型の配列: seen ← {偽, 偽, 偽, 偽, 偽, 偽, 偽, 偽, 偽, 偽}
整数型の配列: uniqueNums ← {}
整数型: i

for (i を 1 から numsの要素数 まで 1 ずつ増やす)
  if (seen[nums[i]] が 偽)
    uniqueNums の末尾に nums[i] を追加する
    a
  endif
endfor`,
      choices: [
        "seen[nums[i]] ← 真",
        "seen[i] ← 真",
        "seen[nums[i]] ← 偽",
        "nums[seen[i]] ← 真",
      ],
      answer: 0,
      explanation:
        "nums[i]の値そのものをseen配列の添字として使う間接参照によって、その値が既に登録済みかどうかを1回の参照で判定できる。新しく登録した後は、その値に対応する seen[nums[i]] を真にしておく必要がある。これは、配列を1件ずつ比較していく方法よりも高速な重複判定の手法である。",
    },
    {
      id: "s5q11",
      no: 11,
      section: "algo",
      categoryLabel: "整列(マージソートの併合処理)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "次のプログラムは、マージソートにおける「併合(マージ)」処理である。整列済みの2つの配列 left, right を1つの整列済み配列 merged に統合する。",
      ],
      code:
`整数型の配列: left ← {2, 5, 8}
整数型の配列: right ← {1, 6, 7}
整数型の配列: merged ← {}
整数型: i ← 1
整数型: j ← 1

while ((i が leftの要素数 以下) and (j が rightの要素数 以下))
  if ( a )
    merged の末尾に left[i] を追加する
    i ← i + 1
  else
    merged の末尾に right[j] を追加する
    j ← j + 1
  endif
endwhile

while (i が leftの要素数 以下)
  merged の末尾に left[i] を追加する
  i ← i + 1
endwhile
while (j が rightの要素数 以下)
  merged の末尾に right[j] を追加する
  j ← j + 1
endwhile`,
      choices: [
        "left[i] が right[j] 以下",
        "left[i] が right[j] より大きい",
        "left[i] が left[i+1] 以下",
        "i が j 以下",
      ],
      answer: 0,
      explanation:
        "leftとrightは共に整列済みなので、それぞれの先頭(未処理の要素のうち最小)であるleft[i]とright[j]を比較し、小さい方(等しい場合はleft側)をmergedに追加していけば、結果も整列済みになる。よって `left[i] が right[j] 以下` が正しい。(この例では最終的にmerged={1,2,5,6,7,8}となる。)",
    },
    {
      id: "s5q12",
      no: 12,
      section: "algo",
      categoryLabel: "リスト構造(整列済みリストのマージ)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "関数 mergeSortedLists は、2つの昇順に整列された単方向リスト a, b を、新しいノードを作らずに既存ノードのnextを繋ぎ変えることで1つの整列されたリストに統合し、その先頭ノードを返す。",
      ],
      code:
`○Node: mergeSortedLists(Node: a, Node: b)
  if (a が 未定義の値 と等しい)
    return b
  endif
  if (b が 未定義の値 と等しい)
    return a
  endif
  if (a.val が b.val 以下)
    a.next ← mergeSortedLists(a.next, b)
    return a
  else
    a
    return b
  endif`,
      choices: [
        "b.next ← mergeSortedLists(a, b.next)",
        "b.next ← mergeSortedLists(a.next, b)",
        "b.next ← mergeSortedLists(b.next, a)",
        "a.next ← mergeSortedLists(a, b.next)",
      ],
      answer: 0,
      explanation:
        "a.valの方が大きい場合、bを結果の先頭にし、bの次(b.next)には「aとb.nextを比較・統合した結果」をつなげる必要がある。よって `b.next ← mergeSortedLists(a, b.next)` が正しい。aはまだbより大きいままなので、aを進めてはならない。",
    },
    {
      id: "s5q13",
      no: 13,
      section: "algo",
      categoryLabel: "再帰(ハノイの塔)",
      level: 4,
      lead: "次のプログラムを hanoi(4) として呼び出したときの戻り値を答えよ。",
      description: [
        "関数 hanoi は、円盤n枚のハノイの塔を解くために必要な最小の移動回数を再帰的に計算する。",
      ],
      code:
`○整数型: hanoi(整数型: n)
  if (n が 0 と等しい)
    return 0
  endif
  return 2 × hanoi(n - 1) + 1`,
      choices: ["15", "14", "16", "31"],
      answer: 0,
      explanation:
        "hanoi(0)=0。hanoi(1)=2×0+1=1。hanoi(2)=2×1+1=3。hanoi(3)=2×3+1=7。hanoi(4)=2×7+1=15。円盤の枚数が1枚増えるごとに移動回数がおよそ2倍になっていく点が特徴である。",
    },
    {
      id: "s5q14",
      no: 14,
      section: "algo",
      categoryLabel: "探索(二分探索の実装上の注意点)",
      level: 4,
      lead: "二分探索の実装において、mid ← (low + high) ÷ 2 の商 という計算方法は、極端に大きな配列を扱う場合にオーバーフローを引き起こす可能性がある。この問題を避けるためのより安全な計算式として、最も適切なものを選べ。",
      description: [],
      code: null,
      choices: [
        "mid ← low + (high - low) ÷ 2 の商",
        "mid ← (low × high) ÷ 2 の商",
        "mid ← (low + high) ÷ 3 の商",
        "mid ← high - low ÷ 2 の商",
      ],
      answer: 0,
      explanation:
        "low と high をそのまま加算すると、両者の値が非常に大きい場合に、扱える整数の範囲を超えるオーバーフローが発生する可能性がある。`low + (high - low) ÷ 2 の商` という式であれば、(low+high)÷2の商と同じ結果を得ながら、加算結果が大きくなりすぎるのを避けることができる。",
    },
    {
      id: "s5q15",
      no: 15,
      section: "algo",
      categoryLabel: "リスト構造・間接参照の複合",
      level: 5,
      lead: "次のプログラムを実行したとき、最終的な result の内容を答えよ。",
      description: [
        "単方向リスト(先頭から順に 40, 10, 30, 20 の値をもつ4つのノード)の各ノードの値を配列 values に格納したあと、あらかじめ与えられた並べ替え順序を表す添字配列 order を使い、間接参照によって result を作成する処理である。",
      ],
      code:
`Node: cur ← head
整数型の配列: values ← {}
while (cur が 未定義の値 でない)
  values の末尾に cur.val を追加する
  cur ← cur.next
endwhile
※ この時点で values ← {40, 10, 30, 20}

整数型の配列: order ← {2, 4, 3, 1}
整数型の配列: result ← {}
整数型: i
for (i を 1 から orderの要素数 まで 1 ずつ増やす)
  result の末尾に values[order[i]] を追加する
endfor`,
      choices: [
        "{10, 20, 30, 40}",
        "{40, 10, 30, 20}",
        "{20, 10, 40, 30}",
        "{10, 30, 20, 40}",
      ],
      answer: 0,
      explanation:
        "order[1]=2 → values[2]=10。order[2]=4 → values[4]=20。order[3]=3 → values[3]=30。order[4]=1 → values[1]=40。よってresultは{10, 20, 30, 40}となる。リストの走査による配列化と、order配列を介した間接参照による並べ替えという2つの処理を正しく組み合わせて追跡できるかがポイント。",
    },
    {
      id: "s5q16",
      no: 16,
      section: "algo",
      categoryLabel: "再帰・間接参照(親子関係の探索)",
      level: 5,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "配列 parent は、各ノードの親ノード番号を格納しており、parent[n] という間接参照によってノードnの親をたどることができる(親がない根ノードの場合は0)。関数 depth は、ノードnの深さ(根を深さ0とする)を再帰的に求める。",
      ],
      code:
`整数型の配列: parent ← {0, 1, 1, 2, 2, 3}

○整数型: depth(整数型: n)
  if (parent[n] が 0 と等しい)
    return 0
  endif
  return a`,
      choices: [
        "depth(parent[n]) + 1",
        "depth(n - 1) + 1",
        "parent[depth(n)] + 1",
        "depth(parent[n])",
      ],
      answer: 0,
      explanation:
        "ノードnの深さは、その親ノード(parent[n])の深さに1を加えたものになる。parent配列を使った間接参照によって親をたどりながら、根に到達するまで再帰的に深さを計算している。(参考: この例ではdepth(4)=2, depth(6)=2となる。)",
    },

    // ============ 問17〜20: 情報セキュリティ ============
    {
      id: "s5q17",
      no: 17,
      section: "sec",
      categoryLabel: "セキュリティ(内部脅威・情報持ち出し対策)",
      level: 5,
      lead: "この事案を踏まえ、再発防止のために平時から導入しておくべき技術的対策として、最も適切なものを選べ。",
      scenario: [
        "精密機器メーカーのJJ社では、設計部門に所属していた技術者が退職した1か月後、退職前の3週間の間に、機密性の高い設計データが大量に外部の個人向けクラウドストレージサービスにアップロードされていたことが、社内のログ調査によって判明した。当時、JJ社では、社内から外部クラウドストレージへのアクセスを技術的に制限しておらず、また大量のデータ転送があった場合にアラートを出す仕組みも導入されていなかった。",
        "なお、当該技術者は在職中、設計データへの正規のアクセス権限を持っており、通常業務の範囲内でこれらのデータを閲覧・編集する必要があった。",
      ],
      description: [],
      code: null,
      choices: [
        "業務上必要な範囲を超える大量データの外部転送を検知・制限するDLP(Data Loss Prevention)のような仕組みを導入する",
        "全従業員の設計データへのアクセス権限を一律で剥奪する",
        "退職者が出た場合にのみ、退職前3週間分のログを事後的に確認する",
        "設計データを紙媒体のみで管理し、電子データの保存を一切禁止する",
      ],
      answer: 0,
      explanation:
        "当該技術者は正規のアクセス権限を持っていたため、アクセス権限の制限だけでは今回のような持ち出しを防げない。重要なのは、通常業務では発生しないような大量データの外部転送といった異常な挙動を、平時から検知・制限できる仕組み(DLPなど)を導入しておくことである。退職後の事後的なログ確認だけでは、情報流出そのものを未然に防ぐことはできない。",
    },
    {
      id: "s5q18",
      no: 18,
      section: "sec",
      categoryLabel: "セキュリティ(証明書検証不備・中間者攻撃)",
      level: 4,
      lead: "この脆弱性を悪用された場合に発生しうる被害として、最も適切なものを選べ。",
      scenario: [
        "従業員向け業務アプリを提供するKK社は、モバイルアプリとサーバ間の通信をHTTPSで暗号化しているが、開発時の設定不備により、アプリが不正な(信頼できない)SSL/TLS証明書を提示するサーバに対しても、警告なく通信を継続してしまう状態になっていることが、セキュリティ診断で判明した。",
      ],
      description: [],
      code: null,
      choices: [
        "攻撃者が通信経路上に割り込み、正規のサーバになりすまして通信内容を盗聴・改ざんする中間者攻撃を受けるおそれがある",
        "アプリの起動速度が低下し、業務に支障が出るおそれがある",
        "サーバ側のストレージ容量が不足し、データが保存できなくなるおそれがある",
        "アプリのアイコンが正しく表示されなくなるおそれがある",
      ],
      answer: 0,
      explanation:
        "証明書の検証が正しく行われないと、攻撃者が偽の証明書を提示して正規のサーバになりすましても、アプリはそれを検知できずに通信を継続してしまう。この結果、通信経路上で内容を盗聴されたり改ざんされたりする中間者攻撃を受けるおそれがある。",
    },
    {
      id: "s5q19",
      no: 19,
      section: "sec",
      categoryLabel: "セキュリティ(外部記憶媒体の管理)",
      level: 3,
      lead: "再発防止策として、最も適切なものを選べ。",
      scenario: [
        "従業員110名のLL社では、私物のUSBメモリを自由に社内PCに接続できる運用になっていた。ある日、従業員が自宅で使用していた私物USBメモリを社内PCに接続したところ、そのUSBメモリに感染していたマルウェアが社内PCに感染し、社内ネットワークに拡散する被害が発生した。",
      ],
      description: [],
      code: null,
      choices: [
        "私物USBメモリの業務利用を原則禁止し、業務で外部媒体が必要な場合は許可制で管理された媒体のみ使用可能とする",
        "社内PCのモニターの解像度を統一する",
        "USBメモリの記憶容量が大きいものほど優先して使用を許可する",
        "従業員同士でUSBメモリを自由に貸し借りできるようにする",
      ],
      answer: 0,
      explanation:
        "私物の外部記憶媒体は、社外での利用によってマルウェアに感染している可能性があり、社内ネットワークへの感染経路になりうる。私物媒体の業務利用を原則禁止し、必要な場合は許可制で管理された媒体のみを使用可能とすることで、このような感染経路を遮断できる。",
    },
    {
      id: "s5q20",
      no: 20,
      section: "sec",
      categoryLabel: "セキュリティ(基礎知識)",
      level: 2,
      lead: "情報セキュリティ対策として、適切なものを選べ。",
      scenario: [
        "MM社の情報システム部門では、社内PCのソフトウェア管理に関する基礎知識の研修資料を作成している。",
      ],
      description: [],
      code: null,
      choices: [
        "OSやアプリケーションのセキュリティ更新プログラムを、提供され次第速やかに適用する運用を徹底する。",
        "動作の安定性を優先し、セキュリティ更新プログラムの適用を原則として行わない。",
        "サポートが終了した古いOSであっても、動作に問題がなければそのまま使い続ける。",
        "ソフトウェアの入手経路を問わず、無料で公開されているインストーラを優先して利用する。",
      ],
      answer: 0,
      explanation:
        "セキュリティ更新プログラム(セキュリティパッチ)を速やかに適用することは、既知の脆弱性を悪用した攻撃を防ぐための基本的かつ有効な対策である。他の選択肢は、更新プログラムの適用先送り・サポート終了OSの使用継続・出所不明なソフトウェアの利用など、いずれもセキュリティを損なう不適切な内容である。",
    },
  ],
};
