// FE科目B 模擬試験 第6回
// 問1〜16: 実務で使われるアルゴリズムの擬似言語化を中心に構成(難易度は問1→16にかけて上昇)
//          オブジェクト指向形式は連結リスト・スタック・キューに限定。間接参照(多段参照)を2問配置。
//          単純な穴埋め・一発でわかる問題は避け、多重ループ・再帰呼び出し回数・
//          ポインタの付け替え順序がトラップになる構造理解重視の問題を中心に据える。
// 問17〜20: 情報セキュリティ(長文シナリオ形式、4問すべて最高難度)
export default {
  id: "set6",
  title: "模擬試験 第6回",
  questions: [
    // ============ 問1〜16: アルゴリズム・プログラミング ============
    {
      id: "s6q1",
      no: 1,
      section: "algo",
      categoryLabel: "プログラムの基本要素",
      level: 1,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "動画配信サービスの月額料金は、当月の視聴時間(分)に応じた従量制である。視聴時間が0分の場合は基本料金0円、300分以内は500円、300分を超える場合は800円である。関数 planFee は、視聴時間(分)を表す0以上の整数を引数として受け取り、月額料金を返す。",
      ],
      code:
`○整数型: planFee(整数型: minutes)
  整数型: ret
  if (minutes が 0 と等しい)
    ret ← 0
  elseif ( a )
    ret ← 500
  else
    ret ← 800
  endif
  return ret`,
      choices: [
        "minutes が 300 以下",
        "minutes が 300 より小さい",
        "(minutes が 0 より大きい) and (minutes が 300 以下)",
        "minutes が 0 より大きい",
      ],
      answer: 0,
      explanation:
        "最初のifで「0と等しい」場合が既に処理済みなので、elseifに到達した時点で minutes は0より大きいことが確定している。よって `minutes が 300 以下` だけで条件は十分。",
    },
    {
      id: "s6q2",
      no: 2,
      section: "algo",
      categoryLabel: "配列",
      level: 1,
      lead: "次のプログラムを実行したとき、変数 errorCount に格納される値を答えよ。",
      description: [
        "システムのログを表す配列 logs から、ログレベルが \"ERROR\" であるものの件数を数える処理である。",
      ],
      code:
`文字列型の配列: logs ← {"INFO", "ERROR", "WARN", "ERROR", "INFO", "ERROR"}
整数型: errorCount ← 0
整数型: i

for (i を 1 から logsの要素数 まで 1 ずつ増やす)
  if (logs[i] が "ERROR" と等しい)
    errorCount ← errorCount + 1
  endif
endfor`,
      choices: ["3", "2", "4", "6"],
      answer: 0,
      explanation:
        "logs の中で \"ERROR\" は2番目・4番目・6番目の3か所に現れる。よって errorCount は最終的に3になる。",
    },
    {
      id: "s6q3",
      no: 3,
      section: "algo",
      categoryLabel: "文字列探索",
      level: 1,
      lead: "次のプログラムを countOccurrence(\"aaaa\", \"aa\") として呼び出したときの戻り値を答えよ。",
      description: [
        "関数 countOccurrence は、文字列 text の中に文字列 pattern が(位置が重なることを許して)何回出現するかを数える。開始位置を1つずつずらしながら、その位置から pattern と一致するかどうかを確認する。",
      ],
      code:
`○整数型: countOccurrence(文字列型: text, 文字列型: pattern)
  整数型: i, j, cnt ← 0
  論理型: match

  for (i を 1 から (textの文字数 - patternの文字数 + 1) まで 1 ずつ増やす)
    match ← 真
    for (j を 1 から patternの文字数 まで 1 ずつ増やす)
      if (textの(i + j - 1)文字目 が patternのj文字目 と等しくない)
        match ← 偽
      endif
    endfor
    if (match が 真)
      cnt ← cnt + 1
    endif
  endfor
  return cnt`,
      choices: ["3", "2", "1", "4"],
      answer: 0,
      explanation:
        "text=\"aaaa\"(4文字)、pattern=\"aa\"(2文字)なので、iは1から3まで動く。i=1: \"aa\"(1〜2文字目)と一致。i=2: \"aa\"(2〜3文字目)と一致。i=3: \"aa\"(3〜4文字目)と一致。位置の重なりを許すため、3回すべてで一致し、戻り値は3になる。",
    },
    {
      id: "s6q4",
      no: 4,
      section: "algo",
      categoryLabel: "スタック(構文チェック)",
      level: 2,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "関数 isBalanced は、文字列 expr 内の括弧 \"(\" と \")\" が正しく対応しているかどうかを、スタックを使って判定する(コンパイラの構文チェックなどで実務上よく使われる処理)。クラス Stack は、push(値)でスタックの先頭に値を積み、pop()で先頭の値を取り除いて返し、isEmpty()はスタックが空なら真を返す。",
      ],
      code:
`○論理型: isBalanced(文字列型: expr)
  Stack: st ← Stack()
  整数型: i
  for (i を 1 から exprの文字数 まで 1 ずつ増やす)
    if (exprのi文字目 が "(" と等しい)
      st.push(i)
    elseif (exprのi文字目 が ")" と等しい)
      if (st.isEmpty())
        return 偽
      endif
      a
    endif
  endfor
  return st.isEmpty()`,
      choices: ["st.pop()", "st.push(i)", "st.isEmpty()", "return 偽"],
      answer: 0,
      explanation:
        "閉じ括弧が見つかった場合、対応する開き括弧をスタックから取り除く(pop)必要がある。プログラム終了後にスタックが空であれば、すべての括弧が正しく対応していたことになる。",
    },
    {
      id: "s6q5",
      no: 5,
      section: "algo",
      categoryLabel: "間接参照(ハッシュ表によるキー探索)",
      level: 2,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "簡易的なハッシュ表を使って、社員番号から社員名を高速に検索する仕組みである。ハッシュ関数は「社員番号を3で割った余り+1」でバケット番号を求める。同じバケットに複数の社員が入る場合に備え、各バケットは社員番号の配列(bucketIds)と氏名の配列(bucketNames)を対応する添字で保持している。",
      ],
      code:
`整数型の配列の配列: bucketIds ← {{105, 204}, {103}, {104, 107}}
文字列型の配列の配列: bucketNames ← {{"田中", "高橋"}, {"鈴木"}, {"佐藤", "伊藤"}}
整数型: targetId ← 204
整数型: bucketIndex ← (targetId mod 3) + 1
整数型の配列: ids ← bucketIds[bucketIndex]
文字列型の配列: names ← bucketNames[bucketIndex]
整数型: i
文字列型: foundName ← "見つかりません"

for (i を 1 から idsの要素数 まで 1 ずつ増やす)
  if ( a )
    foundName ← names[i]
  endif
endfor`,
      choices: [
        "ids[i] が targetId と等しい",
        "names[i] が targetId と等しい",
        "bucketIndex が targetId と等しい",
        "ids[bucketIndex] が targetId と等しい",
      ],
      answer: 0,
      explanation:
        "ハッシュ関数によって targetId の格納先バケット(bucketIndex)を求めた後、そのバケット内を線形探索して一致する社員番号を探す必要がある。一致した位置iに対応する名前 names[i] を取り出すので、`ids[i] が targetId と等しい` が正しい。(この例では targetId=204 のとき bucketIndex=1、ids[1]=105(不一致)、ids[2]=204(一致)なので foundName は \"高橋\" となる。)",
    },
    {
      id: "s6q6",
      no: 6,
      section: "algo",
      categoryLabel: "実務処理(チェックデジット計算)",
      level: 2,
      lead: "次のプログラムを実行したとき、最終的な total の値を答えよ。",
      description: [
        "カード番号などの入力ミスを検知するために使われるチェックデジット計算(実務で使われるアルゴリズムを簡略化したもの)である。配列 digits には番号の各桁が左から順に格納されている。右端の桁から左に向かって1桁おきに値を2倍し、2倍した結果が9を超える場合は9を引く。全ての桁を合計する。",
      ],
      code:
`整数型の配列: digits ← {4, 5, 3, 9}
整数型: i, d
整数型: total ← 0
論理型: doubleFlag ← 偽

for (i を digitsの要素数 から 1 まで 1 ずつ減らす)
  d ← digits[i]
  if (doubleFlag が 真)
    d ← d × 2
    if (d が 9 より大きい)
      d ← d - 9
    endif
  endif
  total ← total + d
  doubleFlag ← not doubleFlag
endfor`,
      choices: ["28", "27", "29", "30"],
      answer: 0,
      explanation:
        "右端(digits[4]=9)から処理する。i=4: doubleFlag=偽なのでそのまま9を加算、total=9。i=3: doubleFlag=真、digits[3]=3を2倍して6(9を超えないのでそのまま)、total=9+6=15。i=2: doubleFlag=偽、digits[2]=5をそのまま加算、total=15+5=20。i=1: doubleFlag=真、digits[1]=4を2倍して8、total=20+8=28。よって最終的な total は28。",
    },
    {
      id: "s6q7",
      no: 7,
      section: "algo",
      categoryLabel: "リスト構造(整列位置への挿入)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "手続 insertSorted は、値が昇順に整列された単方向リストに新しい値 v を、順序を保ったまま適切な位置に挿入する。クラス Node は、値 val と次の要素への参照 next をもつ。head はリストの先頭ノードへの参照である。",
      ],
      code:
`手続 insertSorted(整数型: v)
  Node: newNode ← Node()
  newNode.val ← v
  if ((head が 未定義の値 と等しい) or (v が head.val より小さい))
    newNode.next ← head
    head ← newNode
    return
  endif
  Node: cur ← head
  while ((cur.next が 未定義の値 でない) and (cur.next.val が v より小さい))
    cur ← cur.next
  endwhile
  a
  cur.next ← newNode`,
      choices: [
        "newNode.next ← cur.next",
        "cur.next ← newNode",
        "newNode.next ← cur",
        "cur ← newNode",
      ],
      answer: 0,
      explanation:
        "curの直後にnewNodeを挿入するには、先にnewNode.nextをcurの(元の)次のノードに繋いでおく必要がある。この順序を守らずに先に `cur.next ← newNode` を実行してしまうと、curの元の次のノードへの参照を失ってしまう。よって `newNode.next ← cur.next` を先に実行するのが正しい。",
    },
    {
      id: "s6q8",
      no: 8,
      section: "algo",
      categoryLabel: "整列(早期終了つきバブルソート)",
      level: 3,
      lead: "次のプログラムを実行したとき、最終的な compareCount の値を答えよ。",
      description: [
        "通常のバブルソートに、「1回のパスで交換が一度も発生しなければ、それ以降のパスを打ち切る」という改良を加えたものである。比較(if文の評価)を行った回数を compareCount に記録する。",
      ],
      code:
`整数型の配列: data ← {2, 1, 3, 4, 5}
整数型: i, j, tmp
整数型: compareCount ← 0
論理型: swapped

for (i を 1 から (dataの要素数 - 1) まで 1 ずつ増やす)
  swapped ← 偽
  for (j を 1 から (dataの要素数 - i) まで 1 ずつ増やす)
    compareCount ← compareCount + 1
    if (data[j] が data[j+1] より大きい)
      tmp ← data[j]
      data[j] ← data[j+1]
      data[j+1] ← tmp
      swapped ← 真
    endif
  endfor
  if (swapped が 偽)
    ループを抜ける
  endif
endfor`,
      choices: ["7", "4", "10", "9"],
      answer: 0,
      explanation:
        "1回目のパス(i=1): jは1〜4の4回比較。data[1]=2とdata[2]=1を交換して{1,2,3,4,5}となり、他は交換なし(swapped=真)。compareCount=4。2回目のパス(i=2): jは1〜3の3回比較。すでに整列済みのため交換は一度も発生せず(swapped=偽)、compareCount=4+3=7になった時点でループを抜ける。よって最終的な compareCount は7。",
    },
    {
      id: "s6q9",
      no: 9,
      section: "algo",
      categoryLabel: "再帰(高速べき乗の呼び出し回数)",
      level: 3,
      lead: "次のプログラムを fastPow(2, 10) として呼び出したとき、乗算(×)が実行される回数の合計を答えよ。",
      description: [
        "関数 fastPow は、繰り返し二乗法によって base の exponent 乗を高速に計算する。",
      ],
      code:
`○整数型: fastPow(整数型: base, 整数型: exponent)
  if (exponent が 0 と等しい)
    return 1
  endif
  if ((exponent mod 2) が 0 と等しい)
    整数型: half ← fastPow(base, exponent ÷ 2 の商)
    return half × half
  endif
  return base × fastPow(base, exponent - 1)`,
      choices: ["5", "4", "6", "10"],
      answer: 0,
      explanation:
        "fastPow(2,10)→(偶数)half=fastPow(2,5)を求めた後 half×half で1回。fastPow(2,5)→(奇数)base×fastPow(2,4)で1回。fastPow(2,4)→half=fastPow(2,2)、half×halfで1回。fastPow(2,2)→half=fastPow(2,1)、half×halfで1回。fastPow(2,1)→base×fastPow(2,0)で1回。fastPow(2,0)は乗算なしでreturn 1。合計すると乗算は5回行われる。単純にbaseをexponent回掛け合わせる方法(9回の乗算が必要)より少ない回数で計算できる点が高速べき乗の利点である。",
    },
    {
      id: "s6q10",
      no: 10,
      section: "algo",
      categoryLabel: "キュー(ラウンドロビン処理)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "複数のプリンタジョブを、キューを使ったラウンドロビン方式で処理する(実務のOSのジョブスケジューリングでも使われる考え方)。各ジョブを1ページずつ印刷し、まだ印刷すべきページが残っていれば、そのジョブを再びキューの末尾に戻す。整数型の配列 remaining は、ジョブ番号を添字として残りページ数を管理する。",
      ],
      code:
`Queue: q ← Queue()
整数型の配列: remaining ← {3, 1, 2}
文字列型: log ← ""

q.enqueue(1)
q.enqueue(2)
q.enqueue(3)

while (q.isEmpty() が 偽)
  整数型: jobId ← q.dequeue()
  log ← log + jobIdの文字列
  remaining[jobId] ← remaining[jobId] - 1
  if (remaining[jobId] が 0 より大きい)
    a
  endif
endwhile`,
      choices: [
        "q.enqueue(jobId)",
        "q.dequeue()",
        "q.enqueue(remaining[jobId])",
        "remaining[jobId] ← remaining[jobId] + 1",
      ],
      answer: 0,
      explanation:
        "まだ印刷すべきページが残っているジョブは、再びキューの末尾に戻す(enqueue)ことでラウンドロビン方式の処理が実現される。よって `q.enqueue(jobId)` が正しい。",
    },
    {
      id: "s6q11",
      no: 11,
      section: "algo",
      categoryLabel: "間接参照(承認チェーンの多段参照)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "経費精算システムでは、申請金額が承認者の承認上限を超える場合、上位の承認者に自動的にエスカレーションされる。社員ごとの直属の上司(承認者)の社員番号は配列 approverOf に、各社員が承認できる金額の上限は配列 approvalLimit に、それぞれ社員番号を添字として格納されている(社員1は社長で上限は無制限)。関数 findApprover は、指定した金額 amount を承認できる最初の承認者の社員番号を、承認チェーンを再帰的に辿って求める。",
      ],
      code:
`整数型の配列: approverOf ← {0, 1, 1, 2, 3}
整数型の配列: approvalLimit ← {999999, 50000, 30000, 10000, 20000}

○整数型: findApprover(整数型: empId, 整数型: amount)
  if (approvalLimit[empId] が amount 以上)
    return empId
  endif
  return findApprover( a , amount)`,
      choices: ["approverOf[empId]", "empId", "approvalLimit[empId]", "approverOf[amount]"],
      answer: 0,
      explanation:
        "承認者(empId)自身の承認上限(approvalLimit[empId])がamount未満であれば、その承認者の上司(approverOf[empId])に対して再帰的に同じ判定を行う必要がある。よって `approverOf[empId]` が正しい。(この例では findApprover(4, 15000) を呼び出すと、社員4の上限10000円では足りないため上司である社員2(上限30000円)にエスカレーションされ、2が返る。)",
    },
    {
      id: "s6q12",
      no: 12,
      section: "algo",
      categoryLabel: "リスト構造(LRUキャッシュの更新)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "LRU(Least Recently Used)キャッシュを単方向リストで実装する。値にアクセスするたびに該当ノードをリストの先頭に移動させることで「最近使った順」を維持する。手続 touch は、値 key を持つノードを探して先頭に移動する(見つからない場合や既に先頭の場合は何もしない)。",
      ],
      code:
`手続 touch(整数型: key)
  if ((head が 未定義の値 と等しい) or (head.key が key と等しい))
    return
  endif
  Node: prev ← head
  Node: cur ← head.next
  while ((cur が 未定義の値 でない) and (cur.key が key と等しくない))
    prev ← cur
    cur ← cur.next
  endwhile
  if (cur が 未定義の値 と等しい)
    return
  endif
  a
  cur.next ← head
  head ← cur`,
      choices: [
        "prev.next ← cur.next",
        "prev.next ← cur",
        "cur.next ← prev",
        "head.next ← cur.next",
      ],
      answer: 0,
      explanation:
        "curをリストの元の位置から切り離すには、その直前のノード(prev)のnextを、curの次のノード(cur.next)につなぎ直す必要がある。この処理を、curの次のリンクを書き換える(cur.next ← head)より前に行わないと、curの元の次のノードへの参照を失ってしまう。よって `prev.next ← cur.next` が正しい。",
    },
    {
      id: "s6q13",
      no: 13,
      section: "algo",
      categoryLabel: "探索(floor探索)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。ここで、配列 data は昇順に整列済みとする。",
      description: [
        "在庫システムなどで「指定価格以下で最も高い商品」を探すのに使われる探索(floor探索)である。関数 floorSearch は、昇順に整列された配列 data の中から、target 以下の値を持つ最大の添字を返す(該当なしなら0)。",
      ],
      code:
`○整数型: floorSearch(整数型の配列: data, 整数型: target)
  整数型: low ← 1
  整数型: high ← dataの要素数
  整数型: result ← 0
  整数型: mid

  while (low が high 以下)
    mid ← (low + high) ÷ 2 の商
    if (data[mid] が target 以下)
      result ← mid
      low ← a
    else
      high ← mid - 1
    endif
  endwhile
  return result`,
      choices: ["mid + 1", "mid", "mid - 1", "high"],
      answer: 0,
      explanation:
        "data[mid]がtarget以下の場合、そのmidは候補としてresultに記録した上で、さらに大きい添字にも条件を満たすものがないか調べるため、low←mid+1として探索範囲を右側に絞り込む必要がある。",
    },
    {
      id: "s6q14",
      no: 14,
      section: "algo",
      categoryLabel: "文字列探索(単純照合法の巻き戻り回数)",
      level: 4,
      lead: "次のプログラムを実行したとき、最終的な mismatchCount の値を答えよ。",
      description: [
        "単純な文字列照合法では、比較の途中で不一致が見つかると、内側ループを打ち切って次の開始位置から比較をやり直す(巻き戻る)。この巻き戻りが発生した回数を mismatchCount に記録する。",
      ],
      code:
`文字列型: text ← "AABAACAABAA"
文字列型: pattern ← "AABAA"
整数型: i, j
整数型: mismatchCount ← 0

for (i を 1 から (textの文字数 - patternの文字数 + 1) まで 1 ずつ増やす)
  for (j を 1 から patternの文字数 まで 1 ずつ増やす)
    if (textの(i + j - 1)文字目 が patternのj文字目 と等しくない)
      mismatchCount ← mismatchCount + 1
      ループを抜ける
    endif
  endfor
endfor`,
      choices: ["5", "2", "7", "6"],
      answer: 0,
      explanation:
        "text(11文字)とpattern(5文字)なので、iは1から7まで動く。1文字ずつ丁寧に比較すると、i=1とi=7の開始位置では最後まで一致するため不一致は発生しない。それ以外のi=2,3,4,5,6の5か所では、比較の途中で不一致が見つかり、その時点で内側ループを抜ける(巻き戻る)。よって mismatchCount は最終的に5になる。",
    },
    {
      id: "s6q15",
      no: 15,
      section: "algo",
      categoryLabel: "実務処理(TTL付きキャッシュ)",
      level: 5,
      lead: "次のプログラムを実行したとき、4回の出力の内容を順に並べたものを選べ。",
      description: [
        "簡易的なキャッシュに、有効期限(TTL: Time To Live)の概念を導入する。関数 get は、指定したキーが存在し、かつ「保存時刻+TTL」が currentTime 以上であれば \"HIT\" を返し、期限切れまたはキーが存在しない場合は \"MISS\" を返す。",
      ],
      code:
`文字列型の配列: keys ← {"A", "B", "C"}
整数型の配列: storedAt ← {10, 15, 40}
整数型: TTL ← 20

○文字列型: get(文字列型: key, 整数型: currentTime)
  整数型: i
  for (i を 1 から keysの要素数 まで 1 ずつ増やす)
    if (keys[i] が key と等しい)
      if ((storedAt[i] + TTL) が currentTime 以上)
        return "HIT"
      else
        return "MISS"
      endif
    endif
  endfor
  return "MISS"

出力(get("A", 25))
出力(get("A", 35))
出力(get("B", 35))
出力(get("D", 20))`,
      choices: [
        "HIT, MISS, HIT, MISS",
        "HIT, HIT, MISS, MISS",
        "MISS, HIT, HIT, MISS",
        "HIT, MISS, MISS, MISS",
      ],
      answer: 0,
      explanation:
        "get(\"A\",25): storedAt[\"A\"]=10なので10+20=30。30が25以上なのでHIT。get(\"A\",35): 30は35未満なのでMISS(期限切れ)。get(\"B\",35): storedAt[\"B\"]=15なので15+20=35。35は35以上(境界値ちょうど)なのでHIT。get(\"D\",20): \"D\"というキーは存在しないのでMISS。よって順に HIT, MISS, HIT, MISS。境界値がちょうど一致する場合も「以上」なので有効と判定される点がトラップになっている。",
    },
    {
      id: "s6q16",
      no: 16,
      section: "algo",
      categoryLabel: "スタック・キュー(2スタックによるキュー実装)",
      level: 5,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "2つのスタック(inStack, outStack)を使ってキュー(FIFO)を実現する。enqueue(v)は常にinStackにvをpushする。dequeue()は、outStackが空であればinStackの中身をすべてoutStackに移し替えてから(この移し替えにより順序が反転し、先入れ先出しが実現される)、outStackの先頭をpopして返す。outStackが空でなければそのままpopする。",
      ],
      code:
`○整数型: dequeue()
  if (outStack.isEmpty())
    while (inStack.isEmpty() が 偽)
      a
    endwhile
  endif
  return outStack.pop()`,
      choices: [
        "outStack.push(inStack.pop())",
        "inStack.push(outStack.pop())",
        "outStack.push(outStack.pop())",
        "inStack.push(inStack.pop())",
      ],
      answer: 0,
      explanation:
        "outStackが空の場合、inStackに積まれている要素を1つずつpopし、outStackにpushして移し替える必要がある。この移し替えによって要素の順序が反転し(先に入れたものが先に出てくる)、結果としてキューのFIFO(先入れ先出し)の性質が実現される。よって `outStack.push(inStack.pop())` が正しい。",
    },

    // ============ 問17〜20: 情報セキュリティ(すべて最高難度) ============
    {
      id: "s6q17",
      no: 17,
      section: "sec",
      categoryLabel: "セキュリティ(IoTファームウェア署名検証)",
      level: 5,
      lead: "図1中の判明した事実を踏まえたとき、今回の事件の直接的な原因への一次的な責任を負う主体として、最も適切なものを選べ。",
      scenario: [
        "医療用IoT機器(輸液ポンプ)を製造するEE社は、機器のファームウェア更新機能をクラウド経由で提供している。ファームウェアの署名検証モジュールはFF社が開発し、更新の配信インフラにはGG社のIoTプラットフォームを利用している。ある日、悪意のある第三者が偽の署名を付けたファームウェアを機器に適用させることに成功し、機器が誤動作する事件が発生した。",
      ],
      description: [
        "図1 調査で判明した事実",
        "(一) FF社の署名検証モジュールには、検証に使う公開鍵が機器出荷時のデフォルト値のまま変更できない実装上の欠陥があり、攻撃者は事前に入手したデフォルト鍵のペアで偽造した署名を通過させていた。",
        "(二) GG社のIoTプラットフォームの配信経路(通信)は正しく暗号化されており、経路上の改ざんは確認されなかった。",
        "(三) EE社は機器出荷後、検証用の公開鍵をローテーション(定期的に更新)する運用ルールを定めていなかった。",
      ],
      code: null,
      choices: [
        "FF社(固定された鍵しか使えない署名検証モジュールの実装上の欠陥が、偽造署名を通過させた直接の原因であるため)",
        "GG社(ファームウェアの配信インフラに脆弱性があったため)",
        "EE社(鍵のローテーション運用を定めていなかったことが直接の原因であるため)",
        "FF社とGG社が共同で責任を負う",
      ],
      answer: 0,
      explanation:
        "(二)よりGG社の配信インフラ自体には問題がなかったことが確認されている。(三)のEE社における鍵ローテーション運用の欠如も課題ではあるが、そもそも鍵を変更する仕組み自体がFF社のモジュールに実装されていなかった((一))ため、EE社が運用ルールを整備していたとしても鍵を更新できなかった。偽造署名を通過させてしまった直接の原因は、鍵を固定のまま変更できないというFF社の実装上の欠陥にある。",
    },
    {
      id: "s6q18",
      no: 18,
      section: "sec",
      categoryLabel: "セキュリティ(APIキー管理・最小権限の原則)",
      level: 5,
      lead: "今回の被害の拡大を防ぐために、再発防止として最も本質的な対策を選べ。",
      scenario: [
        "フィンテック企業HH社は、複数の外部サービス連携のためにAPIキーを発行・管理している。ある開発者が、社内の全マイクロサービスが共通で使う「管理者権限相当」の単一のAPIキーを、誤ってGitHubの公開リポジトリにコミットしてしまった。数時間後に検知して失効させたが、その間に第三者によって顧客データの一部を読み取られる被害が発生した。事後調査で、そのAPIキーには本来読み取り専用で十分だった機能にも書き込み・削除権限が付与されていたことが判明した。",
      ],
      description: [],
      code: null,
      choices: [
        "APIキーをサービスごと・用途ごとに分割し、それぞれに必要最小限の権限のみを付与する(最小権限の原則を徹底する)",
        "APIキーの文字列の長さを現在よりも長くする",
        "GitHubのリポジトリを非公開から更に厳格な非公開設定に変更する",
        "APIキーの失効までの検知時間を短縮するため、監視間隔を短縮する",
      ],
      answer: 0,
      explanation:
        "今回の被害が拡大した本質的な原因は、単一の過剰な権限を持つAPIキーが漏えいしたことで、本来アクセスできないはずの機能にまで及んでしまった点にある。キーを用途ごとに分割し、必要最小限の権限のみを付与しておけば、たとえキーが漏えいしても被害の範囲(ブラスト半径)を限定できる。監視間隔の短縮(選択肢エ)は検知までの時間を縮める効果はあるが、漏えい自体や被害範囲の拡大を防ぐ本質的な対策にはならない。",
    },
    {
      id: "s6q19",
      no: 19,
      section: "sec",
      categoryLabel: "セキュリティ(サプライチェーン攻撃・依存関係管理)",
      level: 5,
      lead: "同様の被害を未然に防ぐための対策として、最も適切なものを選べ。",
      scenario: [
        "II社が開発するWebアプリケーションは、オープンソースの外部ライブラリを多数利用しており、ビルド時にパッケージ管理システムを通じて自動的に最新バージョンを取得する設定になっていた。ある日、依存関係の1つである人気ライブラリのメンテナーアカウントが乗っ取られ、悪意のあるコード(利用者の入力データを外部サーバに送信する処理)が新バージョンとして公開された。II社のビルドシステムはこの悪意のある新バージョンを自動的に取り込んで本番環境にデプロイしてしまい、顧客の入力データが外部に流出した。",
      ],
      description: [],
      code: null,
      choices: [
        "依存ライブラリのバージョンを固定し(ロックファイルの利用等)、更新時には差分やハッシュ値を確認したうえで、手動または承認プロセスを経て取り込む運用にする",
        "依存ライブラリの数をできるだけ増やし、1つのライブラリへの依存度を下げる",
        "ビルドサーバのディスク容量を増強し、ビルド時間を短縮する",
        "ライブラリの取得元を、より通信速度の速いミラーサーバに変更する",
      ],
      answer: 0,
      explanation:
        "今回の根本原因は、最新バージョンを無条件に自動で取り込む運用にあり、悪意のある更新がそのまま本番環境に混入してしまった点にある。バージョンを固定し、更新の際には内容を検証したうえで取り込む(サプライチェーンにおける変更管理)ことが本質的な対策となる。",
    },
    {
      id: "s6q20",
      no: 20,
      section: "sec",
      categoryLabel: "セキュリティ(監査ログの改ざん防止)",
      level: 5,
      lead: "再発防止のための対策として、最も適切なものを選べ。",
      scenario: [
        "JJ社では、システム管理者が自身の操作ログを記録しているが、そのログファイルは管理者自身の権限で自由に編集・削除できる場所に保存されていた。ある管理者が不正な操作を行った後、自分の操作ログを削除して証拠を隠滅する事件が発生し、事後調査が困難になった。",
      ],
      description: [],
      code: null,
      choices: [
        "操作ログを、記録した本人を含む誰であっても事後に変更・削除できない仕組み(改ざん防止機能を持つ外部のログ管理システムへの転送や、追記のみ許可する設定)で保管する",
        "管理者のパスワードの文字数を現在よりも長くする",
        "操作ログの保存先を、管理者の自宅からもアクセスできるようにする",
        "ログの記録項目を減らし、ファイルサイズを小さくする",
      ],
      answer: 0,
      explanation:
        "今回の問題の本質は、ログを記録した本人がそのログを改ざん・削除できてしまう権限設計にある。ログの記録者と管理者の権限を分離し、追記専用(WORM: Write Once Read Many)の仕組みや外部システムへの転送によって、本人であっても事後の改ざんができないようにすることが本質的な対策となる。",
    },
  ],
};
