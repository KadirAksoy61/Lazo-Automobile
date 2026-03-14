import { FormEvent, useState } from 'react'
import { SiteLayout } from '../components/SiteLayout'
import { submitInquiry } from '../lib/vehicleRepository'

export function ContactPage() {
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [contactMessage, setContactMessage] = useState('')

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
        <section className="contact-section">
          <div className="content-wrap contact-grid">
            <div>
              <p className="eyebrow">Kontakt</p>
              <h1 className="contact-title">Lassen Sie uns sprechen.</h1>
              <p className="section-copy contact-copy">
                Haben Sie Interesse an einem Fahrzeug oder eine allgemeine Anfrage? Wir freuen uns auf Ihre Nachricht.
              </p>
              <ul className="contact-details">
                <li>+49 (0) 123 456789</li>
                <li>info@lazo-automobile.de</li>
                <li>Musterstraße 42, 10115 Berlin</li>
              </ul>
            </div>
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <label htmlFor="contact-name">Name</label>
              <input id="contact-name" name="name" type="text" placeholder="Ihr Name" required />

              <label htmlFor="contact-mail">E-Mail</label>
              <input id="contact-mail" name="email" type="email" placeholder="name@email.de" required />

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
