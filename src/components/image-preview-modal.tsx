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
 * Always rendered in the DOM so HeroUI can animate open/close correctly.
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
          className="bg-transparent shadow-none border-none p-0 flex items-center justify-center"
          aria-label={alt}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>

          {src && (
            <img
              src={src}
              alt={alt}
              className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
