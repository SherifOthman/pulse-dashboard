import { z } from 'zod'

const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
})

const servicesSchema = z.array(serviceSchema)

export const businessFormSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  governorateId: z.string().optional(),
  cityId: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  profileImageUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  workingDays: z.array(
    z.object({
      day: z.number(),
      startTime: z.string(),
      endTime: z.string(),
      enabled: z.boolean(),
    }),
  ),
  phoneNumbers: z.array(
    z.object({
      number: z.string(),
      type: z.string().optional(),
    }),
  ),
  services: servicesSchema,
})

export type ServiceItem = { id?: string; name: string }
export type BusinessFormValues = z.infer<typeof businessFormSchema>

export const businessFormDefaults: BusinessFormValues = {
  name: '',
  governorateId: '',
  cityId: '',
  description: '',
  address: '',
  profileImageUrl: '',
  coverImageUrl: '',
  latitude: null,
  longitude: null,
  workingDays: Array.from({ length: 7 }, (_, i) => ({
    day: i,
    startTime: '09:00',
    endTime: '17:00',
    enabled: false,
  })),
  phoneNumbers: [],
  services: [],
}
