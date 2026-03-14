import type { ReactNode } from 'react'
import { CookieBanner } from './CookieBanner'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

interface SiteLayoutProps {
  children: ReactNode
}

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="site-shell">
      <SiteHeader />
      {children}
      <SiteFooter />
      <CookieBanner />
    </div>
  )
}
