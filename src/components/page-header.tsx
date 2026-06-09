import type { ReactNode } from "react"

type PageHeaderProps = {
  title: string
  subtitle?: string | ReactNode
  action?: ReactNode
  children?: ReactNode
}

export function PageHeader({ title, subtitle, action, children }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
        {subtitle &&
          (typeof subtitle === "string" ? (
            <p className="text-muted mt-1 text-sm">{subtitle}</p>
          ) : (
            <div className="text-muted mt-1 text-sm">{subtitle}</div>
          ))}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
