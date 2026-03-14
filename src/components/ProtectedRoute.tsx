import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectTo = '/admin/login',
}: {
  children: ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}) {
  const { session, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <main className="content-wrap status-page">
        <h1>Lade Adminbereich...</h1>
      </main>
    )
  }

  if (!session) {
    return <Navigate to={redirectTo} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
