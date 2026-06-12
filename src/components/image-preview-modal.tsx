import { X } from 'lucide-react'
import { useEffect } from 'react'

type Props = {
  src: string | null
  alt?: string
  isOpen: boolean
  onClose: () => void
}

/**
 * Full-screen image preview modal.
 * Clicking the backdrop or the X button closes the modal.
 */
export function ImagePreviewModal({ src, alt = 'صورة', isOpen, onClose }: Props) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen || !src) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Image wrapper — stops click from bubbling to backdrop */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt={alt}
          className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
        />

        {/* X button anchored to top-right corner of the image */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm hover:bg-black/90 transition-colors"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
