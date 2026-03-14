import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SiteLayout } from '../components/SiteLayout'
import { useAuth } from '../context/AuthContext'

export function CustomerRegisterPage() {
  const navigate = useNavigate()
  const { signUp, resendSignupConfirmation } = useAuth()
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextEmail = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    const passwordConfirm = String(formData.get('passwordConfirm') ?? '')
    setEmail(nextEmail)

    setErrorMessage('')
    setSuccessMessage('')

    if (password.length < 8) {
      setErrorMessage('Das Passwort muss mindestens 8 Zeichen haben.')
      return
    }

    if (password !== passwordConfirm) {
      setErrorMessage('Die Passwoerter stimmen nicht ueberein.')
      return
    }

    setIsSubmitting(true)

    const error = await signUp(nextEmail, password)

    if (error) {
      setErrorMessage(error)
      setIsSubmitting(false)
      return
    }

    setSuccessMessage('Konto erstellt. Bitte pruefen Sie Ihre E-Mails zur Bestaetigung.')
    setIsSubmitting(false)
    setTimeout(() => navigate('/konto/login'), 1200)
  }

  async function handleResend() {
    if (!email) {
      setErrorMessage('Bitte geben Sie zuerst Ihre E-Mail ein.')
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    setIsResending(true)

    const error = await resendSignupConfirmation(email)

    if (error) {
      setErrorMessage(error)
      setIsResending(false)
      return
    }

    setSuccessMessage('Bestaetigungs-E-Mail wurde erneut gesendet.')
    setIsResending(false)
  }

  return (
    <SiteLayout>
      <main className="content-wrap admin-page">
        <h1>Konto erstellen</h1>
        <p className="section-copy">
          Registrieren Sie sich fuer Wunschliste, Vergleich und personalisierte Fahrzeuganfragen.
        </p>

        <form className="admin-form mx-auto w-full max-w-xl" onSubmit={handleSubmit}>
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="register-password">Passwort</label>
          <input id="register-password" name="password" type="password" required />

          <label htmlFor="register-password-confirm">Passwort wiederholen</label>
          <input id="register-password-confirm" name="passwordConfirm" type="password" required />

          <button className="dark-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registriere...' : 'Registrieren'}
          </button>

          <button className="ghost-button" type="button" onClick={handleResend} disabled={isResending}>
            {isResending ? 'Sende erneut...' : 'Bestaetigungs-E-Mail erneut senden'}
          </button>
        </form>

        <p className="status-inline text-sm">
          Bereits registriert? <Link className="inline-link" to="/konto/login">Zum Login</Link>
        </p>

        {successMessage && <p className="status-inline">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </main>
    </SiteLayout>
  )
}
