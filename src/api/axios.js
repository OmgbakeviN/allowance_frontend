import axios from "axios"
import { ENDPOINTS } from "@/api/endpoints"
import { tokenStorage } from "@/auth/tokenStorage"

const baseURL = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({ baseURL })
const raw = axios.create({ baseURL })

let unauthorizedHandler = null
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn
}

let isRefreshing = false
let pending = []

function flushPending(accessToken) {
  pending.forEach((cb) => cb(accessToken))
  pending = []
}

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config
    const status = error?.response?.status

    if (!original || status !== 401) return Promise.reject(error)
    if (original._retry) return Promise.reject(error)
    if ((original.url || "").includes(ENDPOINTS.refresh)) {
      tokenStorage.clear()
      if (unauthorizedHandler) unauthorizedHandler()
      return Promise.reject(error)
    }

    const refreshToken = tokenStorage.getRefresh()
    if (!refreshToken) {
      tokenStorage.clear()
      if (unauthorizedHandler) unauthorizedHandler()
      return Promise.reject(error)
    }

    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pending.push((accessToken) => {
          if (!accessToken) return reject(error)
          original.headers.Authorization = `Bearer ${accessToken}`
          resolve(api(original))
        })
      })
    }

    isRefreshing = true
    try {
      const { data } = await raw.post(ENDPOINTS.refresh, { refresh: refreshToken })
      tokenStorage.set({ access: data.access })
      flushPending(data.access)
      original.headers.Authorization = `Bearer ${data.access}`
      return api(original)
    } catch (e) {
      flushPending(null)
      tokenStorage.clear()
      if (unauthorizedHandler) unauthorizedHandler()
      return Promise.reject(e)
    } finally {
      isRefreshing = false
    }
  }
)