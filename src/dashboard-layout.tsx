import { useState, useCallback, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/sidebar"
import { Button, Drawer, Tooltip, Chip } from "@heroui/react"
import { Menu, HeartPulse, User, Lock } from "lucide-react"
import { ChangePasswordModal } from "@/components/change-password-modal"
import { useMe } from "@/features/auth/use-me"

const SIDEBAR_WIDTH = 256
const SIDEBAR_COLLAPSED_WIDTH = 64

function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  const set = useCallback((v: T) => {
    setValue(v)
    localStorage.setItem(key, JSON.stringify(v))
  }, [key])
  return [value, set]
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [query])
  return matches
}

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage("sidebarCollapsed", false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const { data: me } = useMe()
  const isMobile = useMediaQuery("(max-width: 1023px)")
  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div
          className="border-divider bg-surface shrink-0 overflow-auto border-e transition-all duration-300"
          style={{ width: sidebarWidth }}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onLinkClick={() => {}}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-surface border-divider min-h-16 border-b shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Button isIconOnly variant="ghost" onPress={() => setMobileMenuOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              {isMobile && (
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-primary" />
                  <span className="text-lg font-bold text-foreground">نبض</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {me && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="bg-primary/10 hidden h-7 w-7 items-center justify-center rounded-full md:flex">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="hidden flex-col items-end md:flex">
                    <span className="font-medium text-foreground leading-tight">{me.fullName}</span>
                    <Chip size="sm" variant="flat" color={me.role === 'Admin' ? 'warning' : 'default'} className="h-5 text-[10px] px-1.5">
                      {me.role === 'Admin' ? 'مدير النظام' : 'مشرف'}
                    </Chip>
                  </div>
                </div>
              )}
              <Tooltip delay={300}>
                <Tooltip.Trigger>
                  <Button isIconOnly variant="ghost" onPress={() => setPasswordModalOpen(true)}>
                    <Lock className="h-4 w-4" />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content placement="bottom">
                  <p>تغيير كلمة المرور</p>
                </Tooltip.Content>
              </Tooltip>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 pb-10 lg:p-8 lg:pb-14" dir="rtl">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar */}
      {isMobile && (
        <Drawer.Backdrop
          isOpen={mobileMenuOpen}
          onOpenChange={(open) => setMobileMenuOpen(open)}
        >
          <Drawer.Content placement="right">
            <Drawer.Dialog>
              <Drawer.CloseTrigger />
              <Drawer.Body className="p-0">
                <Sidebar
                  collapsed={false}
                  onLinkClick={() => setMobileMenuOpen(false)}
                  onToggleCollapse={() => {}}
                />
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      )}
      <ChangePasswordModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </div>
  )
}
