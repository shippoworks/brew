import { useState, useEffect } from 'react'
import { recipes, Recipe } from './data/recipes'
import { Lang } from './i18n'
import { trackEvent } from './analytics'
import { useRouter } from './useRouter'
import HomeScreen from './components/HomeScreen'
import DetailScreen from './components/DetailScreen'
import ActiveScreen from './components/ActiveScreen'
import FinishScreen from './components/FinishScreen'
import PrivacyScreen from './components/PrivacyScreen'

type Screen = 'home' | 'detail' | 'active' | 'finish' | 'privacy'

function recipeIdFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/recipe\/([^/]+)$/)
  return m ? m[1] : null
}

export default function App() {
  const { pathname, navigate, replace } = useRouter()
  const [screen, setScreen] = useState<Screen>('home')
  const [lang, setLang] = useState<Lang>(() => {
    try { return (localStorage.getItem('brew_lang') as Lang) || 'en' } catch { return 'en' }
  })
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [beans, setBeans] = useState(20)
  const [finishedMs, setFinishedMs] = useState(0)

  // Deep link: /recipe/:id on first load
  useEffect(() => {
    const id = recipeIdFromPath(pathname)
    if (id) {
      const found = recipes.find(r => r.id === id)
      if (found) {
        setSelectedRecipe(found)
        setScreen('detail')
      } else {
        replace('/')
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Browser back/forward sync
  useEffect(() => {
    const id = recipeIdFromPath(pathname)
    if (id) {
      if (screen === 'active' || screen === 'finish') return // protect active brew
      const found = recipes.find(r => r.id === id)
      if (found) {
        setSelectedRecipe(found)
        setScreen('detail')
      }
    } else if (pathname === '/') {
      if (screen === 'detail') setScreen('home')
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleLang() {
    const next: Lang = lang === 'en' ? 'ja' : 'en'
    setLang(next)
    try { localStorage.setItem('brew_lang', next) } catch { /* ignore */ }
  }

  function handleSelectRecipe(recipe: Recipe) {
    setSelectedRecipe(recipe)
    setScreen('detail')
    navigate('/recipe/' + recipe.id)
    trackEvent('recipe_view', { recipe_id: recipe.id, recipe_title: recipe.meta.title, brewer: recipe.meta.brewer })
  }

  function handleStartBrew(beanAmount: number) {
    setBeans(beanAmount)
    setScreen('active')
    if (selectedRecipe) {
      trackEvent('brew_start', { recipe_id: selectedRecipe.id, recipe_title: selectedRecipe.meta.title, brewer: selectedRecipe.meta.brewer, beans: beanAmount })
    }
  }

  function handleFinish(elapsedMs: number) {
    setFinishedMs(elapsedMs)
    setScreen('finish')
    if (selectedRecipe) {
      trackEvent('brew_complete', { recipe_id: selectedRecipe.id, recipe_title: selectedRecipe.meta.title, elapsed_sec: Math.round(elapsedMs / 1000) })
    }
  }

  return (
    <div className="app">
      {screen === 'home' && (
        <HomeScreen
          lang={lang}
          onToggleLang={toggleLang}
          onSelectRecipe={handleSelectRecipe}
          onPrivacy={() => setScreen('privacy')}
        />
      )}
      {screen === 'detail' && selectedRecipe && (
        <DetailScreen
          recipe={selectedRecipe}
          lang={lang}
          onBack={() => { setScreen('home'); navigate('/') }}
          onStart={handleStartBrew}
        />
      )}
      {screen === 'active' && selectedRecipe && (
        <ActiveScreen
          recipe={selectedRecipe}
          beans={beans}
          lang={lang}
          onFinish={handleFinish}
          onBack={() => setScreen('detail')}
        />
      )}
      {screen === 'finish' && selectedRecipe && (
        <FinishScreen
          recipe={selectedRecipe}
          elapsedMs={finishedMs}
          lang={lang}
          onGoHome={() => { setScreen('home'); navigate('/') }}
          onGoRecipe={() => { setScreen('detail'); navigate('/recipe/' + selectedRecipe.id) }}
        />
      )}
      {screen === 'privacy' && (
        <PrivacyScreen
          lang={lang}
          onBack={() => setScreen('home')}
        />
      )}
    </div>
  )
}
