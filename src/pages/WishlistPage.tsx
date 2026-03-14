import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { SiteLayout } from '../components/SiteLayout'
import { VehicleCard } from '../components/VehicleCard'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import {
  listVehiclesByIds,
  listWishlistVehicleIds,
  removeVehicleFromWishlist,
} from '../lib/vehicleRepository'
import type { Vehicle } from '../types/vehicle'

export function WishlistPage() {
  useDocumentTitle('Wunschliste')
  const { user, loading } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    void listWishlistVehicleIds(user.id)
      .then(async (vehicleIds) => {
        setWishlistIds(vehicleIds)

        const wishlistVehicles = await listVehiclesByIds(vehicleIds)
        setVehicles(wishlistVehicles)
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Wunschliste konnte nicht geladen werden.'
        setMessage(errorMessage)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [user])

  const hasVehicles = vehicles.length > 0

  if (!loading && !user) {
    return <Navigate to="/konto/login" replace />
  }

  async function handleRemove(vehicleId: string) {
    if (!user) {
      return
    }

    setMessage('')

    try {
      await removeVehicleFromWishlist(user.id, vehicleId)
      setWishlistIds((current) => current.filter((id) => id !== vehicleId))
      setVehicles((current) => current.filter((vehicle) => vehicle.id !== vehicleId))
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Fahrzeug konnte nicht aus Wunschliste entfernt werden.'
      setMessage(errorMessage)
    }
  }

  return (
    <SiteLayout>
      <main className="content-wrap admin-page">
        <h1>Meine Wunschliste</h1>
        <p className="section-copy">Hier sehen Sie alle gemerkten Fahrzeuge.</p>

        {isLoading ? (
          <p className="status-inline">Wunschliste wird geladen...</p>
        ) : hasVehicles ? (
          <div className="inventory-grid">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id}>
                <VehicleCard vehicle={vehicle} />
                <button
                  type="button"
                  className="dark-button"
                  onClick={() => void handleRemove(vehicle.id)}
                >
                  Entfernen
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="status-inline">Noch keine Fahrzeuge auf Ihrer Wunschliste.</p>
        )}

        {message && <p className="error-message">{message}</p>}

        {wishlistIds.length > 0 && (
          <p className="status-inline">Gespeicherte Fahrzeuge: {wishlistIds.length}</p>
        )}
      </main>
    </SiteLayout>
  )
}
