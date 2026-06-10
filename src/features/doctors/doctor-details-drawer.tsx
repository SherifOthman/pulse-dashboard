/**
 * DoctorDetailsDrawer
 *
 * Slide-in right drawer showing a quick-view of doctor details.
 * Controlled externally via isOpen / onClose.
 */
import {
  Avatar,
  Badge,
  Button,
  Chip,
  Drawer,
  Separator,
  Skeleton,
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
import { useDoctorDetails } from './use-doctors'
import type { DoctorListItem, WorkingDayDto } from './types'

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

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-muted">{icon}</span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </div>
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

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-5">
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-14 w-14 rounded-full shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
      <Skeleton className="h-px w-full" />
      {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
    </div>
  )
}

// ── Props ──────────────────────────────────────────────────────────────────────

type Props = {
  doctor: DoctorListItem | null
  isOpen: boolean
  onClose: () => void
  onEdit: (doctor: DoctorListItem) => void
  onDelete: (doctor: DoctorListItem) => void
}

// ── Main component ─────────────────────────────────────────────────────────────

export function DoctorDetailsDrawer({ doctor, isOpen, onClose, onEdit, onDelete }: Props) {
  const { data: details, isLoading, isError } = useDoctorDetails(
    isOpen && doctor ? doctor.id : null,
  )

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <Drawer.Content placement="right">
        <Drawer.Dialog aria-label={doctor?.name ?? 'تفاصيل الطبيب'}>
          <Drawer.CloseTrigger />

          <Drawer.Body dir="rtl" className="p-0 overflow-y-auto flex flex-col">
            {isLoading ? (
              <DrawerSkeleton />
            ) : isError ? (
              <div className="flex flex-col items-center justify-center gap-3 p-10 text-muted">
                <AlertCircle className="h-8 w-8 text-danger" />
                <span className="text-sm">تعذّر تحميل البيانات</span>
              </div>
            ) : details ? (
              <>
                {/* ── Cover ── */}
                <div className="relative h-44 w-full shrink-0 overflow-hidden bg-surface-secondary">
                  {details.coverImageUrl || details.profileImageUrl ? (
                    <img
                      src={details.coverImageUrl ?? details.profileImageUrl!}
                      alt={details.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Stethoscope className="h-14 w-14 text-muted/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                </div>

                {/* ── Profile header ── */}
                <div className="px-5 pt-4 pb-2">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge.Anchor>
                      <Avatar size="md" className="border-2 border-surface shrink-0">
                        {details.profileImageUrl ? (
                          <Avatar.Image src={details.profileImageUrl} alt={details.name} />
                        ) : null}
                        <Avatar.Fallback>
                          <UserRound className="h-6 w-6" />
                        </Avatar.Fallback>
                      </Avatar>
                      <Badge
                        color={details.gender === 0 ? 'accent' : 'danger'}
                        size="sm"
                        placement="bottom-right"
                      />
                    </Badge.Anchor>

                    <div className="flex flex-col gap-1.5">
                      <h2 className="text-lg font-bold text-foreground leading-tight">
                        {details.name}
                      </h2>
                      <div className="flex flex-wrap gap-1.5">
                        {details.specialization && (
                          <Chip size="sm" variant="soft" color="accent">
                            {details.specialization}
                          </Chip>
                        )}
                        <Chip size="sm" variant="soft" color="default">
                          {details.gender === 0 ? 'ذكر' : 'أنثى'}
                        </Chip>
                      </div>
                    </div>
                  </div>

                  {/* ── Stats ── */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-secondary py-3">
                      <div className="flex items-center gap-1 text-warning">
                        <Star className="h-3.5 w-3.5 fill-warning" />
                        <span className="text-sm font-bold">{details.averageRating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-muted">التقييم</span>
                      <span className="text-xs text-muted">({details.totalRatings})</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-secondary py-3">
                      <span className="text-sm font-bold text-success">
                        {details.visitPrice != null ? `${details.visitPrice}` : '—'}
                      </span>
                      <span className="text-xs text-muted">ج.م / كشف</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-secondary py-3 px-1">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm font-bold">{details.branches.length}</span>
                      <span className="text-xs text-muted">فرع</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* ── Basic info ── */}
                <div className="px-5 py-4">
                  <SectionTitle icon={<MapPin className="h-4 w-4" />} label="الموقع" />
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">المحافظة</span>
                      <span className="font-medium text-foreground">{details.governorate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">المدينة</span>
                      <span className="font-medium text-foreground">{details.city}</span>
                    </div>
                    {details.address && (
                      <div className="flex items-start gap-1.5 text-muted">
                        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{details.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Phone numbers ── */}
                {details.phoneNumbers.length > 0 && (
                  <>
                    <Separator />
                    <div className="px-5 py-4">
                      <SectionTitle icon={<Phone className="h-4 w-4" />} label="أرقام التواصل" />
                      <div className="flex flex-col gap-2">
                        {details.phoneNumbers.map((p, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg bg-surface-secondary px-3 py-2">
                            <span className="text-sm font-medium text-foreground" dir="ltr">{p.number}</span>
                            {p.type && <span className="text-xs text-muted">{p.type}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Working days ── */}
                {details.workingDays.length > 0 && (
                  <>
                    <Separator />
                    <div className="px-5 py-4">
                      <SectionTitle icon={<Clock className="h-4 w-4" />} label="مواعيد العمل" />
                      <div className="flex flex-col gap-2">
                        {details.workingDays.map((d) => (
                          <WorkingDayRow key={d.day} day={d} />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Services ── */}
                {details.services.length > 0 && (
                  <>
                    <Separator />
                    <div className="px-5 py-4">
                      <SectionTitle icon={<Tag className="h-4 w-4" />} label="الخدمات" />
                      <div className="flex flex-wrap gap-2">
                        {details.services.map((s, i) => (
                          <Chip key={i} size="sm" variant="soft" color="default">
                            {s.name}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Description ── */}
                {details.description && (
                  <>
                    <Separator />
                    <div className="px-5 py-4">
                      <SectionTitle icon={<FileText className="h-4 w-4" />} label="نبذة" />
                      <p className="text-sm text-muted leading-relaxed">{details.description}</p>
                    </div>
                  </>
                )}

                {/* ── Recent testimonials ── */}
                {details.testimonials.length > 0 && (
                  <>
                    <Separator />
                    <div className="px-5 py-4">
                      <SectionTitle icon={<Star className="h-4 w-4" />} label="آخر التقييمات" />
                      <div className="flex flex-col gap-3">
                        {details.testimonials.slice(0, 3).map((t) => (
                          <div key={t.id} className="rounded-xl bg-surface-secondary p-3 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">
                                {t.userName || 'مستخدم'}
                              </span>
                              <div className="flex items-center gap-0.5 text-warning text-xs">
                                {Array.from({ length: t.rating }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-warning" />
                                ))}
                              </div>
                            </div>
                            {t.text && (
                              <p className="text-xs text-muted leading-relaxed">{t.text}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="h-4 shrink-0" />
              </>
            ) : null}
          </Drawer.Body>

          {/* ── Footer actions ── */}
          {doctor && (
            <Drawer.Footer dir="rtl" className="flex gap-3">
              <Button
                variant="primary"
                className="flex-1"
                onPress={() => { onClose(); onEdit(doctor) }}
              >
                <Pencil className="h-4 w-4" />
                تعديل
              </Button>
              <Button
                variant="danger-soft"
                isIconOnly
                onPress={() => { onClose(); onDelete(doctor) }}
                aria-label="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Drawer.Footer>
          )}
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}
