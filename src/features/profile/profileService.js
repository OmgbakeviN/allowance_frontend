import { api } from "@/api/axios"

export async function updateProfile(payload) {
  const fd = new FormData()
  Object.entries(payload).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return
    fd.append(k, v)
  })
  const { data } = await api.patch("/api/auth/profile/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function getParentAccount() {
  const { data } = await api.get("/api/parent-account/me/")
  return data
}

export async function getParentAccountTxns() {
  const { data } = await api.get("/api/parent-account/me/transactions/")
  return data
}

export async function parentTopUp(payload) {
  const { data } = await api.post("/api/parent-account/topup/", payload)
  return data
}