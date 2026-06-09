import { useState } from 'react'
import { Button, Skeleton, Chip, toast } from '@heroui/react'
import { Pencil, Trash2, Users } from 'lucide-react'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from './use-users'
import { UserFormModal } from './user-form-modal'
import { ConfirmModal } from '@/components/confirm-modal'
import { PageHeader } from '@/components/page-header'
import type { DashboardUser, CreateDashboardUserDto } from '@/types'

export function UsersPage() {
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<DashboardUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DashboardUser | null>(null)

  const { data: users = [], isLoading, isError } = useUsers()
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()

  const handleCreate = (dto: CreateDashboardUserDto) => {
    createMutation.mutate(dto, {
      onSuccess: () => { setAddOpen(false); toast.success('تم إضافة المستخدم بنجاح') },
      onError: () => toast.danger('حدث خطأ، تأكد من البيانات'),
    })
  }

  const handleUpdate = (dto: CreateDashboardUserDto) => {
    if (!editTarget) return
    updateMutation.mutate(
      { id: editTarget.id, dto },
      {
        onSuccess: () => { setEditTarget(null); toast.success('تم تعديل المستخدم بنجاح') },
        onError: () => toast.danger('حدث خطأ'),
      },
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => { setDeleteTarget(null); toast.success('تم حذف المستخدم بنجاح') },
      onError: () => toast.danger('حدث خطأ أثناء الحذف'),
    })
  }

  return (
    <div dir="rtl">
      <PageHeader
        title="المستخدمين"
        subtitle={isLoading ? 'جاري التحميل...' : `${users.length} مستخدم مسجل`}
        action={<Button variant="primary" onPress={() => setAddOpen(true)}>إضافة مستخدم</Button>}
      />

      <div className="bg-surface border-divider rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-secondary border-divider border-b">
              <th className="text-right px-4 py-3 font-semibold text-foreground">الاسم</th>
              <th className="text-right px-4 py-3 font-semibold text-foreground hidden md:table-cell">البريد الإلكتروني</th>
              <th className="text-right px-4 py-3 font-semibold text-foreground hidden md:table-cell">الصلاحية</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-divider border-b">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-36 rounded" /></td>
                  <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-44 rounded" /></td>
                  <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-6 w-20 rounded" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-8 w-24 rounded" /></td>
                </tr>
              ))
            ) : isError ? (
              <tr><td colSpan={4} className="text-center py-12 text-danger">حدث خطأ في تحميل البيانات</td></tr>
            ) : !users.length ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-muted">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-muted" />
                    <span>لا يوجد مستخدمين</span>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-divider border-b hover:bg-surface-secondary transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted hidden md:table-cell">{user.email}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Chip
                      size="sm"
                      variant="soft"
                      color={user.role === 'Admin' ? 'warning' : 'default'}
                    >
                      {user.role === 'Admin' ? 'مدير النظام' : 'مشرف'}
                    </Chip>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" isIconOnly onPress={() => setEditTarget(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {user.role !== 'Admin' && (
                        <Button size="sm" variant="danger-soft" isIconOnly onPress={() => setDeleteTarget(user)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserFormModal isOpen={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleCreate} isLoading={createMutation.isPending} />
      <UserFormModal isOpen={!!editTarget} onClose={() => setEditTarget(null)} onSubmit={handleUpdate} isLoading={updateMutation.isPending} initial={editTarget} />
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} message={`هل أنت متأكد من حذف المستخدم "${deleteTarget?.fullName}"؟`} />
    </div>
  )
}
