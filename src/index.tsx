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
  --b0:#000;--b2:#333;--b3:#666;--b4:#999;--b5:#ccc;--b7:#f5f5f5;--b8:#fff;
  --sans:'Inter',system-ui,sans-serif;
  --mono:'Roboto Mono','Menlo',monospace;
  --line:1px solid #000;
  --line-l:1px solid #ccc;
  --w:640px;
}
html{font-size:16px;-webkit-text-size-adjust:100%}
body{font-family:var(--sans);background:var(--b8);color:var(--b0);min-height:100dvh;-webkit-font-smoothing:antialiased;overflow:hidden}
button{font-family:var(--sans);cursor:pointer;border:none;background:none}
input{font-family:var(--sans)}
a{color:inherit;text-decoration:none}

/* ── SCREEN STACK ── */
/* All screens sit in a stack; only one is visible at a time */
#app{position:fixed;inset:0;overflow:hidden}
.screen{
  position:absolute;inset:0;
  display:flex;flex-direction:column;
  max-width:var(--w);margin:0 auto;
  background:var(--b8);
  transform:translateX(100%);
  transition:transform .22s ease;
  overflow:hidden;
}
.screen.visible{transform:translateX(0)}

/* HOME & DETAIL: scrollable content */
#screen-home,#screen-detail{overflow-y:auto}

/* ACTIVE: dark full-screen */
#screen-active{
  background:var(--b0);color:var(--b8);
  transform:translateY(100%);
}
#screen-active.visible{transform:translateY(0)}

/* HEADER */
.hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:var(--line);position:sticky;top:0;background:var(--b8);z-index:50;flex-shrink:0}
.hdr-title{font-size:11px;font-weight:700;letter-spacing:.18em}
.hdr-back{font-size:12px;font-weight:600;letter-spacing:.06em;cursor:pointer}
.lang-btn{font-size:11px;font-weight:700;letter-spacing:.08em;border:var(--line);padding:4px 9px}

/* HOME */
.home-hdr{padding:18px 16px 12px;border-bottom:var(--line);display:flex;align-items:flex-end;justify-content:space-between;flex-shrink:0}
.home-logo{font-size:26px;font-weight:700;letter-spacing:.04em}
.home-sub{font-size:11px;color:var(--b4);letter-spacing:.12em;margin-top:2px}

.frow{border-bottom:var(--line-l);overflow-x:auto;-webkit-overflow-scrolling:touch;white-space:nowrap;flex-shrink:0}
.frow::-webkit-scrollbar{display:none}
.frow-inner{display:inline-flex}
.fchip{font-size:11px;font-weight:600;letter-spacing:.08em;padding:10px 13px;border:none;background:none;cursor:pointer;border-right:var(--line-l);color:var(--b4)}
.fchip:last-child{border-right:none}
.fchip.on{color:var(--b0);background:var(--b7)}

.sort-bar{display:flex;border-bottom:var(--line);flex-shrink:0}
.sort-btn{font-size:11px;font-weight:600;letter-spacing:.1em;padding:9px 14px;cursor:pointer;border:none;background:none;border-right:var(--line-l);color:var(--b4)}
.sort-btn.on{color:var(--b0)}

.rlist{flex:1;overflow-y:auto}
.ritem{display:grid;grid-template-columns:1fr auto;gap:12px;padding:15px 16px;border-bottom:var(--line-l);cursor:pointer}
.ritem:active{background:var(--b7)}
.ritem.faved{background:var(--b7)}
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

/* DETAIL */
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
.grind-sec{padding:16px;border-bottom:var(--line-l)}
.mill-tabs{display:flex;border:var(--line);margin-bottom:14px}
.mtab{flex:1;padding:7px 4px;font-size:10px;font-weight:700;letter-spacing:.06em;text-align:center;cursor:pointer;border-right:var(--line);color:var(--b4);background:none}
.mtab:last-child{border-right:none}
.mtab.on{background:var(--b0);color:var(--b8)}
.grind-num{font-family:var(--mono);font-size:42px;font-weight:700;text-align:center;line-height:1;margin-bottom:4px}
.grind-sub{font-size:10px;color:var(--b4);letter-spacing:.12em;text-align:center;margin-bottom:8px}
.grind-note{font-size:11px;color:var(--b4);line-height:1.55}
.spec-grid{display:grid;grid-template-columns:1fr 1fr}
.sc{padding:12px 0;border-right:var(--line-l);border-bottom:var(--line-l)}
.sc:nth-child(even){border-right:none;padding-left:16px}
.sc:nth-last-child(-n+2){border-bottom:none}
.sc-k{font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--b4);margin-bottom:4px}
.sc-v{font-family:var(--mono);font-size:18px;font-weight:700}
.sc-vs{font-size:13px;font-weight:600}
.step-list{list-style:none}
.step-row{display:flex;align-items:stretch;border-bottom:var(--line-l)}
.step-n{width:36px;min-height:48px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:11px;color:var(--b5);border-right:var(--line-l);flex-shrink:0}
.step-info{flex:1;padding:11px 12px}
.step-type{font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--b4);margin-bottom:3px}
.step-type.pour{color:var(--b0)}
.step-tip{font-size:13px;font-weight:500;margin-bottom:3px}
.step-tgt{font-family:var(--mono);font-size:12px;color:var(--b3)}
.step-dur{width:48px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:12px;color:var(--b3);border-left:var(--line-l);flex-shrink:0}
.lsec{padding:16px;border-bottom:var(--line-l)}
.lrow{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:var(--line-l)}
.lrow:last-child{border-bottom:none}
.lrow-k{font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--b4)}
.lrow-v{font-size:12px;display:flex;align-items:center;gap:8px}
.ad-slot{border:var(--line-l);height:76px;display:flex;align-items:center;justify-content:center;color:var(--b5);font-size:10px;letter-spacing:.12em}
.start-wrap{position:fixed;bottom:0;left:0;right:0;max-width:var(--w);margin:0 auto;padding:14px 16px;background:var(--b8);border-top:var(--line)}
.start-btn{width:100%;padding:15px;background:var(--b0);color:var(--b8);font-size:12px;font-weight:700;letter-spacing:.15em;cursor:pointer;border:none}

/* ── ACTIVE SCREEN ── */
/* Top bar */
.act-top{padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;border-bottom:1px solid #1a1a1a}
.act-rname{font-size:11px;letter-spacing:.12em;color:#666}
.act-pause{font-size:11px;font-weight:700;letter-spacing:.08em;color:#999;border:1px solid #2a2a2a;padding:5px 12px;background:none}

/* Timer */
.act-timer-wrap{text-align:center;padding:16px 0 8px;flex-shrink:0}
.act-timer{font-family:var(--mono);font-size:52px;font-weight:700;color:#fff;letter-spacing:.04em}

/* Canvas area */
.act-canvas-wrap{
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  min-height:160px;
}
#brew-canvas{
  display:block;
  /* canvas is always 240x240 internally */
}

/* Countdown overlay */
.cd-overlay{
  position:absolute;inset:0;
  background:#000;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  z-index:10;
  opacity:0;pointer-events:none;
  transition:opacity .15s;
}
.cd-overlay.show{opacity:1;pointer-events:auto}
.cd-num{font-family:var(--mono);font-size:110px;font-weight:700;color:#fff;line-height:1}
.cd-lbl{font-size:11px;letter-spacing:.2em;color:#444;margin-top:12px}
.cd-cancel{font-size:11px;letter-spacing:.1em;color:#444;background:none;border:1px solid #222;padding:8px 24px;cursor:pointer;margin-top:36px}

/* Paused overlay */
.paused-ov{
  position:absolute;inset:0;
  background:rgba(0,0,0,.94);
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  z-index:20;
  opacity:0;pointer-events:none;
  transition:opacity .15s;
}
.paused-ov.show{opacity:1;pointer-events:auto}
.paused-lbl{font-size:12px;letter-spacing:.2em;color:#555;margin-bottom:28px}
.paused-resume{font-size:12px;font-weight:700;letter-spacing:.15em;color:#fff;border:1px solid #fff;padding:14px 40px;background:none;cursor:pointer}
.paused-stop{font-size:11px;letter-spacing:.08em;color:#333;background:none;border:none;cursor:pointer;margin-top:20px}

/* Scale (gram meter) */
.act-scale-wrap{flex-shrink:0;padding:8px 20px 4px;display:flex;flex-direction:column;align-items:center}
.scale-bar-outer{width:100%;max-width:320px;height:4px;background:#1a1a1a;position:relative;margin-bottom:8px}
.scale-bar-inner{position:absolute;left:0;top:0;bottom:0;background:#fff;max-width:100%}
.scale-readout{display:flex;align-items:baseline;gap:6px;font-family:var(--mono)}
.scale-cur-g{font-size:40px;font-weight:700;color:#fff;line-height:1}
.scale-slash{font-size:20px;color:#333;line-height:1}
.scale-target-g{font-size:18px;color:#3a3a3a;line-height:1}
.scale-unit-g{font-size:12px;color:#555;letter-spacing:.1em}

/* Tip */
.act-info{text-align:center;padding:6px 24px 2px;flex-shrink:0}
.act-tip{font-size:12px;letter-spacing:.08em;color:#888}
.act-stepcnt{font-size:10px;color:#333;letter-spacing:.12em;margin-top:3px}

/* Progress bar */
.act-progbar{display:flex;gap:3px;padding:0 16px 6px;flex-shrink:0}
.pseg{height:2px;flex:1;background:#1a1a1a}
.pseg.done{background:#444}
.pseg.cur{background:#fff}

/* Bottom hint */
.act-hint{text-align:center;padding:6px 0 max(10px,env(safe-area-inset-bottom));font-size:10px;letter-spacing:.12em;color:#2a2a2a;flex-shrink:0}

/* FINISH */
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

<!-- ═══ HOME ═══ -->
<div id="screen-home" class="screen visible">
  <div class="home-hdr">
    <div>
      <div class="home-logo">BREW</div>
      <div class="home-sub" id="h-sub">COFFEE EXTRACTION GUIDE</div>
    </div>
    <button class="lang-btn" id="lang-btn">日本語</button>
  </div>
  <!-- ROW 1: Taste filter -->
  <div class="frow"><div class="frow-inner" id="f-taste">
    <button class="fchip on" data-v="">ALL</button>
    <button class="fchip" data-v="balanced">BALANCED</button>
    <button class="fchip" data-v="bright">BRIGHT</button>
    <button class="fchip" data-v="fruity">FRUITY</button>
    <button class="fchip" data-v="sweet">SWEET</button>
    <button class="fchip" data-v="bold">BOLD</button>
    <button class="fchip" data-v="clean">CLEAN</button>
    <button class="fchip" data-v="body">BODY</button>
    <button class="fchip" data-v="floral">FLORAL</button>
  </div></div>
  <!-- ROW 2: Brewer filter -->
  <div class="frow"><div class="frow-inner" id="f-brewer">
    <button class="fchip on" data-v="" id="f-brewer-all">ALL BREWERS</button>
    <button class="fchip" data-v="V60">V60</button>
    <button class="fchip" data-v="Kalita">KALITA</button>
    <button class="fchip" data-v="Clever">CLEVER</button>
    <button class="fchip" data-v="Aeropress">AEROPRESS</button>
  </div></div>
  <!-- ROW 3: HOT / ICE — separate row -->
  <div class="frow"><div class="frow-inner" id="f-hot">
    <button class="fchip on" data-v="" id="f-hot-all">HOT + ICE</button>
    <button class="fchip" data-v="true" id="f-hot-hot">HOT</button>
    <button class="fchip" data-v="false" id="f-hot-ice">ICE</button>
  </div></div>
  <!-- ROW 4: Roast filter -->
  <div class="frow"><div class="frow-inner" id="f-roast">
    <button class="fchip on" data-v="" id="f-roast-all">ALL ROASTS</button>
    <button class="fchip" data-v="1">&#9632; LIGHT</button>
    <button class="fchip" data-v="2">&#9632;&#9632; MED-LIGHT</button>
    <button class="fchip" data-v="3">&#9632;&#9632;&#9632; MEDIUM</button>
    <button class="fchip" data-v="4">&#9632;&#9632;&#9632;&#9632; MED-DARK</button>
    <button class="fchip" data-v="5">&#9632;&#9632;&#9632;&#9632;&#9632; DARK</button>
  </div></div>
  <!-- Sort bar -->
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

<!-- ═══ DETAIL ═══ -->
<div id="screen-detail" class="screen">
  <div class="hdr">
    <button class="hdr-back" id="d-back">&lt; ALL</button>
    <span class="hdr-title" id="d-hdr-title">RECIPE</span>
    <button class="fav-btn" id="d-fav">SAVE</button>
  </div>
  <div class="d-content" id="d-content"></div>
  <div class="start-wrap">
    <button class="start-btn" id="start-btn">START EXTRACTION &gt;</button>
  </div>
</div>

<!-- ═══ ACTIVE ═══ -->
<div id="screen-active" class="screen">
  <!-- Top bar -->
  <div class="act-top">
    <div class="act-rname" id="act-rname">—</div>
    <button class="act-pause" id="act-pause-btn">PAUSE</button>
  </div>
  <!-- Timer -->
  <div class="act-timer-wrap">
    <div class="act-timer" id="act-timer">0:00.0</div>
  </div>
  <!-- Canvas + overlays -->
  <div class="act-canvas-wrap" id="act-canvas-wrap">
    <canvas id="brew-canvas" width="240" height="240"></canvas>
    <!-- Countdown overlay -->
    <div class="cd-overlay" id="cd-overlay">
      <div class="cd-num" id="cd-num">5</div>
      <div class="cd-lbl" id="cd-lbl">STARTING IN</div>
      <button class="cd-cancel" id="cd-cancel">CANCEL</button>
    </div>
    <!-- Paused overlay -->
    <div class="paused-ov" id="paused-ov">
      <div class="paused-lbl" id="paused-lbl">PAUSED</div>
      <button class="paused-resume" id="paused-resume">RESUME</button>
      <button class="paused-stop" id="paused-stop">STOP EXTRACTION</button>
    </div>
  </div>
  <!-- Gram scale display -->
  <div class="act-scale-wrap">
    <div class="scale-bar-outer">
      <div class="scale-bar-inner" id="scale-bar-inner" style="width:0%"></div>
    </div>
    <div class="scale-readout">
      <div class="scale-cur-g" id="scale-cur-g">0.0</div>
      <div class="scale-slash">/</div>
      <div class="scale-target-g" id="scale-target-g">—</div>
      <div class="scale-unit-g">g</div>
    </div>
  </div>
  <!-- Tip -->
  <div class="act-info">
    <div class="act-tip" id="act-tip">—</div>
    <div class="act-stepcnt" id="act-stepcnt"></div>
  </div>
  <!-- Step progress bar -->
  <div class="act-progbar" id="act-prog"></div>
  <!-- Bottom hint -->
  <div class="act-hint" id="act-hint">TAP TO PAUSE / RESUME</div>
</div>

<!-- ═══ FINISH ═══ -->
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
      <button class="fin-btn" id="fin-recipe-btn">RECIPE &gt;</button>
      <button class="fin-btn primary" id="fin-home-btn">&lt; HOME</button>
    </div>
  </div>
  <div class="fin-ad"><div class="ad-slot">[ ADVERTISEMENT ]</div></div>
</div>

</div><!-- #app -->

<script>
(function(){
'use strict';

/* ══════════════════════════════════════════════
   I18N
══════════════════════════════════════════════ */
var T = {
  en:{
    sub:'COFFEE EXTRACTION GUIDE',
    lang_btn:'日本語',
    all_brewers:'ALL BREWERS',
    all_temp:'HOT + ICE',
    hot:'HOT', ice:'ICE',
    all_roasts:'ALL ROASTS',
    all_tastes:'ALL',
    sort_new:'NEW', sort_pop:'POPULAR',
    count_lbl:'RECIPES',
    d_back:'< ALL', d_hdr:'RECIPE',
    save:'SAVE', saved:'SAVED',
    start:'START EXTRACTION >',
    pause:'PAUSE', resume:'RESUME', stop:'STOP EXTRACTION',
    cd_lbl:'STARTING IN', cd_cancel:'CANCEL',
    paused:'PAUSED', tap_hint:'TAP TO PAUSE / RESUME',
    fin_hdr:'COMPLETE', fin_check:'EXTRACTION COMPLETE',
    fin_time_lbl:'TOTAL TIME',
    fin_recipe:'RECIPE >', fin_home:'< HOME',
    sec_beans:'RECOMMENDED BEANS', sec_amount:'BEAN AMOUNT',
    sec_grind:'GRIND SIZE', sec_specs:'SPECS',
    sec_steps:'STEPS', sec_links:'LINKS',
    water_lbl:'WATER', ratio_lbl:'RATIO',
    spec_temp:'TEMPERATURE', spec_brewer:'BREWER',
    spec_grind:'GRIND', spec_time:'EST. TIME',
    link_sns:'CREATOR SNS', link_shop:'BUY BEANS',
    step_pour:'POUR', step_wait:'WAIT', cumul:'cumul.',
    grind_unit:'CLICKS',
    note_cmd:'Comandante C40/C60. Tap a tab to convert.',
    note_tm:'Timemore C2 / C3 Max.',
    note_zp:'Zpresso J-Max / K-Max (turns).',
    note_va:'Varia VS3 (dial number).',
    step_lbl:'STEP', of_lbl:'/'
  },
  ja:{
    sub:'コーヒー抽出ガイド',
    lang_btn:'English',
    all_brewers:'すべての器具',
    all_temp:'ホット + アイス',
    hot:'ホット', ice:'アイス',
    all_roasts:'すべての焙煎',
    all_tastes:'すべて',
    sort_new:'新着', sort_pop:'人気',
    count_lbl:'レシピ',
    d_back:'< 一覧', d_hdr:'レシピ',
    save:'保存', saved:'保存済',
    start:'抽出をスタート >',
    pause:'一時停止', resume:'再開', stop:'抽出を中止',
    cd_lbl:'秒後にスタート', cd_cancel:'キャンセル',
    paused:'一時停止中', tap_hint:'タップで一時停止 / 再開',
    fin_hdr:'完了', fin_check:'抽出完了',
    fin_time_lbl:'抽出時間',
    fin_recipe:'レシピ >', fin_home:'< ホーム',
    sec_beans:'推奨する豆', sec_amount:'豆の量',
    sec_grind:'グラインドサイズ', sec_specs:'スペック',
    sec_steps:'ステップ', sec_links:'リンク',
    water_lbl:'湯量', ratio_lbl:'比率',
    spec_temp:'湯温', spec_brewer:'器具',
    spec_grind:'挽き目', spec_time:'目安時間',
    link_sns:'クリエイターSNS', link_shop:'豆を買う',
    step_pour:'注湯', step_wait:'待機', cumul:'累積',
    grind_unit:'クリック',
    note_cmd:'Comandante C40/C60 基準。タブをタップして換算。',
    note_tm:'Timemore C2 / C3 Max 基準。',
    note_zp:'Zpresso J-Max / K-Max（回転数）。',
    note_va:'Varia VS3（ダイヤル数値）。',
    step_lbl:'ステップ', of_lbl:'/'
  }
};

var lang = 'en';
try { lang = localStorage.getItem('brew_lang') || 'en'; } catch(e){}

function t(k){ return (T[lang] && T[lang][k]) || T.en[k] || k; }

function applyI18n(){
  setText('h-sub', t('sub'));
  setText('lang-btn', t('lang_btn'));
  setText('f-brewer-all', t('all_brewers'));
  setText('f-hot-all', t('all_temp'));
  setText('f-hot-hot', t('hot'));
  setText('f-hot-ice', t('ice'));
  setText('f-roast-all', t('all_roasts'));
  setText('s-new', t('sort_new'));
  setText('s-pop', t('sort_pop'));
  setText('r-count-lbl', t('count_lbl'));
  setText('d-back', t('d_back'));
  setText('d-hdr-title', t('d_hdr'));
  setText('start-btn', t('start'));
  setText('act-pause-btn', t('pause'));
  setText('cd-lbl', t('cd_lbl'));
  setText('cd-cancel', t('cd_cancel'));
  setText('paused-lbl', t('paused'));
  setText('paused-resume', t('resume'));
  setText('paused-stop', t('stop'));
  setText('act-hint', t('tap_hint'));
  setText('fin-hdr', t('fin_hdr'));
  setText('fin-check', t('fin_check'));
  setText('fin-time-lbl', t('fin_time_lbl'));
  setText('fin-recipe-btn', t('fin_recipe'));
  setText('fin-home-btn', t('fin_home'));
  // Update fav button
  var fb = document.getElementById('d-fav');
  if(fb) fb.textContent = fb.classList.contains('on') ? t('saved') : t('save');
  // Update taste ALL chip
  var allChip = document.querySelector('#f-taste .fchip[data-v=""]');
  if(allChip) allChip.textContent = t('all_tastes');
}
function setText(id, val){
  var el = document.getElementById(id);
  if(el) el.textContent = val;
}

/* ══════════════════════════════════════════════
   STATE
══════════════════════════════════════════════ */
var currentRecipe = null;
var userBeans = 0;
var sortMode = 'new';
var filters = { taste:'', brewer:'', hot:'', roast:'' };
var favs = new Set();
try { favs = new Set(JSON.parse(localStorage.getItem('brew_favs') || '[]')); } catch(e){}
var mill = 'cmd';

// Brew state
var brewActive = false;  // true when brew loop is running
var brewPaused = false;
var brewStart = 0;       // Date.now() when brew started
var pausedAt = 0;        // Date.now() when paused
var totalPaused = 0;     // accumulated paused ms
var stepIdx = 0;
var stepStartMs = 0;     // elapsed ms when current step began
var rafId = null;
var finTimeMs = 0;

// Countdown
var cdInterval = null;
var cdActive = false;
var cdCount = 5;

// Display grams (smoothed)
var dispGrams = 0;

/* ══════════════════════════════════════════════
   SCREEN NAVIGATION
══════════════════════════════════════════════ */
var SCREENS = ['home','detail','active','finish'];
function showScreen(id){
  SCREENS.forEach(function(s){
    var el = document.getElementById('screen-' + s);
    if(!el) return;
    if(s === id){
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  });
}

/* ══════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════ */
function fmtT(ms){
  var s = ms / 1000;
  var m = Math.floor(s / 60);
  var sec = Math.floor(s % 60);
  var d = Math.floor((ms % 1000) / 100);
  return m + ':' + pad2(sec) + '.' + d;
}
function pad2(n){ return n < 10 ? '0' + n : '' + n; }

function scaledWater(r, b){
  return Math.round((b / r.base.beans) * r.base.water * 10) / 10;
}
function stepTargetG(r, i, b){
  var step = r.steps[i];
  if(step.target_ratio == null) return null;
  return Math.round(step.target_ratio * scaledWater(r, b) * 10) / 10;
}
function prevCumulG(r, i, b){
  var last = 0;
  for(var j = 0; j < i; j++){
    var tg = stepTargetG(r, j, b);
    if(tg !== null) last = tg;
  }
  return last;
}
function cumulTargetAtStep(r, i, b){
  var last = 0;
  for(var j = 0; j <= i; j++){
    var tg = stepTargetG(r, j, b);
    if(tg !== null) last = tg;
  }
  return last;
}
function totalWaterG(r, b){ return scaledWater(r, b); }

function roastDots(n){
  var h = '<div class="roast-row">';
  for(var i = 1; i <= 5; i++) h += '<div class="rdot' + (i <= n ? ' on' : '') + '"></div>';
  return h + '</div>';
}
function saveFavs(){
  try { localStorage.setItem('brew_favs', JSON.stringify([...favs])); } catch(e){}
}
function getMillVal(g){
  if(mill==='cmd') return g.comandante;
  if(mill==='tm')  return g.timemore;
  if(mill==='zp')  return g.zpresso;
  return g.varia;
}
function fmtMillVal(v){ return mill==='zp' ? (+v).toFixed(1) : String(v); }
function millNoteKey(){ return {cmd:'note_cmd',tm:'note_tm',zp:'note_zp',va:'note_va'}[mill] || 'note_cmd'; }

/* ══════════════════════════════════════════════
   CANVAS
══════════════════════════════════════════════ */
var canvas = null;
var ctx = null;
var CSIZE = 240;
var RMAX  = 108;

function initCanvas(){
  canvas = document.getElementById('brew-canvas');
  ctx = canvas.getContext('2d');
  // Always fixed internal size
  canvas.width  = CSIZE;
  canvas.height = CSIZE;
}

function drawIdle(){
  if(!ctx) return;
  ctx.clearRect(0, 0, CSIZE, CSIZE);
  var cx = CSIZE/2, cy = CSIZE/2;
  ctx.beginPath(); ctx.arc(cx, cy, RMAX, 0, Math.PI*2);
  ctx.strokeStyle = '#1c1c1c'; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx-6,cy); ctx.lineTo(cx+6,cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx,cy-6); ctx.lineTo(cx,cy+6); ctx.stroke();
}

function drawCircle(phase, prog){
  if(!ctx) return;
  ctx.clearRect(0, 0, CSIZE, CSIZE);
  var cx = CSIZE/2, cy = CSIZE/2;

  // Ghost ring
  ctx.beginPath(); ctx.arc(cx, cy, RMAX, 0, Math.PI*2);
  ctx.strokeStyle = '#1c1c1c'; ctx.lineWidth = 1; ctx.stroke();
  // Center cross
  ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx-6,cy); ctx.lineTo(cx+6,cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx,cy-6); ctx.lineTo(cx,cy+6); ctx.stroke();

  var r = RMAX * Math.max(0, Math.min(1, prog));
  if(r < 1) return;

  if(phase === 'pour'){
    // Expanding filled circle
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
    // Progress arc on outside
    var a = -Math.PI/2;
    var end = a + Math.PI*2 * prog;
    ctx.beginPath(); ctx.arc(cx, cy, r + 3, a, end);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  } else {
    // Shrinking ring
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 2; ctx.stroke();
    // Remaining arc
    var a2 = -Math.PI/2;
    var end2 = a2 + Math.PI*2 * prog;
    ctx.beginPath(); ctx.arc(cx, cy, r, a2, end2);
    ctx.strokeStyle = '#777'; ctx.lineWidth = 2; ctx.stroke();
  }
}

/* ══════════════════════════════════════════════
   SCALE DISPLAY
══════════════════════════════════════════════ */
function computeGrams(r, beans, si, stepElapsedSec){
  var step = r.steps[si];
  var prev = prevCumulG(r, si, beans);
  if(step.type === 'pour' && step.target_ratio != null){
    var thisTgt = stepTargetG(r, si, beans);
    var frac = Math.min(stepElapsedSec / step.duration, 1);
    return prev + (thisTgt - prev) * frac;
  }
  return prev;
}

function updateScaleDisplay(g, tgt){
  var total = totalWaterG(currentRecipe, userBeans);
  var pct = total > 0 ? Math.min(g / total * 100, 100) : 0;
  document.getElementById('scale-bar-inner').style.width = pct.toFixed(1) + '%';
  document.getElementById('scale-cur-g').textContent = g.toFixed(1);
  document.getElementById('scale-target-g').textContent = tgt != null ? tgt.toFixed(1) : '—';
}

/* ══════════════════════════════════════════════
   PROGRESS BAR
══════════════════════════════════════════════ */
function buildProg(){
  var bar = document.getElementById('act-prog');
  bar.innerHTML = currentRecipe.steps.map(function(_, i){
    return '<div class="pseg" id="ps' + i + '"></div>';
  }).join('');
}
function updateProg(idx){
  currentRecipe.steps.forEach(function(_, i){
    var el = document.getElementById('ps' + i);
    if(!el) return;
    el.className = 'pseg' + (i < idx ? ' done' : i === idx ? ' cur' : '');
  });
}

/* ══════════════════════════════════════════════
   WAKE LOCK
══════════════════════════════════════════════ */
var wakeLock = null;
function acquireWakeLock(){
  if('wakeLock' in navigator){
    navigator.wakeLock.request('screen')
      .then(function(wl){ wakeLock = wl; })
      .catch(function(){});
  }
}
function releaseWakeLock(){
  if(wakeLock){ wakeLock.release().catch(function(){}); wakeLock = null; }
}

/* ══════════════════════════════════════════════
   COUNTDOWN
══════════════════════════════════════════════ */
function startCountdown(){
  cdActive = true;
  cdCount = 5;
  var ov = document.getElementById('cd-overlay');
  var numEl = document.getElementById('cd-num');
  numEl.textContent = String(cdCount);
  ov.classList.add('show');

  cdInterval = setInterval(function(){
    cdCount--;
    if(cdCount <= 0){
      clearInterval(cdInterval); cdInterval = null;
      numEl.textContent = 'GO';
      setTimeout(function(){
        ov.classList.remove('show');
        cdActive = false;
        beginBrew();
      }, 600);
    } else {
      numEl.textContent = String(cdCount);
    }
  }, 1000);
}

function cancelCountdown(){
  if(cdInterval){ clearInterval(cdInterval); cdInterval = null; }
  cdActive = false;
  document.getElementById('cd-overlay').classList.remove('show');
  stopBrewClean();
  showScreen('detail');
}

/* ══════════════════════════════════════════════
   BREW ENGINE
══════════════════════════════════════════════ */
function startBrew(){
  // Reset state
  brewActive = false;
  brewPaused = false;
  brewStart  = 0;
  pausedAt   = 0;
  totalPaused = 0;
  stepIdx    = 0;
  stepStartMs = 0;
  finTimeMs  = 0;
  dispGrams  = 0;
  if(rafId){ cancelAnimationFrame(rafId); rafId = null; }

  // Reset UI
  document.getElementById('act-rname').textContent = currentRecipe.meta.title.toUpperCase();
  document.getElementById('act-timer').textContent = '0:00.0';
  document.getElementById('act-tip').textContent = '—';
  document.getElementById('act-stepcnt').textContent = '';
  document.getElementById('scale-cur-g').textContent = '0.0';
  document.getElementById('scale-target-g').textContent = '—';
  document.getElementById('scale-bar-inner').style.width = '0%';
  document.getElementById('act-pause-btn').textContent = t('pause');
  document.getElementById('paused-ov').classList.remove('show');
  document.getElementById('cd-overlay').classList.remove('show');

  buildProg();
  drawIdle();
  acquireWakeLock();
  showScreen('active');

  // Start countdown
  startCountdown();
}

function beginBrew(){
  brewActive = true;
  brewPaused = false;
  brewStart = Date.now();
  totalPaused = 0;
  stepIdx = 0;
  stepStartMs = 0;
  rafId = requestAnimationFrame(tick);
}

function tick(){
  if(!brewActive || brewPaused){ return; }

  var now = Date.now();
  var elapsed = now - brewStart - totalPaused;
  // Clamp to positive
  if(elapsed < 0) elapsed = 0;

  // Update timer display
  document.getElementById('act-timer').textContent = fmtT(elapsed);

  var r = currentRecipe;
  // Advance steps
  while(stepIdx < r.steps.length){
    var sElapsedMs = elapsed - stepStartMs;
    var sElapsedSec = sElapsedMs / 1000;
    if(sElapsedSec >= r.steps[stepIdx].duration){
      stepIdx++;
      if(stepIdx >= r.steps.length){
        // Done!
        finTimeMs = elapsed;
        finishBrew();
        return;
      }
      stepStartMs = elapsed - (sElapsedMs - r.steps[stepIdx-1].duration * 1000);
      // Recompute step start precisely
      stepStartMs = elapsed - (elapsed - stepStartMs - r.steps[stepIdx-1].duration * 1000);
      // Simpler: mark start as now (corrected)
      stepStartMs = elapsed - Math.max(0, sElapsedMs - r.steps[stepIdx-1].duration * 1000);
    } else {
      break;
    }
  }

  if(stepIdx >= r.steps.length){ finTimeMs = elapsed; finishBrew(); return; }

  var step = r.steps[stepIdx];
  var sElapsedMs2 = elapsed - stepStartMs;
  var sElapsedSec2 = Math.max(0, sElapsedMs2 / 1000);
  var rawProg = Math.min(sElapsedSec2 / step.duration, 1);
  var circProg = step.type === 'pour' ? rawProg : (1 - rawProg);
  drawCircle(step.type, circProg);

  // Compute & smooth grams
  var targetG = computeGrams(r, userBeans, stepIdx, sElapsedSec2);
  dispGrams += (targetG - dispGrams) * 0.18;
  if(Math.abs(dispGrams - targetG) < 0.05) dispGrams = targetG;
  var cumulTgt = cumulTargetAtStep(r, stepIdx, userBeans);
  updateScaleDisplay(dispGrams, cumulTgt > 0 ? cumulTgt : null);

  // Tip & step counter
  var tip = lang === 'ja' ? step.tip_ja : step.tip;
  var typeLbl = step.type === 'pour' ? t('step_pour') : t('step_wait');
  document.getElementById('act-tip').textContent = tip.toUpperCase();
  document.getElementById('act-stepcnt').textContent =
    t('step_lbl') + ' ' + (stepIdx+1) + ' ' + t('of_lbl') + ' ' + r.steps.length +
    ' \u00B7 ' + typeLbl + ' ' + step.duration + 's';
  updateProg(stepIdx);

  rafId = requestAnimationFrame(tick);
}

function pauseBrew(){
  if(!brewActive || brewPaused || cdActive) return;
  brewPaused = true;
  pausedAt = Date.now();
  if(rafId){ cancelAnimationFrame(rafId); rafId = null; }
  document.getElementById('paused-ov').classList.add('show');
  document.getElementById('act-pause-btn').textContent = t('resume');
}

function resumeBrew(){
  if(!brewActive || !brewPaused) return;
  var pausedDuration = Date.now() - pausedAt;
  totalPaused += pausedDuration;
  brewPaused = false;
  document.getElementById('paused-ov').classList.remove('show');
  document.getElementById('act-pause-btn').textContent = t('pause');
  rafId = requestAnimationFrame(tick);
}

function stopBrewClean(){
  brewActive = false;
  brewPaused = false;
  if(rafId){ cancelAnimationFrame(rafId); rafId = null; }
  if(cdInterval){ clearInterval(cdInterval); cdInterval = null; }
  cdActive = false;
  releaseWakeLock();
  document.getElementById('paused-ov').classList.remove('show');
  document.getElementById('cd-overlay').classList.remove('show');
}

function stopBrew(){
  stopBrewClean();
  showScreen('detail');
}

function finishBrew(){
  stopBrewClean();
  document.getElementById('fin-title').textContent = currentRecipe.meta.title;
  document.getElementById('fin-by').textContent = currentRecipe.meta.creator;
  document.getElementById('fin-time').textContent = fmtT(finTimeMs);
  showScreen('finish');
}

/* ══════════════════════════════════════════════
   LOAD & RENDER HOME
══════════════════════════════════════════════ */
function loadRecipes(){
  var p = new URLSearchParams();
  if(filters.taste)       p.set('taste',  filters.taste);
  if(filters.brewer)      p.set('brewer', filters.brewer);
  if(filters.hot !== '')  p.set('hot',    filters.hot);
  if(filters.roast)       p.set('roast',  filters.roast);
  p.set('sort', sortMode === 'pop' ? 'likes' : 'new');
  fetch('/api/recipes?' + p)
    .then(function(r){ return r.json(); })
    .then(function(data){
      var faved = data.filter(function(r){ return favs.has(r.id); });
      var rest  = data.filter(function(r){ return !favs.has(r.id); });
      var list  = faved.concat(rest);
      document.getElementById('r-count').textContent = String(list.length);
      renderList(list);
    })
    .catch(function(e){ console.error('loadRecipes error', e); });
}

function renderList(list){
  var el = document.getElementById('rlist');
  if(!list.length){
    el.innerHTML = '<div class="empty">NO RECIPES FOUND</div>';
    return;
  }
  el.innerHTML = list.map(function(r){
    var f = favs.has(r.id);
    return '<div class="ritem' + (f ? ' faved' : '') + '" data-id="' + r.id + '">'
      + '<div>'
        + '<div class="r-name">' + r.meta.title + '</div>'
        + '<div class="r-creator">' + r.meta.creator + '</div>'
        + '<div class="r-meta">'
          + '<span class="badge badge-brewer">' + r.meta.brewer + '</span>'
          + (r.meta.hot
              ? '<span class="badge badge-hot">HOT</span>'
              : '<span class="badge badge-ice">ICE</span>')
          + '<div class="tags">'
            + r.meta.tags.map(function(tag){ return '<span class="tag">' + tag + '</span>'; }).join('')
          + '</div>'
        + '</div>'
        + roastDots(r.meta.roast)
      + '</div>'
      + '<div class="r-right">'
        + '<button class="fav-btn' + (f ? ' on' : '') + '" data-fid="' + r.id + '">'
            + (f ? t('saved') : t('save'))
          + '</button>'
        + '<div class="r-likes">' + r.meta.likes.toLocaleString() + '</div>'
        + '<div class="r-arrow">&gt;</div>'
      + '</div>'
    + '</div>';
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
      if(favs.has(id)) favs.delete(id); else favs.add(id);
      saveFavs();
      loadRecipes();
    });
  });
}

/* ══════════════════════════════════════════════
   DETAIL
══════════════════════════════════════════════ */
function openDetail(id){
  fetch('/api/recipes/' + id)
    .then(function(r){ return r.json(); })
    .then(function(data){
      currentRecipe = data;
      userBeans = data.base.beans;
      mill = 'cmd';
      renderDetail();
      updateFavBtn();
      showScreen('detail');
    })
    .catch(function(e){ console.error('openDetail error', e); });
}

function updateFavBtn(){
  var btn = document.getElementById('d-fav');
  if(!btn || !currentRecipe) return;
  var f = favs.has(currentRecipe.id);
  btn.textContent = f ? t('saved') : t('save');
  btn.className = 'fav-btn' + (f ? ' on' : '');
}

function renderDetail(){
  var r = currentRecipe;
  var sw = scaledWater(r, userBeans);
  var desc = lang === 'ja' ? r.meta.desc_ja : r.meta.desc;
  var beansNote = lang === 'ja' ? r.meta.beans_note_ja : r.meta.beans_note;
  var gl = lang === 'ja' ? r.meta.grind.label_ja : r.meta.grind.label;
  var tot = r.steps.reduce(function(a,s){ return a + s.duration; }, 0);
  var tm = Math.floor(tot/60), ts = tot % 60;

  var mills = [{k:'cmd',l:'CMD'},{k:'tm',l:'TIMEM'},{k:'zp',l:'ZPRS'},{k:'va',l:'VARIA'}];
  var tabsHtml = '<div class="mill-tabs">'
    + mills.map(function(mi){
        return '<button class="mtab' + (mill===mi.k ? ' on' : '') + '" data-m="' + mi.k + '">' + mi.l + '</button>';
      }).join('')
    + '</div>';
  var gv = fmtMillVal(getMillVal(r.meta.grind));

  var stepsHtml = r.steps.map(function(step, i){
    var tgt = stepTargetG(r, i, userBeans);
    var tip = lang === 'ja' ? step.tip_ja : step.tip;
    var typeLbl = step.type === 'pour' ? t('step_pour') : t('step_wait');
    return '<li class="step-row">'
      + '<div class="step-n">' + pad2(i+1) + '</div>'
      + '<div class="step-info">'
        + '<div class="step-type ' + step.type + '">' + typeLbl + '</div>'
        + '<div class="step-tip">' + tip + '</div>'
        + (tgt !== null
            ? '<div class="step-tgt" id="st' + i + '">&sim;' + tgt.toFixed(1) + 'g ' + t('cumul') + '</div>'
            : '')
      + '</div>'
      + '<div class="step-dur">' + step.duration + 's</div>'
    + '</li>';
  }).join('');

  var linkLabels = [t('link_sns'), t('link_shop')];
  var linksHtml = r.meta.links.map(function(url, i){
    var disp = url.split('://').slice(1).join('://').substring(0, 30) || url.substring(0, 30);
    return '<a href="' + url + '" target="_blank" rel="noopener" class="lrow">'
      + '<span class="lrow-k">' + linkLabels[i] + '</span>'
      + '<span class="lrow-v">' + disp + ' &gt;</span>'
    + '</a>';
  }).join('');

  document.getElementById('d-content').innerHTML =
    '<div class="d-hero">'
      + '<div class="d-title">' + r.meta.title + '</div>'
      + '<div class="d-creator">' + r.meta.creator + '</div>'
      + '<div class="d-tagrow">'
        + r.meta.tags.map(function(tag){ return '<span class="d-tag">' + tag.toUpperCase() + '</span>'; }).join('')
        + (r.meta.hot ? '<span class="d-tag">HOT</span>' : '<span class="d-tag">ICE</span>')
      + '</div>'
      + '<div class="d-desc">' + desc + '</div>'
    + '</div>'
    + '<div class="sec" id="sec_beans"><div class="sec-lbl">' + t('sec_beans') + '</div>'
      + '<div class="beans-note" id="beans-note">' + beansNote + '</div>'
    + '</div>'
    + '<div class="sec"><div class="sec-lbl">' + t('sec_amount') + '</div>'
      + '<div class="scale-row">'
        + '<div class="scale-wrap">'
          + '<div class="scale-unit">g</div>'
          + '<input class="scale-inp" id="beans-inp" type="number" min="5" max="100" step="1" value="' + userBeans + '">'
        + '</div>'
        + '<div class="scale-adj">'
          + '<button class="scale-btn" id="b-minus">&#8722;</button>'
          + '<button class="scale-btn" id="b-plus">+</button>'
        + '</div>'
      + '</div>'
      + '<div class="water-line">' + t('water_lbl') + ': <b id="w-val">' + sw.toFixed(1) + '</b> ml'
        + '&nbsp;&nbsp;' + t('ratio_lbl') + ': <b id="r-val">1:' + (sw/userBeans).toFixed(1) + '</b>'
      + '</div>'
    + '</div>'
    + '<div class="grind-sec" id="grind-sec"><div class="sec-lbl">' + t('sec_grind') + '</div>'
      + tabsHtml
      + '<div class="grind-num" id="g-num">' + gv + '</div>'
      + '<div class="grind-sub" id="g-sub">' + t('grind_unit') + ' \u2014 ' + gl + '</div>'
      + '<div class="grind-note" id="g-note">' + t(millNoteKey()) + '</div>'
    + '</div>'
    + '<div class="sec"><div class="sec-lbl">' + t('sec_specs') + '</div>'
      + '<div class="spec-grid">'
        + '<div class="sc"><div class="sc-k">' + t('spec_temp') + '</div><div class="sc-v">' + r.base.temp + '<span style="font-size:13px">&deg;C</span></div></div>'
        + '<div class="sc"><div class="sc-k">' + t('spec_brewer') + '</div><div class="sc-vs">' + r.meta.brewer + '</div></div>'
        + '<div class="sc"><div class="sc-k">' + t('spec_grind') + '</div><div class="sc-vs">' + gl + '</div></div>'
        + '<div class="sc"><div class="sc-k">' + t('spec_time') + '</div><div class="sc-v">' + tm + ':' + pad2(ts) + '</div></div>'
      + '</div>'
    + '</div>'
    + '<div class="sec"><div class="sec-lbl">' + t('sec_steps') + '</div>'
      + '<ul class="step-list">' + stepsHtml + '</ul>'
    + '</div>'
    + '<div class="lsec"><div class="sec-lbl">' + t('sec_links') + '</div>' + linksHtml + '</div>'
    + '<div style="padding:16px"><div class="ad-slot">[ ADVERTISEMENT ]</div></div>'
    + '<div style="height:80px"></div>';

  // Mill tab events
  document.querySelectorAll('.mtab').forEach(function(tab){
    tab.addEventListener('click', function(){
      mill = tab.dataset.m;
      document.querySelectorAll('.mtab').forEach(function(x){ x.classList.remove('on'); });
      tab.classList.add('on');
      var g = currentRecipe.meta.grind;
      var gl2 = lang === 'ja' ? g.label_ja : g.label;
      document.getElementById('g-num').textContent = fmtMillVal(getMillVal(g));
      document.getElementById('g-sub').textContent = t('grind_unit') + ' \u2014 ' + gl2;
      document.getElementById('g-note').textContent = t(millNoteKey());
    });
  });

  // Bean amount controls
  var inp = document.getElementById('beans-inp');
  document.getElementById('b-minus').addEventListener('click', function(){
    userBeans = Math.max(5, userBeans - 1);
    inp.value = String(userBeans);
    updateScale();
  });
  document.getElementById('b-plus').addEventListener('click', function(){
    userBeans = Math.min(100, userBeans + 1);
    inp.value = String(userBeans);
    updateScale();
  });
  inp.addEventListener('input', function(){
    var v = parseInt(inp.value, 10);
    if(!isNaN(v) && v >= 5 && v <= 100){ userBeans = v; updateScale(); }
  });
}

function updateScale(){
  var r = currentRecipe;
  var sw = scaledWater(r, userBeans);
  var wEl = document.getElementById('w-val');
  var rEl = document.getElementById('r-val');
  if(wEl) wEl.textContent = sw.toFixed(1);
  if(rEl) rEl.textContent = '1:' + (sw/userBeans).toFixed(1);
  r.steps.forEach(function(step, i){
    var el = document.getElementById('st' + i);
    if(el && step.target_ratio != null){
      el.textContent = '~' + stepTargetG(r, i, userBeans).toFixed(1) + 'g ' + t('cumul');
    }
  });
}

/* ══════════════════════════════════════════════
   EVENT BINDINGS
══════════════════════════════════════════════ */
// Language toggle
document.getElementById('lang-btn').addEventListener('click', function(){
  lang = (lang === 'en') ? 'ja' : 'en';
  try { localStorage.setItem('brew_lang', lang); } catch(e){}
  applyI18n();
  if(currentRecipe && document.getElementById('screen-detail').classList.contains('visible')){
    renderDetail();
    updateFavBtn();
  }
  loadRecipes();
});

// Taste filter
document.getElementById('f-taste').addEventListener('click', function(e){
  var b = e.target.closest('.fchip'); if(!b) return;
  document.querySelectorAll('#f-taste .fchip').forEach(function(x){ x.classList.remove('on'); });
  b.classList.add('on'); filters.taste = b.dataset.v; loadRecipes();
});
// Brewer filter
document.getElementById('f-brewer').addEventListener('click', function(e){
  var b = e.target.closest('.fchip'); if(!b) return;
  document.querySelectorAll('#f-brewer .fchip').forEach(function(x){ x.classList.remove('on'); });
  b.classList.add('on'); filters.brewer = b.dataset.v; loadRecipes();
});
// HOT/ICE filter (separate row)
document.getElementById('f-hot').addEventListener('click', function(e){
  var b = e.target.closest('.fchip'); if(!b) return;
  document.querySelectorAll('#f-hot .fchip').forEach(function(x){ x.classList.remove('on'); });
  b.classList.add('on'); filters.hot = b.dataset.v; loadRecipes();
});
// Roast filter
document.getElementById('f-roast').addEventListener('click', function(e){
  var b = e.target.closest('.fchip'); if(!b) return;
  document.querySelectorAll('#f-roast .fchip').forEach(function(x){ x.classList.remove('on'); });
  b.classList.add('on'); filters.roast = b.dataset.v; loadRecipes();
});

// Sort
document.getElementById('s-new').addEventListener('click', function(){
  sortMode = 'new';
  document.getElementById('s-new').classList.add('on');
  document.getElementById('s-pop').classList.remove('on');
  loadRecipes();
});
document.getElementById('s-pop').addEventListener('click', function(){
  sortMode = 'pop';
  document.getElementById('s-pop').classList.add('on');
  document.getElementById('s-new').classList.remove('on');
  loadRecipes();
});

// Detail back
document.getElementById('d-back').addEventListener('click', function(){
  showScreen('home');
  loadRecipes();
});
// Detail fav
document.getElementById('d-fav').addEventListener('click', function(){
  if(!currentRecipe) return;
  if(favs.has(currentRecipe.id)) favs.delete(currentRecipe.id);
  else favs.add(currentRecipe.id);
  saveFavs();
  updateFavBtn();
});
// Start button
document.getElementById('start-btn').addEventListener('click', function(){
  if(!currentRecipe) return;
  startBrew();
});

// Canvas tap → pause/resume (guard: countdown or not started)
document.getElementById('act-canvas-wrap').addEventListener('click', function(e){
  if(e.target.closest('#cd-overlay') || e.target.closest('#paused-ov')) return;
  if(cdActive || !brewActive) return;
  if(brewPaused) resumeBrew(); else pauseBrew();
});
// PAUSE button
document.getElementById('act-pause-btn').addEventListener('click', function(){
  if(cdActive || !brewActive) return;
  if(brewPaused) resumeBrew(); else pauseBrew();
});
// Paused overlay buttons
document.getElementById('paused-resume').addEventListener('click', resumeBrew);
document.getElementById('paused-stop').addEventListener('click', stopBrew);
// Countdown cancel
document.getElementById('cd-cancel').addEventListener('click', cancelCountdown);

// Finish buttons
document.getElementById('fin-recipe-btn').addEventListener('click', function(){
  renderDetail();
  showScreen('detail');
});
document.getElementById('fin-home-btn').addEventListener('click', function(){
  showScreen('home');
  loadRecipes();
});

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
initCanvas();
applyI18n();
loadRecipes();

// PWA Service Worker
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js').catch(function(){});
}

})();
</script>
</body>
</html>`
