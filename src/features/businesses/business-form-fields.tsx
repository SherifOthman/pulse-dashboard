import { Controller, useFormContext } from 'react-hook-form'
import { Input, TextArea, toast, TextField, Label, FieldError } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { Camera, Upload, X } from 'lucide-react'
import api from '@/services/api'
import { toAbsoluteUrl } from '@/services/image-url'
import { AppSelect } from '@/components/app-select'
import { MapPicker, type MapPickerValue } from '@/components/map-picker'
import { PhoneNumbersField } from '@/features/doctors/components/phone-numbers-field'
import { WorkingDaysField } from '@/features/doctors/components/working-days-field'
import { BusinessServicesFormField } from './business-services-form-field'
import type { BusinessFormValues } from './business-form-schema'
import type { GovernorateDto, CityDto } from '@/features/cities/types'

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await api.post('/upload', fd)
  // Keep the relative path (e.g. /uploads/businesses/xxx.jpg).
  // The backend resolves it to a fully-qualified URL at query time using
  // the real request host, so mobile devices always get a reachable URL.
  return data.url as string
}

function openFilePicker(onUrl: (url: string) => void, onError: () => void) {
  const el = document.createElement('input')
  el.type = 'file'
  el.accept = 'image/*'
  el.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    onUrl(preview)
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

function Field({
  label,
  required,
  error,
  isInvalid,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  isInvalid?: boolean
  children: React.ReactNode
}) {
  return (
    <TextField isInvalid={isInvalid} validationBehavior="aria" className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-danger ms-0.5">*</span>}
      </Label>
      {children}
      {error && <FieldError className="text-xs text-danger">{error}</FieldError>}
    </TextField>
  )
}

export function BusinessFormFields({ singularLabel = '', segment }: { singularLabel?: string; segment?: string }) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<BusinessFormValues>()

  const governorateId = watch('governorateId')

  const { data: governorates = [] } = useQuery<GovernorateDto[]>({
    queryKey: ['governorates'],
    queryFn: async () => (await api.get('/governorates')).data,
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
                    src={toAbsoluteUrl(field.value) ?? field.value}
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

        {/* Profile photo — overlapping the cover */}
        <div className="absolute -bottom-10 right-5">
          <Controller
            name="profileImageUrl"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-background bg-surface-secondary shadow-lg">
                  {field.value ? (
                    <img
                      src={toAbsoluteUrl(field.value) ?? field.value}
                      alt="الصورة الشخصية"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted text-2xl font-bold">
                      ?
                    </div>
                  )}
                </div>

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

      {/* Spacer */}
      <div className="h-10" />

      {/* ── Name ── */}
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Field label="الاسم" required error={errors.name?.message} isInvalid={!!errors.name}>
            <Input {...field} variant="secondary" placeholder={`اسم ${singularLabel || 'المنشأة'}`} />
          </Field>
        )}
      />

      {/* ── Description ── */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Field label="الوصف" error={errors.description?.message} isInvalid={!!errors.description}>
            <TextArea
              {...field}
              placeholder={`نبذة عن ${singularLabel || 'المنشأة'}...`}
              rows={3}
              variant="secondary"
            />
          </Field>
        )}
      />

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

      {/* ── Address ── */}
      <Controller
        name="address"
        control={control}
        render={({ field }) => (
          <Field label="العنوان" error={errors.address?.message} isInvalid={!!errors.address}>
            <Input {...field} variant="secondary" placeholder="عنوان تفصيلي" />
          </Field>
        )}
      />

      {/* ── Phone numbers ── */}
      <PhoneNumbersField />

      {/* ── Location on map ── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">الموقع على الخريطة</label>
        <p className="text-xs text-muted -mt-1">اختياري — ابحث أو انقر على الخريطة لتحديد الموقع</p>
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

      {/* ── Services ── */}
      {segment && <BusinessServicesFormField segment={segment} />}

    </div>
  )
}
