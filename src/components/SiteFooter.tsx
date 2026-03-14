import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>© 2026 Lazo Automobile - Excellence in Motion</p>
      <div className="footer-links">
        <Link to="/impressum">Impressum</Link>
        <Link to="/datenschutz">Datenschutz</Link>
      </div>
    </footer>
  )
}
