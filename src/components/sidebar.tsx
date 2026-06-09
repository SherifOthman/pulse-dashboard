import { useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/auth-store"
import { useMe } from "@/features/auth/use-me"
import { Button, Separator, Tooltip } from "@heroui/react"
import { LayoutDashboard, Stethoscope, Pill, FlaskConical, Scan, Building2, GraduationCap, LogOut, Menu, HeartPulse, Shield } from "lucide-react"

type NavItem = {
  path: string
  label: string
  icon: typeof LayoutDashboard
}

const navItems: NavItem[] = [
  { path: "/", label: "الرئيسية", icon: LayoutDashboard },
  { path: "/doctors", label: "الأطباء", icon: Stethoscope },
  { path: "/pharmacies", label: "الصيدليات", icon: Pill },
  { path: "/labs", label: "المختبرات", icon: FlaskConical },
  { path: "/radiology", label: "الأشعة", icon: Scan },
  { path: "/cities", label: "المدن", icon: Building2 },
  { path: "/specializations", label: "التخصصات", icon: GraduationCap },
  { path: "/users", label: "المستخدمين", icon: Shield },
]

type SidebarProps = {
  collapsed: boolean
  onToggleCollapse: () => void
  onLinkClick: () => void
}

function navLinkClass(isActive: boolean, collapsed: boolean): string {
  const base = "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors"
  const layout = collapsed ? "justify-center" : ""
  const state = isActive
    ? "bg-surface-tertiary text-foreground font-semibold"
    : "text-muted hover:bg-surface-secondary hover:text-foreground"
  return [base, layout, state].filter(Boolean).join(" ")
}

export function Sidebar({ collapsed, onToggleCollapse, onLinkClick }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const clearSession = useAuthStore((s) => s.clearSession)
  const { data: me } = useMe()
  const role = me?.role ?? null
  const filteredItems = navItems.filter((item) => item.path !== '/users' || role === 'Admin')

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    clearSession()
    navigate("/login")
  }

  return (
    <div className="flex h-full flex-col">
      {/* Brand header */}
      <div
        className={`flex min-h-16 items-center px-4 ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HeartPulse className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-bold text-foreground">نبض</h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          onPress={onToggleCollapse}
          className="hidden lg:flex"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-auto px-2 py-2">
        <ul className="flex flex-col gap-1">
          {filteredItems.map((item) => {
            const Icon = item.icon

            const link = (
              <button
                onClick={() => {
                  navigate(item.path)
                  onLinkClick()
                }}
                className={navLinkClass(isActive(item.path), collapsed)}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            )

            return (
              <li key={item.path} className="w-full">
                {collapsed ? (
                  <Tooltip delay={300}>
                    <Tooltip.Trigger className="w-full">{link}</Tooltip.Trigger>
                    <Tooltip.Content placement="right">
                      <p>{item.label}</p>
                    </Tooltip.Content>
                  </Tooltip>
                ) : (
                  link
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-2 py-2">
        <Tooltip delay={300} isDisabled={!collapsed}>
          <Tooltip.Trigger className="w-full">
            <button
              onClick={handleLogout}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10 ${collapsed ? "justify-center" : ""}`}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>تسجيل الخروج</span>}
            </button>
          </Tooltip.Trigger>
          {collapsed && <Tooltip.Content placement="right"><p>تسجيل الخروج</p></Tooltip.Content>}
        </Tooltip>
      </div>
    </div>
  )
}
