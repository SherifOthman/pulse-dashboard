import { useState, useEffect } from 'react'
import { Button, Input } from '@heroui/react'
import { Modal, ModalContainer, ModalDialog, ModalCloseTrigger, ModalHeader, ModalHeading, ModalBody, ModalFooter } from '@heroui/react'
import { AppSelect } from '@/components/app-select'
import type { DashboardUser, CreateDashboardUserDto } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateDashboardUserDto) => void
  isLoading?: boolean
  initial?: DashboardUser | null
}

export function UserFormModal({ isOpen, onClose, onSubmit, isLoading, initial }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('')

  useEffect(() => {
    if (initial) {
      setEmail(initial.email || '')
      setFullName(initial.fullName || '')
      setRole(initial.role || 'Manager')
      setPassword('')
    } else {
      setEmail('')
      setPassword('')
      setFullName('')
      setRole('')
    }
  }, [initial, isOpen])

  const handleSubmit = () => {
    if (!email.trim() || !fullName.trim()) return
    if (!initial && !password.trim()) return
    onSubmit({
      email: email.trim(),
      password: password || undefined,
      fullName: fullName.trim(),
      role: role || undefined,
    })
  }

  const roleOptions = [
    { id: 'Admin', label: 'Admin' },
    { id: 'Manager', label: 'Manager' },
  ]

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <ModalContainer size="lg">
        <ModalDialog>
          <ModalCloseTrigger />
          <ModalHeader>
            <ModalHeading>{initial ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</ModalHeading>
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">الاسم الكامل *</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم الكامل" className="w-full" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">البريد الإلكتروني *</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@pulse.com" className="w-full" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {initial ? 'كلمة المرور (اتركه فارغاً إذا لم ترد التغيير)' : 'كلمة المرور *'}
              </label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">الصلاحية</label>
              <AppSelect
                options={roleOptions}
                value={role}
                onChange={setRole}
                placeholder="اختر الصلاحية"
                className="w-full"
              />
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
