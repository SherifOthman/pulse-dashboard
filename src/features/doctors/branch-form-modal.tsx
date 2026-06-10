import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, TimeField } from '@heroui/react'
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
import api from '@/services/api'
import { AppSelect } from '@/components/app-select'
import type { GovernorateDto, CityDto, CreateBranchDto, BranchDetails } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateBranchDto) => void
  isLoading?: boolean
  initial?: BranchDetails | null
}

const workingDaySchema = z.object({
  day: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  enabled: z.boolean(),
})

const branchFormSchema = z.object({
  name: z.string().min(1, 'اسم الفرع مطلوب'),
  governorateId: z.string().optional(),
  cityId: z.string().optional(),
  address: z.string().optional(),
  visitPrice: z.string().optional(),
  workingDays: z.array(workingDaySchema),
})

type FormValues = z.infer<typeof branchFormSchema>

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

function mapWorkingDays(days: BranchDetails['workingDays']): FormValues['workingDays'] {
  const map = new Map(days.map((d) => [d.day, d]))
  return defaultWorkingDays.map((def) => {
    const existing = map.get(def.day)
    return existing ? { ...def, enabled: true, startTime: existing.startTime, endTime: existing.endTime } : def
  })
}

export function BranchFormModal({ isOpen, onClose, onSubmit, isLoading, initial }: Props) {
  const { control, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: '',
      governorateId: '',
      cityId: '',
      address: '',
      visitPrice: '',
      workingDays: defaultWorkingDays,
    },
  })

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

  useEffect(() => {
    if (isOpen) {
      if (initial) {
        reset({
          name: initial.name,
          governorateId: initial.governorateId || '',
          cityId: initial.cityId || '',
          address: initial.address || '',
          visitPrice: initial.visitPrice?.toString() || '',
          workingDays: mapWorkingDays(initial.workingDays),
        })
      } else {
        reset({
          name: '',
          governorateId: '',
          cityId: '',
          address: '',
          visitPrice: '',
          workingDays: defaultWorkingDays,
        })
      }
    }
  }, [initial, isOpen, reset])

  const onFormSubmit = (data: FormValues) => {
    const enabledDays = data.workingDays.filter((d) => d.enabled)
    onSubmit({
      name: data.name.trim(),
      cityId: data.cityId || undefined,
      address: data.address?.trim() || undefined,
      visitPrice: data.visitPrice ? parseFloat(data.visitPrice) : undefined,
      workingDays: enabledDays.length > 0 ? enabledDays.map((d) => ({ day: d.day, startTime: d.startTime, endTime: d.endTime })) : undefined,
    })
  }

  const wds = watch('workingDays')

  const toTime = (s: string) => { const [h, m] = s.split(':'); return new Time(+h, +m) }
  const fromTime = (t: Time) => `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <ModalContainer size="lg">
        <ModalDialog>
          <ModalCloseTrigger />
          <ModalHeader>
            <ModalHeading>
              {initial ? 'تعديل الفرع' : 'إضافة فرع جديد'}
            </ModalHeading>
          </ModalHeader>

          <ModalBody
            dir="rtl"
            className="flex flex-col gap-5 overflow-y-auto max-h-[65vh] px-1"
          >
            {/* ── Name ── */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Field label="اسم الفرع" required>
                  <Input {...field} variant="secondary" placeholder="فرع المهندسين" />
                </Field>
              )}
            />

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
                    <Input {...field} variant="secondary" placeholder="عنوان الفرع" />
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
              {initial ? 'حفظ التعديلات' : 'إضافة الفرع'}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </Modal.Backdrop>
  )
}
