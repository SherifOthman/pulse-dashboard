import { Modal } from '@heroui/react'
import { X } from 'lucide-react'

type Props = {
  src: string | null
  alt?: string
  isOpen: boolean
  onClose: () => void
}

/**
 * Full-screen image preview modal.
 * Clicking the backdrop or the X button closes the modal.
 * Backdrop dismiss and ESC key are enabled by default.
 */
export function ImagePreviewModal({ src, alt = 'صورة', isOpen, onClose }: Props) {
  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => { if (!open) onClose() }}
      variant="blur"
    >
      <Modal.Container size="cover" placement="center">
        <Modal.Dialog
          className="bg-transparent shadow-none border-none p-0 flex items-center justify-center overflow-visible w-full h-full"
          aria-label={alt}
        >
          {({ close }) => (
            /* Outer div covers full container — clicking it closes the modal */
            <div className="w-full h-full flex items-center justify-center" onClick={close}>
              {/* Inner wrapper stops click bubbling so clicking the image doesn't close */}
              <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                {src && (
                  <img
                    src={src}
                    alt={alt}
                    className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
                  />
                )}

                {/* X button anchored to top-right corner of the image */}
                <button
                  type="button"
                  onClick={close}
                  className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm hover:bg-black/90 transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
