import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, TextArea, TimeField } from '@heroui/react'
import {
  Modal,
  ModalContainer,
  ModalDialog,
  ModalCloseTrigger,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalFooter,
} from '@heroui/react'
import { Time } from '@internationalized/date'
import { useQuery } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import api from '@/services/api'
import { AppSelect } from '@/components/app-select'
import { ImageUploadField } from '@/components/image-upload-field'
import type {
  GovernorateDto,
  SpecializationDto,
  CityDto,
  DoctorDto,
  CreateDoctorDto,
} from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateDoctorDto) => void
  isLoading?: boolean
  initial?: DoctorDto | null
}

const workingDaySchema = z.object({
  day: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  enabled: z.boolean(),
})

const branchSchema = z.object({
  name: z.string().min(1, 'اسم الفرع مطلوب'),
  address: z.string().optional(),
})

const doctorFormSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  specializationId: z.string().optional(),
  governorateId: z.string().optional(),
  cityId: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  visitPrice: z.string().optional(),
  gender: z.string().optional(),
  profileImageUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  workingDays: z.array(workingDaySchema),
  branches: z.array(branchSchema),
})

type FormValues = z.infer<typeof doctorFormSchema>

const defaultWorkingDays: FormValues['workingDays'] = Array.from({ length: 7 }, (_, i) => ({
  day: i,
  startTime: '09:00',
  endTime: '17:00',
  enabled: false,
}))

const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-danger ms-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export function DoctorFormModal({ isOpen, onClose, onSubmit, isLoading, initial }: Props) {
  const { control, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
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
      workingDays: defaultWorkingDays,
      branches: [],
    },
  })

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

  useEffect(() => {
    if (isOpen) {
      if (initial) {
        reset({
          name: initial.name || '',
          specializationId: '',
          governorateId: initial.governorateId || '',
          cityId: initial.cityId || '',
          description: initial.description || '',
          address: initial.address || '',
          visitPrice: initial.visitPrice?.toString() || '',
          gender: initial.gender || '',
          profileImageUrl: initial.profileImageUrl || '',
          coverImageUrl: '',
          workingDays: defaultWorkingDays,
          branches: [],
        })
      } else {
        reset({
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
          workingDays: defaultWorkingDays,
          branches: [],
        })
      }
    }
  }, [initial, isOpen, reset])

  const onFormSubmit = (data: FormValues) => {
    const enabledDays = data.workingDays.filter((d) => d.enabled)
    onSubmit({
      name: data.name.trim(),
      specializationId: data.specializationId || undefined,
      cityId: data.cityId || undefined,
      description: data.description?.trim() || undefined,
      address: data.address?.trim() || undefined,
      visitPrice: data.visitPrice ? parseFloat(data.visitPrice) : undefined,
      gender: data.gender || undefined,
      profileImageUrl: data.profileImageUrl || undefined,
      coverImageUrl: data.coverImageUrl || undefined,
      workingDays: enabledDays.length > 0 ? enabledDays.map((d) => ({ day: d.day, startTime: d.startTime, endTime: d.endTime })) : undefined,
      branches: data.branches.length > 0 ? data.branches.map((b) => ({ name: b.name, address: b.address })) : undefined,
    })
  }

  const wds = watch('workingDays')
  const branches = watch('branches')

  const toTime = (s: string) => { const [h, m] = s.split(':'); return new Time(+h, +m) }
  const fromTime = (t: Time) => `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <ModalContainer size="lg">
        <ModalDialog>
          <ModalCloseTrigger />
          <ModalHeader>
            <ModalHeading>
              {initial ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد'}
            </ModalHeading>
          </ModalHeader>

          <ModalBody
            dir="rtl"
            className="flex flex-col gap-5 overflow-y-auto max-h-[65vh] px-1"
          >
            {/* ── Images row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="profileImageUrl"
                control={control}
                render={({ field }) => (
                  <ImageUploadField
                    currentUrl={field.value || null}
                    onUrlChange={(url) => field.onChange(url || '')}
                    label="الصورة الشخصية"
                    aspectRatio="square"
                  />
                )}
              />
              <Controller
                name="coverImageUrl"
                control={control}
                render={({ field }) => (
                  <ImageUploadField
                    currentUrl={field.value || null}
                    onUrlChange={(url) => field.onChange(url || '')}
                    label="صورة الغلاف"
                    aspectRatio="cover"
                  />
                )}
              />
            </div>

            {/* ── Name ── */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Field label="الاسم" required>
                  <Input {...field} variant="secondary" placeholder="د. محمد أحمد" />
                </Field>
              )}
            />

            {/* ── Description ── */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Field label="الوصف">
                  <TextArea {...field} placeholder="نبذة عن الطبيب وخبراته..." rows={4} variant="secondary" />
                </Field>
              )}
            />

            {/* ── Specialization + Gender ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="specializationId"
                control={control}
                render={({ field }) => (
                  <Field label="التخصص">
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
                  <Field label="الجنس">
                    <AppSelect
                      variant="secondary"
                      options={[{ id: 'Male', label: 'ذكر' }, { id: 'Female', label: 'أنثى' }]}
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
                  <Field label="المحافظة">
                    <AppSelect
                      variant="secondary"
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
                  <Field label="المدينة">
                    <AppSelect
                      variant="secondary"
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
                  <Field label="سعر الكشف (ج.م)">
                    <Input {...field} variant="secondary" type="number" placeholder="0" />
                  </Field>
                )}
              />
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <Field label="العنوان">
                    <Input {...field} variant="secondary" placeholder="عنوان العيادة" />
                  </Field>
                )}
              />
            </div>

            {/* ── Working days ── */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">أيام العمل</label>
              <div className="flex flex-col gap-2">
                {wds.map((wd, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border px-3 py-2 transition-colors ${wd.enabled ? 'border-divider bg-surface' : 'border-dashed border-divider bg-transparent'}`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="checkbox"
                          checked={wd.enabled}
                          onChange={(e) => setValue(`workingDays.${i}.enabled`, e.target.checked, { shouldDirty: true })}
                          className="h-4 w-4 accent-primary rounded"
                        />
                        <span className="text-sm text-foreground min-w-14">{DAY_NAMES[i]}</span>
                      </div>
                      {wd.enabled && (
                        <div className="flex items-center gap-1 flex-1 min-w-0" dir="ltr">
                          <TimeField
                            value={toTime(wd.startTime)}
                            onChange={(t: Time | null) =>
                              t && setValue(`workingDays.${i}.startTime`, fromTime(t), { shouldDirty: true })
                            }
                            className="flex-1"
                          >
                            <TimeField.Group variant="secondary" className="w-full">
                              <TimeField.Input>
                                {(segment) => <TimeField.Segment segment={segment} />}
                              </TimeField.Input>
                            </TimeField.Group>
                          </TimeField>
                          <span className="text-muted shrink-0">–</span>
                          <TimeField
                            value={toTime(wd.endTime)}
                            onChange={(t: Time | null) =>
                              t && setValue(`workingDays.${i}.endTime`, fromTime(t), { shouldDirty: true })
                            }
                            className="flex-1"
                          >
                            <TimeField.Group variant="secondary" className="w-full">
                              <TimeField.Input>
                                {(segment) => <TimeField.Segment segment={segment} />}
                              </TimeField.Input>
                            </TimeField.Group>
                          </TimeField>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Branches ── */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">الفروع</label>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => setValue('branches', [...branches, { name: '', address: '' }], { shouldDirty: true })}
                >
                  <Plus className="h-4 w-4" />
                  إضافة فرع
                </Button>
              </div>
              {branches.map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-divider bg-surface px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Controller
                        name={`branches.${i}.name`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <div className="flex flex-col gap-1">
                            <Input {...field} variant="secondary" placeholder="اسم الفرع" />
                            {fieldState.error && (
                              <span className="text-xs text-danger">{fieldState.error.message}</span>
                            )}
                          </div>
                        )}
                      />
                      <Controller
                        name={`branches.${i}.address`}
                        control={control}
                        render={({ field }) => (
                          <Input {...field} variant="secondary" placeholder="عنوان الفرع" />
                        )}
                      />
                    </div>
                    <Button
                      variant="danger-soft"
                      size="sm"
                      isIconOnly
                      onPress={() => {
                        const next = branches.filter((_, j) => j !== i)
                        setValue('branches', next, { shouldDirty: true })
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onPress={onClose} isDisabled={isLoading}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              onPress={() => handleSubmit(onFormSubmit)()}
              isPending={isLoading}
              isDisabled={!watch('name')?.trim()}
            >
              {initial ? 'حفظ التعديلات' : 'إضافة الطبيب'}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </Modal.Backdrop>
  )
}
