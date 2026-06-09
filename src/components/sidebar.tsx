import { useLocation, useNavigate } from 'react-router-dom'
import { useMe } from '@/features/auth/use-me'
import { useAuthStore } from '@/auth-store'
import { Button, Separator, Tooltip } from '@heroui/react'
import {
  LayoutDashboard, Stethoscope, Pill, FlaskConical,
  Scan, Building2, GraduationCap, Menu, HeartPulse, Shield, User, LogOut,
  type LucideIcon,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type NavItem = { path: string; label: string; icon: LucideIcon; adminOnly?: boolean }

type SidebarProps = {
  collapsed: boolean
  onToggleCollapse: () => void
  onLinkClick: () => void
}

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { path: '/',               label: 'الرئيسية',        icon: LayoutDashboard },
  { path: '/doctors',        label: 'الأطباء',         icon: Stethoscope     },
  { path: '/pharmacies',     label: 'الصيدليات',       icon: Pill            },
  { path: '/labs',           label: 'المختبرات',       icon: FlaskConical    },
  { path: '/radiology',      label: 'الأشعة',          icon: Scan            },
  { path: '/cities',         label: 'المدن',           icon: Building2       },
  { path: '/specializations',label: 'التخصصات',        icon: GraduationCap   },
  { path: '/users',          label: 'المستخدمين',      icon: Shield, adminOnly: true },
  { path: '/profile',        label: 'الملف الشخصي',   icon: User            },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function isActivePath(current: string, target: string) {
  return target === '/' ? current === '/' : current.startsWith(target)
}

function linkClass(active: boolean, collapsed: boolean) {
  return [
    'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
    collapsed && 'justify-center',
    active
      ? 'bg-surface-tertiary text-foreground font-semibold'
      : 'text-muted hover:bg-surface-secondary hover:text-foreground',
  ].filter(Boolean).join(' ')
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Sidebar({ collapsed, onToggleCollapse, onLinkClick }: SidebarProps) {
  const location     = useLocation()
  const navigate     = useNavigate()
  const role         = useMe().data?.role ?? null
  const clearSession = useAuthStore((s) => s.clearSession)

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || role === 'Admin')

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className={`flex min-h-16 items-center px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <HeartPulse className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-foreground">نبض</h1>
          </div>
        )}
        <Button variant="ghost" size="sm" isIconOnly onPress={onToggleCollapse} className="hidden lg:flex">
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 overflow-auto px-2 py-2">
        <ul className="flex flex-col gap-1">
          {items.map(({ path, label, icon: Icon }) => {
            const active = isActivePath(location.pathname, path)
            const btn = (
              <button
                onClick={() => { navigate(path); onLinkClick() }}
                className={linkClass(active, collapsed)}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
              </button>
            )

            return (
              <li key={path} className="w-full">
                {collapsed ? (
                  <Tooltip delay={300}>
                    <Tooltip.Trigger className="w-full">{btn}</Tooltip.Trigger>
                    <Tooltip.Content placement="right"><p>{label}</p></Tooltip.Content>
                  </Tooltip>
                ) : btn}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <Separator />
      <div className="px-2 py-3">
        {collapsed ? (
          <Tooltip delay={300}>
            <Tooltip.Trigger className="w-full">
              <button
                onClick={handleLogout}
                className="w-full flex justify-center items-center rounded-lg px-3 py-2.5 text-danger hover:bg-danger/10 transition-colors"
              >
                <LogOut className="h-5 w-5 shrink-0" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content placement="right"><p>تسجيل الخروج</p></Tooltip.Content>
          </Tooltip>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">تسجيل الخروج</span>
          </button>
        )}
      </div>
    </div>
  )
}
