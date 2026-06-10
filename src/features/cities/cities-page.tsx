import { useState } from 'react'
import { Button, Skeleton, Chip, toast } from '@heroui/react'
import { Pencil, Trash2 } from 'lucide-react'
import { Select, SelectTrigger, SelectValue, SelectIndicator, SelectPopover, ListBox, ListBoxItem } from '@heroui/react'
import { useGovernorates } from '@/hooks/use-governorates'
import { useCities, useCreateCity, useUpdateCity, useDeleteCity } from './use-cities'
import { CityFormModal } from './city-form-modal'
import { ConfirmModal } from '@/components/confirm-modal'
import { PageHeader } from '@/components/page-header'
import type { CityDto } from './types'

export function CitiesPage() {
  const [filterGovId, setFilterGovId] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<CityDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CityDto | null>(null)

  const { data: cities = [], isLoading, isError } = useCities(filterGovId || undefined)
  const { data: governorates = [] } = useGovernorates()

  const createMutation = useCreateCity()
  const updateMutation = useUpdateCity()
  const deleteMutation = useDeleteCity()

  const govMap = new Map(governorates.map((g) => [g.id, g.name]))

  return (
    <div dir="rtl">
      <PageHeader
        title="المدن"
        subtitle={isLoading ? 'جاري التحميل...' : `${cities.length} مدينة مسجلة`}
        action={<Button variant="primary" onPress={() => setAddOpen(true)}>إضافة مدينة</Button>}
      />

      <div className="mb-6 flex items-center gap-3">
        <Select
          placeholder="فلترة بالمحافظة"
          className="max-w-xs"
         
          value={filterGovId || ''}
          onChange={(key) => setFilterGovId(key as string || '')}
        >
          <SelectTrigger>
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectPopover>
            <ListBox>
              <ListBoxItem key="">الكل</ListBoxItem>
              {governorates.map((g) => <ListBoxItem key={g.id} id={g.id}>{g.name}</ListBoxItem>)}
            </ListBox>
          </SelectPopover>
        </Select>
        {filterGovId && (
          <Button variant="ghost" size="sm" onPress={() => setFilterGovId('')}>مسح الفلتر</Button>
        )}
      </div>

      <div className="bg-surface border-divider rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-secondary border-divider border-b">
              <th className="text-right px-4 py-3 font-semibold text-foreground">اسم المدينة</th>
              <th className="text-right px-4 py-3 font-semibold text-foreground hidden md:table-cell">المحافظة</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-divider border-b">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32 rounded" /></td>
                  <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-24 rounded" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-8 w-24 rounded" /></td>
                </tr>
              ))
            ) : isError ? (
              <tr><td colSpan={3} className="text-center py-12 text-danger">حدث خطأ في تحميل البيانات</td></tr>
            ) : !cities.length ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-muted">
                  <div className="flex flex-col items-center gap-2"><span className="text-4xl">🏙️</span><span>لا توجد مدن مسجلة</span></div>
                </td>
              </tr>
            ) : (
              cities.map((city) => (
                <tr key={city.id} className="border-divider border-b hover:bg-surface-secondary transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{city.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Chip size="sm" variant="soft">{govMap.get(city.governorateId) || city.governorateId}</Chip>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" isIconOnly onPress={() => setEditTarget(city)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="danger-soft" isIconOnly onPress={() => setDeleteTarget(city)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CityFormModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={(dto) => createMutation.mutate(dto, { onSuccess: () => { setAddOpen(false); toast.success('تم إضافة المدينة بنجاح') }, onError: () => toast.danger('حدث خطأ') })}
        isLoading={createMutation.isPending}
      />
      <CityFormModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={(dto) => editTarget && updateMutation.mutate({ id: editTarget.id, dto }, { onSuccess: () => { setEditTarget(null); toast.success('تم التعديل بنجاح') }, onError: () => toast.danger('حدث خطأ') })}
        isLoading={updateMutation.isPending}
        initial={editTarget}
      />
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id, { onSuccess: () => { setDeleteTarget(null); toast.success('تم الحذف بنجاح') }, onError: () => toast.danger('حدث خطأ') })}
        message={`هل أنت متأكد من حذف المدينة "${deleteTarget?.name}"؟`}
      />
    </div>
  )
}
