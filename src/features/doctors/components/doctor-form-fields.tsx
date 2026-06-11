/**
 * DoctorFormFields
 *
 * All form fields for creating/editing a doctor.
 * Must be wrapped with <FormProvider {...methods}>.
 */
import { Controller, useFormContext } from 'react-hook-form'
import { Input, TextArea, toast } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { Camera, Upload, UserRound, X } from 'lucide-react'
import api from '@/services/api'
import { AppSelect } from '@/components/app-select'
import { MapPicker, type MapPickerValue } from '@/components/map-picker'
import { WorkingDaysField } from './working-days-field'
import { PhoneNumbersField } from './phone-numbers-field'
import type { DoctorFormValues } from './doctor-form-schema'
import type { GovernorateDto, CityDto } from '@/features/cities/types'
import type { SpecializationDto } from '@/features/specializations/types'

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5170/dashboard').replace('/dashboard', '')

// ── Helper to upload a file and return its URL ────────────────────────────────
async function uploadFile(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await api.post('/upload', fd)
  return data.url.startsWith('http') ? data.url : `${API_ORIGIN}${data.url}`
}

// ── Helper to open a file picker and handle upload ────────────────────────────
function openFilePicker(onUrl: (url: string) => void, onError: () => void) {
  const el = document.createElement('input')
  el.type = 'file'
  el.accept = 'image/*'
  el.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    onUrl(preview) // show preview immediately
    try {
      const url = await uploadFile(file)
      URL.revokeObjectURL(preview)
      onUrl(url)
    } catch {
      URL.revokeObjectURL(preview)
      onError()
    }
  }
  el.click()
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-danger ms-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function DoctorFormFields() {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<DoctorFormValues>()

  const governorateId = watch('governorateId')

  const { data: governorates = [] } = useQuery<GovernorateDto[]>({
    queryKey: ['governorates'],
    queryFn: async () => (await api.get('/governorates')).data,
  })

  const { data: specializations = [] } = useQuery<SpecializationDto[]>({
    queryKey: ['specializations'],
    queryFn: async () => (await api.get('/specializations')).data,
  })

  const { data: cities = [] } = useQuery<CityDto[]>({
    queryKey: ['cities-by-gov', governorateId],
    queryFn: async () => (await api.get('/cities', { params: { governorateId } })).data,
    enabled: !!governorateId,
  })

  return (
    <div className="flex flex-col gap-5 overflow-x-hidden pb-6">

      {/* ── Images: cover banner + overlapping profile photo ─────────────── */}
      <div className="relative w-full">

        {/* Cover — full-width banner */}
        <Controller
          name="coverImageUrl"
          control={control}
          render={({ field }) => (
            <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden bg-surface-secondary border border-divider">
              {field.value ? (
                <>
                  <img
                    src={field.value}
                    alt="صورة الغلاف"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-xs text-white/70 bg-black/30 rounded px-1.5 py-0.5 backdrop-blur-sm select-none">
                    صورة الغلاف
                  </span>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    openFilePicker(
                      (url) => field.onChange(url),
                      () => { field.onChange(''); toast.danger('فشل رفع الصورة') },
                    )
                  }
                  className="h-full w-full flex flex-col items-center justify-center gap-2 text-muted hover:text-primary transition-colors"
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-sm font-medium">صورة الغلاف</span>
                  <span className="text-xs opacity-60">يفضل 1200×300 بكسل</span>
                </button>
              )}

              {/* Overlay buttons — always visible when there's an image */}
              <div className="absolute top-2 left-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    openFilePicker(
                      (url) => field.onChange(url),
                      () => { field.onChange(''); toast.danger('فشل رفع الصورة') },
                    )
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                  aria-label="تغيير صورة الغلاف"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                {field.value && (
                  <button
                    type="button"
                    onClick={() => field.onChange('')}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-danger/80 text-white hover:bg-danger transition-colors backdrop-blur-sm"
                    aria-label="إزالة صورة الغلاف"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        />

        {/* Profile photo — overlapping the cover, pinned to bottom-right (RTL) */}
        <div className="absolute -bottom-10 right-5">
          <Controller
            name="profileImageUrl"
            control={control}
            render={({ field }) => (
              <div className="relative">
                {/* Circle */}
                <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-background bg-surface-secondary shadow-lg">
                  {field.value ? (
                    <img
                      src={field.value}
                      alt="الصورة الشخصية"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted">
                      <UserRound className="h-8 w-8" />
                    </div>
                  )}
                </div>

                {/* Camera edit button */}
                <button
                  type="button"
                  onClick={() =>
                    openFilePicker(
                      (url) => field.onChange(url),
                      () => { field.onChange(''); toast.danger('فشل رفع الصورة') },
                    )
                  }
                  className="absolute bottom-0 left-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:bg-primary/90 transition-colors"
                  aria-label="تغيير الصورة الشخصية"
                >
                  <Camera className="h-3 w-3" />
                </button>

                {/* Remove button */}
                {field.value && (
                  <button
                    type="button"
                    onClick={() => field.onChange('')}
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white shadow-sm hover:bg-danger/90 transition-colors"
                    aria-label="إزالة الصورة الشخصية"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* Spacer so the overlapping profile photo doesn't sit on the name field */}
      <div className="h-10" />

      {/* ── Name ── */}
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Field label="الاسم" required error={errors.name?.message}>
            <Input {...field} variant="secondary" placeholder="د. محمد أحمد" />
          </Field>
        )}
      />

      {/* ── Description ── */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Field label="الوصف" error={errors.description?.message}>
            <TextArea
              {...field}
              placeholder="نبذة عن الطبيب وخبراته..."
              rows={3}
              variant="secondary"
            />
          </Field>
        )}
      />

      {/* ── Specialization + Gender ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="specializationId"
          control={control}
          render={({ field }) => (
            <Field label="التخصص" error={errors.specializationId?.message}>
              <AppSelect
                variant="secondary"
                options={specializations.map((s) => ({ id: s.id, label: s.name }))}
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="اختر التخصص"
              />
            </Field>
          )}
        />
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Field label="الجنس" error={errors.gender?.message}>
              <AppSelect
                variant="secondary"
                isInvalid={!!errors.gender}
                options={[
                  { id: '0', label: 'ذكر' },
                  { id: '1', label: 'أنثى' },
                ]}
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="اختر الجنس"
              />
            </Field>
          )}
        />
      </div>

      {/* ── Governorate + City ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="governorateId"
          control={control}
          render={({ field }) => (
            <Field label="المحافظة" error={errors.governorateId?.message}>
              <AppSelect
                variant="secondary"
                isInvalid={!!errors.governorateId}
                options={governorates.map((g) => ({ id: g.id, label: g.name }))}
                value={field.value || ''}
                onChange={(val) => {
                  field.onChange(val)
                  setValue('cityId', '')
                }}
                placeholder="اختر المحافظة"
              />
            </Field>
          )}
        />
        <Controller
          name="cityId"
          control={control}
          render={({ field }) => (
            <Field label="المدينة" error={errors.cityId?.message}>
              <AppSelect
                variant="secondary"
                isInvalid={!!errors.cityId}
                options={cities.map((c) => ({ id: c.id, label: c.name }))}
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="اختر المدينة"
                isDisabled={!governorateId}
              />
            </Field>
          )}
        />
      </div>

      {/* ── Visit price + Address ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="visitPrice"
          control={control}
          render={({ field }) => (
            <Field label="سعر الكشف (ج.م)" error={errors.visitPrice?.message}>
              <Input {...field} variant="secondary" type="number" min="0" placeholder="0" />
            </Field>
          )}
        />
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Field label="العنوان" error={errors.address?.message}>
              <Input {...field} variant="secondary" placeholder="عنوان العيادة" />
            </Field>
          )}
        />
      </div>

      {/* ── Phone numbers ── */}
      <PhoneNumbersField />

      {/* ── Location on map ── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">الموقع على الخريطة</label>
        <p className="text-xs text-muted -mt-1">ابحث عن العيادة أو انقر على الخريطة لتحديد الموقع بدقة</p>
        {errors.latitude?.message && <p className="text-xs text-danger">{errors.latitude.message}</p>}
        {errors.longitude?.message && <p className="text-xs text-danger">{errors.longitude.message}</p>}
        <Controller
          name="latitude"
          control={control}
          render={({ field: latField }) => (
            <Controller
              name="longitude"
              control={control}
              render={({ field: lngField }) => {
                const value: MapPickerValue =
                  latField.value != null && lngField.value != null
                    ? { lat: latField.value, lng: lngField.value }
                    : null
                return (
                  <MapPicker
                    value={value}
                    onChange={(v) => {
                      latField.onChange(v?.lat ?? null)
                      lngField.onChange(v?.lng ?? null)
                    }}
                    height={300}
                  />
                )
              }}
            />
          )}
        />
      </div>

      {/* ── Working days ── */}
      <WorkingDaysField />
      {errors.workingDays?.root?.message && (
        <p className="text-xs text-danger -mt-3">{errors.workingDays.root.message}</p>
      )}
      {/* Cross-field working days error from .refine() */}
      {typeof errors.workingDays?.message === 'string' && (
        <p className="text-xs text-danger -mt-3">{errors.workingDays.message}</p>
      )}

    </div>
  )
}
