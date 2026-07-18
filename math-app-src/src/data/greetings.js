// 時間帯に応じたホーム画面の挨拶メッセージ
// 深夜(0-4)・早朝(5-8)・昼(9-16)・夕方〜夜(17-23)の4帯で、
// アクセスのたびにランダムな1文を選ぶ。

const GREETINGS_BY_PERIOD = {
  lateNight: [
    "今日も夜更かしですか",
    "こんな時間まで、無理しすぎないでね",
    "静かな時間、集中には向いてるかも",
    "1問だけ、区切りをつけたら休もう",
    "夜更かし仲間、お疲れさま",
  ],
  earlyMorning: [
    "おはようございます",
    "朝から偉い、この調子で",
    "早起きは三文の徳、一問解いてみよう",
    "1日のはじまりに、少しだけ頭を動かそう",
    "静かな朝は勉強がはかどるね",
  ],
  daytime: [
    "今日も少しずつ進めよう",
    "午後も集中していこう",
    "今のうちに、少しでも進めておこう",
    "焦らず、着実に積み上げよう",
    "今日はどこから始める?",
  ],
  evening: [
    "今日もお疲れさま",
    "寝る前にもう少しだけ",
    "1日の締めくくりに、軽く復習しよう",
    "夜のひととき、少しだけ数学タイム",
    "今日の分、ちゃんと積み上がってるよ",
  ],
};

function periodForHour(hour) {
  if (hour >= 0 && hour < 5) return "lateNight";
  if (hour >= 5 && hour < 9) return "earlyMorning";
  if (hour >= 9 && hour < 17) return "daytime";
  return "evening";
}

export function getGreeting(date = new Date()) {
  const period = periodForHour(date.getHours());
  const list = GREETINGS_BY_PERIOD[period];
  return list[Math.floor(Math.random() * list.length)];
}
