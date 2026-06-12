import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Breadcrumbs,
  Button,
  Card,
  Chip,
  Separator,
  Skeleton,
} from '@heroui/react'
import {
  AlertCircle,
  Building2,
  Clock,
  MapPin,
  Pencil,
  Phone,
  Trash2,
} from 'lucide-react'
import { toast } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { ConfirmModal } from '@/components/confirm-modal'
import { MapView } from '@/components/map-view'
import type { BranchDetails, WorkingDayDto, PhoneNumberDto } from '@/types/shared'

// ── Helpers ────────────────────────────────────────────────────────────────────

const DAY_NAMES: Record<number, string> = {
  0: 'الأحد', 1: 'الاثنين', 2: 'الثلاثاء', 3: 'الأربعاء',
  4: 'الخميس', 5: 'الجمعة', 6: 'السبت',
}

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return hhmm
  const period = h >= 12 ? 'م' : 'ص'
  const hour12 = h % 12 || 12
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionCard({ icon, label, children }: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-muted">{icon}</span>
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </div>
      {children}
    </Card>
  )
}

function WorkingDayRow({ day }: { day: WorkingDayDto }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-secondary px-3 py-2">
      <span className="text-sm font-medium text-foreground">{DAY_NAMES[day.day] ?? `يوم ${day.day}`}</span>
      <span className="text-sm text-muted font-mono" dir="ltr">
        {formatTime(day.startTime)} – {formatTime(day.endTime)}
      </span>
    </div>
  )
}

function PhoneItem({ phone }: { phone: PhoneNumberDto }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-secondary px-3 py-2">
      <span className="text-sm font-medium text-foreground" dir="ltr">{phone.number}</span>
      {phone.type && <span className="text-xs text-muted">{phone.type}</span>}
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto" dir="rtl">
      <Skeleton className="h-4 w-64 rounded" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// ── Props ──────────────────────────────────────────────────────────────────────

type Props = {
  singularLabel: string
  backRoute: string
  showVisitPrice?: boolean
  branchApi: {
    getBranchDetails: (businessId: string, id: string) => Promise<BranchDetails>
    deleteBranch: (businessId: string, id: string) => Promise<void>
  }
  branchHooks: {
    useDeleteBranch: (id: string) => { mutate: (branchId: string, opts?: { onSuccess?: () => void; onError?: () => void }) => void; isPending: boolean }
  }
  useParentDetails: (id: string | null) => { data?: { name: string }; isLoading: boolean }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function BranchDetailPage({
  singularLabel,
  backRoute,
  showVisitPrice = false,
  branchApi,
  branchHooks,
  useParentDetails,
}: Props) {
  const { id: businessId, branchId } = useParams<{ id: string; branchId: string }>()
  const navigate = useNavigate()
  const [showDelete, setShowDelete] = useState(false)

  const { data: parent } = useParentDetails(businessId ?? null)
  const deleteMut = branchHooks.useDeleteBranch(businessId!)

  const { data: branch, isLoading, isError } = useQuery({
    queryKey: ['branch-detail', businessId, branchId],
    queryFn: () => branchApi.getBranchDetails(businessId!, branchId!),
    enabled: !!businessId && !!branchId,
  })

  if (isLoading) return <PageSkeleton />

  if (isError || !branch) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted" dir="rtl">
        <AlertCircle className="h-12 w-12 text-danger" />
        <p className="text-sm">تعذّر تحميل بيانات الفرع</p>
        <Button variant="ghost" onPress={() => navigate(`${backRoute}/${businessId}/branches`)}>
          العودة للفروع
        </Button>
      </div>
    )
  }

  return (
    <div dir="rtl" className="max-w-5xl mx-auto pb-12">
      {/* ── Breadcrumbs ── */}
      <Breadcrumbs className="mb-4" onAction={(key) => navigate(String(key))}>
        <Breadcrumbs.Item id={backRoute}>{singularLabel}</Breadcrumbs.Item>
        {parent && (
          <Breadcrumbs.Item id={`${backRoute}/${businessId}`}>{parent.name}</Breadcrumbs.Item>
        )}
        <Breadcrumbs.Item id={`${backRoute}/${businessId}/branches`}>الفروع</Breadcrumbs.Item>
        <Breadcrumbs.Item>{branch.name}</Breadcrumbs.Item>
      </Breadcrumbs>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">{branch.name}</h1>
            {(branch.city || branch.governorate) && (
              <p className="text-sm text-muted mt-0.5">
                {[branch.city, branch.governorate].filter(Boolean).join(' - ')}
              </p>
            )}
            {showVisitPrice && branch.visitPrice != null && (
              <Chip size="sm" variant="soft" color="success" className="mt-1.5">
                {branch.visitPrice} ج.م
              </Chip>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onPress={() => navigate(`${backRoute}/${businessId}/branches/${branchId}/edit`)}
          >
            <Pencil className="h-4 w-4" />
            تعديل
          </Button>
          <Button
            variant="danger-soft"
            size="sm"
            isIconOnly
            onPress={() => setShowDelete(true)}
            aria-label="حذف الفرع"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* ── Content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Basic info */}
        <SectionCard icon={<MapPin className="h-4 w-4" />} label="المعلومات الأساسية">
          <div className="flex flex-col gap-2">
            {branch.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 text-muted shrink-0 mt-0.5" />
                <span className="text-foreground">{branch.address}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted">المحافظة</span>
              <span className="text-foreground font-medium">{branch.governorate || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">المدينة</span>
              <span className="text-foreground font-medium">{branch.city || '—'}</span>
            </div>
            {showVisitPrice && (
              <div className="flex justify-between text-sm">
                <span className="text-muted">سعر الكشف</span>
                <span className="text-success font-bold">
                  {branch.visitPrice != null ? `${branch.visitPrice} ج.م` : '—'}
                </span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Phone numbers */}
        <SectionCard icon={<Phone className="h-4 w-4" />} label="أرقام التواصل">
          {branch.phoneNumbers.length > 0 ? (
            <div className="flex flex-col gap-2">
              {branch.phoneNumbers.map((p, i) => <PhoneItem key={i} phone={p} />)}
            </div>
          ) : (
            <p className="text-sm text-muted">لا توجد أرقام</p>
          )}
        </SectionCard>

        {/* Working days */}
        <SectionCard icon={<Clock className="h-4 w-4" />} label="مواعيد العمل">
          {branch.workingDays.length > 0 ? (
            <div className="flex flex-col gap-2">
              {branch.workingDays.map((d) => <WorkingDayRow key={d.day} day={d} />)}
            </div>
          ) : (
            <p className="text-sm text-muted">لم يتم تحديد مواعيد العمل</p>
          )}
        </SectionCard>

        {/* Map */}
        {branch.latitude != null && branch.longitude != null && (
          <div className="lg:col-span-1">
            <SectionCard icon={<MapPin className="h-4 w-4" />} label="الموقع على الخريطة">
              <MapView lat={branch.latitude} lng={branch.longitude} height={240} />
            </SectionCard>
          </div>
        )}
      </div>

      {/* ── Delete confirmation ── */}
      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => {
          deleteMut.mutate(branchId!, {
            onSuccess: () => {
              toast.success('تم حذف الفرع بنجاح')
              navigate(`${backRoute}/${businessId}/branches`)
            },
            onError: () => toast.danger('حدث خطأ أثناء الحذف'),
          })
        }}
        isPending={deleteMut.isPending}
        title="حذف الفرع"
        message={`هل أنت متأكد من حذف فرع "${branch.name}"؟`}
      />
    </div>
  )
}
