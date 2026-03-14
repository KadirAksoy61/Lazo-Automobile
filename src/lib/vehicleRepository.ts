import { supabase } from './supabase'
import type {
  CustomerLead,
  CustomerLifecycleStatus,
  Inquiry,
  InquiryInput,
  InquiryStatus,
  LeadSummary,
  Vehicle,
  VehicleDraft,
  VehicleFilters,
  VehicleStatus,
  VehicleUpdateDraft,
} from '../types/vehicle'

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function slugExists(slug: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return Boolean(data)
}

async function createUniqueSlug(brand: string, model: string): Promise<string> {
  const baseSlug = slugify(`${brand}-${model}`)
  const fallbackBase = baseSlug || 'fahrzeug'

  let candidate = fallbackBase
  let counter = 2

  while (await slugExists(candidate)) {
    candidate = `${fallbackBase}-${counter}`
    counter += 1
  }

  return candidate
}

export async function uploadVehicleImage(file: File): Promise<string> {
  const extension = file.name.includes('.')
    ? file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    : 'jpg'
  const objectPath = `vehicles/${Date.now()}-${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from('vehicle-images')
    .upload(objectPath, file, {
      upsert: false,
      contentType: file.type || undefined,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage.from('vehicle-images').getPublicUrl(objectPath)

  if (!data.publicUrl) {
    throw new Error('Bild-URL konnte nicht erzeugt werden.')
  }

  return data.publicUrl
}

function mapDbVehicle(row: Record<string, unknown>): Vehicle {
  const id = String(row.id ?? crypto.randomUUID())
  const brand = String(row.brand ?? 'Unbekannt')
  const model = String(row.model ?? 'Modell')
  const slug = String(row.slug ?? slugify(`${brand}-${model}-${id.slice(0, 8)}`))

  return {
    id,
    slug,
    brand,
    model,
    priceEur: Number(row.price_eur ?? 0),
    year: Number(row.year ?? 0),
    mileageKm: Number(row.mileage_km ?? 0),
    powerPs: Number(row.power_ps ?? 0),
    fuelType: String(row.fuel_type ?? 'Unbekannt'),
    transmission: String(row.transmission ?? 'Unbekannt'),
    drivetrain: String(row.drivetrain ?? 'Unbekannt'),
    bodyType: String(row.body_type ?? 'Unbekannt'),
    color: String(row.color ?? 'Unbekannt'),
    firstRegistration: String(row.first_registration ?? ''),
    description: String(row.description ?? ''),
    imageUrls: Array.isArray(row.image_urls)
      ? row.image_urls.map((url) => String(url))
      : [],
    status: String(row.status ?? 'available') as VehicleStatus,
  }
}

function mapDbInquiry(row: Record<string, unknown>): Inquiry {
  const vehicle = row.vehicles as Record<string, unknown> | null
  const vehicleBrand = vehicle?.brand ? String(vehicle.brand) : null
  const vehicleModel = vehicle?.model ? String(vehicle.model) : null

  return {
    id: String(row.id ?? ''),
    vehicleId: row.vehicle_id ? String(row.vehicle_id) : null,
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: row.phone ? String(row.phone) : null,
    message: String(row.message ?? ''),
    status: String(row.status ?? 'new') as InquiryStatus,
    createdAt: String(row.created_at ?? ''),
    vehicleLabel:
      vehicleBrand && vehicleModel ? `${vehicleBrand} ${vehicleModel}` : null,
  }
}

function mapDbCustomerLead(row: Record<string, unknown>): CustomerLead {
  return {
    email: String(row.email ?? ''),
    name: row.name ? String(row.name) : null,
    phone: row.phone ? String(row.phone) : null,
    lifecycleStatus: String(row.lifecycle_status ?? 'new') as CustomerLifecycleStatus,
    notes: row.notes ? String(row.notes) : null,
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  }
}

export async function listVehicles(filters?: VehicleFilters): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const vehicles = (data ?? []).map((row) => mapDbVehicle(row as Record<string, unknown>))

  const availableVehicles = vehicles.filter((vehicle) => vehicle.status !== 'sold')

  const brand = filters?.brand?.trim()
  const query = filters?.query?.trim().toLowerCase()

  return availableVehicles.filter((vehicle) => {
    const brandMatches = !brand || brand === 'Alle' || vehicle.brand === brand
    const queryMatches =
      !query || `${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(query)

    return brandMatches && queryMatches
  })
}

export async function listVehicleBrands(): Promise<string[]> {
  const vehicles = await listVehicles()
  return ['Alle', ...new Set(vehicles.map((vehicle) => vehicle.brand))]
}

export async function listVehiclesByIds(vehicleIds: string[]): Promise<Vehicle[]> {
  if (vehicleIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .in('id', vehicleIds)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapDbVehicle(row as Record<string, unknown>))
}

export async function listAdminVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapDbVehicle(row as Record<string, unknown>))
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? mapDbVehicle(data as Record<string, unknown>) : null
}

export async function createVehicle(input: VehicleDraft): Promise<Vehicle> {
  const generatedSlug = await createUniqueSlug(input.brand, input.model)

  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      slug: generatedSlug,
      brand: input.brand,
      model: input.model,
      price_eur: input.priceEur,
      year: input.year,
      mileage_km: input.mileageKm,
      power_ps: input.powerPs,
      fuel_type: input.fuelType,
      transmission: input.transmission,
      drivetrain: input.drivetrain,
      body_type: input.bodyType,
      color: input.color,
      first_registration: input.firstRegistration,
      description: input.description,
      image_urls: input.imageUrls,
      status: 'available',
    })
    .select('*')
    .single()

  if (error || !data) {
    if (error?.code === '23505' && error.message.includes('vehicles_slug_key')) {
      const retrySlug = `${generatedSlug}-${crypto.randomUUID().slice(0, 6)}`
      const { data: retryData, error: retryError } = await supabase
        .from('vehicles')
        .insert({
          slug: retrySlug,
          brand: input.brand,
          model: input.model,
          price_eur: input.priceEur,
          year: input.year,
          mileage_km: input.mileageKm,
          power_ps: input.powerPs,
          fuel_type: input.fuelType,
          transmission: input.transmission,
          drivetrain: input.drivetrain,
          body_type: input.bodyType,
          color: input.color,
          first_registration: input.firstRegistration,
          description: input.description,
          image_urls: input.imageUrls,
          status: 'available',
        })
        .select('*')
        .single()

      if (retryError || !retryData) {
        throw new Error(retryError?.message ?? 'Fahrzeug konnte nicht gespeichert werden.')
      }

      return mapDbVehicle(retryData as Record<string, unknown>)
    }

    throw new Error(error?.message ?? 'Fahrzeug konnte nicht gespeichert werden.')
  }

  return mapDbVehicle(data as Record<string, unknown>)
}

export async function submitInquiry(input: InquiryInput): Promise<void> {
  const { error } = await supabase.from('inquiries').insert({
    vehicle_id: input.vehicleId ?? null,
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function listInquiries(): Promise<Inquiry[]> {
  const { data, error } = await supabase
    .from('inquiries')
    .select('id, vehicle_id, name, email, phone, message, status, created_at, vehicles(brand, model)')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapDbInquiry(row as Record<string, unknown>))
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: InquiryStatus,
): Promise<void> {
  const { error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', inquiryId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function updateVehicleStatus(
  vehicleId: string,
  status: VehicleStatus,
): Promise<void> {
  const { error } = await supabase
    .from('vehicles')
    .update({ status })
    .eq('id', vehicleId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function updateVehicle(
  vehicleId: string,
  input: VehicleUpdateDraft,
): Promise<Vehicle> {
  const { data, error } = await supabase
    .from('vehicles')
    .update({
      brand: input.brand,
      model: input.model,
      price_eur: input.priceEur,
      year: input.year,
      mileage_km: input.mileageKm,
      power_ps: input.powerPs,
      fuel_type: input.fuelType,
      transmission: input.transmission,
      drivetrain: input.drivetrain,
      body_type: input.bodyType,
      color: input.color,
      first_registration: input.firstRegistration,
      description: input.description,
      status: input.status,
      image_urls: input.imageUrls,
      updated_at: new Date().toISOString(),
    })
    .eq('id', vehicleId)
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Fahrzeug konnte nicht aktualisiert werden.')
  }

  return mapDbVehicle(data as Record<string, unknown>)
}

export async function deleteVehicle(vehicleId: string): Promise<void> {
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', vehicleId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function listLeadSummaries(): Promise<LeadSummary[]> {
  const inquiries = await listInquiries()
  const byEmail = new Map<string, LeadSummary>()

  for (const inquiry of inquiries) {
    const existing = byEmail.get(inquiry.email)

    if (!existing) {
      byEmail.set(inquiry.email, {
        email: inquiry.email,
        name: inquiry.name,
        phone: inquiry.phone,
        inquiryCount: 1,
        lastInquiryAt: inquiry.createdAt,
        latestStatus: inquiry.status,
      })
      continue
    }

    existing.inquiryCount += 1
    if (new Date(inquiry.createdAt).getTime() > new Date(existing.lastInquiryAt).getTime()) {
      existing.lastInquiryAt = inquiry.createdAt
      existing.latestStatus = inquiry.status
      existing.name = inquiry.name
      existing.phone = inquiry.phone
    }
  }

  return [...byEmail.values()].sort(
    (a, b) => new Date(b.lastInquiryAt).getTime() - new Date(a.lastInquiryAt).getTime(),
  )
}

export async function listCustomerLeads(): Promise<CustomerLead[]> {
  const { data, error } = await supabase
    .from('customer_leads')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapDbCustomerLead(row as Record<string, unknown>))
}

export async function upsertCustomerLead(input: {
  email: string
  name?: string
  phone?: string
  lifecycleStatus?: CustomerLifecycleStatus
  notes?: string
}): Promise<CustomerLead> {
  const { data, error } = await supabase
    .from('customer_leads')
    .upsert(
      {
        email: input.email,
        name: input.name ?? null,
        phone: input.phone ?? null,
        lifecycle_status: input.lifecycleStatus ?? 'new',
        notes: input.notes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' },
    )
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Lead konnte nicht gespeichert werden.')
  }

  return mapDbCustomerLead(data as Record<string, unknown>)
}

export async function deleteCustomerLead(email: string): Promise<void> {
  const { error } = await supabase
    .from('customer_leads')
    .delete()
    .eq('email', email)

  if (error) {
    throw new Error(error.message)
  }
}

export async function listWishlistVehicleIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('wishlists')
    .select('vehicle_id')
    .eq('user_id', userId)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => String((row as { vehicle_id: string }).vehicle_id))
}

export async function addVehicleToWishlist(userId: string, vehicleId: string): Promise<void> {
  const { error } = await supabase.from('wishlists').insert({
    user_id: userId,
    vehicle_id: vehicleId,
  })

  if (error && error.code !== '23505') {
    throw new Error(error.message)
  }
}

export async function removeVehicleFromWishlist(userId: string, vehicleId: string): Promise<void> {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('vehicle_id', vehicleId)

  if (error) {
    throw new Error(error.message)
  }
}
