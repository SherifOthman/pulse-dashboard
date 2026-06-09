import {
  Button,
  Modal,
  ModalBody,
  ModalCloseTrigger,
  ModalContainer,
  ModalDialog,
  ModalFooter,
  ModalHeader,
  ModalHeading,
} from "@heroui/react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
  title?: string;
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  message,
  title = "تأكيد الحذف",
}: Props) {
  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <ModalContainer size="sm">
        <ModalDialog>
          <ModalCloseTrigger />
          <ModalHeader>
            <ModalHeading>{title}</ModalHeading>
          </ModalHeader>
          <ModalBody>
            <p className="text-muted">
              {message || "هل أنت متأكد من هذا الإجراء؟"}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onClose}>
              إلغاء
            </Button>
            <Button variant="danger" onPress={onConfirm}>
              حذف
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </Modal.Backdrop>
  );
}
