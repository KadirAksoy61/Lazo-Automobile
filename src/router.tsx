import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import {
  AdminDashboardPage,
  AdminLoginPage,
  CustomerLoginPage,
  CustomerRegisterPage,
  DatenschutzPage,
  HomePage,
  ImpressumPage,
  NotFoundPage,
  VehicleDetailPage,
  WishlistPage,
} from './pages'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
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
