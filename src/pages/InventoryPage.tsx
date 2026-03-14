import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SiteLayout } from '../components/SiteLayout'
import { VehicleCard } from '../components/VehicleCard'
import { useAuth } from '../context/AuthContext'
import {
  addVehicleToWishlist,
  listVehicleBrands,
  listVehicles,
  listWishlistVehicleIds,
  removeVehicleFromWishlist,
} from '../lib/vehicleRepository'
import type { Vehicle } from '../types/vehicle'

const currency = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const number = new Intl.NumberFormat('de-DE')
const MAX_COMPARE = 3
const COMPARE_STORAGE_KEY = 'compareVehicleIds'

export function InventoryPage() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [brands, setBrands] = useState<string[]>(['Alle'])
  const [activeBrand, setActiveBrand] = useState('Alle')
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [contactMessage, setContactMessage] = useState('')
  const [compareMessage, setCompareMessage] = useState('')
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    try {
      const raw = globalThis.localStorage.getItem(COMPARE_STORAGE_KEY)
      if (!raw) {
        return []
      }
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    void listVehicleBrands().then((nextBrands) => {
      setBrands(nextBrands)
    })
  }, [])

  useEffect(() => {
    setIsLoading(true)
    void listVehicles({ brand: activeBrand, query })
      .then((nextVehicles) => {
        setVehicles(nextVehicles)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [activeBrand, query])

  useEffect(() => {
    if (!user) {
      setWishlistIds([])
      return
    }

    void listWishlistVehicleIds(user.id).then((ids) => {
      setWishlistIds(ids)
    })
  }, [user])

  useEffect(() => {
    globalThis.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareIds))
  }, [compareIds])

  useEffect(() => {
    setCompareIds((current) => current.filter((id) => vehicles.some((vehicle) => vehicle.id === id)))
  }, [vehicles])

  const hasVehicles = useMemo(() => vehicles.length > 0, [vehicles])
  const compareVehicles = useMemo(
    () => compareIds
      .map((id) => vehicles.find((vehicle) => vehicle.id === id))
      .filter((vehicle): vehicle is Vehicle => Boolean(vehicle)),
    [compareIds, vehicles],
  )

  const compareRows = [
    { label: 'Preis', value: (vehicle: Vehicle) => currency.format(vehicle.priceEur) },
    { label: 'Baujahr', value: (vehicle: Vehicle) => String(vehicle.year) },
    { label: 'Kilometerstand', value: (vehicle: Vehicle) => `${number.format(vehicle.mileageKm)} km` },
    { label: 'Leistung', value: (vehicle: Vehicle) => `${vehicle.powerPs} PS` },
    { label: 'Kraftstoff', value: (vehicle: Vehicle) => vehicle.fuelType },
    { label: 'Getriebe', value: (vehicle: Vehicle) => vehicle.transmission },
    { label: 'Antrieb', value: (vehicle: Vehicle) => vehicle.drivetrain },
    { label: 'Karosserie', value: (vehicle: Vehicle) => vehicle.bodyType },
    { label: 'Farbe', value: (vehicle: Vehicle) => vehicle.color },
    { label: 'Erstzulassung', value: (vehicle: Vehicle) => vehicle.firstRegistration },
  ]

  async function handleToggleWishlist(vehicleId: string) {
    if (!user) {
      setContactMessage('Bitte zuerst einloggen, um die Wunschliste zu nutzen.')
      return
    }

    const isWishlisted = wishlistIds.includes(vehicleId)

    if (isWishlisted) {
      await removeVehicleFromWishlist(user.id, vehicleId)
      setWishlistIds((current) => current.filter((id) => id !== vehicleId))
      return
    }

    await addVehicleToWishlist(user.id, vehicleId)
    setWishlistIds((current) => [...current, vehicleId])
  }

  function handleToggleCompare(vehicleId: string) {
    setCompareMessage('')

    setCompareIds((current) => {
      if (current.includes(vehicleId)) {
        return current.filter((id) => id !== vehicleId)
      }

      if (current.length >= MAX_COMPARE) {
        setCompareMessage(`Sie können maximal ${MAX_COMPARE} Fahrzeuge vergleichen.`)
        return current
      }

      return [...current, vehicleId]
    })
  }

  function handleClearCompare() {
    setCompareIds([])
    setCompareMessage('')
  }

  function jumpToCompareTable() {
    const section = globalThis.document.getElementById('vergleichstabelle')
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <SiteLayout>
      <main className="inventory-page">
        <section className="inventory-section">
          <div className="content-wrap">
            <p className="eyebrow">Bestand</p>
            <h1 className="section-title">Unser aktueller Bestand</h1>
            <p className="section-copy">
              Finden Sie Ihr Traumfahrzeug. Filtern Sie nach Marke oder suchen Sie gezielt nach Modell.
            </p>

            <div className="inventory-toolbar">
              <label className="search-field" htmlFor="search-model">
                <span aria-hidden="true">Search</span>
                <input
                  id="search-model"
                  type="text"
                  placeholder="Modell suchen (z.B. M4, 911...)"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <div className="brand-filters" role="tablist" aria-label="Marken">
                {brands.map((brand) => {
                  const isActive = activeBrand === brand
                  const filterClassName = isActive ? 'filter-chip active' : 'filter-chip'

                  return (
                    <button
                      key={brand}
                      className={filterClassName}
                      onClick={() => setActiveBrand(brand)}
                    >
                      {brand}
                    </button>
                  )
                })}
              </div>
            </div>

            {isLoading && <p className="status-inline">Fahrzeuge werden geladen...</p>}

            {!isLoading && hasVehicles && (
              <>
                <div className="inventory-grid">
                  {vehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      isWishlisted={wishlistIds.includes(vehicle.id)}
                      isCompared={compareIds.includes(vehicle.id)}
                      onToggleWishlist={(vehicleId) => {
                        void handleToggleWishlist(vehicleId)
                      }}
                      onToggleCompare={handleToggleCompare}
                    />
                  ))}
                </div>

                {compareVehicles.length > 0 && (
                  <section className="compare-panel" aria-label="Vergleichsauswahl">
                    <div className="compare-panel-head">
                      <h3>Vergleich</h3>
                      <p>
                        {compareVehicles.length} von {MAX_COMPARE} ausgewählt
                      </p>
                    </div>
                    <ul className="compare-selected-list">
                      {compareVehicles.map((vehicle) => (
                        <li key={vehicle.id}>
                          <span>{vehicle.brand} {vehicle.model}</span>
                          <button
                            type="button"
                            className="chip-button"
                            onClick={() => handleToggleCompare(vehicle.id)}
                          >
                            Entfernen
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="compare-panel-actions">
                      <button
                        type="button"
                        className="dark-button"
                        onClick={jumpToCompareTable}
                        disabled={compareVehicles.length < 2}
                      >
                        Vergleich anzeigen
                      </button>
                      <button type="button" className="ghost-button" onClick={handleClearCompare}>
                        Alle entfernen
                      </button>
                    </div>
                  </section>
                )}

                {compareVehicles.length > 0 && (
                  <section id="vergleichstabelle" className="compare-table-wrap" aria-label="Fahrzeugvergleich">
                    <h2 className="section-title">Fahrzeuge vergleichen</h2>
                    {compareVehicles.length < 2 ? (
                      <p className="status-inline">Wählen Sie mindestens 2 Fahrzeuge für den direkten Vergleich.</p>
                    ) : (
                      <div className="compare-table-scroll">
                        <table className="compare-table">
                          <thead>
                            <tr>
                              <th>Merkmal</th>
                              {compareVehicles.map((vehicle) => (
                                <th key={vehicle.id}>
                                  <div className="compare-head-card">
                                    <p>{vehicle.brand} {vehicle.model}</p>
                                    <Link className="inline-link" to={`/fahrzeuge/${vehicle.slug}`}>
                                      Details öffnen
                                    </Link>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {compareRows.map((row) => (
                              <tr key={row.label}>
                                <th>{row.label}</th>
                                {compareVehicles.map((vehicle) => (
                                  <td key={`${vehicle.id}-${row.label}`}>{row.value(vehicle)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                )}
              </>
            )}

            {!isLoading && !hasVehicles && (
              <p className="empty-state">Keine Fahrzeuge gefunden. Probieren Sie eine andere Suche.</p>
            )}

            {contactMessage && <p className="status-inline">{contactMessage}</p>}
            {compareMessage && <p className="status-inline">{compareMessage}</p>}
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
