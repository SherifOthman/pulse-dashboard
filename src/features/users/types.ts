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
