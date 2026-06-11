import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Breadcrumbs, Separator, toast } from '@heroui/react'
import { Building2, Save } from 'lucide-react'
import { BusinessFormFields } from './business-form-fields'
import {
  businessFormSchema,
  businessFormDefaults,
  type BusinessFormValues,
} from './business-form-schema'
import type { BusinessDetailsDto, CreateBusinessDto } from '@/types/shared'

type UseDetailsResult = {
  data?: BusinessDetailsDto
  isLoading: boolean
}

type UseCreateResult = {
  mutate: (dto: CreateBusinessDto, opts?: { onSuccess?: (result: { id: string }) => void; onError?: () => void }) => void
  isPending: boolean
}

type UseUpdateResult = {
  mutate: (args: { id: string; dto: Partial<CreateBusinessDto> }, opts?: { onSuccess?: () => void; onError?: () => void }) => void
  isPending: boolean
}

function createDto(data: BusinessFormValues) {
  return {
    name: data.name.trim(),
    cityId: data.cityId || undefined,
    description: data.description?.trim() || undefined,
    address: data.address?.trim() || undefined,
    profileImageUrl: data.profileImageUrl || undefined,
    coverImageUrl: data.coverImageUrl || undefined,
    latitude: data.latitude ?? undefined,
    longitude: data.longitude ?? undefined,
    workingDays: data.workingDays.filter((d) => d.enabled).length > 0
      ? data.workingDays.filter((d) => d.enabled).map((d) => ({
          day: d.day,
          startTime: d.startTime,
          endTime: d.endTime,
        }))
      : undefined,
    phoneNumbers:
      data.phoneNumbers.filter((p) => p.number.trim()).map((p) => ({
        number: p.number.trim(),
        type: p.type?.trim() || null,
      })) || undefined,
    services: data.services.length > 0 ? data.services.map((s) => ({
      id: s.id || undefined,
      name: s.name,
    })) : undefined,
  }
}

type Props = {
  useDetails: (id: string | null) => UseDetailsResult
  useCreate: () => UseCreateResult
  useUpdate: () => UseUpdateResult
  singularLabel: string
  backRoute: string
  segment?: string
}

export function BusinessFormPage({ useDetails, useCreate, useUpdate, singularLabel, backRoute, segment }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: existing, isLoading: loadingExisting } = useDetails(isEdit ? id : null)
  const createMutation = useCreate()
  const updateMutation = useUpdate()

  const isPending = createMutation.isPending || updateMutation.isPending

  const methods = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: businessFormDefaults,
    mode: 'onBlur',
  })

  const { handleSubmit, reset, watch } = methods

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        governorateId: existing.governorateId || '',
        cityId: existing.cityId || '',
        description: existing.description || '',
        address: existing.address || '',
        profileImageUrl: existing.profileImageUrl || '',
        coverImageUrl: existing.coverImageUrl || '',
        latitude: existing.latitude ?? null,
        longitude: existing.longitude ?? null,
        workingDays: Array.from({ length: 7 }, (_, i) => {
          const found = existing.workingDays.find((wd) => wd.day === i)
          return found
            ? { day: i, startTime: found.startTime, endTime: found.endTime, enabled: true }
            : { day: i, startTime: '09:00', endTime: '17:00', enabled: false }
        }),
        phoneNumbers: existing.phoneNumbers.map((p) => ({
          number: p.number,
          type: p.type || '',
        })),
        services: existing.services.length > 0
          ? existing.services.map((s) => ({ name: s.name }))
          : [],
      })
    }
  }, [existing, reset])

  const onSubmit = (data: BusinessFormValues) => {
    const dto = createDto(data)

    if (isEdit) {
      updateMutation.mutate(
        { id: id!, dto },
        {
          onSuccess: () => {
            toast.success('تم الحفظ بنجاح')
            navigate(`${backRoute}/${id}`)
          },
          onError: () => toast.danger('حدث خطأ، تحقق من البيانات'),
        },
      )
    } else {
      createMutation.mutate(dto, {
        onSuccess: (result) => {
          toast.success('تمت الإضافة بنجاح')
          navigate(`${backRoute}/${result.id}`)
        },
        onError: () => toast.danger('حدث خطأ، تحقق من البيانات'),
      })
    }
  }

  const nameValue = watch('name')

  return (
    <div dir="rtl" className="max-w-3xl mx-auto pb-8 doctor-form-scroll-root">
      {/* ── Breadcrumbs ── */}
      <Breadcrumbs className="mb-4" onAction={(key) => navigate(String(key))}>
        <Breadcrumbs.Item id={backRoute}>{singularLabel}</Breadcrumbs.Item>
        {isEdit && existing ? (
          <Breadcrumbs.Item id={`${backRoute}/${id}`}>{existing.name}</Breadcrumbs.Item>
        ) : null}
        <Breadcrumbs.Item>{isEdit ? 'تعديل' : `إضافة ${singularLabel}`}</Breadcrumbs.Item>
      </Breadcrumbs>

      {/* ── Page title ── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">
          {isEdit
            ? loadingExisting
              ? '...'
              : `تعديل: ${existing?.name}`
            : `إضافة ${singularLabel} جديد`}
        </h1>
      </div>

      {isEdit && id && (
        <div className="flex justify-start mb-4">
          <Button
            variant="secondary"
            size="sm"
            onPress={() => navigate(`${backRoute}/${id}/branches`)}
          >
            <Building2 className="h-4 w-4" />
            إدارة الفروع
          </Button>
        </div>
      )}

      <Separator className="mb-6" />

      {/* ── Form ── */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <BusinessFormFields singularLabel={singularLabel} segment={segment} />

          {/* ── Actions ── */}
          <div className="flex items-center gap-3 mt-6 mb-2">
            <Button
              type="submit"
              variant="primary"
              isPending={isPending}
              isDisabled={!nameValue?.trim()}
            >
              <Save className="h-4 w-4" />
              {isEdit ? 'حفظ التعديلات' : `إضافة ${singularLabel}`}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onPress={() => navigate(isEdit ? `${backRoute}/${id}` : backRoute)}
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
