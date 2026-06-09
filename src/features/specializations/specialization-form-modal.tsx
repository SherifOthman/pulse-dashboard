import { useState, useEffect } from 'react'
import { Button, Input } from '@heroui/react'
import { Modal, ModalContainer, ModalDialog, ModalCloseTrigger, ModalHeader, ModalHeading, ModalBody, ModalFooter } from '@heroui/react'
import type { SpecializationDto, CreateSpecializationDto } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateSpecializationDto) => void
  isLoading?: boolean
  initial?: SpecializationDto | null
}

export function SpecializationFormModal({ isOpen, onClose, onSubmit, isLoading, initial }: Props) {
  const [name, setName] = useState('')

  useEffect(() => {
    setName(initial?.name || '')
  }, [initial, isOpen])

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit({ name: name.trim() })
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
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثل: أمراض القلب، طب الأطفال..."
             
              autoFocus
              className="w-full"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onClose} isDisabled={isLoading}>إلغاء</Button>
            <Button variant="primary" onPress={handleSubmit} isPending={isLoading}>
              {initial ? 'حفظ التعديلات' : 'إضافة'}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </Modal.Backdrop>
  )
}
