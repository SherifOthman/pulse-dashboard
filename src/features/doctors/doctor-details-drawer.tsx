import { Button, Chip, Drawer, Separator, Skeleton } from '@heroui/react'
import {
  MapPin,
  Stethoscope,
  Star,
  User,
  FileText,
  Pencil,
  Trash2,
  UserRound,
  Phone,
  Clock,
  Building2,
  Tag,
  AlertCircle,
} from 'lucide-react'
import type { DoctorDto, WorkingDayDto } from '@/types'
import { useDoctorDetails } from './use-doctors'

// ── Day name map (0=Sunday … 6=Saturday) ──────────────────────────────────────
const DAY_NAMES: Record<number, string> = {
  0: 'الأحد',
  1: 'الاثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت',
}

// ── Props ─────────────────────────────────────────────────────────────────────
type Props = {
  doctor: DoctorDto | null
  isOpen: boolean
  onClose: () => void
  onEdit: (doctor: DoctorDto) => void
  onDelete: (doctor: DoctorDto) => void
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-muted">{icon}</span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-sm text-muted shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-left">{value || '—'}</span>
    </div>
  )
}

function WorkingDayRow({ day }: { day: WorkingDayDto }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-secondary px-3 py-2">
      <span className="text-sm font-medium text-foreground">{DAY_NAMES[day.day] ?? `يوم ${day.day}`}</span>
      <span className="text-sm text-muted font-mono" dir="ltr">
        {day.startTime} – {day.endTime}
      </span>
    </div>
  )
}

function SkeletonDrawer() {
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

// ── Main component ────────────────────────────────────────────────────────────

export function DoctorDetailsDrawer({ doctor, isOpen, onClose, onEdit, onDelete }: Props) {
  const { data: details, isLoading, isError } = useDoctorDetails(
    isOpen && doctor ? doctor.id : null
  )

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <Drawer.Content placement="right">
        <Drawer.Dialog>
          <Drawer.CloseTrigger />

          <Drawer.Body dir="rtl" className="p-0 overflow-y-auto flex flex-col gap-0">
            {isLoading ? (
              <SkeletonDrawer />
            ) : isError ? (
              <div className="flex flex-col items-center justify-center gap-3 p-10 text-muted">
                <AlertCircle className="h-8 w-8 text-danger" />
                <span className="text-sm">تعذّر تحميل البيانات</span>
              </div>
            ) : details ? (
              <>
                {/* ── Cover image ── */}
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
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-surface bg-primary/10 overflow-hidden">
                      {details.profileImageUrl ? (
                        <img
                          src={details.profileImageUrl}
                          alt={details.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound className="h-7 w-7 text-primary" />
                      )}
                    </div>
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
                        {doctor?.gender === 'Male' && (
                          <Chip size="sm" variant="soft" color="default">ذكر</Chip>
                        )}
                        {doctor?.gender === 'Female' && (
                          <Chip size="sm" variant="soft" color="default">أنثى</Chip>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Stats ── */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
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
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs text-muted text-center leading-tight">
                        {details.city}
                      </span>
                      <span className="text-xs text-muted text-center leading-tight">
                        {details.governorate}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* ── Basic info ── */}
                <div className="px-5 py-4 flex flex-col gap-0">
                  <SectionTitle icon={<User className="h-4 w-4" />} label="المعلومات الأساسية" />
                  {details.address && <InfoRow label="العنوان" value={details.address} />}
                  <InfoRow label="المحافظة" value={details.governorate} />
                  <InfoRow label="المدينة" value={details.city} />
                  {details.visitPrice != null && (
                    <InfoRow label="سعر الكشف" value={`${details.visitPrice} ج.م`} />
                  )}
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

                {/* ── Branches ── */}
                {details.branches.length > 0 && (
                  <>
                    <Separator />
                    <div className="px-5 py-4">
                      <SectionTitle icon={<Building2 className="h-4 w-4" />} label="الفروع" />
                      <div className="flex flex-col gap-3">
                        {details.branches.map((br) => (
                          <div key={br.id} className="rounded-xl border border-divider bg-surface-secondary p-3 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              {br.profileImageUrl ? (
                                <img src={br.profileImageUrl} alt={br.name} className="h-8 w-8 rounded-lg object-cover" />
                              ) : (
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Building2 className="h-4 w-4 text-primary" />
                                </div>
                              )}
                              <span className="text-sm font-semibold text-foreground">{br.name}</span>
                            </div>
                            {br.address && (
                              <div className="flex items-center gap-1.5 text-xs text-muted">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {br.address}
                              </div>
                            )}
                            {br.phoneNumbers.map((p, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs text-muted">
                                <Phone className="h-3 w-3 shrink-0" />
                                <span dir="ltr">{p.number}</span>
                              </div>
                            ))}
                            {br.workingDays.length > 0 && (
                              <div className="flex flex-col gap-1 mt-1">
                                {br.workingDays.map((d) => (
                                  <div key={d.day} className="flex justify-between text-xs">
                                    <span className="text-foreground">{DAY_NAMES[d.day]}</span>
                                    <span className="text-muted font-mono" dir="ltr">{d.startTime} – {d.endTime}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
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
                      <SectionTitle icon={<FileText className="h-4 w-4" />} label="نبذة عن الطبيب" />
                      <p className="text-sm text-muted leading-relaxed">{details.description}</p>
                    </div>
                  </>
                )}

                {/* ── Recent reviews ── */}
                {details.testimonials.length > 0 && (
                  <>
                    <Separator />
                    <div className="px-5 py-4">
                      <SectionTitle icon={<Star className="h-4 w-4" />} label="آخر التقييمات" />
                      <div className="flex flex-col gap-3">
                        {details.testimonials.map((t) => (
                          <div key={t.id} className="rounded-xl bg-surface-secondary p-3 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">
                                {t.userName || 'مستخدم'}
                              </span>
                              <div className="flex items-center gap-1 text-warning text-xs">
                                {'★'.repeat(t.rating)}
                                <span className="text-muted">({t.rating}/5)</span>
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

                {/* bottom padding */}
                <div className="h-4" />
              </>
            ) : null}
          </Drawer.Body>

          {/* ── Footer actions ── */}
          {doctor && (
            <div className="border-t border-divider px-5 py-4 flex gap-3 shrink-0" dir="rtl">
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
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}
