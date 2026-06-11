import { useNavigate } from 'react-router-dom'
import { Avatar, Badge, Card, Chip, Separator, Skeleton } from '@heroui/react'
import {
  Building2,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  MapPin,
  Pill,
  Scan,
  Star,
  Stethoscope,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react'
import { useDashboardStats, type TopDoctorDto, type RecentDoctorDto, type SpecializationStatDto, type GovernorateStatDto } from './use-dashboard-stats'
import { useMe } from '@/features/auth/use-me'
import { toAbsoluteUrl } from '@/services/image-url'

// ── Greeting helper ────────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'مساء الخير'
  return 'مساء النور'
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  color,
  isLoading,
  onClick,
}: {
  label: string
  value: number | undefined
  icon: React.ReactNode
  color: string
  isLoading: boolean
  onClick?: () => void
}) {
  return (
    <Card
      className={`transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}
      onClick={onClick}
    >
      <Card.Content className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted font-medium">{label}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 rounded-lg" />
            ) : (
              <p className="text-2xl font-bold text-foreground">
                {value !== undefined ? value.toLocaleString('ar-EG') : '—'}
              </p>
            )}
          </div>
          <div className={`h-12 w-12 shrink-0 flex items-center justify-center rounded-xl ${color}`}>
            {icon}
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-muted">{icon}</span>
      <div>
        <h2 className="text-base font-bold text-foreground leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
    </div>
  )
}

// ── Top doctor row ─────────────────────────────────────────────────────────────
function TopDoctorRow({ doctor, rank, onClick }: { doctor: TopDoctorDto; rank: number; onClick: () => void }) {
  const rankColors = ['text-yellow-500', 'text-slate-400', 'text-amber-600']
  const rankSymbols = ['🥇', '🥈', '🥉']

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-secondary transition-colors text-right"
    >
      <span className="text-lg w-7 shrink-0 text-center">
        {rank <= 3 ? rankSymbols[rank - 1] : (
          <span className={`text-sm font-bold ${rankColors[0]}`}>{rank}</span>
        )}
      </span>

      <Avatar size="sm">
        {doctor.profileImageUrl
          ? <Avatar.Image src={toAbsoluteUrl(doctor.profileImageUrl) ?? doctor.profileImageUrl} alt={doctor.name} />
          : null}
        <Avatar.Fallback>
          <UserRound className="h-4 w-4" />
        </Avatar.Fallback>
      </Avatar>

      <div className="flex flex-col flex-1 min-w-0 text-right">
        <span className="text-sm font-semibold text-foreground truncate">{doctor.name}</span>
        <span className="text-xs text-muted truncate">{doctor.specialization}</span>
      </div>

      <div className="flex flex-col items-end shrink-0 gap-0.5">
        <div className="flex items-center gap-1 text-warning">
          <Star className="h-3.5 w-3.5 fill-warning" />
          <span className="text-sm font-bold">{doctor.averageRating.toFixed(1)}</span>
        </div>
        <span className="text-xs text-muted">({doctor.totalRatings})</span>
      </div>
    </button>
  )
}

// ── Recent doctor card ─────────────────────────────────────────────────────────
function RecentDoctorCard({ doctor, onClick }: { doctor: RecentDoctorDto; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-secondary transition-colors w-full text-right"
    >
      <Badge.Anchor>
        <Avatar size="sm">
          {doctor.profileImageUrl
            ? <Avatar.Image src={toAbsoluteUrl(doctor.profileImageUrl) ?? doctor.profileImageUrl} alt={doctor.name} />
            : null}
          <Avatar.Fallback>
            <UserRound className="h-4 w-4" />
          </Avatar.Fallback>
        </Avatar>
        <Badge
          color={doctor.gender === 0 ? 'accent' : 'danger'}
          size="sm"
          placement="bottom-right"
        />
      </Badge.Anchor>

      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-semibold text-foreground truncate">{doctor.name}</span>
        <div className="flex items-center gap-1 text-xs text-muted">
          <span className="truncate">{doctor.specialization}</span>
          <span>•</span>
          <span className="truncate">{doctor.governorate}</span>
        </div>
      </div>

      {doctor.visitPrice != null && (
        <span className="text-xs font-medium text-success shrink-0">
          {doctor.visitPrice} ج.م
        </span>
      )}
    </button>
  )
}

// ── Bar chart row ──────────────────────────────────────────────────────────────
function BarRow({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground font-medium truncate max-w-[60%]">{label}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-muted text-xs">{count} طبيب</span>
          <span className="text-xs font-semibold text-foreground w-8 text-left">{pct}%</span>
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-surface-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Specialization chart ───────────────────────────────────────────────────────
const SPEC_COLORS = [
  'bg-primary', 'bg-accent', 'bg-success', 'bg-warning',
  'bg-danger', 'bg-cyan-500', 'bg-purple-500', 'bg-pink-500',
]

function SpecializationChart({ data, isLoading }: { data: SpecializationStatDto[]; isLoading: boolean }) {
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <Card>
      <Card.Content className="p-5">
        <SectionHeader
          icon={<GraduationCap className="h-4 w-4" />}
          title="توزيع التخصصات"
          subtitle="أكثر التخصصات انتشاراً"
        />
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted text-center py-6">لا توجد بيانات</p>
        ) : (
          <div className="flex flex-col gap-3">
            {data.map((item, i) => (
              <BarRow
                key={item.name}
                label={item.name}
                count={item.count}
                total={total}
                color={SPEC_COLORS[i % SPEC_COLORS.length]}
              />
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  )
}

// ── Governorate chart ──────────────────────────────────────────────────────────
const GOV_COLORS = [
  'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500',
  'bg-rose-500', 'bg-orange-500', 'bg-lime-500', 'bg-sky-500',
]

function GovernorateChart({ data, isLoading }: { data: GovernorateStatDto[]; isLoading: boolean }) {
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <Card>
      <Card.Content className="p-5">
        <SectionHeader
          icon={<MapPin className="h-4 w-4" />}
          title="توزيع المحافظات"
          subtitle="أكثر المحافظات من حيث عدد الأطباء"
        />
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted text-center py-6">لا توجد بيانات</p>
        ) : (
          <div className="flex flex-col gap-3">
            {data.map((item, i) => (
              <BarRow
                key={item.name}
                label={item.name}
                count={item.count}
                total={total}
                color={GOV_COLORS[i % GOV_COLORS.length]}
              />
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  )
}

// ── Quick links ────────────────────────────────────────────────────────────────
function QuickLink({
  icon, label, sub, color, onClick,
}: {
  icon: React.ReactNode
  label: string
  sub: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-divider p-3.5 hover:bg-surface-secondary transition-all hover:shadow-sm text-right w-full"
    >
      <div className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-xs text-muted">{sub}</span>
      </div>
    </button>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export function OverviewPage() {
  const { data: stats, isLoading } = useDashboardStats()
  const { data: me } = useMe()
  const navigate = useNavigate()

  const totalServices =
    (stats?.doctorsCount ?? 0) +
    (stats?.pharmaciesCount ?? 0) +
    (stats?.labsCount ?? 0) +
    (stats?.radiologyCount ?? 0)

  return (
    <div dir="rtl" className="flex flex-col gap-6">

      {/* ── Welcome banner ── */}
      <Card className="overflow-hidden">
        <Card.Content className="p-0">
          <div className="relative flex items-center gap-4 p-5 bg-gradient-to-l from-primary/5 via-transparent to-transparent">
            <div className="h-14 w-14 shrink-0 flex items-center justify-center rounded-2xl bg-primary/10">
              <HeartPulse className="h-7 w-7 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-lg font-bold text-foreground">
                {getGreeting()}{me?.fullName ? `، ${me.fullName}` : ''} 👋
              </p>
              <p className="text-sm text-muted">
                {isLoading
                  ? 'جاري تحميل الإحصائيات...'
                  : `يوجد حالياً ${totalServices.toLocaleString('ar-EG')} خدمة صحية مسجلة في المنصة`}
              </p>
            </div>
            {me?.role && (
              <div className="mr-auto shrink-0">
                <Chip
                  size="sm"
                  variant="soft"
                  color={me.role === 'Admin' ? 'warning' : 'default'}
                >
                  {me.role === 'Admin' ? 'مدير النظام' : 'مشرف'}
                </Chip>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* ── Primary stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="الأطباء"
          value={stats?.doctorsCount}
          icon={<Stethoscope className="h-6 w-6" />}
          color="bg-primary/10 text-primary"
          isLoading={isLoading}
          onClick={() => navigate('/doctors')}
        />
        <StatCard
          label="الصيدليات"
          value={stats?.pharmaciesCount}
          icon={<Pill className="h-6 w-6" />}
          color="bg-success/10 text-success"
          isLoading={isLoading}
          onClick={() => navigate('/pharmacies')}
        />
        <StatCard
          label="المختبرات"
          value={stats?.labsCount}
          icon={<FlaskConical className="h-6 w-6" />}
          color="bg-warning/10 text-warning"
          isLoading={isLoading}
          onClick={() => navigate('/labs')}
        />
        <StatCard
          label="مراكز الأشعة"
          value={stats?.radiologyCount}
          icon={<Scan className="h-6 w-6" />}
          color="bg-danger/10 text-danger"
          isLoading={isLoading}
          onClick={() => navigate('/radiology')}
        />
      </div>

      {/* ── Secondary stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="الفروع"
          value={stats?.branchesCount}
          icon={<Building2 className="h-5 w-5" />}
          color="bg-accent/10 text-accent"
          isLoading={isLoading}
        />
        <StatCard
          label="التخصصات"
          value={stats?.specializationsCount}
          icon={<GraduationCap className="h-5 w-5" />}
          color="bg-purple-500/10 text-purple-500"
          isLoading={isLoading}
          onClick={() => navigate('/specializations')}
        />
        <StatCard
          label="المدن"
          value={stats?.citiesCount}
          icon={<MapPin className="h-5 w-5" />}
          color="bg-teal-500/10 text-teal-500"
          isLoading={isLoading}
          onClick={() => navigate('/cities')}
        />
      </div>

      <Separator />

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── Top rated doctors (2/3 width) ── */}
        <Card className="xl:col-span-2">
          <Card.Content className="p-5">
            <SectionHeader
              icon={<TrendingUp className="h-4 w-4" />}
              title="أعلى الأطباء تقييماً"
              subtitle="بناءً على تقييمات المرضى"
            />
            {isLoading ? (
              <div className="flex flex-col gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <Skeleton className="h-5 w-7 rounded" />
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </div>
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                ))}
              </div>
            ) : !stats?.topRatedDoctors.length ? (
              <div className="flex flex-col items-center gap-3 py-10 text-muted">
                <Star className="h-10 w-10 opacity-20" />
                <p className="text-sm">لا توجد تقييمات بعد</p>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {stats.topRatedDoctors.map((d, i) => (
                  <TopDoctorRow
                    key={d.id}
                    doctor={d}
                    rank={i + 1}
                    onClick={() => navigate(`/doctors/${d.id}`)}
                  />
                ))}
              </div>
            )}
          </Card.Content>
        </Card>

        {/* ── Quick links (1/3 width) ── */}
        <Card>
          <Card.Content className="p-5">
            <SectionHeader
              icon={<Users className="h-4 w-4" />}
              title="الوصول السريع"
            />
            <div className="flex flex-col gap-2">
              <QuickLink
                icon={<Stethoscope className="h-5 w-5" />}
                label="إضافة طبيب"
                sub="تسجيل طبيب جديد"
                color="bg-primary/10 text-primary"
                onClick={() => navigate('/doctors/new')}
              />
              <QuickLink
                icon={<Pill className="h-5 w-5" />}
                label="الصيدليات"
                sub="عرض وإدارة الصيدليات"
                color="bg-success/10 text-success"
                onClick={() => navigate('/pharmacies')}
              />
              <QuickLink
                icon={<FlaskConical className="h-5 w-5" />}
                label="المختبرات"
                sub="عرض وإدارة المختبرات"
                color="bg-warning/10 text-warning"
                onClick={() => navigate('/labs')}
              />
              <QuickLink
                icon={<Scan className="h-5 w-5" />}
                label="مراكز الأشعة"
                sub="عرض وإدارة مراكز الأشعة"
                color="bg-danger/10 text-danger"
                onClick={() => navigate('/radiology')}
              />
              <QuickLink
                icon={<GraduationCap className="h-5 w-5" />}
                label="التخصصات"
                sub="إدارة تخصصات الأطباء"
                color="bg-purple-500/10 text-purple-500"
                onClick={() => navigate('/specializations')}
              />
              <QuickLink
                icon={<Building2 className="h-5 w-5" />}
                label="المدن"
                sub="إدارة المحافظات والمدن"
                color="bg-teal-500/10 text-teal-500"
                onClick={() => navigate('/cities')}
              />
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* ── Recent doctors + Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── Recently added doctors ── */}
        <Card>
          <Card.Content className="p-5">
            <SectionHeader
              icon={<Stethoscope className="h-4 w-4" />}
              title="آخر الأطباء المضافين"
              subtitle="أحدث ٦ أطباء تم تسجيلهم"
            />
            {isLoading ? (
              <div className="flex flex-col gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !stats?.recentDoctors.length ? (
              <div className="flex flex-col items-center gap-3 py-10 text-muted">
                <Stethoscope className="h-10 w-10 opacity-20" />
                <p className="text-sm">لا يوجد أطباء مسجلون بعد</p>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {stats.recentDoctors.map((d) => (
                  <RecentDoctorCard
                    key={d.id}
                    doctor={d}
                    onClick={() => navigate(`/doctors/${d.id}`)}
                  />
                ))}
              </div>
            )}
          </Card.Content>
        </Card>

        {/* ── Specialization distribution ── */}
        <SpecializationChart
          data={stats?.specializationStats ?? []}
          isLoading={isLoading}
        />

        {/* ── Governorate distribution ── */}
        <GovernorateChart
          data={stats?.governorateStats ?? []}
          isLoading={isLoading}
        />
      </div>

    </div>
  )
}
