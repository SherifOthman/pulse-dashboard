import { StatCard } from '@/components/stat-card'
import { PageHeader } from '@/components/page-header'
import { Card } from '@heroui/react'
import { Stethoscope, Pill, FlaskConical, Scan, HeartPulse } from 'lucide-react'
import { useDashboardStats } from './use-dashboard-stats'

export function OverviewPage() {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <div dir="rtl">
      <PageHeader
        title="لوحة التحكم"
        subtitle="مرحباً بك في نظام إدارة تطبيق نبض الصحي"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="الأطباء"
          value={stats?.doctorsCount}
          icon={<Stethoscope className="h-6 w-6" />}
          iconColor="text-primary"
          isLoading={isLoading}
        />
        <StatCard
          label="الصيدليات"
          value={stats?.pharmaciesCount}
          icon={<Pill className="h-6 w-6" />}
          iconColor="text-success"
          isLoading={isLoading}
        />
        <StatCard
          label="المختبرات"
          value={stats?.labsCount}
          icon={<FlaskConical className="h-6 w-6" />}
          iconColor="text-warning"
          isLoading={isLoading}
        />
        <StatCard
          label="مراكز الأشعة"
          value={stats?.radiologyCount}
          icon={<Scan className="h-6 w-6" />}
          iconColor="text-danger"
          isLoading={isLoading}
        />
      </div>

      <Card className="mb-6">
        <Card.Content className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-primary">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-foreground text-lg font-bold">تطبيق نبض الصحي</h2>
              <p className="text-muted mt-1 text-sm leading-relaxed">
                منصة متكاملة لإدارة الخدمات الصحية في مصر. تمكنك من إدارة الأطباء، الصيدليات،
                المختبرات، ومراكز الأشعة في مختلف المحافظات والمدن.
              </p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}
