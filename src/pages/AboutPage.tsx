import { SiteLayout } from '../components/SiteLayout'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export function AboutPage() {
  useDocumentTitle('Über uns')
  return (
    <SiteLayout>
      <main>
        <section className="about-section">
          <div className="content-wrap">
            <p className="eyebrow">Über uns</p>
            <h1 className="section-title">Passion trifft Präzision.</h1>
            <p className="section-copy narrow">
              Seit über 15 Jahren steht Lazo Automobile für exklusive Fahrzeuge und erstklassigen Service.
            </p>
            <div className="about-grid">
              <div className="about-image" aria-hidden="true"></div>
              <div className="about-text">
                <blockquote>Qualität ist kein Zufall, sondern das Ergebnis höchster Präzision.</blockquote>
                <p>
                  Jedes Fahrzeug in unserem Bestand durchläuft einen strengen 150-Punkte-Check, bevor es den Showroom
                  erreicht.
                </p>
                <p>
                  Unsere Expertise verbindet Technik, Transparenz und ein Beratungserlebnis auf Augenhöhe.
                </p>
              </div>
            </div>
            <div className="stats-row">
              <article>
                <h3>150+</h3>
                <p>Checkpunkte</p>
              </article>
              <article>
                <h3>15+</h3>
                <p>Jahre Erfahrung</p>
              </article>
              <article>
                <h3>500+</h3>
                <p>Zufriedene Kunden</p>
              </article>
              <article>
                <h3>100%</h3>
                <p>Geprüfte Qualität</p>
              </article>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
