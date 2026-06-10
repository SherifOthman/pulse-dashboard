/**
 * BusinessFormModal
 *
 * A single form modal reused by Pharmacy, Lab, and Radiology.
 * Covers all shared fields: name, governorate/city, address, description, images, lat/lng.
 * Doctors use their own dedicated form page due to extra fields.
 */
import { useEffect } from 'react'
import { useForm, Controller, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Modal, TextArea, toast } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { AppSelect } from '@/components/app-select'
import { MapPicker, type MapPickerValue } from '@/components/map-picker'
import { WorkingDaysField, defaultWorkingDays, mapWorkingDaysToForm, formToWorkingDays } from '@/features/doctors/components/working-days-field'
import { PhoneNumbersField } from '@/features/doctors/components/phone-numbers-field'
import type { GovernorateDto, CityDto, CreateBusinessDto, BusinessListItem } from '@/types/shared'

// ── Schema ─────────────────────────────────────────────────────────────────────
const schema = z.object({
  name:           z.string().min(1, 'الاسم مطلوب'),
  governorateId:  z.string().optional(),
  cityId:         z.string().optional(),
  description:    z.string().optional(),
  address:        z.string().optional(),
  profileImageUrl: z.string().optional(),
  coverImageUrl:  z.string().optional(),
  latitude:       z.number().nullable().optional(),
  longitude:      z.number().nullable().optional(),
  workingDays: z.array(z.object({
    day: z.number(), startTime: z.string(), endTime: z.string(), enabled: z.boolean(),
  })),
  phoneNumbers: z.array(z.object({
    number: z.string(), type: z.string().optional(),
  })),
})

type FormValues = z.infer<typeof schema>

const defaults: FormValues = {
  name: '', governorateId: '', cityId: '',
  description: '', address: '',
  profileImageUrl: '', coverImageUrl: '',
  latitude: null, longitude: null,
  workingDays: defaultWorkingDays,
  phoneNumbers: [],
}

// ── Field wrapper ──────────────────────────────────────────────────────────────
function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}{required && <span className="text-danger ms-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

// ── Props ──────────────────────────────────────────────────────────────────────
type Props = {
  isOpen:    boolean
  onClose:   () => void
  onSubmit:  (dto: CreateBusinessDto) => void
  isLoading?: boolean
  title:     string       // e.g. "إضافة صيدلية جديدة"
  editTitle: string       // e.g. "تعديل الصيدلية"
  initial?:  BusinessListItem | null
}

// ── Component ──────────────────────────────────────────────────────────────────
export function BusinessFormModal({
  isOpen, onClose, onSubmit, isLoading, title, editTitle, initial,
}: Props) {
  const methods = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults })
  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = methods

  const governorateId = watch('governorateId')
  const nameValue     = watch('name')

  const { data: governorates = [] } = useQuery<GovernorateDto[]>({
    queryKey: ['governorates'],
    queryFn:  async () => (await api.get('/governorates')).data,
  })

  const { data: cities = [] } = useQuery<CityDto[]>({
    queryKey: ['cities-by-gov', governorateId],
    queryFn:  async () => (await api.get('/cities', { params: { governorateId } })).data,
    enabled: !!governorateId,
  })

  // ── Populate on edit ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    if (initial) {
      reset({
        ...defaults,
        name:            initial.name,
        profileImageUrl: initial.profileImageUrl || '',
      })
    } else {
      reset(defaults)
    }
  }, [initial, isOpen, reset])

  const onFormSubmit = (data: FormValues) => {
    onSubmit({
      name:            data.name.trim(),
      cityId:          data.cityId || undefined,
      description:     data.description?.trim() || undefined,
      address:         data.address?.trim() || undefined,
      profileImageUrl: data.profileImageUrl || undefined,
      coverImageUrl:   data.coverImageUrl || undefined,
      latitude:        data.latitude ?? undefined,
      longitude:       data.longitude ?? undefined,
    })
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Container size="lg">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{initial ? editTitle : title}</Modal.Heading>
          </Modal.Header>

          <Modal.Body dir="rtl" className="flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
            <FormProvider {...methods}>
              {/* Name */}
              <Controller name="name" control={control} render={({ field }) => (
                <Field label="الاسم" required error={errors.name?.message}>
                  <Input {...field} variant="secondary" placeholder="الاسم..." />
                </Field>
              )} />

              {/* Description */}
              <Controller name="description" control={control} render={({ field }) => (
                <Field label="الوصف">
                  <TextArea {...field} variant="secondary" placeholder="وصف..." rows={2} />
                </Field>
              )} />

              {/* Governorate + City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller name="governorateId" control={control} render={({ field }) => (
                  <Field label="المحافظة">
                    <AppSelect
                      variant="secondary"
                      options={governorates.map(g => ({ id: g.id, label: g.name }))}
                      value={field.value || ''}
                      onChange={val => { field.onChange(val); setValue('cityId', '') }}
                      placeholder="اختر المحافظة"
                    />
                  </Field>
                )} />
                <Controller name="cityId" control={control} render={({ field }) => (
                  <Field label="المدينة">
                    <AppSelect
                      variant="secondary"
                      options={cities.map(c => ({ id: c.id, label: c.name }))}
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="اختر المدينة"
                      isDisabled={!governorateId}
                    />
                  </Field>
                )} />
              </div>

              {/* Address */}
              <Controller name="address" control={control} render={({ field }) => (
                <Field label="العنوان">
                  <Input {...field} variant="secondary" placeholder="العنوان..." />
                </Field>
              )} />

              {/* Location map */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">الموقع على الخريطة</label>
                <p className="text-xs text-muted -mt-1">ابحث أو انقر على الخريطة لتحديد الموقع</p>
                <Controller name="latitude" control={control} render={({ field: latField }) => (
                  <Controller name="longitude" control={control} render={({ field: lngField }) => {
                    const value: MapPickerValue =
                      latField.value != null && lngField.value != null
                        ? { lat: latField.value, lng: lngField.value }
                        : null
                    return (
                      <MapPicker
                        value={value}
                        onChange={v => { latField.onChange(v?.lat ?? null); lngField.onChange(v?.lng ?? null) }}
                        height={240}
                      />
                    )
                  }} />
                )} />
              </div>

              {/* Phone numbers */}
              <PhoneNumbersField />

              {/* Working days */}
              <WorkingDaysField />
            </FormProvider>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="ghost" onPress={onClose} isDisabled={isLoading}>إلغاء</Button>
            <Button
              variant="primary"
              onPress={() => handleSubmit(onFormSubmit)()}
              isPending={isLoading}
              isDisabled={!nameValue?.trim()}
            >
              {initial ? 'حفظ التعديلات' : 'إضافة'}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
