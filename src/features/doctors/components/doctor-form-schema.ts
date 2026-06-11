import { z } from 'zod'
import { defaultWorkingDays } from './working-days-field'

const timeRegex = /^\d{2}:\d{2}$/

const phoneSchema = z.object({
  number: z.string().min(1, 'رقم الهاتف مطلوب'),
  type:   z.string().optional(),
})

export const doctorFormSchema = z.object({
  name:             z.string().min(1, 'الاسم مطلوب').max(100, 'الاسم طويل جداً'),
  specializationId: z.string().optional(),
  governorateId:    z.string().optional(),
  cityId:           z.string().optional(),
  description:      z.string().max(2000, 'الوصف طويل جداً').optional(),
  address:          z.string().max(500, 'العنوان طويل جداً').optional(),
  visitPrice:       z.string().optional(),
  gender:           z.string().optional(),
  profileImageUrl:  z.string().optional(),
  coverImageUrl:    z.string().optional(),
  latitude:         z.number().nullable().optional(),
  longitude:        z.number().nullable().optional(),
  workingDays: z.array(
    z.object({
      day:       z.number().int().min(0).max(6),
      startTime: z.string(),
      endTime:   z.string(),
      enabled:   z.boolean(),
    }),
  ),
  phoneNumbers: z.array(phoneSchema),
})
  // City required when governorate is selected
  .refine(
    (d) => !d.governorateId || !!d.cityId,
    { message: 'يجب اختيار المدينة عند اختيار المحافظة', path: ['cityId'] },
  )
  // Working day times must be valid and start < end
  .refine(
    (d) => {
      for (const day of d.workingDays) {
        if (!day.enabled) continue
        if (!timeRegex.test(day.startTime) || !timeRegex.test(day.endTime)) return false
        if (day.startTime >= day.endTime) return false
      }
      return true
    },
    { message: 'أوقات العمل غير صحيحة — يجب أن تكون البداية قبل النهاية', path: ['workingDays'] },
  )
  // Visit price must be positive number if provided
  .refine(
    (d) => !d.visitPrice || (!isNaN(Number(d.visitPrice)) && Number(d.visitPrice) > 0),
    { message: 'سعر الكشف يجب أن يكون رقماً موجباً', path: ['visitPrice'] },
  )
  // Lat/lng bounds
  .refine(
    (d) => d.latitude == null || (d.latitude >= -90 && d.latitude <= 90),
    { message: 'خط العرض يجب أن يكون بين -90 و 90', path: ['latitude'] },
  )
  .refine(
    (d) => d.longitude == null || (d.longitude >= -180 && d.longitude <= 180),
    { message: 'خط الطول يجب أن يكون بين -180 و 180', path: ['longitude'] },
  )

export type DoctorFormValues = z.infer<typeof doctorFormSchema>

export const doctorFormDefaults: DoctorFormValues = {
  name:             '',
  specializationId: '',
  governorateId:    '',
  cityId:           '',
  description:      '',
  address:          '',
  visitPrice:       '',
  gender:           '',
  profileImageUrl:  '',
  coverImageUrl:    '',
  latitude:         null,
  longitude:        null,
  workingDays:      defaultWorkingDays,
  phoneNumbers:     [],
}
