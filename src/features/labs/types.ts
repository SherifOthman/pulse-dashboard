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
