import { api } from "@/api/axios"

export async function getCategories() {
  const { data } = await api.get("/api/expenses/categories/")
  return data
}

export async function createCategory(payload) {
  const { data } = await api.post("/api/expenses/categories/create/", payload)
  return data
}

export async function getMyExpenses(params = {}) {
  const { data } = await api.get("/api/expenses/me/", { params })
  return data
}

export async function getMyExpenseSummary(params = {}) {
  const { data } = await api.get("/api/expenses/me/summary/", { params })
  return data
}

export async function createExpense(payload) {
  const fd = new FormData()
  Object.entries(payload).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return
    fd.append(k, v)
  })

  const { data } = await api.post("/api/expenses/me/create/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}