import { useState } from 'react'
import { Recipe } from './data/recipes'
import { Lang } from './i18n'
import { trackEvent } from './analytics'
import HomeScreen from './components/HomeScreen'
import DetailScreen from './components/DetailScreen'
import ActiveScreen from './components/ActiveScreen'
import FinishScreen from './components/FinishScreen'
import PrivacyScreen from './components/PrivacyScreen'

type Screen = 'home' | 'detail' | 'active' | 'finish' | 'privacy'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [lang, setLang] = useState<Lang>(() => {
    try { return (localStorage.getItem('brew_lang') as Lang) || 'en' } catch { return 'en' }
  })
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [beans, setBeans] = useState(20)
  const [finishedMs, setFinishedMs] = useState(0)

  function toggleLang() {
    const next: Lang = lang === 'en' ? 'ja' : 'en'
    setLang(next)
    try { localStorage.setItem('brew_lang', next) } catch { /* ignore */ }
  }

  function handleSelectRecipe(recipe: Recipe) {
    setSelectedRecipe(recipe)
    setScreen('detail')
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
          onBack={() => setScreen('home')}
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
          onGoHome={() => setScreen('home')}
          onGoRecipe={() => setScreen('detail')}
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
