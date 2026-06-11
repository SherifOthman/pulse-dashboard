import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input } from '@heroui/react'
import { Modal, ModalContainer, ModalDialog, ModalCloseTrigger, ModalHeader, ModalHeading, ModalBody, ModalFooter } from '@heroui/react'
import type { SpecializationDto, CreateSpecializationDto } from './types'

const specializationFormSchema = z.object({
  name: z.string().min(1, 'اسم التخصص مطلوب').max(100, 'اسم التخصص طويل جداً'),
})

type SpecializationFormValues = z.infer<typeof specializationFormSchema>

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateSpecializationDto) => void
  isLoading?: boolean
  initial?: SpecializationDto | null
}

export function SpecializationFormModal({ isOpen, onClose, onSubmit, isLoading, initial }: Props) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<SpecializationFormValues>({
    resolver: zodResolver(specializationFormSchema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (isOpen) {
      reset({ name: initial?.name || '' })
    }
  }, [initial, isOpen, reset])

  const onFormSubmit = (data: SpecializationFormValues) => {
    onSubmit({ name: data.name.trim() })
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <ModalContainer size="sm">
        <ModalDialog>
          <ModalCloseTrigger />
          <ModalHeader>
            <ModalHeading>{initial ? 'تعديل التخصص' : 'إضافة تخصص جديد'}</ModalHeading>
          </ModalHeader>
          <ModalBody>
            <label className="text-sm font-medium text-foreground mb-1.5 block">اسم التخصص *</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="مثل: أمراض القلب، طب الأطفال"
                  variant="secondary"
                  autoFocus
                  className="w-full"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(onFormSubmit)() }}
                />
              )}
            />
            {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
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
