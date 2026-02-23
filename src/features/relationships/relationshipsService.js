import { api } from "@/api/axios"

export async function getMyStudents() {
  const { data } = await api.get("/api/relationships/links/parent/students/")
  return data
}

export async function revokeStudent(studentId) {
  await api.delete(`/api/relationships/links/parent/revoke/${studentId}/`)
}

export async function getMyInvites() {
  const { data } = await api.get("/api/relationships/invites/me/")
  return data
}

export async function createInvite(student_email = "") {
  const payload = {}
  if (student_email?.trim()) payload.student_email = student_email.trim()
  const { data } = await api.post("/api/relationships/invites/", payload)
  return data // { code, status, expires_at, student_email, created_at }
}

export async function acceptInvite(code) {
  const { data } = await api.post("/api/relationships/invites/accept/", {
    code: (code || "").trim().toUpperCase(),
  })
  return data
}

export async function getMyParent() {
  const { data } = await api.get("/api/relationships/links/student/parent/")
  return data
}