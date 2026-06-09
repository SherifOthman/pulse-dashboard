import { useState } from 'react'
import { Button, Input, Skeleton, Chip, toast } from '@heroui/react'
import { Pencil, Trash2, Search, Stethoscope } from 'lucide-react'
import { useGovernorates } from '@/hooks/use-governorates'
import { useMe } from '@/features/auth/use-me'
import { useDoctors, useCreateDoctor, useUpdateDoctor, useDeleteDoctor } from './use-doctors'
import { DoctorFormModal } from './doctor-form-modal'
import { ConfirmModal } from '@/components/confirm-modal'
import { AppSelect } from '@/components/app-select'
import { PageHeader } from '@/components/page-header'
import { Paginator } from '@/components/paginator'
import { BusinessType } from '@/types'
import type { DoctorDto, CreateDoctorDto } from '@/types'

export function DoctorsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [governorateId, setGovernorateId] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<DoctorDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DoctorDto | null>(null)

  const PAGE_SIZE = 10

  const { data, isLoading, isError } = useDoctors({
    page,
    pageSize: PAGE_SIZE,
    name: search || undefined,
    governorateId: governorateId || undefined,
  })

  const { data: governorates = [] } = useGovernorates(BusinessType.Doctor)

  const { data: me } = useMe()
  const role = me?.role ?? null
  const createMutation = useCreateDoctor()
  const updateMutation = useUpdateDoctor()
  const deleteMutation = useDeleteDoctor()

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1

  const handleCreate = (dto: CreateDoctorDto) => {
    createMutation.mutate(dto, {
      onSuccess: () => { setAddOpen(false); toast.success('تم إضافة الطبيب بنجاح') },
      onError: () => toast.danger('حدث خطأ، تأكد من البيانات'),
    })
  }

  const handleUpdate = (dto: CreateDoctorDto) => {
    if (!editTarget) return
    updateMutation.mutate(
      { id: editTarget.id, dto },
      {
        onSuccess: () => { setEditTarget(null); toast.success('تم تعديل الطبيب بنجاح') },
        onError: () => toast.danger('حدث خطأ'),
      },
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => { setDeleteTarget(null); toast.success('تم حذف الطبيب بنجاح') },
      onError: () => toast.danger('حدث خطأ أثناء الحذف'),
    })
  }

  return (
    <div dir="rtl">
      <PageHeader
        title="الأطباء"
        subtitle={data ? `${data.totalCount} طبيب مسجل` : 'جاري التحميل...'}
        action={<Button color="primary" onPress={() => setAddOpen(true)}>إضافة طبيب</Button>}
      />

      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="البحث بالاسم..."
          className="w-56"
         
          onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1) } }}
          endContent={
            <button onClick={() => { setSearch(searchInput); setPage(1) }} className="text-muted hover:text-primary transition-colors">
              <Search className="h-4 w-4" />
            </button>
          }
        />
        <AppSelect
          options={governorates.map((g) => ({ id: g.id, label: g.name }))}
          selectedKey={governorateId}
          onSelectionChange={(val) => { setGovernorateId(val === governorateId ? '' : val); setPage(1) }}
          placeholder="فلترة بالمحافظة"
          className="w-48"
        />
        {(search || governorateId) && (
          <Button variant="ghost" size="sm" onPress={() => { setSearch(''); setSearchInput(''); setGovernorateId(''); setPage(1) }}>
            مسح الفلاتر
          </Button>
        )}
      </div>

      <div className="bg-surface border-divider rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-secondary border-divider border-b">
              <th className="text-right px-4 py-3 font-semibold text-foreground">الاسم</th>
              <th className="text-right px-4 py-3 font-semibold text-foreground hidden md:table-cell">التخصص</th>
              <th className="text-right px-4 py-3 font-semibold text-foreground hidden lg:table-cell">المحافظة</th>
              <th className="text-right px-4 py-3 font-semibold text-foreground hidden lg:table-cell">التقييم</th>
              <th className="text-right px-4 py-3 font-semibold text-foreground hidden md:table-cell">سعر الكشف</th>
              {role === 'Admin' && <th className="text-right px-4 py-3 font-semibold text-foreground hidden xl:table-cell">أضيف بواسطة</th>}
              <th className="text-left px-4 py-3 font-semibold text-foreground">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-divider border-b">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-40 rounded" /></td>
                  <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-28 rounded" /></td>
                  <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-24 rounded" /></td>
                  <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-16 rounded" /></td>
                  <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-20 rounded" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-8 w-24 rounded" /></td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-danger">حدث خطأ في تحميل البيانات</td>
              </tr>
            ) : !data?.items.length ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted">
                  <div className="flex flex-col items-center gap-2">
                    <Stethoscope className="h-8 w-8 text-muted" />
                    <span>لا يوجد أطباء مسجلون</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.items.map((doctor) => (
                <tr key={doctor.id} className="border-divider border-b hover:bg-surface-secondary transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                        <Stethoscope className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{doctor.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Chip size="sm" variant="flat" color="primary">{doctor.specialization}</Chip>
                  </td>
                  <td className="px-4 py-3 text-muted hidden lg:table-cell">{doctor.governorate}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="flex items-center gap-1 text-warning">
                      ★ {doctor.averageRating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {doctor.visitPrice != null ? (
                      <span className="font-medium text-success">{doctor.visitPrice} ج.م</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  {role === 'Admin' && (
                    <td className="px-4 py-3 text-muted hidden xl:table-cell text-xs">{doctor.createdBy || '—'}</td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" isIconOnly onPress={() => setEditTarget(doctor)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" color="danger" isIconOnly onPress={() => setDeleteTarget(doctor)}>
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

      <DoctorFormModal isOpen={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleCreate} isLoading={createMutation.isPending} />
      <DoctorFormModal isOpen={!!editTarget} onClose={() => setEditTarget(null)} onSubmit={handleUpdate} isLoading={updateMutation.isPending} initial={editTarget} />
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleteMutation.isPending} message={`هل أنت متأكد من حذف الطبيب "${deleteTarget?.name}"؟`} />
    </div>
  )
}
