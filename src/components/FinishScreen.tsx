import { Recipe } from '../data/recipes'
import { Lang, useT } from '../i18n'

interface Props {
  recipe: Recipe
  elapsedMs: number
  lang: Lang
  onGoHome: () => void
  onGoRecipe: () => void
}

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function FinishScreen({ recipe: r, elapsedMs, lang, onGoHome, onGoRecipe }: Props) {
  const t = useT(lang)

  return (
    <div className="screen-finish">
      <div className="hdr">
        <div />
        <span className="hdr-title">{t('fin_hdr')}</span>
        <div />
      </div>
      <div className="fin-body">
        <div className="fin-check">{t('fin_check')}</div>
        <div className="fin-title">{r.meta.title}</div>
        <div className="fin-by">{r.meta.creator}</div>
        <div className="fin-time-box">
          <div className="fin-time-lbl">{t('fin_time_lbl')}</div>
          <div className="fin-time-val">{fmtTime(elapsedMs)}</div>
        </div>
        <div className="fin-actions">
          <button className="fin-btn" onClick={onGoRecipe}>{t('fin_recipe')}</button>
          <button className="fin-btn primary" onClick={onGoHome}>{t('fin_home')}</button>
        </div>
      </div>
    </div>
  )
}
