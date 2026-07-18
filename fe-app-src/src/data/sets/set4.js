// FE科目B 模擬試験 第4回
// 問1〜16: 汎用アルゴリズム(トレース・穴埋め)+ 連結リスト・再帰・二分探索・整列・間接参照(A[B[i]]型)・文字列探索
//          (難易度は問1→16にかけて上昇、単純な値のトレースより構造理解を優先)
// 問17〜20: 情報セキュリティ(長文シナリオ形式、問17が最難、問20にかけて易化)
export default {
  id: "set4",
  title: "模擬試験 第4回",
  questions: [
    // ============ 問1〜16: アルゴリズム・プログラミング ============
    {
      id: "s4q1",
      no: 1,
      section: "algo",
      categoryLabel: "プログラムの基本要素",
      level: 1,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "駐車場の料金は、利用時間が30分以内は無料、30分を超え180分以内は200円、180分を超える場合は500円である。関数 parkingFee は、利用時間(分)を表す0以上の整数を引数として受け取り、料金を返す。",
      ],
      code:
`○整数型: parkingFee(整数型: minutes)
  整数型: ret
  if (minutes が 30 以下)
    ret ← 0
  elseif ( a )
    ret ← 200
  else
    ret ← 500
  endif
  return ret`,
      choices: [
        "minutes が 180 以下",
        "minutes が 180 より小さい",
        "(minutes が 30 より大きい) and (minutes が 180 以下)",
        "minutes が 30 より大きい",
      ],
      answer: 0,
      explanation:
        "最初のifで「30以下」が既に処理済みなので、elseifに到達した時点で minutes は30より大きいことが確定している。よって `minutes が 180 以下` だけで条件は十分。",
    },
    {
      id: "s4q2",
      no: 2,
      section: "algo",
      categoryLabel: "配列",
      level: 1,
      lead: "次のプログラムを実行したあと、配列 data の内容を答えよ。",
      description: [
        "配列 data の中から最大値を探し、その要素と先頭の要素(data[1])を入れ替えるプログラムである。",
      ],
      code:
`整数型の配列: data ← {12, 45, 7, 89, 33}
整数型: maxIdx ← 1
整数型: i, tmp

for (i を 2 から dataの要素数 まで 1 ずつ増やす)
  if (data[i] が data[maxIdx] より大きい)
    maxIdx ← i
  endif
endfor

tmp ← data[1]
data[1] ← data[maxIdx]
data[maxIdx] ← tmp`,
      choices: [
        "{89, 45, 7, 12, 33}",
        "{45, 89, 7, 12, 33}",
        "{12, 45, 7, 89, 33}",
        "{89, 45, 12, 7, 33}",
      ],
      answer: 0,
      explanation:
        "配列中の最大値は89(4番目、maxIdx=4)。data[1]とdata[4]を入れ替えるので、data[1]←89、data[4]←12(元のdata[1])となり、{89, 45, 7, 12, 33}になる。",
    },
    {
      id: "s4q3",
      no: 3,
      section: "algo",
      categoryLabel: "文字列探索",
      level: 1,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "関数 startsWith は、文字列 str が prefix で始まっているかどうかを判定する。",
      ],
      code:
`○論理型: startsWith(文字列型: str, 文字列型: prefix)
  整数型: i
  if (strの文字数 が prefixの文字数 より小さい)
    return 偽
  endif
  for (i を 1 から prefixの文字数 まで 1 ずつ増やす)
    if ( a )
      return 偽
    endif
  endfor
  return 真`,
      choices: [
        "strのi文字目 が prefixのi文字目 と等しくない",
        "strのi文字目 が prefixのi文字目 と等しい",
        "strの文字数 が prefixのi文字目 と等しくない",
        "strのi文字目 が strの1文字目 と等しくない",
      ],
      answer: 0,
      explanation:
        "先頭からprefixの文字数分だけ1文字ずつ比較し、1か所でも一致しない文字があれば「startsWithではない(偽)」と判定できる。よって `strのi文字目 が prefixのi文字目 と等しくない` 場合に偽を返すのが正しい。",
    },
    {
      id: "s4q4",
      no: 4,
      section: "algo",
      categoryLabel: "間接参照(添字配列)",
      level: 2,
      lead: "次のプログラムを実行したとき出力される文字列を、出力される順に並べたものを選べ。",
      description: [
        "会議室予約システムにおいて、予約された曜日番号が配列 dayCode に格納されており、曜日番号に対応する曜日名は配列 dayNames に格納されている(dayNames[1]が月曜、dayNames[7]が日曜)。",
      ],
      code:
`整数型の配列: dayCode ← {3, 1, 5, 7, 2}
文字列型の配列: dayNames ← {"月", "火", "水", "木", "金", "土", "日"}
整数型: i

for (i を 1 から dayCodeの要素数 まで 1 ずつ増やす)
  出力(dayNames[dayCode[i]])
endfor`,
      choices: [
        "水, 月, 金, 日, 火",
        "月, 火, 水, 木, 金",
        "水, 火, 金, 日, 月",
        "火, 月, 金, 日, 水",
      ],
      answer: 0,
      explanation:
        "dayCode[1]=3 → dayNames[3]=\"水\"。dayCode[2]=1 → \"月\"。dayCode[3]=5 → \"金\"。dayCode[4]=7 → \"日\"。dayCode[5]=2 → \"火\"。よって「水, 月, 金, 日, 火」の順になる。",
    },
    {
      id: "s4q5",
      no: 5,
      section: "algo",
      categoryLabel: "整列(選択ソート・降順)",
      level: 2,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "次のプログラムは、選択ソートによって配列 data を降順(大きい順)に並べ替える。maxIdx には、探索範囲内で最大値をもつ要素の添字を格納する。",
      ],
      code:
`整数型の配列: data ← {4, 9, 1, 7, 3}
整数型: i, j, maxIdx, tmp

for (i を 1 から (dataの要素数 - 1) まで 1 ずつ増やす)
  maxIdx ← i
  for (j を (i + 1) から dataの要素数 まで 1 ずつ増やす)
    if (data[j] が a )
      maxIdx ← j
    endif
  endfor
  tmp ← data[i]
  data[i] ← data[maxIdx]
  data[maxIdx] ← tmp
endfor`,
      choices: [
        "data[maxIdx] より大きい",
        "data[maxIdx] より小さい",
        "data[i] より大きい",
        "data[i] より小さい",
      ],
      answer: 0,
      explanation:
        "降順に並べ替えるので、現時点で見つかっている最大値(data[maxIdx])より大きい値が見つかるたびに maxIdx を更新する必要がある。よって `data[maxIdx] より大きい` が正しい。",
    },
    {
      id: "s4q6",
      no: 6,
      section: "algo",
      categoryLabel: "探索(計算量の理解)",
      level: 2,
      lead: "要素数が1000個の整列済み配列から、二分探索によって目的の値を探すとき、最悪の場合に必要な比較回数として最も近いものを選べ。",
      description: [],
      code: null,
      choices: ["約10回", "約100回", "約500回", "約1000回"],
      answer: 0,
      explanation:
        "二分探索は1回の比較で探索範囲をおよそ半分に絞り込めるため、要素数nに対しておよそlog₂n回の比較で見つかる。log₂1000は約10なので、最悪でも10回程度の比較で探索が完了する。これは、最悪1000回の比較が必要になりうる線形探索と比べて大幅に高速である。",
    },
    {
      id: "s4q7",
      no: 7,
      section: "algo",
      categoryLabel: "オブジェクト指向(木構造のノード数カウント)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "クラス TreeNode は二分木のノードを表す。メソッド count は、自分自身を根とする部分木に含まれるノードの総数を再帰的に求める。",
      ],
      code:
`クラス TreeNode
  整数型: val
  TreeNode: left ← 未定義の値
  TreeNode: right ← 未定義の値

  ○整数型: count()
    整数型: total ← 1
    if (left が 未定義の値 でない)
      total ← total + left.count()
    endif
    if (right が 未定義の値 でない)
      total ← a
    endif
    return total`,
      choices: ["total + right.count()", "total + right.val", "right.count()", "total + count()"],
      answer: 0,
      explanation:
        "自分自身の分(1)に、左部分木のノード数(left.count())と右部分木のノード数(right.count())を加えることで、この部分木全体のノード数が求まる。すでに total には自分自身と左部分木の分が加算されているので、`total + right.count()` が正しい。",
    },
    {
      id: "s4q8",
      no: 8,
      section: "algo",
      categoryLabel: "再帰(リストの長さ)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "関数 length は、単方向リストの長さ(ノード数)を再帰的に求める。",
      ],
      code:
`○整数型: length(Node: node)
  if (node が 未定義の値 と等しい)
    return 0
  endif
  return a`,
      choices: ["1 + length(node.next)", "length(node.next) + node", "1 + length(node)", "length(node) - 1"],
      answer: 0,
      explanation:
        "現在のノード自身の分を1としてカウントし、それ以降(node.next以降)の長さを再帰的に求めて加算する。よって `1 + length(node.next)` が正しい。",
    },
    {
      id: "s4q9",
      no: 9,
      section: "algo",
      categoryLabel: "間接参照(二次元配列との組合せ)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "教室の座席割り当てシステムである。受講者ごとの座席の行番号は rowOf に、列番号は colOf に格納されている。座席番号は、行番号と列番号の両方を使って二次元配列 seatMap を参照することで求まる。",
      ],
      code:
`整数型の配列: rowOf ← {2, 1, 3}
整数型の配列: colOf ← {3, 1, 2}
整数型の二次元配列: seatMap ← {{101, 102, 103}, {201, 202, 203}, {301, 302, 303}}
整数型: studentId ← 1

整数型: seatNumber ← seatMap[rowOf[studentId], a ]`,
      choices: ["colOf[studentId]", "rowOf[studentId]", "studentId", "seatMap[studentId]"],
      answer: 0,
      explanation:
        "座席番号は、行番号 rowOf[studentId] と列番号 colOf[studentId] の両方を使って二次元配列 seatMap を参照することで求まる。列側の添字に rowOf[studentId] を重複して使ってしまうなどの誤りに注意する必要がある。(この例では studentId=1 のとき、rowOf[1]=2、colOf[1]=3なので、seatNumber=seatMap[2, 3]=203となる。)",
    },
    {
      id: "s4q10",
      no: 10,
      section: "algo",
      categoryLabel: "間接参照(順位配列によるランキング表示)",
      level: 3,
      lead: "次のプログラムを実行したとき出力される文字列を、出力される順に並べたものを選べ。",
      description: [
        "商品の売上ランキングを表示する処理である。商品名は items、売上数は sales に、同じ添字で対応して格納されている。あらかじめ売上の多い順に並べた添字の配列 rankOrder が用意されており、これを使って上位3件だけを表示する。",
      ],
      code:
`文字列型の配列: items ← {"ノートPC", "マウス", "キーボード", "モニタ", "USBメモリ"}
整数型の配列: sales ← {120, 340, 95, 210, 60}
整数型の配列: rankOrder ← {2, 4, 1, 3, 5}
整数型: i

for (i を 1 から 3 まで 1 ずつ増やす)
  出力(items[rankOrder[i]] + ":" + sales[rankOrder[i]]の文字列)
endfor`,
      choices: [
        "マウス:340, モニタ:210, ノートPC:120",
        "ノートPC:120, マウス:340, キーボード:95",
        "マウス:340, ノートPC:120, モニタ:210",
        "モニタ:210, マウス:340, ノートPC:120",
      ],
      answer: 0,
      explanation:
        "rankOrder[1]=2 → items[2]=\"マウス\", sales[2]=340。rankOrder[2]=4 → \"モニタ\":210。rankOrder[3]=1 → \"ノートPC\":120。元の items・sales 配列自体は並べ替えず、rankOrder という間接参照用の配列だけで表示順を制御している点がポイント。",
    },
    {
      id: "s4q11",
      no: 11,
      section: "algo",
      categoryLabel: "整列(クイックソートのpartition処理)",
      level: 4,
      lead: "次のプログラムを実行した直後の配列 data の状態を選べ。",
      description: [
        "次のプログラムは、クイックソートで使われるpartition処理である。配列の末尾要素(data[high])をpivotとし、pivot以下の値を配列の左側に集めたあと、最後にpivotを正しい位置へ移動する。",
      ],
      code:
`整数型の配列: data ← {5, 1, 6, 2, 4}
整数型: low ← 1
整数型: high ← 5
整数型: pivot ← data[high]
整数型: i ← low - 1
整数型: j, tmp

for (j を low から (high - 1) まで 1 ずつ増やす)
  if (data[j] が pivot 以下)
    i ← i + 1
    tmp ← data[i]
    data[i] ← data[j]
    data[j] ← tmp
  endif
endfor
tmp ← data[i+1]
data[i+1] ← data[high]
data[high] ← tmp`,
      choices: [
        "{1, 2, 4, 5, 6}",
        "{1, 2, 5, 6, 4}",
        "{5, 1, 2, 4, 6}",
        "{1, 5, 2, 6, 4}",
      ],
      answer: 0,
      explanation:
        "pivot=data[5]=4。j=1: data[1]=5>4なので何もしない。j=2: data[2]=1≦4なのでi=1、data[1]とdata[2]を交換→{1,5,6,2,4}。j=3: data[3]=6>4なので何もしない。j=4: data[4]=2≦4なのでi=2、data[2]とdata[4]を交換→{1,2,6,5,4}。最後にdata[i+1]=data[3]とdata[high]=data[5]を交換→{1,2,4,5,6}。pivotの4が正しい位置(3番目)に収まり、その左側は4以下、右側は4より大きい値になっている。",
    },
    {
      id: "s4q12",
      no: 12,
      section: "algo",
      categoryLabel: "リスト構造(双方向連結リストの不具合分析)",
      level: 4,
      lead: "リスト A→B→C(tail=C)に対して append(D)、続けて append(E) を呼び出した後、tail から先頭方向(prevを辿る方向)に走査したときに出力される文字列を答えよ。",
      description: [
        "双方向連結リストの末尾に新しいノードを追加する手続 append には、tail変数の更新を忘れるというバグがある(newNode.prev と直前ノードの next は正しく設定されるが、tail自体は更新されない)。",
      ],
      code:
`手続 append(Node: newNode)
  newNode.prev ← tail
  tail.next ← newNode
  ※ tail ← newNode を書き忘れている(バグ)`,
      choices: ["CBA", "EDCBA", "ECBA", "DCBA"],
      answer: 0,
      explanation:
        "append(D)実行時、D.prev←C、C.next←Dとなるが、tailはCのまま更新されない。続くappend(E)では、tail(まだC)を基準に処理するため E.prev←C、C.next←E となり、C.nextがDからEに上書きされてDは正方向からも辿れなくなる。しかもtailは相変わらずCを指したままなので、tailから逆方向(prevを辿る方向)に走査してもD・Eには一切到達できず、出力は元のリストの範囲である \"CBA\" のみとなる。",
    },
    {
      id: "s4q13",
      no: 13,
      section: "algo",
      categoryLabel: "再帰(二分探索木)",
      level: 4,
      lead: "次のプログラム中の a 、 b に入れる正しい答えの組合せを、解答群の中から選べ。",
      description: [
        "配列 val, left, right によって二分探索木(BST)を表す(添字1がノード番号、0は「子がない」ことを表す)。関数 bstSearch は、ノード n を根とするBSTから target を再帰的に探索し、見つかったノード番号を返す(見つからなければ0)。BSTでは、各ノードについて、左部分木の値はすべてそのノードの値より小さく、右部分木の値はすべて大きい。",
      ],
      code:
`整数型の配列: val ← {0, 8, 3, 10, 1, 6, 14}
整数型の配列: left ← {0, 2, 4, 0, 0, 0, 0}
整数型の配列: right ← {0, 3, 5, 6, 0, 0, 0}

○整数型: bstSearch(整数型: n, 整数型: target)
  if (n が 0 と等しい)
    return 0
  endif
  if (val[n] が target と等しい)
    return n
  endif
  if (target が val[n] より小さい)
    return bstSearch(a, target)
  else
    return bstSearch(b, target)
  endif`,
      choices: [
        "a: left[n]　b: right[n]",
        "a: right[n]　b: left[n]",
        "a: left[n]　b: left[n]",
        "a: n - 1　b: n + 1",
      ],
      answer: 0,
      explanation:
        "BSTでは、目的の値targetが現在のノードの値val[n]より小さければ左部分木(left[n])を、大きければ右部分木(right[n])を再帰的に探索すればよい。よって a: left[n]、b: right[n] が正しい。",
    },
    {
      id: "s4q14",
      no: 14,
      section: "algo",
      categoryLabel: "探索(二分探索のデバッグ)",
      level: 4,
      lead: "次の関数 binSearch には誤りがあり、特定の入力で無限ループに陥ることがある。誤りの箇所として最も適切なものを選べ。",
      description: [
        "配列 data は昇順に整列済みであるとする。",
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
      low ← mid
    else
      high ← mid - 1
    endif
  endwhile
  return 0`,
      choices: [
        "low ← mid となっている部分。正しくは low ← mid + 1 でなければ、low と high の差が1のとき無限ループに陥る可能性がある。",
        "high ← mid - 1 となっている部分。正しくは high ← mid でなければならない。",
        "mid ← (low + high) ÷ 2 の商 となっている部分。正しくは mid ← (low + high + 1) ÷ 2 の商 でなければならない。",
        "while (low が high 以下) となっている部分。正しくは low が high より小さい でなければならない。",
      ],
      answer: 0,
      explanation:
        "data[mid]がtargetより小さい場合、mid自身はもう候補にならないためlowはmid+1に進めるべきだが、このプログラムではlow←midとしている。high=low+1のときmid=(low+high)÷2の商=lowとなり、lowが更新されないまま同じ状態が繰り返され、無限ループに陥る可能性がある。",
    },
    {
      id: "s4q15",
      no: 15,
      section: "algo",
      categoryLabel: "リスト構造(逆順化と位置参照の複合)",
      level: 5,
      lead: "リスト 1→2→3→4→5(値がそのままノードのvalとする)に対して、reverseList() を実行した後に getKthValue(2) を呼び出したとき、result に格納される値を答えよ。",
      description: [
        "手続 reverseList は単方向リストを逆順化する。関数 getKthValue(k) は、現在の head から数えて先頭からk番目(1始まり)のノードの値を返す。",
      ],
      code:
`手続 reverseList()
  Node: prev ← 未定義の値
  Node: cur ← head
  Node: nextNode
  while (cur が 未定義の値 でない)
    nextNode ← cur.next
    cur.next ← prev
    prev ← cur
    cur ← nextNode
  endwhile
  head ← prev

○整数型: getKthValue(整数型: k)
  Node: cur ← head
  整数型: i
  for (i を 1 から (k - 1) まで 1 ずつ増やす)
    cur ← cur.next
  endfor
  return cur.val

reverseList()
整数型: result ← getKthValue(2)`,
      choices: ["4", "2", "5", "1"],
      answer: 0,
      explanation:
        "reverseList実行後、リストは 5→4→3→2→1 の順になる(headは元の末尾だった5を指す)。getKthValue(2)は先頭から2番目のノードを取得するので、逆順化後の2番目である4が返る。逆順化してから位置を数えるという2段階の処理を正しく追跡できるかがポイント。",
    },
    {
      id: "s4q16",
      no: 16,
      section: "algo",
      categoryLabel: "再帰・間接参照(組織図の人件費集計)",
      level: 5,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "組織構造は、各ノードの子ノード番号の配列 tree で表される。各ノードの給与は、給与コードの配列 salaryCode と、コードごとの金額を表す配列 salaryTable(添字が給与コードに対応)を使った間接参照 salaryTable[salaryCode[n]] によって求める。関数 totalCost は、ノード n を根とする部分組織の給与合計を再帰的に求める。",
      ],
      code:
`整数型の配列の配列: tree ← {{2, 3}, {4}, {}, {}}
整数型の配列: salaryCode ← {3, 1, 2, 2}
整数型の配列: salaryTable ← {250, 320, 400}

○整数型: totalCost(整数型: n)
  整数型: total ← salaryTable[salaryCode[n]]
  整数型: i
  for (i を 1 から tree[n]の要素数 まで 1 ずつ増やす)
    total ← total + totalCost(a)
  endfor
  return total`,
      choices: ["tree[n][i]", "tree[i][n]", "salaryCode[n][i]", "tree[n]"],
      answer: 0,
      explanation:
        "ノードnのi番目の子ノード番号は tree[n][i] である。この子ノードを根とする部分組織の給与合計を再帰的に求めて加算していく必要があるので、`totalCost(tree[n][i])` が正しい。(参考: この例ではtotalCost(1)=1290となる。)",
    },

    // ============ 問17〜20: 情報セキュリティ ============
    {
      id: "s4q17",
      no: 17,
      section: "sec",
      categoryLabel: "セキュリティ(責任分担・複合原因の切り分け)",
      level: 5,
      lead: "(一)〜(三)を踏まえたとき、今回の情報漏えいについて一次的な責任を負う主体として、最も適切なものを選べ。",
      scenario: [
        "建設業向け図面管理SaaSを提供するDD社は、図面データの保存にEE社が提供するオブジェクトストレージサービスを利用しており、アクセス制御の設定はDD社が行う契約になっている。また、図面のアップロード機能を含むフロントエンドの開発は、DD社が外部のFF社に委託している。",
        "ある日、検索エンジン経由で図面データに第三者がアクセスできる状態になっていることが発覚した。調査の結果、次の事実が判明した。",
      ],
      description: [
        "図1 判明した事実",
        "(一) ストレージのアクセス制御設定が「認証なしで誰でも閲覧可能」になっていた。",
        "(二) FF社が実装したアップロード機能には、アップロード時にファイルの公開範囲を自動的に「限定公開」に設定するはずの処理が実装されておらず、常に既定値(EE社のサービスにおける初期設定である「非公開」)のまま保存される仕様だった。",
        "(三) 今回漏えいした図面は、DD社の運用担当者が緊急対応のため手作業でアクセス制御を変更した際に、誤って「全体公開」に設定してしまったものだった。",
      ],
      code: null,
      choices: [
        "DD社(手作業による設定変更を誤ったDD社の運用担当者が、実際の漏えいを引き起こしているため)",
        "FF社(アップロード機能の実装に不備があったため)",
        "EE社(ストレージサービスの初期設定に問題があったため)",
        "DD社・EE社・FF社が均等に責任を負う",
      ],
      answer: 0,
      explanation:
        "(二)のFF社の実装不備は、既定で「非公開」のまま保存される仕様であり、EE社の安全な初期設定を維持するものであったため、直接の漏えい原因ではない。実際に漏えいを引き起こしたのは、(三)のDD社の運用担当者が手作業で誤って「全体公開」に変更したことである。EE社のストレージサービス自体にも問題は確認されていない。したがって、一次的な責任はDD社にある。",
    },
    {
      id: "s4q18",
      no: 18,
      section: "sec",
      categoryLabel: "セキュリティ(標的型攻撃メール)",
      level: 4,
      lead: "このような状況において、標的型攻撃メールによるマクロ実行のリスクを低減する対策として、最も適切なものを選べ。",
      scenario: [
        "従業員300名のGG社では、ある社員が取引先を装った標的型攻撃メールの添付ファイル(Excelファイル)を開き、表示された「コンテンツの有効化」ボタンをクリックしてマクロを実行してしまい、PCがマルウェアに感染した。調査の結果、GG社では業務上正当なマクロ付きExcelファイルを日常的にやり取りしており、マクロの実行を組織的に一律禁止することは難しい状況だった。",
      ],
      description: [],
      code: null,
      choices: [
        "信頼できる送信元や保存場所からのファイルのみマクロの実行を許可し、それ以外は自動的にマクロを無効化する設定を導入する",
        "全従業員に対して、添付ファイルを必ず開いて内容を確認するよう指示を徹底する",
        "受信メールの保存先フォルダの表示順序を送信日時順に変更する",
        "社内で使用するExcelファイルのバージョンを全社員で統一する",
      ],
      answer: 0,
      explanation:
        "業務上マクロの利用自体を完全に禁止できない場合でも、信頼できる送信元・保存場所からのファイルに限ってマクロの実行を許可し、それ以外は既定で無効化する設定にすることで、業務への影響を抑えつつ、不審な添付ファイル経由のマクロ実行によるマルウェア感染のリスクを大きく低減できる。",
    },
    {
      id: "s4q19",
      no: 19,
      section: "sec",
      categoryLabel: "セキュリティ(共有リンクの設定ミス)",
      level: 3,
      lead: "再発防止策として、最も適切なものを選べ。",
      scenario: [
        "従業員70名のHH社では、外部の取引先とファイルを共有する際に、クラウドストレージサービスの共有リンク機能を利用している。ある社員が、本来は特定の取引先1社にのみ共有するはずだったファイルについて、リンクの共有範囲を「リンクを知っている全員が閲覧可能」に設定した状態でURLをメールに記載して送信してしまい、そのURLが第三者に転送されたことで、意図しない相手にファイルの内容が閲覧される事態が発生した。",
      ],
      description: [],
      code: null,
      choices: [
        "共有リンクの既定の公開範囲を「特定のユーザーのみ」に設定し、共有先を都度指定するよう運用を見直す",
        "ファイルのアップロード速度を向上させるため、ファイルサイズの上限を引き上げる",
        "取引先とのメールのやり取りをすべて紙媒体に切り替える",
        "共有リンクのURLをより短い文字列に変更する",
      ],
      answer: 0,
      explanation:
        "共有リンクの既定の公開範囲を、特定のユーザーのみがアクセスできる設定にしておくことで、担当者が設定を変更し忘れた場合でも、意図しない相手にファイルが公開されてしまうリスクを低減できる。",
    },
    {
      id: "s4q20",
      no: 20,
      section: "sec",
      categoryLabel: "セキュリティ(ソーシャルエンジニアリング対策)",
      level: 2,
      lead: "ソーシャルエンジニアリング対策として、適切なものを選べ。",
      scenario: [
        "II社の総務部門では、来訪者対応や電話応対に関するセキュリティ研修資料を作成している。",
      ],
      description: [],
      code: null,
      choices: [
        "社内システムの担当者を名乗る電話でパスワードを聞かれても、その場では教えず、正規の手続きを通じて本人確認を行う。",
        "業務を円滑に進めるため、身分証を提示しない来訪者でも、急いでいる様子であれば入館させる。",
        "電話で緊急を装われた場合は、確認の手間を省き、要求された情報をできるだけ早く伝える。",
        "社内の座席表や組織図は、誰でも自由に閲覧・持ち出しできるようにしておく。",
      ],
      answer: 0,
      explanation:
        "ソーシャルエンジニアリングは、緊急性や権威を装って相手を焦らせ、正規の確認手続きを省かせようとする手口が多い。電話等でパスワードや機密情報を求められても、その場では答えず、正規の手続きで本人確認を行うことが基本的な対策となる。",
    },
  ],
};
