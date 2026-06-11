import { useRef, useState } from 'react'
import { toast } from '@heroui/react'
import { Upload, X } from 'lucide-react'
import api from '@/services/api'
import { toAbsoluteUrl } from '@/services/image-url'

type Props = {
  currentUrl: string | null
  onUrlChange: (url: string | null) => void
  label: string
  aspectRatio?: 'square' | 'cover'
}

export function ImageUploadField({
  currentUrl,
  onUrlChange,
  label,
  aspectRatio = 'square',
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isSquare = aspectRatio === 'square'
  const containerClass = isSquare
    ? 'h-24 w-24'
    : 'h-24 w-full'

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/upload', formData)
      URL.revokeObjectURL(localPreview)
      setPreviewUrl(null)
      onUrlChange(data.url as string)
    } catch {
      URL.revokeObjectURL(localPreview)
      setPreviewUrl(null)
      onUrlChange(null)
      toast.danger('فشل رفع الصورة')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  // previewUrl is a local blob URL (already absolute), currentUrl may be relative
  const displayUrl = previewUrl ?? (currentUrl ? toAbsoluteUrl(currentUrl) : null)

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>

      {displayUrl ? (
        <div className={`relative ${containerClass} rounded-xl overflow-hidden border border-divider ${uploading ? 'opacity-60' : ''}`}>
          <img
            src={displayUrl}
            alt={label}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => {
              if (previewUrl) URL.revokeObjectURL(previewUrl)
              setPreviewUrl(null)
              onUrlChange(null)
            }}
            className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white shadow-sm hover:bg-danger/90 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`${containerClass} flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-divider bg-surface-secondary text-muted hover:border-primary hover:text-primary transition-colors`}
        >
          <Upload className="h-5 w-5" />
          <span className="text-xs font-medium">رفع صورة</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
