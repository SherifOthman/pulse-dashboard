import api from '@/services/api'
import type { AuthTokens, UserInfo } from '@/types'

export async function login(email: string, password: string): Promise<AuthTokens> {
  const { data } = await api.post('/auth/login', { email, password })
  return { accessToken: data.accessToken }
}

export async function fetchMe(): Promise<UserInfo> {
  const { data } = await api.get('/users/me')
  return data
}
