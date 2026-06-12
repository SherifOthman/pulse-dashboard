import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Breadcrumbs, Button, FieldError, Input, Label, Separator, TextField, toast } from '@heroui/react'
import { Save } from 'lucide-react'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { AppSelect } from '@/components/app-select'
import { MapPicker, type MapPickerValue } from '@/components/map-picker'
import { WorkingDaysField, defaultWorkingDays, mapWorkingDaysToForm, formToWorkingDays } from '@/features/doctors/components/working-days-field'
import { PhoneNumbersField } from '@/features/doctors/components/phone-numbers-field'
import api from '@/services/api'
import type { GovernorateDto, CityDto } from '@/features/cities/types'
import type { BranchDetails, CreateBranchDto } from '@/types/shared'

// ── Schema ─────────────────────────────────────────────────────────────────────

const timeRegex = /^\d{2}:\d{2}$/

const branchFormSchema = z.object({
  name: z.string().min(1, 'اسم الفرع مطلوب').max(100, 'الاسم طويل جداً'),
  governorateId: z.string().min(1, 'المحافظة مطلوبة'),
  cityId: z.string().min(1, 'المدينة مطلوبة'),
  address: z.string().max(500, 'العنوان طويل جداً').optional(),
  visitPrice: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  workingDays: z.array(
    z.object({
      day: z.number(),
      startTime: z.string(),
      endTime: z.string(),
      enabled: z.boolean(),
    }),
  ).refine(
    (days) => days.some((d) => d.enabled),
    { message: 'يجب اختيار يوم عمل واحد على الأقل', path: ['workingDays'] },
  ),
  phoneNumbers: z.array(
    z.object({
      number: z.string().min(1, 'رقم الهاتف مطلوب'),
      type: z.string().optional(),
    }),
  ),
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

type BranchFormValues = z.infer<typeof branchFormSchema>

const defaultValues: BranchFormValues = {
  name: '',
  governorateId: '',
  cityId: '',
  address: '',
  visitPrice: '',
  latitude: null,
  longitude: null,
  workingDays: defaultWorkingDays,
  phoneNumbers: [],
}

function Field({
  label, required, error, isInvalid, children,
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

// ── Props ──────────────────────────────────────────────────────────────────────

type Props = {
  singularLabel: string        // e.g. "صيدلية"
  backRoute: string            // e.g. "/pharmacies"
  showVisitPrice?: boolean
  branchApi: {
    getBranchDetails: (businessId: string, id: string) => Promise<BranchDetails>
    createBranch: (businessId: string, dto: CreateBranchDto) => Promise<{ id: string; name: string }>
    updateBranch: (businessId: string, id: string, dto: Partial<CreateBranchDto>) => Promise<{ id: string; name: string }>
  }
  branchHooks: {
    useCreateBranch: (id: string) => { mutate: (dto: CreateBranchDto, opts?: { onSuccess?: () => void; onError?: () => void }) => void; isPending: boolean }
    useUpdateBranch: (id: string, branchId: string) => { mutate: (dto: Partial<CreateBranchDto>, opts?: { onSuccess?: () => void; onError?: () => void }) => void; isPending: boolean }
  }
  useParentDetails: (id: string | null) => { data?: { name: string }; isLoading: boolean }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function BranchFormPage({
  singularLabel,
  backRoute,
  showVisitPrice = false,
  branchApi,
  branchHooks,
  useParentDetails,
}: Props) {
  const { id: businessId, branchId } = useParams<{ id: string; branchId: string }>()
  const navigate = useNavigate()
  const isEdit = !!branchId

  const { data: parent } = useParentDetails(businessId ?? null)

  // Load existing branch for edit
  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['branch-form', businessId, branchId],
    queryFn: () => branchApi.getBranchDetails(businessId!, branchId!),
    enabled: isEdit && !!businessId && !!branchId,
  })

  const createMut = branchHooks.useCreateBranch(businessId!)
  const updateMut = branchHooks.useUpdateBranch(businessId!, branchId ?? '')
  const isPending = createMut.isPending || updateMut.isPending

  const methods = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues,
    mode: 'all',
  })

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = methods
  const governorateId = watch('governorateId')
  const nameValue = watch('name')

  const { data: governorates = [] } = useQuery<GovernorateDto[]>({
    queryKey: ['governorates'],
    queryFn: async () => (await api.get('/governorates')).data,
  })

  const { data: cities = [] } = useQuery<CityDto[]>({
    queryKey: ['cities-by-gov', governorateId],
    queryFn: async () => (await api.get('/cities', { params: { governorateId } })).data,
    enabled: !!governorateId,
  })

  // Populate form when editing
  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        governorateId: existing.governorateId || '',
        cityId: existing.cityId || '',
        address: existing.address || '',
        visitPrice: existing.visitPrice?.toString() || '',
        latitude: existing.latitude ?? null,
        longitude: existing.longitude ?? null,
        workingDays: mapWorkingDaysToForm(existing.workingDays),
        phoneNumbers: existing.phoneNumbers.map((p) => ({
          number: p.number,
          type: p.type || '',
        })),
      })
    }
  }, [existing, reset])

  const onSubmit = (data: BranchFormValues) => {
    const dto: CreateBranchDto = {
      name: data.name.trim(),
      cityId: data.cityId || undefined,
      address: data.address?.trim() || undefined,
      visitPrice: data.visitPrice ? parseFloat(data.visitPrice) : undefined,
      latitude: data.latitude ?? undefined,
      longitude: data.longitude ?? undefined,
      workingDays: formToWorkingDays(data.workingDays),
      phoneNumbers: data.phoneNumbers
        .filter((p) => p.number.trim())
        .map((p) => ({ number: p.number.trim(), type: p.type?.trim() || null })) || undefined,
    }

    if (isEdit) {
      updateMut.mutate(dto, {
        onSuccess: () => {
          toast.success('تم الحفظ بنجاح')
          navigate(`${backRoute}/${businessId}/branches/${branchId}`)
        },
        onError: () => toast.danger('حدث خطأ أثناء الحفظ'),
      })
    } else {
      createMut.mutate(dto, {
        onSuccess: () => {
          toast.success('تمت إضافة الفرع بنجاح')
          navigate(`${backRoute}/${businessId}/branches`)
        },
        onError: () => toast.danger('حدث خطأ أثناء الإضافة'),
      })
    }
  }

  return (
    <div dir="rtl" className="max-w-3xl mx-auto pb-8">
      {/* ── Breadcrumbs ── */}
      <Breadcrumbs className="mb-4" onAction={(key) => navigate(String(key))}>
        <Breadcrumbs.Item id={backRoute}>{singularLabel}</Breadcrumbs.Item>
        {parent && (
          <Breadcrumbs.Item id={`${backRoute}/${businessId}`}>{parent.name}</Breadcrumbs.Item>
        )}
        <Breadcrumbs.Item id={`${backRoute}/${businessId}/branches`}>الفروع</Breadcrumbs.Item>
        <Breadcrumbs.Item>
          {isEdit ? (loadingExisting ? '...' : existing?.name ?? 'تعديل') : 'فرع جديد'}
        </Breadcrumbs.Item>
      </Breadcrumbs>

      {/* ── Page title ── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">
          {isEdit
            ? loadingExisting ? '...' : `تعديل: ${existing?.name}`
            : 'إضافة فرع جديد'}
        </h1>
      </div>

      <Separator className="mb-6" />

      {/* ── Form ── */}
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit, () => toast.danger('تحقق من البيانات المدخلة'))}
          noValidate
          className="flex flex-col gap-5"
        >
          {/* Name */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Field label="اسم الفرع" required error={errors.name?.message} isInvalid={!!errors.name}>
                <Input {...field} variant="secondary" placeholder="فرع المهندسين" />
              </Field>
            )}
          />

          {/* Governorate + City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="governorateId"
              control={control}
              render={({ field }) => (
                <Field label="المحافظة" required error={errors.governorateId?.message} isInvalid={!!errors.governorateId}>
                  <AppSelect
                    variant="secondary"
                    isInvalid={!!errors.governorateId}
                    options={governorates.map((g) => ({ id: g.id, label: g.name }))}
                    value={field.value || ''}
                    onChange={(val) => { field.onChange(val); setValue('cityId', '') }}
                    placeholder="اختر المحافظة"
                  />
                </Field>
              )}
            />
            <Controller
              name="cityId"
              control={control}
              render={({ field }) => (
                <Field label="المدينة" required error={errors.cityId?.message} isInvalid={!!errors.cityId}>
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

          {/* Address + Visit price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Field label="العنوان" error={errors.address?.message} isInvalid={!!errors.address}>
                  <Input {...field} variant="secondary" placeholder="عنوان الفرع" />
                </Field>
              )}
            />
            {showVisitPrice && (
              <Controller
                name="visitPrice"
                control={control}
                render={({ field }) => (
                  <Field label="سعر الكشف (ج.م)" error={errors.visitPrice?.message} isInvalid={!!errors.visitPrice}>
                    <Input {...field} variant="secondary" type="number" min="0" placeholder="0" />
                  </Field>
                )}
              />
            )}
          </div>

          {/* Phone numbers */}
          <PhoneNumbersField />

          {/* Map */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">الموقع على الخريطة</label>
            <p className="text-xs text-muted -mt-1">انقر على الخريطة أو ابحث لتحديد موقع الفرع</p>
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

          {/* Working days */}
          <div className="[&_[data-slot=checkbox-control]]:border [&_[data-slot=checkbox-control]]:border-divider [&_[data-slot=checkbox-control]]:rounded">
            <WorkingDaysField />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            <Button
              type="submit"
              variant="primary"
              isPending={isPending}
              isDisabled={!nameValue?.trim()}
            >
              <Save className="h-4 w-4" />
              {isEdit ? 'حفظ التعديلات' : 'إضافة الفرع'}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onPress={() => navigate(`${backRoute}/${businessId}/branches`)}
              isDisabled={isPending}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
