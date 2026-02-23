import { api } from "@/api/axios"

export async function getStudentDashboard(params = {}) {
  const { data } = await api.get("/api/dashboard/student/", { params })
  return data
}

export async function getParentOverview(params = {}) {
  const { data } = await api.get("/api/dashboard/parent/overview/", { params })
  return data
}

export async function getParentStudentDashboard(studentId, params = {}) {
  const { data } = await api.get(`/api/dashboard/parent/students/${studentId}/`, { params })
  return data
}