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
