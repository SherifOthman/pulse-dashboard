export type WorkingDayDto = {
  day: number
  startTime: string
  endTime: string
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
  city: string | null
  governorate: string | null
  visitPrice: number | null
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
  gender: number
  createdBy: string | null
}

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
  gender: number
  createdBy: string | null
}

export type DoctorDetailsDto = {
  id: string
  name: string
  profileImageUrl: string | null
  coverImageUrl: string | null
  description: string | null
  address: string | null
  governorate: string
  governorateId: string
  city: string
  cityId: string
  latitude: number | null
  longitude: number | null
  averageRating: number
  totalRatings: number
  gender: number
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
  gender?: number
  profileImageUrl?: string
  coverImageUrl?: string
  latitude?: number | null
  longitude?: number | null
  workingDays?: WorkingDayDto[]
  phoneNumbers?: PhoneNumberDto[]
}

export type BranchListItem = {
  id: string
  name: string
  profileImageUrl: string | null
  governorate: string | null
  city: string | null
  visitPrice: number | null
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
  visitPrice: number | null
  latitude: number | null
  longitude: number | null
  workingDays: WorkingDayDto[]
  phoneNumbers: PhoneNumberDto[]
}

export type CreateBranchDto = {
  name: string
  cityId?: string
  address?: string
  visitPrice?: number
  latitude?: number
  longitude?: number
  workingDays?: WorkingDayDto[]
  phoneNumbers?: PhoneNumberDto[]
}
