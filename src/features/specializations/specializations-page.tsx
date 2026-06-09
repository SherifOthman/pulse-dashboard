import { useState } from 'react'
import { Button, Skeleton, SearchField, toast } from '@heroui/react'
import { Pencil, Trash2, GraduationCap } from 'lucide-react'
import { useSpecializations, useCreateSpecialization, useUpdateSpecialization, useDeleteSpecialization } from './use-specializations'
import { SpecializationFormModal } from './specialization-form-modal'
import { ConfirmModal } from '@/components/confirm-modal'
import { PageHeader } from '@/components/page-header'
import type { SpecializationDto } from '@/types'

export function SpecializationsPage() {
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SpecializationDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SpecializationDto | null>(null)

  const { data: all = [], isLoading, isError } = useSpecializations()
  const createMutation = useCreateSpecialization()
  const updateMutation = useUpdateSpecialization()
  const deleteMutation = useDeleteSpecialization()

  const filtered = search
    ? all.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    : all

  return (
    <div dir="rtl">
      <PageHeader
        title="التخصصات"
        subtitle={isLoading ? 'جاري التحميل...' : `${all.length} تخصص مسجل`}
        action={<Button variant="primary" onPress={() => setAddOpen(true)}>إضافة تخصص</Button>}
      />

      <div className="mb-6 flex items-center gap-3">
        <SearchField.Root
          value={search}
          onChange={setSearch}
          className="w-56"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="البحث في التخصصات..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField.Root>
        {search && <Button variant="ghost" size="sm" onPress={() => setSearch('')}>مسح</Button>}
      </div>

      <div className="bg-surface border-divider rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-secondary border-divider border-b">
              <th className="text-right px-4 py-3 font-semibold text-foreground">اسم التخصص</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-divider border-b">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-40 rounded" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-8 w-24 rounded" /></td>
                </tr>
              ))
            ) : isError ? (
              <tr><td colSpan={2} className="text-center py-12 text-danger">حدث خطأ في تحميل البيانات</td></tr>
            ) : !filtered.length ? (
              <tr>
                <td colSpan={2} className="text-center py-12 text-muted">
                  <div className="flex flex-col items-center gap-2">
                    <GraduationCap className="h-8 w-8 text-muted" />
                    <span>{search ? 'لا توجد نتائج للبحث' : 'لا توجد تخصصات مسجلة'}</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((spec) => (
                <tr key={spec.id} className="border-divider border-b hover:bg-surface-secondary transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                        <GraduationCap className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{spec.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" isIconOnly onPress={() => setEditTarget(spec)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="danger-soft" isIconOnly onPress={() => setDeleteTarget(spec)}>
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

      <SpecializationFormModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={(dto) => createMutation.mutate(dto, { onSuccess: () => { setAddOpen(false); toast.success('تم إضافة التخصص بنجاح') }, onError: () => toast.danger('حدث خطأ') })}
        isLoading={createMutation.isPending}
      />
      <SpecializationFormModal
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
        message={`هل أنت متأكد من حذف التخصص "${deleteTarget?.name}"؟`}
      />
    </div>
  )
}
