import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Chip,
  Separator,
  Skeleton,
  Tabs,
  toast,
} from '@heroui/react'
import {
  AlertCircle,
  Building2,
  Clock,
  FileText,
  MapPin,
  Pencil,
  Phone,
  Star,
  Stethoscope,
  Tag,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useDoctorDetails, useDeleteDoctor } from './use-doctors'
import { ConfirmModal } from '@/components/confirm-modal'
import { MapView } from '@/components/map-view'
import type { WorkingDayDto, PhoneNumberDto, BranchDto, TestimonialDto } from './types'

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

// ── Skeleton loading state ─────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto" dir="rtl">
      <Skeleton className="h-4 w-48 rounded" />
      <Skeleton className="h-52 w-full rounded-2xl" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-6 w-52 rounded" />
          <Skeleton className="h-5 w-32 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  )
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

function BranchCard({ branch }: { branch: BranchDto }) {
  return (
    <Card variant="secondary" className="p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          {branch.profileImageUrl ? (
            <img src={branch.profileImageUrl} alt={branch.name} className="h-full w-full rounded-lg object-cover" />
          ) : (
            <Building2 className="h-4 w-4 text-primary" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{branch.name}</p>
          {(branch.city || branch.governorate) && (
            <p className="text-xs text-muted">{[branch.city, branch.governorate].filter(Boolean).join(' - ')}</p>
          )}
        </div>
        {branch.visitPrice != null && (
          <Chip size="sm" variant="soft" color="success" className="mr-auto">
            {branch.visitPrice} ج.م
          </Chip>
        )}
      </div>
      {branch.address && (
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <MapPin className="h-3 w-3 shrink-0" />
          {branch.address}
        </div>
      )}
      {branch.phoneNumbers.length > 0 && (
        <div className="flex flex-col gap-1">
          {branch.phoneNumbers.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-muted">
              <Phone className="h-3 w-3 shrink-0" />
              <span dir="ltr">{p.number}</span>
            </div>
          ))}
        </div>
      )}
      {branch.workingDays.length > 0 && (
        <div className="flex flex-col gap-0.5 mt-1">
          {branch.workingDays.map((d) => (
            <div key={d.day} className="flex justify-between text-xs">
              <span className="text-foreground">{DAY_NAMES[d.day]}</span>
              <span className="text-muted font-mono" dir="ltr">
                {formatTime(d.startTime)} – {formatTime(d.endTime)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function TestimonialCard({ t }: { t: TestimonialDto }) {
  return (
    <Card variant="secondary" className="p-3 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{t.userName || 'مستخدم'}</span>
        <div className="flex items-center gap-0.5 text-warning text-xs">
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-warning" />
          ))}
          <span className="text-muted mr-1">({t.rating}/5)</span>
        </div>
      </div>
      {t.text && <p className="text-xs text-muted leading-relaxed">{t.text}</p>}
    </Card>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function DoctorDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: details, isLoading, isError } = useDoctorDetails(id ?? null)
  const deleteMutation = useDeleteDoctor()
  const [showDelete, setShowDelete] = useState(false)

  if (isLoading) return <PageSkeleton />

  if (isError || !details) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted" dir="rtl">
        <AlertCircle className="h-12 w-12 text-danger" />
        <p className="text-sm">تعذّر تحميل بيانات الطبيب</p>
        <Button variant="ghost" onPress={() => navigate('/doctors')}>
          العودة للأطباء
        </Button>
      </div>
    )
  }

  return (
    <div dir="rtl" className="max-w-5xl mx-auto pb-12">
      {/* ── Breadcrumbs ── */}
      <Breadcrumbs className="mb-4" onAction={(key) => navigate(String(key))}>
        <Breadcrumbs.Item id="/doctors">الأطباء</Breadcrumbs.Item>
        <Breadcrumbs.Item>{details.name}</Breadcrumbs.Item>
      </Breadcrumbs>

      {/* ── Cover image ── */}
      <div className="relative h-52 w-full overflow-hidden rounded-2xl bg-surface-secondary mb-6">
        {details.coverImageUrl || details.profileImageUrl ? (
          <img
            src={details.coverImageUrl ?? details.profileImageUrl!}
            alt={details.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Stethoscope className="h-16 w-16 text-muted/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* ── Profile header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Badge.Anchor>
            <Avatar size="lg" className="border-2 border-surface shadow-sm">
              {details.profileImageUrl ? (
                <Avatar.Image src={details.profileImageUrl} alt={details.name} />
              ) : null}
              <Avatar.Fallback>
                <UserRound className="h-7 w-7" />
              </Avatar.Fallback>
            </Avatar>
            {/* Online-style dot for gender */}
            <Badge
              color={details.gender === 0 ? 'accent' : 'danger'}
              size="sm"
              placement="bottom-right"
            />
          </Badge.Anchor>

          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">{details.name}</h1>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {details.specialization && (
                <Chip size="sm" variant="soft" color="accent">{details.specialization}</Chip>
              )}
              <Chip size="sm" variant="soft" color="default">
                {details.gender === 0 ? 'ذكر' : 'أنثى'}
              </Chip>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onPress={() => navigate(`/doctors/${id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
            تعديل
          </Button>
          <Button
            variant="danger-soft"
            size="sm"
            isIconOnly
            onPress={() => setShowDelete(true)}
            aria-label="حذف الطبيب"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-secondary py-4 px-2">
          <div className="flex items-center gap-1 text-warning">
            <Star className="h-4 w-4 fill-warning" />
            <span className="text-lg font-bold">{details.averageRating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-muted">التقييم ({details.totalRatings})</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-secondary py-4 px-2">
          <span className="text-lg font-bold text-success">
            {details.visitPrice != null ? `${details.visitPrice}` : '—'}
          </span>
          <span className="text-xs text-muted">ج.م / الكشف</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-secondary py-4 px-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground truncate max-w-full px-1">{details.city}</span>
          <span className="text-xs text-muted truncate max-w-full px-1">{details.governorate}</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-secondary py-4 px-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-lg font-bold">{details.branches.length}</span>
          <span className="text-xs text-muted">فرع</span>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* ── Tabbed content ── */}
      <Tabs defaultSelectedKey="info" className="w-full">
        <Tabs.ListContainer>
          <Tabs.List aria-label="تفاصيل الطبيب">
            <Tabs.Tab id="info">
              المعلومات
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="schedule">
              المواعيد
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="branches">
              الفروع {details.branches.length > 0 && `(${details.branches.length})`}
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="reviews">
              التقييمات {details.testimonials.length > 0 && `(${details.testimonials.length})`}
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        {/* ── Info tab ── */}
        <Tabs.Panel id="info" className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard icon={<MapPin className="h-4 w-4" />} label="المعلومات الأساسية">
              <div className="flex flex-col gap-2">
                {details.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-muted shrink-0 mt-0.5" />
                    <span className="text-foreground">{details.address}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted">المحافظة</span>
                  <span className="text-foreground font-medium">{details.governorate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">المدينة</span>
                  <span className="text-foreground font-medium">{details.city}</span>
                </div>
                {details.visitPrice != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">سعر الكشف</span>
                    <span className="text-success font-bold">{details.visitPrice} ج.م</span>
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard icon={<Phone className="h-4 w-4" />} label="أرقام التواصل">
              {details.phoneNumbers.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {details.phoneNumbers.map((p, i) => <PhoneItem key={i} phone={p} />)}
                </div>
              ) : (
                <p className="text-sm text-muted">لا توجد أرقام</p>
              )}
            </SectionCard>

            {details.services.length > 0 && (
              <SectionCard icon={<Tag className="h-4 w-4" />} label="الخدمات">
                <div className="flex flex-wrap gap-2">
                  {details.services.map((s, i) => (
                    <Chip key={i} size="sm" variant="soft" color="default">{s.name}</Chip>
                  ))}
                </div>
              </SectionCard>
            )}

            {details.description && (
              <SectionCard icon={<FileText className="h-4 w-4" />} label="نبذة عن الطبيب">
                <p className="text-sm text-muted leading-relaxed">{details.description}</p>
              </SectionCard>
            )}

            {/* ── Location map — only when coordinates are set ── */}
            {details.latitude != null && details.longitude != null && (
              <div className="lg:col-span-2">
                <SectionCard icon={<MapPin className="h-4 w-4" />} label="الموقع على الخريطة">
                  <MapView
                    lat={details.latitude}
                    lng={details.longitude}
                    height={260}
                  />
                </SectionCard>
              </div>
            )}
          </div>
        </Tabs.Panel>

        {/* ── Schedule tab ── */}
        <Tabs.Panel id="schedule" className="pt-4">
          <SectionCard icon={<Clock className="h-4 w-4" />} label="مواعيد العمل">
            {details.workingDays.length > 0 ? (
              <div className="flex flex-col gap-2">
                {details.workingDays.map((d) => <WorkingDayRow key={d.day} day={d} />)}
              </div>
            ) : (
              <p className="text-sm text-muted">لم يتم تحديد مواعيد العمل</p>
            )}
          </SectionCard>
        </Tabs.Panel>

        {/* ── Branches tab ── */}
        <Tabs.Panel id="branches" className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted">
              {details.branches.length > 0
                ? `${details.branches.length} فرع مسجل`
                : 'لا توجد فروع'}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onPress={() => navigate(`/doctors/${id}/branches`)}
            >
              <Building2 className="h-4 w-4" />
              إدارة الفروع
            </Button>
          </div>
          {details.branches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {details.branches.map((br) => <BranchCard key={br.id} branch={br} />)}
            </div>
          ) : (
            <Card className="p-8 flex flex-col items-center gap-3 text-muted">
              <Building2 className="h-10 w-10 opacity-30" />
              <p className="text-sm">لا توجد فروع مضافة بعد</p>
            </Card>
          )}
        </Tabs.Panel>

        {/* ── Reviews tab ── */}
        <Tabs.Panel id="reviews" className="pt-4">
          {details.testimonials.length > 0 ? (
            <div className="flex flex-col gap-3">
              {details.testimonials.map((t) => <TestimonialCard key={t.id} t={t} />)}
            </div>
          ) : (
            <Card className="p-8 flex flex-col items-center gap-3 text-muted">
              <Star className="h-10 w-10 opacity-30" />
              <p className="text-sm">لا توجد تقييمات حتى الآن</p>
            </Card>
          )}
        </Tabs.Panel>
      </Tabs>

      {/* ── Delete confirmation ── */}
      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => {
          deleteMutation.mutate(id!, {
            onSuccess: () => { toast.success('تم حذف الطبيب'); navigate('/doctors') },
            onError: () => toast.danger('حدث خطأ أثناء الحذف'),
          })
        }}
        title="حذف الطبيب"
        message={`هل أنت متأكد من حذف "${details.name}"؟ سيتم حذف جميع الفروع المرتبطة به.`}
      />
    </div>
  )
}
