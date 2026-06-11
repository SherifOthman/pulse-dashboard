// ── Pagination ─────────────────────────────────────────────────────────────────
export type PaginatedResponse<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  hasMore: boolean
}

// ── Business type enum ─────────────────────────────────────────────────────────
export const BusinessType = {
  Doctor:    1,
  Pharmacy:  2,
  Laboratory: 3,
  Radiology:  4,
} as const
export type BusinessTypeValue = typeof BusinessType[keyof typeof BusinessType]

// ── Shared lookup types ────────────────────────────────────────────────────────
export type GovernorateDto  = { id: string; name: string }
export type SpecializationDto = { id: string; name: string }

// ── Shared sub-types used across all business types ───────────────────────────

export type WorkingDayDto = {
  day: number       // 0=Sun … 6=Sat
  startTime: string // "HH:mm"
  endTime: string   // "HH:mm"
}

export type PhoneNumberDto = {
  number: string
  type: string | null
}

export type ServiceDto = { name: string }

export type BranchDto = {
  id: string
  name: string
  address: string | null
  profileImageUrl: string | null
  city: string | null
  governorate: string | null
  visitPrice: number | null
  latitude: number | null
  longitude: number | null
  phoneNumbers: PhoneNumberDto[]
  workingDays: WorkingDayDto[]
  isOpen?: boolean
}

export type TestimonialDto = {
  id: string
  userName: string | null
  userImageUrl: string | null
  rating: number
  text: string
  createdAt: string
}

// ── Shared list item — used by pharmacy, lab, radiology ───────────────────────
export type BusinessListItem = {
  id: string
  name: string
  profileImageUrl: string | null
  governorate: string
  averageRating: number
  isOpen: boolean
  createdBy: string | null
}

// ── Shared details ─────────────────────────────────────────────────────────────
export type BusinessDetailsDto = {
  id: string
  name: string
  profileImageUrl: string | null
  coverImageUrl: string | null
  description: string | null
  address: string | null
  governorate: string
  city: string
  governorateId?: string
  cityId?: string
  latitude: number | null
  longitude: number | null
  averageRating: number
  totalRatings: number
  workingDays: WorkingDayDto[]
  phoneNumbers: PhoneNumberDto[]
  branches: BranchDto[]
  testimonials: TestimonialDto[]
  services: ServiceDto[]
}

// ── Shared create/update DTO ───────────────────────────────────────────────────
export type CreateBusinessDto = {
  name: string
  cityId?: string
  description?: string
  address?: string
  profileImageUrl?: string
  coverImageUrl?: string
  latitude?: number | null
  longitude?: number | null
  services?: { id?: string; name?: string }[]
}

// ── Branch types (shared across pharmacy, lab, radiology, doctor) ──────────────

export type BranchListItem = {
  id: string
  name: string
  profileImageUrl: string | null
  governorate: string | null
  city: string | null
  isOpen: boolean
}

export type BranchDetails = {
  id: string
  name: string
  address: string | null
  governorate: string
  governorateId: string
  city: string
  cityId: string
  latitude: number | null
  longitude: number | null
  workingDays: WorkingDayDto[]
  phoneNumbers: PhoneNumberDto[]
}

export type CreateBranchDto = {
  name: string
  cityId?: string
  address?: string
  latitude?: number | null
  longitude?: number | null
  workingDays?: WorkingDayDto[]
  phoneNumbers?: PhoneNumberDto[]
}
