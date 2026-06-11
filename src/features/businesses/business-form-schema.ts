import { z } from 'zod'

const timeRegex = /^\d{2}:\d{2}$/

const phoneSchema = z.object({
  number: z.string().min(1, 'رقم الهاتف مطلوب'),
  type: z.string().optional(),
})

const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
})

const servicesSchema = z.array(serviceSchema)

export const businessFormSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب').max(100, 'الاسم طويل جداً'),
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
  phoneNumbers: z.array(phoneSchema),
  services: servicesSchema,
}).refine(
  (data) => !data.governorateId || !!data.cityId,
  { message: 'يجب اختيار المدينة عند اختيار المحافظة', path: ['cityId'] },
).refine(
  (data) => {
    for (const day of data.workingDays) {
      if (!day.enabled) continue
      if (!timeRegex.test(day.startTime) || !timeRegex.test(day.endTime)) return false
      if (day.startTime >= day.endTime) return false
    }
    return true
  },
  { message: 'أوقات العمل غير صحيحة (يجب أن تكون البداية قبل النهاية)', path: ['workingDays'] },
).refine(
  (data) => data.latitude == null || (data.latitude >= -90 && data.latitude <= 90),
  { message: 'خط العرض يجب أن يكون بين -90 و 90', path: ['latitude'] },
).refine(
  (data) => data.longitude == null || (data.longitude >= -180 && data.longitude <= 180),
  { message: 'خط الطول يجب أن يكون بين -180 و 180', path: ['longitude'] },
)

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
