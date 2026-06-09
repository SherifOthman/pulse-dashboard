import { Button } from '@heroui/react'
import { Modal, ModalBackdrop, ModalContainer, ModalDialog, ModalCloseTrigger, ModalHeader, ModalHeading, ModalBody, ModalFooter } from '@heroui/react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  message?: string
  title?: string
}

export function ConfirmModal({ isOpen, onClose, onConfirm, isLoading, message, title = 'تأكيد الحذف' }: Props) {
  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <ModalContainer size="sm">
        <ModalDialog>
          <ModalCloseTrigger />
          <ModalHeader>
            <ModalHeading>{title}</ModalHeading>
          </ModalHeader>
          <ModalBody>
            <p className="text-muted">{message || 'هل أنت متأكد من هذا الإجراء؟'}</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onClose} isDisabled={isLoading}>إلغاء</Button>
            <Button color="danger" onPress={onConfirm} isLoading={isLoading}>حذف</Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </Modal.Backdrop>
  )
}
