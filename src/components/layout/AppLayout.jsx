import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "@/auth/useAuth"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

function linkClass({ isActive }) {
  return [
    "block rounded-md px-3 py-2 text-sm",
    isActive ? "bg-muted font-medium" : "hover:bg-muted/60",
  ].join(" ")
}

function StudentNav() {
  return (
    <div className="space-y-1">
      <NavLink to="/app/student/dashboard" className={linkClass}>Dashboard</NavLink>
      <NavLink to="/app/student/budget-plans" className={linkClass}>Budget plans</NavLink>
      <NavLink to="/app/student/wallet" className={linkClass}>Wallet</NavLink>
      <NavLink to="/app/student/expenses" className={linkClass}>Expenses</NavLink>
      <NavLink to="/app/student/categories" className={linkClass}>Categories</NavLink>
      <NavLink to="/app/student/link-parent" className={linkClass}>Link parent</NavLink>
      <NavLink to="/app/student/parent" className={linkClass}>My parent</NavLink>
    </div>
  )
}

function ParentNav() {
  return (
    <div className="space-y-1">
      <NavLink to="/app/parent/dashboard" className={linkClass}>Dashboard</NavLink>
      <NavLink to="/app/parent/students" className={linkClass}>My students</NavLink>
      <NavLink to="/app/parent/invites" className={linkClass}>Invites</NavLink>
    </div>
  )
}

function SidebarContent({ role, onNavigate }) {
  return (
    <div className="p-4">
      <div className="text-lg font-semibold">Allowance</div>
      <div className="text-xs text-muted-foreground">Menu</div>
      <Separator className="my-4" />
      <div onClick={onNavigate}>
        {role === "STUDENT" ? <StudentNav /> : null}
        {role === "PARENT" ? <ParentNav /> : null}
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
    <div className="min-h-svh flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:block w-64 border-r">
        <SidebarContent role={user?.role} />
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="border-b px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">☰</Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
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

            <div className="truncate">
              <div className="text-sm font-medium truncate">Welcome, {user?.username}</div>
              <div className="text-xs text-muted-foreground truncate">Role: {user?.role}</div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/app/profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  logout()
                  navigate("/login", { replace: true })
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}