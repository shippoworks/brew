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
  /* ================================================================
     V60 — 5 recipes (light / medium / dark / iced / one-pour)
     ================================================================ */
  {
    id: "v60_light_hot",
    meta: {
      title: "V60 Light Roast Basic",
      title_ja: "V60 浅煎り 基本",
      creator: "BREW",
      grind: { comandante: 22, timemore: 16, zpresso: 3.0, varia: 5, label: "Medium-Fine", label_ja: "中細挽き" },
      desc: "A basic three-pour V60 recipe designed to highlight the bright acidity and floral notes of light-roasted beans. Higher water temperature compensates for the harder, denser structure of light roasts, ensuring thorough extraction without bitterness.",
      desc_ja: "浅煎り豆の明るい酸味とフローラルなノートを引き出す基本の3投V60レシピ。高めの湯温が硬く密度の高い浅煎り豆に対応し、苦みなくしっかりと抽出します。",
      beans_note: "Washed Ethiopian or Kenyan beans are ideal. Floral and citrus notes will be pronounced. Avoid very dark roasts with this recipe.",
      beans_note_ja: "ウォッシュトのエチオピアやケニア産が理想的。フローラルやシトラス系のノートが際立ちます。深煎りには不向きです。",
      links: ["https://github.com/shippoworks/brew", "https://github.com/shippoworks/brew"],
      tags: ["bright", "clean", "floral"],
      roast: 1, brewer: "V60", temp: 94, estimatedTime: 160, hot: true, likes: 0, createdAt: "2026-04-12"
    },
    base: { beans: 15, water: 250, temp: 94 },
    steps: [
      { type: "pour", duration: 15, target_ratio: 0.18, tip: "Bloom — saturate all grounds evenly", tip_ja: "蒸らし — 粉全体を均一に湿らせる" },
      { type: "wait", duration: 30, tip: "Let CO₂ escape fully", tip_ja: "CO₂が十分に抜けるまで待つ" },
      { type: "pour", duration: 25, target_ratio: 0.60, tip: "Main pour — steady center spiral", tip_ja: "メインの注湯 — 中心から安定したスパイラル" },
      { type: "wait", duration: 15, tip: "Let the bed settle", tip_ja: "コーヒーベッドが落ち着くまで待つ" },
      { type: "pour", duration: 25, target_ratio: 1.00, tip: "Final pour — gentle, stay centered", tip_ja: "最終注湯 — 穏やかに中心をキープ" },
      { type: "wait", duration: 50, tip: "Full draw-down", tip_ja: "完全にドローダウン" }
    ]
  },
  {
    id: "v60_medium_hot",
    meta: {
      title: "V60 Medium Roast Standard",
      title_ja: "V60 中煎り 定番",
      creator: "BREW",
      grind: { comandante: 24, timemore: 18, zpresso: 3.4, varia: 6, label: "Medium", label_ja: "中挽き" },
      desc: "The everyday V60 recipe for medium-roasted beans. Four pours at moderate temperature bring out balanced sweetness and clean body. A reliable starting point for most single-origin coffees.",
      desc_ja: "中煎り豆の日常使いV60レシピ。適度な温度での4投がバランスの良い甘みとクリーンなボディを引き出します。ほとんどのシングルオリジンに対応する安定のスタートポイント。",
      beans_note: "Works well with most washed or natural single origins — Colombian, Guatemalan, Costa Rican. Medium roast recommended.",
      beans_note_ja: "ウォッシュトやナチュラルのシングルオリジン全般に好相性。コロンビア、グアテマラ、コスタリカ産など。中煎り推奨。",
      links: ["https://github.com/shippoworks/brew", "https://github.com/shippoworks/brew"],
      tags: ["balanced", "sweet", "clean"],
      roast: 3, brewer: "V60", temp: 91, estimatedTime: 165, hot: true, likes: 0, createdAt: "2026-04-12"
    },
    base: { beans: 15, water: 250, temp: 91 },
    steps: [
      { type: "pour", duration: 15, target_ratio: 0.16, tip: "Bloom — slow, even saturation", tip_ja: "蒸らし — ゆっくりと均一に" },
      { type: "wait", duration: 30, tip: "Wait for bloom to finish", tip_ja: "蒸らしが完了するまで待つ" },
      { type: "pour", duration: 20, target_ratio: 0.56, tip: "Second pour — center spiral outward", tip_ja: "2投目 — 中心から外側へスパイラル" },
      { type: "wait", duration: 15, tip: "Brief rest", tip_ja: "短い休憩" },
      { type: "pour", duration: 15, target_ratio: 0.80, tip: "Third pour — maintain steady flow", tip_ja: "3投目 — 安定した流量を保つ" },
      { type: "wait", duration: 10, tip: "Short pause", tip_ja: "少し待つ" },
      { type: "pour", duration: 15, target_ratio: 1.00, tip: "Final pour — gentle finish", tip_ja: "最終注湯 — 穏やかに仕上げ" },
      { type: "wait", duration: 45, tip: "Draw-down complete", tip_ja: "ドローダウン完了" }
    ]
  },
  {
    id: "v60_dark_hot",
    meta: {
      title: "V60 Dark Roast Gentle",
      title_ja: "V60 深煎り やさしく",
      creator: "BREW",
      grind: { comandante: 28, timemore: 20, zpresso: 4.0, varia: 7, label: "Medium-Coarse", label_ja: "中粗挽き" },
      desc: "A low-temperature, coarser-grind V60 recipe for dark roasts. Solubility is high with dark beans, so gentler parameters prevent harsh bitterness and bring out chocolate and caramel sweetness instead.",
      desc_ja: "深煎り用の低温・粗めのV60レシピ。深煎り豆は溶解度が高いため、穏やかなパラメータで苦味の過抽出を防ぎ、チョコレートやキャラメルの甘みを引き出します。",
      beans_note: "Dark-roasted beans only — Brazilian, Sumatran, or blends. Chocolate and nutty profiles work best. Not recommended for light roasts.",
      beans_note_ja: "深煎り豆専用。ブラジル、スマトラ産、またはブレンド向き。チョコレートやナッツ系のプロファイルに最適。浅煎りには不向き。",
      links: ["https://github.com/shippoworks/brew", "https://github.com/shippoworks/brew"],
      tags: ["bold", "body", "sweet"],
      roast: 5, brewer: "V60", temp: 85, estimatedTime: 165, hot: true, likes: 0, createdAt: "2026-04-12"
    },
    base: { beans: 15, water: 250, temp: 85 },
    steps: [
      { type: "pour", duration: 15, target_ratio: 0.16, tip: "Bloom — low and gentle", tip_ja: "蒸らし — 低い位置から穏やかに" },
      { type: "wait", duration: 35, tip: "Longer bloom for dark roast", tip_ja: "深煎り用に長めの蒸らし" },
      { type: "pour", duration: 30, target_ratio: 0.68, tip: "Slow main pour — avoid agitation", tip_ja: "ゆっくりメイン注湯 — 攪拌を避ける" },
      { type: "wait", duration: 20, tip: "Let it settle gently", tip_ja: "穏やかに落ち着くまで待つ" },
      { type: "pour", duration: 25, target_ratio: 1.00, tip: "Final pour — steady and slow", tip_ja: "最終注湯 — 安定してゆっくりと" },
      { type: "wait", duration: 40, tip: "Draw-down complete", tip_ja: "ドローダウン完了" }
    ]
  },
  {
    id: "v60_light_iced",
    meta: {
      title: "V60 Flash Iced",
      title_ja: "V60 急冷アイス",
      creator: "BREW",
      grind: { comandante: 20, timemore: 15, zpresso: 2.8, varia: 5, label: "Medium-Fine", label_ja: "中細挽き" },
      desc: "Japanese-style flash-iced pour-over. Half the water weight is replaced by ice in the server below. The hot concentrated brew hits the ice instantly, locking in volatile aromatics for a crystal-clear, bright iced coffee. Serve immediately.",
      desc_ja: "日本式急冷アイスコーヒー。水量の半分を氷としてサーバーに入れておきます。高温の濃縮コーヒーが瞬時に氷に当たり、揮発性の香りを閉じ込めて透明感のある明るいアイスコーヒーに。すぐに提供してください。",
      beans_note: "Light-roasted washed beans with floral or citrus notes. Ethiopian Yirgacheffe, Kenyan, or Rwandan single origins are excellent choices.",
      beans_note_ja: "フローラルやシトラスのノートがある浅煎りウォッシュト豆。エチオピア イルガチェフ、ケニア、ルワンダ産のシングルオリジンが最適。",
      links: ["https://github.com/shippoworks/brew", "https://github.com/shippoworks/brew"],
      tags: ["bright", "clean", "fruity"],
      roast: 1, brewer: "V60", temp: 93, estimatedTime: 125, hot: false, likes: 0, createdAt: "2026-04-12"
    },
    base: { beans: 15, water: 150, temp: 93 },
    steps: [
      { type: "pour", duration: 15, target_ratio: 0.27, tip: "Bloom — finer grind needs less water", tip_ja: "蒸らし — 細挽きなので少なめに" },
      { type: "wait", duration: 30, tip: "Full bloom development", tip_ja: "蒸らしを十分に発展させる" },
      { type: "pour", duration: 20, target_ratio: 0.67, tip: "Main pour — concentrated extraction", tip_ja: "メイン注湯 — 濃縮抽出" },
      { type: "wait", duration: 15, tip: "Watch the bed carefully", tip_ja: "コーヒーベッドをよく観察" },
      { type: "pour", duration: 15, target_ratio: 1.00, tip: "Final pour — stay centered", tip_ja: "最終注湯 — 中心をキープ" },
      { type: "wait", duration: 30, tip: "Draw-down onto ice", tip_ja: "氷の上にドローダウン" }
    ]
  },
  {
    id: "v60_onepour_hot",
    meta: {
      title: "V60 One-Pour Simple",
      title_ja: "V60 ワンプア シンプル",
      creator: "BREW",
      grind: { comandante: 30, timemore: 22, zpresso: 4.5, varia: 7, label: "Coarse", label_ja: "粗挽き" },
      desc: "The simplest possible V60 recipe — just a bloom and one long pour. Coarser grind compensates for the continuous pouring, preventing over-extraction. Great for beginners or busy mornings when precision is less important than consistency.",
      desc_ja: "V60で最もシンプルなレシピ。蒸らしの後は1回の長い注湯だけ。粗めの挽き目が連続注湯の過抽出を補い、初心者や忙しい朝に最適。精密さよりも再現性を重視したい時に。",
      beans_note: "Medium-light roast works best. Forgiving of grind inconsistency. Avoid very light or very dark roasts.",
      beans_note_ja: "中浅煎りに最適。挽き目のばらつきにも寛容。極端な浅煎り・深煎りには不向き。",
      links: ["https://github.com/shippoworks/brew", "https://github.com/shippoworks/brew"],
      tags: ["balanced", "clean"],
      roast: 2, brewer: "V60", temp: 93, estimatedTime: 145, hot: true, likes: 0, createdAt: "2026-04-12"
    },
    base: { beans: 15, water: 250, temp: 93 },
    steps: [
      { type: "pour", duration: 10, target_ratio: 0.16, tip: "Bloom — quick, even saturation", tip_ja: "蒸らし — 素早く均一に" },
      { type: "wait", duration: 35, tip: "Full bloom — wait for bubbles to stop", tip_ja: "蒸らし完了 — 泡が収まるまで待つ" },
      { type: "pour", duration: 40, target_ratio: 1.00, tip: "Single slow pour — steady center spiral", tip_ja: "1回の長い注湯 — 安定した中心スパイラル" },
      { type: "wait", duration: 60, tip: "Full draw-down", tip_ja: "完全にドローダウン" }
    ]
  },

  /* ================================================================
     Kalita Wave — 2 recipes (medium / dark)
     ================================================================ */
  {
    id: "kalita_medium_hot",
    meta: {
      title: "Kalita Wave Standard",
      title_ja: "カリタウェーブ 定番",
      creator: "BREW",
      grind: { comandante: 25, timemore: 18, zpresso: 3.5, varia: 6, label: "Medium", label_ja: "中挽き" },
      desc: "A four-pour Kalita Wave recipe for medium roasts. The flat-bottom design naturally promotes even extraction, making it forgiving and consistent. Multiple small pours build layers of sweetness and body while keeping the cup clean.",
      desc_ja: "中煎り用の4投カリタウェーブレシピ。フラットボトム構造が自然に均一な抽出を促進し、安定した結果を出しやすいドリッパーです。複数回の小分け注湯で甘みとボディを層状に構築しつつ、クリーンなカップに仕上げます。",
      beans_note: "Any medium-roasted single origin. Colombian, Guatemalan, and Ethiopian naturals work especially well. Also great for blends.",
      beans_note_ja: "中煎りのシングルオリジン全般。コロンビア、グアテマラ、エチオピア ナチュラルに特に好相性。ブレンドにも最適。",
      links: ["https://github.com/shippoworks/brew", "https://github.com/shippoworks/brew"],
      tags: ["balanced", "sweet", "body"],
      roast: 3, brewer: "Kalita", temp: 92, estimatedTime: 170, hot: true, likes: 0, createdAt: "2026-04-12"
    },
    base: { beans: 15, water: 250, temp: 92 },
    steps: [
      { type: "pour", duration: 15, target_ratio: 0.16, tip: "Bloom — wet all grounds evenly", tip_ja: "蒸らし — 粉全体を均一に湿らせる" },
      { type: "wait", duration: 30, tip: "Flat bed should swell evenly", tip_ja: "フラットベッドが均一に膨らむのを確認" },
      { type: "pour", duration: 20, target_ratio: 0.52, tip: "Second pour — gentle circles", tip_ja: "2投目 — 穏やかな円を描く" },
      { type: "wait", duration: 20, tip: "Let the wave filter do its work", tip_ja: "ウェーブフィルターに任せる" },
      { type: "pour", duration: 15, target_ratio: 0.80, tip: "Third pour — center focused", tip_ja: "3投目 — 中心に集中" },
      { type: "wait", duration: 15, tip: "Brief pause", tip_ja: "少し待つ" },
      { type: "pour", duration: 15, target_ratio: 1.00, tip: "Final pour — finish gently", tip_ja: "最終注湯 — 穏やかに仕上げ" },
      { type: "wait", duration: 40, tip: "Complete draw-down", tip_ja: "完全にドローダウン" }
    ]
  },
  {
    id: "kalita_dark_hot",
    meta: {
      title: "Kalita Wave Dark Roast",
      title_ja: "カリタウェーブ 深煎り",
      creator: "BREW",
      grind: { comandante: 28, timemore: 20, zpresso: 4.0, varia: 7, label: "Medium-Coarse", label_ja: "中粗挽き" },
      desc: "A restrained Kalita recipe for dark-roasted beans. The flat-bottom design paired with lower temperature and coarser grind tames the high solubility of dark roasts, producing a bold cup with full body but no harsh bitterness.",
      desc_ja: "深煎り豆用の抑制的なカリタレシピ。フラットボトム構造と低温・粗挽きの組み合わせが深煎りの高い溶解度を制御し、しっかりしたボディを持ちながら嫌な苦みのないカップに仕上げます。",
      beans_note: "Dark-roasted beans — Brazilian natural, Sumatran Mandheling, or espresso blends. Chocolate, caramel, and nutty profiles shine here.",
      beans_note_ja: "深煎り豆向け。ブラジル ナチュラル、スマトラ マンデリン、エスプレッソブレンドに最適。チョコレート・キャラメル・ナッツ系の風味が映えます。",
      links: ["https://github.com/shippoworks/brew", "https://github.com/shippoworks/brew"],
      tags: ["bold", "body"],
      roast: 5, brewer: "Kalita", temp: 85, estimatedTime: 170, hot: true, likes: 0, createdAt: "2026-04-12"
    },
    base: { beans: 18, water: 270, temp: 85 },
    steps: [
      { type: "pour", duration: 15, target_ratio: 0.19, tip: "Bloom — low temperature, gentle pour", tip_ja: "蒸らし — 低温で穏やかに" },
      { type: "wait", duration: 35, tip: "Extended bloom for dark roast", tip_ja: "深煎り用に長めの蒸らし" },
      { type: "pour", duration: 25, target_ratio: 0.59, tip: "Main pour — slow and steady", tip_ja: "メイン注湯 — ゆっくり安定して" },
      { type: "wait", duration: 20, tip: "Let the bed settle", tip_ja: "ベッドが落ち着くまで待つ" },
      { type: "pour", duration: 30, target_ratio: 1.00, tip: "Final pour — maintain even pace", tip_ja: "最終注湯 — 均一なペースを保つ" },
      { type: "wait", duration: 45, tip: "Full draw-down", tip_ja: "完全にドローダウン" }
    ]
  },

  /* ================================================================
     Clever Dripper — 2 recipes (standard / iced)
     ================================================================ */
  {
    id: "clever_medium_hot",
    meta: {
      title: "Clever Immersion",
      title_ja: "クレバー 浸漬式",
      creator: "BREW",
      grind: { comandante: 25, timemore: 18, zpresso: 3.5, varia: 6, label: "Medium", label_ja: "中挽き" },
      desc: "A full-immersion recipe using the Clever Dripper. The valve stays closed during steeping, ensuring even extraction regardless of pour technique. After two minutes of immersion, opening the valve produces a clean, sweet, full-bodied cup. Very forgiving — ideal for beginners.",
      desc_ja: "クレバードリッパーを使ったフル浸漬レシピ。浸漬中はバルブを閉じたままにすることで、注ぎ方に関係なく均一な抽出が実現します。2分間の浸漬後、バルブを開けるとクリーンで甘みのあるフルボディのカップに。技術に左右されにくく、初心者に最適。",
      beans_note: "Works with any medium-roasted single origin or blend. The immersion method is forgiving of grind inconsistency.",
      beans_note_ja: "中煎りのシングルオリジンやブレンドに幅広く対応。浸漬式のため挽き目のばらつきにも寛容です。",
      links: ["https://github.com/shippoworks/brew", "https://github.com/shippoworks/brew"],
      tags: ["balanced", "sweet", "body"],
      roast: 3, brewer: "Clever", temp: 92, estimatedTime: 230, hot: true, likes: 0, createdAt: "2026-04-12"
    },
    base: { beans: 15, water: 240, temp: 92 },
    steps: [
      { type: "pour", duration: 15, target_ratio: 0.21, tip: "Pre-wet — valve closed", tip_ja: "プレウェット — バルブを閉じて" },
      { type: "wait", duration: 25, tip: "Bloom with valve closed", tip_ja: "バルブを閉じたまま蒸らす" },
      { type: "pour", duration: 25, target_ratio: 1.00, tip: "Fill all water — gentle pour", tip_ja: "全量注入 — 穏やかに" },
      { type: "wait", duration: 120, tip: "Steep 2 min — do not disturb", tip_ja: "2分間浸漬 — 触らずに待つ" },
      { type: "wait", duration: 45, tip: "Open valve — let it drain fully", tip_ja: "バルブを開けて完全に落とす" }
    ]
  },
  {
    id: "clever_light_iced",
    meta: {
      title: "Clever Iced",
      title_ja: "クレバー アイス",
      creator: "BREW",
      grind: { comandante: 22, timemore: 16, zpresso: 3.0, varia: 5, label: "Medium-Fine", label_ja: "中細挽き" },
      desc: "A concentrated immersion brew designed to be poured over ice. The Clever Dripper's sealed immersion ensures consistent extraction even with the higher ratio. Shorter steep time and finer grind produce a bright, fruity concentrate that becomes a refreshing iced coffee when diluted by the ice.",
      desc_ja: "氷に注ぐための濃縮浸漬式レシピ。クレバードリッパーの密閉浸漬が高い比率でも安定した抽出を保証します。短めの浸漬時間と細かい挽き目で、明るくフルーティな濃縮液を作り、氷で希釈して爽やかなアイスコーヒーに。",
      beans_note: "Light-roasted washed beans with bright acidity — Ethiopian, Kenyan, or Central American. Place 100g ice in the server before brewing.",
      beans_note_ja: "明るい酸味のある浅煎りウォッシュト豆。エチオピア、ケニア、中米産。サーバーに100gの氷を入れてから抽出を開始してください。",
      links: ["https://github.com/shippoworks/brew", "https://github.com/shippoworks/brew"],
      tags: ["bright", "clean", "fruity"],
      roast: 2, brewer: "Clever", temp: 95, estimatedTime: 185, hot: false, likes: 0, createdAt: "2026-04-12"
    },
    base: { beans: 18, water: 160, temp: 95 },
    steps: [
      { type: "pour", duration: 10, target_ratio: 0.25, tip: "Pre-wet — valve closed", tip_ja: "プレウェット — バルブを閉じて" },
      { type: "wait", duration: 25, tip: "Bloom with valve closed", tip_ja: "バルブを閉じたまま蒸らす" },
      { type: "pour", duration: 20, target_ratio: 1.00, tip: "Fill — stir gently 3 times", tip_ja: "全量注入 — 3回穏やかに攪拌" },
      { type: "wait", duration: 90, tip: "Steep 1.5 min — concentrated brew", tip_ja: "1分30秒浸漬 — 濃縮抽出" },
      { type: "wait", duration: 40, tip: "Open valve — drain onto ice", tip_ja: "バルブを開けて氷の上に落とす" }
    ]
  },

  /* ================================================================
     Aeropress — 3 recipes (standard / concentrated / iced)
     ================================================================ */
  {
    id: "aeropress_medium_hot",
    meta: {
      title: "Aeropress Standard",
      title_ja: "エアロプレス 定番",
      creator: "BREW",
      grind: { comandante: 20, timemore: 15, zpresso: 2.8, varia: 5, label: "Medium-Fine", label_ja: "中細挽き" },
      desc: "A basic inverted Aeropress recipe for a clean, sweet cup. The inverted position allows full immersion control — steep for one minute, then flip and press slowly over 30 seconds. Consistent pressure during the press is key to a smooth result.",
      desc_ja: "クリーンで甘みのあるカップのための基本的な逆さAeropressレシピ。逆さの状態でフル浸漬をコントロールし、1分間浸漬後にひっくり返して30秒かけてゆっくりプレス。プレス時の一定した圧力が滑らかな仕上がりの鍵です。",
      beans_note: "Medium-roasted single origins with good sweetness — Colombian, Guatemalan, or Brazilian. Also works well with medium blends.",
      beans_note_ja: "甘みのある中煎りシングルオリジン。コロンビア、グアテマラ、ブラジル産に好相性。中煎りのブレンドにも。",
      links: ["https://github.com/shippoworks/brew", "https://github.com/shippoworks/brew"],
      tags: ["sweet", "balanced", "body"],
      roast: 3, brewer: "Aeropress", temp: 88, estimatedTime: 135, hot: true, likes: 0, createdAt: "2026-04-12"
    },
    base: { beans: 15, water: 200, temp: 88 },
    steps: [
      { type: "pour", duration: 10, target_ratio: 0.20, tip: "Invert — wet all grounds", tip_ja: "逆さに — 粉全体を湿らせる" },
      { type: "wait", duration: 15, tip: "Initial bloom", tip_ja: "最初の蒸らし" },
      { type: "pour", duration: 20, target_ratio: 1.00, tip: "Fill — stir gently", tip_ja: "全量注入 — 穏やかに攪拌" },
      { type: "wait", duration: 60, tip: "Steep — 1 minute total immersion", tip_ja: "浸漬 — 1分間のフル浸漬" },
      { type: "wait", duration: 30, tip: "Flip and press slowly — 30s", tip_ja: "ひっくり返して30秒かけてゆっくりプレス" }
    ]
  },
  {
    id: "aeropress_dark_hot",
    meta: {
      title: "Aeropress Bold",
      title_ja: "エアロプレス 濃厚",
      creator: "BREW",
      grind: { comandante: 16, timemore: 12, zpresso: 2.2, varia: 4, label: "Fine-Medium", label_ja: "細〜中挽き" },
      desc: "A concentrated Aeropress recipe using a higher dose and lower water ratio. The finer grind and shorter steep time produce a rich, bold cup with heavy body — close to espresso strength. Can be diluted with hot water for an Americano-style drink.",
      desc_ja: "多めの豆と少なめの湯量による濃縮Aeropressレシピ。細かめの挽き目と短い浸漬時間で、エスプレッソに近い濃厚でボールドなカップに仕上がります。お湯で割ればアメリカーノ風にも。",
      beans_note: "Medium-dark to dark roasts — Indonesian, Brazilian, or Italian-style blends. Chocolate and caramel flavors are amplified at this concentration.",
      beans_note_ja: "中深〜深煎り。インドネシア、ブラジル産、またはイタリアンスタイルのブレンド向き。この濃度ではチョコレートやキャラメルの風味が増幅されます。",
      links: ["https://github.com/shippoworks/brew", "https://github.com/shippoworks/brew"],
      tags: ["bold", "body", "sweet"],
      roast: 4, brewer: "Aeropress", temp: 85, estimatedTime: 110, hot: true, likes: 0, createdAt: "2026-04-12"
    },
    base: { beans: 18, water: 150, temp: 85 },
    steps: [
      { type: "pour", duration: 10, target_ratio: 0.20, tip: "Invert — wet grounds thoroughly", tip_ja: "逆さに — 粉を十分に湿らせる" },
      { type: "wait", duration: 15, tip: "Short bloom", tip_ja: "短めの蒸らし" },
      { type: "pour", duration: 15, target_ratio: 1.00, tip: "Fill — stir firmly 5 times", tip_ja: "全量注入 — しっかり5回攪拌" },
      { type: "wait", duration: 45, tip: "Steep — 45 seconds", tip_ja: "浸漬 — 45秒間" },
      { type: "wait", duration: 25, tip: "Flip and press — steady pressure", tip_ja: "ひっくり返して安定した圧力でプレス" }
    ]
  },
  {
    id: "aeropress_light_iced",
    meta: {
      title: "Aeropress Iced",
      title_ja: "エアロプレス アイス",
      creator: "BREW",
      grind: { comandante: 18, timemore: 13, zpresso: 2.5, varia: 4, label: "Fine-Medium", label_ja: "細〜中挽き" },
      desc: "A concentrated Aeropress brew pressed directly over ice. Higher temperature and longer steeping extract maximum flavor from light-roasted beans, and the immediate ice contact preserves bright, fruity character. Place 100g ice in the cup before pressing.",
      desc_ja: "氷の上に直接プレスする濃縮Aeropressレシピ。高温と長めの浸漬で浅煎り豆から最大限のフレーバーを引き出し、氷への即時接触で明るくフルーティな風味を保持します。プレス前にカップに100gの氷を入れてください。",
      beans_note: "Light-roasted beans with fruity or floral notes. Ethiopian natural, Kenyan, or Panamanian. Place 100g ice in the cup before pressing.",
      beans_note_ja: "フルーティまたはフローラルなノートの浅煎り豆。エチオピア ナチュラル、ケニア、パナマ産。プレス前にカップに100gの氷を入れること。",
      links: ["https://github.com/shippoworks/brew", "https://github.com/shippoworks/brew"],
      tags: ["bright", "fruity", "clean"],
      roast: 1, brewer: "Aeropress", temp: 93, estimatedTime: 125, hot: false, likes: 0, createdAt: "2026-04-12"
    },
    base: { beans: 15, water: 100, temp: 93 },
    steps: [
      { type: "pour", duration: 10, target_ratio: 0.30, tip: "Invert — wet all grounds", tip_ja: "逆さに — 粉全体を湿らせる" },
      { type: "wait", duration: 15, tip: "Bloom — let gases escape", tip_ja: "蒸らし — ガスを抜く" },
      { type: "pour", duration: 15, target_ratio: 1.00, tip: "Fill — stir 5 times", tip_ja: "全量注入 — 5回攪拌" },
      { type: "wait", duration: 60, tip: "Steep 1 min — concentrated brew", tip_ja: "1分間浸漬 — 濃縮抽出" },
      { type: "wait", duration: 25, tip: "Flip and press over ice", tip_ja: "ひっくり返して氷の上にプレス" }
    ]
  }
]
