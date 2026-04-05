import { Hono } from 'hono'
import { recipes } from './data/recipes'

const app = new Hono()

app.get('/api/recipes', (c) => {
  const { taste, roast, brewer, hot, sort } = c.req.query()
  let filtered = [...recipes]
  if (taste) filtered = filtered.filter(r => r.meta.tags.includes(taste))
  if (roast) filtered = filtered.filter(r => r.meta.roast === parseInt(roast))
  if (brewer) filtered = filtered.filter(r => r.meta.brewer === brewer)
  if (hot !== undefined && hot !== '') filtered = filtered.filter(r => hot === 'true' ? r.meta.hot : !r.meta.hot)
  if (sort === 'likes') filtered.sort((a, b) => b.meta.likes - a.meta.likes)
  else filtered.sort((a, b) => b.meta.createdAt.localeCompare(a.meta.createdAt))
  return c.json(filtered)
})

app.get('/api/recipes/:id', (c) => {
  const id = c.req.param('id')
  const recipe = recipes.find(r => r.id === id)
  if (!recipe) return c.json({ error: 'Not found' }, 404)
  return c.json(recipe)
})

app.get('*', (c) => {
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate')
  return c.html(HTML)
})

export default app

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">
<meta name="theme-color" content="#000">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<title>BREW</title>
<link rel="manifest" href="/manifest.json">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --b0:#000;--b1:#1a1a1a;--b2:#333;--b3:#666;--b4:#999;--b5:#ccc;--b6:#e8e8e8;--b7:#f5f5f5;--b8:#fff;
  --sans:'Inter',system-ui,sans-serif;
  --mono:'Roboto Mono','Menlo',monospace;
  --line:1px solid #000;
  --line-l:1px solid #ccc;
  --w:640px;
}
html{font-size:16px;-webkit-text-size-adjust:100%}
body{font-family:var(--sans);background:var(--b8);color:var(--b0);min-height:100dvh;-webkit-font-smoothing:antialiased}
button{font-family:var(--sans);cursor:pointer;border:none;background:none}
input{font-family:var(--sans)}
a{color:inherit;text-decoration:none}

/* ── LAYOUT ── */
#app{max-width:var(--w);margin:0 auto;min-height:100dvh;display:flex;flex-direction:column}
.screen{display:none;flex:1;flex-direction:column}
.screen.active{display:flex}

/* ── HEADER ── */
.hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:var(--line);position:sticky;top:0;background:var(--b8);z-index:50}
.hdr-title{font-size:11px;font-weight:700;letter-spacing:.18em}
.hdr-back{font-size:12px;font-weight:600;letter-spacing:.06em;cursor:pointer}
.hdr-back:active{opacity:.5}

/* ── LANG TOGGLE ── */
.lang-btn{font-size:11px;font-weight:700;letter-spacing:.08em;border:var(--line);padding:4px 9px;background:none;cursor:pointer}
.lang-btn:active{background:var(--b7)}

/* ══════════════════════════════
   HOME
══════════════════════════════ */
.home-hdr{padding:18px 16px 12px;border-bottom:var(--line);display:flex;align-items:flex-end;justify-content:space-between}
.home-logo{font-size:26px;font-weight:700;letter-spacing:.04em}
.home-sub{font-size:11px;color:var(--b4);letter-spacing:.12em;margin-top:2px}

/* filter rows */
.frow{border-bottom:var(--line-l);overflow-x:auto;-webkit-overflow-scrolling:touch;white-space:nowrap}
.frow::-webkit-scrollbar{display:none}
.frow-inner{display:inline-flex}
.fchip{font-size:11px;font-weight:600;letter-spacing:.08em;padding:10px 13px;border:none;background:none;cursor:pointer;border-right:var(--line-l);color:var(--b4)}
.fchip:last-child{border-right:none}
.fchip.on{color:var(--b0);background:var(--b7)}

/* sort bar */
.sort-bar{display:flex;border-bottom:var(--line)}
.sort-btn{font-size:11px;font-weight:600;letter-spacing:.1em;padding:9px 14px;cursor:pointer;border:none;background:none;border-right:var(--line-l);color:var(--b4)}
.sort-btn.on{color:var(--b0)}

/* recipe list */
.rlist{flex:1;overflow-y:auto}
.ritem{display:grid;grid-template-columns:1fr auto;gap:12px;padding:15px 16px;border-bottom:var(--line-l);cursor:pointer}
.ritem:active,.ritem.faved{background:var(--b7)}
.r-name{font-size:16px;font-weight:700;margin-bottom:3px}
.r-creator{font-size:11px;color:var(--b4);letter-spacing:.08em;margin-bottom:8px}
.r-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.badge{font-size:10px;font-weight:700;letter-spacing:.1em;padding:2px 6px}
.badge-brewer{border:var(--line)}
.badge-hot{background:var(--b0);color:var(--b8)}
.badge-ice{border:var(--line);color:var(--b3)}
.tags{display:flex;gap:4px}
.tag{font-size:10px;color:var(--b4);letter-spacing:.06em}
.tag::before{content:'#'}
.roast-row{display:flex;gap:2px;margin-top:6px}
.rdot{width:8px;height:8px;border:1px solid var(--b4)}
.rdot.on{background:var(--b0);border-color:var(--b0)}
.r-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px}
.fav-btn{font-size:11px;font-weight:700;letter-spacing:.06em;padding:4px 8px;border:var(--line);background:none;cursor:pointer}
.fav-btn.on{background:var(--b0);color:var(--b8)}
.r-likes{font-family:var(--mono);font-size:11px;color:var(--b4)}
.r-arrow{font-size:12px;color:var(--b4)}
.empty{padding:48px 16px;text-align:center;color:var(--b4);font-size:12px;letter-spacing:.1em}

/* ══════════════════════════════
   DETAIL
══════════════════════════════ */
#screen-detail{overflow-y:auto}
.d-content{padding-bottom:90px}

.d-hero{padding:22px 16px;border-bottom:var(--line)}
.d-title{font-size:24px;font-weight:700;margin-bottom:4px}
.d-creator{font-size:12px;color:var(--b4);letter-spacing:.1em;margin-bottom:14px}
.d-tagrow{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.d-tag{font-size:10px;font-weight:700;letter-spacing:.1em;border:var(--line-l);padding:3px 8px;color:var(--b3)}
.d-desc{font-size:14px;line-height:1.75;color:var(--b2)}

.sec{padding:16px;border-bottom:var(--line-l)}
.sec-lbl{font-size:10px;font-weight:700;letter-spacing:.15em;color:var(--b4);margin-bottom:12px}
.beans-note{font-size:13px;line-height:1.7;color:var(--b2)}

/* scaling */
.scale-row{display:flex;align-items:center;gap:10px}
.scale-wrap{display:flex;align-items:center;border:var(--line);flex:1}
.scale-unit{font-size:12px;font-weight:700;letter-spacing:.1em;padding:0 10px;background:var(--b7);border-right:var(--line);height:42px;display:flex;align-items:center}
.scale-inp{font-family:var(--mono);font-size:20px;font-weight:700;border:none;outline:none;background:none;padding:0 12px;width:80px;height:42px;text-align:right}
.scale-adj{display:flex}
.scale-btn{width:42px;height:42px;border:var(--line);border-left:none;background:none;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.scale-btn:first-child{border-left:var(--line)}
.scale-btn:active{background:var(--b7)}
.water-line{font-size:12px;color:var(--b4);margin-top:8px;font-family:var(--mono)}
.water-line b{color:var(--b0);font-weight:700}

/* grind */
.grind-sec{padding:16px;border-bottom:var(--line-l)}
.mill-tabs{display:flex;border:var(--line);margin-bottom:14px}
.mtab{flex:1;padding:7px 4px;font-size:10px;font-weight:700;letter-spacing:.06em;text-align:center;cursor:pointer;border-right:var(--line);color:var(--b4);background:none}
.mtab:last-child{border-right:none}
.mtab.on{background:var(--b0);color:var(--b8)}
.grind-num{font-family:var(--mono);font-size:42px;font-weight:700;text-align:center;line-height:1;margin-bottom:4px}
.grind-sub{font-size:10px;color:var(--b4);letter-spacing:.12em;text-align:center;margin-bottom:8px}
.grind-note{font-size:11px;color:var(--b4);line-height:1.55}

/* specs */
.spec-grid{display:grid;grid-template-columns:1fr 1fr}
.sc{padding:12px 0;border-right:var(--line-l);border-bottom:var(--line-l)}
.sc:nth-child(even){border-right:none;padding-left:16px}
.sc:nth-last-child(-n+2){border-bottom:none}
.sc-k{font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--b4);margin-bottom:4px}
.sc-v{font-family:var(--mono);font-size:18px;font-weight:700}
.sc-vs{font-size:13px;font-weight:600;font-family:var(--sans)}

/* steps */
.step-list{list-style:none}
.step-row{display:flex;align-items:stretch;border-bottom:var(--line-l)}
.step-n{width:36px;min-height:48px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:11px;color:var(--b5);border-right:var(--line-l);flex-shrink:0}
.step-info{flex:1;padding:11px 12px}
.step-type{font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--b4);margin-bottom:3px}
.step-type.pour{color:var(--b0)}
.step-tip{font-size:13px;font-weight:500;margin-bottom:3px}
.step-tgt{font-family:var(--mono);font-size:12px;color:var(--b3)}
.step-dur{width:48px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:12px;color:var(--b3);border-left:var(--line-l);flex-shrink:0}

/* links */
.lsec{padding:16px;border-bottom:var(--line-l)}
.lrow{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:var(--line-l)}
.lrow:last-child{border-bottom:none}
.lrow-k{font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--b4)}
.lrow-v{font-size:12px;display:flex;align-items:center;gap:8px}

/* ad */
.ad-slot{border:var(--line-l);height:76px;display:flex;align-items:center;justify-content:center;color:var(--b5);font-size:10px;letter-spacing:.12em}

/* start button */
.start-wrap{position:fixed;bottom:0;left:0;right:0;max-width:var(--w);margin:0 auto;padding:14px 16px;background:var(--b8);border-top:var(--line)}
.start-btn{width:100%;padding:15px;background:var(--b0);color:var(--b8);font-size:12px;font-weight:700;letter-spacing:.15em;cursor:pointer;border:none}
.start-btn:active{opacity:.85}

/* ══════════════════════════════
   ACTIVE
══════════════════════════════ */
#screen-active{background:var(--b0);color:var(--b8);position:fixed;inset:0;z-index:200;display:none;flex-direction:column}
#screen-active.active{display:flex}

.act-top{padding:14px 18px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.act-rname{font-size:11px;letter-spacing:.12em;color:#555}
.act-pause{font-size:11px;font-weight:700;letter-spacing:.08em;color:#888;border:1px solid #2a2a2a;padding:5px 10px;background:none}

.act-timer-wrap{text-align:center;padding:2px 0;flex-shrink:0}
.act-timer{font-family:var(--mono);font-size:46px;font-weight:700;color:var(--b8);letter-spacing:.04em}

.act-circle{flex:1;display:flex;align-items:center;justify-content:center;position:relative;min-height:0}
#brew-canvas{width:min(58vw,260px);height:min(58vw,260px)}

.act-info{text-align:center;padding:0 24px 4px;flex-shrink:0}
.act-weight{font-family:var(--mono);font-size:clamp(34px,9vw,52px);font-weight:700;line-height:1;margin-bottom:6px}
.act-tip{font-size:13px;letter-spacing:.08em;color:#777}
.act-stepcnt{font-size:10px;color:#3a3a3a;letter-spacing:.12em;margin-top:5px}

.act-progbar{display:flex;gap:3px;padding:0 18px 6px;flex-shrink:0}
.pseg{height:2px;flex:1;background:#1a1a1a}
.pseg.done{background:#444}
.pseg.cur{background:var(--b8)}

.act-hint{text-align:center;padding:10px 0 max(10px,env(safe-area-inset-bottom));font-size:10px;letter-spacing:.12em;color:#2a2a2a;flex-shrink:0}

/* countdown overlay */
.cd-overlay{position:absolute;inset:0;background:var(--b0);display:none;flex-direction:column;align-items:center;justify-content:center;z-index:10}
.cd-overlay.show{display:flex}
.cd-num{font-family:var(--mono);font-size:120px;font-weight:700;color:var(--b8);line-height:1}
.cd-lbl{font-size:11px;letter-spacing:.2em;color:#444;margin-top:14px}
.cd-cancel{font-size:11px;letter-spacing:.1em;color:#333;background:none;border:1px solid #222;padding:8px 24px;cursor:pointer;margin-top:40px}
.cd-cancel:active{color:#666}

/* paused overlay */
.paused-ov{position:absolute;inset:0;background:rgba(0,0,0,.93);display:none;flex-direction:column;align-items:center;justify-content:center;z-index:20}
.paused-ov.show{display:flex}
.paused-lbl{font-size:12px;letter-spacing:.2em;color:#444;margin-bottom:28px}
.paused-resume{font-size:12px;font-weight:700;letter-spacing:.15em;color:var(--b8);border:1px solid var(--b8);padding:14px 40px;background:none;cursor:pointer}
.paused-stop{font-size:11px;letter-spacing:.08em;color:#333;background:none;border:none;cursor:pointer;margin-top:20px}

/* ══════════════════════════════
   FINISH
══════════════════════════════ */
.fin-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;text-align:center}
.fin-check{font-size:11px;letter-spacing:.2em;color:var(--b4);margin-bottom:20px}
.fin-title{font-size:30px;font-weight:700;margin-bottom:6px}
.fin-by{font-size:12px;color:var(--b3);letter-spacing:.08em;margin-bottom:36px}
.fin-time-box{border-top:var(--line);border-bottom:var(--line);padding:16px 0;margin-bottom:36px;width:100%}
.fin-time-lbl{font-size:10px;color:var(--b4);letter-spacing:.15em;margin-bottom:6px}
.fin-time-val{font-family:var(--mono);font-size:28px;font-weight:700}
.fin-actions{display:flex;width:100%;border:var(--line)}
.fin-btn{flex:1;padding:14px;font-size:12px;font-weight:700;letter-spacing:.08em;cursor:pointer;border:none;background:none;color:var(--b0)}
.fin-btn.primary{background:var(--b0);color:var(--b8)}
.fin-btn+.fin-btn{border-left:var(--line)}
.fin-ad{padding:0 16px 24px}
</style>
</head>
<body>
<div id="app">

<!-- ═══════ HOME ═══════ -->
<div id="screen-home" class="screen active">
  <div class="home-hdr">
    <div>
      <div class="home-logo">BREW</div>
      <div class="home-sub" id="h-sub">COFFEE EXTRACTION GUIDE</div>
    </div>
    <button class="lang-btn" id="lang-btn">日本語</button>
  </div>

  <!-- Taste -->
  <div class="frow">
    <div class="frow-inner" id="f-taste">
      <button class="fchip on" data-v="">ALL</button>
      <button class="fchip" data-v="balanced">BALANCED</button>
      <button class="fchip" data-v="bright">BRIGHT</button>
      <button class="fchip" data-v="fruity">FRUITY</button>
      <button class="fchip" data-v="sweet">SWEET</button>
      <button class="fchip" data-v="bold">BOLD</button>
      <button class="fchip" data-v="clean">CLEAN</button>
      <button class="fchip" data-v="body">BODY</button>
      <button class="fchip" data-v="floral">FLORAL</button>
    </div>
  </div>

  <!-- Brewer -->
  <div class="frow">
    <div class="frow-inner" id="f-brewer">
      <button class="fchip on" data-v="" id="f-brewer-lbl">ALL BREWERS</button>
      <button class="fchip" data-v="V60">V60</button>
      <button class="fchip" data-v="Kalita">KALITA</button>
      <button class="fchip" data-v="Clever">CLEVER</button>
      <button class="fchip" data-v="Aeropress">AEROPRESS</button>
    </div>
  </div>

  <!-- HOT / ICE — separate row -->
  <div class="frow">
    <div class="frow-inner" id="f-hot">
      <button class="fchip on" data-v="" id="f-hot-all">HOT + ICE</button>
      <button class="fchip" data-v="true" id="f-hot-hot">HOT</button>
      <button class="fchip" data-v="false" id="f-hot-ice">ICE</button>
    </div>
  </div>

  <!-- Roast -->
  <div class="frow">
    <div class="frow-inner" id="f-roast">
      <button class="fchip on" data-v="" id="f-roast-lbl">ALL ROASTS</button>
      <button class="fchip" data-v="1">&#9632; LIGHT</button>
      <button class="fchip" data-v="2">&#9632;&#9632; MED-LIGHT</button>
      <button class="fchip" data-v="3">&#9632;&#9632;&#9632; MEDIUM</button>
      <button class="fchip" data-v="4">&#9632;&#9632;&#9632;&#9632; MED-DARK</button>
      <button class="fchip" data-v="5">&#9632;&#9632;&#9632;&#9632;&#9632; DARK</button>
    </div>
  </div>

  <div class="sort-bar">
    <button class="sort-btn on" id="s-new">NEW</button>
    <button class="sort-btn" id="s-pop">POPULAR</button>
    <div style="flex:1"></div>
    <div style="padding:9px 14px;font-size:11px;color:var(--b4);letter-spacing:.08em">
      <span id="r-count">—</span> <span id="r-count-lbl">RECIPES</span>
    </div>
  </div>

  <div class="rlist" id="rlist"></div>
</div>

<!-- ═══════ DETAIL ═══════ -->
<div id="screen-detail" class="screen">
  <div class="hdr">
    <button class="hdr-back" id="d-back">< ALL</button>
    <span class="hdr-title" id="d-hdr-title">RECIPE</span>
    <button class="fav-btn" id="d-fav">SAVE</button>
  </div>
  <div class="d-content" id="d-content"></div>
  <div class="start-wrap">
    <button class="start-btn" id="start-btn">START EXTRACTION ></button>
  </div>
</div>

<!-- ═══════ ACTIVE ═══════ -->
<div id="screen-active" class="screen">
  <div class="act-top">
    <div class="act-rname" id="act-rname">—</div>
    <button class="act-pause" id="act-pause-btn">PAUSE</button>
  </div>
  <div class="act-timer-wrap">
    <div class="act-timer" id="act-timer">0:00.0</div>
  </div>
  <div class="act-circle" id="act-circle">
    <canvas id="brew-canvas" width="260" height="260"></canvas>

    <!-- 5-sec countdown -->
    <div class="cd-overlay" id="cd-overlay">
      <div class="cd-num" id="cd-num">5</div>
      <div class="cd-lbl" id="cd-lbl">STARTING IN</div>
      <button class="cd-cancel" id="cd-cancel">CANCEL</button>
    </div>

    <!-- paused -->
    <div class="paused-ov" id="paused-ov">
      <div class="paused-lbl" id="paused-lbl">PAUSED</div>
      <button class="paused-resume" id="paused-resume">RESUME</button>
      <button class="paused-stop" id="paused-stop">STOP EXTRACTION</button>
    </div>
  </div>
  <div class="act-info">
    <div class="act-weight" id="act-weight">—</div>
    <div class="act-tip" id="act-tip">—</div>
    <div class="act-stepcnt" id="act-stepcnt"></div>
  </div>
  <div class="act-progbar" id="act-prog"></div>
  <div class="act-hint" id="act-hint">TAP TO PAUSE / RESUME</div>
</div>

<!-- ═══════ FINISH ═══════ -->
<div id="screen-finish" class="screen">
  <div class="hdr">
    <div></div>
    <span class="hdr-title" id="fin-hdr">COMPLETE</span>
    <div></div>
  </div>
  <div class="fin-body">
    <div class="fin-check" id="fin-check">EXTRACTION COMPLETE</div>
    <div class="fin-title" id="fin-title">—</div>
    <div class="fin-by" id="fin-by">—</div>
    <div class="fin-time-box">
      <div class="fin-time-lbl" id="fin-time-lbl">TOTAL TIME</div>
      <div class="fin-time-val" id="fin-time">—</div>
    </div>
    <div class="fin-actions">
      <button class="fin-btn" id="fin-recipe-btn">RECIPE ></button>
      <button class="fin-btn primary" id="fin-home-btn">< HOME</button>
    </div>
  </div>
  <div class="fin-ad">
    <div class="ad-slot">[ ADVERTISEMENT ]</div>
  </div>
</div>

</div><!-- #app -->
<script>
(function(){
'use strict';

/* ═══════════════════════════════════════
   I18N
═══════════════════════════════════════ */
var T = {
  en:{
    sub:'COFFEE EXTRACTION GUIDE', lang_btn:'日本語',
    all_tastes:'ALL', all_brewers:'ALL BREWERS', all_temp:'HOT + ICE',
    hot:'HOT', ice:'ICE', all_roasts:'ALL ROASTS',
    sort_new:'NEW', sort_pop:'POPULAR', count_lbl:'RECIPES',
    d_back:'< ALL', d_hdr:'RECIPE', save:'SAVE', saved:'SAVED', start:'START EXTRACTION >',
    pause:'PAUSE', resume:'RESUME', stop:'STOP EXTRACTION',
    cd_lbl:'STARTING IN', cd_cancel:'CANCEL',
    paused:'PAUSED', tap_hint:'TAP TO PAUSE / RESUME',
    fin_hdr:'COMPLETE', fin_check:'EXTRACTION COMPLETE', fin_time_lbl:'TOTAL TIME',
    fin_recipe:'RECIPE >', fin_home:'< HOME',
    sec_beans:'RECOMMENDED BEANS', sec_amount:'BEAN AMOUNT',
    sec_grind:'GRIND SIZE', sec_specs:'SPECS', sec_steps:'STEPS', sec_links:'LINKS',
    water_lbl:'WATER', ratio_lbl:'RATIO',
    spec_temp:'TEMPERATURE', spec_brewer:'BREWER', spec_grind:'GRIND', spec_time:'EST. TIME',
    link_sns:'CREATOR SNS', link_shop:'BUY BEANS',
    step_pour:'POUR', step_wait:'WAIT', cumul:'cumulative',
    grind_unit:'CLICKS',
    note_cmd:'Comandante C40/C60 reference. Tap a mill to convert.',
    note_tm:'Timemore C2 / C3 Max reference.',
    note_zp:'Zpresso J-Max / K-Max reference (turns).',
    note_va:'Varia VS3 reference (dial number).',
    step_lbl:'STEP', of_lbl:'/'
  },
  ja:{
    sub:'コーヒー抽出ガイド', lang_btn:'English',
    all_tastes:'すべて', all_brewers:'すべての器具', all_temp:'ホット + アイス',
    hot:'ホット', ice:'アイス', all_roasts:'すべての焙煎',
    sort_new:'新着', sort_pop:'人気', count_lbl:'レシピ',
    d_back:'< 一覧', d_hdr:'レシピ', save:'保存', saved:'保存済',  start:'抽出をスタート >',
    pause:'一時停止', resume:'再開', stop:'抽出を中止',
    cd_lbl:'秒後にスタート', cd_cancel:'キャンセル',
    paused:'一時停止中', tap_hint:'タップで一時停止 / 再開',
    fin_hdr:'完了', fin_check:'抽出完了', fin_time_lbl:'抽出時間',
    fin_recipe:'レシピ >', fin_home:'< ホーム',
    sec_beans:'推奨する豆', sec_amount:'豆の量',
    sec_grind:'グラインドサイズ', sec_specs:'スペック', sec_steps:'ステップ', sec_links:'リンク',
    water_lbl:'湯量', ratio_lbl:'比率',
    spec_temp:'湯温', spec_brewer:'器具', spec_grind:'挽き目', spec_time:'目安時間',
    link_sns:'クリエイターSNS', link_shop:'豆を買う',
    step_pour:'注湯', step_wait:'待機', cumul:'累積',
    grind_unit:'クリック',
    note_cmd:'Comandante C40/C60 基準。下のミルをタップして換算できます。',
    note_tm:'Timemore C2 / C3 Max 基準。',
    note_zp:'Zpresso J-Max / K-Max 基準（回転数）。',
    note_va:'Varia VS3 基準（ダイヤル数値）。',
    step_lbl:'ステップ', of_lbl:'/'
  }
};

var lang = localStorage.getItem('brew_lang') || 'en';
function t(k){ return T[lang][k] || T.en[k] || k; }

function applyStaticI18n(){
  document.getElementById('h-sub').textContent = t('sub');
  document.getElementById('lang-btn').textContent = t('lang_btn');
  document.getElementById('f-brewer-lbl').textContent = t('all_brewers');
  document.getElementById('f-hot-all').textContent = t('all_temp');
  document.getElementById('f-hot-hot').textContent = t('hot');
  document.getElementById('f-hot-ice').textContent = t('ice');
  document.getElementById('f-roast-lbl').textContent = t('all_roasts');
  document.getElementById('s-new').textContent = t('sort_new');
  document.getElementById('s-pop').textContent = t('sort_pop');
  document.getElementById('r-count-lbl').textContent = t('count_lbl');
  document.getElementById('d-back').textContent = t('d_back');
  document.getElementById('d-hdr-title').textContent = t('d_hdr');
  document.getElementById('start-btn').textContent = t('start');
  document.getElementById('act-pause-btn').textContent = t('pause');
  document.getElementById('cd-lbl').textContent = t('cd_lbl');
  document.getElementById('cd-cancel').textContent = t('cd_cancel');
  document.getElementById('paused-lbl').textContent = t('paused');
  document.getElementById('paused-resume').textContent = t('resume');
  document.getElementById('paused-stop').textContent = t('stop');
  document.getElementById('act-hint').textContent = t('tap_hint');
  document.getElementById('fin-hdr').textContent = t('fin_hdr');
  document.getElementById('fin-check').textContent = t('fin_check');
  document.getElementById('fin-time-lbl').textContent = t('fin_time_lbl');
  document.getElementById('fin-recipe-btn').textContent = t('fin_recipe');
  document.getElementById('fin-home-btn').textContent = t('fin_home');
  // update fav btn if on detail
  var fb = document.getElementById('d-fav');
  if(fb) fb.textContent = fb.classList.contains('on') ? t('saved') : t('save');
}

/* ═══════════════════════════════════════
   STATE
═══════════════════════════════════════ */
var allRecipes = [];
var currentRecipe = null;
var userBeans = 0;
var sortMode = 'new';
var filters = { taste:'', brewer:'', hot:'', roast:'' };
var favs = new Set(JSON.parse(localStorage.getItem('brew_favs')||'[]'));
var mill = 'cmd'; // cmd | tm | zp | va

// timer
var tStart = null, tElapsed = 0, raf = null;
var paused = false, wakeLock = null;
var stepIdx = 0, stepStart = 0, finTime = 0;
// countdown
var cdTimer = null, cdVal = 5;

/* ═══════════════════════════════════════
   NAV
═══════════════════════════════════════ */
function show(id){
  document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
  document.getElementById('screen-'+id).classList.add('active');
}

/* ═══════════════════════════════════════
   UTILS
═══════════════════════════════════════ */
function fmtT(ms){
  var s=ms/1000, m=Math.floor(s/60), sec=Math.floor(s%60), d=Math.floor((ms%1000)/100);
  return m+':'+String(sec).padStart(2,'0')+'.'+d;
}
function scaledWater(r,b){ return Math.round((b/r.base.beans)*r.base.water*10)/10; }
function stepTarget(r,i,b){
  var step=r.steps[i];
  if(!step.target_ratio) return null;
  return Math.round(step.target_ratio*scaledWater(r,b)*10)/10;
}
function roastDots(n){
  var h='<div class="roast-row">';
  for(var i=1;i<=5;i++) h+='<div class="rdot'+(i<=n?' on':'')+'"></div>';
  return h+'</div>';
}
function saveFavs(){ localStorage.setItem('brew_favs',JSON.stringify([...favs])); }

function getMillVal(g){
  return mill==='cmd'?g.comandante : mill==='tm'?g.timemore : mill==='zp'?g.zpresso : g.varia;
}
function millLabel(){ return mill==='cmd'?'CMD':mill==='tm'?'TIMEM':mill==='zp'?'ZPRS':'VARIA'; }
function millNoteKey(){ return mill==='cmd'?'note_cmd':mill==='tm'?'note_tm':mill==='zp'?'note_zp':'note_va'; }
function fmtMillVal(v){ return mill==='zp' ? v.toFixed(1) : String(v); }

/* ═══════════════════════════════════════
   LOAD RECIPES
═══════════════════════════════════════ */
function loadRecipes(){
  var p = new URLSearchParams();
  if(filters.taste) p.set('taste',filters.taste);
  if(filters.brewer) p.set('brewer',filters.brewer);
  if(filters.hot!=='') p.set('hot',filters.hot);
  if(filters.roast) p.set('roast',filters.roast);
  p.set('sort', sortMode==='pop'?'likes':'new');
  fetch('/api/recipes?'+p)
    .then(function(r){ return r.json(); })
    .then(function(data){
      allRecipes = data;
      var faved = data.filter(function(r){ return favs.has(r.id); });
      var rest  = data.filter(function(r){ return !favs.has(r.id); });
      var list  = faved.concat(rest);
      document.getElementById('r-count').textContent = list.length;
      renderList(list);
    });
}

function renderList(list){
  var el = document.getElementById('rlist');
  if(!list.length){ el.innerHTML='<div class="empty">NO RECIPES FOUND</div>'; return; }
  el.innerHTML = list.map(function(r){
    var f = favs.has(r.id);
    return '<div class="ritem'+(f?' faved':'')+'" data-id="'+r.id+'">'
      +'<div>'
        +'<div class="r-name">'+r.meta.title+'</div>'
        +'<div class="r-creator">'+r.meta.creator+'</div>'
        +'<div class="r-meta">'
          +'<span class="badge badge-brewer">'+r.meta.brewer+'</span>'
          +(r.meta.hot?'<span class="badge badge-hot">HOT</span>':'<span class="badge badge-ice">ICE</span>')
          +'<div class="tags">'+r.meta.tags.map(function(t){ return '<span class="tag">'+t+'</span>'; }).join('')+'</div>'
        +'</div>'
        +roastDots(r.meta.roast)
      +'</div>'
      +'<div class="r-right">'
        +'<button class="fav-btn'+(f?' on':'')+'" data-fid="'+r.id+'">'+(f?t('saved'):t('save'))+'</button>'
        +'<div class="r-likes">'+r.meta.likes.toLocaleString()+'</div>'
        +'<div class="r-arrow">&gt;</div>'
      +'</div>'
    +'</div>';
  }).join('');

  el.querySelectorAll('.ritem').forEach(function(item){
    item.addEventListener('click', function(e){
      if(e.target.closest('.fav-btn')) return;
      openDetail(item.dataset.id);
    });
  });
  el.querySelectorAll('.fav-btn[data-fid]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var id = btn.dataset.fid;
      favs.has(id) ? favs.delete(id) : favs.add(id);
      saveFavs(); loadRecipes();
    });
  });
}

/* ═══════════════════════════════════════
   DETAIL
═══════════════════════════════════════ */
function openDetail(id){
  fetch('/api/recipes/'+id)
    .then(function(r){ return r.json(); })
    .then(function(data){
      currentRecipe = data;
      userBeans = data.base.beans;
      mill = 'cmd';
      renderDetail();
      updateFavBtn();
      show('detail');
    });
}

function updateFavBtn(){
  var btn = document.getElementById('d-fav');
  var f = favs.has(currentRecipe.id);
  btn.textContent = f ? t('saved') : t('save');
  btn.className = 'fav-btn'+(f?' on':'');
}

function renderDetail(){
  var r = currentRecipe;
  var sw = scaledWater(r, userBeans);
  var tot = r.steps.reduce(function(a,s){ return a+s.duration; },0);
  var m = Math.floor(tot/60), s = tot%60;
  var desc = lang==='ja' ? r.meta.desc_ja : r.meta.desc;
  var beansNote = lang==='ja' ? r.meta.beans_note_ja : r.meta.beans_note;
  var grindLabel = lang==='ja' ? r.meta.grind.label_ja : r.meta.grind.label;

  // mill tabs
  var mills = [
    {k:'cmd',lbl:'CMD'},
    {k:'tm', lbl:'TIMEM'},
    {k:'zp', lbl:'ZPRS'},
    {k:'va', lbl:'VARIA'}
  ];
  var tabsHtml = '<div class="mill-tabs">'+mills.map(function(m){
    return '<button class="mtab'+(mill===m.k?' on':'')+'" data-m="'+m.k+'">'+m.lbl+'</button>';
  }).join('')+'</div>';

  var gv = fmtMillVal(getMillVal(r.meta.grind));

  // steps
  var stepsHtml = r.steps.map(function(step, i){
    var tgt = stepTarget(r, i, userBeans);
    var tip = lang==='ja' ? step.tip_ja : step.tip;
    var typeLbl = step.type==='pour' ? t('step_pour') : t('step_wait');
    return '<li class="step-row">'
      +'<div class="step-n">'+String(i+1).padStart(2,'0')+'</div>'
      +'<div class="step-info">'
        +'<div class="step-type '+step.type+'">'+typeLbl+'</div>'
        +'<div class="step-tip">'+tip+'</div>'
        +(tgt!==null?'<div class="step-tgt" id="st'+i+'">&sim;'+tgt.toFixed(1)+'g '+t('cumul')+'</div>':'')
      +'</div>'
      +'<div class="step-dur">'+step.duration+'s</div>'
    +'</li>';
  }).join('');

  // links
  var linkKeys = [t('link_sns'), t('link_shop')];
  var linksHtml = r.meta.links.map(function(url, i){
    return '<a href="'+url+'" target="_blank" rel="noopener" class="lrow">'
      +'<span class="lrow-k">'+linkKeys[i]+'</span>'
      +'<span class="lrow-v">'+url.replace('https://','').replace('http://','').substring(0,30)+' &gt;</span>'
    +'</a>';
  }).join('');

  document.getElementById('d-content').innerHTML =
    '<div class="d-hero">'
      +'<div class="d-title">'+r.meta.title+'</div>'
      +'<div class="d-creator">'+r.meta.creator+'</div>'
      +'<div class="d-tagrow">'
        +r.meta.tags.map(function(tag){ return '<span class="d-tag">'+tag.toUpperCase()+'</span>'; }).join('')
        +(r.meta.hot?'<span class="d-tag">HOT</span>':'<span class="d-tag">ICE</span>')
      +'</div>'
      +'<div class="d-desc">'+desc+'</div>'
    +'</div>'

    // Recommended Beans
    +'<div class="sec">'
      +'<div class="sec-lbl">'+t('sec_beans')+'</div>'
      +'<div class="beans-note">'+beansNote+'</div>'
    +'</div>'

    // Bean Amount
    +'<div class="sec">'
      +'<div class="sec-lbl">'+t('sec_amount')+'</div>'
      +'<div class="scale-row">'
        +'<div class="scale-wrap">'
          +'<div class="scale-unit">g</div>'
          +'<input class="scale-inp" id="beans-inp" type="number" min="5" max="100" step="1" value="'+userBeans+'">'
        +'</div>'
        +'<div class="scale-adj">'
          +'<button class="scale-btn" id="b-minus">-</button>'
          +'<button class="scale-btn" id="b-plus">+</button>'
        +'</div>'
      +'</div>'
      +'<div class="water-line" id="water-line">'
        +t('water_lbl')+': <b id="w-val">'+sw.toFixed(1)+'</b> ml'
        +' &nbsp; '+t('ratio_lbl')+': <b id="r-val">1:'+(sw/userBeans).toFixed(1)+'</b>'
      +'</div>'
    +'</div>'

    // Grind Size
    +'<div class="grind-sec">'
      +'<div class="sec-lbl">'+t('sec_grind')+'</div>'
      +tabsHtml
      +'<div class="grind-num" id="g-num">'+gv+'</div>'
      +'<div class="grind-sub" id="g-sub">'+t('grind_unit')+' — '+grindLabel+'</div>'
      +'<div class="grind-note" id="g-note">'+t(millNoteKey())+'</div>'
    +'</div>'

    // Specs
    +'<div class="sec">'
      +'<div class="sec-lbl">'+t('sec_specs')+'</div>'
      +'<div class="spec-grid">'
        +'<div class="sc"><div class="sc-k">'+t('spec_temp')+'</div><div class="sc-v">'+r.base.temp+'<span style="font-size:13px">°C</span></div></div>'
        +'<div class="sc"><div class="sc-k">'+t('spec_brewer')+'</div><div class="sc-vs">'+r.meta.brewer+'</div></div>'
        +'<div class="sc"><div class="sc-k">'+t('spec_grind')+'</div><div class="sc-vs">'+grindLabel+'</div></div>'
        +'<div class="sc"><div class="sc-k">'+t('spec_time')+'</div><div class="sc-v">'+m+':'+String(s).padStart(2,'0')+'</div></div>'
      +'</div>'
    +'</div>'

    // Steps
    +'<div class="sec">'
      +'<div class="sec-lbl">'+t('sec_steps')+'</div>'
      +'<ul class="step-list">'+stepsHtml+'</ul>'
    +'</div>'

    // Links
    +'<div class="lsec">'
      +'<div class="sec-lbl">'+t('sec_links')+'</div>'
      +linksHtml
    +'</div>'

    +'<div style="padding:16px"><div class="ad-slot">[ ADVERTISEMENT ]</div></div>'
    +'<div style="height:80px"></div>';

  // Mill tab events
  document.querySelectorAll('.mtab').forEach(function(tab){
    tab.addEventListener('click', function(){
      mill = tab.dataset.m;
      document.querySelectorAll('.mtab').forEach(function(t){ t.classList.remove('on'); });
      tab.classList.add('on');
      var g = currentRecipe.meta.grind;
      var gl = lang==='ja' ? g.label_ja : g.label;
      document.getElementById('g-num').textContent = fmtMillVal(getMillVal(g));
      document.getElementById('g-sub').textContent = t('grind_unit')+' — '+gl;
      document.getElementById('g-note').textContent = t(millNoteKey());
    });
  });

  // Scale inputs
  var inp = document.getElementById('beans-inp');
  document.getElementById('b-minus').addEventListener('click', function(){
    userBeans = Math.max(5, userBeans-1); inp.value = userBeans; updateScale();
  });
  document.getElementById('b-plus').addEventListener('click', function(){
    userBeans = Math.min(100, userBeans+1); inp.value = userBeans; updateScale();
  });
  inp.addEventListener('input', function(){
    var v = parseInt(inp.value);
    if(!isNaN(v) && v>=5 && v<=100){ userBeans=v; updateScale(); }
  });
}

function updateScale(){
  var r = currentRecipe;
  var sw = scaledWater(r, userBeans);
  document.getElementById('w-val').textContent = sw.toFixed(1);
  document.getElementById('r-val').textContent = '1:'+(sw/userBeans).toFixed(1);
  r.steps.forEach(function(step, i){
    var el = document.getElementById('st'+i);
    if(el && step.target_ratio){
      el.textContent = '~'+stepTarget(r,i,userBeans).toFixed(1)+'g '+t('cumul');
    }
  });
}

/* ═══════════════════════════════════════
   COUNTDOWN (5 sec)
═══════════════════════════════════════ */
function startCountdown(){
  cdVal = 5;
  var numEl = document.getElementById('cd-num');
  var ov = document.getElementById('cd-overlay');
  numEl.textContent = cdVal;
  ov.classList.add('show');

  cdTimer = setInterval(function(){
    cdVal--;
    if(cdVal <= 0){
      clearInterval(cdTimer); cdTimer = null;
      numEl.textContent = 'GO';
      setTimeout(function(){
        ov.classList.remove('show');
        beginBrew();
      }, 500);
    } else {
      numEl.textContent = cdVal;
    }
  }, 1000);
}

function cancelCountdown(){
  if(cdTimer){ clearInterval(cdTimer); cdTimer=null; }
  document.getElementById('cd-overlay').classList.remove('show');
  show('detail');
}

/* ═══════════════════════════════════════
   BREW ENGINE
═══════════════════════════════════════ */
var canvas = document.getElementById('brew-canvas');
var ctx = canvas.getContext('2d');
var RMAX = 110;

function drawCircle(phase, prog){
  var w=canvas.width, h=canvas.height, cx=w/2, cy=h/2;
  ctx.clearRect(0,0,w,h);

  // ghost ring
  ctx.beginPath(); ctx.arc(cx,cy,RMAX,0,Math.PI*2);
  ctx.strokeStyle='#1c1c1c'; ctx.lineWidth=1; ctx.stroke();

  // center cross
  ctx.strokeStyle='#2a2a2a'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(cx-8,cy); ctx.lineTo(cx+8,cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx,cy-8); ctx.lineTo(cx,cy+8); ctx.stroke();

  var r = RMAX * Math.max(0, prog);
  if(r < 0.5) return;

  if(phase==='pour'){
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,0.88)'; ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
    // arc indicator
    ctx.beginPath();
    ctx.arc(cx,cy,r-5,-Math.PI/2, -Math.PI/2 + Math.PI*2*prog);
    ctx.strokeStyle='#000'; ctx.lineWidth=2.5; ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle='#3a3a3a'; ctx.lineWidth=2; ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx,cy,r,-Math.PI/2, -Math.PI/2 + Math.PI*2*prog);
    ctx.strokeStyle='#666'; ctx.lineWidth=1.5; ctx.stroke();
  }
}

function buildProg(){
  var bar = document.getElementById('act-prog');
  bar.innerHTML = currentRecipe.steps.map(function(_,i){
    return '<div class="pseg" id="ps'+i+'"></div>';
  }).join('');
}
function updateProg(idx){
  currentRecipe.steps.forEach(function(_,i){
    var el = document.getElementById('ps'+i);
    if(!el) return;
    el.className='pseg';
    if(i<idx) el.classList.add('done');
    if(i===idx) el.classList.add('cur');
  });
}

async function acquireWakeLock(){
  if('wakeLock' in navigator){ try{ wakeLock=await navigator.wakeLock.request('screen'); }catch(e){} }
}
function releaseWakeLock(){ if(wakeLock){ wakeLock.release(); wakeLock=null; } }

// Called from detail START button
function startBrew(){
  stepIdx=0; tElapsed=0; tStart=null; stepStart=0; paused=false; finTime=0;
  document.getElementById('act-rname').textContent = currentRecipe.meta.title.toUpperCase();
  document.getElementById('act-timer').textContent = '0:00.0';
  document.getElementById('act-weight').textContent = '—';
  document.getElementById('act-tip').textContent = '—';
  document.getElementById('act-stepcnt').textContent = '';
  ctx.clearRect(0,0,canvas.width,canvas.height);
  buildProg();
  acquireWakeLock();
  show('active');
  // update pause btn label
  document.getElementById('act-pause-btn').textContent = t('pause');
  startCountdown();
}

// Called after countdown ends
function beginBrew(){
  tStart = performance.now();
  stepStart = 0;
  raf = requestAnimationFrame(tick);
}

function tick(now){
  if(paused) return;
  tElapsed = now - tStart;
  document.getElementById('act-timer').textContent = fmtT(tElapsed);

  var step = currentRecipe.steps[stepIdx];
  var sElapsed = (tElapsed - stepStart) / 1000;
  var rawP = Math.min(sElapsed / step.duration, 1);
  var prog = step.type==='pour' ? rawP : (1-rawP);
  drawCircle(step.type, prog);

  var tgt = stepTarget(currentRecipe, stepIdx, userBeans);
  var tip = lang==='ja' ? step.tip_ja : step.tip;
  var typeLbl = step.type==='pour' ? t('step_pour') : t('step_wait');

  document.getElementById('act-weight').textContent = tgt!==null ? '~'+tgt.toFixed(1)+'g' : '— g';
  document.getElementById('act-tip').textContent = tip.toUpperCase();
  document.getElementById('act-stepcnt').textContent =
    t('step_lbl')+' '+(stepIdx+1)+' '+t('of_lbl')+' '+currentRecipe.steps.length
    +' \u2022 '+typeLbl+' '+step.duration+'s';
  updateProg(stepIdx);

  if(sElapsed >= step.duration){
    stepIdx++;
    if(stepIdx >= currentRecipe.steps.length){ finishBrew(); return; }
    stepStart = tElapsed;
  }
  raf = requestAnimationFrame(tick);
}

function pauseBrew(){
  if(paused) return;
  paused=true;
  cancelAnimationFrame(raf);
  document.getElementById('paused-ov').classList.add('show');
  document.getElementById('act-pause-btn').textContent = t('resume');
}
function resumeBrew(){
  if(!paused) return;
  paused=false;
  // rebuild tStart so elapsed doesn't jump
  tStart = performance.now() - tElapsed;
  document.getElementById('paused-ov').classList.remove('show');
  document.getElementById('act-pause-btn').textContent = t('pause');
  raf = requestAnimationFrame(tick);
}
function stopBrew(){
  cancelAnimationFrame(raf);
  if(cdTimer){ clearInterval(cdTimer); cdTimer=null; }
  releaseWakeLock();
  paused=false;
  document.getElementById('paused-ov').classList.remove('show');
  document.getElementById('cd-overlay').classList.remove('show');
  show('detail');
}
function finishBrew(){
  finTime = tElapsed;
  cancelAnimationFrame(raf);
  releaseWakeLock();
  document.getElementById('paused-ov').classList.remove('show');
  document.getElementById('fin-title').textContent = currentRecipe.meta.title;
  document.getElementById('fin-by').textContent = currentRecipe.meta.creator;
  document.getElementById('fin-time').textContent = fmtT(finTime);
  show('finish');
}

/* ═══════════════════════════════════════
   EVENT BINDINGS
═══════════════════════════════════════ */

// Lang toggle
document.getElementById('lang-btn').addEventListener('click', function(){
  lang = lang==='en' ? 'ja' : 'en';
  localStorage.setItem('brew_lang', lang);
  applyStaticI18n();
  // update taste filter "ALL" chip
  document.querySelector('#f-taste .fchip[data-v=""]').textContent = t('all_tastes');
  if(currentRecipe && document.getElementById('screen-detail').classList.contains('active')){
    renderDetail(); updateFavBtn();
  }
  loadRecipes();
});

// Taste filter
document.getElementById('f-taste').addEventListener('click', function(e){
  var b = e.target.closest('.fchip'); if(!b) return;
  document.querySelectorAll('#f-taste .fchip').forEach(function(x){ x.classList.remove('on'); });
  b.classList.add('on');
  filters.taste = b.dataset.v;
  loadRecipes();
});

// Brewer filter
document.getElementById('f-brewer').addEventListener('click', function(e){
  var b = e.target.closest('.fchip'); if(!b) return;
  document.querySelectorAll('#f-brewer .fchip').forEach(function(x){ x.classList.remove('on'); });
  b.classList.add('on');
  filters.brewer = b.dataset.v;
  loadRecipes();
});

// HOT / ICE filter (independent row)
document.getElementById('f-hot').addEventListener('click', function(e){
  var b = e.target.closest('.fchip'); if(!b) return;
  document.querySelectorAll('#f-hot .fchip').forEach(function(x){ x.classList.remove('on'); });
  b.classList.add('on');
  filters.hot = b.dataset.v;
  loadRecipes();
});

// Roast filter
document.getElementById('f-roast').addEventListener('click', function(e){
  var b = e.target.closest('.fchip'); if(!b) return;
  document.querySelectorAll('#f-roast .fchip').forEach(function(x){ x.classList.remove('on'); });
  b.classList.add('on');
  filters.roast = b.dataset.v;
  loadRecipes();
});

// Sort
document.getElementById('s-new').addEventListener('click', function(){
  sortMode='new';
  document.getElementById('s-new').classList.add('on');
  document.getElementById('s-pop').classList.remove('on');
  loadRecipes();
});
document.getElementById('s-pop').addEventListener('click', function(){
  sortMode='pop';
  document.getElementById('s-pop').classList.add('on');
  document.getElementById('s-new').classList.remove('on');
  loadRecipes();
});

// Detail back
document.getElementById('d-back').addEventListener('click', function(){ show('home'); loadRecipes(); });

// Detail fav
document.getElementById('d-fav').addEventListener('click', function(){
  if(!currentRecipe) return;
  favs.has(currentRecipe.id) ? favs.delete(currentRecipe.id) : favs.add(currentRecipe.id);
  saveFavs(); updateFavBtn();
});

// Start
document.getElementById('start-btn').addEventListener('click', startBrew);

// Active circle tap → pause/resume (only after countdown done)
document.getElementById('act-circle').addEventListener('click', function(e){
  if(e.target.closest('#cd-overlay')) return;
  if(e.target.closest('#paused-ov')) return;
  if(!tStart) return; // still in countdown
  paused ? resumeBrew() : pauseBrew();
});

// Pause btn
document.getElementById('act-pause-btn').addEventListener('click', function(){
  if(!tStart) return;
  paused ? resumeBrew() : pauseBrew();
});

// Paused overlay buttons
document.getElementById('paused-resume').addEventListener('click', resumeBrew);
document.getElementById('paused-stop').addEventListener('click', stopBrew);

// Countdown cancel
document.getElementById('cd-cancel').addEventListener('click', cancelCountdown);

// Finish buttons
document.getElementById('fin-recipe-btn').addEventListener('click', function(){ renderDetail(); show('detail'); });
document.getElementById('fin-home-btn').addEventListener('click', function(){ show('home'); loadRecipes(); });

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
applyStaticI18n();
loadRecipes();

})();
</script>
</body>
</html>`
