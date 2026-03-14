import { SiteLayout } from '../components/SiteLayout'

export function DatenschutzPage() {
  return (
    <SiteLayout>
      <main className="content-wrap legal-page">
        <h1>Datenschutzerklaerung</h1>

        <section className="admin-block">
          <h2>1. Verantwortlicher</h2>
          <p>Lazo Automobile GmbH, Musterstrasse 42, 10115 Berlin</p>
          <p>E-Mail: info@lazo-automobile.de</p>
        </section>

        <section className="admin-block">
          <h2>2. Verarbeitete Daten</h2>
          <p>
            Wir verarbeiten Daten, die Sie uns ueber Kontakt- und Fahrzeuganfrageformulare zur
            Verfuegung stellen (Name, E-Mail, Telefon, Nachricht) sowie Kontodaten im Rahmen der
            Registrierung.
          </p>
        </section>

        <section className="admin-block">
          <h2>3. Zwecke und Rechtsgrundlagen</h2>
          <p>
            Die Verarbeitung erfolgt zur Bearbeitung Ihrer Anfrage, zur Bereitstellung Ihres
            Nutzerkontos und zur Verbesserung unseres Angebots. Rechtsgrundlagen sind Art. 6 Abs. 1
            lit. b DSGVO (Vertrag/Vertragsanbahnung) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
            Interesse).
          </p>
        </section>

        <section className="admin-block">
          <h2>4. Speicherfristen</h2>
          <p>
            Wir speichern personenbezogene Daten nur so lange, wie dies fuer den jeweiligen Zweck
            erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.
          </p>
        </section>

        <section className="admin-block">
          <h2>5. Empfaenger</h2>
          <p>
            Wir nutzen Supabase als technischen Dienstleister fuer Datenbank und Authentifizierung.
            Eine Verarbeitung erfolgt entsprechend der geltenden Datenschutzstandards.
          </p>
        </section>

        <section className="admin-block">
          <h2>6. Cookies und Tracking</h2>
          <p>
            Wir setzen derzeit nur technisch notwendige Speichermechanismen ein (z. B.
            Login-Session, Cookie-Praeferenzen). Optionales Tracking wird erst nach ausdruecklicher
            Einwilligung aktiviert.
          </p>
        </section>

        <section className="admin-block">
          <h2>7. Ihre Rechte</h2>
          <p>
            Sie haben das Recht auf Auskunft, Berichtigung, Loeschung, Einschraenkung,
            Datenuebertragbarkeit und Widerspruch. Zudem besteht ein Beschwerderecht bei einer
            Datenschutzaufsichtsbehoerde.
          </p>
        </section>
      </main>
    </SiteLayout>
  )
}
