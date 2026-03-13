import * as React from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(false)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setIsHydrated(true)
    const mql = window.matchMedia(query)
    
    const onChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }
    
    mql.addEventListener("change", onChange)
    setMatches(mql.matches)
    
    return () => mql.removeEventListener("change", onChange)
  }, [query])

  return isHydrated ? matches : false
}
