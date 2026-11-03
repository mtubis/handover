import { useEffect } from 'react'

/**
 * Asks the browser to confirm leaving or reloading the page while `active`, so a stray refresh
 * doesn't throw away a recording. Browsers show their own generic text, and mobile browsers often
 * skip the prompt entirely, so this is a safety net, not a guarantee.
 */
export function useWarnBeforeUnload(active: boolean): void {
  useEffect(() => {
    if (!active) return
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      // Older Chrome and Safari only show the prompt when returnValue is set.
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [active])
}
