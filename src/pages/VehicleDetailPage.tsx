import { FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SiteLayout } from '../components/SiteLayout'
import { useAuth } from '../context/AuthContext'
import {
  addVehicleToWishlist,
  getVehicleBySlug,
  listWishlistVehicleIds,
  removeVehicleFromWishlist,
  submitInquiry,
} from '../lib/vehicleRepository'
import type { Vehicle } from '../types/vehicle'

const currency = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const number = new Intl.NumberFormat('de-DE')

export function VehicleDetailPage() {
  const { user } = useAuth()
  const { slug } = useParams()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    if (!slug) {
      setIsLoading(false)
      return
    }

    void getVehicleBySlug(slug)
      .then((nextVehicle) => {
        setVehicle(nextVehicle)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [slug])

  useEffect(() => {
    if (!user || !vehicle) {
      setIsWishlisted(false)
      return
    }

    void listWishlistVehicleIds(user.id).then((ids) => {
      setIsWishlisted(ids.includes(vehicle.id))
    })
  }, [user, vehicle])

  async function handleToggleWishlist() {
    if (!user || !vehicle) {
      setSubmitMessage('Bitte zuerst einloggen, um die Wunschliste zu nutzen.')
      return
    }

    if (isWishlisted) {
      await removeVehicleFromWishlist(user.id, vehicle.id)
      setIsWishlisted(false)
      return
    }

    await addVehicleToWishlist(user.id, vehicle.id)
    setIsWishlisted(true)
  }

  async function handleInquirySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!vehicle) {
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      await submitInquiry({
        vehicleId: vehicle.id,
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        phone: String(formData.get('phone') ?? ''),
        message: String(formData.get('message') ?? ''),
      })
      setSubmitMessage('Vielen Dank. Ihre Anfrage wurde gesendet.')
      form.reset()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Anfrage fehlgeschlagen.'
      setSubmitMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <SiteLayout>
        <main className="content-wrap status-page">
          <h1>Lade Fahrzeugdaten...</h1>
        </main>
      </SiteLayout>
    )
  }

  if (!vehicle) {
    return (
      <SiteLayout>
        <main className="content-wrap status-page">
          <h1>Fahrzeug nicht gefunden</h1>
          <p className="section-copy">Das gewunschte Fahrzeug ist nicht mehr verfugbar.</p>
          <Link className="primary-button" to="/">
            Zuruck zur Ubersicht
          </Link>
        </main>
      </SiteLayout>
    )
  }

  return (
    <SiteLayout>
      <main className="vehicle-detail-page">
        <section className="inventory-section detail-hero">
          <div className="content-wrap">
            <p className="eyebrow">Fahrzeugdetail</p>
            <h1 className="detail-title">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="section-copy">{currency.format(vehicle.priceEur)}</p>
            {vehicle.status === 'reserved' && (
              <p className="status-badge reserved">Reserviert</p>
            )}
            {vehicle.status === 'sold' && <p className="status-badge sold">Verkauft</p>}
            <button type="button" className="chip-button" onClick={() => void handleToggleWishlist()}>
              {isWishlisted ? 'Aus Wunschliste entfernen' : 'Zur Wunschliste'}
            </button>
          </div>
        </section>

        <section className="inventory-section detail-content">
          <div className="content-wrap detail-grid">
            <div>
              <div className="detail-gallery">
                {vehicle.imageUrls.map((imageUrl) => (
                  <img key={imageUrl} src={imageUrl} alt={`${vehicle.brand} ${vehicle.model}`} />
                ))}
              </div>

              <div className="detail-specs">
                <h2 className="section-title">Technische Daten</h2>
                <dl>
                  <div>
                    <dt>Baujahr</dt>
                    <dd>{vehicle.year}</dd>
                  </div>
                  <div>
                    <dt>Kilometerstand</dt>
                    <dd>{number.format(vehicle.mileageKm)} km</dd>
                  </div>
                  <div>
                    <dt>Leistung</dt>
                    <dd>{vehicle.powerPs} PS</dd>
                  </div>
                  <div>
                    <dt>Kraftstoff</dt>
                    <dd>{vehicle.fuelType}</dd>
                  </div>
                  <div>
                    <dt>Getriebe</dt>
                    <dd>{vehicle.transmission}</dd>
                  </div>
                  <div>
                    <dt>Antrieb</dt>
                    <dd>{vehicle.drivetrain}</dd>
                  </div>
                  <div>
                    <dt>Karosserie</dt>
                    <dd>{vehicle.bodyType}</dd>
                  </div>
                  <div>
                    <dt>Farbe</dt>
                    <dd>{vehicle.color}</dd>
                  </div>
                  <div>
                    <dt>Erstzulassung</dt>
                    <dd>{vehicle.firstRegistration}</dd>
                  </div>
                </dl>
              </div>

              <p className="section-copy">{vehicle.description}</p>
            </div>

            <aside className="detail-inquiry">
              <h2 className="section-title">Anfrage senden</h2>
              <form className="contact-form" onSubmit={handleInquirySubmit}>
                <label htmlFor="detail-name">Name</label>
                <input id="detail-name" name="name" required />

                <label htmlFor="detail-email">Email</label>
                <input id="detail-email" name="email" type="email" required />

                <label htmlFor="detail-phone">Telefon</label>
                <input id="detail-phone" name="phone" />

                <label htmlFor="detail-message">Nachricht</label>
                <textarea
                  id="detail-message"
                  name="message"
                  rows={4}
                  required
                  placeholder="Ich interessiere mich fur dieses Fahrzeug..."
                ></textarea>

                <button disabled={isSubmitting} className="dark-button" type="submit">
                  {isSubmitting ? 'Sende...' : 'Anfrage senden'}
                </button>
              </form>
              {submitMessage && <p className="status-inline">{submitMessage}</p>}
            </aside>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
