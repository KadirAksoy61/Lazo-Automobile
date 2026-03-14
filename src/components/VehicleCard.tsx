import { Link } from 'react-router-dom'
import { currency, number } from '../lib/formatters'
import type { Vehicle } from '../types/vehicle'

export function VehicleCard({
  vehicle,
  isWishlisted,
  isCompared,
  onToggleWishlist,
  onToggleCompare,
}: {
  vehicle: Vehicle
  isWishlisted?: boolean
  isCompared?: boolean
  onToggleWishlist?: (vehicleId: string) => void
  onToggleCompare?: (vehicleId: string) => void
}) {
  const image = vehicle.imageUrls[0]
  const statusLabel =
    vehicle.status === 'reserved'
      ? 'Reserviert'
      : vehicle.status === 'sold'
        ? 'Verkauft'
        : null

  return (
    <article className="vehicle-card">
      <Link to={`/fahrzeuge/${vehicle.slug}`}>
        <img src={image} alt={`${vehicle.brand} ${vehicle.model}`} loading="lazy" />
      </Link>
      <div className="vehicle-body">
        <div className="vehicle-topline">
          <p>{vehicle.brand}</p>
          <p>{currency.format(vehicle.priceEur)}</p>
        </div>
        <h3>
          <Link to={`/fahrzeuge/${vehicle.slug}`}>{vehicle.model}</Link>
        </h3>
        <div className="vehicle-specs">
          <span>{vehicle.year}</span>
          <span>{number.format(vehicle.mileageKm)} km</span>
          <span>{vehicle.powerPs} PS</span>
        </div>
        {statusLabel && (
          <p className={vehicle.status === 'reserved' ? 'status-badge reserved' : 'status-badge sold'}>
            {statusLabel}
          </p>
        )}
        {(onToggleWishlist || onToggleCompare) && (
          <div className="vehicle-actions">
            {onToggleWishlist && (
              <button
                type="button"
                className={isWishlisted ? 'chip-button active' : 'chip-button'}
                onClick={() => onToggleWishlist(vehicle.id)}
              >
                {isWishlisted ? 'In Wunschliste' : 'Zur Wunschliste'}
              </button>
            )}
            {onToggleCompare && (
              <button
                type="button"
                className={isCompared ? 'chip-button active' : 'chip-button'}
                onClick={() => onToggleCompare(vehicle.id)}
              >
                {isCompared ? 'Im Vergleich' : 'Vergleichen'}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
