// FE科目B 模擬試験 第8回
// 問1〜16: 実務で使われるアルゴリズムの擬似言語化を中心に構成(難易度は問1→16にかけて上昇)
//          オブジェクト指向形式は連結リスト・スタック・キューに限定。間接参照(多段参照)を2問配置。
//          単純な穴埋め・一発でわかる問題は避け、多重ループ・再帰呼び出し回数・
//          ポインタの付け替え順序がトラップになる構造理解重視の問題を中心に据える。
// 問17〜20: 情報セキュリティ(長文シナリオ形式、4問すべて最高難度)
export default {
  id: "set8",
  title: "模擬試験 第8回",
  questions: [
    // ============ 問1〜16: アルゴリズム・プログラミング ============
    {
      id: "s8q1",
      no: 1,
      section: "algo",
      categoryLabel: "プログラムの基本要素",
      level: 1,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "宅配便の料金は、荷物の重量が2kg以下は600円、2kgを超え5kg以下は900円、5kgを超える場合は1300円である。関数 shippingFee は、重量(kg)を表す0より大きい整数を引数として受け取り、料金を返す。",
      ],
      code:
`○整数型: shippingFee(整数型: weight)
  整数型: ret
  if (weight が 2 以下)
    ret ← 600
  elseif ( a )
    ret ← 900
  else
    ret ← 1300
  endif
  return ret`,
      choices: [
        "weight が 5 以下",
        "weight が 5 より小さい",
        "(weight が 2 より大きい) and (weight が 5 以下)",
        "weight が 2 より大きい",
      ],
      answer: 0,
      explanation:
        "最初のifで「2以下」が既に処理済みなので、elseifに到達した時点で weight は2より大きいことが確定している。よって `weight が 5 以下` だけで条件は十分。",
    },
    {
      id: "s8q2",
      no: 2,
      section: "algo",
      categoryLabel: "配列",
      level: 1,
      lead: "次のプログラムを実行したとき、変数 total に格納される値を答えよ。",
      description: [
        "商品ごとの単価(unitPrice)と在庫数(stock)から、在庫の合計金額を求める処理である。",
      ],
      code:
`整数型の配列: unitPrice ← {200, 150, 300}
整数型の配列: stock ← {10, 20, 5}
整数型: total ← 0
整数型: i

for (i を 1 から unitPriceの要素数 まで 1 ずつ増やす)
  total ← total + (unitPrice[i] × stock[i])
endfor`,
      choices: ["6500", "6000", "7000", "6300"],
      answer: 0,
      explanation:
        "200×10=2000、150×20=3000、300×5=1500。合計すると 2000+3000+1500=6500 になる。",
    },
    {
      id: "s8q3",
      no: 3,
      section: "algo",
      categoryLabel: "文字列探索",
      level: 1,
      lead: "次のプログラムを getExtension(\"report.final.pdf\") として呼び出したときの戻り値を答えよ。",
      description: [
        "関数 getExtension は、ファイル名を表す文字列の中で最後に現れる \".\" より後ろの部分(拡張子)を返す。",
      ],
      code:
`○文字列型: getExtension(文字列型: filename)
  整数型: i, dotPos ← 0
  for (i を 1 から filenameの文字数 まで 1 ずつ増やす)
    if (filenameのi文字目 が "." と等しい)
      dotPos ← i
    endif
  endfor
  return filenameの(dotPos+1)文字目から末尾までの部分文字列`,
      choices: ["pdf", "final.pdf", "pd", "df"],
      answer: 0,
      explanation:
        "dotPos は \".\" が現れるたびに更新されるので、最終的に最後に現れた \".\"(\"report.final.pdf\" の13文字目)の位置になる。よって14文字目以降の \"pdf\" が返る。",
    },
    {
      id: "s8q4",
      no: 4,
      section: "algo",
      categoryLabel: "スタック(ブラウザ履歴管理)",
      level: 2,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "Webブラウザの閲覧履歴をスタックで管理する。新しいページに遷移するたびにURLをスタック(history)に積み、goBack()は現在表示中のページ(スタックの先頭)を取り除いた上で、その次にスタックの先頭にある「1つ前のページ」を返して表示する。",
      ],
      code:
`○文字列型: goBack()
  if (history.size() が 1 以下)
    return history.pop()
  endif
  a
  return history.pop()`,
      choices: ["history.pop()", "history.push(history.pop())", "history.size()", "history.pop().pop()"],
      answer: 0,
      explanation:
        "goBack()を実行するには、まず現在表示しているページ(スタックの先頭)を取り除く必要がある。そのため最初に `history.pop()` を1回実行して現在のページを捨て、その後もう一度popすることで1つ前のページを取得して返す。",
    },
    {
      id: "s8q5",
      no: 5,
      section: "algo",
      categoryLabel: "間接参照(複数配列の使い分け)",
      level: 2,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "通販サイトの注文処理では、商品IDから商品カテゴリIDを求め(itemToCategory)、カテゴリIDから送料区分を求める(categoryToShipZone)、という2段階の間接参照を行う。",
      ],
      code:
`整数型の配列: itemToCategory ← {2, 1, 3, 1}
整数型の配列: categoryToShipZone ← {1, 2, 1}
整数型: itemId ← 3

整数型: shipZone ← categoryToShipZone[ a ]`,
      choices: [
        "itemToCategory[itemId]",
        "categoryToShipZone[itemId]",
        "itemId",
        "itemToCategory[shipZone]",
      ],
      answer: 0,
      explanation:
        "itemId=3の商品カテゴリは itemToCategory[3]=3。categoryToShipZone[3]=1なので、送料区分は1となる。よって空欄には `itemToCategory[itemId]` が入る。",
    },
    {
      id: "s8q6",
      no: 6,
      section: "algo",
      categoryLabel: "実務処理(閏年判定)",
      level: 2,
      lead: "次のプログラムを isLeapYear(2000)、isLeapYear(1900)、isLeapYear(2024) の順に呼び出したとき、それぞれの戻り値を順に並べたものを選べ。",
      description: [
        "業務カレンダーの祝日計算などで使われる閏年判定のロジックである。西暦年が4で割り切れ、かつ100で割り切れない場合、または400で割り切れる場合に閏年(真)と判定する。",
      ],
      code:
`○論理型: isLeapYear(整数型: year)
  if ((year mod 4 が 0 と等しい) and (year mod 100 が 0 と等しくない))
    return 真
  endif
  if (year mod 400 が 0 と等しい)
    return 真
  endif
  return 偽`,
      choices: [
        "真, 偽, 真",
        "偽, 真, 真",
        "真, 真, 偽",
        "偽, 偽, 真",
      ],
      answer: 0,
      explanation:
        "2000: 4で割り切れ100でも割り切れるため最初の条件は不成立だが、400で割り切れるため真。1900: 4で割り切れ100でも割り切れるため最初の条件は不成立、400でも割り切れないため偽。2024: 4で割り切れ100では割り切れないため真。よって「真, 偽, 真」の順になる。",
    },
    {
      id: "s8q7",
      no: 7,
      section: "algo",
      categoryLabel: "リスト構造(整列済みリストの共通要素抽出)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "2つの昇順に整列された単方向リスト a, b から、両方に共通して含まれる値だけを新しいリストとして返す処理である(集合の積に相当する)。dummy は結果リストの先頭に置くダミーノードで、tail は結果リストの末尾を指す。",
      ],
      code:
`○Node: intersect(Node: a, Node: b)
  Node: dummy ← Node()
  Node: tail ← dummy
  while ((a が 未定義の値 でない) and (b が 未定義の値 でない))
    if (a.val が b.val と等しい)
      tail.next ← Node()
      tail.next.val ← a.val
      tail ← tail.next
      a ← a.next
      b ← b.next
    elseif (a.val が b.val より小さい)
      a ← a.next
    else
      a
    endif
  endwhile
  return dummy.next`,
      choices: ["b ← b.next", "a ← a.next", "b ← a.next", "a ← b.next"],
      answer: 0,
      explanation:
        "a.valの方がb.valより大きい場合、bの方の値が小さいためbを1つ進めて次の値と比較する必要がある。よって `b ← b.next` が正しい。整列済みリストの性質を利用して、2つのポインタを効率よく進めていく点がポイント。",
    },
    {
      id: "s8q8",
      no: 8,
      section: "algo",
      categoryLabel: "配列(多重ループと早期終了)",
      level: 3,
      lead: "次のプログラムを実行したとき、最終的な foundRow の値を答えよ。",
      description: [
        "映画館の座席表(3行×4列、\"O\"が空席、\"X\"が満席)から、空席が横に2席以上連続している最初の行を検索する処理である。見つかった時点で以降の走査を打ち切る。",
      ],
      code:
`文字列型の二次元配列: seatMap ← {{"O", "X", "O", "X"},
                                {"X", "O", "X", "O"},
                                {"O", "O", "O", "X"}}
整数型: row, col
整数型: foundRow ← 0

for (row を 1 から 3 まで 1 ずつ増やす)
  for (col を 1 から 3 まで 1 ずつ増やす)
    if ((seatMap[row, col] が "O" と等しい) and (seatMap[row, col+1] が "O" と等しい))
      foundRow ← row
      ループを抜ける
    endif
  endfor
  if (foundRow が 0 より大きい)
    ループを抜ける
  endif
endfor`,
      choices: ["3", "1", "2", "0"],
      answer: 0,
      explanation:
        "1行目 {\"O\",\"X\",\"O\",\"X\"} には空席が2つ連続する箇所がない。2行目 {\"X\",\"O\",\"X\",\"O\"} にもない。3行目 {\"O\",\"O\",\"O\",\"X\"} は1〜2列目、2〜3列目がともに空席の連続になっており、col=1の時点で条件を満たすため foundRow は3になる。1行目・2行目で見つからないことを確認してから3行目に進む点がポイント。",
    },
    {
      id: "s8q9",
      no: 9,
      section: "algo",
      categoryLabel: "再帰(共有ノードを含む集計)",
      level: 3,
      lead: "次のプログラムを countCalls(1) として呼び出したときの戻り値を答えよ。",
      description: [
        "配列 tree はフォルダ構造を表す(tree[n]はノードnの子ノード番号の配列)。関数 countCalls(n) は、自分自身を含めてノードn配下で呼び出される回数の合計を再帰的に求める(メモ化は行わない)。ノード4は、ノード2とノード3の両方から子として参照されている(共有サブフォルダ)。",
      ],
      code:
`整数型の配列の配列: tree ← {{2, 3}, {4}, {4, 5}, {}, {}}

○整数型: countCalls(整数型: n)
  整数型: total ← 1
  整数型: i
  for (i を 1 から tree[n]の要素数 まで 1 ずつ増やす)
    total ← total + countCalls(tree[n][i])
  endfor
  return total`,
      choices: ["6", "5", "4", "7"],
      answer: 0,
      explanation:
        "countCalls(4)=1(葉)。countCalls(5)=1(葉)。countCalls(2)=1+countCalls(4)=1+1=2。countCalls(3)=1+countCalls(4)+countCalls(5)=1+1+1=3。countCalls(1)=1+countCalls(2)+countCalls(3)=1+2+3=6。ノード4がノード2側とノード3側の両方から重複して数えられている点がポイント。",
    },
    {
      id: "s8q10",
      no: 10,
      section: "algo",
      categoryLabel: "キュー(動画バッファリング)",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "動画配信サービスのバッファリング処理を、キューを使って管理する。バッファには最大3チャンクまで先読みして貯めておける。手続 loadChunk は新しいチャンクをロードしてバッファに追加するが、バッファが満杯(3チャンク分)の状態でロード要求が来た場合は、ロードをスキップする。",
      ],
      code:
`手続 loadChunk(整数型: chunkId)
  if (buffer.size() が 3 以上)
    return
  endif
  a`,
      choices: [
        "buffer.enqueue(chunkId)",
        "buffer.dequeue()",
        "buffer.enqueue(buffer.size())",
        "chunkId ← buffer.dequeue()",
      ],
      answer: 0,
      explanation:
        "バッファに空きがある場合、新しいチャンクをバッファの末尾に追加する必要がある。よって `buffer.enqueue(chunkId)` が正しい。",
    },
    {
      id: "s8q11",
      no: 11,
      section: "algo",
      categoryLabel: "間接参照(ポイント交換システムの在庫判定)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "ポイント交換システムでは、交換申請コードから交換対象の商品コードを求め(exchangeToItem)、商品コードから現在庫数を求める(itemStock)、という多段の間接参照によって交換の可否を判定する。",
      ],
      code:
`整数型の配列: exchangeToItem ← {3, 1, 2}
整数型の配列: itemStock ← {0, 5, 2}
整数型: exchangeCode ← 1

論理型: canExchange ← (itemStock[ a ] が 0 より大きい)`,
      choices: [
        "exchangeToItem[exchangeCode]",
        "itemStock[exchangeCode]",
        "exchangeCode",
        "exchangeToItem[itemStock[exchangeCode]]",
      ],
      answer: 0,
      explanation:
        "exchangeCode=1のとき、exchangeToItem[1]=3(商品コード3)。itemStock[3]=2(在庫2個)であり0より大きいので canExchange は真となる。よって空欄には `exchangeToItem[exchangeCode]` が入る。",
    },
    {
      id: "s8q12",
      no: 12,
      section: "algo",
      categoryLabel: "リスト構造(循環検出)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "単方向リストが循環している(末尾のノードが途中のノードを指し戻している)かどうかを、遅い/速いポインタを使って1回の走査で判定する関数 hasCycle である。",
      ],
      code:
`○論理型: hasCycle()
  Node: slow ← head
  Node: fast ← head
  while ((fast が 未定義の値 でない) and (fast.next が 未定義の値 でない))
    slow ← slow.next
    fast ← fast.next.next
    if (slow が fast と等しい)
      return 真
    endif
  endwhile
  return a`,
      choices: ["偽", "真", "未定義の値", "0"],
      answer: 0,
      explanation:
        "fastがリストの末尾(またはその手前)に到達してループが正常に終了した場合、それはリストが循環しておらず有限の長さで終端に達したことを意味する。よって `偽` を返せばよい。もしslowとfastが一致すれば、その時点で真を返してループの途中で終了している。",
    },
    {
      id: "s8q13",
      no: 13,
      section: "algo",
      categoryLabel: "探索(料金プラン選択のlower bound探索)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。ここで、配列 planData は昇順に整列済みとする。",
      description: [
        "携帯電話の料金プランは、月々のデータ量(GB)が多いプランほど月額料金も高くなる(単調増加)。関数 minPlanFor は、使用量 usage(GB)を満たす最小の月額料金のプランを、データ量が昇順に並んだ配列 planData から二分探索(下限探索)で求める(該当なしなら0を返す)。",
      ],
      code:
`○整数型: minPlanFor(整数型の配列: planData, 整数型: usage)
  整数型: low ← 1
  整数型: high ← planDataの要素数 + 1
  整数型: mid

  while (low が high より小さい)
    mid ← (low + high) ÷ 2 の商
    if (planData[mid] が usage より小さい)
      low ← mid + 1
    else
      high ← a
    endif
  endwhile
  if (low が (planDataの要素数 + 1) と等しい)
    return 0
  endif
  return low`,
      choices: ["mid", "mid - 1", "mid + 1", "low"],
      answer: 0,
      explanation:
        "planData[mid]がusage以上の場合、そのmidは条件を満たす候補として残す必要があるため high←mid とする(mid-1にすると候補から除外してしまい正しい境界を求められなくなる)。",
    },
    {
      id: "s8q14",
      no: 14,
      section: "algo",
      categoryLabel: "文字列探索(クォート対応CSVパーサ)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "CSV形式の1行をカンマで区切ってフィールドに分解する処理である。ただし、ダブルクォート(\")で囲まれた範囲内のカンマは区切り文字として扱わない。論理型変数 inQuotes は、現在クォートで囲まれた範囲の中にいるかどうかを示す。",
      ],
      code:
`○文字列型の配列: parseCsvLine(文字列型: line)
  文字列型の配列: fields ← {}
  文字列型: cur ← ""
  論理型: inQuotes ← 偽
  整数型: i

  for (i を 1 から lineの文字数 まで 1 ずつ増やす)
    if (lineのi文字目 が "\\"" と等しい)
      inQuotes ← not inQuotes
    elseif ((lineのi文字目 が "," と等しい) and ( a ))
      fields の末尾に cur を追加する
      cur ← ""
    else
      cur ← cur + lineのi文字目
    endif
  endfor
  fields の末尾に cur を追加する
  return fields`,
      choices: [
        "inQuotes が 偽",
        "inQuotes が 真",
        "inQuotes が 偽 でない",
        "cur が \"\" と等しい",
      ],
      answer: 0,
      explanation:
        "カンマが区切り文字として機能するのは、クォートで囲まれた範囲の外にある場合のみである。よって、カンマが見つかった際に inQuotes が偽(クォート外)であることを確認する必要がある。inQuotesが真(クォート内)の場合、このelseif条件は成立せず、else節でカンマがそのままcurに追加される。",
    },
    {
      id: "s8q15",
      no: 15,
      section: "algo",
      categoryLabel: "実務処理(予約システムの重複検出)",
      level: 5,
      lead: "次のプログラムを実行したとき、最終的な overlapCount の値を答えよ。",
      description: [
        "会議室の予約一覧(開始時刻 startTimes・終了時刻 endTimes)から、時間帯が重なっている予約の組合せの数を検出する処理である。2つの予約[s1,e1]と[s2,e2]が重なっているとは、s1 < e2 かつ s2 < e1 が成り立つことをいう。",
      ],
      code:
`整数型の配列: startTimes ← {9, 11, 13, 10}
整数型の配列: endTimes ← {10, 12, 15, 14}
整数型: i, j, overlapCount ← 0

for (i を 1 から (startTimesの要素数 - 1) まで 1 ずつ増やす)
  for (j を (i + 1) から startTimesの要素数 まで 1 ずつ増やす)
    if ((startTimes[i] が endTimes[j] より小さい) and (startTimes[j] が endTimes[i] より小さい))
      overlapCount ← overlapCount + 1
    endif
  endfor
endfor`,
      choices: ["2", "1", "3", "4"],
      answer: 0,
      explanation:
        "予約1[9,10]・予約2[11,12]・予約3[13,15]・予約4[10,14]について全ての組合せを調べると、予約2[11,12]と予約4[10,14]が重なっており(11<14 かつ 10<12)、予約3[13,15]と予約4[10,14]も重なっている(13<14 かつ 10<15)。それ以外の組合せは重ならない。よって overlapCount は最終的に2。",
    },
    {
      id: "s8q16",
      no: 16,
      section: "algo",
      categoryLabel: "スタック・キュー(スタックによるキューの反転)",
      level: 5,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "キューqの中身を、スタックを1つだけ補助として使って逆順に並べ替える処理である。まずキューの中身を全てスタックに移すと、スタックには元のキューの末尾の要素から順に取り出せる状態(順序が反転した状態)になる。",
      ],
      code:
`手続 reverseQueue(Queue: q)
  Stack: st ← Stack()
  while (q.isEmpty() が 偽)
    st.push(q.dequeue())
  endwhile
  while (st.isEmpty() が 偽)
    a
  endwhile`,
      choices: [
        "q.enqueue(st.pop())",
        "q.enqueue(st.dequeue())",
        "st.push(q.dequeue())",
        "q.enqueue(q.dequeue())",
      ],
      answer: 0,
      explanation:
        "最初のループでキューの中身を全てスタックに移すと、元のキューの末尾の要素がスタックの先頭(pop対象)に来る形で積まれ、順序が反転する。次にスタックから1つずつpopしてキューにenqueueし直すことで、元のキューが完全に逆順になったキューが出来上がる。よって `q.enqueue(st.pop())` が正しい。(例: 元のキューが1,2,3,4の順の場合、スタックに移すと4,3,2,1の順にpopできるようになり、その順でenqueueし直すことで4,3,2,1の順のキューが得られる。)",
    },

    // ============ 問17〜20: 情報セキュリティ(すべて最高難度) ============
    {
      id: "s8q17",
      no: 17,
      section: "sec",
      categoryLabel: "セキュリティ(多段委託と情報漏えいの複合責任)",
      level: 5,
      lead: "図1中の判明した事実を踏まえたとき、私物PCのマルウェア感染という直接の技術的原因と、それを許してしまった委託先管理上の問題、それぞれの一次的な責任主体の組合せとして最も適切なものを選べ。",
      scenario: [
        "保険会社QQ社は、顧客対応業務をRR社に委託しており、契約では「再委託する場合は事前承認が必要」と定められていた。RR社は承認を得ずにさらに海外のSS社に一部業務を再委託し、SS社の従業員が私物PCで顧客の個人情報を含むファイルを取り扱った結果、そのPCがマルウェアに感染し情報が漏えいした。",
      ],
      description: [
        "図1 調査で判明した事実",
        "(一) RR社は契約に反して、QQ社の承認を得ずにSS社に無断で再委託していた。",
        "(二) SS社の業務委託契約上、私物PCの業務利用を禁止する取り決めがあったにもかかわらず、SS社はそれを従業員に徹底していなかった。",
        "(三) QQ社は、RR社に対する委託先管理(定期監査など)を委託開始後一度も実施していなかった。",
      ],
      code: null,
      choices: [
        "(技術的原因)SS社　(管理上の問題)RR社",
        "(技術的原因)RR社　(管理上の問題)QQ社",
        "(技術的原因)SS社　(管理上の問題)QQ社",
        "(技術的原因)QQ社　(管理上の問題)SS社",
      ],
      answer: 0,
      explanation:
        "私物PCのマルウェア感染という直接の技術的原因は、私物PC利用禁止の取り決めを従業員に徹底していなかったSS社にある((二))。また、無断でSS社に再委託を行い、SS社を管理下に置かないまま業務を行わせていたのはRR社であり((一))、今回の漏えいに直結する委託先管理上の一次的な問題はRR社にある。QQ社によるRR社への監査不足((三))はより上位のガバナンス上の課題ではあるが、今回の事件を直接引き起こした管理上の問題としてはRR社が該当する。",
    },
    {
      id: "s8q18",
      no: 18,
      section: "sec",
      categoryLabel: "セキュリティ(MFA疲労攻撃)",
      level: 5,
      lead: "この攻撃手法の名称と、有効な対策の組合せとして最も適切なものを選べ。",
      scenario: [
        "TT社の経理担当者のスマートフォンに、深夜、身に覚えのない多要素認証(MFA)の承認通知が10分間に20回以上送信された。担当者はうるさく感じて、内容を確認せずに一度だけ「承認」をタップしてしまった。その直後、攻撃者は経理システムへの不正ログインに成功し、不正な振込を実行した。",
      ],
      description: [],
      code: null,
      choices: [
        "MFA疲労攻撃(push通知への大量の承認要求により誤操作を誘発する手法)であり、対策としては承認時に表示された数字コードの入力を要求する番号確認方式(ナンバーマッチング)の導入が有効である",
        "SQLインジェクションであり、対策としては入力値のエスケープ処理の徹底が有効である",
        "DDoS攻撃であり、対策としては通信回線の帯域を増強することが有効である",
        "ゼロデイ攻撃であり、対策としてはOSの修正プログラムを適用することが有効である",
      ],
      answer: 0,
      explanation:
        "大量のpush通知を送りつけて、うんざりした利用者に誤って承認させる手口はMFA疲労攻撃(MFA fatigue attack)と呼ばれる。単純な承認/拒否のpush通知だけでなく、画面に表示された数字コードを入力させる番号確認方式(ナンバーマッチング)を導入すれば、内容を確認せずに機械的に承認することが難しくなり、有効な対策となる。",
    },
    {
      id: "s8q19",
      no: 19,
      section: "sec",
      categoryLabel: "セキュリティ(タイミング攻撃)",
      level: 5,
      lead: "この脆弱性への対策として、最も適切なものを選べ。",
      scenario: [
        "UU社が開発した認証APIは、入力されたパスワードを1文字ずつサーバ側で比較し、不一致が見つかった時点で即座にエラーを返す実装になっていた。セキュリティ専門家の指摘により、この実装では、正しい文字が先頭から連続して一致するほど応答時間がわずかに長くなる(比較する文字数が増えるため)ことが判明し、応答時間の違いを繰り返し計測することでパスワードを1文字ずつ推測できる可能性があることが分かった。",
      ],
      description: [],
      code: null,
      choices: [
        "文字列全体を比較し終えるまで、一致・不一致にかかわらず常に同じ処理時間となるよう比較処理を実装する(定数時間比較)",
        "パスワードの入力を受け付けるAPIのレスポンスをすべてキャッシュする",
        "パスワードの最小文字数を4文字から8文字に引き上げる",
        "APIサーバの台数を増やして負荷分散する",
      ],
      answer: 0,
      explanation:
        "この脆弱性はサイドチャネル攻撃の一種であるタイミング攻撃である。応答時間の差が情報漏えいの原因となっているため、比較処理を、一致・不一致にかかわらず常に同じ時間で完了する定数時間比較として実装することが本質的な対策となる。パスワードの文字数を増やしても、1文字ずつ推測できる仕組み自体は解消されない。",
    },
    {
      id: "s8q20",
      no: 20,
      section: "sec",
      categoryLabel: "セキュリティ(悪意あるUSBデバイス)",
      level: 5,
      lead: "今回のような被害を未然に防ぐための組織的対策として、最も適切なものを選べ。",
      scenario: [
        "VV社の受付では、来客用に無料でUSB扇風機を配布するキャンペーンを行っていた。後日、複数の社員のPCで不審な挙動が確認され、調査の結果、配布されたUSB扇風機の一部に、接続するとキーボード入力を偽装してマルウェアを自動的にダウンロード・実行するプログラムが仕込まれていたことが判明した。",
      ],
      description: [],
      code: null,
      choices: [
        "出所が不明・信頼できないUSBデバイスを業務用PCに接続することを禁止するルールを定め、周知徹底する",
        "業務用PCのUSBポートの物理的な数を増やす",
        "来客用のノベルティグッズの種類を増やし、選択肢を広げる",
        "社内Wi-Fiのパスワードをより複雑なものに変更する",
      ],
      answer: 0,
      explanation:
        "今回の被害は、出所の分からないUSBデバイス(BadUSBと呼ばれる、キーボード入力を偽装する悪意あるデバイス)を業務用PCに接続してしまったことが原因である。信頼できないUSBデバイスの接続を禁止するルールを定め、社員に周知徹底することが本質的な対策となる。",
    },
  ],
};
