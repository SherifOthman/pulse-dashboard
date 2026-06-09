import { Sidebar } from "@/components/sidebar";
import { useMe } from "@/features/auth/use-me";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button, Chip, Drawer, useTheme } from "@heroui/react";
import { HeartPulse, Menu, Moon, Sun, User } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";

// ── Constants ─────────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 64;
const MOBILE_BREAKPOINT = "(max-width: 1023px)";

// ── Sub-components ────────────────────────────────────────────────────────────

function MobileBrand() {
  return (
    <div className="flex items-center gap-2">
      <HeartPulse className="h-5 w-5 text-primary" />
      <span className="text-lg font-bold text-foreground">نبض</span>
    </div>
  );
}

function UserBadge({ fullName, role }: { fullName: string; role: string }) {
  const isAdmin = role === "Admin";
  return (
    <div className="hidden items-center gap-2 text-sm md:flex">
      <div className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-full">
        <User className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex flex-col items-start">
        <span className="font-medium text-foreground leading-tight">
          {fullName}
        </span>
        <Chip
          size="sm"
          variant="soft"
          color={isAdmin ? "warning" : "default"}
          className="h-5 px-1.5 text-[10px]"
        >
          {isAdmin ? "مدير النظام" : "مشرف"}
        </Chip>
      </div>
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useLocalStorage("sidebarCollapsed", false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: me } = useMe();
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const { resolvedTheme, setTheme } = useTheme("system");
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Desktop sidebar ── */}
      {!isMobile && (
        <div
          className="border-divider bg-surface shrink-0 overflow-auto border-e transition-all duration-300"
          style={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
        >
          <Sidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            onLinkClick={() => {}}
          />
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-surface border-divider min-h-16 border-b shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            {/* Left: hamburger + brand on mobile */}
            <div className="flex items-center gap-3">
              {isMobile && (
                <>
                  <Button
                    isIconOnly
                    variant="ghost"
                    onPress={() => setMobileMenuOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  <MobileBrand />
                </>
              )}
            </div>

            {/* Right: theme toggle + user info */}
            <div className="flex items-center gap-2">
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                onPress={() => setTheme(isDark ? "light" : "dark")}
                aria-label="تبديل المظهر"
              >
                {isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              {me && <UserBadge fullName={me.fullName} role={me.role} />}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-auto p-4 pb-10 lg:p-8 lg:pb-14"
          dir="rtl"
        >
          <Outlet />
        </main>
      </div>

      {/* ── Mobile sidebar drawer ── */}
      {isMobile && (
        <Drawer.Backdrop
          isOpen={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
        >
          <Drawer.Content placement="right">
            <Drawer.Dialog>
              <Drawer.CloseTrigger />
              <Drawer.Body className="p-0">
                <Sidebar
                  collapsed={false}
                  onToggleCollapse={() => {}}
                  onLinkClick={() => setMobileMenuOpen(false)}
                />
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      )}
    </div>
  );
}
