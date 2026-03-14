import { SiteLayout } from '../components/SiteLayout'

export function HomePage() {
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
              <a className="primary-button" href="/bestand">
                Bestand ansehen
              </a>
              <a className="ghost-button" href="/kontakt">
                Kontakt aufnehmen
              </a>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
