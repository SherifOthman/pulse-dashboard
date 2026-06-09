import { useRef, useState } from 'react'
import { Skeleton } from '@heroui/react'
import { Upload, X } from 'lucide-react'
import api from '@/services/api'

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
  const inputRef = useRef<HTMLInputElement>(null)

  const isSquare = aspectRatio === 'square'
  const containerClass = isSquare
    ? 'h-24 w-24'
    : 'h-24 w-full'

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/upload', formData)
      onUrlChange(data.url)
    } catch {
      onUrlChange(null)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>

      {uploading ? (
        <Skeleton className={`${containerClass} rounded-xl`} />
      ) : currentUrl ? (
        <div className={`relative ${containerClass} rounded-xl overflow-hidden border border-divider`}>
          <img
            src={currentUrl}
            alt={label}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onUrlChange(null)}
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
