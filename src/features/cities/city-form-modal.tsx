import { useState, useEffect } from 'react'
import { Button, Input } from '@heroui/react'
import { Modal, ModalContainer, ModalDialog, ModalCloseTrigger, ModalHeader, ModalHeading, ModalBody, ModalFooter } from '@heroui/react'
import { Select, SelectTrigger, SelectValue, SelectIndicator, SelectPopover, ListBox, ListBoxItem } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import type { GovernorateDto, CityDto, CreateCityDto } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateCityDto) => void
  isLoading?: boolean
  initial?: CityDto | null
}

export function CityFormModal({ isOpen, onClose, onSubmit, isLoading, initial }: Props) {
  const [name, setName] = useState('')
  const [governorateId, setGovernorateId] = useState('')

  const { data: governorates = [] } = useQuery<GovernorateDto[]>({
    queryKey: ['governorates'],
    queryFn: async () => (await api.get('/governorates')).data,
  })

  useEffect(() => {
    if (initial) {
      setName(initial.name || '')
      setGovernorateId(initial.governorateId || '')
    } else {
      setName('')
      setGovernorateId('')
    }
  }, [initial, isOpen])

  const handleSubmit = () => {
    if (!name.trim() || !governorateId) return
    onSubmit({ name: name.trim(), governorateId })
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
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">اسم المدينة *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسم المدينة" autoFocus className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">المحافظة *</label>
              <Select
                placeholder="اختر المحافظة"
                value={governorateId || null}
                onChange={(key) => setGovernorateId(key as string)}
               
              >
                <SelectTrigger>
                  <SelectValue />
                  <SelectIndicator />
                </SelectTrigger>
                <SelectPopover>
                  <ListBox>
                    {governorates.map((g) => <ListBoxItem key={g.id} id={g.id}>{g.name}</ListBoxItem>)}
                  </ListBox>
                </SelectPopover>
              </Select>
            </div>
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
