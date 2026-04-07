export interface Step {
  type: 'pour' | 'wait'
  duration: number
  target_ratio?: number
  tip: string
  tip_ja: string
}

export interface GrindSize {
  comandante: number
  timemore: number
  zpresso: number
  varia: number
  label: string
  label_ja: string
}

export interface Recipe {
  id: string
  meta: {
    title: string
    title_ja: string
    creator: string
    grind: GrindSize
    desc: string
    desc_ja: string
    beans_note: string
    beans_note_ja: string
    links: [string, string]
    tags: string[]
    roast: number
    brewer: string
    temp: number
    estimatedTime: number
    hot: boolean
    likes: number
    createdAt: string
  }
  base: { beans: number; water: number; temp: number }
  steps: Step[]
}

export const recipes: Recipe[] = [
  {
    id: "recipe_001",
    meta: {
      title: "6:4 Method",
      title_ja: "6:4メソッド",
      creator: "T.Kasuya",
      grind: { comandante: 25, timemore: 18, zpresso: 3.2, varia: 6, label: "Medium-Coarse", label_ja: "やや粗め" },
      desc: "This recipe divides the pour into two distinct phases: the first 60% extracts sweetness and body, while the final 40% adjusts balance and strength. By controlling each pour independently, you can dial in the cup with surgical precision. Kasuya's World Brewers Cup-winning method, refined for repeatability.",
      desc_ja: "注湯を2フェーズに分割するレシピです。前半60%で甘みとボディを引き出し、後半40%でバランスと濃度を調整します。各注湯を独立してコントロールすることで、精密にカップを調整できます。粕谷哲のWorld Brewers Cup優勝手法を再現性重視でチューニングしたものです。",
      beans_note: "Versatile — works with any origin. Particularly shines with washed Ethiopian or Colombian beans. Medium-light roast recommended.",
      beans_note_ja: "どんな産地の豆にも対応可能。ウォッシュトのエチオピアやコロンビア産と特に相性が良いです。ミディアムライト焙煎推奨。",
      links: ["https://twitter.com/tetsu_kasuya", "https://kasuya.coffee"],
      tags: ["balanced", "sweet", "clean"],
      roast: 2, brewer: "V60", temp: 93, estimatedTime: 210, hot: true, likes: 2847, createdAt: "2024-01-15"
    },
    base: { beans: 20, water: 300, temp: 93 },
    steps: [
      { type: "pour", duration: 10, target_ratio: 0.12, tip: "Bloom — saturate evenly", tip_ja: "蒸らし — 均一に湿らせる" },
      { type: "wait", duration: 35, tip: "Wait for full bloom", tip_ja: "蒸らしが完了するまで待つ" },
      { type: "pour", duration: 20, target_ratio: 0.28, tip: "Slow spiral, center out", tip_ja: "中心から外へゆっくりスパイラル" },
      { type: "wait", duration: 30, tip: "Let it drain halfway", tip_ja: "半分ほど落ちるまで待つ" },
      { type: "pour", duration: 15, target_ratio: 0.44, tip: "Maintain steady flow", tip_ja: "一定の流量を保つ" },
      { type: "wait", duration: 20, tip: "Watch the draw-down", tip_ja: "落ちるのを見守る" },
      { type: "pour", duration: 15, target_ratio: 0.60, tip: "Gentle, consistent pour", tip_ja: "穏やかに一定速度で注ぐ" },
      { type: "wait", duration: 20, tip: "Control the strength", tip_ja: "濃度を調整する" },
      { type: "pour", duration: 15, target_ratio: 0.80, tip: "Adjust to taste", tip_ja: "好みに合わせて調整" },
      { type: "wait", duration: 30, tip: "Final draw-down", tip_ja: "最終ドローダウン" }
    ]
  },
  {
    id: "recipe_002",
    meta: {
      title: "Turbo Bloom",
      title_ja: "ターボブルーム",
      creator: "M.Hoffmann",
      grind: { comandante: 30, timemore: 22, zpresso: 4.0, varia: 7, label: "Coarse", label_ja: "粗め" },
      desc: "A high-agitation, fast-draw method designed for clarity and brightness. The aggressive first pour creates turbulence that extracts evenly without channeling. Ideal for light-roasted, high-density beans where you want the full fruit character without bitterness.",
      desc_ja: "高攪拌・高速ドローダウンで明るさとクリアさを引き出すレシピ。積極的な最初の注湯が乱流を生み、チャネリングなく均一に抽出します。苦みなくフルーツ感を最大限引き出したい、ライトロースト・高密度の豆に最適です。",
      beans_note: "Best with natural or honey-processed light roasts from Ethiopia, Kenya, or Guatemala. High-density, specialty-grade beans only.",
      beans_note_ja: "エチオピア・ケニア・グアテマラ産のナチュラルまたはハニープロセス、ライトローストに最適。高密度・スペシャルティグレードの豆専用。",
      links: ["https://youtube.com/hoffmann", "https://squaremilecoffee.com"],
      tags: ["bright", "fruity", "clean"],
      roast: 1, brewer: "V60", temp: 96, estimatedTime: 180, hot: true, likes: 1923, createdAt: "2024-02-20"
    },
    base: { beans: 15, water: 250, temp: 96 },
    steps: [
      { type: "pour", duration: 8, target_ratio: 0.20, tip: "Aggressive bloom — agitate", tip_ja: "力強い蒸らし — しっかり攪拌" },
      { type: "wait", duration: 32, tip: "Full bloom development", tip_ja: "蒸らしを十分に完成させる" },
      { type: "pour", duration: 30, target_ratio: 0.80, tip: "Fast, high pour — create turbulence", tip_ja: "高い位置から速く — 乱流を作る" },
      { type: "wait", duration: 15, tip: "Quick draw-down", tip_ja: "素早くドローダウン" },
      { type: "pour", duration: 20, target_ratio: 1.0, tip: "Final fill — stay centered", tip_ja: "最終注湯 — 中心をキープ" },
      { type: "wait", duration: 75, tip: "Drain completely", tip_ja: "完全に落ちきるまで待つ" }
    ]
  },
  {
    id: "recipe_003",
    meta: {
      title: "Iced Clarity",
      title_ja: "アイスクラリティ",
      creator: "S.Goto",
      grind: { comandante: 22, timemore: 16, zpresso: 3.0, varia: 5, label: "Medium-Fine", label_ja: "やや細め" },
      desc: "A Japanese-style flash-iced brew. Half the water weight is placed as ice in the vessel below. The hot concentrated brew hits the ice immediately, locking in volatile aromatics and achieving crystal clarity. Serve immediately — this cup does not improve with time.",
      desc_ja: "日本式フラッシュアイスブリュー。抽出量の半量を氷としてサーバーに入れておきます。高温の濃縮されたコーヒーが即座に氷に当たり、揮発性の香りを閉じ込め、クリスタルのような透明感を実現します。すぐに飲んでください。",
      beans_note: "Ethiopian washed (Yirgacheffe, Guji) or Kenyan AA — floral and citrus notes become vivid when iced. Light roast only.",
      beans_note_ja: "エチオピア ウォッシュト（イルガチェフ、グジ）またはケニアAA。アイスにすることでフローラル・シトラス系の風味が際立ちます。ライトロースト限定。",
      links: ["https://instagram.com/goto_coffee", "https://onibuscoffee.com"],
      tags: ["clean", "floral", "bright"],
      roast: 1, brewer: "V60", temp: 92, estimatedTime: 150, hot: false, likes: 1456, createdAt: "2024-03-01"
    },
    base: { beans: 15, water: 150, temp: 92 },
    steps: [
      { type: "pour", duration: 10, target_ratio: 0.20, tip: "Bloom — slow and steady", tip_ja: "蒸らし — ゆっくり丁寧に" },
      { type: "wait", duration: 30, tip: "Full bloom", tip_ja: "蒸らし完了まで待つ" },
      { type: "pour", duration: 25, target_ratio: 0.60, tip: "Concentrated pour — precise", tip_ja: "濃縮注湯 — 正確に" },
      { type: "wait", duration: 20, tip: "Watch the bed", tip_ja: "コーヒーベッドを観察" },
      { type: "pour", duration: 15, target_ratio: 0.85, tip: "Maintain flow", tip_ja: "流量を維持" },
      { type: "wait", duration: 15, tip: "Near complete", tip_ja: "もうすぐ完了" },
      { type: "pour", duration: 10, target_ratio: 1.0, tip: "Final water — slow", tip_ja: "最終注湯 — ゆっくりと" },
      { type: "wait", duration: 25, tip: "Draw down over ice", tip_ja: "氷の上にドローダウン" }
    ]
  },
  {
    id: "recipe_004",
    meta: {
      title: "Bodied Immersion",
      title_ja: "ボディ浸漬",
      creator: "A.Weber",
      grind: { comandante: 26, timemore: 19, zpresso: 3.5, varia: 6, label: "Medium", label_ja: "中挽き" },
      desc: "A hybrid immersion-percolation method for maximum body and sweetness. The extended immersion phase creates even extraction, while the final drain concentrates the cup. Perfect for medium roasts where you want texture alongside clarity. Forgiving of grind inconsistency.",
      desc_ja: "浸漬と透過を組み合わせたハイブリッド手法で、最大限のボディと甘みを引き出します。長めの浸漬フェーズが均一な抽出を実現し、最後のドレインがカップを凝縮します。クリアさとテクスチャを両立したいミディアムローストに最適。挽き目のばらつきにも寛容です。",
      beans_note: "Any medium-roasted single origin works well. Brazilian naturals add extra chocolate notes. Also great for blends.",
      beans_note_ja: "ミディアムローストのシングルオリジンならどんな豆でも良く合います。ブラジルナチュラルはチョコレートのニュアンスが加わります。ブレンドにも最適。",
      links: ["https://instagram.com/andyweber_coffee", "https://counterculture.coffee"],
      tags: ["sweet", "balanced", "body"],
      roast: 3, brewer: "Clever", temp: 91, estimatedTime: 240, hot: true, likes: 987, createdAt: "2024-03-15"
    },
    base: { beans: 20, water: 320, temp: 91 },
    steps: [
      { type: "pour", duration: 15, target_ratio: 0.15, tip: "Pre-wet — close valve", tip_ja: "プレウェット — バルブを閉じる" },
      { type: "wait", duration: 30, tip: "Bloom with valve closed", tip_ja: "バルブを閉じたまま蒸らす" },
      { type: "pour", duration: 20, target_ratio: 1.0, tip: "Fill completely — gentle", tip_ja: "ゆっくりと満水まで注ぐ" },
      { type: "wait", duration: 150, tip: "Immersion phase — 2.5 min", tip_ja: "浸漬フェーズ — 2分30秒" },
      { type: "wait", duration: 25, tip: "Open valve — let drain", tip_ja: "バルブを開けて落とす" }
    ]
  },
  {
    id: "recipe_005",
    meta: {
      title: "Dark & Structured",
      title_ja: "ダーク&ストラクチャード",
      creator: "H.Bui",
      grind: { comandante: 28, timemore: 20, zpresso: 3.8, varia: 7, label: "Medium-Coarse", label_ja: "やや粗め" },
      desc: "Designed for dark roasts where solubility is high and bitterness is the primary risk. Lower temperature and coarser grind prevent over-extraction. A single long pour maintains flow rate consistency. The result is a structured, bold cup with a clean finish — not muddy, not bitter.",
      desc_ja: "溶解度が高く苦みが出やすいダークローストのために設計されたレシピ。低温と粗めの挽き目で過抽出を防ぎます。長めの1回注ぎで流量の一定を保ちます。結果は、後味がクリーンで構造的かつボールドなカップです。",
      beans_note: "Dark-roasted beans only — Sumatra, Brazil, or Italian-style espresso blends work best. Avoid light/medium roasts with this recipe.",
      beans_note_ja: "ダークロースト専用。スマトラ、ブラジル、またはイタリアンスタイルのエスプレッソブレンドが最適。ライト・ミディアムローストには不向きです。",
      links: ["https://instagram.com/hbui_coffee", "https://bluebottlecoffee.com"],
      tags: ["bold", "balanced"],
      roast: 5, brewer: "Kalita", temp: 85, estimatedTime: 195, hot: true, likes: 743, createdAt: "2024-04-01"
    },
    base: { beans: 18, water: 270, temp: 85 },
    steps: [
      { type: "pour", duration: 10, target_ratio: 0.15, tip: "Gentle bloom — low temp", tip_ja: "穏やかな蒸らし — 低温で" },
      { type: "wait", duration: 35, tip: "Short rest — high solubility", tip_ja: "短めの休憩 — 溶解度が高い" },
      { type: "pour", duration: 45, target_ratio: 0.70, tip: "Slow & consistent — prevent bitterness", tip_ja: "ゆっくり一定に — 苦みを防ぐ" },
      { type: "wait", duration: 25, tip: "Mid draw-down", tip_ja: "中間ドローダウン" },
      { type: "pour", duration: 30, target_ratio: 1.0, tip: "Final pour — maintain pace", tip_ja: "最終注湯 — ペースを保つ" },
      { type: "wait", duration: 50, tip: "Complete draw-down", tip_ja: "完全にドローダウン" }
    ]
  },
  {
    id: "recipe_007",
    meta: {
      title: "4:6 Method (Canonical)",
      title_ja: "4:6メソッド（正規版）",
      creator: "T.Kasuya / Philocoffea",
      grind: { comandante: 30, timemore: 22, zpresso: 4.2, varia: 7, label: "Coarse", label_ja: "粗め" },
      desc: "The original World Brewers Cup 2016 winning recipe by Tetsu Kasuya. Five equal 60g pours divide into two phases: the first two pours (40%) control flavor — sweetness vs. acidity — while the last three pours (60%) control strength. Each pour begins only once the previous has fully drained. Adjust the first pour split to dial in your cup.",
      desc_ja: "粕谷哲による2016年World Brewers Cup優勝の正規レシピ。60gずつ5回注ぐことで2フェーズに分かれます。最初の2投（40%）は甘みと酸味のバランスを決定し、後半3投（60%）は濃度をコントロールします。前回の注湯が完全に落ちてから次を注ぐのが鍵。最初の2投の配分で味を調整できます。",
      beans_note: "Versatile across all origins and processes. To tune flavor: split first two pours equally (60g/60g) for balance; more in the 1st pour (70g/50g) for brightness; less (50g/70g) for sweetness. Medium-light to medium roast recommended.",
      beans_note_ja: "産地・精製問わず幅広く対応。風味調整：最初の2投を均等(60g/60g)でバランス、1投目を多く(70g/50g)で明るさ・酸味、少なく(50g/70g)で甘みが強まります。ミディアムライト〜ミディアムロースト推奨。",
      links: ["https://en.philocoffea.com/blogs/blog/coffee-brewing-method", "https://philocoffea.com"],
      tags: ["balanced", "sweet", "clean", "adjustable"],
      roast: 2, brewer: "V60", temp: 92, estimatedTime: 210, hot: true, likes: 0, createdAt: "2026-04-07"
    },
    base: { beans: 20, water: 300, temp: 92 },
    steps: [
      { type: "pour", duration: 12, target_ratio: 0.20, tip: "Pour 60g — center, gentle spiral", tip_ja: "60g注ぐ — 中心からゆっくりスパイラル" },
      { type: "wait", duration: 30, tip: "Wait for complete draw-down — taste phase 1", tip_ja: "完全にドローダウンするまで待つ — 風味フェーズ1" },
      { type: "pour", duration: 12, target_ratio: 0.40, tip: "Pour 60g — taste phase complete at 40%", tip_ja: "60g注ぐ — 風味フェーズ完了（40%）" },
      { type: "wait", duration: 30, tip: "Full draw-down — strength phase begins next", tip_ja: "完全ドローダウン — 次から濃度フェーズ" },
      { type: "pour", duration: 12, target_ratio: 0.60, tip: "Pour 60g — strength phase starts", tip_ja: "60g注ぐ — 濃度フェーズ開始" },
      { type: "wait", duration: 30, tip: "Steady draw-down", tip_ja: "安定したドローダウン" },
      { type: "pour", duration: 12, target_ratio: 0.80, tip: "Pour 60g — consistent pace", tip_ja: "60g注ぐ — 一定のペースで" },
      { type: "wait", duration: 30, tip: "Nearly complete", tip_ja: "もうすぐ完了" },
      { type: "pour", duration: 12, target_ratio: 1.0, tip: "Final 60g — center pour", tip_ja: "最終60g — 中心に注ぐ" },
      { type: "wait", duration: 30, tip: "Complete draw-down — total 3:30", tip_ja: "完全にドローダウン — 合計3分30秒" }
    ]
  },
  {
    id: "recipe_008",
    meta: {
      title: "Kurasu Kyoto V60",
      title_ja: "Kurasu京都 V60",
      creator: "Tsubasa / Kurasu Kyoto",
      grind: { comandante: 22, timemore: 16, zpresso: 3.0, varia: 5, label: "Medium-Fine", label_ja: "やや細め" },
      desc: "A clean, structured three-pour V60 recipe published by Tsubasa at Kurasu Kyoto. The generous 40g bloom saturates the bed evenly before two progressive pours build extraction. Compact at just over two minutes, yet precise enough to showcase delicate floral and fruit notes. Adjust grind coarser if draw-down is too slow.",
      desc_ja: "京都のスペシャルティカフェ・Kurasu KyotoのTsubasaが公開した、クリーンで構造的な3投V60レシピ。40gの多めの蒸らしで粉全体を均一に湿らせ、その後2投で段階的に抽出します。2分少々とコンパクトながら、フローラルやフルーツの繊細なニュアンスを引き出す精度があります。ドローダウンが遅い場合は挽き目を粗くしてください。",
      beans_note: "Light-roasted Ethiopian or Kenyan washed beans shine here. Also excellent with Guatemalan or Rwandan single origins. Avoid dark roasts — this recipe rewards high-quality, delicate beans.",
      beans_note_ja: "エチオピアやケニア産のライトロースト・ウォッシュトが特に映えます。グアテマラやルワンダ産のシングルオリジンにも最適。ダークローストには不向き。高品質で繊細な豆を使うと真価が発揮されます。",
      links: ["https://kurasu.kyoto/blogs/kurasu-journal/tsubasas-homebrew-recipe", "https://kurasu.kyoto"],
      tags: ["clean", "bright", "floral"],
      roast: 1, brewer: "V60", temp: 92, estimatedTime: 145, hot: true, likes: 0, createdAt: "2026-04-07"
    },
    base: { beans: 14, water: 200, temp: 92 },
    steps: [
      { type: "pour", duration: 15, target_ratio: 0.20, tip: "Bloom — 40g, saturate evenly", tip_ja: "蒸らし — 40g、均一に湿らせる" },
      { type: "wait", duration: 25, tip: "Full bloom — 40s from start", tip_ja: "蒸らし完了 — スタートから40秒" },
      { type: "pour", duration: 20, target_ratio: 0.55, tip: "Pour to 110g — gentle outward spiral", tip_ja: "110gまで注ぐ — 外へ向かって穏やかにスパイラル" },
      { type: "wait", duration: 10, tip: "Short rest — watch the bed", tip_ja: "短い休憩 — コーヒーベッドを観察" },
      { type: "pour", duration: 25, target_ratio: 1.0, tip: "Final pour to 200g — spiral back to center", tip_ja: "200gまで最終注湯 — 中心へ収束させる" },
      { type: "wait", duration: 50, tip: "Complete draw-down — total ~2:15", tip_ja: "完全にドローダウン — 合計約2分15秒" }
    ]
  },
  {
    id: "recipe_006",
    meta: {
      title: "Aeropress Classic",
      title_ja: "エアロプレス クラシック",
      creator: "K.Yamamoto",
      grind: { comandante: 18, timemore: 13, zpresso: 2.5, varia: 4, label: "Fine-Medium", label_ja: "やや細め〜中挽き" },
      desc: "The inverted Aeropress method for full immersion and maximum control. Extended steep time builds body and sweetness. The key is consistency in press pressure — aim for a slow 30-second press. Clean and repeatable, morning after morning.",
      desc_ja: "フル浸漬と最大コントロールのための逆さAeropressメソッド。長めの浸漬でボディと甘みを構築します。プレスの圧力を一定に保つことが鍵 — 30秒かけてゆっくりとプレスすることを目標にしましょう。毎朝クリーンで再現性の高い一杯を。",
      beans_note: "Medium roast with good sweetness — Colombian, Guatemalan, or Brazilian single origins. Avoid extremely light or very dark roasts.",
      beans_note_ja: "甘みのあるミディアムロースト — コロンビア、グアテマラ、またはブラジル産シングルオリジン。超ライトや超ダークは避けること。",
      links: ["https://instagram.com/yamamoto_brew", "https://fuglen.com"],
      tags: ["sweet", "body", "bold"],
      roast: 3, brewer: "Aeropress", temp: 88, estimatedTime: 150, hot: true, likes: 1234, createdAt: "2024-04-10"
    },
    base: { beans: 15, water: 200, temp: 88 },
    steps: [
      { type: "pour", duration: 10, target_ratio: 0.20, tip: "Invert — wet the grounds", tip_ja: "逆さに — 粉を湿らせる" },
      { type: "wait", duration: 20, tip: "Initial bloom", tip_ja: "最初の蒸らし" },
      { type: "pour", duration: 20, target_ratio: 1.0, tip: "Fill — stir 10x", tip_ja: "満水まで注ぐ — 10回攪拌" },
      { type: "wait", duration: 60, tip: "Steep — total 90s from start", tip_ja: "浸漬 — スタートから計90秒" },
      { type: "wait", duration: 40, tip: "Flip and press slowly — 30s", tip_ja: "ひっくり返して30秒かけてゆっくりプレス" }
    ]
  }
]
