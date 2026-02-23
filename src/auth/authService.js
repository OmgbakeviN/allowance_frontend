import { api } from "@/api/axios"
import { ENDPOINTS } from "@/api/endpoints"
import { tokenStorage } from "@/auth/tokenStorage"

export async function loginRequest({ username, password }) {
  const { data } = await api.post(ENDPOINTS.login, { username, password })
  tokenStorage.set({ access: data.access, refresh: data.refresh })
  return data
}

export async function fetchMe() {
  const { data } = await api.get(ENDPOINTS.me)
  return data
}