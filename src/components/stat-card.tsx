import { Card, Skeleton } from '@heroui/react'
import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: number | undefined
  icon: ReactNode
  iconColor?: string
  isLoading?: boolean
}

export function StatCard({ label, value, icon, iconColor = 'text-primary', isLoading }: StatCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <Card.Content className="p-5">
        <div className="flex items-center gap-4">
          <div className={`bg-default-100 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconColor}`}>
            {icon}
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-muted text-sm font-medium">{label}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-20 rounded-lg" />
            ) : (
              <p className="text-foreground text-2xl font-bold">
                {value !== undefined ? value.toLocaleString('ar-EG') : '—'}
              </p>
            )}
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}
