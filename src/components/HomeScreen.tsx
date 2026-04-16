import { useState, useMemo, useEffect } from 'react'
import { recipes, Recipe } from '../data/recipes'
import { Lang, useT } from '../i18n'
import { trackEvent } from '../analytics'

interface Props {
  lang: Lang
  onToggleLang: () => void
  onSelectRecipe: (recipe: Recipe) => void
  onPrivacy: () => void
}

const BREWERS = ['V60', 'Clever', 'Kalita', 'Aeropress']
const ROASTS = [1, 2, 3, 4, 5]
const TASTES = ['balanced', 'sweet', 'clean', 'bright', 'fruity', 'bold', 'body', 'floral']

export default function HomeScreen({ lang, onToggleLang, onSelectRecipe, onPrivacy }: Props) {
  const t = useT(lang)
  const [favs, setFavs] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('brew_favs') || '[]')) } catch { return new Set() }
  })
  const [saveCounts, setSaveCounts] = useState<Record<string, number>>({})
  const [sort, setSort] = useState<'new' | 'likes' | 'saved'>('new')
  const [brewer, setBrewer] = useState('')
  const [hot, setHot] = useState('')
  const [roast, setRoast] = useState('')
  const [taste, setTaste] = useState('')

  useEffect(() => {
    fetch('/api/saves')
      .then(r => r.json())
      .then((data: { counts: Record<string, number> }) => setSaveCounts(data.counts))
      .catch(() => { /* use fallback meta.likes */ })
  }, [])

  function toggleFav(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setFavs(prev => {
      const next = new Set(prev)
      const adding = !next.has(id)
      adding ? next.add(id) : next.delete(id)
      try { localStorage.setItem('brew_favs', JSON.stringify([...next])) } catch { /* ignore */ }

      // Update DB count
      trackEvent(adding ? 'recipe_save' : 'recipe_unsave', { recipe_id: id })

      fetch(`/api/saves/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: adding ? 'increment' : 'decrement' }),
      })
        .then(r => r.json())
        .then((data: { count: number }) => {
          setSaveCounts(prev => ({ ...prev, [id]: data.count }))
        })
        .catch(() => { /* ignore */ })

      return next
    })
  }

  const getCount = (id: string, fallback: number) =>
    saveCounts[id] !== undefined ? saveCounts[id] : fallback

  const filtered = useMemo(() => {
    let list = [...recipes]
    if (taste) list = list.filter(r => r.meta.tags.includes(taste))
    if (brewer) list = list.filter(r => r.meta.brewer === brewer)
    if (hot === 'true') list = list.filter(r => r.meta.hot)
    if (hot === 'false') list = list.filter(r => !r.meta.hot)
    if (roast) list = list.filter(r => r.meta.roast === parseInt(roast))
    if (sort === 'saved') {
      list = list.filter(r => favs.has(r.id))
      list.sort((a, b) => b.meta.createdAt.localeCompare(a.meta.createdAt))
    } else if (sort === 'likes') {
      list.sort((a, b) => getCount(b.id, b.meta.likes) - getCount(a.id, a.meta.likes))
    } else {
      list.sort((a, b) => b.meta.createdAt.localeCompare(a.meta.createdAt))
    }
    return list
  }, [taste, brewer, hot, roast, sort, favs, saveCounts])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: 'var(--w)', margin: '0 auto' }}>
      <div className="home-hdr">
        <div>
          <div className="home-logo">BREW PROTOCOL</div>
          <div className="home-sub">{t('sub')}</div>
        </div>
        <button className="lang-btn" onClick={onToggleLang}>{t('lang_btn')}</button>
      </div>

      {/* Brewer filter */}
      <div className="frow">
        <div className="frow-inner">
          <button className={`fchip${brewer === '' ? ' on' : ''}`} onClick={() => setBrewer('')}>{t('all_brewers')}</button>
          {BREWERS.map(b => (
            <button key={b} className={`fchip${brewer === b ? ' on' : ''}`} onClick={() => { setBrewer(b); trackEvent('filter_use', { filter_type: 'brewer', value: b }) }}>{b}</button>
          ))}
        </div>
      </div>

      {/* Hot/Ice filter */}
      <div className="frow">
        <div className="frow-inner">
          <button className={`fchip${hot === '' ? ' on' : ''}`} onClick={() => setHot('')}>{t('all_temp')}</button>
          <button className={`fchip${hot === 'true' ? ' on' : ''}`} onClick={() => setHot('true')}>{t('hot')}</button>
          <button className={`fchip${hot === 'false' ? ' on' : ''}`} onClick={() => setHot('false')}>{t('ice')}</button>
        </div>
      </div>

      {/* Roast filter */}
      <div className="frow">
        <div className="frow-inner">
          <button className={`fchip${roast === '' ? ' on' : ''}`} onClick={() => setRoast('')}>{t('all_roasts')}</button>
          {ROASTS.map(r => (
            <button key={r} className={`fchip${roast === String(r) ? ' on' : ''}`} onClick={() => setRoast(String(r))}>
              {'●'.repeat(r) + '○'.repeat(5 - r)}
            </button>
          ))}
        </div>
      </div>

      {/* Taste filter */}
      <div className="frow">
        <div className="frow-inner">
          <button className={`fchip${taste === '' ? ' on' : ''}`} onClick={() => setTaste('')}>{t('all_tastes')}</button>
          {TASTES.map(tg => (
            <button key={tg} className={`fchip${taste === tg ? ' on' : ''}`} onClick={() => { setTaste(tg); trackEvent('filter_use', { filter_type: 'taste', value: tg }) }}>#{tg}</button>
          ))}
        </div>
      </div>

      {/* Sort bar */}
      <div className="sort-bar">
        <button className={`sort-btn${sort === 'new' ? ' on' : ''}`} onClick={() => setSort('new')}>{t('sort_new')}</button>
        <button className={`sort-btn${sort === 'likes' ? ' on' : ''}`} onClick={() => setSort('likes')}>{t('sort_pop')}</button>
        <button className={`sort-btn${sort === 'saved' ? ' on' : ''}`} onClick={() => setSort('saved')}>{t('sort_saved')}</button>
        <div className="rcount">{filtered.length} {t('count_lbl')}</div>
      </div>

      {/* Recipe list */}
      <div className="rlist" style={{ paddingBottom: '48px' }}>
        {filtered.length === 0 && (
          <div className="empty">
            {sort === 'saved' ? t('no_saved') : 'NO RECIPES FOUND'}
          </div>
        )}
        {filtered.map(r => (
          <div
            key={r.id}
            className={`ritem${favs.has(r.id) ? ' faved' : ''}`}
            onClick={() => onSelectRecipe(r)}
          >
            <div>
              <div className="r-name">{lang === 'ja' ? r.meta.title_ja : r.meta.title}</div>
              {r.meta.creator && <div className="r-creator">{r.meta.creator}</div>}
              <div className="r-meta">
                <span className="badge badge-brewer">{r.meta.brewer}</span>
                <span className={`badge ${r.meta.hot ? 'badge-hot' : 'badge-ice'}`}>
                  {r.meta.hot ? t('hot') : t('ice')}
                </span>
                <div className="tags">
                  {r.meta.tags.map(tg => <span key={tg} className="tag">{tg}</span>)}
                </div>
              </div>
              <div className="roast-row">
                {[1,2,3,4,5].map(i => <div key={i} className={`rdot${i <= r.meta.roast ? ' on' : ''}`} />)}
              </div>
            </div>
            <div className="r-right">
              <button
                className={`fav-btn${favs.has(r.id) ? ' on' : ''}`}
                onClick={e => toggleFav(e, r.id)}
              >
                {favs.has(r.id) ? t('saved') : t('save')}
              </button>
              <div className="r-likes">{getCount(r.id, r.meta.likes)}</div>
              <div className="r-arrow">›</div>
            </div>
          </div>
        ))}
      </div>
      <div className="home-footer">
        <button className="privacy-link" onClick={onPrivacy}>
          {lang === 'ja' ? 'プライバシーポリシー' : 'Privacy Policy'}
        </button>
      </div>
    </div>
  )
}
