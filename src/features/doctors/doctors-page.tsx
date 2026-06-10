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
import { Pencil, Plus, Stethoscope, Trash2, UserRound } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { AppSelect } from '@/components/app-select'
import { ConfirmModal } from '@/components/confirm-modal'
import { PageHeader } from '@/components/page-header'
import { Paginator } from '@/components/paginator'
import { useDebounce } from '@/hooks/use-debounce'
import { useDoctors, useDeleteDoctor } from './use-doctors'
import type { DoctorListItem } from './types'
import type { GovernorateDto } from '@/features/cities/types'
import type { SpecializationDto } from '@/features/specializations/types'
import api from '@/services/api'

const PAGE_SIZE = 10

const GENDER_OPTIONS = [
  { id: '0', label: 'ذكر' },
  { id: '1', label: 'أنثى' },
]

export function DoctorsPage() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [governorateId, setGovernorateId] = useState('')
  const [specializationId, setSpecializationId] = useState('')
  const [gender, setGender] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<DoctorListItem | null>(null)

  const debouncedSearch = useDebounce(searchInput, 400)

  const { data, isLoading, isError } = useDoctors({
    page,
    pageSize: PAGE_SIZE,
    name: debouncedSearch || undefined,
    governorateId: governorateId || undefined,
    specializationId: specializationId || undefined,
    gender: gender !== '' ? parseInt(gender) : undefined,
  })

  const { data: governorates = [] } = useQuery<GovernorateDto[]>({
    queryKey: ['governorates'],
    queryFn: async () => (await api.get('/governorates')).data,
  })

  const { data: specializations = [] } = useQuery<SpecializationDto[]>({
    queryKey: ['specializations'],
    queryFn: async () => (await api.get('/specializations')).data,
  })

  const deleteMutation = useDeleteDoctor()
  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1
  const hasActiveFilters = !!(debouncedSearch || governorateId || specializationId || gender)

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null)
        toast.success('تم حذف الطبيب بنجاح')
      },
      onError: () => toast.danger('حدث خطأ أثناء الحذف'),
    })
  }

  const clearFilters = () => {
    setSearchInput('')
    setGovernorateId('')
    setSpecializationId('')
    setGender('')
    setPage(1)
  }

  return (
    <div dir="rtl">
      <PageHeader
        title="الأطباء"
        subtitle={
          data
            ? `${data.totalCount} طبيب مسجل`
            : isLoading
              ? 'جاري التحميل...'
              : undefined
        }
        action={
          <Button variant="primary" onPress={() => navigate('/doctors/new')}>
            <Plus className="h-4 w-4" />
            إضافة طبيب
          </Button>
        }
      />

      {/* ── Filters ── */}
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

        <AppSelect
          options={specializations.map((s) => ({ id: s.id, label: s.name }))}
          value={specializationId}
          onChange={(val) => { setSpecializationId(val === specializationId ? '' : val); setPage(1) }}
          placeholder="التخصص"
          className="w-40"
        />

        <AppSelect
          options={GENDER_OPTIONS}
          value={gender}
          onChange={(val) => { setGender(val === gender ? '' : val); setPage(1) }}
          placeholder="الجنس"
          className="w-32"
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onPress={clearFilters}>
            مسح الفلاتر
          </Button>
        )}
      </div>

      {/* ── Table ── */}
      <Table variant="primary">
        <Table.ScrollContainer>
          <Table.Content
            aria-label="قائمة الأطباء"
            onRowAction={(key) => navigate(`/doctors/${key}`)}
          >
            <Table.Header>
              <Table.Column isRowHeader className="text-right">الطبيب</Table.Column>
              <Table.Column className="hidden md:table-cell text-right">التخصص</Table.Column>
              <Table.Column className="hidden lg:table-cell text-right">المحافظة</Table.Column>
              <Table.Column className="hidden lg:table-cell text-right">التقييم</Table.Column>
              <Table.Column className="hidden md:table-cell text-right">سعر الكشف</Table.Column>
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
                    <Stethoscope className="h-10 w-10 opacity-30" />
                    <span className="text-sm">
                      {hasActiveFilters ? 'لا توجد نتائج للفلاتر المحددة' : 'لا يوجد أطباء مسجلون'}
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
                      <Table.Cell className="hidden md:table-cell">
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </Table.Cell>
                      <Table.Cell className="hidden lg:table-cell">
                        <Skeleton className="h-4 w-24 rounded" />
                      </Table.Cell>
                      <Table.Cell className="hidden lg:table-cell">
                        <Skeleton className="h-4 w-12 rounded" />
                      </Table.Cell>
                      <Table.Cell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-16 rounded" />
                      </Table.Cell>
                      <Table.Cell className="hidden xl:table-cell">
                        <Skeleton className="h-4 w-20 rounded" />
                      </Table.Cell>
                      <Table.Cell>
                        <Skeleton className="h-8 w-20 rounded" />
                      </Table.Cell>
                    </Table.Row>
                  ))
                : (data?.items ?? []).map((doctor) => (
                    <Table.Row
                      key={doctor.id}
                      id={doctor.id}
                      className="cursor-pointer"
                    >
                      {/* Doctor avatar + name */}
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            {doctor.profileImageUrl ? (
                              <Avatar.Image
                                src={doctor.profileImageUrl}
                                alt={doctor.name}
                              />
                            ) : null}
                            <Avatar.Fallback>
                              <UserRound className="h-4 w-4" />
                            </Avatar.Fallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground text-sm">
                              {doctor.name}
                            </span>
                            <span className="text-xs text-muted md:hidden">
                              {doctor.specialization}
                            </span>
                          </div>
                        </div>
                      </Table.Cell>

                      {/* Specialization */}
                      <Table.Cell className="hidden md:table-cell">
                        {doctor.specialization ? (
                          <Chip size="sm" variant="soft" color="accent">
                            {doctor.specialization}
                          </Chip>
                        ) : (
                          <span className="text-muted text-sm">—</span>
                        )}
                      </Table.Cell>

                      {/* Governorate */}
                      <Table.Cell className="hidden lg:table-cell text-muted text-sm">
                        {doctor.governorate || '—'}
                      </Table.Cell>

                      {/* Rating */}
                      <Table.Cell className="hidden lg:table-cell">
                        <span className="flex items-center gap-1 text-warning text-sm font-medium">
                          ★ {doctor.averageRating.toFixed(1)}
                        </span>
                      </Table.Cell>

                      {/* Visit price */}
                      <Table.Cell className="hidden md:table-cell">
                        {doctor.visitPrice != null ? (
                          <span className="font-medium text-success text-sm">
                            {doctor.visitPrice} ج.م
                          </span>
                        ) : (
                          <span className="text-muted text-sm">—</span>
                        )}
                      </Table.Cell>

                      {/* Created by */}
                      <Table.Cell className="hidden xl:table-cell text-muted text-xs">
                        {doctor.createdBy || '—'}
                      </Table.Cell>

                      {/* Actions */}
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            isIconOnly
                            aria-label="تعديل"
                            onPress={(e) => {
                              e?.continuePropagation?.()
                              navigate(`/doctors/${doctor.id}/edit`)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger-soft"
                            isIconOnly
                            aria-label="حذف"
                            onPress={() => setDeleteTarget(doctor)}
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

        {/* ── Pagination inside Table.Footer ── */}
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

      {/* ── Delete confirmation ── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="حذف الطبيب"
        message={`هل أنت متأكد من حذف "${deleteTarget?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
      />
    </div>
  )
}
