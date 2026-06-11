import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  Button,
  Chip,
  SearchField,
  Skeleton,
  Table,
  toast,
} from '@heroui/react'
import { Pencil, Plus, Scan, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { AppSelect } from '@/components/app-select'
import { ConfirmModal } from '@/components/confirm-modal'
import { PageHeader } from '@/components/page-header'
import { Paginator } from '@/components/paginator'
import { useDebounce } from '@/hooks/use-debounce'
import { radiologyHooks } from './index'
import type { BusinessListItem } from '@/types/shared'
import type { GovernorateDto } from '@/features/cities/types'
import api from '@/services/api'

const PAGE_SIZE = 10

export function RadiologyPage() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [governorateId, setGovernorateId] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<BusinessListItem | null>(null)

  const debouncedSearch = useDebounce(searchInput, 400)

  const { data, isLoading, isError } = radiologyHooks.useList({
    page,
    pageSize: PAGE_SIZE,
    name: debouncedSearch || undefined,
    governorateId: governorateId || undefined,
  })

  const { data: governorates = [] } = useQuery<GovernorateDto[]>({
    queryKey: ['governorates'],
    queryFn: async () => (await api.get('/governorates')).data,
  })

  const deleteMutation = radiologyHooks.useDelete()
  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1
  const hasActiveFilters = !!(debouncedSearch || governorateId)

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null)
        toast.success('تم حذف مركز الأشعة بنجاح')
      },
      onError: () => toast.danger('حدث خطأ أثناء الحذف'),
    })
  }

  const clearFilters = () => {
    setSearchInput('')
    setGovernorateId('')
    setPage(1)
  }

  return (
    <div dir="rtl">
      <PageHeader
        title="مراكز الأشعة"
        subtitle={
          data
            ? `${data.totalCount} مركز مسجل`
            : isLoading
              ? 'جاري التحميل...'
              : undefined
        }
        action={
          <Button variant="primary" onPress={() => navigate('/radiology/new')}>
            <Plus className="h-4 w-4" />
            إضافة مركز
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SearchField
          value={searchInput}
          onChange={(val) => { setSearchInput(val); setPage(1) }}
          className="w-52"
          aria-label="البحث بالاسم"
        >
          <SearchField.Group dir="rtl">
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="البحث بالاسم..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        <AppSelect
          options={governorates.map((g) => ({ id: g.id, label: g.name }))}
          value={governorateId}
          onChange={(val) => { setGovernorateId(val === governorateId ? '' : val); setPage(1) }}
          placeholder="المحافظة"
          className="w-40"
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onPress={clearFilters}>
            مسح الفلاتر
          </Button>
        )}
      </div>

      <Table variant="primary">
        <Table.ScrollContainer>
          <Table.Content
            aria-label="قائمة مراكز الأشعة"
            onRowAction={(key) => navigate(`/radiology/${key}`)}
          >
            <Table.Header>
              <Table.Column isRowHeader className="text-right">المركز</Table.Column>
              <Table.Column className="hidden lg:table-cell text-right">المحافظة</Table.Column>
              <Table.Column className="hidden lg:table-cell text-right">التقييم</Table.Column>
              <Table.Column className="hidden lg:table-cell text-right">الحالة</Table.Column>
              <Table.Column className="hidden xl:table-cell text-right">أضيف بواسطة</Table.Column>
              <Table.Column className="text-right">الإجراءات</Table.Column>
            </Table.Header>

            <Table.Body
              renderEmptyState={() =>
                isError ? (
                  <div className="text-center py-12 text-danger text-sm">
                    حدث خطأ في تحميل البيانات
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-14 text-muted">
                    <div className="h-12 w-12 flex items-center justify-center rounded-full bg-danger/10 text-danger">
                      <Scan className="h-5 w-5" />
                    </div>
                    <span className="text-sm">
                      {hasActiveFilters ? 'لا توجد نتائج للفلاتر المحددة' : 'لا يوجد مراكز أشعة مسجلة'}
                    </span>
                  </div>
                )
              }
            >
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Table.Row key={i}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                          <Skeleton className="h-4 w-36 rounded" />
                        </div>
                      </Table.Cell>
                      <Table.Cell className="hidden lg:table-cell">
                        <Skeleton className="h-4 w-24 rounded" />
                      </Table.Cell>
                      <Table.Cell className="hidden lg:table-cell">
                        <Skeleton className="h-4 w-12 rounded" />
                      </Table.Cell>
                      <Table.Cell className="hidden lg:table-cell">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </Table.Cell>
                      <Table.Cell className="hidden xl:table-cell">
                        <Skeleton className="h-4 w-20 rounded" />
                      </Table.Cell>
                      <Table.Cell>
                        <Skeleton className="h-8 w-20 rounded" />
                      </Table.Cell>
                    </Table.Row>
                  ))
                : (data?.items ?? []).map((item) => (
                    <Table.Row key={item.id} id={item.id} className="cursor-pointer">
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            {item.profileImageUrl ? (
                              <Avatar.Image src={item.profileImageUrl} alt={item.name} />
                            ) : null}
                            <Avatar.Fallback>
                              <Scan className="h-4 w-4" />
                            </Avatar.Fallback>
                          </Avatar>
                          <span className="font-medium text-foreground text-sm">{item.name}</span>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="hidden lg:table-cell text-muted text-sm">
                        {item.governorate || '—'}
                      </Table.Cell>

                      <Table.Cell className="hidden lg:table-cell">
                        <span className="flex items-center gap-1 text-warning text-sm font-medium">
                          ★ {item.averageRating.toFixed(1)}
                        </span>
                      </Table.Cell>

                      <Table.Cell className="hidden lg:table-cell">
                        <Chip size="sm" variant="soft" color={item.isOpen ? 'success' : 'default'}>
                          {item.isOpen ? 'مفتوح' : 'مغلق'}
                        </Chip>
                      </Table.Cell>

                      <Table.Cell className="hidden xl:table-cell text-muted text-xs">
                        {item.createdBy || '—'}
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            isIconOnly
                            aria-label="تعديل"
                            onPress={(e) => {
                              e?.continuePropagation?.()
                              navigate(`/radiology/${item.id}/edit`)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger-soft"
                            isIconOnly
                            aria-label="حذف"
                            onPress={() => setDeleteTarget(item)}
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

        {data && totalPages > 1 && (
          <Table.Footer>
            <div className="flex items-center justify-between px-1 py-2 w-full">
              <span className="text-xs text-muted">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.totalCount)} من{' '}
                {data.totalCount}
              </span>
              <Paginator page={page} total={totalPages} onChange={setPage} />
            </div>
          </Table.Footer>
        )}
      </Table>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="حذف مركز الأشعة"
        message={`هل أنت متأكد من حذف "${deleteTarget?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
      />
    </div>
  )
}
