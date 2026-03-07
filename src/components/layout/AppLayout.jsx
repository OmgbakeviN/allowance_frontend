import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "@/auth/useAuth"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import ThemeToggle from "@/components/layout/ThemeToggle"
import {
  ChevronRight,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  PiggyBank,
  Receipt,
  Shield,
  Tags,
  User,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react"

function navLinkClass(isActive) {
  return [
    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
    isActive
      ? "bg-gradient-to-r from-[#34E3CC]/15 via-[#4F9DFF]/15 to-[#7C5ADE]/15 text-foreground border border-border shadow-sm"
      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
  ].join(" ")
}

function iconWrapClass(isActive) {
  return [
    "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
    isActive
      ? "bg-gradient-to-br from-[#34E3CC] via-[#4F9DFF] to-[#7C5ADE] text-white"
      : "bg-muted text-muted-foreground group-hover:text-foreground",
  ].join(" ")
}

const studentItems = [
  { to: "/app/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/student/budget-plans", label: "Budget plans", icon: PiggyBank },
  { to: "/app/student/wallet", label: "Wallet", icon: Wallet },
  { to: "/app/student/expenses", label: "Expenses", icon: Receipt },
  { to: "/app/student/categories", label: "Categories", icon: Tags },
  { to: "/app/student/link-parent", label: "Link parent", icon: Link2 },
  { to: "/app/student/parent", label: "My parent", icon: Users },
]

const parentItems = [
  { to: "/app/parent/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/parent/students", label: "My students", icon: Users },
  { to: "/app/parent/invites", label: "Invites", icon: UserPlus },
]

function NavItems({ items }) {
  return (
    <div className="space-y-1">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => navLinkClass(isActive)}>
          {({ isActive }) => (
            <>
              <span className={iconWrapClass(isActive)}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 truncate">{label}</span>
              <ChevronRight
                className={[
                  "h-4 w-4 transition-all duration-200",
                  isActive ? "text-foreground opacity-100" : "opacity-0 group-hover:opacity-100",
                ].join(" ")}
              />
            </>
          )}
        </NavLink>
      ))}
    </div>
  )
}

function SidebarContent({ role, onNavigate }) {
  return (
    <div className="h-full p-4">
      <div className="rounded-2xl border bg-gradient-to-r from-[#34E3CC]/15 via-[#4F9DFF]/10 to-[#7C5ADE]/15 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#34E3CC] via-[#4F9DFF] to-[#7C5ADE] text-white shadow-md">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold tracking-tight">Budggio</div>
            <div className="text-xs text-muted-foreground">Smart budget management</div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 px-1">
        <Shield className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Menu
        </span>
      </div>

      <Separator className="my-4" />

      <div onClick={onNavigate}>
        {role === "STUDENT" ? <NavItems items={studentItems} /> : null}
        {role === "PARENT" ? <NavItems items={parentItems} /> : null}
      </div>
    </div>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const initials = (user?.username || "U").slice(0, 2).toUpperCase()

  const go = (path) => {
    navigate(path)
    setOpen(false)
  }

  return (
    <div className="min-h-svh bg-background text-foreground md:flex">
      <aside className="hidden w-72 border-r bg-muted/20 md:block">
        <SidebarContent role={user?.role} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b bg-background/95 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="md:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SidebarContent
                    role={user?.role}
                    onNavigate={(e) => {
                      const link = e.target.closest("a")
                      if (link?.getAttribute("href")) {
                        e.preventDefault()
                        go(link.getAttribute("href"))
                      }
                    }}
                  />
                </SheetContent>
              </Sheet>
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold sm:text-base">
                Hi, {user?.username}
              </div>
              <div className="mt-1 inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {user?.role}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 rounded-full px-1.5 hover:bg-muted"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-border">
                    {user?.avatar ? <AvatarImage src={user.avatar} alt="avatar" /> : null}
                    <AvatarFallback className="bg-gradient-to-br from-[#34E3CC] via-[#4F9DFF] to-[#7C5ADE] text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem
                  onClick={() => navigate("/app/profile")}
                  className="cursor-pointer gap-2"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    logout()
                    navigate("/login", { replace: true })
                  }}
                  className="cursor-pointer gap-2 text-red-500 focus:text-red-500"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}