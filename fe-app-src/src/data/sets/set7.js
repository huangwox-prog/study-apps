// FE科目B 模擬試験 第7回
// 問1〜16: 実務で使われるアルゴリズムの擬似言語化を中心に構成(難易度は問1→16にかけて上昇)
//          オブジェクト指向形式は連結リスト・スタック・キューに限定。間接参照(多段参照)を2問配置。
//          単純な穴埋め・一発でわかる問題は避け、多重ループ・再帰呼び出し回数・
//          ポインタの付け替え順序がトラップになる構造理解重視の問題を中心に据える。
// 問17〜20: 情報セキュリティ(長文シナリオ形式、4問すべて最高難度)
export default {
  id: "set7",
  title: "模擬試験 第7回",
  questions: [
    // ============ 問1〜16: アルゴリズム・プログラミング ============
    {
      id: "s7q1",
      no: 1,
      section: "algo",
      categoryLabel: "プログラムの基本要素",
      level: 1,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "通販サイトの会員ランクごとのポイント還元率は、購入金額累計が10万円以上でゴールド会員(還元率5%)、3万円以上10万円未満でシルバー会員(還元率3%)、3万円未満はブロンズ会員(還元率1%)である。関数 pointRate は、購入金額累計を表す0以上の整数を引数として受け取り、還元率(%)を返す。",
      ],
      code:
`○整数型: pointRate(整数型: total)
  整数型: ret
  if (total が 100000 以上)
    ret ← 5
  elseif ( a )
    ret ← 3
  else
    ret ← 1
  endif
  return ret`,
      choices: [
        "total が 30000 以上",
        "total が 30000 より大きい",
        "(total が 30000 以上) and (total が 100000 未満)",
        "total が 100000 未満",
      ],
      answer: 0,
      explanation:
        "最初のifで「100000以上」が既に処理済みなので、elseifに到達した時点で total は100000未満であることが確定している。よって `total が 30000 以上` だけで条件は十分。",
    },
    {
      id: "s7q2",
      no: 2,
      section: "algo",
      categoryLabel: "配列",
      level: 1,
      lead: "次のプログラムを実行したとき、変数 maxIdx に格納される値を答えよ。",
      description: [
        "商品ごとの売上高が格納された配列 sales から、最も売上の多い商品の添字を求める処理である。",
      ],
      code:
`整数型の配列: sales ← {320, 450, 280, 610, 390}
整数型: maxIdx ← 1
整数型: i

for (i を 2 から salesの要素数 まで 1 ずつ増やす)
  if (sales[i] が sales[maxIdx] より大きい)
    maxIdx ← i
  endif
endfor`,
      choices: ["4", "2", "5", "3"],
      answer: 0,
      explanation:
        "sales の中で最大値は610(4番目の要素)。ループで順に比較していくことで、maxIdx は最終的に4になる。",
    },
    {
      id: "s7q3",
      no: 3,
      section: "algo",
      categoryLabel: "文字列探索",
      level: 1,
      lead: "次のプログラムを findAt(\"taro.yamada@example.com\") として呼び出したときの戻り値を答えよ。",
      description: [
        "関数 findAt は、文字列 email の中で最初に現れる \"@\" の位置(1始まり)を返す(見つからない場合は0)。",
      ],
      code:
`○整数型: findAt(文字列型: email)
  整数型: i
  for (i を 1 から emailの文字数 まで 1 ずつ増やす)
    if (emailのi文字目 が "@" と等しい)
      return i
    endif
  endfor
  return 0`,
      choices: ["12", "11", "13", "10"],
      answer: 0,
      explanation:
        "\"taro.yamada@example.com\" の \"taro.yamada\" 部分は11文字(t,a,r,o,.,y,a,m,a,d,a)であり、その直後の12文字目が \"@\" である。よって戻り値は12。",
    },
    {
      id: "s7q4",
      no: 4,
      section: "algo",
      categoryLabel: "キュー(優先呼び出し)",
      level: 2,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "コールセンターでは、着信した順に顧客を通常のキュー(normalQueue)に並ばせるが、VIP顧客は別の優先キュー(vipQueue)に並ぶ。オペレーターが空いたときは、優先キューが空でない限りそちらを先に処理する。",
      ],
      code:
`○整数型: nextCustomer()
  if (vipQueue.isEmpty() が 偽)
    return a
  endif
  return normalQueue.dequeue()`,
      choices: [
        "vipQueue.dequeue()",
        "normalQueue.dequeue()",
        "vipQueue.isEmpty()",
        "vipQueue.enqueue()",
      ],
      answer: 0,
      explanation:
        "vipQueueが空でない(＝VIP顧客が待っている)場合は、そちらを優先して処理する必要があるので `vipQueue.dequeue()` が正しい。",
    },
    {
      id: "s7q5",
      no: 5,
      section: "algo",
      categoryLabel: "間接参照(複数コード体系の使い分け)",
      level: 2,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "店舗のPOSシステムでは、商品バーコードから商品カテゴリコードを求め(barcodeToCategory)、カテゴリコードから適用される税率を求める(categoryToTaxRate)、という2段階の間接参照によって税率を求める。",
      ],
      code:
`整数型の配列: barcodeToCategory ← {2, 1, 1, 3}
整数型の配列: categoryToTaxRate ← {10, 8, 10}
整数型: barcodeId ← 4

整数型: taxRate ← categoryToTaxRate[ a ]`,
      choices: [
        "barcodeToCategory[barcodeId]",
        "categoryToTaxRate[barcodeId]",
        "barcodeId",
        "barcodeToCategory[taxRate]",
      ],
      answer: 0,
      explanation:
        "barcodeId=4の商品カテゴリは barcodeToCategory[4]=3(カテゴリコード3)。categoryToTaxRate[3]=10なので、適用される税率は10%となる。よって空欄には `barcodeToCategory[barcodeId]` が入る。",
    },
    {
      id: "s7q6",
      no: 6,
      section: "algo",
      categoryLabel: "実務処理(移動平均の計算)",
      level: 2,
      lead: "次のプログラムを実行したとき、配列 movingAvg の内容を答えよ。",
      description: [
        "直近3日分の売上データから、日ごとの移動平均(直近3日間の平均値)を計算する処理である。",
      ],
      code:
`整数型の配列: sales ← {100, 150, 200, 130, 170}
整数型の配列: movingAvg ← {}
整数型: i, sum

for (i を 3 から salesの要素数 まで 1 ずつ増やす)
  sum ← sales[i-2] + sales[i-1] + sales[i]
  movingAvg の末尾に (sum ÷ 3 の商) を追加する
endfor`,
      choices: [
        "{150, 160, 166}",
        "{150, 160, 167}",
        "{450, 480, 500}",
        "{150, 166, 160}",
      ],
      answer: 0,
      explanation:
        "i=3: (100+150+200)÷3の商=150。i=4: (150+200+130)÷3の商=160。i=5: (200+130+170)÷3の商=166(500÷3=166.67の商は166)。よって movingAvg は {150, 160, 166}。",
    },
    {
      id: "s7q7",
      no: 7,
      section: "algo",
      categoryLabel: "リスト構造(複数該当ノードの削除)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "単方向リストから、値が target と等しいノードをすべて削除する処理である(先頭が該当する場合は既に別処理で除去済みとする)。prev には直前のノードへの参照を保持しながらリストを辿る。",
      ],
      code:
`手続 removeAll(整数型: target)
  while ((head が 未定義の値 でない) and (head.val が target と等しい))
    head ← head.next
  endwhile
  if (head が 未定義の値 と等しい)
    return
  endif
  Node: prev ← head
  Node: cur ← head.next
  while (cur が 未定義の値 でない)
    if (cur.val が target と等しい)
      a
    else
      prev ← cur
    endif
    cur ← cur.next
  endwhile`,
      choices: [
        "prev.next ← cur.next",
        "prev.next ← cur",
        "cur.next ← prev",
        "prev ← cur.next",
      ],
      answer: 0,
      explanation:
        "curが削除対象の場合、curの直前のノード(prev)のnextを、curの次のノード(cur.next)に直接つなぎ直すことで、curを読み飛ばして削除する。prevを進めていないのは、削除後も同じprevを基準に次のノードの判定を続ける必要があるためである。",
    },
    {
      id: "s7q8",
      no: 8,
      section: "algo",
      categoryLabel: "配列(多重ループによる組合せ検索)",
      level: 3,
      lead: "次のプログラムを実行したとき、最終的な count の値を答えよ。",
      description: [
        "福袋セットを作るため、2つの商品の価格の合計がちょうど1000円になる組合せが何通りあるかを数える処理である。",
      ],
      code:
`整数型の配列: prices ← {300, 700, 400, 600, 500}
整数型: i, j, count ← 0

for (i を 1 から (pricesの要素数 - 1) まで 1 ずつ増やす)
  for (j を (i + 1) から pricesの要素数 まで 1 ずつ増やす)
    if ((prices[i] + prices[j]) が 1000 と等しい)
      count ← count + 1
    endif
  endfor
endfor`,
      choices: ["2", "1", "3", "4"],
      answer: 0,
      explanation:
        "全ての組合せを調べると、(300,700)と(400,600)の2組の合計がちょうど1000円になる。よって count は最終的に2。",
    },
    {
      id: "s7q9",
      no: 9,
      section: "algo",
      categoryLabel: "再帰(共有ノードを含む集計)",
      level: 3,
      lead: "次のプログラムを countFiles(1) として呼び出したとき、countFiles関数が呼び出される回数(初回呼び出しを含む)の合計を答えよ。",
      description: [
        "配列 tree はディレクトリ構造を表す(tree[n]はノードnの子ノード番号の配列。空配列ならファイル=葉)。関数 countFiles(n) はノードn配下のファイル数を再帰的に数える(メモ化は行わない)。ノード4は、ノード2とノード3の両方から子として参照されている(共有サブフォルダ)。",
      ],
      code:
`整数型の配列の配列: tree ← {{2, 3}, {4, 5}, {4, 6}, {}, {}, {}}

○整数型: countFiles(整数型: n)
  整数型: total ← 0
  整数型: i
  if (tree[n]の要素数 が 0 と等しい)
    return 1
  endif
  for (i を 1 から tree[n]の要素数 まで 1 ずつ増やす)
    total ← total + countFiles(tree[n][i])
  endfor
  return total`,
      choices: ["7", "6", "5", "8"],
      answer: 0,
      explanation:
        "メモ化を行わないため、ノード4はノード2の子として1回、ノード3の子として再度1回、合計2回別々に呼び出される。呼び出しを数えると、countFiles(1)→countFiles(2)→countFiles(4)→countFiles(5)→countFiles(3)→countFiles(4)(2回目)→countFiles(6) の順に、自分自身を含めて合計7回呼び出される。共有されたサブツリーが重複してカウントされてしまう点がこのアルゴリズムの弱点である。",
    },
    {
      id: "s7q10",
      no: 10,
      section: "algo",
      categoryLabel: "スタック(逆ポーランド記法の評価)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "逆ポーランド記法(RPN)で書かれた式を、スタックを使って評価する電卓の処理である(実務の数式パーサでも使われる考え方)。数値はスタックに積み、演算子が現れたら上から2つの値を取り出して計算し、結果を再びスタックに積む。減算は演算の順序に意味があるため、どちらを先にpopするかに注意する必要がある。",
      ],
      code:
`○整数型: evalRPN(文字列型の配列: tokens)
  Stack: st ← Stack()
  整数型: i, opnd2, opnd1
  for (i を 1 から tokensの要素数 まで 1 ずつ増やす)
    if (tokens[i] が 数値である)
      st.push(tokens[i]の数値)
    elseif (tokens[i] が "-" と等しい)
      opnd2 ← st.pop()
      a
      st.push(opnd1 - opnd2)
    endif
  endfor
  return st.pop()`,
      choices: [
        "opnd1 ← st.pop()",
        "opnd1 ← opnd2",
        "opnd1 ← st.push(opnd2)",
        "opnd2 ← st.pop()",
      ],
      answer: 0,
      explanation:
        "RPNでは、演算子の直前にpushされた値が第2オペランド(opnd2)、その前にpushされた値が第1オペランド(opnd1)になる。減算は順序に意味があるため、先にopnd2をpopしたあと、残りをopnd1としてpopし、opnd1 - opnd2の順で計算する必要がある。順序を逆にすると符号が反転してしまう。",
    },
    {
      id: "s7q11",
      no: 11,
      section: "algo",
      categoryLabel: "間接参照(3段階の連鎖・勤怠システム)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "勤怠管理システムにおいて、社員ごとの当日のシフトコードは shiftCode に、シフトコードに対応する曜日区分コードは shiftToDayType に、曜日区分コードが休日かどうかを示す論理値は dayTypeIsHoliday に、それぞれ格納されている。",
      ],
      code:
`整数型の配列: shiftCode ← {3, 1, 2, 3}
整数型の配列: shiftToDayType ← {1, 2, 1}
論理型の配列: dayTypeIsHoliday ← {偽, 真}
整数型: empId ← 3

論理型: isHoliday ← dayTypeIsHoliday[ a ]`,
      choices: [
        "shiftToDayType[shiftCode[empId]]",
        "shiftCode[shiftToDayType[empId]]",
        "shiftCode[empId]",
        "shiftToDayType[empId]",
      ],
      answer: 0,
      explanation:
        "empId=3の社員のシフトコードはshiftCode[3]=2。そのシフトコードに対応する曜日区分コードはshiftToDayType[2]=1。dayTypeIsHoliday[1]=偽なので、この社員は休日ではない。社員番号→シフトコード→曜日区分コード→休日フラグという3段階の間接参照を正しく追跡できるかがポイント。",
    },
    {
      id: "s7q12",
      no: 12,
      section: "algo",
      categoryLabel: "リスト構造(整列済みリストの重複除去)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "値が昇順に整列された単方向リストから、隣接する重複した値のノードを取り除く処理である。",
      ],
      code:
`手続 removeDuplicates()
  Node: cur ← head
  while ((cur が 未定義の値 でない) and (cur.next が 未定義の値 でない))
    if (cur.val が cur.next.val と等しい)
      a
    else
      cur ← cur.next
    endif
  endwhile`,
      choices: [
        "cur.next ← cur.next.next",
        "cur ← cur.next.next",
        "cur.next ← cur",
        "cur ← cur.next",
      ],
      answer: 0,
      explanation:
        "curとcur.nextの値が等しい場合、cur.nextのノードを読み飛ばして、そのさらに次のノード(cur.next.next)に直接つなぎ直すことで重複ノードを除去する。curを進めていないのは、除去後の新たなcur.nextも同じ値である可能性があり、重複がなくなるまで同じcurのまま判定を続ける必要があるためである。",
    },
    {
      id: "s7q13",
      no: 13,
      section: "algo",
      categoryLabel: "探索(回転済み配列の二分探索)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "本来は昇順に整列されているが、先頭のいくつかの要素が末尾に回転移動された配列(例: {4,5,6,7,1,2,3})から、target の位置を二分探索で求める関数 searchRotated である。",
      ],
      code:
`○整数型: searchRotated(整数型の配列: data, 整数型: target)
  整数型: low ← 1
  整数型: high ← dataの要素数
  整数型: mid

  while (low が high 以下)
    mid ← (low + high) ÷ 2 の商
    if (data[mid] が target と等しい)
      return mid
    endif
    if (data[low] が data[mid] 以下)
      if ((target が data[low] 以上) and (target が data[mid] より小さい))
        high ← mid - 1
      else
        low ← mid + 1
      endif
    else
      if ((target が data[mid] より大きい) and (target が data[high] 以下))
        a
      else
        high ← mid - 1
      endif
    endif
  endwhile
  return 0`,
      choices: ["low ← mid + 1", "high ← mid + 1", "low ← mid", "high ← mid"],
      answer: 0,
      explanation:
        "data[low]がdata[mid]より大きい場合、右半分(mid+1〜high)が整列されていることになる。targetがdata[mid]より大きくdata[high]以下であれば、targetは整列されたこの右半分に存在するはずなので、low←mid+1として探索範囲を右側に絞り込む。",
    },
    {
      id: "s7q14",
      no: 14,
      section: "algo",
      categoryLabel: "文字列探索(大文字小文字を区別しない比較)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "ログイン時のユーザーIDの比較では、大文字・小文字を区別せずに一致を判定したい。関数 toLower(ch) は1文字を小文字に変換する(既に小文字や記号ならそのまま返す)。",
      ],
      code:
`○論理型: equalsIgnoreCase(文字列型: s1, 文字列型: s2)
  整数型: i
  if (s1の文字数 が s2の文字数 と等しくない)
    return 偽
  endif
  for (i を 1 から s1の文字数 まで 1 ずつ増やす)
    if ( a )
      return 偽
    endif
  endfor
  return 真`,
      choices: [
        "toLower(s1のi文字目) が toLower(s2のi文字目) と等しくない",
        "s1のi文字目 が s2のi文字目 と等しくない",
        "toLower(s1のi文字目) が s2のi文字目 と等しくない",
        "toLower(s1) が toLower(s2) と等しくない",
      ],
      answer: 0,
      explanation:
        "大文字・小文字を区別せずに比較するには、両方の文字を toLower で正規化してから比較する必要がある。片方だけ変換したり、変換せずに直接比較したりすると、大文字小文字の違いだけで誤って「不一致」と判定してしまう。",
    },
    {
      id: "s7q15",
      no: 15,
      section: "algo",
      categoryLabel: "探索(単調性を利用した実務探索)",
      level: 5,
      lead: "次のプログラムを実行したとき出力される値を答えよ。",
      description: [
        "サーバの負荷監視で、CPU使用率(%)が閾値を初めて超える時刻を、記録済みの使用率の配列(時刻順、単調増加とは限らないが、この配列は増加傾向にあると分かっている場合の二分探索の応用)から求める処理を、実務で使われる「初めて条件を満たす位置を求める」ロジックとして単純化したものである。関数 firstOver は、配列 usage の中で threshold を初めて超える添字を二分探索で求める(usage は昇順とする)。",
      ],
      code:
`整数型の配列: usage ← {40, 55, 62, 68, 75, 88, 93}
整数型: threshold ← 68

○整数型: firstOver(整数型の配列: usage, 整数型: threshold)
  整数型: low ← 1
  整数型: high ← usageの要素数
  整数型: result ← usageの要素数 + 1
  整数型: mid

  while (low が high 以下)
    mid ← (low + high) ÷ 2 の商
    if (usage[mid] が threshold より大きい)
      result ← mid
      high ← mid - 1
    else
      low ← mid + 1
    endif
  endwhile
  return result

出力(firstOver(usage, threshold))`,
      choices: ["5", "4", "6", "3"],
      answer: 0,
      explanation:
        "usage={40,55,62,68,75,88,93}、threshold=68。thresholdより大きい最初の値は75(5番目の要素、68自身はthreshold以下なので該当しない)。二分探索で候補を記録しながら範囲を狭めていくと、最終的に result は5になる。",
    },
    {
      id: "s7q16",
      no: 16,
      section: "algo",
      categoryLabel: "スタック・キュー(2キューによるスタック実装)",
      level: 5,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "2つのキュー(q1, q2)を使ってスタック(LIFO)を実現する。push(v)は、その時点で空でない方のキューにvをenqueueする(両方空の場合はq1に入れる)。pop()は、要素が入っている方のキュー(source)から最後の1つを残して全て他方のキュー(dest)に移し替えたあと、source側に最後に残った1つ(=最後にpushされた値、つまりスタックの最上位に相当)を取り出して返す。",
      ],
      code:
`○整数型: pop()
  Queue: source ← (q1が空でない場合はq1、そうでなければq2)
  Queue: dest ← (q1が空でない場合はq2、そうでなければq1)
  while ( a )
    dest.enqueue(source.dequeue())
  endwhile
  return source.dequeue()`,
      choices: [
        "source.size() が 1 より大きい",
        "source.size() が 0 より大きい",
        "source.size() が 1 以上",
        "source.isEmpty() が 偽",
      ],
      answer: 0,
      explanation:
        "sourceキューの要素を、最後の1つを残してdestに移し替える必要がある(最後に残る1つが、元々最後にenqueueされた=スタックの最上位に相当する値になる)。「1より大きい」場合だけ移し替えを続けることで、ちょうど1つを残すことができる。「0より大きい」や「1以上」にしてしまうと最後の要素までdestに移してしまい、正しいpop対象が得られなくなる。",
    },

    // ============ 問17〜20: 情報セキュリティ(すべて最高難度) ============
    {
      id: "s7q17",
      no: 17,
      section: "sec",
      categoryLabel: "セキュリティ(コンテナ基盤の共有責任・複合原因)",
      level: 5,
      lead: "図1中の(一)と(三)それぞれについて、一次的な責任を負う主体の適切な組合せを選べ。",
      scenario: [
        "コンテナ技術を活用したSaaSを提供するKK社は、コンテナイメージのビルドにLL社が提供するCI/CDパイプラインサービスを利用し、コンテナの実行基盤にはMM社のKubernetesマネージドサービスを利用している。ある日、本番環境のコンテナが侵害され、顧客データへの不正アクセスが発生した。",
      ],
      description: [
        "図1 調査で判明した事実",
        "(一) 使用していたベースイメージに既知の重大な脆弱性が存在していたが、KK社はイメージの脆弱性スキャンを一度も実施していなかった。",
        "(二) LL社のCI/CDパイプライン自体には設定不備や脆弱性は見つからなかった。",
        "(三) Kubernetesクラスタの認証設定はMM社が提供するデフォルト設定のままで、KK社側で追加のアクセス制御(RBAC)を一切設定していなかった。",
      ],
      code: null,
      choices: [
        "(一)KK社　(三)KK社",
        "(一)LL社　(三)MM社",
        "(一)KK社　(三)MM社",
        "(一)LL社　(三)KK社",
      ],
      answer: 0,
      explanation:
        "(一)脆弱性スキャンを実施する運用を怠っていたのはKK社自身であり、LL社のパイプライン自体には問題がなかった((二)の通り)。(三)Kubernetesのアクセス制御(RBAC)設定は、通常テナント側(KK社)が追加で設定すべき項目であり、基盤側のデフォルト設定のままにしていたこと自体がKK社の設定不備である。したがって(一)(三)ともにKK社の責任となる。",
    },
    {
      id: "s7q18",
      no: 18,
      section: "sec",
      categoryLabel: "セキュリティ(ドメイン管理アカウントの不備)",
      level: 5,
      lead: "再発防止のための対策として、最も適切なものを選べ。",
      scenario: [
        "NN社では、自社ドメインのDNS管理を外部のレジストラで行っているが、レジストラアカウントのログイン情報を、退職済みの元従業員が使っていたアカウントで一元管理したままにしていた。ある日、そのアカウントが不正利用され、DNSのMXレコード(メール受信サーバの設定)が攻撃者の管理するサーバに書き換えられ、NN社宛のメールが一時的に攻撃者に転送される被害が発生した。",
      ],
      description: [],
      code: null,
      choices: [
        "ドメイン管理アカウントを個人に紐づけず組織で管理し、多要素認証を必須化した上で、退職者が発生した場合は速やかにアクセス権限を見直す運用を徹底する",
        "DNSサーバの応答速度を向上させるため、TTL(レコードのキャッシュ有効期間)を短く設定する",
        "自社ドメインで使うメールアドレスの文字数制限を緩和する",
        "レジストラを、価格がより安価な別の事業者に変更する",
      ],
      answer: 0,
      explanation:
        "今回の根本原因は、退職済みの元従業員のアカウントでドメイン管理を続けていたことにある。アカウントを組織管理に切り替え、多要素認証を必須化し、退職時には速やかにアクセス権限を見直す運用にすることで、同様の不正利用を防ぐことができる。",
    },
    {
      id: "s7q19",
      no: 19,
      section: "sec",
      categoryLabel: "セキュリティ(Cookie属性設定の不備とXSS)",
      level: 5,
      lead: "今回の被害の直接的な要因として、最も適切なものを選べ。",
      scenario: [
        "OO社が運営するWebサービスでは、ログイン後のセッションIDをCookieに保存しているが、開発時の設定不備により、そのCookieにHttpOnly属性が付与されていなかった。ある日、サービス内の掲示板機能に存在するクロスサイトスクリプティング(XSS)の脆弱性を悪用され、他の利用者のセッションIDが攻撃者のスクリプトによって窃取される被害が発生し、複数のアカウントが乗っ取られた。",
      ],
      description: [],
      code: null,
      choices: [
        "XSSの脆弱性に加え、CookieにHttpOnly属性が付与されておらず、JavaScriptからセッションIDを読み取れる状態になっていたこと",
        "セッションIDに使われる文字列の長さが不十分だったこと",
        "掲示板機能の投稿文字数の上限が緩すぎたこと",
        "ログインパスワードの有効期限が設定されていなかったこと",
      ],
      answer: 0,
      explanation:
        "XSSの脆弱性自体は攻撃の侵入口だが、CookieにHttpOnly属性を付与していればJavaScriptからセッションIDを読み取ることができず、窃取を防げた可能性が高い。両方の不備が重なったことが今回の被害の直接的な要因である。",
    },
    {
      id: "s7q20",
      no: 20,
      section: "sec",
      categoryLabel: "セキュリティ(OAuth連携のスコープ過剰許可)",
      level: 5,
      lead: "再発防止のための組織的対策として、最も適切なものを選べ。",
      scenario: [
        "PP社が提供する業務効率化ツールは、他のクラウドサービスとOAuth連携できる機能を持つ。ある従業員が、業務に不要な「全メールの読み書き」権限を要求する外部アプリの連携を承認してしまい、その外部アプリの開発元がずさんなセキュリティ管理をしていたため、連携先経由で社内メールの内容が外部に漏えいする被害が発生した。",
      ],
      description: [],
      code: null,
      choices: [
        "外部アプリとのOAuth連携を許可制にし、要求される権限スコープが業務上必要な最小限であるかを事前に審査する仕組みを導入する",
        "全従業員に対して、メールの送受信を禁止する",
        "OAuth連携機能自体を利用不可にし、全てのクラウドサービスを利用禁止にする",
        "外部アプリの利用規約のフォントサイズを大きくして読みやすくする",
      ],
      answer: 0,
      explanation:
        "今回の根本原因は、業務上不要な過剰な権限を要求する外部アプリを、従業員個人の判断で無審査に承認できてしまったことにある。連携を許可制にし、要求される権限スコープが業務上必要な最小限かどうかを事前に審査する仕組みを導入することが本質的な対策となる。",
    },
  ],
};
