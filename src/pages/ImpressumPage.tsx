import { SiteLayout } from '../components/SiteLayout'

export function ImpressumPage() {
  return (
    <SiteLayout>
      <main className="content-wrap legal-page">
        <h1>Impressum</h1>
        <section className="admin-block">
          <h2>Angaben gemaess § 5 TMG</h2>
          <p>Lazo Automobile GmbH</p>
          <p>Musterstrasse 42</p>
          <p>10115 Berlin</p>
          <p>Deutschland</p>
        </section>

        <section className="admin-block">
          <h2>Kontakt</h2>
          <p>Telefon: +49 (0) 123 456789</p>
          <p>E-Mail: info@lazo-automobile.de</p>
        </section>

        <section className="admin-block">
          <h2>Vertretungsberechtigte Personen</h2>
          <p>Max Mustermann, Geschaeftsfuehrer</p>
        </section>

        <section className="admin-block">
          <h2>Registereintrag</h2>
          <p>Registergericht: Amtsgericht Berlin (Charlottenburg)</p>
          <p>Registernummer: HRB 123456 B</p>
        </section>

        <section className="admin-block">
          <h2>Umsatzsteuer-ID</h2>
          <p>USt-IdNr. gemaess § 27 a UStG: DE123456789</p>
        </section>

        <section className="admin-block">
          <h2>Haftung fuer Inhalte</h2>
          <p>
            Trotz sorgfaeltiger inhaltlicher Kontrolle uebernehmen wir keine Haftung fuer die
            Inhalte externer Links. Fuer den Inhalt der verlinkten Seiten sind ausschliesslich deren
            Betreiber verantwortlich.
          </p>
        </section>
      </main>
    </SiteLayout>
  )
}
