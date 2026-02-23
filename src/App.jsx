import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "@/pages/LoginPage"
import ProtectedRoute from "@/auth/ProtectedRoute"
import RoleRoute from "@/auth/RoleRoute"
import AppLayout from "@/components/layout/AppLayout"
import ParentOverviewPage from "@/features/dashboard/ParentOverviewPage"
import ParentStudentPage from "@/features/dashboard/ParentStudentPage"
import StudentDashboardPage from "@/features/dashboard/StudentDashboardPage"
import StudentsPage from "@/features/relationships/StudentsPage"
import InvitesPage from "@/features/relationships/InvitesPage"
import AcceptInvitePage from "@/features/relationships/AcceptInvitePage"
import MyParentPage from "@/features/relationships/MyParentPage"

function RoleRedirect() {
  return <div className="p-6">Choisis un menu.</div>
}

function Page({ title }) {
  return <div className="text-lg font-semibold">{title}</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Page title="Register (next)" />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<RoleRedirect />} />
            <Route path="profile" element={<Page title="Profile (next)" />} />

            <Route element={<RoleRoute allow={["STUDENT", "ADMIN"]} />}>
              <Route path="student/dashboard" element={<StudentDashboardPage />} />
              <Route path="student/budget-plans" element={<Page title="Budget Plans (next)" />} />
              <Route path="student/wallet" element={<Page title="Wallet (next)" />} />
              <Route path="student/expenses" element={<Page title="Expenses (next)" />} />
              <Route path="student/categories" element={<Page title="Categories (next)" />} />
              <Route path="student/link-parent" element={<AcceptInvitePage />} />
              <Route path="student/parent" element={<MyParentPage />} />
            </Route>

            <Route element={<RoleRoute allow={["PARENT", "ADMIN"]} />}>
              <Route path="parent/dashboard" element={<ParentOverviewPage />} />
              <Route path="parent/students/:id" element={<ParentStudentPage />} />
              <Route path="parent/students" element={<StudentsPage />} />
              <Route path="parent/invites" element={<InvitesPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}