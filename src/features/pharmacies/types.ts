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
