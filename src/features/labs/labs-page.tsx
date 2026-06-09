import { useState } from 'react'
import { Button, Input, Skeleton, toast } from '@heroui/react'
import { Pencil, Trash2, Search, FlaskConical } from 'lucide-react'
import { useMe } from '@/features/auth/use-me'
import { useLabs, useCreateLab, useUpdateLab, useDeleteLab } from './use-labs'
import { LabFormModal } from './lab-form-modal'
import { ConfirmModal } from '@/components/confirm-modal'
import { PageHeader } from '@/components/page-header'
import { Paginator } from '@/components/paginator'
import type { LabDto } from '@/types'

export function LabsPage() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<LabDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LabDto | null>(null)
  const PAGE_SIZE = 10

  const { data, isLoading, isError } = useLabs({ page, pageSize: PAGE_SIZE, name: search || undefined })
  const { data: me } = useMe()
  const role = me?.role ?? null
  const createMutation = useCreateLab()
  const updateMutation = useUpdateLab()
  const deleteMutation = useDeleteLab()
  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1

  return (
    <div dir="rtl">
      <PageHeader
        title="المختبرات"
        subtitle={data ? `${data.totalCount} مختبر مسجل` : 'جاري التحميل...'}
        action={<Button color="primary" onPress={() => setAddOpen(true)}>إضافة مختبر</Button>}
      />

      <div className="mb-6 flex items-center gap-3">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="البحث بالاسم..."
          className="max-w-xs"
         
          onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1) } }}
          endContent={<Search className="h-4 w-4 text-muted" />}
        />
        {search && <Button variant="ghost" size="sm" onPress={() => { setSearch(''); setSearchInput(''); setPage(1) }}>مسح</Button>}
      </div>

      <div className="bg-surface border-divider rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-secondary border-divider border-b">
              <th className="text-right px-4 py-3 font-semibold text-foreground">الاسم</th>
              <th className="text-right px-4 py-3 font-semibold text-foreground hidden lg:table-cell">المحافظة</th>
              <th className="text-right px-4 py-3 font-semibold text-foreground hidden md:table-cell">التقييم</th>
              {role === 'Admin' && <th className="text-right px-4 py-3 font-semibold text-foreground hidden xl:table-cell">أضيف بواسطة</th>}
              <th className="text-left px-4 py-3 font-semibold text-foreground">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-divider border-b">
                  {Array.from({ length: 4 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>)}
                </tr>
              ))
            ) : isError ? (
              <tr><td colSpan={5} className="text-center py-12 text-danger">حدث خطأ في تحميل البيانات</td></tr>
            ) : !data?.items.length ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted">
                  <div className="flex flex-col items-center gap-2">
                    <FlaskConical className="h-8 w-8 text-muted" />
                    <span>لا توجد مختبرات مسجلة</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.items.map((lab) => (
                <tr key={lab.id} className="border-divider border-b hover:bg-surface-secondary transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-warning/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                        <FlaskConical className="h-4 w-4 text-warning" />
                      </div>
                      <span className="font-medium text-foreground">{lab.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted hidden lg:table-cell">{lab.governorate}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="flex items-center gap-1 text-warning">
                      ★ {lab.averageRating.toFixed(1)}
                    </span>
                  </td>
                  {role === 'Admin' && (
                    <td className="px-4 py-3 text-muted hidden xl:table-cell text-xs">{lab.createdBy || '—'}</td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" isIconOnly onPress={() => setEditTarget(lab)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" color="danger" isIconOnly onPress={() => setDeleteTarget(lab)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {data && totalPages > 1 && (
          <div className="border-divider flex justify-center border-t py-4">
            <Paginator page={page} total={totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      <LabFormModal isOpen={addOpen} onClose={() => setAddOpen(false)} onSubmit={(dto) => createMutation.mutate(dto, { onSuccess: () => { setAddOpen(false); toast.success('تم الإضافة بنجاح') }, onError: () => toast.danger('حدث خطأ') })} isLoading={createMutation.isPending} />
      <LabFormModal isOpen={!!editTarget} onClose={() => setEditTarget(null)} onSubmit={(dto) => editTarget && updateMutation.mutate({ id: editTarget.id, dto }, { onSuccess: () => { setEditTarget(null); toast.success('تم التعديل بنجاح') }, onError: () => toast.danger('حدث خطأ') })} isLoading={updateMutation.isPending} initial={editTarget} />
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id, { onSuccess: () => { setDeleteTarget(null); toast.success('تم الحذف بنجاح') }, onError: () => toast.danger('حدث خطأ') })} isLoading={deleteMutation.isPending} message={`هل أنت متأكد من حذف المختبر "${deleteTarget?.name}"؟`} />
    </div>
  )
}
