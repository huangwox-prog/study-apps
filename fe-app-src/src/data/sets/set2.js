// FE科目B 模擬試験 第2回
// 問1〜16: アルゴリズム・プログラミング(難易度は問1→16にかけて上昇)
// 問17〜20: 情報セキュリティ(長文シナリオ形式、問17が最難、問20にかけて易化)
export default {
  id: "set2",
  title: "模擬試験 第2回",
  questions: [
    // ============ 問1〜16: アルゴリズム・プログラミング ============
    {
      id: "s2q1",
      no: 1,
      section: "algo",
      categoryLabel: "プログラムの基本要素",
      level: 1,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "通信販売の送料は、購入金額が3,000円以上の場合は無料、1,000円以上3,000円未満の場合は300円、1,000円未満の場合は500円である。関数 shipping は、購入金額を表す0以上の整数を引数として受け取り、送料を返す。",
      ],
      code:
`○整数型: shipping(整数型: amount)
  整数型: ret
  if (amount が 3000 以上)
    ret ← 0
  elseif ( a )
    ret ← 300
  else
    ret ← 500
  endif
  return ret`,
      choices: [
        "amount が 1000 以上",
        "amount が 1000 より大きい",
        "(amount が 1000 以上) and (amount が 3000 未満)",
        "amount が 3000 未満",
      ],
      answer: 0,
      explanation:
        "最初のifで「3000以上」が既に処理済みなので、elseifに到達した時点で amount は3000未満であることが確定している。よって `amount が 1000 以上` だけで条件は十分。",
    },
    {
      id: "s2q2",
      no: 2,
      section: "algo",
      categoryLabel: "配列",
      level: 1,
      lead: "次のプログラムを実行したとき、変数 maxTemp に格納される値を答えよ。",
      description: [
        "整数型の配列 temps に格納された一週間分の気温の最大値を求めるプログラムである。",
      ],
      code:
`整数型の配列: temps ← {24, 28, 19, 31, 27, 22, 30}
整数型: maxTemp ← temps[1]
整数型: i

for (i を 2 から tempsの要素数 まで 1 ずつ増やす)
  if (temps[i] が maxTemp より大きい)
    maxTemp ← temps[i]
  endif
endfor`,
      choices: ["24", "28", "30", "31"],
      answer: 3,
      explanation:
        "配列の最大値を1件ずつ比較しながら更新していく典型的な処理。{24,28,19,31,27,22,30}の中の最大値は31。",
    },
    {
      id: "s2q3",
      no: 3,
      section: "algo",
      categoryLabel: "実務処理(集計)",
      level: 1,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "アンケートの回答点数(1〜5点)が格納された配列 answers から、平均点を計算するプログラムである。",
      ],
      code:
`実数型の配列: answers ← {4, 5, 3, 4, 2, 5, 4}
実数型: sum ← 0
整数型: i

for (i を 1 から answersの要素数 まで 1 ずつ増やす)
  sum ← sum + answers[i]
endfor

実数型: average ← a`,
      choices: [
        "sum ÷ answersの要素数",
        "sum ÷ i",
        "answersの要素数 ÷ sum",
        "sum × answersの要素数",
      ],
      answer: 0,
      explanation:
        "平均は「合計 ÷ 件数」なので `sum ÷ answersの要素数` が正しい。ループ後の i はループ終了条件により要素数+1になっているため、iを使うのは誤り。",
    },
    {
      id: "s2q4",
      no: 4,
      section: "algo",
      categoryLabel: "文字列処理",
      level: 2,
      lead: "次のプログラムを isPalindrome(\"level\") として呼び出したときの戻り値を答えよ。",
      description: [
        "関数 isPalindrome は、引数の文字列が前から読んでも後ろから読んでも同じ(回文)かどうかを判定し、真偽値を返す。strのn文字目 で文字列strの前からn番目の文字を取得できる。",
      ],
      code:
`○論理型: isPalindrome(文字列型: str)
  整数型: i, len
  len ← strの文字数
  for (i を 1 から (len ÷ 2 の商) まで 1 ずつ増やす)
    if ((strのi文字目) が (strの(len - i + 1)文字目) と等しくない)
      return 偽
    endif
  endfor
  return 真`,
      choices: ["真", "偽", "エラーになる", "空文字列"],
      answer: 0,
      explanation:
        "\"level\" は l-e-v-e-l で前から読んでも後ろから読んでも同じ回文である。ループでは前半の文字と対応する後半の文字を比較し、すべて一致するので最終的に真が返る。",
    },
    {
      id: "s2q5",
      no: 5,
      section: "algo",
      categoryLabel: "トレース(変数の変化)",
      level: 2,
      lead: "次のプログラムを実行したとき、出力される a, b, c, d, e の値の並びを答えよ。",
      description: [
        "数列の各項が直前の2項の和になっていく処理(フィボナッチ数列)をトレースする。",
      ],
      code:
`整数型: a ← 1
整数型: b ← 1
整数型: c, d, e

c ← a + b
d ← b + c
e ← c + d

出力(a, b, c, d, e)`,
      choices: [
        "1, 1, 2, 3, 5",
        "1, 1, 2, 4, 6",
        "1, 1, 3, 4, 7",
        "1, 1, 2, 3, 4",
      ],
      answer: 0,
      explanation:
        "a=1,b=1。c=a+b=2。d=b+c=1+2=3。e=c+d=2+3=5。よって出力は 1, 1, 2, 3, 5(フィボナッチ数列の一部)。",
    },
    {
      id: "s2q6",
      no: 6,
      section: "algo",
      categoryLabel: "配列(多次元配列)",
      level: 2,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "関数 transpose は、2行3列の二次元配列 matrix を、3行2列に転置(行と列を入れ替える)した二次元配列を返す。",
      ],
      code:
`○整数型の二次元配列: transpose(整数型の二次元配列: matrix)
  整数型の二次元配列: result ← 3行2列の新しい二次元配列
  整数型: i, j

  for (i を 1 から matrixの行数 まで 1 ずつ増やす)
    for (j を 1 から matrixの列数 まで 1 ずつ増やす)
      a
    endfor
  endfor
  return result`,
      choices: [
        "result[j, i] ← matrix[i, j]",
        "result[i, j] ← matrix[i, j]",
        "result[i, j] ← matrix[j, i]",
        "result[j, i] ← matrix[j, i]",
      ],
      answer: 0,
      explanation:
        "転置は行と列を入れ替える操作なので、元の [i,j] の値は、結果の [j,i] に格納する。よって `result[j, i] ← matrix[i, j]` が正しい。",
    },
    {
      id: "s2q7",
      no: 7,
      section: "algo",
      categoryLabel: "スタック",
      level: 2,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "関数 isBalanced は、文字列 str に含まれる丸括弧 \"(\" と \")\" の対応が取れているかをスタックを使って判定する。クラス Stack の push(値) は積み、pop() は取り除いて返し、isEmpty() は空なら真を返す。",
      ],
      code:
`○論理型: isBalanced(文字列型: str)
  Stack: st ← Stack()
  整数型: i

  for (i を 1 から strの文字数 まで 1 ずつ増やす)
    if ((strのi文字目) が "(" と等しい)
      st.push("(")
    elseif ((strのi文字目) が ")" と等しい)
      if (st.isEmpty() が 真)
        return 偽
      endif
      a
    endif
  endfor
  return st.isEmpty()`,
      choices: [
        "st.pop()",
        "st.push(\")\")",
        "st.isEmpty()",
        "st.push(\"(\")",
      ],
      answer: 0,
      explanation:
        "閉じ括弧が現れたら、対応する開き括弧をスタックから取り除く必要があるので `st.pop()` が正しい。最後にスタックが空であれば全ての括弧が対応している。",
    },
    {
      id: "s2q8",
      no: 8,
      section: "algo",
      categoryLabel: "キュー",
      level: 3,
      lead: "次のプログラムを実行したとき、最後に出力される値の並びを答えよ。",
      description: [
        "窓口の待ち行列をキューでシミュレートする。enqueue(値) は末尾に追加、dequeue() は先頭を取り除いて返す。",
      ],
      code:
`Queue: q ← Queue()
q.enqueue("客A")
q.enqueue("客B")
出力(q.dequeue())
q.enqueue("客C")
q.enqueue("客D")
出力(q.dequeue())
出力(q.dequeue())
q.enqueue("客E")
出力(q.dequeue())
出力(q.dequeue())`,
      choices: [
        "客A, 客B, 客C, 客D, 客E",
        "客A, 客B, 客C, 客E, 客D",
        "客E, 客D, 客C, 客B, 客A",
        "客A, 客C, 客B, 客D, 客E",
      ],
      answer: 0,
      explanation:
        "キューは先入れ先出し(FIFO)。enqueue(A,B)後、中身は先頭から[A,B]。dequeue→A。enqueue(C,D)で[B,C,D]。dequeue→B。dequeue→C。enqueue(E)で[D,E]。dequeue→D。dequeue→E。よって出力順は A,B,C,D,E。",
    },
    {
      id: "s2q9",
      no: 9,
      section: "algo",
      categoryLabel: "探索",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "関数 countUnder は、配列 data の中から limit 未満の値が何個あるかを数えて返す。ただし、データは整列されておらず、全件を走査する必要がある。",
      ],
      code:
`○整数型: countUnder(整数型の配列: data, 整数型: limit)
  整数型: cnt ← 0
  整数型: i

  for (i を 1 から dataの要素数 まで 1 ずつ増やす)
    if ( a )
      cnt ← cnt + 1
    endif
  endfor
  return cnt`,
      choices: [
        "data[i] が limit より小さい",
        "data[i] が limit 以下",
        "i が limit より小さい",
        "data[i] が cnt より小さい",
      ],
      answer: 0,
      explanation:
        "「limit未満」を数えるので `data[i] が limit より小さい` が正しい。「以下」だとlimitと等しい値も含まれてしまう。",
    },
    {
      id: "s2q10",
      no: 10,
      section: "algo",
      categoryLabel: "整列",
      level: 3,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "次のプログラムは、バブルソートによって配列 data を昇順に並べ替える。隣り合う要素を比較し、順序が逆であれば交換する操作を繰り返す。",
      ],
      code:
`整数型の配列: data ← {6, 3, 9, 1, 5}
整数型: i, j, tmp

for (i を 1 から (dataの要素数 - 1) まで 1 ずつ増やす)
  for (j を 1 から (dataの要素数 - i) まで 1 ずつ増やす)
    if (data[j] が a )
      tmp ← data[j]
      data[j] ← data[j + 1]
      data[j + 1] ← tmp
    endif
  endfor
endfor`,
      choices: [
        "data[j + 1] より大きい",
        "data[j + 1] より小さい",
        "data[j - 1] より大きい",
        "dataの要素数 より大きい",
      ],
      answer: 0,
      explanation:
        "バブルソートは、隣り合う要素の順序が逆(前の方が大きい)のときに交換する。よって `data[j+1] より大きい` が正しい条件。",
    },
    {
      id: "s2q11",
      no: 11,
      section: "algo",
      categoryLabel: "オブジェクト指向",
      level: 3,
      lead: "次のプログラムを実行したとき、出力される値を答えよ。",
      description: [
        "クラス BankAccount は、残高を管理する。deposit(金額) で入金、withdraw(金額) で出金する。withdraw は残高を超える出金の場合、何もせず失敗として扱う(残高は変化しない)。",
      ],
      code:
`クラス BankAccount
  整数型: balance ← 0
  ○deposit(整数型: amount)
    balance ← balance + amount
  ○withdraw(整数型: amount)
    if (amount が balance 以下)
      balance ← balance - amount
    endif
  ○整数型: getBalance()
    return balance

BankAccount: acc ← BankAccount()
acc.deposit(3000)
acc.withdraw(1000)
acc.withdraw(5000)
acc.deposit(500)
acc.withdraw(2000)
出力(acc.getBalance())`,
      choices: ["500", "2500", "0", "1500"],
      answer: 0,
      explanation:
        "deposit(3000)→3000。withdraw(1000)→2000。withdraw(5000)は残高2000を超えるので失敗、変化なし(2000のまま)。deposit(500)→2500。withdraw(2000)→500。最終残高は500。",
    },
    {
      id: "s2q12",
      no: 12,
      section: "algo",
      categoryLabel: "リスト構造(双方向)",
      level: 4,
      lead: "次のプログラム中の a 、 b に入れる正しい答えの組合せを、解答群の中から選べ。",
      description: [
        "手続 removeNode は、双方向リストからノード target を取り除く。クラス DNode は、値 val、前の要素への参照 prev、次の要素への参照 next をもつ。target は先頭でも末尾でもない中間のノードとする。",
      ],
      code:
`クラス DNode
  整数型: val
  DNode: prev ← 未定義の値
  DNode: next ← 未定義の値

○removeNode(DNode: target)
  target.prev.next ← a
  target.next.prev ← b`,
      choices: [
        "a: target.next　b: target.prev",
        "a: target.prev　b: target.next",
        "a: target　b: target",
        "a: target.next.next　b: target.prev.prev",
      ],
      answer: 0,
      explanation:
        "targetの前のノードのnextを、targetの次のノードに繋ぎ変える(target.prev.next ← target.next)。同様に、targetの次のノードのprevを、targetの前のノードに繋ぎ変える(target.next.prev ← target.prev)。よって a: target.next、b: target.prev。",
    },
    {
      id: "s2q13",
      no: 13,
      section: "algo",
      categoryLabel: "再帰",
      level: 4,
      lead: "次のプログラムを digitSum(4907) として呼び出したときの戻り値を答えよ。",
      description: [
        "関数 digitSum は、引数の非負整数の各桁の数字の和を再帰的に計算して返す。",
      ],
      code:
`○整数型: digitSum(整数型: n)
  if (n が 10 より小さい)
    return n
  endif
  return (n mod 10) + digitSum(n ÷ 10 の商)`,
      choices: ["20", "19", "24", "13"],
      answer: 0,
      explanation:
        "digitSum(4907) = 7 + digitSum(490) = 7 + (0 + digitSum(49)) = 7 + 0 + (9 + digitSum(4)) = 7+0+9+4 = 20。各桁 4,9,0,7 の和は 4+9+0+7=20 と一致する。",
    },
    {
      id: "s2q14",
      no: 14,
      section: "algo",
      categoryLabel: "探索(境界値)",
      level: 4,
      lead: "次のプログラム中の a に入れる正しい答えを、解答群の中から選べ。",
      description: [
        "配列 data は昇順に整列済みである。関数 lowerBound は、data の中で target 以上となる最初の要素の添字を二分探索で返す(該当がなければ、dataの要素数+1を返す)。",
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
      a
    endif
  endwhile
  return low`,
      choices: [
        "high ← mid",
        "high ← mid - 1",
        "high ← mid + 1",
        "low ← mid",
      ],
      answer: 0,
      explanation:
        "data[mid]がtarget以上のとき、mid自身がまだ答えの候補になり得るので high を mid-1 にはできず `high ← mid` とする必要がある。これにより探索範囲が正しく縮まり、最終的に low が「target以上となる最初の添字」に収束する。",
    },
    {
      id: "s2q15",
      no: 15,
      section: "algo",
      categoryLabel: "思考力(パズル)",
      level: 5,
      lead: "あるプログラムには3つの変数 x, y, z があり、値はそれぞれ1, 2, 3のいずれかで、互いに重複しない。次の3つの条件をすべて満たす (x, y, z) の組合せを選べ。",
      description: [
        "条件1: yの値は1である。",
        "条件2: xの値はzの値より大きい。",
        "条件3: zの値は1ではない。",
      ],
      code: null,
      choices: [
        "(x, y, z) = (3, 1, 2)",
        "(x, y, z) = (2, 1, 3)",
        "(x, y, z) = (1, 2, 3)",
        "(x, y, z) = (2, 3, 1)",
      ],
      answer: 0,
      explanation:
        "条件1よりyは1に確定する。残るx, zは{2, 3}のいずれかを重複なく割り当てる。条件3(zは1でない)は自動的に満たされるので、実質的な決め手は条件2(x>z)である。(x,z)=(2,3)ならx<zで不成立、(x,z)=(3,2)ならx>zで成立する。よって(x,y,z)=(3,1,2)が唯一の解である。条件を1つずつ丁寧に絞り込む論理的思考力が問われる設問である。",
    },
    {
      id: "s2q16",
      no: 16,
      section: "algo",
      categoryLabel: "動的計画法",
      level: 5,
      lead: "次のプログラムを stairs(5) として呼び出したときの戻り値を答えよ。",
      description: [
        "階段を上るとき、一度に1段または2段のどちらかで上れるとする。関数 stairs(n) は、n段の階段を上る方法が何通りあるかを、配列 memo を使って計算する(メモ化)。",
      ],
      code:
`○整数型: stairs(整数型: n)
  整数型の配列: memo ← {1, 1}
  整数型: i

  if (n が 1 以下)
    return 1
  endif

  for (i を 3 から (n + 1) まで 1 ずつ増やす)
    memoの末尾に (memo[i - 1] + memo[i - 2]) を追加する
  endfor
  return memo[n + 1]`,
      choices: ["8", "5", "13", "21"],
      answer: 0,
      explanation:
        "memoは1段目、0段目を表す基準値として{1,1}から始まり、i=3から順に前2つの和を追加していく(フィボナッチ数列と同じ構造)。n=5のとき、memoは{1,1,2,3,5,8}まで伸び、memo[6]=8が返る。1段刻み・2段刻みの組合せ数は段数に対してフィボナッチ数列に従って増えるため、5段では8通りとなる。",
    },

    // ============ 問17〜20: 情報セキュリティ ============
    {
      id: "s2q17",
      no: 17,
      section: "sec",
      categoryLabel: "セキュリティ(委託管理・多層防御)",
      level: 5,
      lead: "本文中の対応(ア)〜(エ)のうち、再発防止策として最も本質的かつ優先して実施すべきものを選べ。",
      scenario: [
        "医療関連サービスを提供するP社は、患者向けの予約管理システム(以下、Pシステムという)を運営している。Pシステムは、患者の氏名、生年月日、診療履歴などの機微な個人情報を保持しており、開発・運用はQ社に全面的に委託している。P社とQ社との委託契約書には、Q社が実施すべきセキュリティ対策の詳細は明記されておらず、「Q社は適切なセキュリティ対策を講じるものとする」という抽象的な条項があるのみであった。",
        "先日、Q社の担当者が、テスト用に本番環境のデータベースの複製を作成し、自身の個人所有ノートPCにコピーして自宅で作業を行っていたところ、そのノートPCがマルウェアに感染し、患者の個人情報を含むデータが外部に流出する事故が発生した。",
        "事故後の調査で、次の問題点が判明した。",
        "(ア) Q社の担当者が、本番データを個人所有の端末に持ち出すことを禁止する明確なルールが、P社Q社間の契約にも、Q社社内規程にも存在しなかった。",
        "(イ) 個人所有のノートPCにはマルウェア対策ソフトが導入されておらず、最新の定義ファイルにも更新されていなかった。",
        "(ウ) 流出したデータは暗号化されておらず、平文のまま保存されていた。",
        "(エ) P社は、委託先であるQ社に対して、委託業務の実施状況を定期的に監査する仕組みを持っていなかった。",
      ],
      description: [],
      code: null,
      choices: [
        "(エ) 委託先に対する定期監査の仕組みを整備し、委託契約の中でセキュリティ要件を具体的に明記して遵守状況を継続的に確認できるようにする",
        "(イ) 個人所有のノートPCにマルウェア対策ソフトを導入するよう、Q社の担当者に個別に注意喚起する",
        "(ウ) 流出したデータを暗号化する処理を追加する",
        "(ア) 本番データの持ち出しを禁止する一文を、口頭でQ社の担当者に伝える",
      ],
      answer: 0,
      explanation:
        "(ア)(イ)(ウ)はいずれも今回の個別事象への対症療法にすぎない。根本原因は、P社がQ社に対して具体的なセキュリティ要件を契約上明記せず、かつ委託先の実施状況を継続的にチェックする仕組み(監査)を持っていなかったという、委託先管理の構造的な不備にある。これを是正しない限り、同種の事故は形を変えて再発しうるため、(エ)の対応が再発防止として最も本質的かつ優先度が高い。",
    },
    {
      id: "s2q18",
      no: 18,
      section: "sec",
      categoryLabel: "セキュリティ(標的型攻撃)",
      level: 4,
      lead: "本文中の下線の訓練の主な目的として、最も適切なものを選べ。",
      scenario: [
        "従業員150名のR社では、半年に一度、全従業員を対象に、実在の取引先を装った偽の電子メールを送信し、添付ファイルを開いたり、本文中のリンクをクリックしたりする従業員がどの程度いるかを測定する訓練を実施している。訓練後、リンクをクリックしてしまった従業員には個別にフィードバックを行い、注意点を説明している。",
        "情報システム部門の担当者は、直近の訓練でクリック率が前回より上昇したことを受けて、訓練の実施方法を見直すことにした。",
      ],
      description: [],
      code: null,
      choices: [
        "巧妙化する標的型攻撃メールの手口に対する従業員の警戒心を維持し、実際の攻撃メールを見分ける判断力を養う",
        "電子メールサーバの送受信容量を測定し、システムの増強計画に役立てる",
        "従業員の業務用PCにインストールされているソフトウェアの一覧を棚卸しする",
        "取引先とのメールのやり取りの頻度を分析し、営業活動の効率を評価する",
      ],
      answer: 0,
      explanation:
        "標的型攻撃メール訓練は、実際の攻撃を模した疑似メールを従業員に送ることで、不審なメールを見抜く判断力や警戒心を継続的に維持・向上させることが主な目的である。他の選択肢はいずれも訓練の内容と関係がない。",
    },
    {
      id: "s2q19",
      no: 19,
      section: "sec",
      categoryLabel: "セキュリティ(認証)",
      level: 3,
      lead: "本文中の空欄に入れる、最も適切な対策を選べ。",
      scenario: [
        "従業員60名のS社では、社外から社内の勤怠管理システムにアクセスできるようにしている。ログインにはID とパスワードのみを使用しており、最近、他のWebサービスから漏えいしたパスワードのリストを使って他人のアカウントに次々とログインを試みる攻撃(パスワードリスト攻撃)により、複数の従業員アカウントが不正にログインされる被害が発生した。",
        "調査の結果、被害に遭った従業員の多くが、プライベートで利用している別のサービスと同じパスワードを勤怠管理システムでも使い回していたことが分かった。",
      ],
      description: [
        "パスワードの使い回しを完全になくすことが難しい状況でも、ID・パスワードの組合せが漏えいした場合の不正ログインを防ぐために有効な対策として、最も適切なものを選べ。",
      ],
      code: null,
      choices: [
        "ID・パスワードによる認証に加えて、スマートフォンアプリへの通知確認など、別の要素による認証(多要素認証)を導入する",
        "パスワードの文字数制限を、8文字以上から6文字以上に緩和し、覚えやすくする",
        "全従業員のパスワードを、システム側で一括して同じ文字列に統一する",
        "ログイン画面のデザインを変更し、視認性を向上させる",
      ],
      answer: 0,
      explanation:
        "パスワードリスト攻撃はID・パスワードの組合せが漏えいしていることを前提とする攻撃であるため、パスワードだけに頼らず、所持情報(スマートフォンなど)や生体情報を組み合わせた多要素認証を導入することが、パスワード漏えい時にも不正ログインを防ぐ効果的な対策となる。",
    },
    {
      id: "s2q20",
      no: 20,
      section: "sec",
      categoryLabel: "セキュリティ(基礎知識)",
      level: 2,
      lead: "情報セキュリティにおけるバックアップ運用に関する記述のうち、適切なものを選べ。",
      scenario: [
        "T社の情報システム部門では、新入社員向けの研修資料として、バックアップ運用に関する基本方針をまとめている。",
      ],
      description: [],
      code: null,
      choices: [
        "バックアップデータの一部は、本番環境とネットワークで隔離された場所にも保管し、ランサムウェアなどによってバックアップごと暗号化される事態に備える。",
        "バックアップは一度取得すれば十分であり、その後の運用でデータが更新されても再取得する必要はない。",
        "バックアップデータは、復元テストを行わずに保管しておくだけで、いざというときに確実に復元できると考えてよい。",
        "バックアップの取得頻度は、業務への影響を避けるため、可能な限り少なくすることが望ましい。",
      ],
      answer: 0,
      explanation:
        "ランサムウェア対策として、バックアップの一部をネットワークから隔離された場所(オフラインやエアギャップ環境)に保管することは有効な対策(3-2-1ルールの考え方の一部)。他の選択肢は、更新のたびに再取得しない、復元テストをしない、取得頻度を減らすなど、いずれもバックアップ運用として不適切な内容である。",
    },
  ],
};
