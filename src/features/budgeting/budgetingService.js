import { api } from "@/api/axios"

export async function getStudentActivePlan(studentId) {
  const { data } = await api.get(`/api/budgeting/students/${studentId}/plans/active/`)
  return data
}