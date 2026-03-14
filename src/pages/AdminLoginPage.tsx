import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteLayout } from '../components/SiteLayout'
import { useAuth } from '../context/AuthContext'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')

    setIsSubmitting(true)
    setErrorMessage('')

    const error = await signIn(email, password)

    if (error) {
      setErrorMessage(error)
      setIsSubmitting(false)
      return
    }

    navigate('/admin')
  }

  return (
    <SiteLayout>
      <main className="content-wrap admin-page">
        <h1>Admin Login</h1>
        <p className="section-copy">
          Melden Sie sich an, um Fahrzeuge zu erstellen, zu bearbeiten und Anfragen zu
          verwalten.
        </p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" name="email" type="email" required />

          <label htmlFor="admin-password">Passwort</label>
          <input id="admin-password" name="password" type="password" required />

          <button className="dark-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Anmeldung...' : 'Einloggen'}
          </button>
        </form>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </main>
    </SiteLayout>
  )
}
