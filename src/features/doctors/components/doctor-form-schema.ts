import { z } from "zod";
import { defaultWorkingDays } from "./working-days-field";

const timeRegex = /^\d{2}:\d{2}$/;

const phoneSchema = z.object({
  number: z.string().min(1, "رقم الهاتف مطلوب"),
  type: z.string().optional(),
});

export const doctorFormSchema = z
  .object({
    name: z.string().min(1, "الاسم مطلوب").max(100, "الاسم طويل جداً"),
    specializationId: z.string().min(1, "التخصص مطلوب"),
    governorateId: z.string().min(1, "المحافظة مطلوبة"),
    cityId: z.string().min(1, "المدينة مطلوبة"),
    description: z.string().max(500, "الوصف طويل جداً").optional(),
    address: z.string().max(500, "العنوان طويل جداً").optional(),
    gender: z.string().min(1, "الجنس مطلوب"),
    profileImageUrl: z.string().optional(),
    coverImageUrl: z.string().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    workingDays: z
      .array(
        z.object({
          day: z.number().int().min(0).max(6),
          startTime: z.string(),
          endTime: z.string(),
          enabled: z.boolean(),
        }),
      )
      .refine((days) => days.some((d) => d.enabled), {
        message: "يجب اختيار يوم عمل واحد على الأقل",
      }),
    phoneNumbers: z.array(phoneSchema),
  })
  // City required when governorate is selected
  .refine((d) => !d.governorateId || !!d.cityId, {
    message: "يجب اختيار المدينة عند اختيار المحافظة",
    path: ["cityId"],
  })
  // Working day times must be valid and start < end
  .refine(
    (d) => {
      for (const day of d.workingDays) {
        if (!day.enabled) continue;
        if (!timeRegex.test(day.startTime) || !timeRegex.test(day.endTime))
          return false;
        if (day.startTime >= day.endTime) return false;
      }
      return true;
    },
    {
      message: "أوقات العمل غير صحيحة — يجب أن تكون البداية قبل النهاية",
      path: ["workingDays"],
    },
  )
  // Lat/lng bounds
  .refine(
    (d) => d.latitude == null || (d.latitude >= -90 && d.latitude <= 90),
    { message: "خط العرض يجب أن يكون بين -90 و 90", path: ["latitude"] },
  )
  .refine(
    (d) => d.longitude == null || (d.longitude >= -180 && d.longitude <= 180),
    { message: "خط الطول يجب أن يكون بين -180 و 180", path: ["longitude"] },
  );

export type DoctorFormValues = z.infer<typeof doctorFormSchema>;

export const doctorFormDefaults: DoctorFormValues = {
  name: "",
  specializationId: "",
  governorateId: "",
  cityId: "",
  description: "",
  address: "",
  gender: "",
  profileImageUrl: "",
  coverImageUrl: "",
  latitude: null,
  longitude: null,
  workingDays: defaultWorkingDays,
  phoneNumbers: [],
};
