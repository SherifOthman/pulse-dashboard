import { useEffect } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input } from '@heroui/react'
import { Modal, ModalContainer, ModalDialog, ModalCloseTrigger, ModalHeader, ModalHeading, ModalBody, ModalFooter } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { AppSelect } from '@/components/app-select'
import type { GovernorateDto, CityDto, CreateCityDto } from './types'

const cityFormSchema = z.object({
  name: z.string().min(1, 'اسم المدينة مطلوب').max(100, 'اسم المدينة طويل جداً'),
  governorateId: z.string().min(1, 'المحافظة مطلوبة'),
})

type CityFormValues = z.infer<typeof cityFormSchema>

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateCityDto) => void
  isLoading?: boolean
  initial?: CityDto | null
}

export function CityFormModal({ isOpen, onClose, onSubmit, isLoading, initial }: Props) {
  const methods = useForm<CityFormValues>({
    resolver: zodResolver(cityFormSchema),
    defaultValues: { name: '', governorateId: '' },
  })

  const { control, handleSubmit, reset, formState: { errors } } = methods

  const { data: governorates = [] } = useQuery<GovernorateDto[]>({
    queryKey: ['governorates'],
    queryFn: async () => (await api.get('/governorates')).data,
  })

  useEffect(() => {
    if (isOpen) {
      if (initial) {
        reset({ name: initial.name || '', governorateId: initial.governorateId || '' })
      } else {
        reset({ name: '', governorateId: '' })
      }
    }
  }, [initial, isOpen, reset])

  const onFormSubmit = (data: CityFormValues) => {
    onSubmit({ name: data.name.trim(), governorateId: data.governorateId })
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <ModalContainer size="sm">
        <ModalDialog>
          <ModalCloseTrigger />
          <ModalHeader>
            <ModalHeading>{initial ? 'تعديل المدينة' : 'إضافة مدينة جديدة'}</ModalHeading>
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <FormProvider {...methods}>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">اسم المدينة *</label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="أدخل اسم المدينة" variant="secondary" autoFocus className="w-full" />
                  )}
                />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">المحافظة *</label>
                <Controller
                  name="governorateId"
                  control={control}
                  render={({ field }) => (
                    <AppSelect
                      variant="secondary"
                      options={governorates.map((g) => ({ id: g.id, label: g.name }))}
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="اختر المحافظة"
                    />
                  )}
                />
                {errors.governorateId && <p className="text-xs text-danger mt-1">{errors.governorateId.message}</p>}
              </div>
            </FormProvider>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onClose} isDisabled={isLoading}>إلغاء</Button>
            <Button variant="primary" onPress={() => handleSubmit(onFormSubmit)()} isPending={isLoading}>
              {initial ? 'حفظ التعديلات' : 'إضافة'}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </Modal.Backdrop>
  )
}
