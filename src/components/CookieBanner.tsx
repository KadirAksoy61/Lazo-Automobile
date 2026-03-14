import { useEffect, useState } from 'react'

const COOKIE_PREFS_KEY = 'lazo-cookie-consent-v1'

type CookieChoice = 'accepted' | 'essential-only'

export function CookieBanner() {
  const [choice, setChoice] = useState<CookieChoice | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_PREFS_KEY)
    if (stored === 'accepted' || stored === 'essential-only') {
      setChoice(stored)
    }
  }, [])

  function saveChoice(nextChoice: CookieChoice) {
    localStorage.setItem(COOKIE_PREFS_KEY, nextChoice)
    setChoice(nextChoice)
  }

  if (choice) {
    return null
  }

  return (
    <aside className="cookie-banner" role="dialog" aria-label="Cookie-Hinweis">
      <p>
        Wir nutzen technisch notwendige Cookies fuer Login und Sicherheit. Optionales Tracking ist
        standardmaessig deaktiviert und wird nur mit Ihrer Einwilligung aktiviert.
      </p>
      <div className="cookie-actions">
        <button type="button" className="chip-button" onClick={() => saveChoice('essential-only')}>
          Nur notwendige
        </button>
        <button type="button" className="dark-button" onClick={() => saveChoice('accepted')}>
          Alle akzeptieren
        </button>
      </div>
    </aside>
  )
}
