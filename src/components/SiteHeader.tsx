import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function SiteHeader() {
  const { session, signOut } = useAuth()

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="brand-mark" to="/">
          Lazo Automobile
        </Link>
        <nav className="nav-links" aria-label="Hauptnavigation">
          <Link to="/bestand">Bestand</Link>
          <Link to="/ueber-uns">Über uns</Link>
          <Link to="/kontakt">Kontakt</Link>
          {session ? (
            <>
              <Link to="/konto/wunschliste">Wunschliste</Link>
              <button type="button" className="header-button" onClick={() => void signOut()}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/konto/login">Login</Link>
              <Link to="/konto/registrieren">Registrieren</Link>
            </>
          )}
          <Link className="admin-link" to="/admin">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}
