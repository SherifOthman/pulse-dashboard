import { useState, useRef } from 'react'
import { Button } from '@heroui/react'
import { Upload, X } from 'lucide-react'
import api from '@/services/api'

type Props = {
  currentUrl: string | null
  onUrlChange: (url: string | null) => void
  label: string
}

export function ImageUploadField({ currentUrl, onUrlChange, label }: Props) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      {currentUrl ? (
        <div className="relative inline-block rounded-xl overflow-hidden border border-divider">
          <img src={currentUrl} alt="" className="h-28 w-40 object-cover rounded-xl" />
          <Button
            size="sm"
            variant="danger-soft"
            isIconOnly
            className="absolute top-1 right-1 min-w-0 h-6 w-6"
            onPress={() => onUrlChange(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          className="w-full"
          isDisabled={uploading}
          onPress={() => inputRef.current?.click()}
        >
          {uploading ? 'جاري الرفع...' : <><Upload className="h-4 w-4 inline" /> اختر صورة</>}
        </Button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  )
}
