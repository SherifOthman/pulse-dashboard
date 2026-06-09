import { useState, useEffect } from 'react'
import { Button, Input } from '@heroui/react'
import { Modal, ModalContainer, ModalDialog, ModalCloseTrigger, ModalHeader, ModalHeading, ModalBody, ModalFooter } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { AppSelect } from '@/components/app-select'
import { ImageUploadField } from '@/components/image-upload-field'
import type { GovernorateDto, SpecializationDto, CityDto, DoctorDto, CreateDoctorDto } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateDoctorDto) => void
  isLoading?: boolean
  initial?: DoctorDto | null
}

export function DoctorFormModal({ isOpen, onClose, onSubmit, isLoading, initial }: Props) {
  const [name, setName] = useState('')
  const [specializationId, setSpecializationId] = useState('')
  const [governorateId, setGovernorateId] = useState('')
  const [cityId, setCityId] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [visitPrice, setVisitPrice] = useState('')
  const [gender, setGender] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)

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
    if (initial) {
      setName(initial.name || '')
      setVisitPrice(initial.visitPrice?.toString() || '')
      setProfileImageUrl(initial.profileImageUrl || null)
    } else {
      setName('')
      setSpecializationId('')
      setGovernorateId('')
      setCityId('')
      setDescription('')
      setAddress('')
      setVisitPrice('')
      setGender('')
      setProfileImageUrl(null)
      setCoverImageUrl(null)
    }
  }, [initial, isOpen])

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      specializationId,
      cityId,
      description: description.trim() || undefined,
      address: address.trim() || undefined,
      visitPrice: visitPrice ? parseFloat(visitPrice) : undefined,
      gender: gender || undefined,
      profileImageUrl: profileImageUrl ?? undefined,
      coverImageUrl: coverImageUrl ?? undefined,
    })
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <ModalContainer size="lg">
        <ModalDialog>
          <ModalCloseTrigger />
          <ModalHeader>
            <ModalHeading>{initial ? 'تعديل الطبيب' : 'إضافة طبيب جديد'}</ModalHeading>
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">الاسم *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم الطبيب" className="w-full" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ImageUploadField currentUrl={profileImageUrl} onUrlChange={setProfileImageUrl} label="الصورة الشخصية" />
              <ImageUploadField currentUrl={coverImageUrl} onUrlChange={setCoverImageUrl} label="صورة الغلاف" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">التخصص</label>
              <AppSelect
                options={specializations.map((s) => ({ id: s.id, label: s.name }))}
                value={specializationId}
                onChange={setSpecializationId}
                placeholder="اختر التخصص"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">المحافظة</label>
              <AppSelect
                options={governorates.map((g) => ({ id: g.id, label: g.name }))}
                value={governorateId}
                onChange={(val) => { setGovernorateId(val); setCityId('') }}
                placeholder="اختر المحافظة"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">المدينة</label>
              <AppSelect
                options={cities.map((c) => ({ id: c.id, label: c.name }))}
                value={cityId}
                onChange={setCityId}
                placeholder="اختر المدينة"
                isDisabled={!governorateId}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">الجنس</label>
              <AppSelect
                options={[{ id: 'Male', label: 'ذكر' }, { id: 'Female', label: 'أنثى' }]}
                value={gender}
                onChange={setGender}
                placeholder="اختر الجنس"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">سعر الكشف (ج.م)</label>
              <Input type="number" value={visitPrice} onChange={(e) => setVisitPrice(e.target.value)} placeholder="0" className="w-full" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">العنوان</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="عنوان العيادة" className="w-full" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">الوصف</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="نبذة عن الطبيب" className="w-full" />
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
