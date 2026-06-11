/**
 * BusinessServicesField
 *
 * Manages services for any business type (Pharmacy, Lab, Radiology).
 * Shown in the edit modal after a business has been created.
 * Persists immediately on every add/remove.
 */
import { useState } from 'react'
import { Button, Chip, Input, Spinner, toast } from '@heroui/react'
import { Plus, Tag, X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useAvailableBusinessServices,
  useLinkedBusinessServices,
  businessServiceKeys,
} from './use-business-services'
import { updateBusinessServices } from './business-services-api'
import type { BusinessServiceDto, BusinessServiceItem } from './business-services-api'

type Props = {
  segment:    string   // "pharmacies" | "labs" | "radiology"
  businessId: string
}

export function BusinessServicesField({ segment, businessId }: Props) {
  const [newName, setNewName]     = useState('')
  const [dropdown, setDropdown]   = useState(false)
  const [isPending, setIsPending] = useState(false)
  const qc = useQueryClient()

  const { data: available = [], isLoading: loadingAvail } = useAvailableBusinessServices(segment)
  const { data: current   = [], isLoading: loadingCurr  } = useLinkedBusinessServices(segment, businessId)

  const currentIds = new Set(current.map((s) => s.id))
  const pickable   = available.filter((s) => !currentIds.has(s.id))
  const isLoading  = loadingCurr || loadingAvail

  async function persist(services: BusinessServiceDto[], newServiceName?: string) {
    setIsPending(true)
    try {
      const payload: BusinessServiceItem[] = newServiceName
        ? [...services.map((s) => ({ id: s.id })), { name: newServiceName }]
        : services.map((s) => ({ id: s.id }))

      const result = await updateBusinessServices(segment, businessId, payload)
      qc.setQueryData(businessServiceKeys.linked(segment, businessId), result.services)
      qc.invalidateQueries({ queryKey: businessServiceKeys.available(segment) })
    } catch {
      toast.danger('حدث خطأ، تحقق من الاتصال وحاول مرة أخرى')
    } finally {
      setIsPending(false)
    }
  }

  function addExisting(service: BusinessServiceDto) {
    setDropdown(false)
    persist([...current, service]).then(() => toast.success(`تمت إضافة "${service.name}"`))
  }

  function removeService(id: string) {
    const name = current.find((s) => s.id === id)?.name
    persist(current.filter((s) => s.id !== id)).then(() => {
      if (name) toast.info(`تمت إزالة "${name}"`)
    })
  }

  function createNew() {
    const trimmed = newName.trim()
    if (!trimmed) return

    const existing = available.find(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase(),
    )

    if (existing) {
      if (currentIds.has(existing.id)) {
        toast.danger('هذه الخدمة مضافة بالفعل')
        setNewName('')
        return
      }
      persist([...current, existing]).then(() => {
        toast.success(`تمت إضافة "${existing.name}"`)
        setNewName('')
      })
    } else {
      persist(current, trimmed).then(() => {
        toast.success(`تمت إضافة "${trimmed}"`)
        setNewName('')
      })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted" />
        <span className="text-sm font-medium text-foreground">الخدمات</span>
        {isPending && <Spinner size="sm" />}
      </div>

      {/* Current services */}
      {isLoading ? (
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-7 w-20 rounded-full bg-surface-secondary animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {current.length === 0 && (
            <p className="text-sm text-muted">لا توجد خدمات مضافة</p>
          )}
          {current.map((s) => (
            <Chip key={s.id} size="sm" variant="soft" color="accent">
              <Chip.Label>{s.name}</Chip.Label>
              <button
                type="button"
                onClick={() => removeService(s.id)}
                disabled={isPending}
                className="mr-1 text-muted hover:text-danger transition-colors disabled:opacity-40"
                aria-label={`إزالة ${s.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Chip>
          ))}
        </div>
      )}

      {/* Pick from existing dropdown */}
      {pickable.length > 0 && (
        <div className="relative">
          <Button
            type="button" variant="ghost" size="sm"
            onPress={() => setDropdown((o) => !o)}
            isDisabled={isPending}
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

      {/* Create new inline */}
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
            disabled={isPending}
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
          isDisabled={!newName.trim() || isPending}
        >
          <Plus className="h-4 w-4" />
          إضافة
        </Button>
      </div>
    </div>
  )
}
