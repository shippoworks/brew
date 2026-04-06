import { useState } from 'react'
import { Recipe } from '../data/recipes'
import { Lang, useT } from '../i18n'

interface Props {
  recipe: Recipe
  lang: Lang
  onBack: () => void
  onStart: (beans: number) => void
}

type Mill = 'cmd' | 'tm' | 'zp' | 'va'

function scaledWater(r: Recipe, beans: number) {
  return Math.round((beans / r.base.beans) * r.base.water * 10) / 10
}

function stepTargetG(r: Recipe, i: number, beans: number) {
  const step = r.steps[i]
  if (step.target_ratio == null) return null
  return Math.round(step.target_ratio * scaledWater(r, beans) * 10) / 10
}

const MILL_KEYS: Mill[] = ['cmd', 'tm', 'zp', 'va']
const MILL_LABELS = ['Comandante', 'Timemore', 'Zpresso', 'Varia']
const NOTE_KEYS = { cmd: 'note_cmd', tm: 'note_tm', zp: 'note_zp', va: 'note_va' } as const

export default function DetailScreen({ recipe: r, lang, onBack, onStart }: Props) {
  const t = useT(lang)
  const [beans, setBeans] = useState(r.base.beans)
  const [mill, setMill] = useState<Mill>('cmd')

  const water = scaledWater(r, beans)
  const ratio = water > 0 ? (water / beans).toFixed(1) : '—'

  function getMillVal() {
    const g = r.meta.grind
    if (mill === 'cmd') return mill === 'zp' ? g.zpresso.toFixed(1) : String(g.comandante)
    if (mill === 'tm') return String(g.timemore)
    if (mill === 'zp') return g.zpresso.toFixed(1)
    return String(g.varia)
  }

  return (
    <div className="screen-detail">
      <div className="hdr">
        <button className="hdr-back" onClick={onBack}>{t('d_back')}</button>
        <span className="hdr-title">{t('d_hdr')}</span>
        <div style={{ width: 48 }} />
      </div>

      <div className="d-content">
        {/* Hero */}
        <div className="d-hero">
          <div className="d-title">{r.meta.title}</div>
          <div className="d-creator">{r.meta.creator}</div>
          <div className="d-tagrow">
            <span className={`badge ${r.meta.hot ? 'badge-hot' : 'badge-ice'} d-tag`}>
              {r.meta.hot ? t('hot') : t('ice')}
            </span>
            <span className="badge badge-brewer d-tag">{r.meta.brewer}</span>
            {r.meta.tags.map(tg => <span key={tg} className="d-tag">#{tg}</span>)}
          </div>
          <div className="d-desc">{lang === 'ja' ? r.meta.desc_ja : r.meta.desc}</div>
        </div>

        {/* Recommended beans */}
        <div className="sec">
          <div className="sec-lbl">{t('sec_beans')}</div>
          <div className="beans-note">{lang === 'ja' ? r.meta.beans_note_ja : r.meta.beans_note}</div>
        </div>

        {/* Bean amount */}
        <div className="sec">
          <div className="sec-lbl">{t('sec_amount')}</div>
          <div className="scale-row">
            <div className="scale-wrap">
              <div className="scale-unit">g</div>
              <input
                className="scale-inp"
                type="number"
                value={beans}
                min={1}
                max={100}
                onChange={e => setBeans(Math.max(1, Math.min(100, Number(e.target.value))))}
                style={{ textAlign: 'center' }}
              />
              <div className="scale-adj">
                <button className="scale-btn" onClick={() => setBeans(b => Math.max(1, b - 1))}>−</button>
                <button className="scale-btn" onClick={() => setBeans(b => Math.min(100, b + 1))}>＋</button>
              </div>
            </div>
          </div>
          <div className="water-line">
            {t('water_lbl')} <b>{water}g</b>　{t('ratio_lbl')} <b>1:{ratio}</b>
          </div>
        </div>

        {/* Grind size */}
        <div className="grind-sec">
          <div className="sec-lbl">{t('sec_grind')}</div>
          <div className="mill-tabs">
            {MILL_KEYS.map((k, i) => (
              <button key={k} className={`mtab${mill === k ? ' on' : ''}`} onClick={() => setMill(k)}>
                {MILL_LABELS[i]}
              </button>
            ))}
          </div>
          <div className="grind-num">{getMillVal()}</div>
          <div className="grind-sub">
            {mill !== 'zp' ? t('grind_unit') : 'turns'} · {lang === 'ja' ? r.meta.grind.label_ja : r.meta.grind.label}
          </div>
          <div className="grind-note">{t(NOTE_KEYS[mill])}</div>
        </div>

        {/* Specs */}
        <div className="sec">
          <div className="sec-lbl">{t('sec_specs')}</div>
          <div className="spec-grid">
            <div className="sc">
              <div className="sc-k">{t('spec_temp')}</div>
              <div className="sc-v">{r.meta.temp}<span className="sc-vs">°C</span></div>
            </div>
            <div className="sc">
              <div className="sc-k">{t('spec_brewer')}</div>
              <div className="sc-v sc-vs">{r.meta.brewer}</div>
            </div>
            <div className="sc">
              <div className="sc-k">{t('spec_grind')}</div>
              <div className="sc-v sc-vs">{lang === 'ja' ? r.meta.grind.label_ja : r.meta.grind.label}</div>
            </div>
            <div className="sc">
              <div className="sc-k">{t('spec_time')}</div>
              <div className="sc-v">{Math.floor(r.meta.estimatedTime / 60)}<span className="sc-vs">m {r.meta.estimatedTime % 60}s</span></div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="sec">
          <div className="sec-lbl">{t('sec_steps')}</div>
          <ul className="step-list">
            {r.steps.map((step, i) => {
              const tgt = stepTargetG(r, i, beans)
              const instruction = step.type === 'pour'
                ? lang === 'ja'
                  ? tgt != null
                    ? `${step.duration}秒で ${tgt.toFixed(1)}g まで注ぐ`
                    : `${step.duration}秒間注ぐ`
                  : tgt != null
                    ? `Pour to ${tgt.toFixed(1)}g over ${step.duration}s`
                    : `Pour for ${step.duration}s`
                : lang === 'ja'
                  ? `${step.duration}秒待つ`
                  : `Wait ${step.duration}s`
              return (
                <li key={i} className="step-row">
                  <div className="step-n">{i + 1}</div>
                  <div className="step-info">
                    <div className="step-instruction">{instruction}</div>
                    <div className="step-tip">{lang === 'ja' ? step.tip_ja : step.tip}</div>
                  </div>
                  <div className="step-dur">{step.duration}s</div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Links */}
        <div className="lsec">
          <div className="sec-lbl">{t('sec_links')}</div>
          <div className="lrow">
            <span className="lrow-k">{t('link_sns')}</span>
            <span className="lrow-v">
              <a href={r.meta.links[0]} target="_blank" rel="noopener noreferrer">↗ Link</a>
            </span>
          </div>
          <div className="lrow">
            <span className="lrow-k">{t('link_shop')}</span>
            <span className="lrow-v">
              <a href={r.meta.links[1]} target="_blank" rel="noopener noreferrer">↗ Link</a>
            </span>
          </div>
        </div>
      </div>

      <div className="start-wrap">
        <button className="start-btn" onClick={() => onStart(beans)}>{t('start')}</button>
      </div>
    </div>
  )
}
