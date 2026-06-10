import { z } from 'zod'
import { defaultWorkingDays } from './working-days-field'

// ── Zod schema ─────────────────────────────────────────────────────────────────

export const doctorFormSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  specializationId: z.string().optional(),
  governorateId: z.string().optional(),
  cityId: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  visitPrice: z.string().optional(),
  gender: z.string().optional(),        // "0" | "1" | ""
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
})

export type DoctorFormValues = z.infer<typeof doctorFormSchema>

// ── Default values ─────────────────────────────────────────────────────────────

export const doctorFormDefaults: DoctorFormValues = {
  name: '',
  specializationId: '',
  governorateId: '',
  cityId: '',
  description: '',
  address: '',
  visitPrice: '',
  gender: '',
  profileImageUrl: '',
  coverImageUrl: '',
  latitude: null,
  longitude: null,
  workingDays: defaultWorkingDays,
  phoneNumbers: [],
}
