import { Link } from 'react-router-dom'
import { SiteLayout } from '../components/SiteLayout'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export function HomePage() {
  useDocumentTitle()
  return (
    <SiteLayout>
      <main className="home-main">
        <section className="hero-section" id="top">
          <div className="hero-content">
            <p className="eyebrow">Established Precision</p>
            <h1>Lazo Automobile</h1>
            <p className="hero-copy">
              Exklusive Performance-Fahrzeuge, kuratiert für Fahrerinnen und Fahrer mit Anspruch.
            </p>
            <div className="hero-actions">
              <Link className="primary-button" to="/bestand">
                Bestand ansehen
              </Link>
              <Link className="ghost-button" to="/kontakt">
                Kontakt aufnehmen
              </Link>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
