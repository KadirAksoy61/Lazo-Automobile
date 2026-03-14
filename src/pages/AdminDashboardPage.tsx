import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { SiteLayout } from '../components/SiteLayout'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import {
  createVehicle,
  deleteCustomerLead,
  deleteVehicle,
  listAdminVehicles,
  listCustomerLeads,
  listLeadSummaries,
  listInquiries,
  upsertCustomerLead,
  updateInquiryStatus,
  updateVehicle,
  updateVehicleStatus,
  uploadVehicleImage,
} from '../lib/vehicleRepository'
import type {
  CustomerLead,
  CustomerLifecycleStatus,
  Inquiry,
  InquiryStatus,
  LeadSummary,
  Vehicle,
  VehicleUpdateDraft,
} from '../types/vehicle'

const inquiryStatusLabel: Record<InquiryStatus, string> = {
  new: 'Neu',
  contacted: 'Kontaktiert',
  closed: 'Abgeschlossen',
}

const lifecycleStatusLabel: Record<CustomerLifecycleStatus, string> = {
  new: 'Neu',
  qualified: 'Qualifiziert',
  customer: 'Kunde',
  inactive: 'Inaktiv',
}

export function AdminDashboardPage() {
  useDocumentTitle('Admin-Dashboard')
  const { signOut } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [leads, setLeads] = useState<LeadSummary[]>([])
  const [customers, setCustomers] = useState<CustomerLead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInquiryLoading, setIsInquiryLoading] = useState(true)
  const [isLeadsLoading, setIsLeadsLoading] = useState(true)
  const [isCustomersLoading, setIsCustomersLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isStatusUpdating, setIsStatusUpdating] = useState<string | null>(null)
  const [isVehicleStatusUpdating, setIsVehicleStatusUpdating] = useState<string | null>(null)
  const [isVehicleSaving, setIsVehicleSaving] = useState(false)
  const [isCustomerSaving, setIsCustomerSaving] = useState(false)
  const [isCustomerDeleting, setIsCustomerDeleting] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null)
  const [vehicleDraft, setVehicleDraft] = useState<VehicleUpdateDraft | null>(null)
  const [customerForm, setCustomerForm] = useState({
    email: '',
    name: '',
    phone: '',
    lifecycleStatus: 'new' as CustomerLifecycleStatus,
    notes: '',
  })

  const activeVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status !== 'sold'),
    [vehicles],
  )
  const archivedVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === 'sold'),
    [vehicles],
  )

  useEffect(() => {
    void listAdminVehicles().then((nextVehicles) => {
      setVehicles(nextVehicles)
      setIsLoading(false)
    })

    void listInquiries().then((nextInquiries) => {
      setInquiries(nextInquiries)
      setIsInquiryLoading(false)
    })

    void listLeadSummaries().then((nextLeads) => {
      setLeads(nextLeads)
      setIsLeadsLoading(false)
    })

    void listCustomerLeads().then((nextCustomers) => {
      setCustomers(nextCustomers)
      setIsCustomersLoading(false)
    })
  }, [])

  function startVehicleEdit(vehicle: Vehicle) {
    setEditingVehicleId(vehicle.id)
    setVehicleDraft({
      brand: vehicle.brand,
      model: vehicle.model,
      priceEur: vehicle.priceEur,
      year: vehicle.year,
      mileageKm: vehicle.mileageKm,
      powerPs: vehicle.powerPs,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      drivetrain: vehicle.drivetrain,
      bodyType: vehicle.bodyType,
      color: vehicle.color,
      firstRegistration: vehicle.firstRegistration,
      description: vehicle.description,
      status: vehicle.status,
      imageUrls: vehicle.imageUrls,
    })
  }

  function cancelVehicleEdit() {
    setEditingVehicleId(null)
    setVehicleDraft(null)
  }

  async function handleVehicleUpdateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingVehicleId || !vehicleDraft) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    setIsVehicleSaving(true)

    try {
      const formData = new FormData(event.currentTarget)
      const rawFiles = formData.getAll('additionalImages')
      const newFiles = rawFiles.filter((f): f is File => f instanceof File && f.size > 0)

      let imageUrls = vehicleDraft.imageUrls
      if (newFiles.length > 0) {
        const newUrls = await Promise.all(newFiles.map((f) => uploadVehicleImage(f)))
        imageUrls = [...imageUrls, ...newUrls]
      }

      const updated = await updateVehicle(editingVehicleId, { ...vehicleDraft, imageUrls })
      setVehicles((current) =>
        current.map((vehicle) => (vehicle.id === updated.id ? updated : vehicle)),
      )
      setSuccessMessage('Fahrzeug wurde aktualisiert.')
      cancelVehicleEdit()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Fahrzeug konnte nicht aktualisiert werden.'
      setErrorMessage(message)
    } finally {
      setIsVehicleSaving(false)
    }
  }

  async function handleVehicleDelete(vehicleId: string) {
    const confirmed = globalThis.confirm('Fahrzeug wirklich löschen?')
    if (!confirmed) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')

    try {
      await deleteVehicle(vehicleId)
      setVehicles((current) => current.filter((vehicle) => vehicle.id !== vehicleId))
      setSuccessMessage('Fahrzeug wurde gelöscht.')
      if (editingVehicleId === vehicleId) {
        cancelVehicleEdit()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fahrzeug konnte nicht gelöscht werden.'
      setErrorMessage(message)
    }
  }

  async function handleInquiryStatusChange(inquiryId: string, status: InquiryStatus) {
    setErrorMessage('')
    setIsStatusUpdating(inquiryId)

    try {
      await updateInquiryStatus(inquiryId, status)
      setInquiries((current) =>
        current.map((inquiry) => (inquiry.id === inquiryId ? { ...inquiry, status } : inquiry)),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Status konnte nicht aktualisiert werden.'
      setErrorMessage(message)
    } finally {
      setIsStatusUpdating(null)
    }
  }

  async function handleVehicleStatusChange(vehicleId: string, status: Vehicle['status']) {
    setErrorMessage('')
    setIsVehicleStatusUpdating(vehicleId)

    try {
      await updateVehicleStatus(vehicleId, status)
      setVehicles((current) =>
        current.map((vehicle) =>
          vehicle.id === vehicleId ? { ...vehicle, status } : vehicle,
        ),
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Fahrzeugstatus konnte nicht aktualisiert werden.'
      setErrorMessage(message)
    } finally {
      setIsVehicleStatusUpdating(null)
    }
  }

  async function handleCreateVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const rawFiles = formData.getAll('imageFiles')

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const validFiles = rawFiles.filter((f): f is File => f instanceof File && f.size > 0)
      if (validFiles.length === 0) {
        throw new Error('Bitte laden Sie mindestens ein Bild hoch.')
      }

      const imageUrls = await Promise.all(validFiles.map((f) => uploadVehicleImage(f)))

      const vehicle = await createVehicle({
        brand: String(formData.get('brand') ?? ''),
        model: String(formData.get('model') ?? ''),
        priceEur: Number(formData.get('priceEur') ?? 0),
        year: Number(formData.get('year') ?? 0),
        mileageKm: Number(formData.get('mileageKm') ?? 0),
        powerPs: Number(formData.get('powerPs') ?? 0),
        fuelType: String(formData.get('fuelType') ?? ''),
        transmission: String(formData.get('transmission') ?? ''),
        drivetrain: String(formData.get('drivetrain') ?? ''),
        bodyType: String(formData.get('bodyType') ?? ''),
        color: String(formData.get('color') ?? ''),
        firstRegistration: String(formData.get('firstRegistration') ?? ''),
        description: String(formData.get('description') ?? ''),
        imageUrls,
      })

      setVehicles((current) => [vehicle, ...current])
      event.currentTarget.reset()
      setSuccessMessage('Fahrzeug wurde angelegt.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fahrzeug konnte nicht erstellt werden.'
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handlePromoteLead(lead: LeadSummary) {
    setErrorMessage('')
    setSuccessMessage('')
    setIsCustomerSaving(true)

    try {
      const saved = await upsertCustomerLead({
        email: lead.email,
        name: lead.name,
        phone: lead.phone ?? undefined,
        lifecycleStatus: 'new',
      })

      setCustomers((current) => {
        const others = current.filter((customer) => customer.email !== saved.email)
        return [saved, ...others]
      })
      setSuccessMessage('Lead wurde in Kundenverwaltung übernommen.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lead konnte nicht übernommen werden.'
      setErrorMessage(message)
    } finally {
      setIsCustomerSaving(false)
    }
  }

  async function handleCustomerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setErrorMessage('')
    setSuccessMessage('')
    setIsCustomerSaving(true)

    try {
      const saved = await upsertCustomerLead({
        email: customerForm.email,
        name: customerForm.name || undefined,
        phone: customerForm.phone || undefined,
        lifecycleStatus: customerForm.lifecycleStatus,
        notes: customerForm.notes || undefined,
      })

      setCustomers((current) => {
        const others = current.filter((customer) => customer.email !== saved.email)
        return [saved, ...others]
      })
      setSuccessMessage('Kunde wurde gespeichert.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kunde konnte nicht gespeichert werden.'
      setErrorMessage(message)
    } finally {
      setIsCustomerSaving(false)
    }
  }

  function editCustomer(customer: CustomerLead) {
    setCustomerForm({
      email: customer.email,
      name: customer.name ?? '',
      phone: customer.phone ?? '',
      lifecycleStatus: customer.lifecycleStatus,
      notes: customer.notes ?? '',
    })
  }

  async function handleCustomerDelete(email: string) {
    const confirmed = globalThis.confirm('Kundeneintrag wirklich löschen?')
    if (!confirmed) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    setIsCustomerDeleting(email)

    try {
      await deleteCustomerLead(email)
      setCustomers((current) => current.filter((customer) => customer.email !== email))
      if (customerForm.email === email) {
        setCustomerForm({
          email: '',
          name: '',
          phone: '',
          lifecycleStatus: 'new',
          notes: '',
        })
      }
      setSuccessMessage('Kunde wurde gelöscht.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kunde konnte nicht gelöscht werden.'
      setErrorMessage(message)
    } finally {
      setIsCustomerDeleting(null)
    }
  }

  return (
    <SiteLayout>
      <main className="content-wrap admin-page">
        <div className="admin-header">
          <h1>Admin-Dashboard</h1>
          <button className="dark-button" onClick={() => void signOut()} type="button">
            Abmelden
          </button>
        </div>
        {successMessage && <p className="status-inline">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <section className="admin-block">
          <h2>Fahrzeug anlegen</h2>
          <form className="admin-form grid-two" onSubmit={handleCreateVehicle}>
            <label>
              Marke
              <input name="brand" required />
            </label>
            <label>
              Modell
              <input name="model" required />
            </label>
            <label>
              Preis (€)
              <input min={0} name="priceEur" required type="number" />
            </label>
            <label>
              Baujahr
              <input min={1900} name="year" required type="number" />
            </label>
            <label>
              Kilometer
              <input min={0} name="mileageKm" required type="number" />
            </label>
            <label>
              Leistung (PS)
              <input min={1} name="powerPs" required type="number" />
            </label>
            <label>
              Kraftstoff
              <input name="fuelType" required />
            </label>
            <label>
              Getriebe
              <input name="transmission" required />
            </label>
            <label>
              Antrieb
              <input name="drivetrain" required />
            </label>
            <label>
              Karosserie
              <input name="bodyType" required />
            </label>
            <label>
              Farbe
              <input name="color" required />
            </label>
            <label>
              Erstzulassung
              <input name="firstRegistration" required type="date" />
            </label>
            <label className="full-width">
              Bilder (Dateien, mehrere möglich)
              <input name="imageFiles" type="file" accept="image/*" multiple required />
            </label>
            <label className="full-width">
              Beschreibung
              <textarea name="description" required rows={4}></textarea>
            </label>
            <div className="full-width">
              <button className="dark-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Speichern...' : 'Fahrzeug speichern'}
              </button>
            </div>
          </form>
        </section>

        {editingVehicleId && vehicleDraft && (
          <section className="admin-block">
            <h2>Fahrzeug bearbeiten</h2>
            <form className="admin-form grid-two" onSubmit={handleVehicleUpdateSubmit}>
              <label>
                Marke
                <input
                  value={vehicleDraft.brand}
                  onChange={(event) =>
                    setVehicleDraft((current) =>
                      current ? { ...current, brand: event.target.value } : current,
                    )
                  }
                  required
                />
              </label>
              <label>
                Modell
                <input
                  value={vehicleDraft.model}
                  onChange={(event) =>
                    setVehicleDraft((current) =>
                      current ? { ...current, model: event.target.value } : current,
                    )
                  }
                  required
                />
              </label>
              <label>
                Preis (€)
                <input
                  type="number"
                  min={0}
                  value={vehicleDraft.priceEur}
                  onChange={(event) =>
                    setVehicleDraft((current) =>
                      current ? { ...current, priceEur: Number(event.target.value) } : current,
                    )
                  }
                  required
                />
              </label>
              <label>
                Baujahr
                <input
                  type="number"
                  min={1900}
                  value={vehicleDraft.year}
                  onChange={(event) =>
                    setVehicleDraft((current) =>
                      current ? { ...current, year: Number(event.target.value) } : current,
                    )
                  }
                  required
                />
              </label>
              <label>
                Kilometer
                <input
                  type="number"
                  min={0}
                  value={vehicleDraft.mileageKm}
                  onChange={(event) =>
                    setVehicleDraft((current) =>
                      current ? { ...current, mileageKm: Number(event.target.value) } : current,
                    )
                  }
                  required
                />
              </label>
              <label>
                Leistung (PS)
                <input
                  type="number"
                  min={1}
                  value={vehicleDraft.powerPs}
                  onChange={(event) =>
                    setVehicleDraft((current) =>
                      current ? { ...current, powerPs: Number(event.target.value) } : current,
                    )
                  }
                  required
                />
              </label>
              <label>
                Kraftstoff
                <input
                  value={vehicleDraft.fuelType}
                  onChange={(event) =>
                    setVehicleDraft((current) =>
                      current ? { ...current, fuelType: event.target.value } : current,
                    )
                  }
                  required
                />
              </label>
              <label>
                Getriebe
                <input
                  value={vehicleDraft.transmission}
                  onChange={(event) =>
                    setVehicleDraft((current) =>
                      current ? { ...current, transmission: event.target.value } : current,
                    )
                  }
                  required
                />
              </label>
              <label>
                Antrieb
                <input
                  value={vehicleDraft.drivetrain}
                  onChange={(event) =>
                    setVehicleDraft((current) =>
                      current ? { ...current, drivetrain: event.target.value } : current,
                    )
                  }
                  required
                />
              </label>
              <label>
                Karosserie
                <input
                  value={vehicleDraft.bodyType}
                  onChange={(event) =>
                    setVehicleDraft((current) =>
                      current ? { ...current, bodyType: event.target.value } : current,
                    )
                  }
                  required
                />
              </label>
              <label>
                Farbe
                <input
                  value={vehicleDraft.color}
                  onChange={(event) =>
                    setVehicleDraft((current) =>
                      current ? { ...current, color: event.target.value } : current,
                    )
                  }
                  required
                />
              </label>
              <label>
                Erstzulassung
                <input
                  type="date"
                  value={vehicleDraft.firstRegistration}
                  onChange={(event) =>
                    setVehicleDraft((current) =>
                      current ? { ...current, firstRegistration: event.target.value } : current,
                    )
                  }
                  required
                />
              </label>
              <label className="full-width">
                Beschreibung
                <textarea
                  rows={4}
                  value={vehicleDraft.description}
                  onChange={(event) =>
                    setVehicleDraft((current) =>
                      current ? { ...current, description: event.target.value } : current,
                    )
                  }
                  required
                />
              </label>
              <div className="full-width">
                <p className="admin-label">Vorhandene Bilder</p>
                {vehicleDraft.imageUrls.length === 0 && (
                  <p className="status-inline">Keine Bilder hinterlegt.</p>
                )}
                <div className="admin-image-list">
                  {vehicleDraft.imageUrls.map((url) => (
                    <div key={url} className="admin-image-thumb">
                      <img src={url} alt="Fahrzeugbild" />
                      <button
                        type="button"
                        className="admin-image-remove"
                        title="Bild entfernen"
                        onClick={() =>
                          setVehicleDraft((c) =>
                            c ? { ...c, imageUrls: c.imageUrls.filter((u) => u !== url) } : c,
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <label className="full-width">
                Weitere Bilder hinzufügen
                <input name="additionalImages" type="file" accept="image/*" multiple />
              </label>
              <label>
                Status
                <select
                  value={vehicleDraft.status}
                  onChange={(event) =>
                    setVehicleDraft((current) =>
                      current
                        ? {
                            ...current,
                            status: event.target.value as Vehicle['status'],
                          }
                        : current,
                    )
                  }
                >
                  <option value="available">Verfügbar</option>
                  <option value="reserved">Reserviert</option>
                  <option value="sold">Verkauft</option>
                </select>
              </label>
              <div className="full-width action-row">
                <button className="dark-button" type="submit" disabled={isVehicleSaving}>
                  {isVehicleSaving ? 'Speichere...' : 'Änderungen speichern'}
                </button>
                <button className="chip-button" type="button" onClick={cancelVehicleEdit}>
                  Abbrechen
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="admin-block">
          <h2>Aktueller Bestand</h2>
          {isLoading ? (
            <p className="status-inline">Bestand wird geladen...</p>
          ) : activeVehicles.length === 0 ? (
            <p className="status-inline">Kein aktiver Bestand vorhanden.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Fahrzeug</th>
                    <th>Preis</th>
                    <th>Status</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {activeVehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td>
                        {vehicle.brand} {vehicle.model}
                      </td>
                      <td>{vehicle.priceEur.toLocaleString('de-DE')} EUR</td>
                      <td>
                        <select
                          value={vehicle.status}
                          disabled={isVehicleStatusUpdating === vehicle.id}
                          onChange={(event) =>
                            void handleVehicleStatusChange(
                              vehicle.id,
                              event.target.value as Vehicle['status'],
                            )
                          }
                        >
                          <option value="available">Verfügbar</option>
                          <option value="reserved">Reserviert</option>
                          <option value="sold">Verkauft</option>
                        </select>
                      </td>
                      <td>
                        <div className="table-actions table-actions-inline">
                          <Link className="chip-button" to={`/fahrzeuge/${vehicle.slug}`}>
                            Ansehen
                          </Link>
                          <button
                            type="button"
                            className="chip-button"
                            onClick={() => startVehicleEdit(vehicle)}
                          >
                            Bearbeiten
                          </button>
                          <button
                            type="button"
                            className="chip-button danger"
                            onClick={() => void handleVehicleDelete(vehicle.id)}
                          >
                            Löschen
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-block">
          <h2>Archivierte Fahrzeuge (Verkauft)</h2>
          {isLoading ? (
            <p className="status-inline">Archiv wird geladen...</p>
          ) : archivedVehicles.length === 0 ? (
            <p className="status-inline">Noch keine verkauften Fahrzeuge im Archiv.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Fahrzeug</th>
                    <th>Preis</th>
                    <th>Status</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedVehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td>
                        {vehicle.brand} {vehicle.model}
                      </td>
                      <td>{vehicle.priceEur.toLocaleString('de-DE')} EUR</td>
                      <td>
                        <select
                          value={vehicle.status}
                          disabled={isVehicleStatusUpdating === vehicle.id}
                          onChange={(event) =>
                            void handleVehicleStatusChange(
                              vehicle.id,
                              event.target.value as Vehicle['status'],
                            )
                          }
                        >
                          <option value="available">Verfügbar</option>
                          <option value="reserved">Reserviert</option>
                          <option value="sold">Verkauft</option>
                        </select>
                      </td>
                      <td>
                        <div className="table-actions table-actions-inline">
                          <Link className="chip-button" to={`/fahrzeuge/${vehicle.slug}`}>
                            Ansehen
                          </Link>
                          <button
                            type="button"
                            className="chip-button"
                            onClick={() => startVehicleEdit(vehicle)}
                          >
                            Bearbeiten
                          </button>
                          <button
                            type="button"
                            className="chip-button danger"
                            onClick={() => void handleVehicleDelete(vehicle.id)}
                          >
                            Löschen
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-block">
          <h2>Anfragen</h2>
          {isInquiryLoading ? (
            <p className="status-inline">Anfragen werden geladen...</p>
          ) : inquiries.length === 0 ? (
            <p className="status-inline">Noch keine Anfragen vorhanden.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Datum</th>
                    <th>Fahrzeug</th>
                    <th>Kontakt</th>
                    <th>Nachricht</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id}>
                      <td>{new Date(inquiry.createdAt).toLocaleString('de-DE')}</td>
                      <td>{inquiry.vehicleLabel ?? 'Allgemeine Kontaktanfrage'}</td>
                      <td>
                        {inquiry.name}
                        <br />
                        {inquiry.email}
                        {inquiry.phone ? (
                          <>
                            <br />
                            {inquiry.phone}
                          </>
                        ) : null}
                      </td>
                      <td>{inquiry.message}</td>
                      <td>
                        <select
                          value={inquiry.status}
                          disabled={isStatusUpdating === inquiry.id}
                          onChange={(event) =>
                            void handleInquiryStatusChange(
                              inquiry.id,
                              event.target.value as InquiryStatus,
                            )
                          }
                        >
                          <option value="new">Neu</option>
                          <option value="contacted">Kontaktiert</option>
                          <option value="closed">Abgeschlossen</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-block">
          <h2>Leads-Übersicht</h2>
          {isLeadsLoading ? (
            <p className="status-inline">Leads werden geladen...</p>
          ) : leads.length === 0 ? (
            <p className="status-inline">Noch keine Leads vorhanden.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Telefon</th>
                    <th>Anfragen</th>
                    <th>Letzter Kontakt</th>
                    <th>Status</th>
                    <th>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.email}>
                      <td>{lead.email}</td>
                      <td>{lead.name}</td>
                      <td>{lead.phone ?? '-'}</td>
                      <td>{lead.inquiryCount}</td>
                      <td>{new Date(lead.lastInquiryAt).toLocaleString('de-DE')}</td>
                      <td>{inquiryStatusLabel[lead.latestStatus]}</td>
                      <td>
                        <button
                          type="button"
                          className="chip-button"
                          disabled={isCustomerSaving}
                          onClick={() => void handlePromoteLead(lead)}
                        >
                          In Kunden übernehmen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-block">
          <h2>Kundenverwaltung</h2>
          <form className="admin-form grid-two" onSubmit={handleCustomerSubmit}>
            <label>
              E-Mail
              <input
                type="email"
                value={customerForm.email}
                onChange={(event) =>
                  setCustomerForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Name
              <input
                value={customerForm.name}
                onChange={(event) =>
                  setCustomerForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </label>
            <label>
              Telefon
              <input
                value={customerForm.phone}
                onChange={(event) =>
                  setCustomerForm((current) => ({ ...current, phone: event.target.value }))
                }
              />
            </label>
            <label>
              Lebenszyklus-Status
              <select
                value={customerForm.lifecycleStatus}
                onChange={(event) =>
                  setCustomerForm((current) => ({
                    ...current,
                    lifecycleStatus: event.target.value as CustomerLifecycleStatus,
                  }))
                }
              >
                <option value="new">Neu</option>
                <option value="qualified">Qualifiziert</option>
                <option value="customer">Kunde</option>
                <option value="inactive">Inaktiv</option>
              </select>
            </label>
            <label className="full-width">
              Notizen
              <textarea
                rows={3}
                value={customerForm.notes}
                onChange={(event) =>
                  setCustomerForm((current) => ({ ...current, notes: event.target.value }))
                }
              />
            </label>
            <div className="full-width action-row">
              <button className="dark-button" type="submit" disabled={isCustomerSaving}>
                {isCustomerSaving ? 'Speichere...' : 'Kunde speichern'}
              </button>
              <button
                className="chip-button"
                type="button"
                onClick={() =>
                  setCustomerForm({
                    email: '',
                    name: '',
                    phone: '',
                    lifecycleStatus: 'new',
                    notes: '',
                  })
                }
              >
                Zurücksetzen
              </button>
            </div>
          </form>

          {isCustomersLoading ? (
            <p className="status-inline">Kunden werden geladen...</p>
          ) : customers.length === 0 ? (
            <p className="status-inline">Noch keine Kunden erfasst.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Telefon</th>
                    <th>Status</th>
                    <th>Aktualisiert</th>
                    <th>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.email}>
                      <td>{customer.email}</td>
                      <td>{customer.name ?? '-'}</td>
                      <td>{customer.phone ?? '-'}</td>
                      <td>{lifecycleStatusLabel[customer.lifecycleStatus]}</td>
                      <td>{new Date(customer.updatedAt).toLocaleString('de-DE')}</td>
                      <td>
                        <div className="table-actions table-actions-inline">
                          <button
                            type="button"
                            className="chip-button"
                            onClick={() => editCustomer(customer)}
                          >
                            Bearbeiten
                          </button>
                          <button
                            type="button"
                            className="chip-button danger"
                            disabled={isCustomerDeleting === customer.email}
                            onClick={() => void handleCustomerDelete(customer.email)}
                          >
                            {isCustomerDeleting === customer.email ? 'Lösche...' : 'Löschen'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </SiteLayout>
  )
}
