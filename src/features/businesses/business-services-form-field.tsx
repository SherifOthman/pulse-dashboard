import { useState } from 'react'
import { Button, Chip, Input, Spinner } from '@heroui/react'
import { Plus, Tag, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useFormContext } from 'react-hook-form'
import { getAvailableBusinessServices } from './business-services-api'
import type { BusinessFormValues, ServiceItem } from './business-form-schema'

type Props = {
  segment: string
}

export function BusinessServicesFormField({ segment }: Props) {
  const [newName, setNewName] = useState('')
  const [dropdown, setDropdown] = useState(false)

  const { watch, setValue } = useFormContext<BusinessFormValues>()
  const services = watch('services')

  const { data: available = [], isLoading } = useQuery({
    queryKey: ['available-services', segment],
    queryFn: () => getAvailableBusinessServices(segment),
    staleTime: 5 * 60 * 1000,
  })

  const currentIds = new Set(services.map((s) => s.id).filter(Boolean))
  const pickable = available.filter((s) => !currentIds.has(s.id))

  function addItem(item: ServiceItem) {
    setValue('services', [...services, item], { shouldValidate: false })
  }

  function removeItem(index: number) {
    setValue('services', services.filter((_, i) => i !== index), { shouldValidate: false })
  }

  function addExisting(svc: { id: string; name: string }) {
    setDropdown(false)
    addItem({ id: svc.id, name: svc.name })
  }

  function createNew() {
    const trimmed = newName.trim()
    if (!trimmed) return

    const existing = available.find(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase(),
    )
    const dup = services.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase(),
    )

    if (dup || (existing && currentIds.has(existing.id))) {
      setNewName('')
      return
    }

    addItem(existing ? { id: existing.id, name: existing.name } : { name: trimmed })
    setNewName('')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted" />
        <span className="text-sm font-medium text-foreground">الخدمات</span>
        {isLoading && <Spinner size="sm" />}
      </div>

      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        {services.length === 0 && (
          <p className="text-sm text-muted">لم يتم اختيار أي خدمة</p>
        )}
        {services.map((s, i) => (
          <Chip key={`${s.id ?? s.name}-${i}`} size="sm" variant="soft" color="accent">
            <Chip.Label>{s.name}</Chip.Label>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="mr-1 text-muted hover:text-danger transition-colors"
              aria-label={`إزالة ${s.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Chip>
        ))}
      </div>

      {pickable.length > 0 && (
        <div className="relative">
          <Button
            type="button" variant="ghost" size="sm"
            onPress={() => setDropdown((o) => !o)}
          >
            <Plus className="h-3.5 w-3.5" />
            إضافة خدمة موجودة
          </Button>

          {dropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdown(false)} />
              <div className="absolute top-full mt-1 right-0 z-20 w-64 rounded-xl border border-divider bg-surface shadow-lg overflow-hidden">
                <div className="max-h-52 overflow-y-auto">
                  {pickable.map((s) => (
                    <button
                      key={s.id} type="button"
                      onClick={() => addExisting(s)}
                      className="w-full px-3 py-2.5 text-right text-sm text-foreground hover:bg-surface-secondary transition-colors border-b border-divider last:border-0"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); createNew() } }}
            variant="secondary"
            placeholder="اكتب اسم خدمة جديدة..."
            dir="rtl"
            className="flex-1"
            aria-label="اسم الخدمة الجديدة"
          />
          {newName && (
            <button
              type="button"
              onClick={() => setNewName('')}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button
          type="button" variant="secondary" size="sm"
          onPress={createNew}
          isDisabled={!newName.trim()}
        >
          <Plus className="h-4 w-4" />
          إضافة
        </Button>
      </div>
    </div>
  )
}
