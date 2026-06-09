import { useState, useEffect } from 'react'
import { Button, Input } from '@heroui/react'
import { Modal, ModalBackdrop, ModalContainer, ModalDialog, ModalCloseTrigger, ModalHeader, ModalHeading, ModalBody, ModalFooter } from '@heroui/react'
import { Select, SelectTrigger, SelectValue, SelectIndicator, SelectPopover, ListBox, ListBoxItem } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { ImageUploadField } from '@/components/image-upload-field'
import type { GovernorateDto, CityDto, LabDto, CreateLabDto } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateLabDto) => void
  isLoading?: boolean
  initial?: LabDto | null
}

export function LabFormModal({ isOpen, onClose, onSubmit, isLoading, initial }: Props) {
  const [name, setName] = useState('')
  const [governorateId, setGovernorateId] = useState('')
  const [cityId, setCityId] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)

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
    if (initial) {
      setName(initial.name || '')
      setProfileImageUrl(initial.profileImageUrl || null)
    } else {
      setName(''); setGovernorateId(''); setCityId(''); setDescription(''); setAddress(''); setProfileImageUrl(null); setCoverImageUrl(null)
    }
  }, [initial, isOpen])

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      cityId,
      description: description.trim() || undefined,
      address: address.trim() || undefined,
      profileImageUrl: profileImageUrl ?? undefined,
      coverImageUrl: coverImageUrl ?? undefined,
    })
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <ModalContainer size="md">
        <ModalDialog>
          <ModalCloseTrigger />
          <ModalHeader>
            <ModalHeading>{initial ? 'تعديل المختبر' : 'إضافة مختبر جديد'}</ModalHeading>
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">الاسم *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم المختبر" className="w-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ImageUploadField currentUrl={profileImageUrl} onUrlChange={setProfileImageUrl} label="الصورة الشخصية" />
              <ImageUploadField currentUrl={coverImageUrl} onUrlChange={setCoverImageUrl} label="صورة الغلاف" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">المحافظة</label>
              <Select
                placeholder="اختر المحافظة"
                selectedKey={governorateId || null}
                onSelectionChange={(key) => { setGovernorateId(key as string); setCityId('') }}
               
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
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">المدينة</label>
              <Select
                placeholder="اختر المدينة"
                selectedKey={cityId || null}
                onSelectionChange={(key) => setCityId(key as string)}
                isDisabled={!governorateId}
               
              >
                <SelectTrigger>
                  <SelectValue />
                  <SelectIndicator />
                </SelectTrigger>
                <SelectPopover>
                  <ListBox>
                    {cities.map((c) => <ListBoxItem key={c.id} id={c.id}>{c.name}</ListBoxItem>)}
                  </ListBox>
                </SelectPopover>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">العنوان</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="عنوان المختبر" className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">الوصف</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف المختبر" className="w-full" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onClose} isDisabled={isLoading}>إلغاء</Button>
            <Button color="primary" onPress={handleSubmit} isLoading={isLoading}>
              {initial ? 'حفظ التعديلات' : 'إضافة'}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </Modal.Backdrop>
  )
}
