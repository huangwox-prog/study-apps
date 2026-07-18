// FE科目B 模擬試験 第3回
// 問1〜16: 汎用アルゴリズム(トレース・穴埋め)+ 連結リスト・再帰・二分探索・整列・間接参照(A[B[i]]型)・文字列探索
//          (難易度は問1→16にかけて上昇、単純な値のトレースより構造理解を優先)
// 問17〜20: 情報セキュリティ(長文シナリオ形式、問17が最難、問20にかけて易化)
export default {
  id: "set3",
  title: "模擬試験 第3回",
  questions: [
    // ============ 問1〜16: アルゴリズム・プログラミング ============
    {
      id: "s3q1",
      no: 1,
      section: "algo",
      categoryLabel: "プログラムの基本要素",
      level: 1,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "図書館の延滞金は、延滞日数が0日の場合は0円、1日以上7日以内は延滞日数×10円、7日を超える場合は一律100円(上限)である。関数 lateFee は、延滞日数を表す0以上の整数を引数として受け取り、延滞金を返す。",
      ],
      code:
`○整数型: lateFee(整数型: days)
  整数型: ret
  if (days が 0 と等しい)
    ret ← 0
  elseif ( a )
    ret ← days × 10
  else
    ret ← 100
  endif
  return ret`,
      choices: [
        "days が 7 以下",
        "days が 7 より小さい",
        "(days が 1 以上) and (days が 7 以下)",
        "days が 1 以上",
      ],
      answer: 0,
      explanation:
        "最初のifで「0と等しい」場合が既に処理済みなので、elseifに到達した時点で days は1以上であることが確定している。よって `days が 7 以下` だけで条件は十分。",
    },
    {
      id: "s3q2",
      no: 2,
      section: "algo",
      categoryLabel: "配列",
      level: 1,
      lead: "次のプログラムを実行したとき、変数 minTemp に格納される値を答えよ。",
      description: [
        "整数型の配列 temps に格納された一週間分の気温の最小値を求めるプログラムである。",
      ],
      code:
`整数型の配列: temps ← {24, 28, 19, 31, 27, 22, 30}
整数型: minTemp ← temps[1]
整数型: i

for (i を 2 から tempsの要素数 まで 1 ずつ増やす)
  if (temps[i] が minTemp より小さい)
    minTemp ← temps[i]
  endif
endfor`,
      choices: ["19", "22", "24", "31"],
      answer: 0,
      explanation:
        "配列の中の最小値は19(3番目の要素)。ループで順に比較していくことで minTemp は最終的に19になる。",
    },
    {
      id: "s3q3",
      no: 3,
      section: "algo",
      categoryLabel: "文字列探索",
      level: 1,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "関数 findChar は、文字列 str の中で文字 target が最初に現れる位置(1始まり)を返す。見つからない場合は0を返す。",
      ],
      code:
`○整数型: findChar(文字列型: str, 文字列型: target)
  整数型: i
  for (i を 1 から strの文字数 まで 1 ずつ増やす)
    if ( a )
      return i
    endif
  endfor
  return 0`,
      choices: [
        "strのi文字目 が target と等しい",
        "strのi文字目 が target と等しくない",
        "str が target と等しい",
        "strの文字数 が i と等しい",
      ],
      answer: 0,
      explanation:
        "先頭から1文字ずつ調べ、strのi文字目がtargetと一致した時点で、その位置iを返せばよい。",
    },
    {
      id: "s3q4",
      no: 4,
      section: "algo",
      categoryLabel: "間接参照(添字配列)",
      level: 2,
      lead: "次のプログラムを実行したとき、result に格納される文字列を答えよ。",
      description: [
        "時間割データにおいて、各コマの教科コードが配列 subjectCode に格納されており、教科コードに対応する教科名は配列 subjectNames に格納されている。subjectNames[subjectCode[i]] のように、ある配列の値を別の配列の添字として使う間接参照によって教科名を求める。",
      ],
      code:
`文字列型の配列: subjectNames ← {"国語", "数学", "英語", "理科", "社会"}
整数型の配列: subjectCode ← {2, 4, 1, 3, 5}
整数型: i
文字列型: result ← ""

for (i を 1 から subjectCodeの要素数 まで 1 ずつ増やす)
  result ← result + subjectNames[subjectCode[i]] + " "
endfor`,
      choices: [
        "数学 理科 国語 英語 社会 ",
        "国語 数学 英語 理科 社会 ",
        "数学 国語 理科 英語 社会 ",
        "理科 数学 国語 社会 英語 ",
      ],
      answer: 0,
      explanation:
        "i=1: subjectCode[1]=2 → subjectNames[2]=\"数学\"。i=2: subjectCode[2]=4 → \"理科\"。i=3: subjectCode[3]=1 → \"国語\"。i=4: subjectCode[4]=3 → \"英語\"。i=5: subjectCode[5]=5 → \"社会\"。よって \"数学 理科 国語 英語 社会 \" となる。",
    },
    {
      id: "s3q5",
      no: 5,
      section: "algo",
      categoryLabel: "整列(バブルソート)",
      level: 2,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "次のプログラムは、バブルソートによって配列 data を昇順に並べ替える。隣り合う要素を比較し、順序が逆であれば交換する処理を繰り返す。",
      ],
      code:
`整数型の配列: data ← {5, 3, 8, 1, 9, 2}
整数型: i, j, tmp

for (i を 1 から (dataの要素数 - 1) まで 1 ずつ増やす)
  for (j を 1 から (dataの要素数 - i) まで 1 ずつ増やす)
    if ( a )
      tmp ← data[j]
      data[j] ← data[j+1]
      data[j+1] ← tmp
    endif
  endfor
endfor`,
      choices: [
        "data[j] が data[j+1] より大きい",
        "data[j] が data[j+1] より小さい",
        "data[j] が data[j+1] と等しい",
        "data[j+1] が data[j] より小さい",
      ],
      answer: 0,
      explanation:
        "昇順に並べ替えるには、隣り合う2要素のうち前の方(data[j])が後ろ(data[j+1])より大きい場合に交換すればよい。よって `data[j] が data[j+1] より大きい` が正しい。",
    },
    {
      id: "s3q6",
      no: 6,
      section: "algo",
      categoryLabel: "探索(二分探索の前提条件)",
      level: 2,
      lead: "関数 binSearch を正しく動作させるための前提条件として、最も適切なものを選べ。",
      description: [
        "関数 binSearch は、配列 data の中から二分探索によって target の位置を求める。",
      ],
      code: null,
      choices: [
        "呼び出す前に、配列 data が昇順に整列済みであること",
        "配列 data の要素数が偶数であること",
        "配列 data に重複した値が含まれていないこと",
        "配列 data の先頭要素が最小値であるとは限らないこと",
      ],
      answer: 0,
      explanation:
        "二分探索は、探索範囲の中央の値と目的の値を比較して範囲を半分に絞り込んでいくアルゴリズムであり、対象の配列があらかじめ整列済み(通常は昇順)であることが前提条件となる。整列されていない配列に適用すると、正しく探索できない。",
    },
    {
      id: "s3q7",
      no: 7,
      section: "algo",
      categoryLabel: "リスト構造(単方向連結リストの探索)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "関数 findNode は、単方向リストの中から値が target と一致する最初のノードを返す。見つからない場合は未定義の値を返す。クラス Node は、値 val と次の要素への参照 next をもつ。",
      ],
      code:
`○Node: findNode(整数型: target)
  Node: cur ← head
  while (cur が 未定義の値 でない)
    if (cur.val が target と等しい)
      return a
    endif
    cur ← cur.next
  endwhile
  return 未定義の値`,
      choices: ["cur", "cur.next", "target", "head"],
      answer: 0,
      explanation:
        "一致したノードそのものを返す必要があるので、ループ変数 `cur` をそのまま返せばよい。cur.next を返すと、一致したノードの次のノードを返してしまい誤りとなる。",
    },
    {
      id: "s3q8",
      no: 8,
      section: "algo",
      categoryLabel: "再帰(呼び出し順序の構造理解)",
      level: 3,
      lead: "次のプログラムを fib(5) として呼び出したとき、最初に値を返す(return文が最初に実行される)呼び出しはどれか、答えよ。",
      description: [
        "関数 fib はフィボナッチ数を再帰的に求める。式の評価は左側の項から先に行われるものとする。",
      ],
      code:
`○整数型: fib(整数型: n)
  if (n が 2 より小さい)
    return n
  endif
  return fib(n - 1) + fib(n - 2)`,
      choices: ["fib(1)", "fib(0)", "fib(2)", "fib(4)"],
      answer: 0,
      explanation:
        "左側の項から先に評価されるため、fib(5)→fib(4)→fib(3)→fib(2)→fib(1) と、引数を1ずつ減らしながら再帰呼び出しが連鎖する。fib(1) は n が2より小さいので、それ以上再帰せずに直ちに値(1)を返す。これが呼び出し全体の中で最初に実行されるreturn文である。",
    },
    {
      id: "s3q9",
      no: 9,
      section: "algo",
      categoryLabel: "文字列探索(部分文字列の一致判定)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "関数 contains は、文字列 str の中に部分文字列 sub が含まれているかどうかを、総当たりの比較によって判定する。str の各開始位置 i から、sub と同じ長さの部分がすべて一致するかを内側のループで確認する。",
      ],
      code:
`○論理型: contains(文字列型: str, 文字列型: sub)
  整数型: i, j
  論理型: match

  for (i を 1 から (strの文字数 - subの文字数 + 1) まで 1 ずつ増やす)
    match ← 真
    for (j を 1 から subの文字数 まで 1 ずつ増やす)
      if ( a )
        match ← 偽
      endif
    endfor
    if (match が 真)
      return 真
    endif
  endfor
  return 偽`,
      choices: [
        "strの(i + j - 1)文字目 が subのj文字目 と等しくない",
        "strのi文字目 が subのj文字目 と等しくない",
        "strの(i + j)文字目 が subのj文字目 と等しくない",
        "strの(i + j - 1)文字目 が subのi文字目 と等しくない",
      ],
      answer: 0,
      explanation:
        "str の位置 i から始まる部分が sub と一致するか調べている。sub の j文字目に対応する str 側の位置は (i + j - 1)文字目なので、両者が一致しない場合に match を偽にする必要がある。添字を i だけにしたり、j をずらしたりすると正しく比較できない。",
    },
    {
      id: "s3q10",
      no: 10,
      section: "algo",
      categoryLabel: "間接参照(2段階の間接参照)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "社員ごとの所属部署コードが配列 empDeptCode に格納されており、部署コードに対応する管轄フロア番号は配列 deptFloor に格納されている(deptFloorの添字が部署コードに対応する)。社員の氏名(empNames)と、その社員が所属する部署のフロア番号を、間接参照を使って出力する。",
      ],
      code:
`文字列型の配列: empNames ← {"山田", "佐藤", "鈴木"}
整数型の配列: empDeptCode ← {2, 1, 3}
整数型の配列: deptFloor ← {5, 3, 8}
整数型: i

for (i を 1 から empNamesの要素数 まで 1 ずつ増やす)
  出力(empNames[i] + ":" + deptFloor[ a ]の文字列)
endfor`,
      choices: [
        "empDeptCode[i]",
        "i",
        "empDeptCode[deptFloor[i]]",
        "deptFloor[i]",
      ],
      answer: 0,
      explanation:
        "社員 i の部署コードは empDeptCode[i] であり、この値を添字として deptFloor を参照することでフロア番号が得られる。empNames[i] → empDeptCode[i] → deptFloor[empDeptCode[i]] という2段階の間接参照になっている。",
    },
    {
      id: "s3q11",
      no: 11,
      section: "algo",
      categoryLabel: "整列(挿入ソートの過程理解)",
      level: 4,
      lead: "次のプログラムを実行したとき、外側のforループの1回目(i=2)の処理が終わった直後の配列 data の状態を選べ。",
      description: [
        "次のプログラムは、挿入ソートによって配列 data を昇順に整列する。",
      ],
      code:
`整数型の配列: data ← {5, 2, 8, 1, 9}
整数型: i, j, key

for (i を 2 から dataの要素数 まで 1 ずつ増やす)
  key ← data[i]
  j ← i - 1
  while ((j が 1 以上) and (data[j] が key より大きい))
    data[j+1] ← data[j]
    j ← j - 1
  endwhile
  data[j+1] ← key
endfor`,
      choices: [
        "{2, 5, 8, 1, 9}",
        "{5, 2, 8, 1, 9}",
        "{2, 8, 5, 1, 9}",
        "{5, 8, 2, 1, 9}",
      ],
      answer: 0,
      explanation:
        "i=2のとき key=data[2]=2, j=1。data[1]=5がkey(2)より大きいのでdata[2]←data[1]=5とし、j=0。j<1でwhileを抜け、data[j+1]=data[1]←key=2。よって配列は{2, 5, 8, 1, 9}になる。挿入ソートは、この時点で先頭2要素(2,5)だけが整列済みで、残りはまだ手つかずである点に注意する。",
    },
    {
      id: "s3q12",
      no: 12,
      section: "algo",
      categoryLabel: "リスト構造(双方向連結リストの削除)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "手続 deleteNode は、双方向連結リストから target ノードを削除する。クラス Node は、値 val のほか、前の要素への参照 prev と次の要素への参照 next をもつ。target の前後にノードが存在する場合、両側のつなぎ直しが必要になる。",
      ],
      code:
`手続 deleteNode(Node: target)
  if (target.prev が 未定義の値 でない)
    target.prev.next ← target.next
  endif
  if (target.next が 未定義の値 でない)
    a
  endif`,
      choices: [
        "target.next.prev ← target.prev",
        "target.next.prev ← target.next",
        "target.prev.next ← target.prev",
        "target.next ← target.prev",
      ],
      answer: 0,
      explanation:
        "target を削除した後、target の次にあったノードの prev は、target の前にあったノード(target.prev)を指すようにつなぎ直す必要がある。よって `target.next.prev ← target.prev` が正しい。",
    },
    {
      id: "s3q13",
      no: 13,
      section: "algo",
      categoryLabel: "再帰(木構造)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "配列 tree は二分木(以上)の子ノード構造を表し、tree[n] はノード n の子ノード番号の配列である(子がなければ空配列)。関数 height は、ノード n を根とする部分木の高さ(自分自身を1として数えた最大の深さ)を再帰的に求める。",
      ],
      code:
`整数型の配列の配列: tree ← {{2, 3}, {4}, {5, 6}, {}, {}, {}}

○整数型: height(整数型: n)
  if (tree[n]の要素数 が 0 と等しい)
    return 1
  endif
  整数型: maxChild ← 0
  整数型: i, h
  for (i を 1 から tree[n]の要素数 まで 1 ずつ増やす)
    h ← height(tree[n][i])
    if (h が maxChild より大きい)
      maxChild ← h
    endif
  endfor
  return a`,
      choices: ["maxChild + 1", "maxChild", "tree[n]の要素数 + 1", "maxChild - 1"],
      answer: 0,
      explanation:
        "各子の部分木の高さのうち最大のもの(maxChild)に、自分自身の分の1を加えた値が、ノードnを根とする部分木の高さになる。よって `maxChild + 1` が正しい。(参考: この木ではheight(1)=3となる。)",
    },
    {
      id: "s3q14",
      no: 14,
      section: "algo",
      categoryLabel: "探索(二分探索の応用)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。ここで、配列 data は昇順に整列済みとする。",
      description: [
        "関数 lowerBound は、昇順に整列された配列 data の中から、target 以上の値を持つ最小の添字を返す(該当するものがなければ dataの要素数+1 を返す)。",
      ],
      code:
`○整数型: lowerBound(整数型の配列: data, 整数型: target)
  整数型: low ← 1
  整数型: high ← dataの要素数 + 1
  整数型: mid

  while (low が high より小さい)
    mid ← (low + high) ÷ 2 の商
    if (data[mid] が target より小さい)
      low ← mid + 1
    else
      high ← a
    endif
  endwhile
  return low`,
      choices: ["mid", "mid - 1", "mid + 1", "low"],
      answer: 0,
      explanation:
        "data[mid] が target 以上のとき、mid はまだ答えの候補になり得るので範囲から除外してはいけない。よって `high ← mid` として mid を含めたまま範囲を狭める。`mid - 1` にすると、mid 自身が正しい答えだった場合にそれを除外してしまい、誤った結果になる。",
    },
    {
      id: "s3q15",
      no: 15,
      section: "algo",
      categoryLabel: "リスト構造(高度なポインタ操作)",
      level: 5,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "関数 findMiddle は、単方向リストの中央のノードを1回の走査で求める。ポインタ slow と fast の2つを先頭から同時に進め、slow は1つずつ、fast は2つずつ進める。fast がリストの末尾(またはその手前)に達した時点で、slow はちょうどリストの中央のノードを指している。",
      ],
      code:
`○Node: findMiddle()
  Node: slow ← head
  Node: fast ← head
  while ((fast が 未定義の値 でない) and (fast.next が 未定義の値 でない))
    slow ← slow.next
    fast ← a
  endwhile
  return slow`,
      choices: ["fast.next.next", "fast.next", "slow.next.next", "fast.next.next.next"],
      answer: 0,
      explanation:
        "fast を1回のループで2つ分先に進めることで、fast は slow の2倍の速さでリストを進む。これにより fast がリストの末尾付近に到達した時点で、slow はちょうどリストの中央に位置する。よって `fast ← fast.next.next` が正しい。",
    },
    {
      id: "s3q16",
      no: 16,
      section: "algo",
      categoryLabel: "再帰(メモ化)",
      level: 5,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "関数 fibMemo は、計算済みの値をキャッシュ配列 memo に保存しながらフィボナッチ数を再帰的に求める(メモ化)。memo の各要素は初期値0で、値が0でなければその添字に対応する計算結果が既にキャッシュされていることを表す(フィボナッチ数は常に0以上であり、n≧1では計算結果が0になることはないものとする)。",
      ],
      code:
`整数型の配列: memo ← {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}

○整数型: fibMemo(整数型: n)
  if (n が 2 より小さい)
    return n
  endif
  if (memo[n] が 0 と等しくない)
    return a
  endif
  整数型: result ← fibMemo(n - 1) + fibMemo(n - 2)
  memo[n] ← result
  return result`,
      choices: ["memo[n]", "result", "memo[n-1]", "n"],
      answer: 0,
      explanation:
        "memo[n] が0でない場合、そのノードについては既に計算済みであることを意味するので、再帰呼び出しを行わずキャッシュされている値 memo[n] をそのまま返せばよい。これにより同じ部分問題を何度も計算することを防ぎ(メモ化)、計算量を大幅に削減できる。",
    },

    // ============ 問17〜20: 情報セキュリティ ============
    {
      id: "s3q17",
      no: 17,
      section: "sec",
      categoryLabel: "セキュリティ(責任分担・インシデント対応)",
      level: 5,
      lead: "図1中の項番(一)〜(二)それぞれについて、直接的な原因および再発防止の一次的な責任を負う主体の適切な組合せを、解答群の中から選べ。",
      scenario: [
        "医療機関向け電子カルテクラウドサービスを提供するX社は、カルテデータの保管にY社が提供するIaaS環境を利用しており、バックアップの取得・世代管理はX社が独自に運用している。X社は電子カルテアプリケーションの開発・保守をZ社に委託しており、契約ではアプリケーションの脆弱性対策及び修正プログラムの適用はZ社が担当することになっている。",
        "ある日、X社の運用する仮想サーバがランサムウェアに感染し、カルテデータの一部が暗号化される被害が発生した。調査の結果、次の事実が判明した。",
      ],
      description: [
        "図1 判明した事実",
        "(一) 感染経路は、Z社が納品したアプリケーションに存在していた既知の脆弱性(修正プログラム未適用)を悪用したものであった。",
        "(二) バックアップは日次で取得されていたが、バックアップデータも本番環境と同一の仮想サーバ内に保存されており、ランサムウェアによって暗号化されてしまった。なお、IaaS基盤のネットワーク機器自体には脆弱性はなく、Y社側の設備に問題は確認されなかった。",
      ],
      code: null,
      choices: [
        "(一)Z社　(二)X社",
        "(一)X社　(二)Y社",
        "(一)Y社　(二)Z社",
        "(一)Z社　(二)Y社",
      ],
      answer: 0,
      explanation:
        "(一)修正プログラム未適用の脆弱性への対策は、契約上アプリケーションの保守を担うZ社の責任範囲である。(二)バックアップを本番環境と同一のサーバに保管し、世代管理や隔離を行っていなかったのは、バックアップ運用を担うX社自身の設計上の不備である。Y社が提供するIaaS基盤自体には問題が確認されていないため、Y社の責任は問えない。したがって(一)Z社(二)X社の組合せが正しい。",
    },
    {
      id: "s3q18",
      no: 18,
      section: "sec",
      categoryLabel: "セキュリティ(なりすましメール対策)",
      level: 4,
      lead: "この状況に対する対策として、最も適切なものを選べ。",
      scenario: [
        "従業員200名のAA社では、社外の第三者が従業員になりすまして取引先にメールを送るという被害が過去に発生したことを受け、情報システム部門が対策を検討している。調査の結果、AA社のメールサーバには送信ドメイン認証の設定がされておらず、第三者がAA社のドメインを詐称した送信元アドレスでメールを送信できてしまう状態になっていることが判明した。",
      ],
      description: [],
      code: null,
      choices: [
        "SPFやDKIMなどの送信ドメイン認証の仕組みを導入し、正規のメールサーバ以外からの送信を受信側で判別できるようにする",
        "全従業員のメールソフトの表示フォントを統一する",
        "社内で送受信されるメールの保存期間を短縮する",
        "メールに添付できるファイルのサイズ上限を引き下げる",
      ],
      answer: 0,
      explanation:
        "送信元ドメインの詐称を防ぐには、SPFやDKIM、それらを活用したDMARCといった送信ドメイン認証の仕組みを導入し、正規のメールサーバから送られたものかどうかを受信側で検証できるようにすることが有効な対策である。",
    },
    {
      id: "s3q19",
      no: 19,
      section: "sec",
      categoryLabel: "セキュリティ(権限分離)",
      level: 3,
      lead: "再発防止策として、最も適切なものを選べ。",
      scenario: [
        "従業員90名のBB社の経理システムでは、これまで経理部門の全従業員が、閲覧・入力・承認・振込実行のすべての機能にアクセスできる設定になっていた。ある日、経理担当者が自身の裁量で不正な振込を実行してしまう事件が発生し、原因を調査したところ、入力操作を行った担当者本人が、そのまま承認から振込実行までを1人で行える権限を持っていたことが分かった。",
      ],
      description: [],
      code: null,
      choices: [
        "入力操作を行った担当者とは別の担当者が承認・振込実行を行うよう、権限を分離する",
        "全従業員のパスワードの有効期限を短縮する",
        "経理システムのログイン画面のデザインを変更する",
        "振込処理にかかる時間を短縮するため、承認フローを廃止する",
      ],
      answer: 0,
      explanation:
        "1人の担当者が入力から承認・実行まで完結できてしまう権限設計は、内部不正を防ぐ牽制機能(職務分掌)が働かない状態である。入力者と承認・実行者を分離することで、不正な操作を1人だけでは完結できないようにすることが有効な対策となる。",
    },
    {
      id: "s3q20",
      no: 20,
      section: "sec",
      categoryLabel: "セキュリティ(基礎知識)",
      level: 2,
      lead: "情報セキュリティ対策として、適切なものを選べ。",
      scenario: [
        "CC社の総務部門では、社用ノートPCの紛失・盗難対策について、新入社員向けの研修資料を作成している。",
      ],
      description: [],
      code: null,
      choices: [
        "ノートPCのストレージ全体を暗号化しておくことで、紛失・盗難時に第三者がデータを読み取ることを防ぐ。",
        "パスワードを忘れないよう、PC本体にパスワードを記載した付箋を貼っておく。",
        "重要なデータは平文のまま複数のUSBメモリにコピーして、常に持ち歩く。",
        "PCの画面ロックの自動開始時間を無期限に設定し、離席時もロックがかからないようにする。",
      ],
      answer: 0,
      explanation:
        "ストレージ全体の暗号化(ディスク暗号化)は、PCの紛失・盗難時に第三者がデータを読み取ることを防ぐ基本的かつ有効な対策である。他の選択肢は、パスワードの記載・平文データの持ち歩き・画面ロックの無効化など、いずれもセキュリティを損なう不適切な内容である。",
    },
  ],
};
