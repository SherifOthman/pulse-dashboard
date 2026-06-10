import api from '@/services/api'

export type DoctorServiceDto = {
  id: string
  name: string
}

export type ServiceItem = {
  id?: string    // existing service ID
  name?: string  // new service name (when id is undefined)
}

export async function getAvailableServices(): Promise<DoctorServiceDto[]> {
  const { data } = await api.get('/doctor-services')
  return data
}

export async function getDoctorServices(doctorId: string): Promise<DoctorServiceDto[]> {
  const { data } = await api.get(`/doctors/${doctorId}/services`)
  return data
}

export async function updateDoctorServices(
  doctorId: string,
  services: ServiceItem[],
): Promise<{ services: DoctorServiceDto[] }> {
  const { data } = await api.put(`/doctors/${doctorId}/services`, { services })
  return data
}
