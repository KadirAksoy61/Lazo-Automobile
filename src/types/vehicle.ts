export type VehicleStatus = 'available' | 'reserved' | 'sold'
export type InquiryStatus = 'new' | 'contacted' | 'closed'

export interface Vehicle {
  id: string
  slug: string
  brand: string
  model: string
  priceEur: number
  year: number
  mileageKm: number
  powerPs: number
  fuelType: string
  transmission: string
  drivetrain: string
  bodyType: string
  color: string
  firstRegistration: string
  description: string
  imageUrls: string[]
  status: VehicleStatus
}

export interface VehicleFilters {
  query?: string
  brand?: string
}

export interface VehicleDraft {
  brand: string
  model: string
  priceEur: number
  year: number
  mileageKm: number
  powerPs: number
  fuelType: string
  transmission: string
  drivetrain: string
  bodyType: string
  color: string
  firstRegistration: string
  description: string
  imageUrls: string[]
}

export interface VehicleUpdateDraft {
  brand: string
  model: string
  priceEur: number
  year: number
  mileageKm: number
  powerPs: number
  fuelType: string
  transmission: string
  drivetrain: string
  bodyType: string
  color: string
  firstRegistration: string
  description: string
  status: VehicleStatus
  imageUrls: string[]
}

export interface InquiryInput {
  vehicleId?: string
  name: string
  email: string
  message: string
  phone?: string
}

export interface Inquiry {
  id: string
  vehicleId: string | null
  name: string
  email: string
  phone: string | null
  message: string
  status: InquiryStatus
  createdAt: string
  vehicleLabel: string | null
}

export interface LeadSummary {
  email: string
  name: string
  phone: string | null
  inquiryCount: number
  lastInquiryAt: string
  latestStatus: InquiryStatus
}

export type CustomerLifecycleStatus = 'new' | 'qualified' | 'customer' | 'inactive'

export interface CustomerLead {
  email: string
  name: string | null
  phone: string | null
  lifecycleStatus: CustomerLifecycleStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}
