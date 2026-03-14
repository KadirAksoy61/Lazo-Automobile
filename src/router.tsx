import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/HomePage'

const InventoryPage = lazy(() => import('./pages/InventoryPage').then((m) => ({ default: m.InventoryPage })))
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })))
const VehicleDetailPage = lazy(() => import('./pages/VehicleDetailPage').then((m) => ({ default: m.VehicleDetailPage })))
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })))
const CustomerLoginPage = lazy(() => import('./pages/CustomerLoginPage').then((m) => ({ default: m.CustomerLoginPage })))
const CustomerRegisterPage = lazy(() => import('./pages/CustomerRegisterPage').then((m) => ({ default: m.CustomerRegisterPage })))
const WishlistPage = lazy(() => import('./pages/WishlistPage').then((m) => ({ default: m.WishlistPage })))
const ImpressumPage = lazy(() => import('./pages/ImpressumPage').then((m) => ({ default: m.ImpressumPage })))
const DatenschutzPage = lazy(() => import('./pages/DatenschutzPage').then((m) => ({ default: m.DatenschutzPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/bestand',
    element: <LazyPage><InventoryPage /></LazyPage>,
  },
  {
    path: '/ueber-uns',
    element: <LazyPage><AboutPage /></LazyPage>,
  },
  {
    path: '/kontakt',
    element: <LazyPage><ContactPage /></LazyPage>,
  },
  {
    path: '/fahrzeuge/:slug',
    element: <LazyPage><VehicleDetailPage /></LazyPage>,
  },
  {
    path: '/admin/login',
    element: <LazyPage><AdminLoginPage /></LazyPage>,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin>
        <LazyPage><AdminDashboardPage /></LazyPage>
      </ProtectedRoute>
    ),
  },
  {
    path: '/konto/login',
    element: <LazyPage><CustomerLoginPage /></LazyPage>,
  },
  {
    path: '/konto/registrieren',
    element: <LazyPage><CustomerRegisterPage /></LazyPage>,
  },
  {
    path: '/konto/wunschliste',
    element: (
      <ProtectedRoute redirectTo="/konto/login">
        <LazyPage><WishlistPage /></LazyPage>
      </ProtectedRoute>
    ),
  },
  {
    path: '/impressum',
    element: <LazyPage><ImpressumPage /></LazyPage>,
  },
  {
    path: '/datenschutz',
    element: <LazyPage><DatenschutzPage /></LazyPage>,
  },
  {
    path: '*',
    element: <LazyPage><NotFoundPage /></LazyPage>,
  },
])
