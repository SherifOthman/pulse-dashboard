import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Table, toast } from '@heroui/react'
import { Plus, Edit, Trash2, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { ConfirmModal } from '@/components/confirm-modal'
import { BranchFormModal } from './branch-form-modal'
import { getBranches, createBranch, updateBranch, deleteBranch } from './branches-api'
import type { CreateBranchDto, BranchListItem } from '@/types'

export function BranchesPage() {
  const { id: doctorId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [formOpen, setFormOpen] = useState(false)
  const [editInitial, setEditInitial] = useState<(CreateBranchDto & { id: string }) | null>(null)
  const [deleting, setDeleting] = useState<BranchListItem | null>(null)

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches', doctorId],
    queryFn: () => getBranches(doctorId!),
    enabled: !!doctorId,
  })

  const createMut = useMutation({
    mutationFn: (dto: CreateBranchDto) => createBranch(doctorId!, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches', doctorId] }); setFormOpen(false); toast.success('تمت الإضافة بنجاح') },
  })

  const updateMut = useMutation({
    mutationFn: (dto: CreateBranchDto) => updateBranch(doctorId!, editInitial!.id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches', doctorId] }); setEditInitial(null); toast.success('تم الحفظ بنجاح') },
  })

  const deleteMut = useMutation({
    mutationFn: () => deleteBranch(doctorId!, deleting!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches', doctorId] }); setDeleting(null); toast.success('تم الحذف بنجاح') },
  })

  const handleEdit = (b: BranchListItem) => {
    setEditInitial({
      id: b.id,
      name: b.name,
      visitPrice: b.visitPrice ?? undefined,
    })
  }

  return (
    <>
      <PageHeader
        title="الفروع"
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onPress={() => navigate('/doctors')}>
              <ArrowRight className="h-4 w-4" />
              رجوع
            </Button>
            <Button variant="primary" size="sm" onPress={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              إضافة فرع
            </Button>
          </div>
        }
      />

      <Table variant="primary">
        <Table.ScrollContainer>
          <Table.Content aria-label="قائمة الفروع">
            <Table.Header>
              <Table.Column isRowHeader className="text-right">الاسم</Table.Column>
              <Table.Column className="hidden md:table-cell text-right">المحافظة</Table.Column>
              <Table.Column className="hidden md:table-cell text-right">المدينة</Table.Column>
              <Table.Column className="hidden md:table-cell text-right">سعر الكشف</Table.Column>
              <Table.Column className="text-right">الحالة</Table.Column>
              <Table.Column className="text-right">الإجراءات</Table.Column>
            </Table.Header>
            <Table.Body
              renderEmptyState={() =>
                isLoading ? (
                  <div className="text-muted p-4 text-center">جاري التحميل...</div>
                ) : (
                  <div className="text-muted p-4 text-center">لا توجد فروع</div>
                )
              }
            >
              {branches.map((b) => (
                <Table.Row key={b.id}>
                  <Table.Cell className="font-medium">{b.name}</Table.Cell>
                  <Table.Cell className="hidden md:table-cell">{b.governorate || '—'}</Table.Cell>
                  <Table.Cell className="hidden md:table-cell">{b.city || '—'}</Table.Cell>
                  <Table.Cell className="hidden md:table-cell">{b.visitPrice ? `${b.visitPrice} ج.م` : '—'}</Table.Cell>
                  <Table.Cell>
                    {b.isOpen ? (
                      <span className="text-success font-medium">مفتوح</span>
                    ) : (
                      <span className="text-muted">مغلق</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" isIconOnly onPress={() => handleEdit(b)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" isIconOnly onPress={() => setDeleting(b)}>
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      <BranchFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={(dto) => createMut.mutate(dto)}
        isLoading={createMut.isPending}
      />

      <BranchFormModal
        isOpen={!!editInitial}
        onClose={() => setEditInitial(null)}
        onSubmit={(dto) => updateMut.mutate(dto)}
        isLoading={updateMut.isPending}
        initial={editInitial}
      />

      <ConfirmModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteMut.mutate()}
        title="حذف الفرع"
        message={`هل أنت متأكد من حذف "${deleting?.name}"؟`}
      />
    </>
  )
}
