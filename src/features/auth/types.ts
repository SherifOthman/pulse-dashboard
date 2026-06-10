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
