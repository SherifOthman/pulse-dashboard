import { useState } from 'react'
import { Button, Input, toast } from '@heroui/react'
import { Modal, ModalBackdrop, ModalContainer, ModalDialog, ModalCloseTrigger, ModalHeader, ModalHeading, ModalBody, ModalFooter } from '@heroui/react'
import api from '@/services/api'
import { AxiosError } from 'axios'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export function ChangePasswordModal({ isOpen, onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword) return
    if (newPassword !== confirmPassword) {
      toast.danger('كلمة المرور الجديدة وتأكيدها غير متطابقين')
      return
    }
    setLoading(true)
    try {
      await api.post('/users/me/change-password', { currentPassword, newPassword })
      toast.success('تم تغيير كلمة المرور بنجاح')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onClose()
    } catch (err) {
      const axiosErr = err instanceof AxiosError ? err : null
      const message = axiosErr?.response?.data?.message || axiosErr?.response?.data?.title
      toast.danger(message || 'حدث خطأ أثناء تغيير كلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <ModalContainer size="sm">
        <ModalDialog>
          <ModalCloseTrigger />
          <ModalHeader>
            <ModalHeading>تغيير كلمة المرور</ModalHeading>
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">كلمة المرور الحالية *</label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">كلمة المرور الجديدة *</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">تأكيد كلمة المرور الجديدة *</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onClose} isDisabled={loading}>إلغاء</Button>
            <Button color="primary" onPress={handleSubmit} isLoading={loading}>تغيير كلمة المرور</Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </Modal.Backdrop>
  )
}
