import { FormEvent, useEffect, useMemo, useState } from 'react'
import { VehicleCard } from '../components/VehicleCard'
import { useAuth } from '../context/AuthContext'
import {
  addVehicleToWishlist,
  listVehicleBrands,
  listVehicles,
  listWishlistVehicleIds,
  removeVehicleFromWishlist,
  submitInquiry,
} from '../lib/vehicleRepository'
import type { Vehicle } from '../types/vehicle'
import { SiteLayout } from '../components/SiteLayout'

export function HomePage() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [brands, setBrands] = useState<string[]>(['Alle'])
  const [activeBrand, setActiveBrand] = useState('Alle')
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [contactMessage, setContactMessage] = useState('')

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

  const hasVehicles = useMemo(() => vehicles.length > 0, [vehicles])
  const comparedVehicles = useMemo(
    () => vehicles.filter((vehicle) => compareIds.includes(vehicle.id)),
    [vehicles, compareIds],
  )

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
    setCompareIds((current) => {
      if (current.includes(vehicleId)) {
        return current.filter((id) => id !== vehicleId)
      }

      if (current.length >= 3) {
        return [...current.slice(1), vehicleId]
      }

      return [...current, vehicleId]
    })
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    setContactSubmitting(true)
    setContactMessage('')

    try {
      await submitInquiry({
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        phone: String(formData.get('phone') ?? ''),
        message: String(formData.get('message') ?? ''),
      })
      setContactMessage('Vielen Dank. Ihre Nachricht wurde gesendet.')
      form.reset()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Anfrage konnte nicht gesendet werden.'
      setContactMessage(message)
    } finally {
      setContactSubmitting(false)
    }
  }

  return (
    <SiteLayout>
      <main>
        <section className="hero-section" id="top">
          <div className="content-wrap hero-content">
            <p className="eyebrow">Established Precision</p>
            <h1>Lazo Automobile</h1>
            <p className="hero-copy">
              Exklusive Performance-Fahrzeuge, kuratiert fur Fahrerinnen und Fahrer mit
              Anspruch.
            </p>
            <a className="primary-button" href="#bestand">
              Bestand ansehen
            </a>
          </div>
        </section>

        <section className="inventory-section" id="bestand">
          <div className="content-wrap">
            <h2 className="section-title">Unser Bestand</h2>
            <p className="section-copy">
              Finden Sie Ihr Traumfahrzeug. Filtern Sie nach Marke oder suchen Sie gezielt
              nach Modell.
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
            )}

            {!isLoading && !hasVehicles && (
              <p className="empty-state">Keine Fahrzeuge gefunden. Probieren Sie eine andere Suche.</p>
            )}

            {comparedVehicles.length >= 2 && (
              <section className="compare-panel">
                <h3>Fahrzeugvergleich</h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Fahrzeug</th>
                        <th>Preis</th>
                        <th>Kilometer</th>
                        <th>Leistung</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparedVehicles.map((vehicle) => (
                        <tr key={vehicle.id}>
                          <td>
                            {vehicle.brand} {vehicle.model}
                          </td>
                          <td>{vehicle.priceEur.toLocaleString('de-DE')} EUR</td>
                          <td>{vehicle.mileageKm.toLocaleString('de-DE')} km</td>
                          <td>{vehicle.powerPs} PS</td>
                          <td>{vehicle.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="content-wrap">
            <p className="eyebrow">Über uns</p>
            <h2 className="section-title">Passion trifft Prazision.</h2>
            <p className="section-copy narrow">
              Seit uber 15 Jahren steht Lazo Automobile fur exklusive Fahrzeuge und
              erstklassigen Service.
            </p>
            <div className="about-grid">
              <div className="about-image" aria-hidden="true"></div>
              <div className="about-text">
                <blockquote>
                  Qualitat ist kein Zufall, sondern das Ergebnis hochster Prazision.
                </blockquote>
                <p>
                  Jedes Fahrzeug in unserem Bestand durchlauft einen strengen 150-Punkte-Check,
                  bevor es den Showroom erreicht.
                </p>
                <p>
                  Unsere Expertise verbindet Technik, Transparenz und ein Beratungserlebnis auf
                  Augenhohe.
                </p>
              </div>
            </div>
            <div className="stats-row">
              <article>
                <h3>150+</h3>
                <p>Checkpunkte</p>
              </article>
              <article>
                <h3>15+</h3>
                <p>Jahre Erfahrung</p>
              </article>
              <article>
                <h3>500+</h3>
                <p>Zufriedene Kunden</p>
              </article>
              <article>
                <h3>100%</h3>
                <p>Geprufte Qualitat</p>
              </article>
            </div>
          </div>
        </section>

        <section className="contact-section" id="kontakt">
          <div className="content-wrap contact-grid">
            <div>
              <h2 className="contact-title">Let&apos;s talk performance.</h2>
              <p className="section-copy contact-copy">
                Haben Sie Interesse an einem Fahrzeug oder eine allgemeine Anfrage? Wir freuen
                uns auf Ihre Nachricht.
              </p>
              <ul className="contact-details">
                <li>+49 (0) 123 456789</li>
                <li>info@lazo-automobile.de</li>
                <li>Musterstrasse 42, 10115 Berlin</li>
              </ul>
            </div>
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <label htmlFor="contact-name">Name</label>
              <input id="contact-name" name="name" type="text" placeholder="Ihr Name" required />

              <label htmlFor="contact-mail">Email</label>
              <input
                id="contact-mail"
                name="email"
                type="email"
                placeholder="name@email.de"
                required
              />

              <label htmlFor="contact-phone">Telefon</label>
              <input id="contact-phone" name="phone" type="text" placeholder="+49 ..." />

              <label htmlFor="contact-message">Ihre Anfrage</label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                placeholder="Wunschmodell, Budget oder Nachricht"
                required
              ></textarea>

              <button type="submit" className="dark-button" disabled={contactSubmitting}>
                {contactSubmitting ? 'Sende...' : 'Anfrage senden'}
              </button>
              {contactMessage && <p className="status-inline">{contactMessage}</p>}
            </form>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
