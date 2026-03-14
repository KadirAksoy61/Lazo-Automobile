import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SiteLayout } from '../components/SiteLayout'
import { useAuth } from '../context/AuthContext'

export function CustomerLoginPage() {
  const navigate = useNavigate()
  const { signIn, resendSignupConfirmation } = useAuth()
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextEmail = String(formData.get('email') ?? '')
    setEmail(nextEmail)

    setErrorMessage('')
    setInfoMessage('')
    setIsSubmitting(true)

    const error = await signIn(
      nextEmail,
      String(formData.get('password') ?? ''),
    )

    if (error) {
      setErrorMessage(error)
      setIsSubmitting(false)
      return
    }

    navigate('/konto/wunschliste')
  }

  const isUnconfirmedError = /not confirmed|bestaetig/i.test(errorMessage)

  async function handleResend() {
    if (!email) {
      setErrorMessage('Bitte geben Sie Ihre E-Mail ein.')
      return
    }

    setErrorMessage('')
    setInfoMessage('')
    setIsResending(true)

    const error = await resendSignupConfirmation(email)

    if (error) {
      setErrorMessage(error)
      setIsResending(false)
      return
    }

    setInfoMessage('Bestaetigungs-E-Mail wurde erneut gesendet.')
    setIsResending(false)
  }

  return (
    <SiteLayout>
      <main className="content-wrap admin-page">
        <h1>Kunden Login</h1>
        <p className="section-copy">
          Melden Sie sich an, um Ihre Wunschliste zu verwalten und Fahrzeuge zu vergleichen.
        </p>

        <form className="admin-form mx-auto w-full max-w-xl" onSubmit={handleSubmit}>
          <label htmlFor="customer-email">Email</label>
          <input
            id="customer-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="customer-password">Passwort</label>
          <input id="customer-password" name="password" type="password" required />

          <button className="dark-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Anmeldung...' : 'Einloggen'}
          </button>
        </form>

        <p className="status-inline text-sm">
          Noch kein Konto? <Link className="inline-link" to="/konto/registrieren">Jetzt registrieren</Link>
        </p>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {isUnconfirmedError && (
          <button className="ghost-button" type="button" onClick={handleResend} disabled={isResending}>
            {isResending ? 'Sende erneut...' : 'Bestaetigungs-E-Mail erneut senden'}
          </button>
        )}
        {infoMessage && <p className="status-inline">{infoMessage}</p>}
      </main>
    </SiteLayout>
  )
}
