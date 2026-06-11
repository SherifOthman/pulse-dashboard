import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Avatar,
  Breadcrumbs,
  Button,
  Chip,
  Skeleton,
  Table,
  toast,
} from '@heroui/react'
import { Building2, Clock, Pencil, Plus, Trash2 } from 'lucide-react'
import { ConfirmModal } from '@/components/confirm-modal'
import { BranchFormModal } from './branch-form-modal'
import { toAbsoluteUrl } from '@/services/image-url'
import type { BranchDetails, BranchListItem, CreateBranchDto } from '@/types/shared'

type Props = {
  singularLabel: string
  backRoute: string
  branchHooks: {
    useBranches: (id: string | undefined) => { data?: BranchListItem[]; isLoading: boolean }
    useCreateBranch: (id: string) => { mutate: (dto: CreateBranchDto, opts?: { onSuccess?: () => void; onError?: () => void }) => void; isPending: boolean }
    useUpdateBranch: (id: string, branchId: string) => { mutate: (dto: Partial<CreateBranchDto>, opts?: { onSuccess?: () => void; onError?: () => void }) => void; isPending: boolean }
    useDeleteBranch: (id: string) => { mutate: (branchId: string, opts?: { onSuccess?: () => void; onError?: () => void }) => void; isPending: boolean }
  }
  branchApi: {
    getBranchDetails: (businessId: string, id: string) => Promise<BranchDetails>
  }
  useDetails: (id: string | null) => { data?: { name: string }; isLoading: boolean }
}

export function BranchesPage({ singularLabel, backRoute, branchHooks, branchApi, useDetails }: Props) {
  const { id: businessId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [formOpen, setFormOpen] = useState(false)
  const [editInitial, setEditInitial] = useState<BranchDetails | null>(null)
  const [deleting, setDeleting] = useState<BranchListItem | null>(null)

  const { data: parent } = useDetails(businessId ?? null)
  const { data: branches = [], isLoading } = branchHooks.useBranches(businessId)
  const createMut = branchHooks.useCreateBranch(businessId!)
  const updateMut = branchHooks.useUpdateBranch(businessId!, editInitial?.id ?? '')
  const deleteMut = branchHooks.useDeleteBranch(businessId!)

  const handleEdit = async (b: BranchListItem) => {
    try {
      const details = await branchApi.getBranchDetails(businessId!, b.id)
      setEditInitial(details)
    } catch {
      toast.danger('فشل تحميل بيانات الفرع')
    }
  }

  const handleCreate = (dto: CreateBranchDto) => {
    createMut.mutate(dto, {
      onSuccess: () => { setFormOpen(false); toast.success('تمت إضافة الفرع بنجاح') },
      onError: () => toast.danger('حدث خطأ أثناء الإضافة'),
    })
  }

  const handleUpdate = (dto: CreateBranchDto) => {
    updateMut.mutate(dto, {
      onSuccess: () => { setEditInitial(null); toast.success('تم الحفظ بنجاح') },
      onError: () => toast.danger('حدث خطأ أثناء الحفظ'),
    })
  }

  const handleDelete = () => {
    if (!deleting) return
    deleteMut.mutate(deleting.id, {
      onSuccess: () => { setDeleting(null); toast.success('تم حذف الفرع بنجاح') },
      onError: () => toast.danger('حدث خطأ أثناء الحذف'),
    })
  }

  return (
    <div dir="rtl">
      <Breadcrumbs className="mb-4" onAction={(key) => navigate(String(key))}>
        <Breadcrumbs.Item id={backRoute}>{singularLabel}</Breadcrumbs.Item>
        {parent && (
          <Breadcrumbs.Item id={`${backRoute}/${businessId}`}>{parent.name}</Breadcrumbs.Item>
        )}
        <Breadcrumbs.Item>الفروع</Breadcrumbs.Item>
      </Breadcrumbs>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {parent ? `فروع ${parent.name}` : 'الفروع'}
          </h1>
          {!isLoading && (
            <p className="text-sm text-muted mt-0.5">{branches.length} فرع مسجل</p>
          )}
        </div>
        <Button variant="primary" size="sm" onPress={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          إضافة فرع
        </Button>
      </div>

      <Table variant="primary">
        <Table.ScrollContainer>
          <Table.Content aria-label="قائمة الفروع">
            <Table.Header>
              <Table.Column isRowHeader className="text-right">الفرع</Table.Column>
              <Table.Column className="hidden md:table-cell text-right">الموقع</Table.Column>
              <Table.Column className="hidden lg:table-cell text-right">الحالة</Table.Column>
              <Table.Column className="text-right">الإجراءات</Table.Column>
            </Table.Header>

            <Table.Body
              renderEmptyState={() =>
                isLoading ? (
                  <div className="text-center py-12 text-muted text-sm">جاري التحميل...</div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-14 text-muted">
                    <Building2 className="h-10 w-10 opacity-30" />
                    <span className="text-sm">لا توجد فروع مضافة بعد</span>
                  </div>
                )
              }
            >
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Table.Row key={i}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                          <Skeleton className="h-4 w-32 rounded" />
                        </div>
                      </Table.Cell>
                      <Table.Cell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-28 rounded" />
                      </Table.Cell>
                      <Table.Cell className="hidden lg:table-cell">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </Table.Cell>
                      <Table.Cell>
                        <Skeleton className="h-8 w-20 rounded" />
                      </Table.Cell>
                    </Table.Row>
                  ))
                : branches.map((b) => (
                    <Table.Row key={b.id}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" className="rounded-lg">
                            {b.profileImageUrl
                              ? <Avatar.Image src={toAbsoluteUrl(b.profileImageUrl) ?? b.profileImageUrl} alt={b.name} />
                              : null}
                            <Avatar.Fallback className="rounded-lg">
                              <Building2 className="h-4 w-4" />
                            </Avatar.Fallback>
                          </Avatar>
                          <span className="font-medium text-foreground text-sm">{b.name}</span>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="hidden md:table-cell text-sm text-muted">
                        {[b.city, b.governorate].filter(Boolean).join(' - ') || '—'}
                      </Table.Cell>

                      <Table.Cell className="hidden lg:table-cell">
                        <Chip size="sm" variant="soft" color={b.isOpen ? 'success' : 'default'}>
                          <Clock className="h-3 w-3" />
                          <Chip.Label>{b.isOpen ? 'مفتوح' : 'مغلق'}</Chip.Label>
                        </Chip>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            isIconOnly
                            onPress={() => handleEdit(b)}
                            aria-label="تعديل الفرع"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="danger-soft"
                            size="sm"
                            isIconOnly
                            onPress={() => setDeleting(b)}
                            aria-label="حذف الفرع"
                          >
                            <Trash2 className="h-4 w-4" />
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
        onSubmit={handleCreate}
        isLoading={createMut.isPending}
      />

      <BranchFormModal
        isOpen={!!editInitial}
        onClose={() => setEditInitial(null)}
        onSubmit={handleUpdate}
        isLoading={updateMut.isPending}
        initial={editInitial}
      />

      <ConfirmModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        isPending={deleteMut.isPending}
        title="حذف الفرع"
        message={`هل أنت متأكد من حذف فرع "${deleting?.name}"؟`}
      />
    </div>
  )
}
