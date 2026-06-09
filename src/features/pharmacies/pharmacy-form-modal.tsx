import { useState, useEffect } from 'react'
import { Button, Input } from '@heroui/react'
import { Modal, ModalBackdrop, ModalContainer, ModalDialog, ModalCloseTrigger, ModalHeader, ModalHeading, ModalBody, ModalFooter } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { AppSelect } from '@/components/app-select'
import { ImageUploadField } from '@/components/image-upload-field'
import type { GovernorateDto, CityDto, PharmacyDto, CreatePharmacyDto } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreatePharmacyDto) => void
  isLoading?: boolean
  initial?: PharmacyDto | null
}

export function PharmacyFormModal({ isOpen, onClose, onSubmit, isLoading, initial }: Props) {
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
            <ModalHeading>{initial ? 'تعديل الصيدلية' : 'إضافة صيدلية جديدة'}</ModalHeading>
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">الاسم *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم الصيدلية" className="w-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ImageUploadField currentUrl={profileImageUrl} onUrlChange={setProfileImageUrl} label="الصورة الشخصية" />
              <ImageUploadField currentUrl={coverImageUrl} onUrlChange={setCoverImageUrl} label="صورة الغلاف" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">المحافظة</label>
              <AppSelect
                options={governorates.map((g) => ({ id: g.id, label: g.name }))}
                selectedKey={governorateId}
                onSelectionChange={(val) => { setGovernorateId(val); setCityId('') }}
                placeholder="اختر المحافظة"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">المدينة</label>
              <AppSelect
                options={cities.map((c) => ({ id: c.id, label: c.name }))}
                selectedKey={cityId}
                onSelectionChange={setCityId}
                placeholder="اختر المدينة"
                isDisabled={!governorateId}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">العنوان</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="عنوان الصيدلية" className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">الوصف</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف الصيدلية" className="w-full" />
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
