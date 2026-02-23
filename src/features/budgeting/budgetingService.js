import { api } from "@/api/axios"

// STUDENT
export async function listMyPlans() {
  const { data } = await api.get("/api/budgeting/plans/me/")
  return data
}

export async function createPlan(payload) {
  const { data } = await api.post("/api/budgeting/plans/", payload)
  return data
}

export async function getPlan(planId) {
  const { data } = await api.get(`/api/budgeting/plans/${planId}/`)
  return data
}

export async function updatePlan(planId, payload) {
  const { data } = await api.patch(`/api/budgeting/plans/${planId}/`, payload)
  return data
}

export async function activatePlan(planId) {
  const { data } = await api.post(`/api/budgeting/plans/${planId}/activate/`)
  return data // { active_plan_id }
}

export async function getMyActivePlan() {
  const { data } = await api.get("/api/budgeting/plans/active/")
  return data
}

// Bills
export async function createBill(planId, payload) {
  const { data } = await api.post(`/api/budgeting/plans/${planId}/bills/`, payload)
  return data
}

export async function updateBill(billId, payload) {
  const { data } = await api.patch(`/api/budgeting/bills/${billId}/`, payload)
  return data
}

export async function deleteBill(billId) {
  await api.delete(`/api/budgeting/bills/${billId}/`)
}

// PARENT (keep)
export async function getStudentActivePlan(studentId) {
  const { data } = await api.get(`/api/budgeting/students/${studentId}/plans/active/`)
  return data
}