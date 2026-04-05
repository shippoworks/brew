import { useState } from 'react'
import { Recipe } from './data/recipes'
import { Lang } from './i18n'
import HomeScreen from './components/HomeScreen'
import DetailScreen from './components/DetailScreen'
import ActiveScreen from './components/ActiveScreen'
import FinishScreen from './components/FinishScreen'

type Screen = 'home' | 'detail' | 'active' | 'finish'

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
  }

  function handleStartBrew(beanAmount: number) {
    setBeans(beanAmount)
    setScreen('active')
  }

  function handleFinish(elapsedMs: number) {
    setFinishedMs(elapsedMs)
    setScreen('finish')
  }

  return (
    <div className="app">
      {screen === 'home' && (
        <HomeScreen
          lang={lang}
          onToggleLang={toggleLang}
          onSelectRecipe={handleSelectRecipe}
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
    </div>
  )
}
