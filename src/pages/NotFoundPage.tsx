import { Link } from 'react-router-dom'
import { SiteLayout } from '../components/SiteLayout'

export function NotFoundPage() {
  return (
    <SiteLayout>
      <main className="content-wrap status-page">
        <h1>Seite nicht gefunden</h1>
        <p className="section-copy">Diese Seite existiert nicht oder wurde verschoben.</p>
        <Link className="primary-button" to="/">
          Zur Startseite
        </Link>
      </main>
    </SiteLayout>
  )
}
