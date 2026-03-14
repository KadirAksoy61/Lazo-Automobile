import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import {
  AdminDashboardPage,
  AdminLoginPage,
  AboutPage,
  CustomerLoginPage,
  CustomerRegisterPage,
  DatenschutzPage,
  HomePage,
  ImpressumPage,
  InventoryPage,
  NotFoundPage,
  VehicleDetailPage,
  WishlistPage,
  ContactPage,
} from './pages'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/bestand',
    element: <InventoryPage />,
  },
  {
    path: '/ueber-uns',
    element: <AboutPage />,
  },
  {
    path: '/kontakt',
    element: <ContactPage />,
  },
  {
    path: '/fahrzeuge/:slug',
    element: <VehicleDetailPage />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/konto/login',
    element: <CustomerLoginPage />,
  },
  {
    path: '/konto/registrieren',
    element: <CustomerRegisterPage />,
  },
  {
    path: '/konto/wunschliste',
    element: (
      <ProtectedRoute redirectTo="/konto/login">
        <WishlistPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/impressum',
    element: <ImpressumPage />,
  },
  {
    path: '/datenschutz',
    element: <DatenschutzPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
