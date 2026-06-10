import { Button, Modal } from '@heroui/react'
import { AlertTriangle } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  message?: string
  title?: string
  isPending?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  message,
  title = 'تأكيد الحذف',
  isPending,
}: Props) {
  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Container size="sm">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Icon className="bg-danger/10 text-danger">
              <AlertTriangle className="size-5" />
            </Modal.Icon>
            <Modal.Heading>{title}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-sm text-muted">
              {message ?? 'هل أنت متأكد من هذا الإجراء؟'}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onPress={onClose} isDisabled={isPending}>
              إلغاء
            </Button>
            <Button variant="danger" onPress={onConfirm} isPending={isPending}>
              تأكيد
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
