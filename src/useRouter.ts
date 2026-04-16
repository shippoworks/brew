import { useState, useEffect, useCallback } from 'react'

export interface RouterState {
  pathname: string
  navigate: (path: string) => void
  replace: (path: string) => void
}

export function useRouter(): RouterState {
  const [pathname, setPathname] = useState(() => window.location.pathname)

  useEffect(() => {
    function onPop() {
      setPathname(window.location.pathname)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((path: string) => {
    history.pushState(null, '', path)
    setPathname(path)
  }, [])

  const replace = useCallback((path: string) => {
    history.replaceState(null, '', path)
    setPathname(path)
  }, [])

  return { pathname, navigate, replace }
}
