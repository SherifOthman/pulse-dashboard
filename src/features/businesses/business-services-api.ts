/**
 * Generic services API for any business type (Pharmacy, Lab, Radiology).
 * Mirrors the doctor services API but uses the generic business segment.
 */
import api from '@/services/api'

export type BusinessServiceDto = {
  id: string
  name: string
}

export type BusinessServiceItem = {
  id?: string
  name?: string
}

export async function getAvailableBusinessServices(
  segment: string,
): Promise<BusinessServiceDto[]> {
  const { data } = await api.get(`/${segment}/services/available`)
  return data
}

export async function getBusinessServices(
  segment: string,
  businessId: string,
): Promise<BusinessServiceDto[]> {
  const { data } = await api.get(`/${segment}/${businessId}/services`)
  return data
}

export async function updateBusinessServices(
  segment: string,
  businessId: string,
  services: BusinessServiceItem[],
): Promise<{ services: BusinessServiceDto[] }> {
  const { data } = await api.put(`/${segment}/${businessId}/services`, { services })
  return data
}
