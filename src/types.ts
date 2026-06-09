export type PaginatedResponse<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  hasMore: boolean
}

export type AuthTokens = {
  accessToken: string
  refreshToken?: string
}

export type UserInfo = {
  email: string
  fullName: string
  imageUrl: string | null
  role: string
}

// ── Lookup types ──────────────────────────────────────────────────────────────

export const BusinessType = {
  Doctor: 1,
  Pharmacy: 2,
  Laboratory: 3,
  Radiology: 4,
} as const

export type GovernorateDto = { id: string; name: string }
export type CityDto = { id: string; name: string; governorateId: string }
export type SpecializationDto = { id: string; name: string }

// ── Business list types ───────────────────────────────────────────────────────

export type DoctorListItem = {
  id: string
  name: string
  profileImageUrl: string | null
  governorate: string
  averageRating: number
  totalRatings: number
  isOpen: boolean
  specialization: string
  visitPrice: number | null
  createdBy: string | null
}

export type PharmacyListItem = {
  id: string
  name: string
  profileImageUrl: string | null
  governorate: string
  averageRating: number
  totalRatings: number
  isOpen: boolean
  createdBy: string | null
}

export type LabListItem = {
  id: string
  name: string
  profileImageUrl: string | null
  governorate: string
  averageRating: number
  totalRatings: number
  isOpen: boolean
  createdBy: string | null
}

export type RadiologyListItem = {
  id: string
  name: string
  profileImageUrl: string | null
  governorate: string
  averageRating: number
  totalRatings: number
  isOpen: boolean
  createdBy: string | null
}

// ── Form DTOs ─────────────────────────────────────────────────────────────────

export type CreateCityDto = { name: string; governorateId: string }
export type UpdateCityDto = Partial<CreateCityDto>

export type CreateGovernorateDto = { name: string }
export type UpdateGovernorateDto = Partial<CreateGovernorateDto>

export type CreateSpecializationDto = { name: string }
export type UpdateSpecializationDto = Partial<CreateSpecializationDto>

// ── Business form DTOs ──────────────────────────────────────────────────────────

export type DoctorDto = {
  id: string
  name: string
  governorate: string
  specialization: string
  averageRating: number
  visitPrice: number | null
  profileImageUrl: string | null
  governorateId?: string
  cityId?: string
  description?: string
  address?: string
  gender?: string
  createdBy: string | null
}

// ── Doctor detail types ───────────────────────────────────────────────────────

export type WorkingDayDto = {
  day: number        // 0=Sunday … 6=Saturday
  startTime: string  // "HH:mm"
  endTime: string    // "HH:mm"
}

export type PhoneNumberDto = {
  number: string
  type: string | null
}

export type ServiceDto = {
  name: string
}

export type BranchDto = {
  id: string
  name: string
  address: string | null
  profileImageUrl: string | null
  phoneNumbers: PhoneNumberDto[]
  workingDays: WorkingDayDto[]
}

export type TestimonialDto = {
  id: string
  userName: string | null
  userImageUrl: string | null
  rating: number
  text: string
  createdAt: string
}

export type DoctorDetailsDto = {
  id: string
  name: string
  profileImageUrl: string | null
  coverImageUrl: string | null
  description: string | null
  address: string | null
  governorate: string
  city: string
  latitude: number | null
  longitude: number | null
  averageRating: number
  totalRatings: number
  isFavorite: boolean
  hasUserReviewed: boolean
  workingDays: WorkingDayDto[]
  phoneNumbers: PhoneNumberDto[]
  branches: BranchDto[]
  testimonials: TestimonialDto[]
  services: ServiceDto[]
  specialization: string
  visitPrice: number | null
}

export type CreateDoctorDto = {
  name: string
  specializationId?: string
  cityId?: string
  description?: string
  address?: string
  visitPrice?: number
  gender?: string
  profileImageUrl?: string
  coverImageUrl?: string
}

export type PharmacyDto = {
  id: string
  name: string
  governorate: string
  averageRating: number
  isOpen: boolean
  profileImageUrl: string | null
  governorateId?: string
  cityId?: string
  description?: string
  address?: string
  createdBy: string | null
}

export type CreatePharmacyDto = {
  name: string
  cityId?: string
  description?: string
  address?: string
  profileImageUrl?: string
  coverImageUrl?: string
}

export type LabDto = {
  id: string
  name: string
  governorate: string
  averageRating: number
  profileImageUrl: string | null
  governorateId?: string
  cityId?: string
  description?: string
  address?: string
  createdBy: string | null
}

export type CreateLabDto = {
  name: string
  cityId?: string
  description?: string
  address?: string
  profileImageUrl?: string
  coverImageUrl?: string
}

export type RadiologyDto = {
  id: string
  name: string
  governorate: string
  averageRating: number
  profileImageUrl: string | null
  governorateId?: string
  cityId?: string
  description?: string
  address?: string
  createdBy: string | null
}

export type CreateRadiologyDto = {
  name: string
  cityId?: string
  description?: string
  address?: string
  profileImageUrl?: string
  coverImageUrl?: string
}

// ── Dashboard User types ─────────────────────────────────────────────────────────────────────────

export type DashboardUser = {
  id: string
  email: string
  fullName: string
  imageUrl: string | null
  emailConfirmed: boolean
  role: string
}

export type CreateDashboardUserDto = {
  email: string
  password?: string
  fullName: string
  role?: string
}

export type UpdateDashboardUserDto = {
  fullName?: string
  email?: string
  password?: string
  role?: string
}
