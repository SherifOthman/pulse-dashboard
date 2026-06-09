import { useState, useEffect } from 'react'
import { Button, Input } from '@heroui/react'
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
import { useQuery } from '@tanstack/react-query'
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

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
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

export function DoctorFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initial,
}: Props) {
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
    queryFn: async () =>
      (await api.get('/cities', { params: { governorateId } })).data,
    enabled: !!governorateId,
  })

  useEffect(() => {
    if (isOpen) {
      if (initial) {
        setName(initial.name || '')
        setSpecializationId('')
        setGovernorateId(initial.governorateId || '')
        setCityId(initial.cityId || '')
        setDescription(initial.description || '')
        setAddress(initial.address || '')
        setVisitPrice(initial.visitPrice?.toString() || '')
        setGender(initial.gender || '')
        setProfileImageUrl(initial.profileImageUrl || null)
        setCoverImageUrl(null)
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
    }
  }, [initial, isOpen])

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      specializationId: specializationId || undefined,
      cityId: cityId || undefined,
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
            <ModalHeading>
              {initial ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد'}
            </ModalHeading>
          </ModalHeader>

          <ModalBody
            dir="rtl"
            className="flex flex-col gap-5 overflow-y-auto max-h-[65vh] px-1"
          >
            {/* ── Images row ── */}
            <div className="grid grid-cols-2 gap-4">
              <ImageUploadField
                currentUrl={profileImageUrl}
                onUrlChange={setProfileImageUrl}
                label="الصورة الشخصية"
                aspectRatio="square"
              />
              <ImageUploadField
                currentUrl={coverImageUrl}
                onUrlChange={setCoverImageUrl}
                label="صورة الغلاف"
                aspectRatio="cover"
              />
            </div>

            {/* ── Name (full width) ── */}
            <Field label="الاسم" required>
              <Input
                variant="secondary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="د. محمد أحمد"
                className="w-full"
              />
            </Field>

            {/* ── Specialization + Gender ── */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="التخصص">
                <AppSelect
                  options={specializations.map((s) => ({
                    id: s.id,
                    label: s.name,
                  }))}
                  value={specializationId}
                  onChange={setSpecializationId}
                  placeholder="اختر التخصص"
                  className="w-full"
                />
              </Field>
              <Field label="الجنس">
                <AppSelect
                  options={[
                    { id: 'Male', label: 'ذكر' },
                    { id: 'Female', label: 'أنثى' },
                  ]}
                  value={gender}
                  onChange={setGender}
                  placeholder="اختر الجنس"
                  className="w-full"
                />
              </Field>
            </div>

            {/* ── Governorate + City ── */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="المحافظة">
                <AppSelect
                  options={governorates.map((g) => ({
                    id: g.id,
                    label: g.name,
                  }))}
                  value={governorateId}
                  onChange={(val) => {
                    setGovernorateId(val)
                    setCityId('')
                  }}
                  placeholder="اختر المحافظة"
                  className="w-full"
                />
              </Field>
              <Field label="المدينة">
                <AppSelect
                  options={cities.map((c) => ({ id: c.id, label: c.name }))}
                  value={cityId}
                  onChange={setCityId}
                  placeholder="اختر المدينة"
                  isDisabled={!governorateId}
                  className="w-full"
                />
              </Field>
            </div>

            {/* ── Visit price + Address ── */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="سعر الكشف (ج.م)">
                <Input
                  variant="secondary"
                  type="number"
                  value={visitPrice}
                  onChange={(e) => setVisitPrice(e.target.value)}
                  placeholder="0"
                  className="w-full"
                />
              </Field>
              <Field label="العنوان">
                <Input
                  variant="secondary"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="عنوان العيادة"
                  className="w-full"
                />
              </Field>
            </div>

            {/* ── Description ── */}
            <Field label="الوصف">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="نبذة عن الطبيب وخبراته..."
                rows={4}
                className="input w-full resize-none rounded-field border border-divider bg-field px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </Field>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onPress={onClose} isDisabled={isLoading}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              onPress={handleSubmit}
              isPending={isLoading}
              isDisabled={!name.trim()}
            >
              {initial ? 'حفظ التعديلات' : 'إضافة الطبيب'}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </Modal.Backdrop>
  )
}
